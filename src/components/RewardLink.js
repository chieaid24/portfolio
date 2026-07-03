"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMoney } from "@/lib/money-context";

const EXTERNAL_RE = /^(https?:|mailto:|tel:)/i;

export default function RewardLink({
  rewardId,
  kind = "link",
  onClick,
  children,
  className,
  transparent = true,
  href,
  target,
  ...rest
}) {
  const { awardOnce, hasAward } = useMoney();
  const pathname = usePathname();
  const claimed = hasAward(rewardId);

  const dim = claimed && transparent;

  // Defer the payout only when this click triggers in-tab navigation to a
  // different internal route (which remounts the Header + AnimatedBalance).
  // External links, target="_blank", and same-route clicks keep the page
  // mounted, so they pay out immediately and animate in place.
  const hrefStr = typeof href === "string" ? href : "";
  const path = hrefStr.split(/[?#]/)[0];
  const willNavigate =
    !target && !EXTERNAL_RE.test(hrefStr) && !!path && path !== pathname;

  return (
    <Link
      {...rest}
      href={href}
      target={target}
      onClick={(e) => {
        e.stopPropagation();
        awardOnce(rewardId, kind, undefined, { defer: willNavigate });
        onClick?.(e);
      }}
      data-reward-id={rewardId}
      className={`transition-all duration-200 ${dim ? "opacity-75" : "opacity-100"} ${className}`}
    >
      {children}
    </Link>
  );
}
