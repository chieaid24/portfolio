"use client";

// Compact ground-station widget for the hero's right side: an ASCII globe that
// orthographically projects the real coastlines onto a text grid, with a
// blinking beacon at LOCATION, over a live local-time readout. Space/telemetry
// styling to match the site's starfield.

import { useEffect, useRef, useState } from "react";
import { feature } from "topojson-client";
import { geoEquirectangular, geoPath } from "d3-geo";
import land110m from "world-atlas/land-110m.json";
import { motion } from "framer-motion";
import { useMoney } from "@/lib/money-context";

// Real coastlines (coarse 110m set → naturally low-poly). Decoded once.
const LAND_GEO = feature(land110m, land110m.objects.land);

// My location — the beacon pin + local clock. Swap lat/lon/tz to relocate.
export const LOCATION = {
  label: "Waterloo, ON",
  lat: 43.4643,
  lon: -80.5204,
  tz: "America/Toronto",
};

// Ticking wall clock, re-renders every second. Starts null so the server and
// first client render agree (a real time would differ → hydration mismatch);
// the real time is set on mount.
function useNow() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// Live "HH:MM" + zone abbreviation for LOCATION. "--:--" until mounted.
export function useLocalTime() {
  const now = useNow();
  if (!now) return { time: "--:--", zone: "" };
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: LOCATION.tz,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZoneName: "short",
  }).formatToParts(now);
  const part = (t) => parts.find((p) => p.type === t)?.value ?? "";
  return { time: `${part("hour")}:${part("minute")}`, zone: part("timeZoneName") };
}

const cardBase =
  "border-outline-darker-gray bg-background/40 relative w-full overflow-hidden rounded-2xl border backdrop-blur-md";

// Land lookup raster: LAND_GEO painted once onto an offscreen canvas via an
// equirectangular projection, then read back into a bitmask — per-frame land
// tests become an array index instead of a geoContains polygon walk.
const MASK_W = 720;
const MASK_H = 360;
// Drop connected land blobs smaller than this (mask px) so tiny islands don't
// flicker on/off across the coarse character grid. Continents stay intact.
const MIN_ISLAND_PX = 200;
let landMaskCache = null;

// Flood-fill (8-connectivity) each land component once; zero out any smaller
// than minPx. Removes speckly little islands while leaving big landmasses whole.
function pruneSmallLand(mask, w, h, minPx) {
  const seen = new Uint8Array(w * h);
  const stack = [];
  const comp = [];
  for (let start = 0; start < mask.length; start++) {
    if (mask[start] !== 1 || seen[start]) continue;
    stack.length = 0;
    comp.length = 0;
    stack.push(start);
    seen[start] = 1;
    while (stack.length) {
      const idx = stack.pop();
      comp.push(idx);
      const cx = idx % w;
      const cy = (idx / w) | 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const nIdx = ny * w + nx;
          if (mask[nIdx] === 1 && !seen[nIdx]) {
            seen[nIdx] = 1;
            stack.push(nIdx);
          }
        }
      }
    }
    if (comp.length < minPx) {
      for (let k = 0; k < comp.length; k++) mask[comp[k]] = 0;
    }
  }
}

export function getLandMask() {
  if (!landMaskCache) {
    const canvas = document.createElement("canvas");
    canvas.width = MASK_W;
    canvas.height = MASK_H;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const projection = geoEquirectangular()
      .scale(MASK_W / (2 * Math.PI))
      .translate([MASK_W / 2, MASK_H / 2]);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    geoPath(projection, ctx)(LAND_GEO);
    ctx.fill();
    const img = ctx.getImageData(0, 0, MASK_W, MASK_H).data;
    landMaskCache = new Uint8Array(MASK_W * MASK_H);
    for (let i = 0; i < landMaskCache.length; i++)
      landMaskCache[i] = img[i * 4 + 3] > 127 ? 1 : 0;
    pruneSmallLand(landMaskCache, MASK_W, MASK_H, MIN_ISLAND_PX);
  }
  return landMaskCache;
}

