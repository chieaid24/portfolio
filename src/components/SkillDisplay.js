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
            <span className="inline-block h-3.5 w-3.5 rounded-md" />
          ),
        },
      ),
    [fileName],
  );
  // Define the style on the card
  const divCard = `inline-flex items-center gap-1.5 text-main-text rounded-full
                    font-normal text-xs
                    transition-colors duration-200 bg-background-highlight hover:bg-highlight-color/15 px-2 py-1 border-1 border-outline-dark-gray`;

  const iconCard = `h-2.5 w-2.5`;

  // Unclaimed inline chips sit on the accent fill (white text/icon, legible in
  // both modes); once claimed they drop the fill for an outline, so the label
  // must use the theme text color to stay readable on a light background.
  const divProject = `inline-flex items-center gap-2 rounded-md
                      sm:rounded-lg font-semibold translate-y-[1px] md:translate-y-[2px]  text-lg border
                      ${claimed ? "border-outline-gray text-main-text" : "border-highlight-color/90 bg-highlight-color/90 text-white"} px-[5px] md:px-1.5 leading-tight md:leading-normal`;

  const iconProject = `h-4 w-4 `;

  const content = (
    <div className={card ? divCard : divProject}>
      <Icon
        className={card ? iconCard : iconProject}
        color={card ? "currentColor" : claimed ? undefined : `white`}
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
