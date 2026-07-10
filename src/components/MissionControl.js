"use client";

// Mission control status panel for the hero's right side: a live "SYSTEMS
// NOMINAL" card (Starflare count + ticking uptime) over an ASCII globe that
// orthographically projects the real coastlines onto a text grid, with a
// blinking beacon marker at LOCATION.

import { useEffect, useRef, useState } from "react";
import { feature } from "topojson-client";
import { geoEquirectangular, geoPath } from "d3-geo";
import land110m from "world-atlas/land-110m.json";
import { motion } from "framer-motion";
import { useMoney } from "@/lib/money-context";

// Real coastlines (coarse 110m set → naturally low-poly). Decoded once.
const LAND_GEO = feature(land110m, land110m.objects.land);

// My location — the beacon pin. Swap lat/lon to relocate.
const LOCATION = {
  label: "Waterloo, ON",
  lat: 43.4643,
  lon: -80.5204,
};

const cardBase =
  "border-outline-darker-gray bg-background/40 relative w-full overflow-hidden rounded-2xl border backdrop-blur-md";

// Land lookup raster: LAND_GEO painted once onto an offscreen canvas via an
// equirectangular projection, then read back into a bitmask — per-frame land
// tests become an array index instead of a geoContains polygon walk.
const MASK_W = 720;
const MASK_H = 360;
let landMaskCache = null;
function getLandMask() {
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
  }
  return landMaskCache;
}

function maskIsLand(mask, latDeg, lonDeg) {
  const x = Math.round(((lonDeg + 180) / 360) * (MASK_W - 1));
  const y = Math.round(((90 - latDeg) / 180) * (MASK_H - 1));
  return mask[Math.min(MASK_H - 1, Math.max(0, y)) * MASK_W +
    Math.min(MASK_W - 1, Math.max(0, x))] === 1;
}

const GLOBE_ROWS = 21;
const GLOBE_FONT_PX = 10;
const LAND_RAMP = ".,:;=+*#%@"; // dark → bright
const AUTO_SPIN = 0.14; // rad/s
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
function AsciiGlobe({ color }) {
  const oceanRef = useRef(null);
  const landRef = useRef(null);
  const pinRef = useRef(null);
  const beaconRef = useRef(null);
  const drag = useRef(null); // last pointer pos while dragging, else null
  // Start with the pin's longitude facing the camera, tilted a bit north.
  const rot = useRef({ yaw: -LOCATION.lon * DEG, pitch: 0.55 });

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
    const lineH = GLOBE_FONT_PX;
    const aspect = cellW / lineH; // col width in row units
    const rows = GLOBE_ROWS;
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
    const frame = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!drag.current) rot.current.yaw += AUTO_SPIN * dt;
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
      if (pz > 0.05) {
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
    return () => cancelAnimationFrame(raf);
  }, []);

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
    fontSize: `${GLOBE_FONT_PX}px`,
    lineHeight: `${GLOBE_FONT_PX}px`,
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

function StatRow({ label, value, mono = true }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-body-text/60 text-[11px] tracking-[0.15em] uppercase">
        {label}
      </span>
      <span
        className={`text-main-text text-sm ${mono ? "font-mono" : "font-semibold"}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function MissionControl() {
  const { highlightHex } = useMoney();
  const [flares, setFlares] = useState(null);
  const [uptime, setUptime] = useState(0);
  useEffect(() => {
    let ok = true;
    fetch("/api/counter")
      .then((r) => r.json())
      .then((d) => ok && typeof d.count === "number" && setFlares(d.count))
      .catch(() => {});
    const id = setInterval(() => setUptime((u) => u + 1), 1000);
    return () => {
      ok = false;
      clearInterval(id);
    };
  }, []);
  const accent = highlightHex || "#ff5e5e";
  const fmtUptime = `${String(Math.floor(uptime / 3600)).padStart(2, "0")}:${String(
    Math.floor((uptime % 3600) / 60),
  ).padStart(2, "0")}:${String(uptime % 60).padStart(2, "0")}`;

  return (
    <motion.div
      className={cardBase + " px-5 py-5"}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
            style={{ backgroundColor: accent }}
          />
          <span
            className="relative inline-flex h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: accent }}
          />
        </span>
        <span className="text-main-text font-mono text-xs tracking-[0.2em]">
          SYSTEMS NOMINAL
        </span>
      </div>
      <div className="divide-outline-darker-gray/60 divide-y">
        <StatRow
          label="Starflares"
          value={flares == null ? "······" : flares.toLocaleString()}
        />
        <StatRow label="Uptime" value={fmtUptime} />
        <StatRow label="Region" value="yyz-1 · waterloo" />
        <StatRow label="Deploy" value="live · main" />
      </div>
      <div className="mt-3">
        <div className="text-body-text/50 mb-1 text-[11px] tracking-[0.15em] uppercase">
          Ground station
        </div>
        <AsciiGlobe color={accent} />
      </div>
    </motion.div>
  );
}
