'use client'
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'

const round1 = (n) => Math.round(n * 10) / 10;
const pct1 = (num, den) => (den ? round1((num / den) * 100) : null);

// Format: "Hog Rider" -> "hog-rider"
function formatCardAssetName(name) {
  return String(name).trim().toLowerCase().replace(/\s+/g, '-');
}

const getCardIcon = (card, index) => {
  const name = card?.name ?? '';
  const base = formatCardAssetName(name);
  if (!base) return null;

  const evoEligible =
    index < 2 && Number(card?.evolutionLevel ?? 0) >= 1;

  // If your evolved images live in a subfolder:
  const evolvedPath = `/royale/cards/${base}-ev1.png`;
  const normalPath = `/royale/cards/${base}.png`;

  // If instead they’re in the same folder with a suffix,
  // use this line instead of evolvedPath:
  // const evolvedPath = `/royale/cards/${base}-evo.png`;

  return evoEligible ? evolvedPath : normalPath;
};

export default function ClashWidget() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
      ; (async () => {
        try {
          setError(null)
          const res = await fetch('/api/royale/player')
          if (!res.ok) throw new Error(`API failed: ${res.status}`)
          const json = await res.json()
          if (!cancelled) setData(json)
        } catch (e) {
          if (!cancelled) setError(e.message || 'Failed to load')
        }
      })()
    return () => { cancelled = true }
  }, [])

  const player = data?.player
  const deck = player?.currentDeck ?? []

  const careerWinPercent = useMemo(() => {
    const wins = player?.wins ?? 0;
    const total = player?.battleCount ?? 0;
    return pct1(wins, total);        // null if total is 0/undefined
  }, [player?.wins, player?.battleCount]);

  const summary = useMemo(() => {
    const results = data?.battleResults ?? []
    let w = 0, l = 0, d = 0
    for (const r of results) {
      if (r === 'win') w++
      else if (r === 'loss') l++
      else d++
    }
    const total = results.length || 1
    return { w, l, d, winRate: pct1(w, total) }
  }, [data?.battleResults])


  return (
    <div className="rounded-xl bg-background-dark p-3 h-[352px] md:h-[352px] flex flex-col relative overflow-hidden border-1 border-light-grey-text">
      {/* Header */}
      <div className="flex justify-between items-center mt-3 mx-2">
        <a href="https://royaleapi.com/player/9UJLLC08R" target="_blank" rel="noopener noreferrer">
          <div className="font-clash font-bold text-gradient-clash-name text-outline text-[33px] sm:text-[38px] leading-tight pb-[2px] pt-[1px] tracking-tighter hover:opacity-80 duration-150">
            @{player?.name ?? '—'}
          </div>
        </a>
        <div className="flex flex-col">
          <div className="flex gap-1 items-center justify-end">
            <div className="relative w-6 h-6 sm:w-8 sm:h-8">
              <Image
                src="/about/trophy_1.png"
                alt="Clash Royale trophy"
                fill
                className="object-contain"
                sizes="(min-width: 640px) 32px, 24px" />
            </div>
            <div className="text-clash-border text-[#fede2b] text-[20px] sm:text-[25px] font-clash font-bold justify-end tracking-tight">{player?.trophies ?? '—'}</div>
          </div>
          <div className="text-[14px] sm:text-[16px] flex items-center gap-1 sm:gap-1.5 font-medium justify-end">
            {player?.clanBadgeSrc ? (
              <Image
                src={player.clanBadgeSrc}
                alt={`${player?.clanName ?? 'Clan'} badge`}
                width={23}
                height={23}
                className="mr-0.5"
              />
            ) :
              <Image
                src="/royale/badges/Bamboo_04.png"
                alt={`Clan Badge`}
                width={30}
                height={30}
              />}
            {player?.clanName ? `${player.clanName}` : 'No clan'}
            <div className="text-light-grey-text text-md font-medium">|</div>
            {player?.role ? `${player.role}` : 'member'}
          </div>
        </div>
      </div>
      <hr className="my-1 sm:my-2 border-t border-light-grey-text mx-7" />
      <div className="grid grid-cols-2 gap-3 text-[10px] sm:text-[15px] mx-2 sm:mx-5 font-semibold sm:font-medium">
        <div className="flex flex-col ">
          <div className="flex justify-between ">
            <h1>Career wins</h1>
            <div className="font-black sm:font-bold">{player?.wins ?? '0'}</div>
          </div>
          <div className="flex justify-between">
            <h1>Career win percentage</h1>
            <div className="font-black sm:font-bold">{careerWinPercent != null ? `${careerWinPercent}%` : '0%'}</div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex justify-between">
            <h1>Recent wins</h1>
            <div className="font-black sm:font-bold">{summary.w ?? '—'}</div>
          </div>
          <div className="flex justify-between">
            <h1>Recent win percentage</h1>
            <div className="font-black sm:font-bold">{summary.winRate != null ? `${summary.winRate}%` : '—'}</div>
          </div>
        </div>
      </div>

      <hr className="mt-1 sm:mt-2 border-t border-light-grey-text mx-7" />

      <div className="my-1 self-center text-light-grey-text text-sm sm:text-md">
        My current deck! ↓
      </div>

      {/* Current deck */}
      <div className="flex w-full">
        <div className="grid grid-cols-4 grid-rows-2 gap-x-0 mx-auto bg-black/10 p-1 rounded-xl self-center">
          {deck.slice(0, 8).map((card, i) => (
            <div
              key={card.id ?? i}
              className="items-center justify-center"
            >
              {getCardIcon(card, i) ? (
                <Image
                  src={getCardIcon(card, i)}
                  alt={card.name || 'Card'}
                  width={60}
                  height={60}
                  className="hover:scale-110 duration-200"
                />
              ) : (
                <Image
                  src="/royale/cards/card-legendary-unknown.png"
                  alt="Card"
                  width={60}
                  height={60}
                  className=""
                />
              )}
            </div>
          ))}
        </div>

        <a href="https://royaleapi.com/player/9UJLLC08R" target="_blank" rel="noopener noreferrer">
          <div className="w-[24px] h-[30px] sm:w-[35px] sm:h-[43px] absolute right-2 sm:right-4 bottom-2">
            <Image
              src="/about/test.png"
              fill
              alt="Clash Royale Logo"
              className="hover:translate-y-[-2px] duration-200"
            />
          </div>
        </a>
      </div>


      {/* States */}
      {error && <div className="mt-3 text-sm text-red-300">{error}</div>}
      {!data && !error && (
        <div className="mt-3 text-xs text-neutral-200/70 animate-pulse">
          Loading Clash Royale data…
        </div>
      )}
    </div>
  )
}
