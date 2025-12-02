"use client";

import { useEffect, useState } from "react";
import { useMoney, THEME_OPTIONS } from "@/lib/money-context";

export default function ThemeSection({ ...props }) {
  const { themeId, setThemeById, purchaseTheme, ownedThemes } = useMoney();
  const [selectedId, setSelectedId] = useState(themeId ?? "coral");

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
    }
  };

  return (
    <div className="border-outline-dark-gray bg-background-secondary flex h-full justify-center rounded-2xl border">
      <div className="grid grid-cols-3 justify-items-center gap-5 p-5">
        {THEME_OPTIONS.map((theme) => {
          const isSelected = selectedId === theme.id;
          const isOwned = ownedThemes?.includes?.(theme.id);

          return (
            <button
              key={theme.id}
              type="button"
              aria-label={`${theme.label} for ₳ ${theme.price}`}
              aria-pressed={isSelected}
              onClick={() => handleSelect(theme.id)}
              className={`group relative aspect-[1] rounded-2xl border-2 transition duration-100 hover:-translate-y-[2px] ${
                isSelected
                  ? "border-highlight-color"
                  : "border-white/30 hover:border-white/40"
              }`}
            >
              <div
                className="absolute inset-[3px] rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-shadow group-hover:shadow-[0_0_26px_rgba(255,255,255,0.16)]"
                style={{ backgroundColor: theme.color }}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/15 opacity-0 transition-opacity duration-100 group-hover:opacity-80" />
              {!isOwned && (
                <div className="pointer-events-none absolute inset-x-1 bottom-2 flex justify-center">
                  <span className="flex items-center rounded-full bg-black/80 px-2 py-[2px] text-xs font-semibold text-white shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
                    <span className="noto-symbol">₳ </span> {theme.price}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
