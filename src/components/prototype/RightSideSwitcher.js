"use client";

// PROTOTYPE — floating switcher for the right-side hero explorations. Cycles
// ?rside= via arrows or left/right keys. Hidden in production builds. DELETE
// with RightSideVariants.js once a winner is chosen.

import { useEffect } from "react";

export default function RightSideSwitcher({ variants, current, names, onChange }) {
  const idx = variants.indexOf(current);
  const go = (dir) => {
    const next = variants[(idx + dir + variants.length) % variants.length];
    onChange(next);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="pointer-events-auto fixed bottom-5 left-1/2 z-[2000] -translate-x-1/2">
      <div className="border-outline-darker-gray bg-background/80 flex items-center gap-2 rounded-full border px-2 py-1.5 font-mono text-xs text-main-text shadow-lg backdrop-blur-md">
        <button
          type="button"
          onClick={() => go(-1)}
          className="rounded-full px-2 py-0.5 hover:bg-white/10"
          aria-label="Previous right-side variant"
        >
          {"<"}
        </button>
        <span className="whitespace-nowrap">
          right: {current} — {names[current]}{" "}
          <span className="text-body-text/50">
            ({idx + 1}/{variants.length})
          </span>
        </span>
        <button
          type="button"
          onClick={() => go(1)}
          className="rounded-full px-2 py-0.5 hover:bg-white/10"
          aria-label="Next right-side variant"
        >
          {">"}
        </button>
      </div>
    </div>
  );
}
