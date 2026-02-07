export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REFRESH_TOKEN, // obtained once via Authorization Code flow
  SPOTIFY_PLAYLIST_ID, // playlist to update
} = process.env;

function requireEnv(v, name) {
  if (!v) {
    console.error(
      `[requireEnv] Missing required environment variable: ${name}`,
    );
    throw new Error(`Missing env var: ${name}`);
  }
  console.debug(`[requireEnv] Successfully loaded env var: ${name}`);
  return v;
}

// "2025-09-13T16:20:00.000Z" -> "9/13/25"
function formatMDYY(isoString, timeZone = "America/Los_Angeles") {
  if (!isoString) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  }).format(new Date(isoString));
}

async function getAccessToken() {
  console.log("[getAccessToken] Starting Spotify token refresh");
  const id = requireEnv(SPOTIFY_CLIENT_ID, "SPOTIFY_CLIENT_ID");
  const secret = requireEnv(SPOTIFY_CLIENT_SECRET, "SPOTIFY_CLIENT_SECRET");
  const refresh = requireEnv(SPOTIFY_REFRESH_TOKEN, "SPOTIFY_REFRESH_TOKEN");

  const basic = Buffer.from(`${id}:${secret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refresh,
  });

  console.log("[getAccessToken] Sending token refresh request to Spotify");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(
      `[getAccessToken] Token refresh failed with status ${res.status}:`,
      text,
    );
    throw new Error(`Token refresh failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  if (!json.access_token) {
    console.error("[getAccessToken] No access_token in Spotify token response");
    throw new Error("No access_token in token response");
  }
  console.log("[getAccessToken] Successfully obtained Spotify access token");
  return json.access_token;
}

async function sp(url, accessToken, init = {}) {
  const method = init.method || "GET";
  console.log(`[sp] Making ${method} request to: ${url}`);
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error(`[sp] ${method} ${url} failed with status ${res.status}:`, t);
    throw new Error(`${method} ${url} failed: ${res.status} ${t}`);
  }

  console.log(
    `[sp] ${method} request to ${url} succeeded (status ${res.status})`,
  );
  // 204 No Content on some endpoints
  return res.status === 204 ? null : res.json();
}

// Get top tracks for last ~4 weeks (Spotify's "short_term"), limit 5
async function getTopTracks5(accessToken) {
  console.log(
    "[getTopTracks5] Fetching top 5 tracks for short_term (last 4 weeks)",
  );
  const data = await sp(
    "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=5",
    accessToken,
  );
  const tracks = (data.items || []).map((t) => ({ id: t.id, uri: t.uri }));
  console.log(`[getTopTracks5] Retrieved ${tracks.length} top tracks`);
  if (tracks.length > 0) {
    console.debug(
      "[getTopTracks5] Track URIs:",
      tracks.map((t) => t.uri),
    );
  }
  return tracks;
}

// Replace entire playlist with the given URIs
async function replaceTracks(accessToken, playlistId, uris) {
  console.log(
    `[replaceTracks] Replacing playlist ${playlistId} with ${uris.length} tracks`,
  );
  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris }),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error(
      `[replaceTracks] Failed to replace tracks with status ${res.status}:`,
      t,
    );
    throw new Error(`PUT replace failed: ${res.status} ${t}`);
  }

  // Some Spotify endpoints return a snapshot_id, others may return empty.
  let snapshot_id = null;
  try {
    const json = await res.json();
    snapshot_id = json?.snapshot_id ?? null;
  } catch (_) {
    console.warn(
      "[replaceTracks] Could not parse response body for snapshot_id",
    );
    // empty body is fine
  }
  console.log(
    `[replaceTracks] Successfully replaced tracks. Snapshot ID: ${snapshot_id}`,
  );
  return { snapshot_id, replaced: uris.length };
}

async function renamePlaylist(accessToken, playlistId, at, base = "My Top 5") {
  // calculate the date in m/d/yy format
  const date = formatMDYY(at);
  const name = `${base} - ${date}`;
  console.log(`[renamePlaylist] Renaming playlist ${playlistId} to "${name}"`);
  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, public: true }),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error(
      `[renamePlaylist] Failed to rename playlist with status ${res.status}:`,
      t,
    );
    throw new Error(`PUT replace failed: ${res.status} ${t}`);
  }
  console.log(`[renamePlaylist] Successfully renamed playlist to "${name}"`);
  return { name };
}

export async function GET(req) {
  console.log("[GET] Spotify monthly playlist update endpoint called");
  try {
    console.log("[GET] Validating authorization header");
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn(
        "[GET] Authorization failed - invalid or missing CRON_SECRET",
      );
      return new Response("Unauthorized", {
        status: 401,
      });
    }
    console.log("[GET] Authorization successful");

    const playlistId = requireEnv(SPOTIFY_PLAYLIST_ID, "SPOTIFY_PLAYLIST_ID");
    console.log(`[GET] Target playlist ID: ${playlistId}`);

    const accessToken = await getAccessToken();

    const { searchParams } = new URL(req.url);
    const dryRun = searchParams.get("dry_run") === "1";
    console.log(
      `[GET] Execution mode: ${dryRun ? "DRY RUN (preview only)" : "WRITE (will update playlist)"}`,
    );

    // 1) Get top-5 tracks
    console.log("[GET] Step 1: Fetching top 5 tracks");
    const top = await getTopTracks5(accessToken); // [{id, uri}, ...]
    const topUris = top.map((t) => t.uri);

    const result = {
      mode: "replace",
      dry_run: dryRun,
      topCount: top.length,
      replaced: dryRun ? topUris.length : 0,
      snapshot_id: null,
      at: new Date().toISOString(),
      name: null,
    };

    // 2) Replace playlist (unless dry run)
    if (!dryRun) {
      console.log("[GET] Step 2: Replacing playlist tracks (not dry run)");
      const r = await replaceTracks(accessToken, playlistId, topUris);
      result.replaced = r.replaced;
      result.snapshot_id = r.snapshot_id;

      console.log("[GET] Step 3: Renaming playlist with current date");
      const n = await renamePlaylist(accessToken, playlistId, result.at);
      result.name = n.name;
      console.log("[GET] Successfully completed playlist update");
    } else {
      console.log("[GET] Dry run mode - skipping playlist write operations");
    }

    console.log("[GET] Sending successful response", result);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[GET] Fatal error occurred:", e);
    return Response.json(
      { error: String(e) },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

/*
Notes:

- Required scopes for the refresh token:
  user-top-read
  playlist-modify-private (and playlist-modify-public if the playlist is public)

- Schedule with Vercel Cron (vercel.json):
  {
    "crons": [
      { "path": "/api/spotify/monthly", "schedule": "0 9 1 * *" }
    ]
  }

- Local testing:
  GET /api/spotify/monthly?dry_run=1  // preview (no write)
  GET /api/spotify/monthly            // actually replace
*/
