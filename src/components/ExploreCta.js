"use client";

// Hero's Explore CTA: smooth-scrolls to the Experience section. Shares the
// cursor-follow flash handlers with the rest of the hero (passed in as `flash`).

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
  return (
    <div className="text-outline-gray flex rounded-xl text-lg font-semibold transition-transform duration-100 md:hover:scale-105">
      <a
        href={`#${EXPLORE_TARGET_ID}`}
        onClick={scrollToExperience}
        className="cursor-follow-btn border-outline-gray group rounded-lg border-2 transition-colors duration-100 md:hover:border-main-text/75 md:hover:text-main-text/75"
        onMouseEnter={flash.onEnter}
        onMouseMove={flash.onMove}
        onMouseLeave={flash.onLeave}
      >
        <div className="inline-flex items-center gap-2 px-2 py-1 md:px-3 md:py-1">
          <span>Explore</span>
          {/* nudges down on hover, matching the project card's "Warp here" arrow */}
          <ArrowDownChevron className="text-dark-grey-text h-3 w-3 transition-transform md:group-hover:translate-y-[1px]" />
        </div>
      </a>
    </div>
  );
}
