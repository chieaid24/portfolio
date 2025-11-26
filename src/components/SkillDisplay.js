"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import RedText from "@/components/RewardRedText";
import { useMoney } from "@/lib/money-context";

export default function SkillDisplay({
  fileName,
  project = "",
  displayName = "",
  card = false,
}) {
  const { hasAward } = useMoney();
  const rewardId = `red:${project}:${fileName.toLowerCase()}`;
  const claimed = hasAward(rewardId);

  // Dynamically import the icon component: /src/icons/skills/{name}.js
  const Icon = useMemo(
    () =>
      dynamic(
        () =>
          import(`@/icons/skills/${fileName}.js`).catch(
            () => import("@/icons/skills/BackupNYT.js"),
          ),
        {
          ssr: false,
          loading: () => (
            <span className="inline-block h-6 w-6 animate-pulse rounded" />
          ),
        },
      ),
    [fileName],
  );
  // Define the style on the card
  const divCard = `inline-flex items-center gap-2 text-white rounded-full 
                    font-base py-0.5 text-xs
                    duration-200 bg-background-highlight px-3 py-1 border-1 border-outline-dark-gray`;

  const iconCard = `md:h-3.5 md:w-3.5`;

  const divProject = `inline-flex items-center gap-2 text-white rounded-md 
                      sm:rounded-lg font-bold translate-y-[1px] md:translate-y-[2px] py-[4px] md:py-[3px] text-[16px] 
                      ${claimed ? "bg-custom-red/60" : "bg-custom-red"} px-[5px] md:px-1.5 leading-tight md:leading-normal`;

  const iconProject = `h-[18px] w-[18px] md:h-[25px] md:w-[25px]`;

  const content = (
    <div className={card ? divCard : divProject}>
      <Icon
        className={card ? iconCard : iconProject}
        color={card ? undefined : `white`}
        aria-hidden="true"
      />
      <div>{displayName || fileName}</div>
    </div>
  );

  return card ? (
    content
  ) : (
    <RedText rewardId={`red:${project}:${fileName.toLowerCase()}`}>
      {content}
    </RedText>
  );
}
