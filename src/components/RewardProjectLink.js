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
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      router.push(href);
    }
    requestAnimationFrame(() => {
      awardOnce(rewardId, kind, ticketValue);
      if (alsoAward) awardOnce(alsoAward.id, alsoAward.kind);
    });
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
