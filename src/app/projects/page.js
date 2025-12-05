"use client";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { projects } from "@/app/data/projects";
import { motion } from "framer-motion";
import ProjectCard from "@/components/ProjectCard";

export default function ProjectPage(props) {
  return (
    <>
      <>
        <title>My Projects | Aidan Chien</title>
        <meta
          name="description"
          content="Projects of Aidan Chien - software engineer specializing in cloud computing, AWS-integrated AI solutions, and intelligent applications. Learn more about my work and background."
        />
      </>
      <div className="mt-40 min-h-screen">
        <MaxWidthWrapper>
          <h1 className="mb-8 text-4xl font-bold tracking-[0.2em] text-white">
            My Projects
          </h1>
          <div className="grid auto-rows-fr grid-cols-1 gap-8 md:grid-cols-2">
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
                  skills_used={project.skills_used}
                  slug={project.slug}
                  alt={project.title}
                  summary={project.summary}
                  github={project.github_link}
                />
              </motion.div>
            ))}
          </div>
        </MaxWidthWrapper>
      </div>
    </>
  );
}
