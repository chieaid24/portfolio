"use client";

// PROTOTYPE — light-mode treatments for the hero ASCII globe, wired into Hero via
// a dev-only switch bar (?variant=A|C). The default (no variant) keeps the
// production globe untouched. Dark mode always renders the production treatment,
// so switching only affects light. Fold the winner into Hero.js and delete this.

import { AsciiGlobe } from "@/components/MissionControl";

// Derive each treatment's ink from the live theme accent, so legibility holds
// across every purchasable theme (coral / amber / green / violet), not just one.
const deepen = (a, pct) => `color-mix(in srgb, ${a} ${pct}%, #0e2038)`;
const brighten = (a, pct) => `color-mix(in srgb, ${a} ${pct}%, #ffffff)`;

export const VARIANTS = ["A", "C"];
export const VARIANT_NAMES = {
  A: "Ink globe — no disc",
  C: "Deep-space porthole",
};

const LIGHT = {
  // Crisp dark ink straight on the sky — no disc.
  A: { land: (a) => deepen(a, 72), ocean: () => "#3f5a7a", oceanOp: 0.6, disc: null },
  // Bright ink on a dark navy porthole with a crisp rim.
  C: { land: (a) => brighten(a, 88), ocean: () => "#93a9d6", oceanOp: 0.45, disc: "space" },
};

function Disc({ kind, rows, fontPx }) {
  if (kind === "space") {
    // A true square centered on the globe, not `-inset` of the (wider-than-tall)
    // character box — otherwise rounded-full traces an ellipse. The painted
    // circle's diameter is (rows-1)*fontPx in both axes; +rim for a little margin.
    const d = (rows - 1) * fontPx + 22;
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-white/15"
        style={{
          width: d,
          height: d,
          background:
            "radial-gradient(circle at 38% 32%, #12224a 0%, #0a1330 62%, #070d22 100%)",
          boxShadow: "0 0 20px rgba(12,22,60,0.35)",
        }}
      />
    );
  }
  return null;
}

// Production dark look, so the site's dark theme is visibly unchanged.
function DarkGlass() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -inset-1 rounded-full bg-black/25 backdrop-blur-[3px]"
    />
  );
}

export default function GlobeTreatment({ variant, accent, mode, rows, fontPx }) {
  if (mode !== "light") {
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
      <Disc kind={t.disc} rows={rows} fontPx={fontPx} />
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
