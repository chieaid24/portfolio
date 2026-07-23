"use client";

// PROTOTYPE — floating switcher for the globe-lab route. Flips variant (A..D),
// light/dark mode, and the theme accent, all via URL params so any view is
// shareable and reload-stable. Hidden in production builds.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { VARIANTS, VARIANT_NAMES } from "./GlobeTreatment";

const ACCENTS = [
  { name: "coral", hex: "#ff5e5e" },
  { name: "amber", hex: "#f0a029" },
  { name: "green", hex: "#4bbf87" },
  { name: "violet", hex: "#8b74e8" },
];

export default function PrototypeSwitcher({ variant, mode, accent }) {
  const router = useRouter();

  const go = (next) => {
    const p = new URLSearchParams();
    p.set("variant", next.variant ?? variant);
    p.set("mode", next.mode ?? mode);
    p.set("accent", next.accent ?? accent);
    router.replace(`/globe-lab?${p.toString()}`, { scroll: false });
  };

  const cycle = (dir) => {
    const i = VARIANTS.indexOf(variant);
    const n = (i + dir + VARIANTS.length) % VARIANTS.length;
    go({ variant: VARIANTS[n] });
  };

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t && /^(INPUT|TEXTAREA)$/.test(t.tagName)) return;
      if (t && t.isContentEditable) return;
      if (e.key === "ArrowLeft") cycle(-1);
      if (e.key === "ArrowRight") cycle(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (process.env.NODE_ENV === "production") return null;

  const btn =
    "flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-white/90 hover:bg-white/15";

  return (
    <div className="pointer-events-auto fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-neutral-900/90 px-2 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <button className={btn} aria-label="Previous variant" onClick={() => cycle(-1)}>
          {"‹"}
        </button>
        <div className="min-w-[190px] px-1 text-center font-mono text-xs text-white">
          <span className="font-bold">{variant}</span>
          <span className="text-white/60"> — {VARIANT_NAMES[variant]}</span>
        </div>
        <button className={btn} aria-label="Next variant" onClick={() => cycle(1)}>
          {"›"}
        </button>

        <span className="mx-1 h-5 w-px bg-white/15" />

        <button
          className="rounded-full px-2.5 py-1 font-mono text-xs text-white hover:bg-white/15"
          onClick={() => go({ mode: mode === "light" ? "dark" : "light" })}
        >
          {mode}
        </button>

        <span className="mx-1 h-5 w-px bg-white/15" />

        <div className="flex items-center gap-1">
          {ACCENTS.map((a) => (
            <button
              key={a.hex}
              aria-label={a.name}
              onClick={() => go({ accent: a.hex })}
              className="h-5 w-5 rounded-full ring-1 ring-white/25 transition-transform hover:scale-110"
              style={{
                backgroundColor: a.hex,
                outline: accent === a.hex ? "2px solid white" : "none",
                outlineOffset: "1px",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
