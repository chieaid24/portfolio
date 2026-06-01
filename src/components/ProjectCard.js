"use client";

import RewardProjectLink from "@/components/RewardProjectLink";
import Telescope from "@/icons/Telescope";
import FooterGithub from "@/icons/FooterGithub";
import SimpleArrow from "@/icons/SimpleArrow";
import SkillDisplay from "@/components/SkillDisplay";
import { useMoney } from "@/lib/money-context";
import RewardLink from "./RewardLink";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

const AMP = 3.5; // px of vertical drift each way from rest
const PERIOD = 3.5; // ~seconds for one full up-down float cycle
// Shape of the bob: 0 = pure sine (decelerates to a stop and lingers at the
// top/bottom), 1 = triangle (constant speed, sharp turns). Blending keeps the
// turns rounded but cuts the lingering, so even a small drift feels alive.
const TRI_BLEND = 0.1;
const HOVER_LIFT = 6; // px lifted above the top of the bob while hovered
const HOVER_RETURN = 0.7; // s for the unhover drop to mid-swing; ~1.6 matches the bob's descent speed for a seamless join

export default function ProjectCard({
  title,
  skills_used,
  slug,
  summary,
  github,
  float = false,
  index = 0,
}) {
  const { hasAward } = useMoney();
  const rewardId = `project:${slug}`;
  const clicked = hasAward(rewardId);

  const controls = useAnimationControls();
  const prefersReduced = useReducedMotion();
  const hoveredRef = useRef(false);

  // Every card bobs at the same PERIOD, but each starts at a different point in
  // its cycle so they stay permanently offset and never look synced. Phases are
  // spread with the golden-ratio sequence (well-distributed for any card count)
  // rather than randomly, so no two cards can land close together. Computed once.
  const cfg = useRef(null);
  if (cfg.current === null) {
    const N = 16;
    const phase = (index * 0.618033988749895) % 1;
    const wave = (p) =>
      Array.from({ length: N + 1 }, (_, i) => {
        const f = (i / N + p) % 1; // cycle fraction in [0, 1)
        const sine = -Math.cos(2 * Math.PI * f); // -1..1, peak (-1) at f=0
        const tri = f < 0.5 ? -1 + 4 * f : 3 - 4 * f; // -1..1, same orientation
        return Number(
          (AMP * ((1 - TRI_BLEND) * sine + TRI_BLEND * tri)).toFixed(2),
        );
      });
    cfg.current = {
      period: PERIOD,
      keyframes: wave(phase), // desynced phase — used for the mount entrance
      midKeyframes: wave(0.25), // starts mid-downswing (y=0, falling fastest) — used to resume after hover
    };
  }

  // Ease from the current position into a swing, then loop forever. On mount we
  // ease into the card's desynced phase; on resume (after a hover) we drop into
  // the middle of the downswing (y=0, where the bob is already falling fastest)
  // and continue from there, so the release blends into the bob's own descent
  // instead of braking to a stop at a turning point.
  const startFloat = useCallback((resume = false) => {
    const { keyframes, midKeyframes, period } = cfg.current;
    const frames = resume ? midKeyframes : keyframes;
    controls
      // resume = a steady drop that merges into the bob's mid-swing descent;
      // otherwise this is the one-time ease-in on mount.
      .start({
        y: frames[0],
        transition: {
          duration: resume ? HOVER_RETURN : 0.6,
          ease: resume ? "linear" : "easeOut",
        },
      })
      .then(() => {
        if (!hoveredRef.current) {
          controls.start({
            y: frames,
            transition: {
              duration: period,
              ease: "linear", // easing is baked into the keyframes
              repeat: Infinity,
            },
          });
        }
      });
  }, [controls]);

  useEffect(() => {
    if (!float || prefersReduced) return;
    startFloat();
    return () => controls.stop();
  }, [float, prefersReduced, startFloat, controls]);

  const handleHoverStart = () => {
    if (prefersReduced) return;
    hoveredRef.current = true;
    // Lift slightly above the top of the float range and hold there.
    controls.start({
      y: -(AMP + HOVER_LIFT),
      transition: { duration: 0.6, ease: "easeOut" },
    });
  };

  const handleHoverEnd = () => {
    if (prefersReduced) return;
    hoveredRef.current = false;
    if (float) {
      startFloat(true);
    } else {
      controls.start({ y: 0, transition: { duration: 0.2, ease: "easeOut" } });
    }
  };

  return (
    <motion.div
      animate={controls}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      style={float ? { willChange: "transform" } : undefined}
      className={`h-full rounded-xl p-px transition-shadow duration-200 md:hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]`}
    >
      <div
        className={`font-dm-sans bg-background border-outline-gray h-full rounded-xl border-1 text-white`}
      >
        <RewardProjectLink
          href={`/projects/${slug}`}
          className="mobile:select-none flex h-full flex-col justify-between gap-5 px-5 py-5 sm:gap-8 sm:px-8 sm:py-6"
          rewardId={rewardId}
          ticketValue={1000}
        >
          <div className="">
            <div className="mb-3">
              <h3 className="text-xl font-semibold sm:text-2xl">{title}</h3>
              <span
                className={`flex items-center gap-x-2 text-sm font-light ${clicked ? "text-gray-400" : "text-white"}`}
              >
                <Telescope className="h-3.5 w-3.5" />
                {clicked ? <span>Discovered</span> : <span>Undiscovered</span>}
              </span>
            </div>
            <div className="text-dark-body-text text-sm">{summary}</div>
          </div>
          <div className="">
            <div className="flex flex-wrap gap-2">
              {skills_used.map((skill, i) => {
                const [fileName, displayName] = skill.includes("/")
                  ? skill.split("/", 2)
                  : [skill, undefined];
                return (
                  <SkillDisplay
                    fileName={fileName}
                    displayName={displayName}
                    project={slug}
                    card={true}
                    key={i}
                  />
                );
              })}
            </div>
            <div className="my-5 h-px w-full bg-white/30 sm:my-6"></div>
            <div className="flex justify-between">
              <div className="duration-100 md:hover:translate-x-[2px]">
                <RewardLink
                  href={github}
                  className="flex items-center gap-x-1 rounded-md bg-white px-2 py-1 text-sm font-medium text-black transition-all"
                  rewardId={`${slug}:github`}
                  target="_blank"
                >
                  <FooterGithub className="h-4 w-4" />
                  GitHub
                </RewardLink>
              </div>
              <div className="text-body-text group flex items-center gap-2 transition-all duration-100 md:hover:translate-x-[1px]">
                <span>Explore Project </span>
                <SimpleArrow className="h-2.5 w-2.5 translate-y-[1px] transition-transform md:group-hover:translate-x-[2px]" />
              </div>
            </div>
          </div>
        </RewardProjectLink>
      </div>
    </motion.div>
  );
}
