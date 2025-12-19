"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useMoney, THEME_OPTIONS } from "@/lib/money-context";
import { motion, useAnimate } from "framer-motion";

export default function ThemeSection({ ...props }) {
  const { themeId, setThemeById, purchaseTheme, ownedThemes } = useMoney();
  const [selectedId, setSelectedId] = useState(themeId ?? "coral");
  const [scope, animate] = useAnimate();
  const buttonRefs = useRef({});
  const [jigglingId, setJigglingId] = useState(null);

  useEffect(() => {
    setSelectedId(themeId ?? "coral");
  }, [themeId]);

  const handleSelect = (id) => {
    const isOwned = ownedThemes?.includes?.(id);
    if (isOwned) {
      setSelectedId(id);
      setThemeById?.(id);
      return;
    }

    const result = purchaseTheme?.(id);
    if (result?.success) {
      setSelectedId(id);
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
      className="border-outline-dark-gray bg-background-secondary flex h-full justify-center rounded-2xl border"
      key="projects-themes"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: 0.1 }}
    >
      <div className="grid grid-cols-3 justify-items-center gap-4 p-4 sm:gap-3 sm:p-4 md:gap-5 lg:gap-5 lg:p-5">
        {THEME_OPTIONS.map((theme) => {
          const isSelected = selectedId === theme.id;
          const isOwned = ownedThemes?.includes?.(theme.id);

          return (
            <motion.button
              ref={(node) => setButtonRef(theme.id, node)}
              key={theme.id}
              type="button"
              aria-label={`${theme.label} for ₳ ${theme.price}`}
              aria-pressed={isSelected}
              onClick={() => handleSelect(theme.id)}
              className={`group relative aspect-[1] transform cursor-pointer overflow-visible rounded-xl border-2 transition duration-200 ${
                isSelected
                  ? "border-highlight-color/80"
                  : jigglingId === theme.id
                    ? "border-[#ff6161]"
                    : "border-white/30 hover:border-white/50"
              } `}
              style={{ transition: "border-color 200ms ease" }}
            >
              <motion.div
                className="absolute inset-[3px] rounded-[8px] sm:rounded-[8px]"
                style={{
                  backgroundColor: theme.color,
                }}
              />
              <div className="pointer-events-none absolute inset-0" />
              {!isOwned && (
                <div className="pointer-events-none absolute inset-x-1 bottom-1.5 flex justify-center">
                  <span className="flex items-center rounded-full bg-black/80 px-[5px] py-[2px] text-xs font-semibold text-white">
                    <span className="noto-symbol">₳ </span> {theme.price}
                  </span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
