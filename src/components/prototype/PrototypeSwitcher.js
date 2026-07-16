"use client";

// PROTOTYPE — throwaway. Floating variant switcher: arrows or ←/→ cycle through
// the variant keys, the current key is mirrored into ?variant= so a reload or a
// shared link lands on the same one. Never rendered in a production build.

import { useEffect } from "react";

export default function PrototypeSwitcher({ variants, current, onSelect }) {
  const index = Math.max(
    0,
    variants.findIndex((v) => v.key === current),
  );
  const cycle = (step) => {
    const next = (index + step + variants.length) % variants.length;
    onSelect(variants[next].key);
  };

  useEffect(() => {
    const onKey = (e) => {
      const el = document.activeElement;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || el?.isContentEditable) return;
      if (e.key === "ArrowLeft") cycle(-1);
      else if (e.key === "ArrowRight") cycle(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (process.env.NODE_ENV === "production") return null;

  const btn =
    "flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-black/70 transition-colors hover:bg-black/10 hover:text-black";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-white px-2 py-1.5 font-mono text-xs text-black shadow-[0_6px_24px_rgba(0,0,0,0.35)] ring-1 ring-black/10">
        <button className={btn} onClick={() => cycle(-1)} aria-label="Previous variant">
          ‹
        </button>
        <span className="min-w-[15rem] text-center tabular-nums">
          <span className="font-bold">{variants[index].key}</span>
          <span className="mx-1.5 text-black/30">—</span>
          <span className="text-black/70">{variants[index].name}</span>
        </span>
        <button className={btn} onClick={() => cycle(1)} aria-label="Next variant">
          ›
        </button>
      </div>
    </div>
  );
}