export function maskIsLand(mask, latDeg, lonDeg) {
  const x = Math.round(((lonDeg + 180) / 360) * (MASK_W - 1));
  const y = Math.round(((90 - latDeg) / 180) * (MASK_H - 1));
  return mask[Math.min(MASK_H - 1, Math.max(0, y)) * MASK_W +
    Math.min(MASK_W - 1, Math.max(0, x))] === 1;
}

const GLOBE_ROWS = 15;
const GLOBE_FONT_PX = 10.5;
const LAND_RAMP = ".,:;=+*#%@"; // dark → bright
const AUTO_SPIN = 0.10; // rad/s
// Pin starts this many degrees west of center, near the left limb, so the spin
// (rightward) carries it across the whole visible face before it hides on the
// right — rather than starting dead-center and leaving frame in ~120deg.
const PIN_START_LON = 50;
// North tilt of the spin axis (rad). Higher = more 3D tilt but the pin arcs up
// then down as it crosses; lower flattens that into a straighter, more level
// sweep (0 = dead-horizontal).
const SPIN_PITCH = 0.4;
// How far toward the front the pin must face to be drawn: its forward dot with
// the camera (1 = dead center, 0 = the limb). Higher hides it sooner as it turns
// away, so it doesn't cling to the rim looking like it's still there when it's
// nearly edge-on. 0.3 ≈ within ~72deg of center.
const PIN_VISIBLE_MIN = 0.5;
const REDRAW_MS = 110; // grid redraw cadence — ~9fps, calmer than 60fps shimmer
const DEG = Math.PI / 180;

// The location marker is stamped straight into the ASCII grid as
// [rowOffset, colOffset, char] cells at the pin's cell, so it reads big and hops
// cell-to-cell as one unit. Grid cells are ~1.6x taller than wide, so horizontal
// arms reach 2 cells to look balanced against 1-cell vertical arms.
//
// PIN_STAMP = steady base cells; PIN_BEACON = cells drawn on a separate,
// strongly-pulsing layer (radar "here" blink). Empty PIN_BEACON = nothing blinks.
// Some other marker shapes worth trying (swap into PIN_STAMP):
//   crosshair:  [0,0,"+"],[0,-1,"-"],[0,-2,"-"],[0,1,"-"],[0,2,"-"],[-1,0,"|"],[1,0,"|"]
//   arrows:     [-1,0,"v"],[1,0,"^"],[0,-2,">"],[0,2,"<"]
//   ring:       [-1,-2,"o"],[-1,0,"o"],[-1,2,"o"],[0,-2,"o"],[0,2,"o"],[1,-2,"o"],[1,0,"o"],[1,2,"o"]
//   map pin:    [-1,-1,"("],[-1,0,"o"],[-1,1,")"],[0,0,"V"]
const PIN_STAMP = [
  [0, 0, "@"],
];
const PIN_BEACON = [
  [-1, 0, "v"],
];

