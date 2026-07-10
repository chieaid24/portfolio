"use client";

// PROTOTYPE — throwaway right-side hero explorations. Switchable via ?rside= on
// the home route (see src/app/page.js) + RightSideSwitcher floating bar.
// Pick a winner, fold it into page.js, then DELETE this file + the switcher.
//
// Four very different fillers for the blank right half of the hero:
//   1 — Mission control status panel (live Starflare counter + ASCII globe)
//   2 — Draggable low-poly planet (r3f)
//   3 — "Begin mission" quest onboarding card
//   4 — "Now": 3D earth globe + pin at my location + live local time

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { feature } from "topojson-client";
import { geoContains, geoEquirectangular, geoPath } from "d3-geo";
import land110m from "world-atlas/land-110m.json";
import { motion } from "framer-motion";
import { useMoney } from "@/lib/money-context";
import Rocket from "@/icons/Rocket";

// Real coastlines (coarse 110m set → naturally low-poly). Decoded once.
const LAND_GEO = feature(land110m, land110m.objects.land);

// Evenly scatter N points on the sphere (Fibonacci) and keep only the ones that
// fall on land — that dot cloud reads as recognizable continents.
function buildLandDots(count, r) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const out = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const theta = i * golden;
    const lat = Math.asin(y) * (180 / Math.PI);
    const lon =
      Math.atan2(Math.sin(theta) * rad, Math.cos(theta) * rad) *
      (180 / Math.PI);
    if (geoContains(LAND_GEO, [lon, lat])) out.push(latLonToVec3(lat, lon, r));
  }
  return out;
}

// --- shared config ----------------------------------------------------------

// My location — pin + clock. Swap lat/lon/tz to relocate.
const LOCATION = {
  label: "Waterloo, ON",
  lat: 43.4643,
  lon: -80.5204,
  tz: "America/Toronto",
};

// Ticking wall clock in a given IANA timezone.
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function latLonToVec3(lat, lon, r) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
}

const cardBase =
  "border-outline-darker-gray bg-background/40 relative w-full overflow-hidden rounded-2xl border backdrop-blur-md";

// --- 1 — Mission control ----------------------------------------------------

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

// ASCII globe: orthographic projection of the real coastlines onto a text
// grid. Two stacked <pre> layers — faint dots for ocean, bright ramp chars
// for land (shaded by a fixed light) — plus a pulsing pin overlay at
// LOCATION. Auto-rotates; drag to spin (yaw free, pitch clamped).
const GLOBE_ROWS = 21;
const GLOBE_FONT_PX = 10;
const LAND_RAMP = ".,:;=+*#%@"; // dark → bright
const AUTO_SPIN = 0.14; // rad/s
const DEG = Math.PI / 180;

