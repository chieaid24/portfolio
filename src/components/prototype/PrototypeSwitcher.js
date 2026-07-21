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
    "flex h-5 w-5 items-center justify-center rounded-full text-sm leading-none text-black/50 transition-colors hover:bg-black/10 hover:text-black";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-white/90 px-1 py-0.5 font-mono text-[11px] text-black shadow-md ring-1 ring-black/10 backdrop-blur">
        <button className={btn} onClick={() => cycle(-1)} aria-label="Previous variant">
          ‹
        </button>
        <span className="min-w-[3.5rem] text-center font-medium tabular-nums">
          {variants[index].key}
        </span>
        <button className={btn} onClick={() => cycle(1)} aria-label="Next variant">
          ›
        </button>
      </div>
    </div>
  );
}
