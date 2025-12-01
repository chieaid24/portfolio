"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ToolTip({
  trigger = 0,
  duration = 800,
  children,
  className = "",
}) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  // Show tooltip whenever trigger increments
  useEffect(() => {
    if (!trigger) return;
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      timerRef.current = null;
    }, duration);
  }, [trigger, duration]);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -1 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -1 }}
          transition={{ duration: 0.2 }}
          className={`bg-dark-grey-text absolute left-1/2 z-[9999] mt-14 -translate-x-4/5 rounded-md px-2 py-1 text-[10px] font-medium whitespace-nowrap text-white ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