function AsciiGlobe({ color }) {
  const oceanRef = useRef(null);
  const landRef = useRef(null);
  const pinRef = useRef(null);
  const drag = useRef(null); // last pointer pos while dragging, else null
  // Start with the pin's longitude facing the camera, tilted a bit north.
  const rot = useRef({ yaw: -LOCATION.lon * DEG, pitch: 0.55 });

  useEffect(() => {
    const mask = getLandMask();
    const oceanPre = oceanRef.current;
    const landPre = landRef.current;
    const pin = pinRef.current;
    if (!oceanPre || !landPre || !pin) return;

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
    const radiusPx = radius * lineH;

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
      oceanPre.textContent = ocean.join("\n");
      landPre.textContent = land.join("\n");

      // Pin: globe → camera frame: Rx(pitch) · Ry(yaw)
      const px = pinDir[0] * cy + pinDir[2] * sy;
      const pz0 = -pinDir[0] * sy + pinDir[2] * cy;
      const py = pinDir[1] * cp - pz0 * sp;
      const pz = pinDir[1] * sp + pz0 * cp;
      pin.style.left = `${(cols * cellW) / 2 + px * radiusPx}px`;
      pin.style.top = `${(rows * lineH) / 2 - py * radiusPx}px`;
      pin.style.opacity = Math.min(1, Math.max(0, (pz - 0.05) / 0.25));

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
      <div
        ref={pinRef}
        className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2"
      >
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ffd24a] opacity-70" />
        <span className="relative block h-2 w-2 rounded-full bg-[#ffd24a]" />
      </div>
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

export function MissionControl() {
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

// --- 2 — Low-poly planet ----------------------------------------------------

function Planet({ color }) {
  const ref = useRef(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += 0.15 * d;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.15, 1]} />
      <meshStandardMaterial
        color={color}
        flatShading
        roughness={0.55}
        metalness={0.15}
      />
    </mesh>
  );
}

// Compact pill CTA: tiny spinning planet inline with the label. Clicking it
// smooth-scrolls to the experience section.
export function LowPolyPlanet() {
  const { highlightHex } = useMoney();
  const accent = highlightHex || "#ff5e5e";
  const scrollToExperience = () =>
    document
      .getElementById("experience")
      ?.scrollIntoView({ behavior: "smooth" });
  return (
    <motion.button
      type="button"
      onClick={scrollToExperience}
      className="group bg-background/40 flex cursor-pointer items-center gap-2 rounded-full border py-1 pr-4 pl-1.5 backdrop-blur-md transition-transform duration-150 md:hover:scale-105"
      style={{ borderColor: accent }}
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: [
          `0 0 10px ${accent}26`,
          `0 0 22px ${accent}59`,
          `0 0 10px ${accent}26`,
        ],
      }}
      transition={{
        opacity: { duration: 0.5 },
        y: { duration: 0.5 },
        boxShadow: { repeat: Infinity, duration: 2.6, ease: "easeInOut" },
      }}
    >
      <span className="h-10 w-10">
        <Canvas camera={{ position: [0, 0.6, 4], fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 5, 3]} intensity={1.6} />
          <directionalLight position={[-5, -2, -2]} intensity={0.4} color={accent} />
          <Planet color={accent} />
          <mesh rotation={[Math.PI / 2.3, 0.2, 0]}>
            <torusGeometry args={[1.55, 0.05, 10, 90]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={0.5}
            />
          </mesh>
        </Canvas>
      </span>
      <span
        className="text-sm font-semibold whitespace-nowrap"
        style={{ color: accent }}
      >
        Click to explore
      </span>
      <svg
        className="h-4 w-4 transition-transform duration-150 md:group-hover:translate-y-0.5"
        style={{ color: accent }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </motion.button>
  );
}

// --- 3 — Begin mission ------------------------------------------------------

function QuestItem({ children, done, color }) {
  return (
    <li className="flex items-center gap-2.5">
      <span
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px]"
        style={{
          borderColor: color,
          backgroundColor: done ? color : "transparent",
          color: done ? "#02030a" : color,
        }}
      >
        {done ? "✓" : ""}
      </span>
      <span
        className={`text-sm ${done ? "text-body-text/50 line-through" : "text-main-text"}`}
      >
        {children}
      </span>
    </li>
  );
}

