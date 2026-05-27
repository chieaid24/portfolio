"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMoney } from "@/lib/money-context.js";
import { pusherClient } from "@/lib/pusher-client";
import { motion, useAnimate } from "framer-motion";
import SparkleIcon from "@/icons/SparkleIcon.js";

export default function StarflareSection({ cost = 25 }) {
  const { localClickCount, incLocalClickCount, buyStarflare, balance } =
    useMoney();
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const rateLimiterRef = useRef([]);
  const [scope, animate] = useAnimate();
  const [canPurchase, setCanPurchase] = useState(false);

  const sectionRef = useRef(null);
  const [sparkles, setSparkles] = useState([]);

  const spawnSparkle = useCallback(() => {
    const id = Math.random();
    const x = Math.random() * 100;
    const y = Math.random() * 30;

    setSparkles((prev) => [...prev, { id, x, y }]);

    // cleanup after animation
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== id));
    }, 2000);
  }, []);

  const tapPulse = useCallback(() => {
    if (!scope.current) return;
    animate(
      scope.current,
      { scale: [1, 0.88, 1] },
      { duration: 0.08, ease: "easeInOut" },
    );
  }, [scope, animate]);

  const handleClick = () => {
    if (loading) return;
    const purchased = buyStarflare?.(cost);
    if (!purchased) {
      underflowJiggle();
      return;
    }

    tapPulse();
    incLocalClickCount();
    incrementGlobal();

    spawnSparkle();
  };

  // fetch, pusher, underflow jiggle etc
  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/counter");
        const data = await res.json();
        setCount(data.count);
      } catch (err) {
        console.error("Failed to fetch counter:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCount();
  }, []);

  useEffect(() => {
    if (balance < cost) {
      setCanPurchase(false);
      return;
    }
    setCanPurchase(true);
  }, [balance, cost]);

  useEffect(() => {
    let channel;
    const handleUpdate = (data) => {
      if (typeof data.count !== "number") return;

      let shouldSparkle = false;
      setCount((prev) => {
        const safe = Number.isFinite(prev) ? prev : 0;
        shouldSparkle = data.count > safe;
        return shouldSparkle ? data.count : safe;
      });
      if (shouldSparkle) spawnSparkle();
    };

    try {
      channel = pusherClient.subscribe("global-counter");
      channel.bind("updated", handleUpdate);
    } catch (err) {
      console.error(err);
      return () => {};
    }

    return () => {
      channel?.unbind("updated", handleUpdate);
      pusherClient.unsubscribe("global-counter");
    };
  }, [spawnSparkle]);

  // increment global counter
  function incrementGlobal() {
    const now = Date.now();
    const windowStart = now - 10000;
    const recent = rateLimiterRef.current.filter((ts) => ts > windowStart);
    const rateLimited = recent.length >= 25;
    rateLimiterRef.current = recent;

    setCount((prev) => {
      const safe = Number.isFinite(prev) ? prev : 0;
      return safe + 1;
    });

    if (rateLimited) return;

    rateLimiterRef.current = [...recent, now];

    fetch("/api/counter/increment", { method: "POST" }).catch((err) =>
      console.error("Failed to increment counter:", err),
    );
  }

  const underflowJiggle = useCallback(() => {
    if (!scope.current) return;
    animate(
      scope.current,
      {
        x: [0, -3, 3, -2, 2, 0],
      },
      {
        duration: 0.3,
        ease: "easeInOut",
        times: [0, 0.18, 0.36, 0.54, 0.72, 1],
      },
    );
  }, [scope, animate]);

  const raw = localClickCount?.() ?? 0;
  const starflareClickCount = Number.isFinite(raw) ? raw : 0;
  const displayCount = loading || count === null ? "---" : count;

  return (
    <motion.div
      ref={sectionRef}
      className="bg-background-secondary border-outline-dark-gray relative h-full w-full overflow-visible rounded-2xl border px-3 py-3 text-center text-white"
      key="starflare-section"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: 0.15 }}
    >
      <h2 className="text-body-text mt-3 text-3xl font-semibold">
        {displayCount}
      </h2>

      <motion.div className="mt-1 sm:mt-3">
        <motion.button
          ref={scope}
          type="button"
          onClick={handleClick}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className={`bg-highlight-color text-md items-center justify-center rounded-lg px-4.5 py-2.5 leading-4 font-semibold text-white shadow-[0_6px_18px_rgba(0,0,0,0.35)] ${loading || !canPurchase ? "cursor-default opacity-60" : "cursor-pointer opacity-100"}`}
        >
          CLICK ME
        </motion.button>
      </motion.div>

      <p className="text-outline-gray mt-3 text-[9px] font-medium sm:text-xs">
        You&apos;ve sent {starflareClickCount} flare
        {starflareClickCount === 1 ? "" : "s"}.
      </p>

      {sparkles.map((s) => (
        <div
          key={s.id}
          className="animate-sparkle pointer-events-none absolute text-lg font-bold text-white select-none"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
          }}
        >
          <SparkleIcon className="h-4 w-4" />
        </div>
      ))}

      <style jsx>{`
        @keyframes sparkle {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0);
          }
          20% {
            opacity: 1;
            transform: translateY(-10px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px) scale(0.5);
          }
        }

        .animate-sparkle {
          animation: sparkle 2s ease-out forwards;
        }
      `}</style>
    </motion.div>
  );
}
