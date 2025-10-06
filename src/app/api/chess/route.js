// app/api/chess/route.js

// Cache the whole route for 1 week (ISR) — first hit warms it, others are CDN hits.
export const revalidate = 86400; // refresh every day
export const dynamic = 'force-static';

const MY_USERNAME = 'mangus_carlston';
const WEEK = 604800;
const DAY = 86400;

// If revalidation fails, the previous cached value is kept.
async function j(url) {
  const res = await fetch(url, { next: { revalidate: DAY } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return res.json();
}

export async function GET() {
  const u = MY_USERNAME.toLowerCase();

  const [profile, stats] = await Promise.all([
    j(`https://api.chess.com/pub/player/${u}`),
    j(`https://api.chess.com/pub/player/${u}/stats`),
  ]);

  // The *route* response is also cached for a week via `export const revalidate` above.
  // If Chess.com errors during a future refresh:
  //   - The per-fetch Data Cache returns the last good JSON
  //   - The route returns successfully with the old values
  return Response.json(
    { profile, stats },
    {
      headers: {
        'Cache-Control': 's-maxage=604800, stale-while-revalidate=604800',
      },
    }
  );
}