export function BeginMission() {
  const { highlightHex } = useMoney();
  const accent = highlightHex || "#ff5e5e";
  return (
    <motion.div
      className={cardBase + " px-6 py-6"}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="mb-2 text-[11px] font-semibold tracking-[0.25em] uppercase"
        style={{ color: accent }}
      >
        Side quest
      </div>
      <h3 className="text-main-text mb-1.5 text-xl font-bold sm:text-2xl">
        This site pays you to explore.
      </h3>
      <p className="text-body-text mb-4 text-sm">
        Hidden bounties are scattered across these pages. Find them, bank{" "}
        <span className="font-mono" style={{ color: accent }}>
          ₳
        </span>
        , unlock color themes.
      </p>
      <ul className="mb-5 space-y-2">
        <QuestItem done color={accent}>
          Land on the home page
        </QuestItem>
        <QuestItem color={accent}>Uncover a red-text bounty</QuestItem>
        <QuestItem color={accent}>Buy your first theme</QuestItem>
      </ul>
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-body-text/60 font-mono text-xs">balance</span>
          <span className="text-main-text font-mono text-lg">₳ 100.00</span>
        </div>
        <div
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-transform duration-100 md:hover:scale-105"
          style={{ borderColor: accent, color: accent }}
        >
          Start mission
          <Rocket className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

// --- 4 — "Now": earth globe + pin + local time ------------------------------

function Pin({ position, color }) {
  const ring = useRef(null);
  useFrame(({ clock }) => {
    if (!ring.current) return;
    const t = (clock.getElapsedTime() % 2) / 2;
    ring.current.scale.setScalar(0.4 + t * 2.2);
    ring.current.material.opacity = 0.7 * (1 - t);
  });
  // Orient the ring flat against the sphere surface (face outward).
  const normal = new THREE.Vector3(...position).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    normal,
  );
  return (
    <group position={position} quaternion={quat}>
      <mesh>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.05, 0.075, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Instanced land dots — one tiny low-poly sphere per land point.
function LandDots({ dots, color }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const dummy = new THREE.Object3D();
    dots.forEach((p, i) => {
      dummy.position.set(p[0], p[1], p[2]);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [dots]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, dots.length]}>
      <icosahedronGeometry args={[0.021, 0]} />
      <meshBasicMaterial color={color} />
    </instancedMesh>
  );
}

function Globe({ color }) {
  const ref = useRef(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += 0.08 * d;
  });
  const R = 1.6;
  const dots = useMemo(() => buildLandDots(7000, R), []);
  const pin = latLonToVec3(LOCATION.lat, LOCATION.lon, R);
  return (
    <group ref={ref} rotation={[0.35, 0, 0]}>
      {/* opaque ocean core — hides the far-side land dots */}
      <mesh>
        <sphereGeometry args={[R * 0.98, 48, 48]} />
        <meshBasicMaterial color="#0a1226" />
      </mesh>
      <LandDots dots={dots} color={color} />
      {/* atmosphere halo */}
      <mesh scale={1.16}>
        <sphereGeometry args={[R, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>
      <Pin position={pin} color="#ffd24a" />
    </group>
  );
}

// Shared "currently in <place> · <local time>" footer.
function NowFooter() {
  const now = useNow();
  const time = now.toLocaleTimeString("en-US", {
    timeZone: LOCATION.tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const date = now.toLocaleDateString("en-US", {
    timeZone: LOCATION.tz,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return (
    <div className="mt-1 flex items-center justify-between px-1">
      <div>
        <div className="text-body-text/50 text-[11px] tracking-[0.2em] uppercase">
          Currently in
        </div>
        <div className="text-main-text text-lg font-semibold">
          {LOCATION.label}
        </div>
      </div>
      <div className="text-right">
        <div className="text-main-text font-mono text-2xl tabular-nums">
          {time}
        </div>
        <div className="text-body-text/50 text-xs">{date}</div>
      </div>
    </div>
  );
}

export function NowGlobe() {
  const { highlightHex } = useMoney();
  const accent = highlightHex || "#ff5e5e";
  return (
    <div className="h-[19rem] w-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
        <Globe color={accent} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}

// --- 5 — Low-poly terraformed earth (green land / blue ocean) ---------------

// Adaptive detail: triangles that straddle a coastline subdivide down to
// EARTH_DETAIL_MAX; uniform regions (open ocean, continent interiors) stop at
// EARTH_DETAIL_MIN — poly budget concentrates on the important features.
const EARTH_DETAIL_MIN = 3; // facet size away from coasts (lower = blockier)
const EARTH_DETAIL_MAX = 6; // facet size along coastlines (higher = finer)
const FEATURE_DEPTH = 5; // coastline-detection sampling resolution

// Inverse of latLonToVec3 — recover [lat, lon] from a point so face coloring
// lines up with the pin (same convention as the dotted globe).
function vec3ToLatLon(x, y, z) {
  const len = Math.hypot(x, y, z) || 1;
  const lat = 90 - Math.acos(y / len) * (180 / Math.PI);
  let lon = Math.atan2(z, -x) * (180 / Math.PI) - 180;
  if (lon < -180) lon += 360;
  return [lat, lon];
}

// Terrain shape: land rises into hills, ocean dips into faceted swells.
// Heights are radius multipliers; land min (LAND_BASE) stays above ocean max
// (OCEAN_BASE) so continents always read as raised.
const LAND_BASE = 1.02;
const LAND_RELIEF = 0.05;
const OCEAN_BASE = 0.99;
const OCEAN_RELIEF = 0.028;

// Cheap deterministic fBm-ish noise from stacked sines — same input direction
// always gives the same height, which keeps duplicated vertices welded.
function terrainNoise(x, y, z) {
  return (
    0.55 * Math.sin(x * 5.3 + y * 3.7 - z * 4.1) +
    0.3 * Math.sin(x * 9.7 - y * 8.3 + z * 7.9) +
    0.15 * Math.sin(x * 17.3 + y * 15.1 + z * 13.7)
  );
}

// Base icosahedron: 12 unit-sphere directions + 20 CCW faces.
function baseIcosahedron() {
  const t = (1 + Math.sqrt(5)) / 2;
  const verts = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ].map((v) => new THREE.Vector3(...v).normalize());
  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  return { verts, faces };
}

// Adaptively subdivided icosphere: triangles straddling a coastline keep
// splitting to EARTH_DETAIL_MAX, uniform regions stop at EARTH_DETAIL_MIN.
// A 2:1 balance pass plus a bisection closure stitch the size transitions,
// so the variable-density mesh stays one watertight shell (no T-junction
// cracks). Every vertex is then displaced by terrain height; relief scales
// with local facet size, so fine coastal facets hug sea level while big
// interior facets ride full hills and ocean swells — coasts read low and
// detailed, interiors chunky. Facet color = land/ocean by vertex majority,
// shaded by elevation (peaks lighter, shallows lighter, deep water darker).
function buildEarthGeometry(R) {
  const { verts, faces } = baseIcosahedron();

  // Midpoint registry — also the record of who subdivided which edge, which
  // the balance and closure passes read to find T-junctions.
  const midCache = new Map();
  const midKey = (i, j) => (i < j ? `${i}|${j}` : `${j}|${i}`);
  const getMid = (i, j) => midCache.get(midKey(i, j));
  const makeMid = (i, j) => {
    const key = midKey(i, j);
    let m = midCache.get(key);
    if (m === undefined) {
      m = verts.length;
      verts.push(verts[i].clone().add(verts[j]).normalize());
      midCache.set(key, m);
    }
    return m;
  };

  const landCache = new Map();
  const isLandDir = (d) => {
    const key = `${d.x.toFixed(5)}|${d.y.toFixed(5)}|${d.z.toFixed(5)}`;
    let land = landCache.get(key);
    if (land === undefined) {
      const [lat, lon] = vec3ToLatLon(d.x, d.y, d.z);
      land = geoContains(LAND_GEO, [lon, lat]);
      landCache.set(key, land);
    }
    return land;
  };

  // Does this triangle straddle a coastline? Sampled on a barycentric grid
  // fine enough (FEATURE_DEPTH) that islands smaller than a coarse triangle
  // still register instead of being swallowed.
  const probe = new THREE.Vector3();
  const crossesCoast = (a, b, c, level) => {
    const A = verts[a];
    const B = verts[b];
    const C = verts[c];
    const n = Math.max(2, 2 ** (FEATURE_DEPTH - level));
    let first = null;
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n - i; j++) {
        const k = n - i - j;
        probe
          .set(
            A.x * i + B.x * j + C.x * k,
            A.y * i + B.y * j + C.y * k,
            A.z * i + B.z * j + C.z * k,
          )
          .normalize();
        const land = isLandDir(probe);
        if (first === null) first = land;
        else if (land !== first) return true;
      }
    }
    probe
      .set(A.x + B.x + C.x, A.y + B.y + C.y, A.z + B.z + C.z)
      .normalize();
    return isLandDir(probe) !== first;
  };

  const subdivide = (v, level, out) => {
    const [a, b, c] = v;
    const ab = makeMid(a, b);
    const bc = makeMid(b, c);
    const ca = makeMid(c, a);
    const l = level + 1;
    out.push(
      { v: [a, ab, ca], level: l },
      { v: [ab, b, bc], level: l },
      { v: [ca, bc, c], level: l },
      { v: [ab, bc, ca], level: l },
    );
  };

  // Adaptive refinement.
  let leaves = [];
  const queue = faces.map((f) => ({ v: f, level: 0 }));
  while (queue.length) {
    const t = queue.pop();
    const split =
      t.level < EARTH_DETAIL_MIN ||
      (t.level < EARTH_DETAIL_MAX && crossesCoast(t.v[0], t.v[1], t.v[2], t.level));
    if (split) subdivide(t.v, t.level, queue);
    else leaves.push(t);
  }

  // 2:1 balance: if a neighbor got 2+ levels finer than us, split to within
  // one level — the closure below can only stitch one-level seams.
  const edgeTooDeep = (i, j) => {
    const m = getMid(i, j);
    return m !== undefined && (getMid(i, m) !== undefined || getMid(m, j) !== undefined);
  };
  for (let pass = 0, changed = true; changed && pass < 20; pass++) {
    changed = false;
    const next = [];
    for (const t of leaves) {
      const [a, b, c] = t.v;
      if (edgeTooDeep(a, b) || edgeTooDeep(b, c) || edgeTooDeep(c, a)) {
        subdivide(t.v, t.level, next);
        changed = true;
      } else next.push(t);
    }
    leaves = next;
  }

  // Closure: where a finer neighbor left a midpoint on one of our edges,
  // bisect through it so every edge is shared vertex-for-vertex — watertight.
  const tri = [];
  const emit = (a, b, c) => {
    let m;
    if ((m = getMid(a, b)) !== undefined) return emit(a, m, c), emit(m, b, c);
    if ((m = getMid(b, c)) !== undefined) return emit(a, b, m), emit(a, m, c);
    if ((m = getMid(c, a)) !== undefined) return emit(a, b, m), emit(m, b, c);
    tri.push(a, b, c);
  };
  for (const t of leaves) emit(t.v[0], t.v[1], t.v[2]);

  // Relief scale per vertex = avg incident edge length vs a coarse facet's,
  // so terrain amplitude follows facet size (fine coast ≈ sea level).
  const lenSum = new Float64Array(verts.length);
  const lenCnt = new Uint32Array(verts.length);
  for (let i = 0; i < tri.length; i += 3) {
    for (let e = 0; e < 3; e++) {
      const p1 = tri[i + e];
      const p2 = tri[i + ((e + 1) % 3)];
      const d = verts[p1].distanceTo(verts[p2]);
      lenSum[p1] += d;
      lenCnt[p1]++;
      lenSum[p2] += d;
      lenCnt[p2]++;
    }
  }
  const coarseEdge = 1.05146 / 2 ** EARTH_DETAIL_MIN; // icosa edge / 2^level

  const info = new Array(verts.length);
  const heightAt = (idx) => {
    let inf = info[idx];
    if (!inf) {
      const d = verts[idx];
      const land = isLandDir(d);
      const n = terrainNoise(d.x, d.y, d.z) * 0.5 + 0.5; // [0, 1]
      const scale = Math.min(1, Math.max(0.12, lenSum[idx] / lenCnt[idx] / coarseEdge));
      const h = land
        ? LAND_BASE + LAND_RELIEF * n * scale
        : OCEAN_BASE - OCEAN_RELIEF * n * scale;
      inf = { land, h };
      info[idx] = inf;
    }
    return inf;
  };

  // Non-indexed buffers → flat shading; per-face color.
  const positions = new Float32Array(tri.length * 3);
  const colors = new Float32Array(tri.length * 3);
  const landLo = new THREE.Color("#2e7d44");
  const landHi = new THREE.Color("#6fc57e");
  const oceanLo = new THREE.Color("#0e3a63");
  const oceanHi = new THREE.Color("#1f6cab");
  const col = new THREE.Color();
  for (let i = 0; i < tri.length; i += 3) {
    const a = heightAt(tri[i]);
    const b = heightAt(tri[i + 1]);
    const c = heightAt(tri[i + 2]);
    const isLand = a.land + b.land + c.land >= 2;
    const h = (a.h + b.h + c.h) / 3;
    const t = isLand
      ? (h - LAND_BASE) / LAND_RELIEF
      : (h - (OCEAN_BASE - OCEAN_RELIEF)) / OCEAN_RELIEF;
    col.lerpColors(
      isLand ? landLo : oceanLo,
      isLand ? landHi : oceanHi,
      THREE.MathUtils.clamp(t, 0, 1),
    );
    for (let k = 0; k < 3; k++) {
      const idx = tri[i + k];
      const d = verts[idx];
      const hk = info[idx].h;
      const o = (i + k) * 3;
      positions[o] = d.x * R * hk;
      positions[o + 1] = d.y * R * hk;
      positions[o + 2] = d.z * R * hk;
      colors[o] = col.r;
      colors[o + 1] = col.g;
      colors[o + 2] = col.b;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

function EarthMesh({ accent }) {
  const group = useRef(null);
  useFrame((_, d) => {
    if (group.current) group.current.rotation.y += 0.08 * d;
  });
  const R = 1.5;
  const geo = useMemo(() => buildEarthGeometry(R), []);
  // Float the pin just above the tallest possible land facet.
  const pin = latLonToVec3(
    LOCATION.lat,
    LOCATION.lon,
    R * (LAND_BASE + LAND_RELIEF + 0.015),
  );
  return (
    <group ref={group} rotation={[0.35, 0, 0]}>
      <mesh geometry={geo}>
        <meshStandardMaterial vertexColors flatShading roughness={0.9} metalness={0.05} />
      </mesh>
      {/* atmosphere halo */}
      <mesh scale={1.12}>
        <sphereGeometry args={[R, 32, 32]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
      <Pin position={pin} color="#ffd24a" />
    </group>
  );
}

export function LowPolyEarth() {
  const { highlightHex } = useMoney();
  const accent = highlightHex || "#ff5e5e";
  return (
    <div className="w-full">
      <div className="h-[19rem] w-full">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 4, 5]} intensity={1.5} />
          <directionalLight position={[-5, -2, -3]} intensity={0.35} color={accent} />
          <EarthMesh accent={accent} />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>
      <NowFooter />
    </div>
  );
}

// --- registry ---------------------------------------------------------------

export const RIGHT_VARIANTS = {
  1: { name: "Mission control", Cmp: MissionControl },
  2: { name: "Low-poly planet", Cmp: LowPolyPlanet },
  3: { name: "Begin mission", Cmp: BeginMission },
  4: { name: "Dotted globe", Cmp: NowGlobe },
  5: { name: "Now · low-poly earth", Cmp: LowPolyEarth },
};

export default function RightSideVariant({ variant }) {
  const entry = RIGHT_VARIANTS[variant] ?? RIGHT_VARIANTS[1];
  const Cmp = entry.Cmp;
  return <Cmp />;
}
