"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import localFont from "next/font/local";

const aurebesh = localFont({
  src: "../../public/fonts/Aurebesh.otf",
  display: "swap",
});

const ALPHA = "abcdefghijklmnopqrstuvwxyz";
const SCRAMBLE_MS = 50;
const STAGGER_MS = 80;     // delay between each char entering noise (hover)
const INTRO_STAGGER_MS = 140; // delay between each char locking on intro decrypt
const NOISE_HOLD_MS = 150; // how long a char scrambles before locking (hover)
const INTRO_NOISE_HOLD_MS = 400; // longer scramble before locking on intro decrypt
const UNLOCK_STEP_MS = 60; // delay between each char unlocking on leave
const NOISE_TAIL_MS = 200; // noise duration after last char unlocks
const PROXIMITY_PX = 24;   // trigger radius around the text, not just exact hover
const INTRO_DELAY_MS = 500; // hold static Aurebesh during the hero fade-in,
                            // then decrypt so it resolves near full opacity

function rchar() {
  return ALPHA[Math.floor(Math.random() * ALPHA.length)];
}

export default function ScrambledText({ text, className }) {
  const chars = text.split("");
  const n = chars.length;

  // start "encrypted": real letters shown in the Aurebesh font (deterministic,
  // no hydration mismatch), then the mount effect decrypts to readable Latin.
  const [display, setDisplay] = useState(
    chars.map((c) => ({ ch: c, alien: true }))
  );

  const wrapperRef = useRef(null);
  const measureRef = useRef(null);
  // Lock the box to the resting (Latin) width. The scramble renders wider
  // Aurebesh glyphs; without this the inline-block grows and the whole word
  // reflows onto the next title line. Overflow from the wider glyphs spills
  // past the fixed box (harmless — it's the last word in the title).
  const [lockW, setLockW] = useState(null);
  const nearRef = useRef(false);
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
  }, [chars, clearAll, getOrder]);

  useEffect(() => clearAll, [clearAll]);

  // Measure the resting Latin width from a hidden copy (always the body font,
  // never scrambled) and lock the visible box to it. Re-measure once webfonts
  // load and on resize, since the title font-size is responsive.
  useEffect(() => {
    const measure = () => {
      const el = measureRef.current;
      if (el) setLockW(el.getBoundingClientRect().width);
    };
    measure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [text]);

  // intro decrypt on every mount/refresh: the name first shows as static
  // Aurebesh (the initial useState) and fades in with the hero, then after
  // INTRO_DELAY_MS the scramble kicks in and decrypts to readable Latin,
  // staggered from the outer edges inward, so the resolve is visible near full
  // opacity.
  useEffect(() => {
    clearAll();
    phase.current = "intro";
    const cp = chars.map(() => "noise");
    charPhase.current = cp;

    const startT = setTimeout(() => {
      setDisplay((prev) => prev.map(() => ({ ch: rchar(), alien: true })));
      noiseRef.current = setInterval(() => {
        setDisplay((prev) =>
          prev.map((item, i) =>
            cp[i] === "noise" ? { ch: rchar(), alien: true } : item
          )
        );
      }, SCRAMBLE_MS);

      let lockedCount = 0;
      chars.forEach((_, idx) => {
        const lockT = setTimeout(() => {
          cp[idx] = "locked";
          lockedCount++;
          setDisplay((prev) =>
            prev.map((item, i) =>
              i === idx ? { ch: chars[idx], alien: false } : item
            )
          );
          if (lockedCount === n) {
            clearInterval(noiseRef.current);
            noiseRef.current = null;
            phase.current = "idle";
          }
        }, ((n - 1) / 2 - Math.abs(idx - (n - 1) / 2)) * INTRO_STAGGER_MS +
          INTRO_NOISE_HOLD_MS);
        timers.current.push(lockT);
      });
    }, INTRO_DELAY_MS);
    timers.current.push(startT);

    return clearAll;
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // trigger on cursor proximity to the wrapper's box, not just exact hover
  useEffect(() => {
    const onMove = (e) => {
      const el = wrapperRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= PROXIMITY_PX) {
        if (!nearRef.current) {
          nearRef.current = true;
          handleMouseEnter(e);
        } else {
          handleMouseMove(e);
        }
      } else if (nearRef.current) {
        nearRef.current = false;
        handleMouseLeave();
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [handleMouseEnter, handleMouseMove, handleMouseLeave]);

  return (
    <span
      ref={wrapperRef}
      className={className}
      style={{
        display: "inline-block",
        height: "1lh",
        whiteSpace: "nowrap",
        width: lockW ? `${lockW}px` : undefined,
      }}
    >
      {/* hidden width reference: the resting text in the body font, never scrambled */}
      <span
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        {text}
      </span>
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
