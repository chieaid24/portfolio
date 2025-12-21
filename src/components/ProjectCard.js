"use client";

import RewardProjectLink from "@/components/RewardProjectLink";
import Telescope from "@/icons/Telescope";
import FooterGithub from "@/icons/FooterGithub";
import SimpleArrow from "@/icons/SimpleArrow";
import SkillDisplay from "@/components/SkillDisplay";
import { useMoney } from "@/lib/money-context";
import RewardLink from "./RewardLink";

export default function ProjectCard({
  title,
  skills_used,
  slug,
  summary,
  github,
}) {
  const { hasAward } = useMoney();
  const rewardId = `project:${slug}`;
  const clicked = hasAward(rewardId);

  return (
    <div
      className={`${clicked ? "" : "linear-gray-gradient"} transition-[box-shadow, transform] h-full rounded-xl p-px duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_25px_rgba(255,255,255,0.15)]`}
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
            <div className="mt-6 mb-6 h-px w-full bg-white/30"></div>
            <div className="flex justify-between">
              <div className="duration-100 hover:translate-x-[2px]">
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
              <div className="text-body-text group flex items-center gap-2 transition-all duration-100 hover:translate-x-[1px]">
                <span>Explore Project </span>
                <SimpleArrow className="h-2.5 w-2.5 translate-y-[1px] transition-transform group-hover:translate-x-[2px]" />
              </div>
            </div>
          </div>
        </RewardProjectLink>
      </div>
    </div>
  );
}
