"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import ClashRoyale from "@/icons/ClashRoyale";
import Trophy from "@/icons/ClashTrophy";

const round1 = (n) => Math.round(n * 10) / 10;
const pct1 = (num, den) => (den ? round1((num / den) * 100) : null);

// Format: "Hog Rider" -> "hog-rider"
function formatCardAssetName(name) {
  return String(name).trim().toLowerCase().replace(/\s+/g, "-");
}

const getCardIcon = (card, index) => {
  const name = card?.name ?? "";
  const base = formatCardAssetName(name);
  if (!base) return null;

  const evoEligible = index < 2 && Number(card?.evolutionLevel ?? 0) >= 1;
  const evolvedPath = `/royale/cards/${base}-ev1.png`;
  const normalPath = `/royale/cards/${base}.png`;
  return evoEligible ? evolvedPath : normalPath;
};

export default function ClashWidget() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const res = await fetch("/api/royale/player");
        if (!res.ok) throw new Error(`API failed: ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const player = data?.player;
  const deck = player?.currentDeck ?? [];

  const careerWinPercent = useMemo(() => {
    const wins = player?.wins ?? 0;
    const total = player?.battleCount ?? 0;
    return pct1(wins, total); // null if total is 0/undefined
  }, [player?.wins, player?.battleCount]);

  const summary = useMemo(() => {
    const results = data?.battleResults ?? [];
    let w = 0,
      l = 0,
      d = 0;
    for (const r of results) {
      if (r === "win") w++;
      else if (r === "loss") l++;
      else d++;
    }
    const total = results.length || 1;
    return { w, l, d, winRate: pct1(w, total) };
  }, [data?.battleResults]);

  return (
    <div className="border-outline-gray relative flex flex-col overflow-hidden rounded-xl border-1 bg-[#1f1f1f] p-3 md:h-[152px]">
      {/* Header */}
      <div className="mb-1 flex items-center justify-between">
        <a
          href="https://royaleapi.com/player/9UJLLC08R"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex items-center gap-1 text-xl leading-tight font-semibold tracking-tighter text-white duration-100 hover:opacity-90 sm:text-2xl md:text-xl">
            <ClashRoyale className="h-6 w-6 text-white" />
            Merlord
          </div>
        </a>
        <div className="flex flex-col">
          <div className="flex items-center justify-end gap-1 text-base sm:text-lg md:text-base">
            <Trophy className="h-3.5 w-3.5 text-white sm:-translate-y-[1px] md:translate-y-0" />
            <div className="justify-end font-semibold tracking-tight text-white">
              {player?.trophies ?? "—"}
            </div>
          </div>
        </div>
      </div>
      <div className="font-base text-body-text grid grid-cols-2 gap-3 text-[10px] sm:text-sm md:text-xs md:leading-none lg:leading-normal">
        <div className="flex flex-col flex-wrap justify-between py-2 md:gap-[5px] lg:gap-0">
          <div className="flex items-center justify-between gap-x-1">
            <h1>Career wins</h1>
            <div className="text-dark-body-text">{player?.wins ?? "0"}</div>
          </div>
          <div className="flex items-center justify-between gap-x-1">
            <h1>Career win percentage</h1>
            <div className="text-dark-body-text">
              {careerWinPercent != null ? `${careerWinPercent}%` : "0%"}
            </div>
          </div>
          <div className="flex items-center justify-between gap-x-1">
            <h1>Recent wins</h1>
            <div className="text-dark-body-text">
              {summary.w != null ? `${summary.w}` : "—"}
            </div>
          </div>
          <div className="flex items-center justify-between gap-x-1">
            <h1>Recent win percentage</h1>
            <div className="text-dark-body-text">
              {summary.winRate != null ? `${summary.winRate}%` : "—"}
            </div>
          </div>
        </div>

        {/* Current deck */}
        <div className="ml-auto flex">
          <div className="grid grid-cols-4 grid-rows-2 gap-x-1 rounded-xl bg-black/10 py-1 sm:gap-x-3 md:gap-x-1">
            {deck.slice(0, 8).map((card, i) => (
              <div key={card.id ?? i} className="items-center justify-center">
                {getCardIcon(card, i) ? (
                  <Image
                    src={getCardIcon(card, i)}
                    alt={card.name || "Card"}
                    width={40}
                    height={40}
                    className="duration-200 md:hover:scale-105"
                  />
                ) : (
                  <Image
                    src="/royale/cards/card-legendary-unknown.png"
                    alt="Card"
                    width={40}
                    height={40}
                    className=""
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* States */}
      {error && <div className="mt-3 text-sm text-red-300">{error}</div>}
      {!data && !error && (
        <div className="mt-3 animate-pulse text-xs text-neutral-200/70">
          Loading Clash Royale data…
        </div>
      )}
    </div>
  );
}
