"use client";

import { useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { useMoney } from "@/lib/money-context";
import ProjectCard from "@/components/ProjectCard";
import { projects, featuredList } from "@/app/data/projects";
import RewardLink from "@/components/RewardLink";
import { motion } from "framer-motion";
import Experience from "@/components/Experience";
import Rocket from "@/icons/Rocket";
import Hero from "@/components/Hero";

// Loaded lazily so three.js / react-three-fiber (~250KB gzip) stay out of the
// home page's critical bundle. The placeholder paints the same sky (near-black
// in dark mode, day-sky gradient in light) so there's no flash while the
// canvas chunk loads; stars then fade in on top.
const StarBackground = dynamic(() => import("@/components/StarBackground"), {
  ssr: false,
  loading: () => (
    <div className="pointer-events-none fixed inset-0 -z-10 h-full bg-[#02030a] light:bg-[linear-gradient(180deg,#c4e4fb_0%,#a3cef7_55%,#95c4ee_100%)]" />
  ),
});

export default function Home() {
  const { highlightHex } = useMoney();
  const accent = highlightHex || "#ff5e5e";
  // Cursor-follow flash. A single rAF "lerp" loop eases the highlight toward
  // the latest pointer position every frame, so the motion is decoupled from
  // (bursty/sparse) mousemove events and from any CSS transition — that's what
  // keeps it smooth. The button rect is read once on enter (not per frame), so
  // there's no per-frame layout read.
  const flashRaf = useRef(0);
  const flashLast = useRef(0);
  const flashEl = useRef(null);
  const flashRect = useRef(null);
  const flashTarget = useRef({ x: 0, y: 0 });
  const flashPos = useRef({ x: 0, y: 0 });

  const flashTick = useCallback((now) => {
    const el = flashEl.current;
    if (!el) {
      flashRaf.current = 0;
      return;
    }
    const dt = Math.min(now - flashLast.current, 64);
    flashLast.current = now;
    // Framerate-independent smoothing: ~0.25 catch-up per 60fps frame.
    const k = 1 - Math.pow(0.75, dt / 16.6667);
    const pos = flashPos.current;
    const t = flashTarget.current;
    pos.x += (t.x - pos.x) * k;
    pos.y += (t.y - pos.y) * k;
    el.style.setProperty("--flash-x", `${pos.x}px`);
    el.style.setProperty("--flash-y", `${pos.y}px`);
    flashRaf.current = requestAnimationFrame(flashTick);
  }, []);

  const handleFlashEnter = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    flashEl.current = el;
    flashRect.current = rect;
    flashTarget.current = { x, y };
    flashPos.current = { x, y }; // start under the cursor (no fly-in)
    el.style.setProperty("--flash-x", `${x}px`);
    el.style.setProperty("--flash-y", `${y}px`);
    el.style.setProperty(
      "--flash-active",
      "var(--resume-flash-opacity, 0.15)",
    );
    el.style.setProperty("--flash-size", "1");
    if (!flashRaf.current) {
      flashLast.current = performance.now();
      flashRaf.current = requestAnimationFrame(flashTick);
    }
  };

  const handleFlashMove = (e) => {
    const rect = flashRect.current;
    if (!rect) return;
    flashTarget.current.x = e.clientX - rect.left;
    flashTarget.current.y = e.clientY - rect.top;
  };

  const handleFlashLeave = () => {
    const el = flashEl.current;
    if (el) {
      el.style.setProperty("--flash-active", "0");
      el.style.setProperty("--flash-size", "0");
    }
    if (flashRaf.current) {
      cancelAnimationFrame(flashRaf.current);
      flashRaf.current = 0;
    }
    flashEl.current = null;
    flashRect.current = null;
  };

  return (
    <>
      <StarBackground />
      <main className="">
        <MaxWidthWrapper>
          <section id="hero" className="min-h-screen">
            <Hero
              accent={accent}
              flash={{
                onEnter: handleFlashEnter,
                onMove: handleFlashMove,
                onLeave: handleFlashLeave,
              }}
            />
            <section className="mb-20">
              <motion.h2
                className="mb-6 text-xl font-bold tracking-[0.2em] text-main-text sm:text-2xl md:text-3xl"
                key="experience-header"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.15, delay: 0 }}
              >
                Experience
              </motion.h2>
              <motion.div
                key="experience"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.15, delay: 0 }}
              >
                <Experience />
              </motion.div>
            </section>
            {/**project section */}
            <motion.div className="mb-6 items-baseline justify-between sm:flex">
              <motion.h2
                className="mb-2 text-xl font-bold tracking-[0.2em] text-main-text sm:mb-0 sm:text-2xl md:text-3xl"
                key="my-projects"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.15, delay: 0 }}
              >
                Featured Projects
              </motion.h2>
              <motion.div
                key="view-more"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.15, delay: 0 }}
              >
                <RewardLink
                  href="/projects"
                  scroll
                  className="text-body-text group flex items-center gap-1 font-medium duration-100 text-sm sm:text-base md:hover:text-main-text"
                  rewardId="projects-page"
                >
                  <span>View more</span>
                  <Rocket className="h-7 w-7 transition-transform duration-100 sm:h-8 sm:w-8 md:group-hover:translate-x-[1px] md:group-hover:-translate-y-[1px]" />
                </RewardLink>
              </motion.div>
            </motion.div>
            <div className="grid auto-rows-fr grid-cols-1 gap-8 md:grid-cols-2">
              {projects
                .filter((project) => featuredList.includes(project.slug))
                .map((project, index) => (
                  <motion.div
                    key={project.slug}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.15, delay: index * 0.15 }}
                  >
                    <ProjectCard
                      key={project.slug}
                      title={project.title}
                      skills_used={project.skills_used}
                      slug={project.slug}
                      alt={project.title}
                      summary={project.summary}
                      image={project.image}
                      github={project.github_link}
                      website={project.website_link}
                      github_only={project.github_only}
                      float
                      darkOutline
                      index={index}
                    />
                  </motion.div>
                ))}
            </div>
          </section>
        </MaxWidthWrapper>
      </main>
    </>
  );
}
