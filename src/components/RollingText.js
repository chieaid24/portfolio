"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

// CSS-only vertical odometer for the balance readout. Rows stack
// top-to-bottom in reverse order (texts[n-1] first) inside a 1em-tall
// clipping window; advancing the index slides the whole column down by exact
// em steps, so the new text drops in from above while the old one falls out
// the bottom — the same motion RotatingNavText produced with springs.
//
// Why not framer for this: a spring ends at a rest *threshold*, then snaps to
// the final value and strips the transform, which re-rasterizes the text —
// a visible sub-pixel snap on every landing. Here the transition lands on an
// exact em multiple and the transform persists at rest, so there is nothing
// to settle, strip, or re-measure (no AnimatePresence popLayout either).
// Spring motion curve (stiffness 300 / damping 20 / mass 1):
//   y(t) = 1 - e^(-10t)(cos(wd*t) + (10/wd)sin(wd*t)), wd = sqrt(300 - 100)
// Deliberately underdamped for one visible bounce: the text reaches its seat
// at 155ms, sinks 10.8% (~2.6px) below it by 222ms, and settles back at
// 377ms, where the curve is truncated at exactly 1 — the endpoint stays
// deterministic so the settle can't jitter. 550ms total keeps the same
// window the original framer spring occupied.
const SPRING_EASING =
  "linear(0 0%, 0.0267 2.5%, 0.0966 5.1%, 0.1955 7.6%, 0.3113 10.2%, " +
  "0.434 12.7%, 0.5556 15.3%, 0.6701 17.8%, 0.7736 20.4%, 0.8633 22.9%, " +
  "0.9381 25.5%, 0.9978 28%, 1.043 30.5%, 1.075 33.1%, 1.0953 35.6%, " +
  "1.1059 38.2%, 1.1084 40.7%, 1.1048 43.3%, 1.0967 45.8%, 1.0857 48.4%, " +
  "1.073 50.9%, 1.0596 53.5%, 1.0465 56%, 1.0342 58.5%, 1.0232 61.1%, " +
  "1.0137 63.6%, 1.0058 66.2%, 1 68.5%, 1 100%)";

const RollingText = forwardRef((props, ref) => {
  const {
    texts,
    durationMs = 550,
    deltaColor = "green", // "green" | "red" | "jackpot"
    leverAward = false,
    onActiveWidth,
  } = props;

  const [index, setIndex] = useState(0);
  const rowRefs = useRef([]);

  const jumpTo = useCallback(
    (i) => setIndex(Math.max(0, Math.min(i, texts.length - 1))),
    [texts.length],
  );
  const reset = useCallback(() => setIndex(0), []);
  useImperativeHandle(ref, () => ({ jumpTo, reset }), [jumpTo, reset]);

  // Report the *active row's* width so the parent can tween its wrapper.
  // Measuring here (layout effect) also forces an initial style/layout flush
  // on mount, so a transform change scheduled only a few ms later still
  // transitions instead of applying instantly.
  useLayoutEffect(() => {
    const el = rowRefs.current[index];
    if (!el) return;
    const report = () => onActiveWidth?.(el.getBoundingClientRect().width);
    report();
    // rows never change text, so this only fires on late font swaps
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [index, texts, onActiveWidth]);

  // Same color rules RotatingNavText applied per index
  const colorFor = (i) => {
    if (i === 1) {
      switch (deltaColor) {
        case "red":
          return "text-custom-red";
        case "jackpot":
          return "gradient-text-jackpot";
        default:
          return "text-sage-green";
      }
    }
    if (i === 0 && leverAward) {
      return "text-custom-red";
    }
    return "text-dark-grey-text";
  };

  return (
    // block, not inline-block: an inline-level window would add line-box
    // strut space under the baseline and grow the wrapper 24px → 28px
    <span
      className="block overflow-hidden"
      style={{ height: "1em", lineHeight: 1 }}
    >
      <span className="sr-only">{texts[index]}</span>
      <span
        aria-hidden="true"
        className="block"
        style={{
          transform: `translateY(${-(texts.length - 1 - index)}em)`,
          transition: `transform ${durationMs}ms ${SPRING_EASING}`,
        }}
      >
        {/* w-max keeps each row at its intrinsic text width, so the
            active-row measurement is that row's own width rather than the
            widest row in the column */}
        {Array.from(texts, (_, k) => texts.length - 1 - k).map((i) => (
          <span
            key={i}
            ref={(el) => (rowRefs.current[i] = el)}
            className={`block w-max whitespace-pre ${colorFor(i)}`}
            style={{
              height: "1em",
              lineHeight: 1,
              opacity: i === index ? 1 : 0,
              // same curve as the roll, like the old spring-driven fade
              transition: `opacity ${durationMs}ms ${SPRING_EASING}`,
            }}
          >
            {texts[i]}
          </span>
        ))}
      </span>
    </span>
  );
});

RollingText.displayName = "RollingText";
export default RollingText;
