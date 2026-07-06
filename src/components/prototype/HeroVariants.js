"use client";

// PROTOTYPE — throwaway hero layout explorations. Switchable via ?variant= on
// the home route (see src/app/page.js) + PrototypeSwitcher floating bar.
// Pick a winner, fold it into page.js, then DELETE this file + the switcher.
//
// All variants reuse the real link primitives (RewardLink/ScrambledText/icons)
// so density + reward hooks match production. rewardIds kept identical to the
// originals so quest_totals stays correct and nothing double-counts.

import { motion } from "framer-motion";
import RewardLink from "@/components/RewardLink";
import ScrambledText from "@/components/ScrambledText";
import FileDownload from "@/icons/FileDownload";
import FooterLinkedin from "@/icons/FooterLinkedin";
import FooterGithub from "@/icons/FooterGithub";
import FooterEmail from "@/icons/FooterEmail";

const RESUME_HREF =
  "https://drive.google.com/file/d/1YzK4a7QVQ6JAAOIF_WcgJk7MnkVXQfzC/view?usp=sharing";

// --- shared primitives ------------------------------------------------------

function ResumeButton({ flash, size = "md", block = false }) {
  const pad =
    size === "lg" ? "px-5 py-2 md:px-6 md:py-2.5" : "px-2 py-1 md:px-3 md:py-1";
  const text = size === "lg" ? "text-xl" : "text-lg";
  return (
    <div
      className={`text-outline-gray flex rounded-xl ${text} font-semibold transition-transform duration-100 md:hover:scale-105 ${
        block ? "w-full" : ""
      }`}
    >
      <RewardLink
        href={RESUME_HREF}
        rewardId="resume"
        target="_blank"
        rel="noopener noreferrer"
        className={`cursor-follow-btn border-outline-gray rounded-lg border-2 transition-colors duration-100 md:hover:border-main-text/75 md:hover:text-main-text/75 ${
          block ? "w-full text-center" : ""
        }`}
        onMouseEnter={flash.enter}
        onMouseMove={flash.move}
        onMouseLeave={flash.leave}
      >
        <div
          className={`inline-flex items-center gap-2 ${pad} ${
            block ? "w-full justify-center" : ""
          }`}
        >
          <span>Resume</span>
          <FileDownload className="text-dark-grey-text h-5 w-5" />
        </div>
      </RewardLink>
    </div>
  );
}

function SocialIcons({ gap = "gap-x-4", size = "h-8 w-8" }) {
  const cls = `${size} transition-colors duration-100 md:hover:text-main-text-hover`;
  return (
    <div className={`text-outline-gray flex items-center justify-center ${gap}`}>
      <RewardLink
        href="https://www.linkedin.com/in/aidanchien/"
        target="_blank"
        rewardId="linkedin"
        aria-label="LinkedIn"
        className="md:hover:translate-y-[-1px]"
      >
        <FooterLinkedin className={cls} />
      </RewardLink>
      <RewardLink
        href="https://github.com/chieaid24"
        target="_blank"
        rewardId="github"
        aria-label="GitHub"
        className="md:hover:translate-y-[-1px]"
      >
        <FooterGithub className={cls} />
      </RewardLink>
      <RewardLink
        href="mailto:aidan.chien@uwaterloo.ca"
        target="_blank"
        rewardId="email"
        aria-label="Email"
        className="md:hover:translate-y-[-1px]"
      >
        <FooterEmail className={cls} />
      </RewardLink>
    </div>
  );
}

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 1 },
};

// --- A — Centered split (baseline, tightened) -------------------------------
// Same shape as production but with the subtitle gone and deliberate breathing
// room restored between greeting and the link row.

