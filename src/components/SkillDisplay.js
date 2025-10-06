'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import RedText from "@/components/RewardRedText"
import { useMoney } from "@/lib/money-context"; 

export default function SkillDisplay({ fileName, project = "", displayName = "", card = false }) {
  const { hasAward } = useMoney();
  const rewardId = `red:${project}:${fileName.toLowerCase()}`;
  const claimed = hasAward(rewardId);

  // Dynamically import the icon component: /src/icons/skills/{name}.js
  const Icon = useMemo(
    () =>
      dynamic(
        () =>
          import(`@/icons/skills/${fileName}.js`).catch(() =>
            import('@/icons/skills/BackupNYT.js')
          ),
        {
          ssr: false,
          loading: () => (
            <span className="inline-block h-6 w-6 animate-pulse rounded" />
          ),
        }
      ),
    [fileName]
  );
  const divClassName =
  `inline-flex items-center gap-2 text-white rounded-md sm:rounded-lg font-bold
  ${
    card 
    ? `py-0.5 sm:py-[3px] text-[11px] sm:text-[14px] opacity-90 group-hover/pc:opacity-100 hover:translate-y-[-1px] duration-200 bg-custom-orange px-1.5` 
    :  `translate-y-[1px] md:translate-y-[2px] py-[4px] md:py-[3px] text-[16px] ${claimed ? "bg-custom-red/60" : "bg-custom-red"} px-[5px] md:px-1.5 leading-tight md:leading-normal`
  }`;
  const iconClassName = `${card ? 'h-[15px] w-[15px] sm:h-[20px] sm:w-[20px]' : 'h-[18px] w-[18px] md:h-[25px] md:w-[25px]'}`
  const content = (
    <div className={divClassName}>
      <Icon className={iconClassName} aria-hidden="true" />
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
