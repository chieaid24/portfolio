import badges from '../_data/clanBadges.json'; // server-only import

export const revalidate = 86400;     // cache the route for 1 day (run it every day)
export const dynamic = 'force-static';       

const WEEK = 604800;
const DAY = 86400;
const BASE = 'https://proxy.royaleapi.dev/v1';

const BADGE_MAP = Object.fromEntries(
  badges.map(b => [b.id, b.name]) // {16000139: 'clan_badge_29_04', ...}
);

function clanBadgeSrc(badgeId) {
  const name = BADGE_MAP[badgeId];
  return name ? `/royale/badges/${name}.png` : null;
}

const TOKEN = process.env.CLASH_ROYALE_TOKEN;   // Supercell API token 
const TAG = process.env.CLASH_ROYALE_TAG || '#9UJLLC08R';

function requireEnv(v, name) {
    if (!v) throw new Error(`Missing env var: ${name}`);
    return v;
}

function encodeTag(tag) {
    // API expects %23 + UPPERCASE TAG without '#'
    return `%23${String(tag).replace(/^#/, '').toUpperCase()}`;
}

function computeResult(battle) {
    const you = battle.team?.[0];
    const opp = battle.opponent?.[0];
    const yc = you?.crowns ?? 0;
    const oc = opp?.crowns ?? 0;

    if (yc > oc) return 'win';
    if (yc < oc) return 'loss';

    const delta = you?.trophyChange;
    if (typeof delta === 'number') {
        if (delta > 0) return 'win';
        if (delta < 0) return 'loss';
    }
    return 'draw';
}

// The Supercell /players endpoint omits the equipped Champion from
// `currentDeck` (a champion deck returns 7 cards, not 8). The battle log *does*
// include it, so recover it: find a recent battle whose deck is exactly the
// current deck plus one champion, and return that champion.
function findEquippedChampion(currentDeck, battleLog) {
    const deckIds = new Set((currentDeck ?? []).map(c => c.id));
    if (!deckIds.size) return null;
    for (const battle of Array.isArray(battleLog) ? battleLog : []) {
        const teamDeck = battle.team?.[0]?.cards ?? [];
        const champ = teamDeck.find(c => c.rarity === 'champion');
        // Only trust this battle if its deck is exactly currentDeck + champion.
        if (champ && teamDeck.filter(c => deckIds.has(c.id)).length === deckIds.size) {
            return champ;
        }
    }
    return null;
}

// Marker the client renders as the generic unknown-card placeholder (a null
// name falls through to UNKNOWN_CARD_SRC) when the equipped champion can't be
// recovered (e.g. no recent battle on this deck yet).
const CHAMPION_PLACEHOLDER = {
    id: '__champion_placeholder__',
    name: null,
};

async function j(url) {
    // Data cache returns cached JSON immediately, revalidates in background.
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${requireEnv(TOKEN, 'CLASH_ROYALE_TOKEN')}` },
        next: { revalidate: DAY },
    });
    if (!res.ok) throw new Error(`Upstream error ${res.status}: ${url}`);
    return res.json();
}

export async function GET() {
    try {
        const encoded = encodeTag(requireEnv(TAG, 'CLASH_ROYALE_TAG'));
        const [player, battleLog] = await Promise.all([
            j(`${BASE}/players/${encoded}`),
            j(`${BASE}/players/${encoded}/battlelog`),
        ]);

        const results = (Array.isArray(battleLog) ? battleLog : []).map(computeResult);

        // Re-attach the equipped champion the API drops from currentDeck.
        const currentDeck = Array.isArray(player.currentDeck) ? [...player.currentDeck] : [];
        if (currentDeck.length > 0 && currentDeck.length < 8) {
            currentDeck.push(findEquippedChampion(currentDeck, battleLog) ?? CHAMPION_PLACEHOLDER);
        }

        // Return trimmed data
        const data = {
            player: {
                name: player.name,
                trophies: player.trophies,
                wins: player.wins,
                battleCount: player.battleCount,
                clanName: player.clan?.name ?? null,
                clanBadgeId: player.clan?.badgeId ?? null,
                clanBadgeSrc: clanBadgeSrc(player.clan?.badgeId) ?? null,
                role: player.role,
                currentDeck,
            },
            // shape is ['win', 'loss', 'win', 'draw'...]
            battleResults: results,
            cachedAt: new Date().toISOString(),
        };

        return Response.json(data, {
            headers: {
                // Edge cache hint 
                'Cache-Control': 's-maxage=604800, stale-while-revalidate=604800',
            },
        });
    } catch (err) {
        // If the background refresh fails, Next keeps the previous good cache.
        // This error only shows on the first-ever request or if no cache exists yet.
        return Response.json({ error: err.message || 'Royale API failed' }, { status: 502 });
    }
}
