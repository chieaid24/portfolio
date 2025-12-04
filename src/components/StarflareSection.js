"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { useMoney } from "@/lib/money-context.js";
import { pusherClient } from "@/lib/pusher-client";
import { motion, useAnimate } from "framer-motion";
import SparkleIcon from "@/icons/SparkleIcon.js";

export default function StarflareSection({ cost = 50 }) {
  const { localClickCount, incLocalClickCount, buyStarflare } = useMoney();
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const rateLimiterRef = useRef([]);
  const [scope, animate] = useAnimate();

  const sectionRef = useRef(null);
  const [sparkles, setSparkles] = useState([]);

  const spawnSparkle = useCallback(() => {
    const id = Math.random();
    const x = Math.random() * 100;
    const y = Math.random() * 50;

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
    let channel;
    const handleUpdate = (data) => {
      if (typeof data.count !== "number") return;

      const safe = Number.isFinite(count) ? count : 0;
      const updated = data.count > safe ? data.count : safe;
      setCount(updated);

      // spawnSparkle();
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
  }, []);

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
        x: [0, -10, 10, -6, 6, -3, 3, 0],
        opacity: [1, 0.8, 0.8, 0.8, 0.8, 0.9, 0.9, 1],
      },
      {
        duration: 0.5,
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
      <p className="text-3xl font-semibold tracking-tight">{displayCount}</p>

      <motion.div className="mt-2">
        <motion.button
          ref={scope}
          type="button"
          onClick={handleClick}
          disabled={loading}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className={`${loading ? "cursor-not-allowed opacity-60" : ""} bg-highlight-color text-body-text inline-flex cursor-pointer items-center justify-center rounded-full px-4 py-2 text-sm font-semibold shadow-[0_6px_18px_rgba(0,0,0,0.35)]`}
        >
          Send (${cost})
        </motion.button>
      </motion.div>

      <p className="mt-4 text-sm font-semibold text-white">
        you've sent {starflareClickCount} flare
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
