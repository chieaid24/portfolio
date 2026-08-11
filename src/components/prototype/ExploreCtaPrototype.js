"use client";

// PROTOTYPE - throwaway. Three icon variants of the hero's Explore CTA,
// switchable via ?variant= on the real home page. Once one wins, fold it into
// Hero.js and delete this directory plus the two losing icons.
//
// Every variant keeps the full production button logic: cursor-follow flash,
// hover scale + border/text color, smooth scroll to #experience, hash update.
// Only the icon differs.

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ArrowDownCircleSolid from "@/icons/ArrowDownCircleSolid";
import ArrowDownChevron from "@/icons/ArrowDownChevron";
import ArrowDownCircleOutline from "@/icons/ArrowDownCircleOutline";

export const EXPLORE_TARGET_ID = "experience";

// Icon box sizes are per-variant: the chevron's glyph fills its viewBox edge to
// edge, so it reads much heavier than the two circles at the same class.
// A and C are both a filled disc with the arrow knocked out - they differ only
// in the arrow's weight (C's is chunkier, with a wider head and shorter tail).
export const VARIANTS = {
  A: { name: "Disc, thin arrow", Icon: ArrowDownCircleSolid, size: "h-6 w-6" },
  B: { name: "Bare chevron", Icon: ArrowDownChevron, size: "h-4 w-4" },
  C: { name: "Disc, bold arrow", Icon: ArrowDownCircleOutline, size: "h-6 w-6" },
};

export const VARIANT_KEYS = Object.keys(VARIANTS);

function scrollToExperience(e) {
  const el = document.getElementById(EXPLORE_TARGET_ID);
  if (!el) return;
  e.preventDefault();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const hash = `#${EXPLORE_TARGET_ID}`;
  if (window.location.hash !== hash) {
    window.history.pushState(null, "", hash);
  }
}

export default function ExploreCtaPrototype({ variant = "A", flash }) {
  const [hovered, setHovered] = useState(false);
  const reduce = useReducedMotion();
  const { Icon, size } = VARIANTS[variant] ?? VARIANTS.A;

  // Hover: the arrow drops, then bounces gently between 2px and 6px until the
  // pointer leaves. Unhover snaps the loop off and eases back to rest.
  const bounce = reduce ? { y: 3 } : { y: [2, 6, 2] };
  const bounceTransition = reduce
    ? { duration: 0.15 }
    : { duration: 0.85, repeat: Infinity, ease: "easeInOut" };

  return (
    <div className="text-outline-gray flex rounded-xl text-lg font-semibold transition-transform duration-100 md:hover:scale-105">
      <a
        href={`#${EXPLORE_TARGET_ID}`}
        onClick={scrollToExperience}
        className="cursor-follow-btn border-outline-gray rounded-lg border-2 transition-colors duration-100 md:hover:border-main-text/75 md:hover:text-main-text/75"
        onMouseEnter={(e) => {
          setHovered(true);
          flash.onEnter(e);
        }}
        onMouseMove={flash.onMove}
        onMouseLeave={(e) => {
          setHovered(false);
          flash.onLeave(e);
        }}
      >
        <div className="inline-flex items-center gap-2 px-2 py-1 md:px-3 md:py-1">
          <span>Explore</span>
          <motion.span
            className="inline-flex"
            animate={hovered ? bounce : { y: 0 }}
            transition={hovered ? bounceTransition : { duration: 0.18, ease: "easeOut" }}
          >
            <Icon className={`text-dark-grey-text ${size}`} />
          </motion.span>
        </div>
      </a>
    </div>
  );
}
