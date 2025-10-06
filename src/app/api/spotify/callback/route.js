export const runtime = 'nodejs';        
export const dynamic = 'force-dynamic';

function requireEnv(v, name) {
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const err = searchParams.get('error');

  if (err) {
    return new Response(`Auth error: ${err}`, { status: 400 });
  }
  if (!code) {
    return new Response('Missing ?code in callback URL', { status: 400 });
  }

  const clientId = requireEnv(process.env.SPOTIFY_CLIENT_ID, 'SPOTIFY_CLIENT_ID');
  const clientSecret = requireEnv(process.env.SPOTIFY_CLIENT_SECRET, 'SPOTIFY_CLIENT_SECRET');
  const redirectUri = requireEnv(process.env.SPOTIFY_REDIRECT_URI, 'SPOTIFY_REDIRECT_URI');

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    return new Response(
      `Token exchange failed: ${res.status}\n${JSON.stringify(json, null, 2)}`,
      { status: 500 }
    );
  }

  const access = json.access_token;
  const refresh = json.refresh_token; // may be absent if already consented before

  const isDev = process.env.NODE_ENV !== 'production';

  // Render the refresh token in dev so can copy it once.
  if (isDev) {
    return new Response(
      `
        <pre style="font: 14px/1.4 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas">
Refresh token (copy into .env.local as SPOTIFY_REFRESH_TOKEN):

${refresh ?? '(null — see notes below)'}
        
Notes:
- If refresh_token is null, re-run login with show_dialog=true and ensure redirect URI EXACTLY matches:
  SPOTIFY_REDIRECT_URI=${redirectUri}
- If it still returns null, go to https://www.spotify.com/account/apps/ -> remove your app, then reauthorize.
      </pre>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  return new Response('Auth complete. You can close this window.');
}
