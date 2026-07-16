"use client";

// PROTOTYPE — throwaway. Delete once the hero shaping is settled.
//
// Question: instead of copy hard-left and the globe hard-right with ~130px of
// dead space between them, what if the copy + links + globe read as ONE centered
// block, with the copy's right edge right-aligned *along the globe's arc* rather
// than along a straight line?
//
// Two keys on the real "/" route, gated by ?variant=:
//   current — today's hero (rendered by page.js), kept for A/B
//   shaped  — this file
// Switcher: PrototypeSwitcher (bottom bar, or ←/→). Never in a production build.
//
// Constraints this variant honors, per the owner:
//   - line breaks stay EXACTLY as they fall today (so they're frozen as literals
//     below, not reflowed) — only each line's horizontal offset changes
//   - the globe is a FIXED hand-tuned size; nothing measures the copy and resizes
//     the globe, so there's no reflow loop
//   - below md the globe is hidden, so md- keeps today's plain left-aligned stack

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import RewardLink from "@/components/RewardLink";
import ScrambledText from "@/components/ScrambledText";
import FileDownload from "@/icons/FileDownload";
import FooterLinkedin from "@/icons/FooterLinkedin";
import FooterGithub from "@/icons/FooterGithub";
import FooterEmail from "@/icons/FooterEmail";
import { AsciiGlobe } from "@/components/MissionControl";

export const HERO_VARIANTS = [
  { key: "current", name: "Current (copy left, globe right)" },
  { key: "shaped", name: "Shaped (centered block, copy on the arc)" },
];

// Variant state lives in React + the URL (?variant=), read from window on mount
// so there's no Suspense boundary to add to the page for this throwaway.
export function useHeroVariant() {
  const [variant, setVariant] = useState("current");
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("variant");
    if (v && HERO_VARIANTS.some((x) => x.key === v)) setVariant(v);
  }, []);
  const select = useCallback((v) => {
    setVariant(v);
    const url = new URL(window.location.href);
    if (v === "current") url.searchParams.delete("variant");
    else url.searchParams.set("variant", v);
    window.history.replaceState(null, "", url);
  }, []);
  return [variant, select];
}

// ---------------------------------------------------------------------------
// tunables — the whole point of the prototype
// ---------------------------------------------------------------------------

// Globe size. Fixed by choice: the copy never resizes it. The disc's diameter is
// (ROWS - 1) * FONT_PX = 133px, which matches the left column's measured 132px
// and is a step up from the old 13 rows @ 9px (108px disc). FONT_PX stays ~9 so
// the ASCII texture reads the same as before.
const GLOBE_ROWS = 15;
const GLOBE_FONT_PX = 9.5;
const GLOBE_RADIUS = ((GLOBE_ROWS - 1) / 2) * GLOBE_FONT_PX;

// Clearance between a line's right edge and the globe's edge.
const GAP = 16;

// How a line is judged against the globe's edge.
//   true  — the closest approach anywhere in the line's ink band. Clearance is
//           uniform and nothing can ever touch the disc.
//   false — sample the edge at the line's vertical center only. Simpler, but
//           quantization makes it read flatter AND lets tall rows creep in.
const BAND_RULE = true;

// Per-line vertical inset (px) trimming the line box down to roughly the glyph
// ink, so a 28px line box isn't judged as if it were 28px of solid text. Index
// matches the lines array; the links row is real ink edge to edge, so 0.
const INK_INSET = [4, 4, 0];

// Center the block on its PAINTED extent rather than its layout box. The arc
// shifts pull the copy rightward, which leaves the layout box wider on the left
// than the ink is — without this the block reads a few px right of center.
const OPTICAL_CENTER = true;

// Center the title over the block. Today's hero has it flush left and full
// width; "center aligned again" + the old main hero argue for centered. Flip to
// false to see it flush left against the centered block.
const CENTER_TITLE = true;

// Frozen line breaks — these are exactly where the live <p> breaks at md+ today
// (max-w-[28rem], text-xl). Edit the copy and you must re-check these by hand.
const COPY_LINES = [
  "I build automation-first platforms and",
  "developer infrastructure for AI.",
];

// ---------------------------------------------------------------------------

