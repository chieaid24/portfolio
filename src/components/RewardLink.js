"use client";
import Link from "next/link";
import { useMoney } from "@/lib/money-context";
import { useRouter } from "next/navigation";

export default function RewardLink({
  rewardId,
  kind = "link",
  onClick,
  children,
  className,
  transparent = true,
  viewMoreProjects = false,
  ...rest
}) {
  const { awardOnce, hasAward } = useMoney();
  const claimed = hasAward(rewardId);

  const dim = claimed && transparent;
  const router = useRouter();

  return (
    <Link
      {...rest}
      onClick={(e) => {
        e.stopPropagation();
        awardOnce(rewardId, kind);
        if (viewMoreProjects) {
          router.push("/projects");
          requestAnimationFrame(() => {
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
          });
        } else {
          onClick?.(e);
        }
      }}
      data-reward-id={rewardId}
      className={`transition-all duration-200 ${dim ? "opacity-75 dark:opacity-100" : "opacity-100"} ${className}`}
    >
      {children}
    </Link>
  );
}
