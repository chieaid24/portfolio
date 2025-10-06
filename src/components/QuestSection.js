import { useMoney } from '@/lib/money-context';
import { motion, useReducedMotion, useAnimationControls } from "framer-motion";
import { useState, useEffect, useRef } from "react";



function ProgressBar({
  done = 0,
  total = 0,
  color = 'bg-custom-red',
  isHovered = false,
  flash = false,
}) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  const isComplete = pct >= 100;
  const fillClass = isComplete ? 'gradient-red-orange' : color;

  const controls = useAnimationControls();
  const prefersReduced = useReducedMotion();

  // Fixed shimmer width in pixels
  const SHINE_PX = 60;

  useEffect(() => {
    if (prefersReduced) return;
    if (isHovered) {
      controls.set({ opacity: 1, ['--p']: 0 });
      controls.start({
        ['--p']: 1,
        opacity: [0, 1, 0],
        transition: { duration: 1.1, ease: 'linear', repeat: Infinity },
      });
    } else {
      controls.start({
        ['--p']: 1,
        opacity: 0,
        transition: { duration: 0.35, ease: 'easeOut' },
      }).then(() => {
        controls.set({ ['--p']: 0, opacity: 0 });
      });
    }
  }, [isHovered, controls, prefersReduced]);

  return (
    <motion.div className="w-full lg:w-4/5 5xl:w-6/7 py-1">
      {/* Hover target */}
      <motion.div
        className="mt-1 h-[8px] 5xl:h-[9px] w-full rounded-full overflow-hidden min-w-0"
        animate={
          flash
            ? { backgroundColor: ["#D9D9D9", "#FFB2B2", "#D9D9D9"] } // grey → white → grey
            : { backgroundColor: "#D9D9D9" } // Tailwind gray-200 fallback
        }
        transition={{ duration: 0.6, ease: "easeInOut" }}

      >
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
              ['--p']: 0,
              left: `calc(var(--p) * (100%) - ${SHINE_PX}px)`,
              width: `${SHINE_PX}px`,
            }}
            className="
              pointer-events-none absolute inset-y-[-2px]
              rounded-full
              bg-gradient-to-r from-transparent via-white/80 to-transparent
            "
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export const flashAnimation = {
  flash: {
    fontVariationSettings: ['"wght" 500', '"wght" 900', '"wght" 500'],
    transition: {
      duration: 1,
      ease: "easeInOut",
      color: { duration: 0.8 },
      fontVariationSettings: { duration: 0.8 },
    },
  },
  idle: {
    color: "#919191",
    fontVariationSettings: '"wght" 500',
  },
};

export default function QuestSection({ className = "", triggerFlash = 0, onQuestClick }) {
  const { getQuestStats, getCompletedQuests, getAllQuestsComplete } = useMoney();
  const stats = getQuestStats();
  const completedQuests = getCompletedQuests();
  const allQuestComp = getAllQuestsComplete();
  const [hoveredRow, setHoveredRow] = useState(null);
  const [flash, setFlash] = useState(false);

  // Track last triggerFlash value
  const lastTriggerRef = useRef(triggerFlash);

  useEffect(() => {
    if (triggerFlash !== lastTriggerRef.current) {
      lastTriggerRef.current = triggerFlash;

      if (triggerFlash > 0) {
        setFlash(true);
        const timeout = setTimeout(() => setFlash(false), 500);
        return () => clearTimeout(timeout);
      }
    }
  }, [triggerFlash]);


  return (
    <div
      className={`${className} pt-2 pb-2 5xl:pt-[12px] 5xl:pb-1 leading-none space-y-2 text-[10px] 5xl:text-[12px]  text-light-grey-text md:text-header-light font-medium tracking-wide  cursor-default
                        lg:ml-2 origin-center`}
      onClick={!allQuestComp ? (() => onQuestClick?.()) : undefined}>
      <motion.div
        onMouseEnter={() => setHoveredRow('red')}
        onMouseLeave={() => setHoveredRow(null)}
        className="5xl:pt-0.5 5xl:pb-2 5xl:mb-0"
        animate={
          !completedQuests.redtext && flash
            ? {
              // scale: 1.05,
              x: [0, -2, 2, -2, 2, -2, 0], // 👈 tiny shake
            }
            : { x: 0 }
        }
        transition={{
          x: { duration: 0.4, ease: "easeInOut" },
        }}
      >
        <p
          className={`mb-[-4px] transition-colors duration-200`}

        >red words found:{" "}
          <motion.span
            className="font-semibold inline-block "
            variants={flashAnimation}
            animate={
              !completedQuests.redtext && flash ? "flash" : "idle"
            }
            layout>
            {stats.redtext.done}/{stats.redtext.total}
          </motion.span>
        </p>
        <ProgressBar done={stats.redtext.done} total={stats.redtext.total} isHovered={hoveredRow === 'red'}
          flash={flash && !completedQuests.redtext} />
      </motion.div>

      <motion.div
        onMouseEnter={() => setHoveredRow('projects')}
        onMouseLeave={() => setHoveredRow(null)}
        className="5xl:pt-0.5 5xl:pb-2 5xl:mb-0"
        animate={
          !completedQuests.project && flash
            ? {
              // scale: 1.05,
              x: [0, -2, 2, -2, 2, -2, 0], // 👈 tiny shake
            }
            : { x: 0 }
        }
        transition={{
          x: { duration: 0.4, ease: "easeInOut" },
        }}
      >
        <p className="mb-[-4px]">projects discovered:{" "}
          <motion.span
            className="font-semibold inline-block "
            variants={flashAnimation}
            animate={
              !completedQuests.project && flash ? "flash" : "idle"
            }
            layout
          >
            {stats.project.done}/{stats.project.total}
          </motion.span>
        </p>
        <ProgressBar done={stats.project.done} total={stats.project.total} isHovered={hoveredRow === 'projects'}
          flash={flash && !completedQuests.project} />
      </motion.div>

      <motion.div
        onMouseEnter={() => setHoveredRow('links')}
        onMouseLeave={() => setHoveredRow(null)}
        className="5xl:pt-0.5 5xl:pb-2 5xl:mb-0"
        animate={
          !completedQuests.link && flash
            ? {
              // scale: 1.05,
              x: [0, -2, 2, -2, 2, -2, 0], // 👈 tiny shake
            }
            : { x: 0 }
        }
        transition={{
          x: { duration: 0.4, ease: "easeInOut" },
        }}
      >
        <p className="mb-[-4px]">links followed:{" "}
          <motion.span
            className="font-semibold inline-block "
            variants={flashAnimation}
            animate={
              !completedQuests.link && flash ? "flash" : "idle"
            }
            layout
          >
            {stats.link.done}/{stats.link.total}
          </motion.span></p>
        <ProgressBar done={stats.link.done} total={stats.link.total} isHovered={hoveredRow === 'links'}
          flash={flash && !completedQuests.link} />
      </motion.div>
    </div >
  );
}