function HeroLinks({ flash }) {
  return (
    <>
      <div className="text-outline-gray flex rounded-xl text-lg font-semibold transition-transform duration-100 md:hover:scale-105">
        <RewardLink
          href="https://drive.google.com/file/d/1YzK4a7QVQ6JAAOIF_WcgJk7MnkVXQfzC/view?usp=sharing"
          rewardId="resume"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-follow-btn border-outline-gray rounded-lg border-2 transition-colors duration-100 md:hover:border-main-text/75 md:hover:text-main-text/75"
          onMouseEnter={flash.onEnter}
          onMouseMove={flash.onMove}
          onMouseLeave={flash.onLeave}
        >
          <div className="inline-flex items-center gap-2 px-2 py-1 md:px-3 md:py-1">
            <span>Resume</span>
            <FileDownload className="text-dark-grey-text h-5 w-5" />
          </div>
        </RewardLink>
      </div>
      <div className="text-outline-gray flex items-center justify-center gap-x-4">
        <RewardLink
          href="https://www.linkedin.com/in/aidanchien/"
          target="_blank"
          rewardId="linkedin"
          aria-label="LinkedIn"
          className="md:hover:translate-y-[-1px]"
        >
          <FooterLinkedin className="h-8 w-8 transition-colors duration-100 md:hover:text-main-text-hover" />
        </RewardLink>
        <RewardLink
          href="https://github.com/chieaid24"
          target="_blank"
          rewardId="github"
          aria-label="GitHub"
          className="md:hover:translate-y-[-1px]"
        >
          <FooterGithub className="h-8 w-8 transition-colors duration-100 md:hover:text-main-text-hover" />
        </RewardLink>
        <RewardLink
          href="mailto:aidan.chien@uwaterloo.ca"
          target="_blank"
          rewardId="email"
          aria-label="Email"
          className="md:hover:translate-y-[-1px]"
        >
          <FooterEmail className="h-8 w-8 transition-colors duration-100 md:hover:text-main-text-hover" />
        </RewardLink>
      </div>
    </>
  );
}

// The globe's left edge, per character row, in px from the <pre>'s left.
//
// NOT the ideal circle `cx - sqrt(R² - y²)`: the globe is characters, so its
// disc is a staircase, and at this size the left edge is dead flat for the five
// rows around the waist. Aligning to the math circle instead of to the pixels
// leaves visibly uneven clearance (measured 3px at one line, 12px at the next).
// So read the silhouette off what's actually painted. The ocean glyphs fill the
// whole disc, so the outline is static — rotation only changes what's inside it.
function readGlobeEdge(globeEl) {
  const pres = globeEl.querySelectorAll("pre");
  if (pres.length < 2) return null;
  const grids = [...pres].map((p) => p.textContent.split("\n"));
  const rowCount = Math.max(...grids.map((g) => g.length));
  const cols = Math.max(...grids.flat().map((r) => r.length));
  if (!rowCount || !cols) return null; // not painted yet

  const box = pres[0].getBoundingClientRect();
  if (!box.width) return null;
  const cellW = box.width / cols;
  const rowH = box.height / rowCount;

  const edges = [];
  for (let j = 0; j < rowCount; j++) {
    let first = -1;
    for (let i = 0; i < cols && first < 0; i++) {
      for (const g of grids) {
        const ch = g[j]?.[i];
        if (ch && ch !== " ") {
          first = i;
          break;
        }
      }
    }
    edges.push({
      top: box.top + j * rowH,
      bottom: box.top + (j + 1) * rowH,
      // -1 => this row paints nothing at all; it constrains nothing.
      x: first < 0 ? Infinity : box.left + first * cellW,
    });
  }
  return edges;
}

