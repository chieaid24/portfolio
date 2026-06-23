"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import localFont from "next/font/local";

const aurebesh = localFont({
  src: "../../public/fonts/Aurebesh.otf",
  display: "swap",
});

const ALPHA = "abcdefghijklmnopqrstuvwxyz";
const SCRAMBLE_MS = 50;
const LOCK_START_MS = 120;
const LOCK_STEP_MS = 80;
const UNLOCK_STEP_MS = 60;
const NOISE_TAIL_MS = 200;

function rchar() {
  return ALPHA[Math.floor(Math.random() * ALPHA.length)];
}

export default function ScrambledText({ text, className }) {
  const chars = text.split("");
  const n = chars.length;

  const [display, setDisplay] = useState(
    chars.map((c) => ({ ch: c, alien: false }))
  );

  const charSpans = useRef(Array(n).fill(null));
  const phase = useRef("idle");
  const noiseRef = useRef(null);
  const timers = useRef([]);
  const lastX = useRef(0);

  const clearAll = useCallback(() => {
    clearInterval(noiseRef.current);
    noiseRef.current = null;
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const getOrder = useCallback(
    (cursorX) => {
      const centers = charSpans.current.map((el) => {
        if (!el) return 0;
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2;
      });
      const dists = centers.map((cx) => Math.abs(cx - cursorX));
      return Array.from({ length: n }, (_, i) => i).sort(
        (a, b) => dists[b] - dists[a]
      );
    },
    [n]
  );

  const handleMouseEnter = useCallback(
    (e) => {
      clearAll();
      phase.current = "in";
      lastX.current = e.clientX;

      const order = getOrder(e.clientX);
      const lockedSet = new Set();

      setDisplay(chars.map(() => ({ ch: rchar(), alien: true })));

      noiseRef.current = setInterval(() => {
        setDisplay((prev) =>
          prev.map((item, i) =>
            lockedSet.has(i) ? item : { ch: rchar(), alien: true }
          )
        );
      }, SCRAMBLE_MS);

      order.forEach((idx, rank) => {
        const t = setTimeout(() => {
          lockedSet.add(idx);
          setDisplay((prev) =>
            prev.map((item, i) =>
              i === idx ? { ch: chars[idx], alien: true } : item
            )
          );
          if (lockedSet.size === n) {
            clearInterval(noiseRef.current);
            noiseRef.current = null;
            phase.current = "holding";
          }
        }, LOCK_START_MS + rank * LOCK_STEP_MS);
        timers.current.push(t);
      });
    },
    [chars, n, clearAll, getOrder]
  );

  const handleMouseMove = useCallback((e) => {
    lastX.current = e.clientX;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (phase.current === "idle") return;
    clearAll();
    phase.current = "out";

    const exitOrder = [...getOrder(lastX.current)].reverse();
    const stillLocked = new Set(Array.from({ length: n }, (_, i) => i));

    noiseRef.current = setInterval(() => {
      setDisplay((prev) =>
        prev.map((item, i) =>
          stillLocked.has(i) ? item : { ch: rchar(), alien: true }
        )
      );
    }, SCRAMBLE_MS);

    exitOrder.forEach((idx, rank) => {
      const t = setTimeout(() => {
        stillLocked.delete(idx);
        setDisplay((prev) =>
          prev.map((item, i) =>
            i === idx ? { ch: rchar(), alien: true } : item
          )
        );
      }, rank * UNLOCK_STEP_MS);
      timers.current.push(t);
    });

    const snapAt = (n - 1) * UNLOCK_STEP_MS + NOISE_TAIL_MS;
    const snap = setTimeout(() => {
      clearAll();
      setDisplay(chars.map((c) => ({ ch: c, alien: false })));
      phase.current = "idle";
    }, snapAt);
    timers.current.push(snap);
  }, [chars, n, clearAll, getOrder]);

  useEffect(() => clearAll, [clearAll]);

  return (
    <span
      className={className}
      style={{ whiteSpace: "nowrap" }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {display.map((item, i) => (
        <span
          key={i}
          ref={(el) => {
            charSpans.current[i] = el;
          }}
          className={item.alien ? aurebesh.className : undefined}
        >
          {item.ch}
        </span>
      ))}
    </span>
  );
}
