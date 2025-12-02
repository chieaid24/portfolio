"use client";
import { useState } from "react";
import { useMoney } from "@/lib/money-context";

export default function RedText({
  rewardId,
  kind = "redtext",
  children,
  weight = "bold", // 'bold' | 'semibold'
  className = "",
}) {
  const { awardOnce, hasAward } = useMoney();
  const claimed = hasAward(rewardId);
  const [popping, setPopping] = useState(false);

  const weightOverride = weight === "semibold" ? "!font-semibold" : "";

  const handleClick = () => {
    if (claimed) return;
    const paid = awardOnce(rewardId, kind);
    if (paid) {
      // retrigger animation
      setPopping(false);
      requestAnimationFrame(() => setPopping(true));
      setTimeout(() => setPopping(false), 200); // match keyframe duration
    }
  };

  return (
    <>
      <span
        onClick={handleClick}
        className={` ${claimed ? "text-highlight-color/60 cursor-default dark:opacity-100" : "cursor-pointer"} custom-bold text-highlight-color ${weightOverride} ${popping ? "pop" : ""} ${className} inline-block`}
        role="button"
        aria-pressed={claimed}
        data-reward-click
      >
        {children}
      </span>

      <style jsx>{`
        .pop {
          animation: redtext-pop 200ms ease-out;
          will-change: transform;
        }
        @keyframes redtext-pop {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.96);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
