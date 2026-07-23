"use client";

// Home hero. At md+ the globe, copy, and links read as one centered block, with
// the copy's left edge aligned along the globe's arc instead of a straight line;
// below md it falls back to a plain left-aligned stack (the globe is hidden).
//
// Constraints:
//   - copy line breaks are frozen as literals below (COPY_LINES), never reflowed —
//     only each line's horizontal offset changes, so the arc can't re-break them
//   - the globe is a fixed hand-tuned size; nothing measures the copy and resizes
//     the globe, so there's no reflow loop

import { useCallback, useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import RewardLink from "@/components/RewardLink";
import ScrambledText from "@/components/ScrambledText";
import FileDownload from "@/icons/FileDownload";
import FooterLinkedin from "@/icons/FooterLinkedin";
import FooterGithub from "@/icons/FooterGithub";
import { AsciiGlobe } from "@/components/MissionControl";

// Globe size. Fixed by choice: the copy never resizes it. The disc's diameter is
// (ROWS - 1) * FONT_PX = 126px. ROWS is odd so the disc has a real center row —
// the vertical center lands on a row, not between two, which reads as a rounder,
// balanced circle. FONT_PX stays ~9 so the ASCII texture reads the same as before.
const GLOBE_ROWS = 15;
const GLOBE_FONT_PX = 9;
const GLOBE_RADIUS = ((GLOBE_ROWS - 1) / 2) * GLOBE_FONT_PX;

// Clearance between a line's left edge and the globe's edge.
const GAP = 60;

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

// Frozen line breaks — these are exactly where the live <p> breaks at md+
// (max-w-[28rem], text-xl). Edit the copy and you must re-check these by hand.
const COPY_LINES = [
  "I build automation-first platforms",
  "and infra for AI systems.",
];

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
      </div>
    </>
  );
}

// Deep-space porthole backdrop: an opaque navy disc that lifts the sparse ASCII
// off the sky in both themes. Land = brightened accent, ocean = cool dots.
const PORTHOLE_LAND = (accent) => `color-mix(in srgb, ${accent} 88%, #ffffff)`;
const PORTHOLE_OCEAN = "#93a9d6";
const PORTHOLE_OCEAN_OPACITY = 0.45;

// The porthole disc hugging the globe so its sparse ASCII lifts off any sky.
// A true square sized to the globe's real diameter — (rows-1)*fontPx, equal in
// both axes because the projection's aspect term cancels — NOT `-inset` of the
// wider-than-tall character box, which rounded-full would trace as an ellipse.
// Absolute + pointer-events-none, so it never grows the globe's box or the arc
// measurement.
function GlobePorthole() {
  const d = (GLOBE_ROWS - 1) * GLOBE_FONT_PX + 22; // circle diameter + rim
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-white/15"
      style={{
        width: d,
        height: d,
        background:
          "radial-gradient(circle at 38% 32%, #12224a 0%, #0a1330 62%, #070d22 100%)",
        // Dark drop shadow to lift the porthole off the sky, plus a faint navy
        // ambient glow around the rim.
        boxShadow: "0 8px 22px rgba(6,10,24,0.40), 0 0 18px rgba(12,22,60,0.25)",
      }}
    />
  );
}

// The globe's right edge, per character row, in px from the viewport left.
//
// NOT the ideal circle `cx + sqrt(R² - y²)`: the globe is characters, so its
// disc is a staircase, and at this size the right edge is dead flat for the five
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
    let last = -1;
    for (let i = cols - 1; i >= 0 && last < 0; i--) {
      for (const g of grids) {
        const ch = g[j]?.[i];
        if (ch && ch !== " ") {
          last = i;
          break;
        }
      }
    }
    edges.push({
      top: box.top + j * rowH,
      bottom: box.top + (j + 1) * rowH,
      // -Infinity => this row paints nothing at all; it constrains nothing.
      x: last < 0 ? -Infinity : box.left + (last + 1) * cellW,
    });
  }
  return edges;
}

