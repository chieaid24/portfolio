"use client";

// PROTOTYPE — throwaway. Delete once the hero shaping is settled.
//
// Question: instead of copy hard-left and the globe hard-right with ~130px of
// dead space between them, what if the globe + copy + links read as ONE centered
// block, with the copy's left edge left-aligned *along the globe's arc* rather
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
  { key: "shaped", name: "Shaped (centered block, globe left, copy on the arc)" },
  { key: "stacked", name: "Stacked (no globe, title / description / links centered)" },
  { key: "inline", name: "Inline (no globe, description + links one centered line)" },
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

// Backdrop treatments behind the globe — it's sparse ASCII on a busy starfield,
// so it barely reads. Each is a creative way to lift it off the field. Cycled
// with the bg pill (?globebg=), independent of the hero variant.
export const GLOBE_BACKDROPS = [
  { key: "none" },
  { key: "glow" },
  { key: "scrim" },
  { key: "glass" },
  { key: "orbit" },
  { key: "reticle" },
];

export function useGlobeBackdrop() {
  const [bg, setBg] = useState("none");
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("globebg");
    if (v && GLOBE_BACKDROPS.some((x) => x.key === v)) setBg(v);
  }, []);
  const select = useCallback((v) => {
    setBg(v);
    const url = new URL(window.location.href);
    if (v === "none") url.searchParams.delete("globebg");
    else url.searchParams.set("globebg", v);
    window.history.replaceState(null, "", url);
  }, []);
  return [bg, select];
}

// ---------------------------------------------------------------------------
// tunables — the whole point of the prototype
// ---------------------------------------------------------------------------

// Globe size. Fixed by choice: the copy never resizes it. The disc's diameter is
// (ROWS - 1) * FONT_PX = 126px. ROWS is odd so the disc has a real center row —
// the vertical center lands on a row, not between two, which reads as a rounder,
// balanced circle. FONT_PX stays ~9 so the ASCII texture reads the same as before.
const GLOBE_ROWS = 15;
const GLOBE_FONT_PX = 9;
const GLOBE_RADIUS = ((GLOBE_ROWS - 1) / 2) * GLOBE_FONT_PX;

// Clearance between a line's left edge and the globe's edge.
const GAP = 75;

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

// A layer painted behind the globe glyphs to lift them off the starfield.
//
// Every treatment hugs the globe via `absolute -inset-*` on the globe's own box
// — NOT a big fixed circle. There's only ~79px above to the title and ~53px
// right to the copy, so anything larger clips through them. `-inset-2` (8px) is
// the ceiling that stays clear of both. pointer-events-none; no <pre>, and being
// absolute it never grows the globe's box, so the arc measurement is untouched.
function GlobeBackdrop({ kind, accent }) {
  switch (kind) {
    // Additive: a soft accent bloom, like the globe is lit from within.
    case "glow":
      return (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-full blur-[6px]"
          style={{
            color: accent,
            background:
              "radial-gradient(circle, color-mix(in srgb, currentColor 60%, transparent) 0%, transparent 70%)",
          }}
        />
      );
    // Subtractive: a dark well that mutes the stars right behind the glyphs.
    case "scrim":
      return (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 48%, transparent 74%)",
          }}
        />
      );
    // Surface: a frosted plate hugging the globe, field blurred behind it.
    case "glass":
      return (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-full bg-black/25 backdrop-blur-[3px]"
        />
      );
    // Structural: concentric accent rings, an orbit the globe sits inside.
    case "orbit":
      return (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1"
          style={{ color: accent }}
        >
          <div
            className="absolute inset-0 rounded-full border"
            style={{
              borderColor: "color-mix(in srgb, currentColor 60%, transparent)",
            }}
          />
          <div
            className="absolute inset-[14px] rounded-full border"
            style={{
              borderColor: "color-mix(in srgb, currentColor 28%, transparent)",
            }}
          />
        </div>
      );
    // Technical: a dashed reticle + faint crosshair, HUD scanner framing.
    case "reticle":
      return (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1"
          style={{ color: accent }}
        >
          <div
            className="absolute inset-0 rounded-full border border-dashed opacity-75"
            style={{ borderColor: "currentColor" }}
          />
          <div
            className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 opacity-25"
            style={{ background: "currentColor" }}
          />
          <div
            className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 opacity-25"
            style={{ background: "currentColor" }}
          />
        </div>
      );
    default:
      return null;
  }
}

