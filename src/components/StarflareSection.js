"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMoney } from "@/lib/money-context.js";
import { pusherClient } from "@/lib/pusher-client";
import { motion, useAnimate, AnimatePresence } from "framer-motion";
import SparkleIcon from "@/icons/SparkleIcon.js";
import Info from "@/icons/Info.js";

export default function StarflareSection({ cost = 50 }) {
  const { localClickCount, incLocalClickCount, buyStarflare, balance } =
    useMoney();
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const rateLimiterRef = useRef([]);
  const [scope, animate] = useAnimate();
  const [canPurchase, setCanPurchase] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

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
        x: [0, -3, 3, -2, 2, -1, 1, 0],
      },
      {
        duration: 0.3,
        ease: "easeInOut",
        times: [0, 0.12, 0.24, 0.36, 0.48, 0.68, 0.84, 1],
      },
    );
  }, [scope, animate]);

  const raw = localClickCount?.() ?? 0;
  const starflareClickCount = Number.isFinite(raw) ? raw : 0;
  const displayCount = loading || count === null ? "---" : count;

  return (
    <div
      ref={sectionRef}
      className="bg-background-secondary border-outline-dark-gray relative h-full w-full overflow-visible rounded-2xl border px-4 py-2 text-center text-white shadow-[0_0_0_1px_rgba(0,0,0,0.7)]"
    >
      <div className="absolute top-2 right-2">
        <button
          type="button"
          aria-label="Starflare info"
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
          onFocus={() => setShowInfo(true)}
          onBlur={() => setShowInfo(false)}
          className="p-1 transition duration-150 hover:opacity-80"
        >
          <Info className="text-outline-gray/70 h-3 w-3" />
        </button>
      </div>
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="border-outline-dark-gray bg-background-secondary/60 absolute top-8 right-3 z-10 w-48 rounded-xl border p-3 text-left text-xs leading-snug text-white shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-lg"
          >
            {`Starflares can be seen across the universe (real-time and globally persisted). Send a flare to nudge the global counter!`}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-2xl font-semibold tracking-tight">{displayCount}</p>

      <motion.div className="mt-2">
        <motion.button
          ref={scope}
          type="button"
          onClick={handleClick}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className={`bg-highlight-color text-body-text inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold shadow-[0_6px_18px_rgba(0,0,0,0.35)] ${loading || !canPurchase ? "cursor-default opacity-60" : "cursor-pointer"}`}
        >
          Send (${cost})
        </motion.button>
      </motion.div>

      <p className="mt-4 text-sm font-semibold text-white">
        you&apos;ve sent {starflareClickCount} flare
        {starflareClickCount === 1 ? "" : "s"}
      </p>

      {/* ⭐ SPARKLES RENDER */}
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

      {/* ⭐ SPARKLE CSS */}
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
    </div>
  );
}
