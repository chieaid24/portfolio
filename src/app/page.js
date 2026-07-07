"use client";

import { useCallback, useRef } from "react";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import ProjectCard from "@/components/ProjectCard";
import { projects, featuredList } from "@/app/data/projects";
import RewardLink from "@/components/RewardLink";
import { motion } from "framer-motion";
import StarBackground from "@/components/StarBackground";
import FileDownload from "@/icons/FileDownload";
import FooterLinkedin from "@/icons/FooterLinkedin";
import FooterGithub from "@/icons/FooterGithub";
import FooterEmail from "@/icons/FooterEmail";
import Experience from "@/components/Experience";
import Rocket from "@/icons/Rocket";
import ScrambledText from "@/components/ScrambledText";

export default function Home() {
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
      <>
        <title>AIDAN CHIEN</title>
        <meta
          name="description"
          content="Portfolio of Aidan Chien, systems engineer specializing in design and development."
        />
      </>

      <StarBackground />
      <main className="">
        <MaxWidthWrapper>
          <section id="hero" className="min-h-screen">
            <motion.div
              className="flex min-h-screen flex-col items-center justify-center text-main-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <h1 className="mb-4 text-center text-4xl font-bold sm:mb-2 lg:mb-3 lg:text-[42px]">
                Greetings Earthling, {" "} 
                <span className="">
                  <br className="sm:hidden" /> I&apos;m {" "}
                  <ScrambledText text="Aidan" className="gradient-text-header" />
                </span>
              </h1>
              <h2 className="mb-8 text-center text-lg font-semibold text-main-text sm:mb-6 sm:text-xl md:leading-[36px] lg:text-[28px]">
                Owning real world projects, one galaxy at a time. 
              </h2>
              <div className="flex w-80 justify-between md:w-100">
                <div className="text-outline-gray flex rounded-xl text-lg font-semibold transition-transform duration-100 md:hover:scale-105">
                  <RewardLink
                    href="https://drive.google.com/file/d/1YzK4a7QVQ6JAAOIF_WcgJk7MnkVXQfzC/view?usp=sharing"
                    rewardId="resume"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-follow-btn border-outline-gray rounded-lg border-2 transition-colors duration-100 md:hover:border-main-text/75 md:hover:text-main-text/75"
                    onMouseEnter={handleFlashEnter}
                    onMouseMove={handleFlashMove}
                    onMouseLeave={handleFlashLeave}
                  >
                    <div className="inline-flex items-center gap-2 px-2 py-1 md:px-3 md:py-1">
                      <span>Resume</span>
                      <FileDownload className="text-dark-grey-text h-5 w-5" />
                    </div>
                  </RewardLink>
                </div>
                <div className="text-outline-gray flex items-center justify-center gap-x-4 transition-colors lg:gap-x-3">
                  <RewardLink
                    href="https://www.linkedin.com/in/aidanchien/"
                    target="_blank"
                    rewardId="linkedin"
                    aria-label="LinkedIn"
                    className="md:hover:translate-y-[-1px]"
                  >
                    <FooterLinkedin className="h-8 w-8 transition-colors duration-100 md:hover:text-main-text-hover" />
                  </RewardLink>
                  <RewardLink
                    href="https://github.com/chieaid24"
                    target="_blank"
                    rewardId="github"
                    aria-label="GitHub"
                    className="md:hover:translate-y-[-1px]"
                  >
                    <FooterGithub className="h-8 w-8 transition-colors duration-100 md:hover:text-main-text-hover" />
                  </RewardLink>
                  <RewardLink
                    href="mailto:aidan.chien@uwaterloo.ca"
                    target="_blank"
                    rewardId="email"
                    aria-label="Email"
                    className="md:hover:translate-y-[-1px]"
                  >
                    <FooterEmail className="h-8 w-8 transition-colors duration-100 md:hover:text-main-text-hover" />
                  </RewardLink>
                </div>
              </div>
            </motion.div>
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
                  className="text-body-text group flex items-center gap-1 font-medium duration-100 sm:text-base md:hover:text-main-text"
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
