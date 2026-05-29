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

const AMP = 8; // px of vertical drift each way from rest
const PERIOD = 7; // ~seconds for one full up-down float cycle

export default function ProjectCard({
  title,
  skills_used,
  slug,
  summary,
  github,
  float = false,
}) {
  const { hasAward } = useMoney();
  const rewardId = `project:${slug}`;
  const clicked = hasAward(rewardId);

  const controls = useAnimationControls();
  const prefersReduced = useReducedMotion();
  const hoveredRef = useRef(false);

  // Per-card random phase + slight period jitter so cards bob out of sync and
  // slowly drift apart over time. Computed once; never rendered to the DOM, so
  // it's hydration-safe even though it uses Math.random().
  const cfg = useRef(null);
  if (cfg.current === null) {
    const N = 16;
    const phase = Math.random();
    cfg.current = {
      period: PERIOD * (0.85 + Math.random() * 0.3),
      keyframes: Array.from({ length: N + 1 }, (_, i) =>
        Number((-AMP * Math.cos(2 * Math.PI * (i / N + phase))).toFixed(2)),
      ),
    };
  }

  // Ease from the current position into the card's phase, then loop forever.
  // Used both on mount and to resume smoothly after a hover releases.
  const startFloat = useCallback(() => {
    const { keyframes, period } = cfg.current;
    controls
      .start({ y: keyframes[0], transition: { duration: 0.8, ease: "easeInOut" } })
      .then(() => {
        if (!hoveredRef.current) {
          controls.start({
            y: keyframes,
            transition: {
              duration: period,
              ease: "linear", // easing is baked into the cosine keyframes
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
    // Bob up to the top of the float range and hold there.
    controls.start({ y: -AMP, transition: { duration: 0.6, ease: "easeOut" } });
  };

  const handleHoverEnd = () => {
    if (prefersReduced) return;
    hoveredRef.current = false;
    if (float) {
      startFloat();
    } else {
      controls.start({ y: 0, transition: { duration: 0.5, ease: "easeOut" } });
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
