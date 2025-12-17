"use client";

import { useEffect, useState } from "react";
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
          {/* <ChatHeader /> */}
          <section id="hero" className="min-h-screen">
            <div className="flex min-h-[90vh] flex-col items-center justify-center text-red-50 md:min-h-screen">
              <h1 className="mb-4 text-5xl font-bold">
                Hi, I&apos;m Aidan,{" "}
                <span className="gradient-text-header">
                  {" "}
                  a software engineer
                </span>
              </h1>
              <h2 className="mb-6 text-[27px] leading-[36px] font-semibold text-red-50">
                Building practical solutions, one galaxy at a time.
              </h2>
              <div className="flex w-100 justify-between">
                <div className="text-outline-gray flex rounded-xl text-lg font-semibold transition-transform duration-100 hover:scale-105">
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

                <div className="text-outline-gray flex items-center justify-center gap-x-3 transition-colors">
                  <RewardLink
                    href="https://www.linkedin.com/in/aidanchien/"
                    target="_blank"
                    rewardId="linkedin"
                    className="hover:translate-y-[-1px]"
                  >
                    <FooterLinkedin className="h-8 w-8 transition-colors duration-100 hover:text-white/75" />
                  </RewardLink>
                  <RewardLink
                    href="https://github.com/chieaid24"
                    target="_blank"
                    rewardId="github"
                    className="hover:translate-y-[-1px]"
                  >
                    <FooterGithub className="h-8 w-8 transition-colors duration-100 hover:text-white/75" />
                  </RewardLink>
                  <RewardLink
                    href="mailto:aidan.chien@uwaterloo.ca"
                    target="_blank"
                    rewardId="email"
                    className="hover:translate-y-[-1px]"
                  >
                    <FooterEmail className="h-8 w-8 transition-colors duration-100 hover:text-white/75" />
                  </RewardLink>
                </div>
              </div>
            </div>
            <section className="mb-20">
              <motion.h2
                className="mb-6 text-4xl font-bold tracking-[0.2em] text-white"
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
            <motion.div className="mb-6 flex items-baseline justify-between">
              <motion.h2
                className="text-4xl font-bold tracking-[0.2em] text-white"
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
                  className="text-body-text group flex items-center gap-1 text-lg font-medium duration-100 hover:text-white"
                  rewardId="projects-page"
                >
                  <span>View more</span>
                  {/* <SimpleArrow className="h-3 w-3" /> */}
                  {/* <Rocket1 className="h-5 w-5 translate-y-[2px]" /> */}
                  <Rocket className="h-8 w-8 transition-transform duration-100 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" />
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
                    transition={{ duration: 0.15, delay: index * 0.08 }}
                  >
                    <ProjectCard
                      key={project.slug}
                      title={project.title}
                      skills_used={project.skills_used}
                      slug={project.slug}
                      alt={project.title}
                      summary={project.summary}
                      github={project.github_link}
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
