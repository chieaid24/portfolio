"use client";
import Link from "next/link";
import { useMoney } from "@/lib/money-context";

export default function RewardLink({
  rewardId,
  kind = "link",
  onClick,
  children,
  className,
  transparent = true,
  ...rest
}) {
  const { awardOnce, hasAward } = useMoney();
  const claimed = hasAward(rewardId);

  const dim = claimed && transparent;

  return (
    <Link
      {...rest}
      onClick={(e) => {
        e.stopPropagation();
        awardOnce(rewardId, kind);
        onClick?.(e);
      }}
      data-reward-id={rewardId}
      className={`transition-all duration-200 ${dim ? "opacity-75 dark:opacity-100" : "opacity-100"} ${className}`}
    >
      {children}
    </Link>
  );
}