export function VariantA({ flash }) {
  return (
    <motion.div
      className="flex min-h-screen flex-col items-center justify-center text-main-text"
      {...fade}
    >
      <h1 className="mb-10 text-center text-4xl font-bold sm:mb-8 lg:mb-10 lg:text-[42px]">
        Greetings Earthling, {" "}
        <span>
          <br className="sm:hidden" /> I&apos;m {" "}
          <ScrambledText text="Aidan" className="gradient-text-header" />
        </span>
      </h1>
      <div className="flex w-80 items-center justify-between md:w-100">
        <ResumeButton flash={flash} />
        <SocialIcons gap="gap-x-4 lg:gap-x-3" />
      </div>
    </motion.div>
  );
}
VariantA.variantName = "Centered split";

// --- B — Left editorial -----------------------------------------------------
// Left-anchored, magazine hierarchy. Name blown up onto its own line. Links sit
// in one inline row under the text: Resume CTA, hairline divider, socials.

export function VariantB({ flash }) {
  return (
    <motion.div
      className="mx-auto flex min-h-screen max-w-100 flex-col items-start justify-center text-left text-main-text md:max-w-[46rem]"
      {...fade}
    >
      <p className="text-body-text mb-2 text-lg font-semibold tracking-wide sm:text-xl">
        Greetings Earthling,
      </p>
      <h1 className="mb-10 text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
        I&apos;m {" "}
        <ScrambledText text="Aidan" className="gradient-text-header" />
      </h1>
      <div className="flex items-center gap-5">
        <ResumeButton flash={flash} />
        <span className="bg-outline-gray/40 h-8 w-px" aria-hidden="true" />
        <SocialIcons gap="gap-x-4" />
      </div>
    </motion.div>
  );
}
VariantB.variantName = "Left editorial";

// --- C — Unified pill -------------------------------------------------------
// Centered, but Resume + socials merge into a single rounded control island so
// the affordance reads as one cohesive strip instead of a split row.

export function VariantC({ flash }) {
  return (
    <motion.div
      className="flex min-h-screen flex-col items-center justify-center text-center text-main-text"
      {...fade}
    >
      <h1 className="mb-10 text-4xl font-bold sm:mb-12 lg:text-5xl">
        Greetings Earthling, {" "}
        <span>
          <br className="sm:hidden" /> I&apos;m {" "}
          <ScrambledText text="Aidan" className="gradient-text-header" />
        </span>
      </h1>
      <div className="border-outline-gray/60 flex items-center gap-4 rounded-full border px-4 py-2 backdrop-blur-sm sm:gap-6 sm:px-6">
        <ResumeButton flash={flash} />
        <span className="bg-outline-gray/40 h-7 w-px" aria-hidden="true" />
        <SocialIcons gap="gap-x-4" size="h-7 w-7" />
      </div>
    </motion.div>
  );
}
VariantC.variantName = "Unified pill";

// --- D — Name-dominant CTA --------------------------------------------------
// Eyebrow + oversized name as the whole hero, a wide primary Resume CTA, and a
// small muted social row underneath. Strong single vertical axis.

export function VariantD({ flash }) {
  return (
    <motion.div
      className="flex min-h-screen flex-col items-center justify-center text-center text-main-text"
      {...fade}
    >
      <p className="text-body-text mb-3 text-base font-semibold uppercase tracking-[0.3em] sm:text-lg">
        Greetings Earthling
      </p>
      <h1 className="mb-8 text-6xl font-bold leading-none sm:text-7xl lg:text-8xl">
        I&apos;m {" "}
        <ScrambledText text="Aidan" className="gradient-text-header" />
      </h1>
      <div className="w-64 sm:w-72">
        <ResumeButton flash={flash} size="lg" block />
      </div>
      <div className="mt-6">
        <SocialIcons gap="gap-x-5" size="h-7 w-7" />
      </div>
    </motion.div>
  );
}
VariantD.variantName = "Name-dominant CTA";

// --- registry ---------------------------------------------------------------

export const HERO_VARIANTS = {
  A: VariantA,
  B: VariantB,
  C: VariantC,
  D: VariantD,
};

export default function HeroVariant({ variant, flash }) {
  const Cmp = HERO_VARIANTS[variant] ?? VariantA;
  return <Cmp flash={flash} />;
}
