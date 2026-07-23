"use client";

// PROTOTYPE — throwaway copy of components/Hero.js with the globe block swapped
// for <GlobeTreatment>, so every variant shares the exact production layout and
// only the globe's look changes. Keep in sync with Hero.js if that moves; delete
// this once a treatment wins and is folded back into the real Hero.

import { useCallback, useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import RewardLink from "@/components/RewardLink";
import ScrambledText from "@/components/ScrambledText";
import FileDownload from "@/icons/FileDownload";
import FooterLinkedin from "@/icons/FooterLinkedin";
import FooterGithub from "@/icons/FooterGithub";
import GlobeTreatment from "./GlobeTreatment";

const GLOBE_ROWS = 15;
const GLOBE_FONT_PX = 9;
const GLOBE_RADIUS = ((GLOBE_ROWS - 1) / 2) * GLOBE_FONT_PX;
const GAP = 75;
const BAND_RULE = true;
const INK_INSET = [4, 4, 0];
const OPTICAL_CENTER = true;

const COPY_LINES = [
  "I build automation-first platforms and",
  "developer infrastructure for AI.",
];

function HeroLinks({ flash }) {
  return (
    <>
      <div className="text-outline-gray flex rounded-xl text-lg font-semibold transition-transform duration-100 md:hover:scale-105">
        <RewardLink
          href="https://drive.google.com/file/d/1YzK4a7QVQ6JAAOIF_WcgJk7MnkVXQfzC/view?usp=sharing"
          rewardId="resume-lab"
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
          rewardId="linkedin-lab"
          aria-label="LinkedIn"
          className="md:hover:translate-y-[-1px]"
        >
          <FooterLinkedin className="h-8 w-8 transition-colors duration-100 md:hover:text-main-text-hover" />
        </RewardLink>
        <RewardLink
          href="https://github.com/chieaid24"
          target="_blank"
          rewardId="github-lab"
          aria-label="GitHub"
          className="md:hover:translate-y-[-1px]"
        >
          <FooterGithub className="h-8 w-8 transition-colors duration-100 md:hover:text-main-text-hover" />
        </RewardLink>
      </div>
    </>
  );
}

function readGlobeEdge(globeEl) {
  const pres = globeEl.querySelectorAll("pre");
  if (pres.length < 2) return null;
  const grids = [...pres].map((p) => p.textContent.split("\n"));
  const rowCount = Math.max(...grids.map((g) => g.length));
  const cols = Math.max(...grids.flat().map((r) => r.length));
  if (!rowCount || !cols) return null;

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
      x: last < 0 ? -Infinity : box.left + (last + 1) * cellW,
    });
  }
  return edges;
}

function useArcAlign({ groupRef, colRef, globeRef, enabled }) {
  useLayoutEffect(() => {
    const apply = () => {
      const group = groupRef.current;
      const col = colRef.current;
      const globe = globeRef.current;
      const lines = col ? Array.from(col.children) : [];
      if (!group || !col || !globe || lines.length === 0) return;

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
        let edgeX = -Infinity;
        for (const e of edges) {
          const overlaps = BAND_RULE
            ? e.bottom > top && e.top < bot
            : e.bottom > (top + bot) / 2 && e.top <= (top + bot) / 2;
          if (overlaps) edgeX = Math.max(edgeX, e.x);
        }
        if (!Number.isFinite(edgeX)) edgeX = cx;
        el.style.transform = `translateX(${edgeX + GAP - colLeft}px)`;
      });

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
        let paintedRight = -Infinity;
        for (const el of lines) {
          paintedRight = Math.max(paintedRight, el.getBoundingClientRect().right);
        }
        const paintedLeft = cx - GLOBE_RADIUS;
        const gr = group.getBoundingClientRect();
        const shift = gr.left + gr.width / 2 - (paintedLeft + paintedRight) / 2;
        group.style.transform = `translateX(${shift}px)`;
      }
    };

    apply();

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

export default function HeroLab({ accent, flash, variant, mode }) {
  const groupRef = useRef(null);
  const colRef = useRef(null);
  const globeRef = useRef(null);
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
      transition={{ duration: 0.4 }}
    >
      <h1 className="w-full text-2xl font-bold leading-[1.05] text-main-text sm:text-3xl md:text-center md:text-[38px] lg:text-[46px]">
        Greetings Earthling, I&apos;m{" "}
        <ScrambledText text="Aidan" className="gradient-text-header" />
      </h1>

      <div className="flex w-full flex-col items-start gap-9 md:hidden">
        <p className="text-body-text max-w-[28rem] text-lg font-medium sm:text-xl">
          {COPY_LINES.join(" ")}
        </p>
        <div className="flex items-center gap-5">
          <HeroLinks flash={flash} />
        </div>
      </div>

      <div
        ref={groupRef}
        className="hidden w-full items-center justify-center md:flex"
      >
        <div ref={globeRef} className="relative shrink-0">
          <GlobeTreatment
            variant={variant}
            mode={mode}
            accent={accent}
            rows={GLOBE_ROWS}
            fontPx={GLOBE_FONT_PX}
          />
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
