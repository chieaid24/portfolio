"use client";

// PROTOTYPE — throwaway. Delete once a hero layout wins.
//
// Question: what should the hero look like when the title spans the full width
// and the globe widget drops below it — horizontal, lower, sitting beside the
// description and the buttons?
//
// Four variants on the real "/" route, gated by ?variant=. "current" renders the
// existing 2-col hero so it can be compared side by side. Switcher: PrototypeSwitcher.

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import RewardLink from "@/components/RewardLink";
import ScrambledText from "@/components/ScrambledText";
import FileDownload from "@/icons/FileDownload";
import FooterLinkedin from "@/icons/FooterLinkedin";
import FooterGithub from "@/icons/FooterGithub";
import FooterEmail from "@/icons/FooterEmail";
import { useMoney } from "@/lib/money-context";
import {
  AsciiGlobe,
  LOCATION,
  getLandMask,
  maskIsLand,
  useLocalTime,
} from "@/components/MissionControl";

export const HERO_VARIANTS = [
  { key: "current", name: "Current (2-col, globe right)" },
  { key: "A", name: "Instrument panel" },
  { key: "B", name: "Bare rail (globe right)" },
  { key: "C", name: "Telemetry strip" },
  { key: "D", name: "Flat world band" },
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
// shared pieces (deliberately NOT a shared layout — each variant lays itself out)
// ---------------------------------------------------------------------------

const DESCRIPTION =
  "I build automation-first platforms and developer infrastructure for AI.";

const COORDS = `${Math.abs(LOCATION.lat).toFixed(2)}°N ${Math.abs(LOCATION.lon).toFixed(2)}°W`;

// Cursor-follow flash on the resume button (same easing as the live page).
function useCursorFlash() {
  const raf = useRef(0);
  const last = useRef(0);
  const el = useRef(null);
  const rect = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });

  const tick = useCallback((now) => {
    const node = el.current;
    if (!node) {
      raf.current = 0;
      return;
    }
    const dt = Math.min(now - last.current, 64);
    last.current = now;
    const k = 1 - Math.pow(0.75, dt / 16.6667);
    pos.current.x += (target.current.x - pos.current.x) * k;
    pos.current.y += (target.current.y - pos.current.y) * k;
    node.style.setProperty("--flash-x", `${pos.current.x}px`);
    node.style.setProperty("--flash-y", `${pos.current.y}px`);
    raf.current = requestAnimationFrame(tick);
  }, []);

  const onMouseEnter = (e) => {
    const node = e.currentTarget;
    const r = node.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.current = node;
    rect.current = r;
    target.current = { x, y };
    pos.current = { x, y };
    node.style.setProperty("--flash-x", `${x}px`);
    node.style.setProperty("--flash-y", `${y}px`);
    node.style.setProperty("--flash-active", "var(--resume-flash-opacity, 0.15)");
    node.style.setProperty("--flash-size", "1");
    if (!raf.current) {
      last.current = performance.now();
      raf.current = requestAnimationFrame(tick);
    }
  };
  const onMouseMove = (e) => {
    if (!rect.current) return;
    target.current.x = e.clientX - rect.current.left;
    target.current.y = e.clientY - rect.current.top;
  };
  const onMouseLeave = () => {
    if (el.current) {
      el.current.style.setProperty("--flash-active", "0");
      el.current.style.setProperty("--flash-size", "0");
    }
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = 0;
    el.current = null;
    rect.current = null;
  };
  return { onMouseEnter, onMouseMove, onMouseLeave };
}

function ResumeButton() {
  const flash = useCursorFlash();
  return (
    <div className="text-outline-gray flex rounded-xl text-lg font-semibold transition-transform duration-100 md:hover:scale-105">
      <RewardLink
        href="https://drive.google.com/file/d/1YzK4a7QVQ6JAAOIF_WcgJk7MnkVXQfzC/view?usp=sharing"
        rewardId="resume"
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-follow-btn border-outline-gray rounded-lg border-2 transition-colors duration-100 md:hover:border-main-text/75 md:hover:text-main-text/75"
        {...flash}
      >
        <div className="inline-flex items-center gap-2 px-2 py-1 md:px-3 md:py-1">
          <span>Resume</span>
          <FileDownload className="text-dark-grey-text h-5 w-5" />
        </div>
      </RewardLink>
    </div>
  );
}

