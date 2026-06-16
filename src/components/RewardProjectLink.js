"use client";
import { useMoney } from "@/lib/money-context";
import { useRouter } from "next/navigation";

export default function RewardProjectLink({
  rewardId,
  kind = "project",
  ticketValue,
  onClick,
  children,
  className,
  href,
  external = false, // open href in a new tab instead of client-routing (github_only cards)
  alsoAward, // optional { id, kind } claimed alongside rewardId on the same click
  ...rest
}) {
  const { awardOnce, hasAward } = useMoney();
  const router = useRouter();

  const handleClick = (e) => {
    onClick?.(e);
    if (external) {
      // Opens in a new tab — this page stays mounted, so pay out now.
      window.open(href, "_blank", "noopener,noreferrer");
      awardOnce(rewardId, kind, ticketValue, { defer: false });
      if (alsoAward)
        awardOnce(alsoAward.id, alsoAward.kind, undefined, { defer: false });
    } else {
      // In-tab client navigation remounts the Header — queue the award and let
      // the route-change flush pay it out on the destination project page.
      awardOnce(rewardId, kind, ticketValue, { defer: true });
      if (alsoAward)
        awardOnce(alsoAward.id, alsoAward.kind, undefined, { defer: true });
      router.push(href);
    }
  };

  return (
    <div
      {...rest}
      onClick={handleClick}
      data-reward-id={rewardId}
      className={`cursor-pointer transition-opacity duration-200 ${className}`}
    >
      {children}
    </div>
  );
}
