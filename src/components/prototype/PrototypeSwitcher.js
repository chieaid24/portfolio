"use client";

// PROTOTYPE — floating variant switcher for the hero explorations. Fixed bottom
// bar, high-contrast so it reads as scaffolding, not part of the design. Cycles
// ?variant= via arrows or left/right keys. Hidden in production builds. DELETE
// with HeroVariants.js once a winner is chosen.

import { useEffect } from "react";

export default function PrototypeSwitcher({
  variants,
  current,
  names = {},
  onChange,
}) {
  const idx = Math.max(0, variants.indexOf(current));

  const go = (delta) => {
    const next = variants[(idx + delta + variants.length) % variants.length];
    onChange(next);
  };

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      const typing =
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable);
      if (typing) return;
      if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 9999,
        background: "rgba(17,17,17,0.92)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.25)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
        fontFamily: "ui-monospace, monospace",
        fontSize: 13,
        userSelect: "none",
      }}
    >
      <button onClick={() => go(-1)} style={btn} aria-label="Previous variant">
        {"<"}
      </button>
      <span style={{ minWidth: 190, textAlign: "center" }}>
        {current} — {names[current] ?? "variant"}{" "}
        <span style={{ opacity: 0.5 }}>
          ({idx + 1}/{variants.length})
        </span>
      </span>
      <button onClick={() => go(1)} style={btn} aria-label="Next variant">
        {">"}
      </button>
    </div>
  );
}

const btn = {
  cursor: "pointer",
  background: "rgba(255,255,255,0.12)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.25)",
  borderRadius: 8,
  width: 28,
  height: 28,
  lineHeight: "26px",
  fontSize: 15,
  textAlign: "center",
};
