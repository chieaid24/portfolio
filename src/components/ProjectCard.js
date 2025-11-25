"use client";

import RewardProjectLink from "@/components/RewardProjectLink";
import Telescope from "@/icons/Telescope";
import FooterGithub from "@/icons/FooterGithub";
import SimpleArrow from "@/icons/SimpleArrow";
import SkillDisplay from "@/components/SkillDisplay";

export default function ProjectCard({ title, skills_used, slug, summary }) {
  return (
    <div className="font-dm-sans bg-background h-full rounded-xl border-2 border-white text-white">
      <RewardProjectLink
        href={`/projects/${slug}`}
        className="mobile:select-none flex h-full flex-col justify-between gap-2 p-6"
        rewardId={`project:${slug}`}
        ticketValue={1000}
      >
        <div className="">
          <h3>{title}</h3>
          <span className="flex items-center gap-x-2">
            <Telescope className="h-4 w-4 text-white" />
            <span>Discovered Placeholder</span>
          </span>
          <div>{summary}</div>
        </div>

        <div className="">
          <div>
            {skills_used.map((skill) => (
              <SkillDisplay fileName={skill} project={slug} card={true} />
            ))}
          </div>
          <div className="my-3 h-px w-full bg-white/30"></div>
          <div className="flex justify-between">
            <div className="flex items-center gap-x-1">
              <FooterGithub className="h-5 w-5 text-white" />
              GitHub
            </div>
            <div className="flex items-center gap-2">
              <span>Explore Project </span>
              <SimpleArrow className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
        </div>
      </RewardProjectLink>
    </div>
  );
}
