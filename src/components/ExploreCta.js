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

export default function ExploreCta({ flash }) {
  const [bobbing, setBobbing] = useState(false);
  const reduce = useReducedMotion();

  // Real hover only: a tap on touch can latch mouseenter and leave the chevron
  // bobbing with nothing to stop it.
  const canBob = () =>
    !reduce &&
    window.matchMedia("(hover: hover) and (min-width: 768px)").matches;

  return (
    <div className="text-outline-gray flex rounded-xl text-lg font-semibold transition-transform duration-100 md:hover:scale-105">
      <a
        href={`#${EXPLORE_TARGET_ID}`}
        onClick={scrollToExperience}
        className="cursor-follow-btn border-outline-gray rounded-lg border-2 transition-colors duration-100 md:hover:border-main-text/75 md:hover:text-main-text/75"
        onMouseEnter={flash.onEnter}
        onMouseMove={flash.onMove}
        onMouseLeave={flash.onLeave}
      >
        <div className="inline-flex items-center gap-2 px-2 py-1 md:px-3 md:py-1">
          <span>Explore</span>
          {/* Bobs only while the chevron itself is hovered. Rest is the TOP of
              the travel, so it only ever dips. Driven here rather than by a CSS
              :hover animation because removing a CSS animation snaps back to 0 —
              a transition can't ease out of it, since its start value is the
              base style, not the animated one. */}
          <motion.span
            className="inline-flex"
            onMouseEnter={() => canBob() && setBobbing(true)}
            onMouseLeave={() => setBobbing(false)}
            animate={bobbing ? { y: [0, 1, 0] } : { y: 0 }}
            transition={
              bobbing
                ? {
                    duration: 0.8,
                    repeat: Infinity,
                    times: [0, 0.5, 1],
                    ease: [0.25, 0, 0.75, 1], // near-linear: up and down, not floaty
                  }
                : { duration: 0.25, ease: "easeOut" }
            }
          >
            <ArrowDownChevron className="text-dark-grey-text h-3 w-3" />
          </motion.span>
        </div>
      </a>
    </div>
  );
}
