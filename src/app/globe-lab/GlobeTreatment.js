"use client";

// PROTOTYPE — throwaway. Light-mode treatments for the hero ASCII globe, each a
// different answer to "the globe reads faint and the blurred dark disc looks bad
// on the day sky." Layout is frozen; only the disc/backdrop + layer colors vary.
// Dark mode always renders the production treatment so the toggle proves dark is
// unchanged. Fold the winner into Hero.js (scoped to `.light`) and delete this.

import { AsciiGlobe } from "@/components/MissionControl";

// color-mix lets each treatment derive its ink from whatever theme accent is
// live, so legibility holds across coral / amber / green / violet, not just one.
const deepen = (a, pct) => `color-mix(in srgb, ${a} ${pct}%, #0e2038)`;
const warmDeepen = (a, pct) => `color-mix(in srgb, ${a} ${pct}%, #2a1c17)`;
const brighten = (a, pct) => `color-mix(in srgb, ${a} ${pct}%, #ffffff)`;

export const VARIANTS = ["A", "B", "C", "D"];

export const VARIANT_NAMES = {
  A: "Ink globe — no disc",
  B: "Frosted day porthole",
  C: "Deep-space porthole",
  D: "Accent halo — soft",
};

// Per-variant light-mode recipe. land/ocean take the accent; disc is a render tag.
const LIGHT = {
  A: {
    land: (a) => deepen(a, 72),
    ocean: () => "#3f5a7a",
    oceanOp: 0.6,
    disc: null,
  },
  B: {
    land: (a) => warmDeepen(a, 88),
    ocean: () => "#5a6a82",
    oceanOp: 0.5,
    disc: "frost",
  },
  C: {
    land: (a) => brighten(a, 88),
    ocean: () => "#93a9d6",
    oceanOp: 0.45,
    disc: "space",
  },
  D: {
    land: (a) => deepen(a, 66),
    ocean: (a) => deepen(a, 55),
    oceanOp: 0.5,
    disc: "halo",
  },
};

function Disc({ kind, accent }) {
  if (kind === "frost") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-1 rounded-full ring-1 ring-black/10 shadow-[0_2px_12px_rgba(40,30,20,0.10)]"
        style={{
          background: "rgba(255,255,255,0.5)",
          backdropFilter: "blur(2.5px)",
          WebkitBackdropFilter: "blur(2.5px)",
        }}
      />
    );
  }
  if (kind === "space") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-1 rounded-full ring-1 ring-white/15"
        style={{
          background:
            "radial-gradient(circle at 38% 32%, #12224a 0%, #0a1330 62%, #070d22 100%)",
          boxShadow: "0 0 20px rgba(12,22,60,0.35)",
        }}
      />
    );
  }
  if (kind === "halo") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-full"
        style={{
          background: `radial-gradient(circle, ${accent} 0%, transparent 68%)`,
          opacity: 0.32,
          filter: "blur(6px)",
        }}
      />
    );
  }
  return null;
}

// Production dark look, so the dark toggle shows the real (unchanged) globe.
function DarkGlass() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -inset-1 rounded-full bg-black/25 backdrop-blur-[3px]"
    />
  );
}

export default function GlobeTreatment({ variant, accent, mode, rows, fontPx }) {
  if (mode === "dark") {
    return (
      <div className="relative mx-auto w-fit">
        <DarkGlass />
        <div className="relative [&_pre:first-child]:opacity-35">
          <AsciiGlobe color={accent} rows={rows} fontPx={fontPx} />
        </div>
      </div>
    );
  }

  const t = LIGHT[variant] ?? LIGHT.A;
  return (
    <div className="relative mx-auto w-fit">
      <Disc kind={t.disc} accent={accent} />
      <div className="relative">
        <AsciiGlobe
          color={accent}
          landColor={t.land(accent)}
          oceanColor={t.ocean(accent)}
          oceanOpacity={t.oceanOp}
          rows={rows}
          fontPx={fontPx}
        />
      </div>
    </div>
  );
}
