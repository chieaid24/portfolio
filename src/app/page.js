"use client";

import { useEffect, useState } from "react";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/app/data/projects";
import HeroSlot from "@/components/HeroSlot";
import RedText from "@/components/RewardRedText";
import RewardLink from "@/components/RewardLink";
import BottomIntroFade from "@/components/BottomIntroFade";
import { motion } from "framer-motion";
import StarBackground from "@/components/StarBackground";

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
        <title>AIDAN CHIEN</title>
        <meta
          name="description"
          content="Portfolio of Aidan Chien, systems engineer specializing in design and development."
        />
      </>
      <main
        className="pt-[15vh] font-dm-sans text-dark-grey-text
                    md:pt-[11vh]
                    3xl:pt-[14vh]"
      >
        <StarBackground />
        <BottomIntroFade />
        {/**hero div */}
        <section id="hero" className="relative w-full lg:min-h-[92vh]">
          <MaxWidthWrapper></MaxWidthWrapper>
        </section>

        <section
          id="projects"
          className="bg-background-light text-dark-grey-text"
        >
          {" "}
          {/**project section */}
          <MaxWidthWrapper>
            <motion.h2
              key="my-projects"
              initial={{ opacity: 0, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: 0 }}
              className="font-bold pt-8 text-4xl
                            sm:text-5xl sm:pl-10
                            md:pt-15
                            lg:text-6xl lg:pl-0"
            >
              My Projects
            </motion.h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-22 sm:gap-y-25 lg:gap-y-20 mt-10 mb-32">
              {projects.map((project) => (
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
                  />
                </motion.div>
              ))}
            </div>
          </MaxWidthWrapper>
          <section
            className="flex flex-col items-center my-[-10px] pt-10 bg-background-dark text-dark-grey-text font-dm-sans tracking-tighter font-semibold
                            text-[44px] leading-12
                            sm:text-7xl sm:leading-[72px]
                            md:text-[80px] md:leading-[80px]
                            lg:leading-[96px] lg:text-8xl
                            5xl:text-[105px] 5xl:leading-[105px] "
          >
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
                className="group md:hover:scale-110 md:hover:translate-y-[-15px] transition-all duration-300 items-center inline-flex flex-col mobile:select-none"
              >
                <p>
                  Want to{" "}
                  <span className="md:group-hover:animate-new-pulse md:group-hover:gradient-text-red-animated gradient-text-custom font-semibold animated-underline pr-0.5">
                    cash out?
                  </span>
                </p>
                <p className="">Let&apos;s connect!</p>
              </RewardLink>
            </motion.div>
          </section>
        </section>
      </main>
    </>
  );
}