function SocialLinks() {
  return (
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
  );
}

// Full-bleed title. Each variant scales it, but they all let it run the width.
function HeroTitle({ className = "" }) {
  return (
    <h1
      className={
        "w-full font-bold leading-[1.05] text-main-text " + className
      }
    >
      Greetings Earthling, I&apos;m{" "}
      <ScrambledText text="Aidan" className="gradient-text-header" />
    </h1>
  );
}

function useAccent() {
  const { highlightHex } = useMoney();
  return highlightHex || "#ff5e5e";
}

// ---------------------------------------------------------------------------
// AsciiWorldMap — the globe unrolled: a wide, short equirectangular ASCII band
// that pans east forever, with the beacon riding along on Waterloo. Used by D.
// ---------------------------------------------------------------------------

const MAP_RAMP = ".,:;=+*#%@";
const MAP_PAN = 2.4; // deg/s
const MAP_REDRAW_MS = 110;

function AsciiWorldMap({ color, rows = 13, cols = 104, fontPx = 8 }) {
  const oceanRef = useRef(null);
  const landRef = useRef(null);
  const pinRef = useRef(null);
  const beaconRef = useRef(null);
  const lonOffset = useRef(0);
  const drag = useRef(null);

  useEffect(() => {
    const mask = getLandMask();
    const oceanPre = oceanRef.current;
    const landPre = landRef.current;
    const pinPre = pinRef.current;
    const beaconPre = beaconRef.current;
    if (!oceanPre || !landPre || !pinPre || !beaconPre) return;

    // Crop the poles — they're empty ocean/ice and just make the band taller.
    const LAT_TOP = 78;
    const LAT_BOT = -58;

    let raf;
    let last = performance.now();
    let lastDraw = 0;
    const frame = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!drag.current) lonOffset.current += MAP_PAN * dt;
      if (!drag.current && now - lastDraw < MAP_REDRAW_MS) {
        raf = requestAnimationFrame(frame);
        return;
      }
      lastDraw = now;

      const off = lonOffset.current;
      const ocean = [];
      const land = [];
      for (let j = 0; j < rows; j++) {
        const lat = LAT_TOP - (j / (rows - 1)) * (LAT_TOP - LAT_BOT);
        let oRow = "";
        let lRow = "";
        for (let i = 0; i < cols; i++) {
          const lon = ((((i / cols) * 360 - 180 + off) % 360) + 540) % 360 - 180;
          if (maskIsLand(mask, lat, lon)) {
            // Fake sun terminator sweeping with the pan, so the band has depth.
            const b =
              0.3 + 0.7 * Math.max(0, Math.cos((lon - (-off % 360)) * (Math.PI / 180)));
            lRow += MAP_RAMP[Math.round(b * (MAP_RAMP.length - 1))];
            oRow += " ";
          } else {
            oRow += ".";
            lRow += " ";
          }
        }
        ocean.push(oRow);
        land.push(lRow);
      }

      const pinRows = new Array(rows).fill(" ".repeat(cols));
      const beaconRows = new Array(rows).fill(" ".repeat(cols));
      const put = (arr, r, c, ch) =>
        (arr[r] = arr[r].slice(0, c) + ch + arr[r].slice(c + 1));
      const pinLon = ((((LOCATION.lon - off + 180) % 360) + 360) % 360) - 180;
      const pc = Math.round(((pinLon + 180) / 360) * cols) % cols;
      const pr = Math.round(
        ((LAT_TOP - LOCATION.lat) / (LAT_TOP - LAT_BOT)) * (rows - 1),
      );
      if (pr >= 0 && pr < rows) {
        put(pinRows, pr, pc, "@");
        put(land, pr, pc, " ");
        put(ocean, pr, pc, " ");
        if (pr - 1 >= 0) {
          put(beaconRows, pr - 1, pc, "v");
          put(land, pr - 1, pc, " ");
          put(ocean, pr - 1, pc, " ");
        }
      }

      oceanPre.textContent = ocean.join("\n");
      landPre.textContent = land.join("\n");
      pinPre.textContent = pinRows.join("\n");
      beaconPre.textContent = beaconRows.join("\n");
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [rows, cols]);

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = e.clientX;
  };
  const onPointerMove = (e) => {
    if (drag.current == null) return;
    lonOffset.current -= (e.clientX - drag.current) * 0.4;
    drag.current = e.clientX;
  };
  const endDrag = () => {
    drag.current = null;
  };

  const preStyle = {
    color,
    fontSize: `${fontPx}px`,
    lineHeight: `${fontPx}px`,
  };
  return (
    <div
      className="relative w-fit cursor-grab touch-none select-none active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      aria-label={`Scrolling world map with a pin on ${LOCATION.label}`}
      role="img"
    >
      <pre aria-hidden="true" ref={oceanRef} className="font-mono opacity-30" style={preStyle} />
      <pre
        aria-hidden="true"
        ref={landRef}
        className="absolute inset-0 font-mono"
        style={preStyle}
      />
      <pre
        aria-hidden="true"
        ref={pinRef}
        className="pointer-events-none absolute inset-0 font-mono font-bold"
        style={{ ...preStyle, color: "#ffd24a" }}
      />
      <motion.pre
        aria-hidden="true"
        ref={beaconRef}
        className="pointer-events-none absolute inset-0 font-mono font-bold"
        style={{ ...preStyle, color: "#ffd24a" }}
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 1.6, repeat: Infinity, times: [0, 0.12, 1] }}
      />
    </div>
  );
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 1 },
};