// Buttons-only switcher for the globe backdrop, bottom-left so it clears the
// centered variant pill. No arrow-key handler on purpose — the variant switcher
// owns ←/→, and two listeners would both fire.
function GlobeBackdropSwitcher({ options, current, onSelect }) {
  if (process.env.NODE_ENV === "production") return null;
  const index = Math.max(
    0,
    options.findIndex((o) => o.key === current),
  );
  const cycle = (step) =>
    onSelect(options[(index + step + options.length) % options.length].key);
  const btn =
    "flex h-5 w-5 items-center justify-center rounded-full text-sm leading-none text-black/50 transition-colors hover:bg-black/10 hover:text-black";

  return (
    <div className="pointer-events-none fixed bottom-4 left-20 z-50">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-white/90 px-1 py-0.5 font-mono text-[11px] text-black shadow-md ring-1 ring-black/10 backdrop-blur">
        <span className="pl-1 pr-0.5 text-black/40">bg</span>
        <button className={btn} onClick={() => cycle(-1)} aria-label="Previous globe backdrop">
          ‹
        </button>
        <span className="min-w-[3.5rem] text-center font-medium">
          {options[index].key}
        </span>
        <button className={btn} onClick={() => cycle(1)} aria-label="Next globe backdrop">
          ›
        </button>
      </div>
    </div>
  );
}

function ShapedHero({ accent, flash }) {
  const groupRef = useRef(null);
  const colRef = useRef(null);
  const globeRef = useRef(null);
  const [globeBg, setGlobeBg] = useGlobeBackdrop();
  // md- hides the globe entirely, so there's no arc to align to down there.
  const enabled = useCallback(
    () => window.matchMedia("(min-width: 768px)").matches,
    [],
  );

  useArcAlign({ groupRef, colRef, globeRef, enabled });

  return (
    <>
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

      {/* md+: globe + copy + links as one centered block, copy on the arc. */}
      <div
        ref={groupRef}
        className="hidden w-full items-center justify-center md:flex"
      >
        <div ref={globeRef} className="relative shrink-0">
          <GlobeBackdrop kind={globeBg} accent={accent} />
          <div className="relative [&_pre:first-child]:opacity-60 dark:[&_pre:first-child]:opacity-35">
            <AsciiGlobe color={accent} rows={GLOBE_ROWS} fontPx={GLOBE_FONT_PX} />
          </div>
        </div>
        <div ref={colRef} className="flex flex-col items-start">
          {COPY_LINES.map((line, i) => (
            <div
              key={line}
              className="text-body-text text-xl font-medium whitespace-nowrap"
            >
              {line}
            </div>
          ))}
          <div className="mt-6 flex items-center gap-5">
            <HeroLinks flash={flash} />
          </div>
        </div>
      </div>
    </motion.div>
    <GlobeBackdropSwitcher
      options={GLOBE_BACKDROPS}
      current={globeBg}
      onSelect={setGlobeBg}
    />
    </>
  );
}

// Shared centered title for the globe-less variants.
function CenteredTitle() {
  return (
    <h1 className="w-full text-2xl font-bold leading-[1.05] text-main-text sm:text-3xl md:text-[38px] lg:text-[46px]">
      Greetings Earthling, I&apos;m{" "}
      <ScrambledText text="Aidan" className="gradient-text-header" />
    </h1>
  );
}

// No globe. Title, description, and links each on their own centered line.
function StackedHero({ flash }) {
  return (
    <motion.div
      className="flex min-h-screen flex-col items-center justify-center gap-6 text-center text-main-text"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <CenteredTitle />
      <p className="text-body-text max-w-[34rem] text-lg font-medium sm:text-xl">
        {COPY_LINES.join(" ")}
      </p>
      <div className="flex items-center justify-center gap-5">
        <HeroLinks flash={flash} />
      </div>
    </motion.div>
  );
}

// No globe. Description and links share one centered line (wraps below md).
function InlineHero({ flash }) {
  return (
    <motion.div
      className="flex min-h-screen flex-col items-center justify-center gap-6 text-center text-main-text"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <CenteredTitle />
      {/* lg+: description (two lines) and links share one centered row; below lg they stack. */}
      <div className="flex flex-col items-center justify-center gap-4 lg:flex-row lg:gap-6">
        <p className="text-body-text max-w-[26rem] text-lg font-medium sm:text-xl">
          {COPY_LINES.join(" ")}
        </p>
        <div className="flex items-center gap-5">
          <HeroLinks flash={flash} />
        </div>
      </div>
    </motion.div>
  );
}

export default function HeroVariant({ variant, accent, flash }) {
  if (variant === "shaped") return <ShapedHero accent={accent} flash={flash} />;
  if (variant === "stacked") return <StackedHero flash={flash} />;
  if (variant === "inline") return <InlineHero flash={flash} />;
  return null;
}
