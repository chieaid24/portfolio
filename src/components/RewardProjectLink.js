"use client";
import Link from "next/link";
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
  ...rest
}) {
  const { awardOnce, hasAward } = useMoney();
  const claimed = hasAward(rewardId);
  const router = useRouter();

  return (
    <div
      {...rest}
      onClick={(e) => {
        awardOnce(rewardId, kind, ticketValue);
        onClick?.(e);
        router.push(href);
      }}
      data-reward-id={rewardId}
      className={`cursor-pointer transition-opacity duration-200 ${className}`}
    >
      {children}
    </div>
  );
}
