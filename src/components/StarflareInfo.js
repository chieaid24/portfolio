"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Info from "@/icons/Info.js";

export default function StarflareInfo() {
  const [showInfo, setShowInfo] = useState(false);
  const [toggleShowInfo, setToggleShowInfo] = useState(false);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        aria-label="Starflare info"
        onMouseEnter={() => setShowInfo(true)}
        onMouseLeave={() => setShowInfo(false)}
        onClick={() => setToggleShowInfo((v) => !v)}
        onBlur={() => {
          setShowInfo(false);
          setToggleShowInfo(false);
        }}
        className={`${showInfo || toggleShowInfo ? "text-highlight-color/50" : "text-outline-gray/70"} hover:text-highlight-color/50 p-1 transition duration-150 -translate-y-[0.5px]`}
      >
        <Info className="h-3 w-3" />
      </button>
      <AnimatePresence>
        {(showInfo || toggleShowInfo) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="border-highlight-color/20 bg-background-secondary/80 absolute top-full -right-2 z-20 mt-1 w-48 max-w-[10rem] rounded-xl border-[1px] p-3 text-left text-xs leading-snug text-white shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-lg"
          >
            Real-time and globally persisted. Click to leave your mark on the universe.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