// ---------------------------------------------------------------------------
// A — Instrument panel: title up top, everything else inside one wide bordered
// console below it. Text | globe | telemetry, divided by rules.
// ---------------------------------------------------------------------------
function VariantA() {
  const accent = useAccent();
  const { time, zone } = useLocalTime();
  return (
    <motion.div
      className="flex min-h-screen flex-col justify-center gap-10 py-24"
      {...fadeIn}
    >
      <HeroTitle className="text-2xl sm:text-3xl md:text-[34px] lg:text-[38px]" />
      <div className="border-outline-darker-gray bg-background/40 flex w-full flex-col overflow-hidden rounded-2xl border backdrop-blur-md md:flex-row md:items-stretch">
        <div className="flex flex-1 flex-col justify-center gap-5 px-6 py-7 md:px-8">
          <p className="text-body-text max-w-[34rem] text-lg font-medium sm:text-xl">
            {DESCRIPTION}
          </p>
          <div className="flex items-center gap-5">
            <ResumeButton />
            <SocialLinks />
          </div>
        </div>
        <div className="border-outline-darker-gray/60 hidden shrink-0 items-center border-l px-6 md:flex">
          <AsciiGlobe color={accent} rows={17} fontPx={10} />
        </div>
        <div className="border-outline-darker-gray/60 hidden shrink-0 flex-col justify-center gap-3 border-l px-6 font-mono md:flex">
          <div>
            <div className="text-body-text/50 text-[9px] tracking-[0.18em] uppercase">
              Local time
            </div>
            <div className="text-main-text text-lg tabular-nums">
              {time}
              {zone && <span className="text-body-text/45 ml-1 text-[10px]">{zone}</span>}
            </div>
          </div>
          <div>
            <div className="text-body-text/50 text-[9px] tracking-[0.18em] uppercase">
              Station
            </div>
            <div className="text-main-text text-xs">{LOCATION.label}</div>
            <div className="text-body-text/50 text-[10px] tabular-nums">{COORDS}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// B — Bare rail: no card at all. Copy on the left, globe on the RIGHT.
// Chrome-free, tight stack. The station/clock line under the globe is commented
// out for now — uncomment the block below to bring the readout back.
// ---------------------------------------------------------------------------
function VariantB() {
  const accent = useAccent();
  const { time, zone } = useLocalTime(); // only used by the commented-out clock line
  return (
    <motion.div
      className="flex min-h-[78vh] flex-col justify-center gap-4 py-16"
      {...fadeIn}
    >
      <HeroTitle className="text-2xl sm:text-3xl md:text-[34px] lg:text-[38px]" />
      <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between md:gap-10">
        <div className="flex flex-col items-start gap-6">
          <p className="text-body-text max-w-[28rem] text-lg font-medium sm:text-xl">
            {DESCRIPTION}
          </p>
          <div className="flex items-center gap-5">
            <ResumeButton />
            <SocialLinks />
          </div>
        </div>
        {/* No card behind the globe here, so the 35%-opacity ocean layer washes
            out on the light sky — push it up in light mode only. */}
        <div className="hidden shrink-0 flex-col items-end gap-1.5 [&_pre:first-child]:opacity-60 md:flex dark:[&_pre:first-child]:opacity-35">
          <AsciiGlobe color={accent} rows={13} fontPx={9} />
          {/*
          <div className="flex items-baseline gap-2 whitespace-nowrap font-mono">
            <span className="text-body-text/50 text-[9px] tracking-[0.18em] uppercase">
              {LOCATION.label}
            </span>
            <span className="text-main-text text-sm tabular-nums">{time}</span>
            {zone && <span className="text-body-text/45 text-[9px]">{zone}</span>}
          </div>
          */}
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// C — Telemetry strip: title + copy + buttons read as a normal stack; the globe
// shrinks into a thin full-width instrument rail pinned to the bottom of the fold.
// ---------------------------------------------------------------------------
function VariantC() {
  const accent = useAccent();
  const { time, zone } = useLocalTime();
  const Cell = ({ label, value }) => (
    <div className="flex flex-col">
      <span className="text-body-text/45 text-[9px] tracking-[0.18em] uppercase">
        {label}
      </span>
      <span className="text-main-text text-xs tabular-nums">{value}</span>
    </div>
  );
  return (
    <motion.div className="flex min-h-screen flex-col py-24" {...fadeIn}>
      <div className="flex flex-1 flex-col justify-center gap-6">
        <HeroTitle className="text-2xl sm:text-3xl md:text-[34px] lg:text-[38px]" />
        <p className="text-body-text max-w-[38rem] text-lg font-medium sm:text-xl">
          {DESCRIPTION}
        </p>
        <div className="flex items-center gap-5">
          <ResumeButton />
          <SocialLinks />
        </div>
      </div>
      <div className="border-outline-darker-gray/70 bg-background/40 mt-10 hidden w-full items-center gap-6 rounded-xl border px-5 py-2.5 backdrop-blur-md md:flex">
        <AsciiGlobe color={accent} rows={13} fontPx={9} />
        <div className="border-outline-darker-gray/50 h-8 border-l" />
        <div className="flex flex-1 items-center justify-between font-mono">
          <Cell label="Station" value={LOCATION.label} />
          <Cell label="Local time" value={`${time}${zone ? ` ${zone}` : ""}`} />
          <Cell label="Coords" value={COORDS} />
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: accent }}
            />
            <span className="text-body-text/60 text-[10px] tracking-[0.18em] uppercase">
              Online
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// D — Flat world band: the globe unrolled into a wide scrolling ASCII map that
// sits beside the copy. The clock rides under the band, right-aligned.
// ---------------------------------------------------------------------------
function VariantD() {
  const accent = useAccent();
  const { time, zone } = useLocalTime();
  return (
    <motion.div
      className="flex min-h-screen flex-col justify-center gap-12 py-24"
      {...fadeIn}
    >
      <HeroTitle className="text-2xl sm:text-3xl md:text-[34px] lg:text-[38px]" />
      {/* The band is a horizon under the title: full width, always panning east. */}
      <div className="hidden w-full flex-col gap-2 md:flex">
        <div className="border-outline-darker-gray/60 bg-background/30 overflow-hidden rounded-xl border px-4 py-3 backdrop-blur-md">
          <AsciiWorldMap color={accent} rows={13} cols={138} fontPx={8} />
        </div>
        <div className="flex items-baseline justify-between px-1 font-mono">
          <span className="text-body-text/40 text-[9px] tracking-[0.18em] uppercase">
            {LOCATION.label} · {COORDS}
          </span>
          <span className="text-main-text text-sm tabular-nums">
            {time}
            {zone && <span className="text-body-text/45 ml-1 text-[9px]">{zone}</span>}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body-text max-w-[26rem] text-lg font-medium sm:text-xl">
          {DESCRIPTION}
        </p>
        <div className="flex shrink-0 items-center gap-5">
          <ResumeButton />
          <SocialLinks />
        </div>
      </div>
    </motion.div>
  );
}

export default function HeroVariant({ variant }) {
  if (variant === "A") return <VariantA />;
  if (variant === "B") return <VariantB />;
  if (variant === "C") return <VariantC />;
  if (variant === "D") return <VariantD />;
  return null;
}