// ASCII globe: orthographic projection of the real coastlines onto a text grid.
// Stacked <pre> layers — faint dots for ocean, bright ramp chars for land
// (shaded by a fixed light), a steady gold marker, and a blinking beacon.
// Auto-rotates; drag to spin (yaw free, pitch clamped).
export function AsciiGlobe({ color, rows: rowsProp, fontPx }) {
  const rows = rowsProp ?? GLOBE_ROWS;
  const fontSize = fontPx ?? GLOBE_FONT_PX;
  const oceanRef = useRef(null);
  const landRef = useRef(null);
  const pinRef = useRef(null);
  const beaconRef = useRef(null);
  const drag = useRef(null); // last pointer pos while dragging, else null
  // Start with the pin near the left limb (PIN_START_LON west of center), tilted
  // a bit north, so it sweeps the full face before hiding on the right.
  const rot = useRef({
    yaw: (-LOCATION.lon - PIN_START_LON) * DEG,
    pitch: SPIN_PITCH,
  });
  const running = useRef(false); // did setup get a real box to measure?
  const [shown, setShown] = useState(0); // bumped when we go hidden → visible

  // Setup can only measure a visible element, so when the globe mounts hidden
  // (below md) it bails — pick it up the moment it first has a box: crossing the
  // breakpoint, or a phone turned landscape. Gated on `running` so the resizes
  // our own textContent writes cause can't feed back into a loop.
  useEffect(() => {
    const el = oceanRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (!running.current && el.getBoundingClientRect().width) {
        setShown((n) => n + 1);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const mask = getLandMask();
    const oceanPre = oceanRef.current;
    const landPre = landRef.current;
    const pinPre = pinRef.current;
    const beaconPre = beaconRef.current;
    if (!oceanPre || !landPre || !pinPre || !beaconPre) return;

    // Measure the mono cell — char cells aren't square, so the disc needs an
    // x-scale correction to come out round.
    oceanPre.textContent = "0".repeat(20);
    const cellW = oceanPre.getBoundingClientRect().width / 20;
    // A zero-width cell means we're display:none — the hero hides the globe
    // below md. Bail, or aspect is 0, cols diverges to Infinity, and the
    // per-cell loop below spins forever growing a row string until the tab dies.
    if (!cellW) {
      running.current = false;
      return;
    }
    running.current = true;
    const lineH = fontSize;
    const aspect = cellW / lineH; // col width in row units
    const radius = (rows - 1) / 2; // in rows
    const cols = 2 * Math.ceil(radius / aspect) + 3;
    const cRow = (rows - 1) / 2;
    const cCol = (cols - 1) / 2;

    // Fixed light, camera space (upper-left, toward viewer).
    const L = [-0.45, 0.55, 0.7];
    const lLen = Math.hypot(...L);

    const pinDir = [
      Math.cos(LOCATION.lat * DEG) * Math.sin(LOCATION.lon * DEG),
      Math.sin(LOCATION.lat * DEG),
      Math.cos(LOCATION.lat * DEG) * Math.cos(LOCATION.lon * DEG),
    ];

    let raf;
    let last = performance.now();
    let lastDraw = 0;
    const frame = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!drag.current) rot.current.yaw += AUTO_SPIN * dt;

      // Throttle the (shimmery) grid rebuild to a calm cadence; redraw at full
      // rate only while dragging so interaction stays responsive.
      if (!drag.current && now - lastDraw < REDRAW_MS) {
        raf = requestAnimationFrame(frame);
        return;
      }
      lastDraw = now;

      const { yaw, pitch } = rot.current;
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);

      const ocean = [];
      const land = [];
      for (let j = 0; j < rows; j++) {
        let oRow = "";
        let lRow = "";
        const y = (cRow - j) / radius;
        for (let i = 0; i < cols; i++) {
          const x = ((i - cCol) * aspect) / radius;
          const r2 = x * x + y * y;
          if (r2 > 1) {
            oRow += " ";
            lRow += " ";
            continue;
          }
          const z = Math.sqrt(1 - r2);
          // Camera → globe frame: Ry(-yaw) · Rx(-pitch)
          const y1 = y * cp + z * sp;
          const z1 = -y * sp + z * cp;
          const gx = x * cy - z1 * sy;
          const gz = x * sy + z1 * cy;
          const lat = Math.asin(y1) / DEG;
          const lon = Math.atan2(gx, gz) / DEG;
          if (maskIsLand(mask, lat, lon)) {
            // Ambient floor keeps night-side land legible against the ocean.
            const diffuse = Math.max(0, (x * L[0] + y * L[1] + z * L[2]) / lLen);
            const b = 0.25 + 0.75 * diffuse;
            lRow += LAND_RAMP[Math.round(b * (LAND_RAMP.length - 1))];
            oRow += " ";
          } else {
            oRow += ".";
            lRow += " ";
          }
        }
        ocean.push(oRow);
        land.push(lRow);
      }
      // Pin → camera frame (Rx(pitch) · Ry(yaw)), then snapped onto the same
      // character grid so it reads as one of the ASCII cells (it hops cell to
      // cell as the globe turns), not a sprite floating on top.
      const px = pinDir[0] * cy + pinDir[2] * sy;
      const pz0 = -pinDir[0] * sy + pinDir[2] * cy;
      const py = pinDir[1] * cp - pz0 * sp;
      const pz = pinDir[1] * sp + pz0 * cp;
      const pinRows = new Array(rows).fill(" ".repeat(cols));
      const beaconRows = new Array(rows).fill(" ".repeat(cols));
      if (pz > PIN_VISIBLE_MIN) {
        const pc = Math.round(cCol + (px * radius) / aspect);
        const pr = Math.round(cRow - py * radius);
        const put = (arr, r, c, ch) =>
          (arr[r] = arr[r].slice(0, c) + ch + arr[r].slice(c + 1));
        // Steady base + blinking beacon share the pin cell but land on separate
        // layers so the beacon can pulse independently.
        const stamp = (cells, target) => {
          for (const [dr, dc, ch] of cells) {
            const r = pr + dr;
            const c = pc + dc;
            if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
            put(target, r, c, ch);
            // Blank the cells under the marker so only the gold shows.
            put(land, r, c, " ");
            put(ocean, r, c, " ");
          }
        };
        stamp(PIN_STAMP, pinRows);
        stamp(PIN_BEACON, beaconRows);
      }
      oceanPre.textContent = ocean.join("\n");
      landPre.textContent = land.join("\n");
      pinPre.textContent = pinRows.join("\n");
      beaconPre.textContent = beaconRows.join("\n");

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      running.current = false;
      cancelAnimationFrame(raf);
    };
  }, [rows, fontSize, shown]);

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    rot.current.yaw += (e.clientX - drag.current.x) * 0.007;
    rot.current.pitch = Math.min(
      1.2,
      Math.max(-1.2, rot.current.pitch + (e.clientY - drag.current.y) * 0.007),
    );
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const endDrag = () => {
    drag.current = null;
  };

  const preStyle = {
    color,
    fontSize: `${fontSize}px`,
    lineHeight: `${fontSize}px`,
  };
  return (
    <div
      className="relative mx-auto w-fit cursor-grab touch-none select-none active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      aria-label={`Rotating globe with a pin on ${LOCATION.label}`}
      role="img"
    >
      <pre aria-hidden="true" ref={oceanRef} className="font-mono opacity-35" style={preStyle} />
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
        transition={{
          duration: 1.6,
          repeat: Infinity,
          // quick flash up (first 15%), long slow fade down (last 85%)
          times: [0, 0.12, 1],
          ease: ["easeOut", "easeInOut"],
        }}
      />
    </div>
  );
}

// Compact "ground station" widget: the ASCII globe over a live local-time
// readout for LOCATION. Space/telemetry styling — mono, muted labels, the
// theme accent, a blinking beacon on the globe.
export default function MissionControl() {
  const { highlightHex } = useMoney();
  const accent = highlightHex || "#ff5e5e";
  const { time, zone } = useLocalTime();

  return (
    <motion.div
      className={cardBase + " px-4 pt-4 pb-3"}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AsciiGlobe color={accent} />
      <div className="border-outline-darker-gray/60 mt-2 border-t pt-2.5 text-center font-mono">
        <div className="text-body-text/55 text-[10px] tracking-[0.15em] uppercase">
          Adjusted local time
        </div>
        <div className="text-main-text mt-0.5 text-sm tabular-nums">
          {time}
          {zone && (
            <span className="text-body-text/45 ml-1 text-[10px]">{zone}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
