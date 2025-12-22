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
  ...rest
}) {
  const { awardOnce, hasAward } = useMoney();
  const router = useRouter();

  const handleClick = (e) => {
    onClick?.(e);
    router.push(href);
    requestAnimationFrame(() => {
      awardOnce(rewardId, kind, ticketValue);
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
