"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import localFont from "next/font/local";

const aurebesh = localFont({
  src: "../../public/fonts/Aurebesh.otf",
  display: "swap",
});

const ALPHA = "abcdefghijklmnopqrstuvwxyz";
const SCRAMBLE_MS = 50;
const STAGGER_MS = 80;     // delay between each char entering noise
const NOISE_HOLD_MS = 150; // how long a char scrambles before locking
const UNLOCK_STEP_MS = 60; // delay between each char unlocking on leave
const NOISE_TAIL_MS = 200; // noise duration after last char unlocks

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
  // per-char: 'latin' | 'noise' | 'locked'
  const charPhase = useRef(chars.map(() => "latin"));

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
        (a, b) => dists[a] - dists[b]
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
      const cp = chars.map(() => "latin");
      charPhase.current = cp;

      // interval only scrambles chars currently in 'noise' state
      noiseRef.current = setInterval(() => {
        setDisplay((prev) =>
          prev.map((item, i) =>
            cp[i] === "noise" ? { ch: rchar(), alien: true } : item
          )
        );
      }, SCRAMBLE_MS);

      let lockedCount = 0;
      order.forEach((idx, rank) => {
        // latin → noise (staggered entry)
        const noiseT = setTimeout(() => {
          cp[idx] = "noise";
          setDisplay((prev) =>
            prev.map((item, i) =>
              i === idx ? { ch: rchar(), alien: true } : item
            )
          );
        }, rank * STAGGER_MS);
        timers.current.push(noiseT);

        // noise → locked (after noise hold duration)
        const lockT = setTimeout(() => {
          cp[idx] = "locked";
          lockedCount++;
          setDisplay((prev) =>
            prev.map((item, i) =>
              i === idx ? { ch: chars[idx], alien: true } : item
            )
          );
          if (lockedCount === n) {
            clearInterval(noiseRef.current);
            noiseRef.current = null;
            phase.current = "holding";
          }
        }, rank * STAGGER_MS + NOISE_HOLD_MS);
        timers.current.push(lockT);
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

    const cp = charPhase.current;
    const order = getOrder(lastX.current);
    // only revert chars that have already entered Aurebesh
    const exitOrder = [...order].reverse().filter((i) => cp[i] !== "latin");

    if (exitOrder.length === 0) {
      setDisplay(chars.map((c) => ({ ch: c, alien: false })));
      phase.current = "idle";
      return;
    }

    const exitNoising = new Set();

    noiseRef.current = setInterval(() => {
      setDisplay((prev) =>
        prev.map((item, i) =>
          exitNoising.has(i) ? { ch: rchar(), alien: true } : item
        )
      );
    }, SCRAMBLE_MS);

    exitOrder.forEach((idx, rank) => {
      const t = setTimeout(() => {
        exitNoising.add(idx);
        setDisplay((prev) =>
          prev.map((item, i) =>
            i === idx ? { ch: rchar(), alien: true } : item
          )
        );
      }, rank * UNLOCK_STEP_MS);
      timers.current.push(t);
    });

    const snapAt = (exitOrder.length - 1) * UNLOCK_STEP_MS + NOISE_TAIL_MS;
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
