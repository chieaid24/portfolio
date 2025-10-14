export const dynamic = 'force-dynamic';

function requireEnv(v, name) {
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function GET() {
  const params = new URLSearchParams({
    client_id: requireEnv(process.env.SPOTIFY_CLIENT_ID, 'SPOTIFY_CLIENT_ID'),
    response_type: 'code',
    redirect_uri: requireEnv(process.env.SPOTIFY_REDIRECT_URI, 'SPOTIFY_REDIRECT_URI'),
    scope: [
      'user-top-read',
      'playlist-modify-private',
      'playlist-modify-public',
    ].join(' '),
  });

  return Response.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );
}
