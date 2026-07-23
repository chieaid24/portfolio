"use client";

// PROTOTYPE — dev-only floating bar on the home hero for comparing light-mode
// globe treatments over the real animated star background. Cycles off / A / C,
// previews other theme accents, and follows the site's own light/dark toggle.
// Hidden in production builds. Remove once a treatment is folded into Hero.

import { useEffect } from "react";
import { useTheme } from "next-themes";

// off = the untouched production globe.
const STEPS = [null, "A", "C"];
const LABELS = { A: "A — Ink globe", C: "C — Deep-space porthole" };

const ACCENTS = [
  { name: "coral", hex: "#ff5e5e" },
  { name: "amber", hex: "#f0a029" },
  { name: "green", hex: "#4bbf87" },
  { name: "violet", hex: "#8b74e8" },
];

export default function GlobeVariantBar({ variant, onVariant, accentPreview, onAccent }) {
  const { resolvedTheme, setTheme } = useTheme();
  const cycle = (dir) => {
    const i = STEPS.indexOf(variant ?? null);
    onVariant(STEPS[(i + dir + STEPS.length) % STEPS.length]);
  };

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t && (/^(INPUT|TEXTAREA)$/.test(t.tagName) || t.isContentEditable)) return;
      if (e.key === "ArrowLeft") cycle(-1);
      if (e.key === "ArrowRight") cycle(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (process.env.NODE_ENV === "production") return null;

  const arrow =
    "flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-white/90 hover:bg-white/15";

  return (
    <div className="pointer-events-auto fixed bottom-5 left-1/2 z-[60] -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-neutral-900/90 px-2 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <button className={arrow} aria-label="Previous" onClick={() => cycle(-1)}>
          {"‹"}
        </button>
        <div className="min-w-[186px] px-1 text-center font-mono text-xs text-white">
          {variant ? (
            <span>{LABELS[variant]}</span>
          ) : (
            <span className="text-white/55">off — production globe</span>
          )}
        </div>
        <button className={arrow} aria-label="Next" onClick={() => cycle(1)}>
          {"›"}
        </button>

        <span className="mx-1 h-5 w-px bg-white/15" />

        <button
          className="rounded-full px-2.5 py-1 font-mono text-xs text-white hover:bg-white/15"
          onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
          title="treatments only apply in light mode"
        >
          {resolvedTheme === "light" ? "light" : "dark"}
        </button>

        <span className="mx-1 h-5 w-px bg-white/15" />

        <span className="pl-1 font-mono text-[10px] text-white/45">accent</span>
        <div className="flex items-center gap-1">
          {ACCENTS.map((a) => (
            <button
              key={a.hex}
              aria-label={a.name}
              onClick={() => onAccent(accentPreview === a.hex ? null : a.hex)}
              className="h-5 w-5 rounded-full ring-1 ring-white/25 transition-transform hover:scale-110"
              style={{
                backgroundColor: a.hex,
                outline: accentPreview === a.hex ? "2px solid white" : "none",
                outlineOffset: "1px",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
