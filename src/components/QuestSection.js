import { useMoney } from "@/lib/money-context";
import { motion, useReducedMotion, useAnimationControls } from "framer-motion";
import { useState, useEffect, useRef } from "react";

// Returns integer percent complete, floored to avoid over-reporting.
function toPercent(done = 0, total = 0) {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.floor((done / total) * 100));
}

function ProgressBar({
  done = 0,
  total = 0,
  color = "bg-highlight-color",
  isHovered = false,
}) {
  const pct = toPercent(done, total);
  const isComplete = pct >= 100;
  const fillClass = isComplete ? "gradient-red-orange" : color;

  const controls = useAnimationControls();
  const prefersReduced = useReducedMotion();

  // Fixed shimmer width in pixels
  const SHINE_PX = 60;

  useEffect(() => {
    if (prefersReduced) return;
    if (isHovered) {
      controls.set({ opacity: 1, ["--p"]: 0 });
      controls.start({
        ["--p"]: 1,
        opacity: [0, 1, 0],
        transition: { duration: 1.1, ease: "linear", repeat: Infinity },
      });
    } else {
      controls
        .start({
          ["--p"]: 1,
          opacity: 0,
          transition: { duration: 0.35, ease: "easeOut" },
        })
        .then(() => {
          controls.set({ ["--p"]: 0, opacity: 0 });
        });
    }
  }, [isHovered, controls, prefersReduced]);

  return (
    <motion.div className="w-full py-1">
      {/* Hover target */}
      <motion.div className="bg-outline-dark-gray mt-1 h-1.5 w-full min-w-0 overflow-hidden rounded-full">
        {/* Fill */}
        <div
          className={`relative h-full ${fillClass} rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Shimmer overlay (fixed visual width, container-relative travel) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={controls}
            // --p animates from 0 -> 1; left uses container width (100%) + fixed SHINE_PX overshoot
            style={{
              ["--p"]: 0,
              left: `calc(var(--p) * (100%) - ${SHINE_PX}px)`,
              width: `${SHINE_PX}px`,
            }}
            className="pointer-events-none absolute inset-y-[-2px] rounded-full bg-gradient-to-r from-transparent via-white/80 to-transparent"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function QuestSection({ className = "" }) {
  const { getQuestStats, getCompletedQuests, getAllQuestsComplete } =
    useMoney();
  const stats = getQuestStats();
  const completedQuests = getCompletedQuests();
  const allQuestComp = getAllQuestsComplete();
  const [hoveredRow, setHoveredRow] = useState(null);

  return (
    <div
      className={`${className} text-body-text font-regular flex h-full cursor-default flex-col justify-between space-y-4 text-xs leading-none`}
    >
      <motion.div
        onMouseEnter={() => setHoveredRow("redtext")}
        onMouseLeave={() => setHoveredRow(null)}
        className="border-outline-gray rounded-lg border p-2"
      >
        <div className={`flex w-full justify-between`}>
          <span>Highlighted words clicked </span>
          <motion.span>
            {toPercent(stats.redtext.done, stats.redtext.total)}%
          </motion.span>
        </div>
        <ProgressBar
          done={stats.redtext.done}
          total={stats.redtext.total}
          isHovered={hoveredRow === "redtext"}
        />
      </motion.div>

      <motion.div
        onMouseEnter={() => setHoveredRow("project")}
        onMouseLeave={() => setHoveredRow(null)}
        className="border-outline-gray rounded-lg border p-2"
      >
        <div className={`flex w-full justify-between`}>
          <span>Projects discovered</span>
          <motion.span>
            {toPercent(stats.project.done, stats.project.total)}%
          </motion.span>
        </div>
        <ProgressBar
          done={stats.project.done}
          total={stats.project.total}
          isHovered={hoveredRow === "project"}
        />
      </motion.div>

      <motion.div
        onMouseEnter={() => setHoveredRow("link")}
        onMouseLeave={() => setHoveredRow(null)}
        className="border-outline-gray rounded-lg border p-2"
      >
        <div className={`flex w-full justify-between`}>
          <span>Links followed </span>
          <motion.span>
            {toPercent(stats.link.done, stats.link.total)}%
          </motion.span>
        </div>
        <ProgressBar
          done={stats.link.done}
          total={stats.link.total}
          isHovered={hoveredRow === "link"}
        />
      </motion.div>
    </div>
  );
}