// Left-aligns each line to the globe's silhouette instead of to a straight edge.
//
// Every line is laid out flush-left against the same column edge, then shifted
// horizontally by transform only — never by anything that reflows — so the
// frozen line breaks are guaranteed to survive. Lines beside the disc's waist
// sit farthest right; lines toward its poles slide left into the space the curve
// gives back. That stagger is the whole effect.
function useArcAlign({ groupRef, colRef, globeRef, enabled }) {
  useLayoutEffect(() => {
    const apply = () => {
      const group = groupRef.current;
      const col = colRef.current;
      const globe = globeRef.current;
      // The lines are exactly the column's children, in order — no ref array.
      const lines = col ? Array.from(col.children) : [];
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
      const colLeft = col.getBoundingClientRect().left;

      lines.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const inset = INK_INSET[i] ?? 0;
        const top = r.top + inset;
        const bot = r.bottom - inset;
        // Closest approach of the globe's edge over the rows this line spans —
        // that's what has to be cleared. Sampling only the line's center row
        // instead lets a tall row's corner reach past the edge it was judged by.
        let edgeX = -Infinity;
        for (const e of edges) {
          const overlaps = BAND_RULE
            ? e.bottom > top && e.top < bot
            : e.bottom > (top + bot) / 2 && e.top <= (top + bot) / 2;
          if (overlaps) edgeX = Math.max(edgeX, e.x);
        }
        // A line clear of the disc's rows entirely has nothing to hug.
        if (!Number.isFinite(edgeX)) edgeX = cx;
        el.style.transform = `translateX(${edgeX + GAP - colLeft}px)`;
      });

      // The last line is the full-width links row; justify-between pins the
      // social icons to its right edge. Match that edge to the widest copy line
      // (the "and" line) rather than letting the row hug the arc on its own, so
      // the icons finish exactly under the subtitle's end. Resume still rides
      // the arc at that line's left.
      if (lines.length > 1) {
        const links = lines[lines.length - 1];
        let widest = lines[0];
        for (let i = 1; i < lines.length - 1; i++) {
          if (lines[i].getBoundingClientRect().right > widest.getBoundingClientRect().right) {
            widest = lines[i];
          }
        }
        links.style.transform = widest.style.transform;
      }

      if (OPTICAL_CENTER) {
        // Ink extent, not layout box: the disc's rim .. rightmost shifted line.
        let paintedRight = -Infinity;
        for (const el of lines) {
          paintedRight = Math.max(paintedRight, el.getBoundingClientRect().right);
        }
        const paintedLeft = cx - GLOBE_RADIUS;
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
  }, [groupRef, colRef, globeRef, enabled]);
}

export default function Hero({ accent, flash }) {
  const groupRef = useRef(null);
  const colRef = useRef(null);
  const globeRef = useRef(null);
  // md- hides the globe entirely, so there's no arc to align to down there.
  const enabled = useCallback(
    () => window.matchMedia("(min-width: 768px)").matches,
    [],
  );

  useArcAlign({ groupRef, colRef, globeRef, enabled });

  return (
    <motion.div
      className="flex min-h-screen flex-col items-center justify-center gap-4 text-main-text"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h1 className="w-full text-2xl font-bold leading-[1.05] text-main-text sm:text-3xl md:text-center md:text-[38px] lg:text-[46px]">
        Greetings Earthling, I&apos;m{" "}
        <ScrambledText text="Aidan" className="gradient-text-header" />
      </h1>

      {/* below md: plain left-aligned stack, globe hidden. */}
      <div className="flex w-full flex-col items-start gap-9 md:hidden">
        <p className="text-body-text max-w-[28rem] text-lg font-medium sm:text-xl">
          {COPY_LINES.join(" ")}
        </p>
        <div className="flex items-center gap-5">
          <HeroLinks flash={flash} />
        </div>
      </div>

      {/* md+: globe + copy + links as one centered block, copy on the arc. */}
      <div
        ref={groupRef}
        className="hidden w-full items-center justify-center md:flex"
      >
        <div ref={globeRef} className="relative shrink-0">
          <GlobePorthole />
          <div className="relative">
            <AsciiGlobe
              color={accent}
              landColor={PORTHOLE_LAND(accent)}
              oceanColor={PORTHOLE_OCEAN}
              oceanOpacity={PORTHOLE_OCEAN_OPACITY}
              rows={GLOBE_ROWS}
              fontPx={GLOBE_FONT_PX}
            />
          </div>
        </div>
        <div ref={colRef} className="flex flex-col items-start">
          {COPY_LINES.map((line) => (
            <div
              key={line}
              className="text-body-text text-xl font-medium whitespace-nowrap"
            >
              {line}
            </div>
          ))}
          <div className="mt-6 flex w-full gap-5 items-center">
            <HeroLinks flash={flash} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
