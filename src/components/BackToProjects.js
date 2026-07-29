"use client";

import RewardLink from "@/components/RewardLink";
import SimpleArrow from "@/icons/SimpleArrow";

export default function BackToProjects() {
  return (
    <div className="flex justify-end">
      <RewardLink
        href="/projects"
        rewardId="projects-page"
        className="group text-outline-gray group text-base flex cursor-pointer items-center gap-3 font-medium transition-transform duration-100 hover:translate-x-[1px] md:text-lg"
      >
        All Projects
        <SimpleArrow className="h-2.5 w-2.5 translate-y-[1px] transition-transform group-hover:translate-x-[2px]" />
      </RewardLink>
    </div>
  );
}
