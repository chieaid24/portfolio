"use client";

// Hero's Explore CTA: smooth-scrolls to the Experience section. Shares the
// cursor-follow flash handlers with the rest of the hero (passed in as `flash`).

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ArrowDownChevron from "@/icons/ArrowDownChevron";

export const EXPLORE_TARGET_ID = "experience";

// What has to be hovered to start the chevron's bob. Comment one, uncomment the
// other to compare.
const BOB_TRIGGER = "button"; // anywhere on the CTA
// const BOB_TRIGGER = "chevron"; // the chevron itself

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
  const fromButton = BOB_TRIGGER === "button";

  // Real hover only: a tap on touch can latch mouseenter and leave the chevron
  // bobbing with nothing to stop it.
  const canBob = () =>
    !reduce &&
    window.matchMedia("(hover: hover) and (min-width: 768px)").matches;

  const startBob = () => canBob() && setBobbing(true);
  const stopBob = () => setBobbing(false);

  return (
    <div className="text-outline-gray flex rounded-xl text-lg font-semibold transition-transform duration-100 md:hover:scale-105">
      <a
        href={`#${EXPLORE_TARGET_ID}`}
        onClick={scrollToExperience}
        className="cursor-follow-btn border-outline-gray rounded-lg border-2 transition-colors duration-100 md:hover:border-main-text/75 md:hover:text-main-text/75"
        onMouseEnter={(e) => {
          flash.onEnter(e);
          if (fromButton) startBob();
        }}
        onMouseMove={flash.onMove}
        onMouseLeave={(e) => {
          flash.onLeave(e);
          if (fromButton) stopBob();
        }}
      >
        <div className="inline-flex items-center gap-2 px-2 py-1 md:px-3 md:py-1">
          <span>Explore</span>
          {/* Rest is the TOP of the travel, so the chevron only ever dips.
              Driven here rather than by a CSS :hover animation because removing
              a CSS animation snaps back to 0 — a transition can't ease out of
              it, since its start value is the base style, not the animated one. */}
          <motion.span
            className="inline-flex"
            onMouseEnter={fromButton ? undefined : startBob}
            onMouseLeave={fromButton ? undefined : stopBob}
            animate={bobbing ? { y: [0, 1, 0] } : { y: 0 }}
            transition={
              bobbing
                ? {
                    duration: 1,
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
