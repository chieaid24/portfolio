"use client";

// Hero's Explore CTA: smooth-scrolls to the Experience section. Shares the
// cursor-follow flash handlers with the rest of the hero (passed in as `flash`).

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ArrowDownChevron from "@/icons/ArrowDownChevron";

export const EXPLORE_TARGET_ID = "experience";

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

export default function ExploreCta({ flash, bounce = true }) {
  const [hovered, setHovered] = useState(false);
  const reduce = useReducedMotion();
  const animate = bounce && hovered;

  // Hover: the arrow drops, then floats on a gravity arc until the pointer
  // leaves. Curves are Tailwind's `animate-bounce`, measured off tedawf.com -
  // the asymmetry is the whole feel, so a symmetric easeInOut reads like a
  // metronome instead. Stretched for more float: 1.3s vs their 1s, and 30% of
  // the icon's height of travel vs their 25%.
  //
  // Percentages, not px, so the float scales with the icon.
  const float = reduce ? { y: "20%" } : { y: ["15%", "45%", "15%"] };
  const floatTransition = reduce
    ? { duration: 0.15 }
    : {
        duration: 1.3,
        repeat: Infinity,
        times: [0, 0.5, 1],
        ease: [
          [0.8, 0, 1, 1], // fall: hangs off the apex, then slams into the bottom
          [0, 0, 0.2, 1], // rise: fast off the bottom, decelerates into the apex
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
            animate={animate ? float : { y: 0 }}
            transition={animate ? floatTransition : { duration: 0.18, ease: "easeOut" }}
          >
            {/* the chevron's glyph fills its viewBox edge to edge, so it reads
                heavier than its box size suggests */}
            <ArrowDownChevron className="text-dark-grey-text h-3 w-3" />
          </motion.span>
        </div>
      </a>
    </div>
  );
}
