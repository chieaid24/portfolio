"use client";

import { useEffect, useState } from "react";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import ProjectCard from "@/components/ProjectCard";
import { projects, featuredList } from "@/app/data/projects";
import HeroSlot from "@/components/HeroSlot";
import RedText from "@/components/RewardRedText";
import RewardLink from "@/components/RewardLink";
import BottomIntroFade from "@/components/BottomIntroFade";
import { motion } from "framer-motion";
import StarBackground from "@/components/StarBackground";
import FileDownload from "@/icons/FileDownload";
import FooterLinkedin from "@/icons/FooterLinkedin";
import FooterGithub from "@/icons/FooterGithub";
import FooterEmail from "@/icons/FooterEmail";
import Experience from "@/components/Experience";

export default function Home() {
  const [randomTickets, setRandomTickets] = useState({});
  useEffect(() => {
    const generateTicketNumbers = () => {
      const used = new Set(["69"]);
      const ticketMap = {};

      projects.forEach((project) => {
        let ticket;
        do {
          const num = Math.floor(Math.random() * 99) + 1;
          ticket = num < 10 ? `0${num}` : num.toString();
        } while (used.has(ticket));
        used.add(ticket);
        ticketMap[project.slug] = ticket;
      });

      setRandomTickets(ticketMap);
    };

    generateTicketNumbers();

    const hash = window.location.hash;
    if (hash === "#projects") {
      setTimeout(() => {
        const section = document.getElementById("projects");
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
          setTimeout(() => {
            history.replaceState(null, "", window.location.pathname);
          }, 1000);
        }
      }, 100);
    }
  }, []);

  return (
    <>
      <>
        <title>Aidan Chien</title>
        <meta
          name="description"
          content="Portfolio of Aidan Chien, systems engineer specializing in design and development."
        />
      </>

      <StarBackground />
      <main className="">
        <MaxWidthWrapper>
          <section id="hero" className="min-h-screen">
            <div className="flex min-h-[90vh] flex-col items-center justify-center text-red-50 md:min-h-screen">
              <h1 className="mb-4 text-6xl font-bold">
                Hi, I'm Aidan,
                <span className="gradient-text-header"> a cloud engineer</span>
              </h1>
              <h2 className="mb-6 text-3xl font-semibold text-red-50">
                Building practical solutions, one galaxy at a time.
              </h2>
              <div className="flex w-100 justify-between">
                <div className="text-outline-gray flex rounded-xl text-lg font-semibold">
                  <RewardLink
                    href="https://drive.google.com/file/d/1YzK4a7QVQ6JAAOIF_WcgJk7MnkVXQfzC/view?usp=sharing"
                    rewardId="resume"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-follow-btn border-outline-gray rounded-lg border-2 transition-colors duration-100 hover:border-white/75 hover:text-white/75"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.setProperty(
                        "--flash-active",
                        "0.4",
                      );
                      e.currentTarget.style.setProperty("--flash-size", "1");
                    }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      e.currentTarget.style.setProperty("--flash-x", `${x}px`);
                      e.currentTarget.style.setProperty("--flash-y", `${y}px`);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.setProperty("--flash-active", "0");
                      e.currentTarget.style.setProperty("--flash-size", "0");
                      e.currentTarget.style.setProperty("--flash-x", "-100px");
                      e.currentTarget.style.setProperty("--flash-y", "-100px");
                    }}
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-1">
                      <span>Resume</span>
                      <FileDownload className="text-dark-grey-text h-5 w-5" />
                    </div>
                  </RewardLink>
                </div>

                <div className="text-outline-gray flex items-center justify-center gap-x-3 transition-colors duration-600">
                  <RewardLink
                    href="https://www.linkedin.com/in/aidanchien/"
                    target="_blank"
                    rewardId="linkedin"
                    className=""
                  >
                    <FooterLinkedin className="h-8 w-8 transition-colors duration-100 hover:text-white/75" />
                  </RewardLink>
                  <RewardLink
                    href="https://github.com/chieaid24"
                    target="_blank"
                    rewardId="github"
                    className=""
                  >
                    <FooterGithub className="h-8 w-8 transition-colors duration-100 hover:text-white/75" />
                  </RewardLink>
                  <RewardLink
                    href="mailto:aidan.chien@uwaterloo.ca"
                    target="_blank"
                    rewardId="email"
                    className=""
                  >
                    <FooterEmail className="h-8 w-8 transition-colors duration-100 hover:text-white/75" />
                  </RewardLink>
                </div>
              </div>
            </div>
            <section className="mb-24">
              <h2 className="mb-6 text-4xl font-bold tracking-[0.2em] text-white">
                Experience
              </h2>
              <Experience />
            </section>

            {/**project section */}
            <motion.h2
              key="my-projects"
              initial={{ opacity: 0, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: 0 }}
              className="mb-6 text-4xl font-bold tracking-[0.2em] text-white"
            >
              Featured Projects
            </motion.h2>

            <div className="grid auto-rows-fr grid-cols-1 gap-8 md:grid-cols-2">
              {projects
                .filter((project) => featuredList.includes(project.slug))
                .map((project) => (
                <motion.div
                  key={project.slug}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: 0 }}
                >
                  <ProjectCard
                    key={project.slug}
                    title={project.title}
                    generated_with={project.generated_with}
                    ticket_no={randomTickets[project.slug] ?? "--"}
                    skills_used={project.skills_used}
                    image={project.image}
                    slug={project.slug}
                    alt={project.title}
                    fallback_value={[10, project.fallback_value]}
                    summary={project.summary}
                  />
                </motion.div>
              ))}
            </div>
            <section className="text-dark-grey-text font-dm-sans 5xl:text-[105px] 5xl:leading-[105px] my-[-10px] flex flex-col items-center pt-10 text-[44px] leading-12 font-semibold tracking-tighter sm:text-7xl sm:leading-[72px] md:text-[80px] md:leading-[80px] lg:text-8xl lg:leading-[96px]">
              {" "}
              {/**want to cash out? section */}
              <motion.div
                key="cash-out"
                initial={{ opacity: 0, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: 0 }}
              >
                <RewardLink
                  href="mailto:aidan.chien@uwaterloo.ca?subject=I WANT TO CASH OUT! (by hiring you)"
                  rewardId="home:cash-out"
                  className="group mobile:select-none inline-flex flex-col items-center transition-all duration-300 md:hover:translate-y-[-15px] md:hover:scale-110"
                >
                  <p>
                    Want to{" "}
                    <span className="md:group-hover:animate-new-pulse md:group-hover:gradient-text-red-animated gradient-text-custom animated-underline pr-0.5 font-semibold">
                      cash out?
                    </span>
                  </p>
                  <p className="">Let&apos;s connect!</p>
                </RewardLink>
              </motion.div>
            </section>
          </section>
        </MaxWidthWrapper>
      </main>
    </>
  );
}
