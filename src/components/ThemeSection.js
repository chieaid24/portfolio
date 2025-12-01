"use client";

import { useState } from "react";
import CurrencySymbol from "@/icons/CurrencySymbol";

const THEME_OPTIONS = [
  { id: "red", label: "Red", color: "#ff7d7d", price: 0 },
  { id: "neon-green", label: "Neon Green", color: "#22ff5a", price: 100 },
  { id: "solar-flare", label: "Solar Flare", color: "#ff7b3a", price: 100 },
  { id: "cosmic-blue", label: "Cosmic Blue", color: "#38bdf8", price: 250 },
  { id: "violet-shift", label: "Violet Shift", color: "#c084fc", price: 250 },
  { id: "midnight", label: "Midnight", color: "#020617", price: 250 },
];

export default function ThemeSection() {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div>
      <div className="border-outline-gray h-full rounded-2xl border">
        <div className="grid grid-cols-3 gap-2 p-2">
          {THEME_OPTIONS.map((theme) => {
            const isSelected = selectedId === theme.id;

            return (
              <button
                key={theme.id}
                type="button"
                aria-label={`${theme.label} for ₳ ${theme.price}`}
                aria-pressed={isSelected}
                onClick={() => setSelectedId(theme.id)}
                className={`group relative aspect-[1] rounded-xl border transition duration-100 hover:-translate-y-[2px] ${
                  isSelected
                    ? "border-[#ff7b7b] hover:border-[#ff7b7b]"
                    : "border-white/12 hover:border-white/40"
                }`}
              >
                <div
                  className="absolute inset-[5px] rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-shadow group-hover:shadow-[0_0_26px_rgba(255,255,255,0.16)]"
                  style={{ backgroundColor: theme.color }}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/15 opacity-0 transition-opacity duration-100 group-hover:opacity-80" />
                <div className="pointer-events-none absolute inset-x-1 bottom-2 flex justify-center">
                  <span className="flex items-center rounded-full bg-black/80 px-2 py-[2px] text-xs font-semibold text-white shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
                    <span className="noto-symbol">₳ </span> {theme.price}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
