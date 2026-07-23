"use client";

// PROTOTYPE ROUTE — /globe-lab. Four light-mode treatments of the hero ASCII
// globe on the real day-sky background + real hero layout, switchable via the
// floating bar (or ?variant=A..D&mode=light|dark&accent=#hex). Throwaway: once a
// treatment wins, fold it into components/Hero.js (light-scoped) and delete this
// whole folder + the AsciiGlobe prop additions that aren't used.

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import HeroLab from "./HeroLab";
import PrototypeSwitcher from "./PrototypeSwitcher";
import { VARIANTS } from "./GlobeTreatment";

const noopFlash = { onEnter() {}, onMove() {}, onLeave() {} };

const DAY_SKY = "linear-gradient(180deg, #c4e4fb 0%, #a3cef7 55%, #95c4ee 100%)";
const NIGHT_SKY = "#02030a";

// Deterministic CSS starfield (box-shadow dots) so the disc/blur treatments have
// real stars to sit over, matching what the three.js sky paints in production.
function useStarShadow(count, w, h, seed) {
  return useMemo(() => {
    // Stateless hash rand(i, k) — no mutation, so it's deterministic and pure.
    const rand = (i, k) => {
      const v = Math.sin(seed + i * 12.9898 + k * 78.233) * 43758.5453;
      return v - Math.floor(v);
    };
    const parts = [];
    for (let i = 0; i < count; i++) {
      const x = Math.round(rand(i, 0) * w);
      const y = Math.round(rand(i, 1) * h);
      const big = rand(i, 2) < 0.12 ? "1px" : "0";
      const a = (0.45 + rand(i, 3) * 0.5).toFixed(2);
      parts.push(`${x}px ${y}px 0 ${big} rgba(255,255,255,${a})`);
    }
    return parts.join(",");
  }, [count, w, h, seed]);
}

function StarField({ mode }) {
  const shadow = useStarShadow(160, 1800, 1100, 7);
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ background: mode === "light" ? DAY_SKY : NIGHT_SKY }}
    >
      <div
        className="absolute left-0 top-0 h-px w-px rounded-full"
        style={{ boxShadow: shadow, opacity: mode === "light" ? 0.85 : 0.6 }}
      />
    </div>
  );
}

function Lab() {
  const sp = useSearchParams();
  const variant = VARIANTS.includes(sp.get("variant")) ? sp.get("variant") : "A";
  const mode = sp.get("mode") === "dark" ? "dark" : "light";
  const accent = sp.get("accent") || "#ff5e5e";

  return (
    <div className={mode === "light" ? "light" : ""}>
      <StarField mode={mode} />
      <MaxWidthWrapper>
        <HeroLab accent={accent} flash={noopFlash} variant={variant} mode={mode} />
      </MaxWidthWrapper>
      <PrototypeSwitcher variant={variant} mode={mode} accent={accent} />
    </div>
  );
}

export default function GlobeLabPage() {
  return (
    <Suspense fallback={null}>
      <Lab />
    </Suspense>
  );
}
