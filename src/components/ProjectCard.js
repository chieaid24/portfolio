"use client";

import RewardProjectLink from "@/components/RewardProjectLink";
import Telescope from "@/icons/Telescope";
import PlanetRing from "@/icons/PlanetRing";
import PlanetRingLine from "@/icons/PlanetRingLine";
import FooterGithub from "@/icons/FooterGithub";
import Globe from "@/icons/Globe";
import SimpleArrow from "@/icons/SimpleArrow";
import SkillDisplay from "@/components/SkillDisplay";
import { useMoney } from "@/lib/money-context";
import RewardLink from "./RewardLink";
import Image from "next/image";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

const AMP = 3.5; // half the bob range; the bob spans 2*AMP, sitting entirely below the layout position (see wave())
const PERIOD = 3.7; // ~seconds for one full up-down float cycle
// Shape of the bob: 0 = pure sine (decelerates to a stop and lingers at the
// top/bottom), 1 = triangle (constant speed, sharp turns). Blending keeps the
// turns rounded but cuts the lingering, so even a small drift feels alive.
const TRI_BLEND = 0.1;
// The bob sits below the card's resting spot: its top is HOVER_LIFT px down, so
// hovering lifts the card by HOVER_LIFT back up to its natural y=0.
const HOVER_LIFT = 5;
const HOVER_RETURN = 0.7; // seconds for the post-hover drop back into the bob

const BOB_QUERY = "(min-width: 768px)"; // Tailwind md breakpoint

