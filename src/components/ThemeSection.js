"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useMoney, THEME_OPTIONS } from "@/lib/money-context";
import {
  motion,
  AnimatePresence,
  useAnimate,
  useReducedMotion,
} from "framer-motion";

export default function ThemeSection({ ...props }) {
  const { themeId, setThemeById, purchaseTheme, ownedThemes, balance } =
    useMoney();
  const [selectedId, setSelectedId] = useState(themeId ?? "blue");
  const [scope, animate] = useAnimate();
  const buttonRefs = useRef({});
  const innerRefs = useRef({});
  const haloNonce = useRef(0);
  const [jigglingId, setJigglingId] = useState(null);
  const [halo, setHalo] = useState(null); // { id, scale, nonce }
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setSelectedId(themeId ?? "blue");
  }, [themeId]);

  const handleSelect = (id) => {
    const isOwned = ownedThemes?.includes?.(id);
    if (isOwned) {
      setSelectedId(id);
      setThemeById?.(id);
      releaseHalo(id, 1.4);
      return;
    }

    const result = purchaseTheme?.(id);
    if (result?.success) {
      setSelectedId(id);
      purchasePop(id);
    } else {
      underflowJiggle(id);
    }
  };

  const underflowJiggle = useCallback(
    async (id) => {
      const target = buttonRefs.current[id];
      if (!target) return;

      setJigglingId(id);

      try {
        await animate(
          target,
          {
            x: [0, -3, 3, -2, 2, 0],
          },
          {
            duration: 0.3,
            ease: "easeOut",
            times: [0, 0.18, 0.36, 0.54, 0.72, 1],
          },
        );
      } finally {
        setJigglingId(null);
      }
    },
    [animate],
  );

  // Release an expanding halo ring from a swatch. A plain color change uses a
  // small halo; a purchase uses a wider one. The nonce restarts it every time.
  const releaseHalo = useCallback(
    (id, scale) => {
      if (shouldReduceMotion) return;
      haloNonce.current += 1;
      setHalo({ id, scale, nonce: haloNonce.current });
    },
    [shouldReduceMotion],
  );

  // Successful purchase: the fill dips inward and settles flush at scale 1 (no
  // overshoot past its frame), alongside a wide halo ring.
  const purchasePop = useCallback(
    (id) => {
      if (shouldReduceMotion) return;
      const target = innerRefs.current[id];
      if (target) {
        animate(
          target,
          { scale: [0.92, 1] },
          { type: "spring", bounce: 0, duration: 0.7 },
        );
      }
      releaseHalo(id, 1.55);
    },
    [animate, shouldReduceMotion, releaseHalo],
  );

  const setButtonRef = useCallback((id, node) => {
    if (node) {
      buttonRefs.current[id] = node;
    } else {
      delete buttonRefs.current[id];
    }
  }, []);

  return (
    <motion.div
      ref={scope}
      className="border-outline-darker-gray bg-background-secondary relative flex h-full justify-center rounded-2xl border"
      key="projects-themes"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: 0.1 }}
    >
      <div className="mx-auto my-auto grid grid-cols-3 gap-2.5 p-2.5 sm:gap-5 sm:p-5 md:gap-5 lg:gap-5 lg:p-5">
        {THEME_OPTIONS.map((theme) => {
          const isSelected = selectedId === theme.id;
          const isOwned = ownedThemes?.includes?.(theme.id);
          const canAfford = Number(theme.price) <= (balance ?? 0);
          const isLocked = !isOwned && !canAfford;

          return (
            <div
              key={theme.id}
              className="relative h-12 w-12 sm:h-14 sm:w-14 lg:h-[51px] lg:w-[51px]"
            >
              <motion.button
                ref={(node) => setButtonRef(theme.id, node)}
                type="button"
                aria-label={`${theme.label} for ₳ ${theme.price}`}
                aria-pressed={isSelected}
                onClick={() => handleSelect(theme.id)}
                animate={{
                  boxShadow: isSelected
                    ? `0 0 7px 3px ${theme.color}30`
                    : "0 0 0px 0px rgba(0,0,0,0)",
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`relative h-full w-full overflow-hidden rounded-xl border-2 ${
                  isLocked ? "cursor-default" : "cursor-pointer"
                } ${
                  isSelected
                    ? "border-highlight-color/80"
                    : jigglingId === theme.id
                      ? "border-[#ff6161]/70"
                      : isLocked
                        ? "border-white/30 light:border-outline-dark-gray/70"
                        : "border-white/30 light:border-outline-dark-gray/70 hover:border-white/50 light:hover:border-outline-dark-gray/80"
                } `}
                style={{ transition: "border-color 200ms ease" }}
              >
                <motion.div
                  ref={(node) => {
                    if (node) innerRefs.current[theme.id] = node;
                    else delete innerRefs.current[theme.id];
                  }}
                  className={`absolute inset-[3px] rounded-[7px] transition-opacity duration-200 ${isLocked ? "opacity-40" : "opacity-100"}`}
                  style={{
                    backgroundColor: theme.color,
                  }}
                />
                <div className="pointer-events-none absolute inset-0" />
                <AnimatePresence initial={false}>
                  {!isOwned && (
                    <motion.div
                      key="price"
                      className="pointer-events-none absolute inset-x-1 bottom-1.5 flex justify-center"
                      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -4 }}
                      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <span
                        className={`flex items-center rounded-full bg-black/80 light:bg-black/60 px-[5px] py-[2px] text-xs font-semibold transition duration-200 ${
                          jigglingId === theme.id
                            ? "text-[#ff6161] opacity-60"
                            : isLocked
                              ? "text-white opacity-60"
                              : "text-white opacity-100"
                        }`}
                      >
                        <span className="noto-symbol">₳ </span> {theme.price}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
              {halo?.id === theme.id && (
                <motion.span
                  key={halo.nonce}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-xl border-2"
                  style={{ borderColor: theme.color }}
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: halo.scale, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  onAnimationComplete={() =>
                    setHalo((cur) =>
                      cur && cur.nonce === halo.nonce ? null : cur,
                    )
                  }
                />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
