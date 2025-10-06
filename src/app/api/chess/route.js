
// Cache the whole route for 1 week
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

  return Response.json(
    { profile, stats },
    {
      headers: {
        'Cache-Control': 's-maxage=604800, stale-while-revalidate=604800',
      },
    }
  );
}