// Right-aligns each line to the globe's silhouette instead of to a straight edge.
//
// Every line is laid out flush-right against the same column edge, then shifted
// horizontally by transform only — never by anything that reflows — so the
// frozen line breaks are guaranteed to survive. Lines beside the disc's waist
// barely move; lines toward its poles slide right into the space the curve gives
// back. That stagger is the whole effect.
function useArcAlign({ groupRef, colRef, globeRef, lineRefs, enabled }) {
  useLayoutEffect(() => {
    const apply = () => {
      const group = groupRef.current;
      const col = colRef.current;
      const globe = globeRef.current;
      const lines = lineRefs.current.filter(Boolean);
      if (!group || !col || !globe || lines.length === 0) return;

      // Clear last pass first: every measurement below must be of the untouched
      // layout, or the shifts compound.
      for (const el of lines) el.style.transform = "";
      group.style.transform = "";

      if (!enabled() || globe.offsetWidth === 0) return;
      const edges = readGlobeEdge(globe);
      if (!edges) return;

      const gb = globe.getBoundingClientRect();
      const cx = gb.left + gb.width / 2;
      const colRight = col.getBoundingClientRect().right;

      lines.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const inset = INK_INSET[i] ?? 0;
        const top = r.top + inset;
        const bot = r.bottom - inset;
        // Closest approach of the globe's edge over the rows this line spans —
        // that's what has to be cleared. Sampling only the line's center row
        // instead lets a tall row's corner reach past the edge it was judged by.
        let edgeX = Infinity;
        for (const e of edges) {
          const overlaps = BAND_RULE
            ? e.bottom > top && e.top < bot
            : e.bottom > (top + bot) / 2 && e.top <= (top + bot) / 2;
          if (overlaps) edgeX = Math.min(edgeX, e.x);
        }
        // A line clear of the disc's rows entirely has nothing to hug.
        if (!Number.isFinite(edgeX)) edgeX = cx;
        el.style.transform = `translateX(${edgeX - GAP - colRight}px)`;
      });

      if (OPTICAL_CENTER) {
        // Ink extent, not layout box: leftmost shifted line .. the disc's rim.
        let paintedLeft = Infinity;
        for (const el of lines) {
          paintedLeft = Math.min(paintedLeft, el.getBoundingClientRect().left);
        }
        const paintedRight = cx + GLOBE_RADIUS;
        const gr = group.getBoundingClientRect();
        const shift =
          gr.left + gr.width / 2 - (paintedLeft + paintedRight) / 2;
        group.style.transform = `translateX(${shift}px)`;
      }
    };

    apply();

    // The globe sizes itself only after it has measured a character cell, and
    // web fonts land late — so re-run on any box change rather than once. A
    // transform never changes a border box, so this can't feed itself.
    const ro = new ResizeObserver(apply);
    for (const el of [groupRef.current, colRef.current, globeRef.current]) {
      if (el) ro.observe(el);
    }
    window.addEventListener("resize", apply);
    document.fonts?.ready.then(apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, [groupRef, colRef, globeRef, lineRefs, enabled]);
}

function ShapedHero({ accent, flash }) {
  const groupRef = useRef(null);
  const colRef = useRef(null);
  const globeRef = useRef(null);
  const lineRefs = useRef([]);
  const setLine = (i) => (el) => {
    lineRefs.current[i] = el;
  };
  // md- hides the globe entirely, so there's no arc to align to down there.
  const enabled = useCallback(
    () => window.matchMedia("(min-width: 768px)").matches,
    [],
  );

  useArcAlign({ groupRef, colRef, globeRef, lineRefs, enabled });

  return (
    <motion.div
      className="flex min-h-screen flex-col items-center justify-center gap-4 text-main-text"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h1
        className={`w-full text-2xl font-bold leading-[1.05] text-main-text sm:text-3xl md:text-[38px] lg:text-[46px] ${
          CENTER_TITLE ? "md:text-center" : ""
        }`}
      >
        Greetings Earthling, I&apos;m{" "}
        <ScrambledText text="Aidan" className="gradient-text-header" />
      </h1>

      {/* md-: today's plain stack, globe-less and untouched. */}
      <div className="flex w-full flex-col items-start gap-9 md:hidden">
        <p className="text-body-text max-w-[28rem] text-lg font-medium sm:text-xl">
          {COPY_LINES.join(" ")}
        </p>
        <div className="flex items-center gap-5">
          <HeroLinks flash={flash} />
        </div>
      </div>

      {/* md+: copy + links + globe as one centered block, copy on the arc. */}
      <div
        ref={groupRef}
        className="hidden w-full items-center justify-center md:flex"
      >
        <div ref={colRef} className="flex flex-col items-end">
          {COPY_LINES.map((line, i) => (
            <div
              key={line}
              ref={setLine(i)}
              className="text-body-text text-xl font-medium whitespace-nowrap"
            >
              {line}
            </div>
          ))}
          <div
            ref={setLine(COPY_LINES.length)}
            className="mt-9 flex items-center gap-5"
          >
            <HeroLinks flash={flash} />
          </div>
        </div>
        <div
          ref={globeRef}
          className="shrink-0 [&_pre:first-child]:opacity-60 dark:[&_pre:first-child]:opacity-35"
        >
          <AsciiGlobe color={accent} rows={GLOBE_ROWS} fontPx={GLOBE_FONT_PX} />
        </div>
      </div>
    </motion.div>
  );
}

export default function HeroVariant({ variant, accent, flash }) {
  if (variant === "shaped") return <ShapedHero accent={accent} flash={flash} />;
  return null;
}
