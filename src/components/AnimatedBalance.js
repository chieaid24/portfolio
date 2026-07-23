"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import RollingText from "@/components/RollingText";
import { useMoney } from "@/lib/money-context";

export default function AnimatedBalance({
  value,
  holdMs = 1000,
  rotateMs = 300,
  className = "",
  snapDelayMs = 10,
}) {
  const { overflowTick, underflowTick, leverPullTick, giftTick } = useMoney();
  const lastLeverPullTickRef = useRef(0);
  const lastCallWasLeverPullRef = useRef(false);
  const lastOverTickRef = useRef(0);
  const lastUnderTickRef = useRef(0);
  const lastGiftTickRef = useRef(0);
  const prev = useRef(Number(value));
  const format = (n) => {
    return Number(n).toFixed(2);
    // return Number(n).toFixed(0); // whole-number display
  };

  const [trio, setTrio] = useState([
    format(value),
    format(value),
    format(value),
  ]);
  const [leverAward, setLeverAward] = useState(false);

  const [deltaColor, setDeltaColor] = useState("green");
  const [rtKey, setRtKey] = useState(0);
  const rtRef = useRef(null);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // if there is an exception, call a specific function that calls this instead of actually updating balance, keeps it cleaner as balance
  // is always a number

  // ---- width measurement + animation ----
  // null until first measure so the wrapper starts at its natural width.
  // RollingText reports its active row's width on mount and on every index
  // change — whole pixels only, so subpixel noise can't restart the tween.
  const [width, setWidth] = useState(null);
  const handleActiveWidth = useCallback((w) => setWidth(Math.ceil(w)), []);

  //when the overflowTick increases, it calls this function, which creates the custom animation, saying that it has overflowed
  useEffect(() => {
    if (overflowTick === 0 || overflowTick === lastOverTickRef.current) return;
    lastOverTickRef.current = overflowTick;
    setLeverAward(false);

    const prevStr = format(prev.current);

    // Create settings for overflow animation
    setDeltaColor("red");
    setTrio([prevStr, "OVERFLOW", prevStr]);
    setRtKey((k) => k + 1);

    timers.current.push(
      setTimeout(() => {
        rtRef.current?.jumpTo(1);
        timers.current.push(
          setTimeout(() => {
            rtRef.current?.jumpTo(2);
          }, rotateMs + holdMs),
        );
      }, snapDelayMs),
    );

    // do NOT update prev here (balance didn't change)
    return () => clearTimers();
  }, [overflowTick, holdMs, rotateMs, snapDelayMs]);

  //when the underflow increases, it calls this function, which creates the custom animation, saying that it has underflowed
  useEffect(() => {
    if (underflowTick === 0 || underflowTick === lastUnderTickRef.current)
      return;
    lastUnderTickRef.current = underflowTick;
    setLeverAward(false);

    const prevStr = format(prev.current);

    // Create settings for overflow animation
    setDeltaColor("red");
    setTrio([prevStr, "BROKE", prevStr]);
    setRtKey((k) => k + 1);

    timers.current.push(
      setTimeout(() => {
        rtRef.current?.jumpTo(1);
        timers.current.push(
          setTimeout(() => {
            rtRef.current?.jumpTo(2);
          }, rotateMs + holdMs),
        );
      }, snapDelayMs),
    );

    // do NOT update prev here (balance didn't change)
    return () => clearTimers();
  }, [underflowTick, holdMs, rotateMs, snapDelayMs]);

  // gifted theme (all bounties done, couldn't afford): balance is untouched, so
  // play a GIFT flash in place of the usual -price spend animation.
  useEffect(() => {
    if (giftTick === 0 || giftTick === lastGiftTickRef.current) return;
    lastGiftTickRef.current = giftTick;
    setLeverAward(false);

    const prevStr = format(prev.current);

    setDeltaColor("green");
    setTrio([prevStr, "GIFT", prevStr]);
    setRtKey((k) => k + 1);

    timers.current.push(
      setTimeout(() => {
        rtRef.current?.jumpTo(1);
        timers.current.push(
          setTimeout(() => {
            rtRef.current?.jumpTo(2);
          }, rotateMs + holdMs),
        );
      }, snapDelayMs),
    );

    // do NOT update prev here (balance didn't change)
    return () => clearTimers();
  }, [giftTick, holdMs, rotateMs, snapDelayMs]);

  // change the timer of the pull, and also make it so there is no black snapping, ie change the trio
  // also change the possible colors

  // change the trio
  // spend should be (prevVal, -5, DONT CARE)
  // award should be (-5, +25.12, nextVal)

  //so only need to change the award logic
  // use a ref to track whether the last call to this function was a "lever pull" meaning the spend kind
  // if so AND this call was a 'lever pull', we know it is award, so set the custom trio

  useEffect(() => {
    // special case such that the lever has been pulled, and it is the second pull (award case)
    if (
      leverPullTick !== 0 &&
      leverPullTick !== lastLeverPullTickRef.current &&
      lastCallWasLeverPullRef.current
    ) {
      // this is in the lever pull situation, both spend and award
      lastLeverPullTickRef.current = leverPullTick;
      setLeverAward(true);

      // change the award trio
      clearTimers();
      const next = Number(value);
      const prevVal = prev.current;

      if (
        Number.isFinite(next) &&
        Number.isFinite(prevVal) &&
        next !== prevVal
      ) {
        const delta = +(next - prevVal).toFixed(2);
        const deltaStr = `${delta >= 0 ? "+" : "-"}${Math.abs(delta).toFixed(2)}`;
        const baseStr = format(next);

        //alawys green since it is adding
        if (delta > 40) {
          setDeltaColor("jackpot");
        } else {
          setDeltaColor("green");
        }
        setTrio(["-5.00", deltaStr, baseStr]);
        setRtKey((k) => k + 1);

        timers.current.push(
          setTimeout(() => {
            rtRef.current?.jumpTo(1);
            timers.current.push(
              setTimeout(() => {
                rtRef.current?.jumpTo(2);
              }, rotateMs + 400),
            );
          }, snapDelayMs),
        );
      }

      prev.current = next; // only for real balance changes

      //end
      lastCallWasLeverPullRef.current = false;
      return () => clearTimers();
    } else {
      // if the lever has been pulled, set the lastcallref to be true. Else, default should be false.
      // the 'spend' logic in leverpull should still have the same default logic
      if (
        leverPullTick !== 0 &&
        leverPullTick !== lastLeverPullTickRef.current
      ) {
        lastLeverPullTickRef.current = leverPullTick;
        lastCallWasLeverPullRef.current = true;
      } else {
        lastCallWasLeverPullRef.current = false;
      }
      setLeverAward(false);
      clearTimers();
      const next = Number(value);
      const prevVal = prev.current;

      if (
        Number.isFinite(next) &&
        Number.isFinite(prevVal) &&
        next !== prevVal
      ) {
        const delta = +(next - prevVal).toFixed(2);
        const deltaStr = `${delta >= 0 ? "+" : "-"}${Math.abs(delta).toFixed(2)}`;
        const baseStr = format(next);
        const prevStr = format(prevVal);

        // add jackpot color ! ! ! purple + green gradient?
        setDeltaColor(delta >= 0 ? "green" : "red");

        setTrio([prevStr, deltaStr, baseStr]);
        setRtKey((k) => k + 1);

        timers.current.push(
          setTimeout(() => {
            rtRef.current?.jumpTo(1);
            timers.current.push(
              setTimeout(() => {
                rtRef.current?.jumpTo(2);
              }, rotateMs + holdMs),
            );
          }, snapDelayMs),
        );
      } else {
        const b = Number.isFinite(next) ? format(next) : "—";
        setTrio([b, b, b]);
      }

      prev.current = next; // only for real balance changes

      return () => clearTimers();
    }
  }, [value, holdMs, rotateMs, snapDelayMs, leverPullTick]);

  return (
    // Animate the wrapper's WIDTH so siblings slide smoothly. The width tween
    // is the only thing animating this box — no `layout` prop, which would
    // add competing scale corrections and make the text shake. Content must
    // stay left-anchored: right-aligning would snap narrower text sideways
    // the frame it swaps in, before the width tween catches up.
    <motion.span
      initial={false}
      className={`inline-block text-left align-baseline tabular-nums ${className}`}
      style={{ lineHeight: 1, overflow: "hidden" }}
      // Animate from previous measured width to new width
      animate={width === null ? undefined : { width }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      {/* keyed remount resets the odometer to row 0 for each new trio */}
      <RollingText
        key={rtKey}
        ref={rtRef}
        texts={trio}
        deltaColor={deltaColor}
        leverAward={leverAward}
        onActiveWidth={handleActiveWidth}
      />
    </motion.span>
  );
}