const subscribeToBobQuery = (onChange) => {
  const mql = window.matchMedia(BOB_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};

// The bob only makes sense paired with hover: the card rests HOVER_LIFT px low
// and hover lifts it back to y=0. Below md there is no hover (every hover style
// on this site is md:hover:-gated), so the bob stops there and the card sits at
// its natural y=0. The server can't know the viewport, so it reports "no bob"
// and hydration turns it on; first paint is still either way.
function useBobEnabled(float) {
  const wide = useSyncExternalStore(
    subscribeToBobQuery,
    () => window.matchMedia(BOB_QUERY).matches,
    () => false,
  );

  return float && wide;
}

export default function ProjectCard({
  title,
  skills_used,
  slug,
  summary,
  image,
  github,
  website,
  github_only = false,
  float = false,
  darkOutline = false,
  index = 0,
}) {
  const { hasAward } = useMoney();
  const rewardId = `project:${slug}`;
  const clicked = hasAward(rewardId);

  const controls = useAnimationControls();
  const prefersReduced = useReducedMotion();
  const bobs = useBobEnabled(float);
  const hoveredRef = useRef(false);
  const mountedRef = useRef(false);

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
        const bob = (1 - TRI_BLEND) * sine + TRI_BLEND * tri; // -1..1
        return Number((HOVER_LIFT + AMP * (1 + bob)).toFixed(2)); // HOVER_LIFT (top) .. HOVER_LIFT+2*AMP (bottom)
      });
    cfg.current = {
      period: PERIOD,
      keyframes: wave(phase), // mount: this card's desynced phase
      midKeyframes: wave(0.25), // resume: the bob's mid-downswing (y = HOVER_LIFT + AMP)
    };
  }

  // Ease into the bob loop, then repeat. On resume (after a hover) we drop into
  // the mid-downswing so the release blends into the bob rather than stopping at
  // a turning point; on mount we ease into the card's desynced phase.
  const startFloat = useCallback((resume = false) => {
    const { keyframes, midKeyframes, period } = cfg.current;
    const frames = resume ? midKeyframes : keyframes;
    controls
      .start({
        y: frames[0],
        transition: {
          duration: resume ? HOVER_RETURN : 0.4,
          ease: resume ? "linear" : "easeOut",
        },
      })
      .then(() => {
        if (mountedRef.current && !hoveredRef.current) {
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
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!bobs || prefersReduced) {
      // Crossing below md mid-bob leaves the card parked at an arbitrary y;
      // settle it back to its layout position.
      if (float) controls.start({ y: 0, transition: { duration: 0.2, ease: "easeOut" } });
      return;
    }
    startFloat();
    return () => controls.stop();
  }, [bobs, float, prefersReduced, startFloat, controls]);

  const handleHoverStart = () => {
    if (prefersReduced) return;
    hoveredRef.current = true;
    // Lift by HOVER_LIFT: a floating card floats up to its natural y=0; a
    // non-floating card (resting at y=0) lifts to -HOVER_LIFT.
    controls.start({
      y: bobs ? 0 : -HOVER_LIFT,
      transition: { duration: 0.3, ease: "easeOut" },
    });
  };

  const handleHoverEnd = () => {
    if (prefersReduced) return;
    hoveredRef.current = false;
    if (bobs) {
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
      style={bobs ? { willChange: "transform" } : undefined}
      className={`h-full rounded-xl p-px transition-shadow duration-200 md:hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] light:md:hover:shadow-[0_0_25px_rgba(255,250,240,0.7)]`}
    >
      <div
        className={`font-dm-sans bg-background h-full rounded-xl border-1 text-main-text transition-colors duration-300 ${
          darkOutline
            ? "border-outline-dark-gray md:hover:border-outline-gray"
            : "border-outline-gray"
        }`}
      >
        <RewardProjectLink
          href={github_only ? github : `/projects/${slug}`}
          external={github_only}
          alsoAward={
            github_only ? { id: `${slug}:github`, kind: "link" } : undefined
          }
          className="mobile:select-none flex h-full flex-col justify-between gap-5 px-5 py-5 sm:gap-7 sm:px-7 sm:py-7"
          rewardId={rewardId}
          ticketValue={1000}
        >
          <div className="">
            {/* Preview image; falls back to a placeholder box when `image` is unset */}
            <div className="relative mb-5 mx-0 aspect-[2/1] overflow-hidden rounded-lg border border-main-text/5 bg-main-text/[0.02]">
              {image ? (
                <Image
                  src={image}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Telescope className="h-8 w-8 text-main-text/15" />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span
                className={`mb-1 flex items-center gap-x-1 font-medium text-sm ${clicked ? "text-highlight-color/70" : "text-highlight-color"}`}
              >
                {clicked ? (
                  <PlanetRingLine className="h-3.5 w-3.5" />
                ) : (
                  <PlanetRing className="h-3.5 w-3.5" />
                )}
                {clicked ? <span>Discovered</span> : <span>Undiscovered</span>}
              </span>
              <h3 className="mb-1.5 text-lg font-semibold sm:text-lg">{title}</h3>
              <div className="text-dark-body-text text-sm">{summary}</div>
            </div>
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
            <div className="my-4 h-px w-full bg-main-text/30 sm:mt-4 sm:mb-6"></div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <div className="flex flex-wrap gap-2">
                {website && (
                  <div className="duration-100 md:hover:translate-x-[2px]">
                    <RewardLink
                      href={website}
                      className="flex items-center gap-x-1 rounded-md bg-main-text px-2 py-1 text-sm font-medium text-background transition-all"
                      rewardId={`${slug}:website`}
                      target="_blank"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </RewardLink>
                  </div>
                )}
                <div className="duration-100 md:hover:translate-x-[1px]">
                  <RewardLink
                    href={github}
                    className="flex items-center gap-x-1 rounded-md bg-main-text px-2 py-1 text-sm font-medium text-background transition-all"
                    rewardId={`${slug}:github`}
                    target="_blank"
                  >
                    <FooterGithub className="h-4 w-4" />
                    GitHub
                  </RewardLink>
                </div>
              </div>
              <div className="text-body-text group flex items-center gap-1.5 text-sm transition-transform duration-100 md:hover:translate-x-[1px]">
                <span>Warp here </span>
                <SimpleArrow className="h-2 w-2 translate-y-[1px] transition-transform md:group-hover:translate-x-[2px]" />
              </div>
            </div>
          </div>
        </RewardProjectLink>
      </div>
    </motion.div>
  );
}
