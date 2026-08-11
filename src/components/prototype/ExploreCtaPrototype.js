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
import ArrowDownChevron from "@/icons/ArrowDownChevron";
import ArrowDownCircleOutline from "@/icons/ArrowDownCircleOutline";

export const EXPLORE_TARGET_ID = "experience";

// Icon box sizes are per-variant: the chevron's glyph fills its viewBox edge to
// edge, so it reads heavier than the disc at the same class.
export const VARIANTS = {
  B: { name: "Bare chevron", Icon: ArrowDownChevron, size: "h-3.5 w-3.5" },
  C: { name: "Disc, bold arrow", Icon: ArrowDownCircleOutline, size: "h-5 w-5" },
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

  // Hover: the arrow drops, then floats on a gravity arc until the pointer
  // leaves. The two easings are the whole feel — the fall accelerates hard into
  // the bottom, the rise decelerates into a hang at the top. A symmetric
  // easeInOut reads like a metronome instead. Unhover eases back to rest.
  const bounce = reduce ? { y: 3 } : { y: [2, 9, 2] };
  const bounceTransition = reduce
    ? { duration: 0.15 }
    : {
        duration: 1.7,
        repeat: Infinity,
        times: [0, 0.5, 1],
        ease: [
          [0.7, 0, 0.84, 0], // fall: slow off the apex, fast at the bottom
          [0.16, 1, 0.3, 1], // rise: fast off the bottom, hangs at the apex
        ],
      };

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
