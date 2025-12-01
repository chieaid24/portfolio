"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ThemeSection from "@/components/ThemeSection";
import { useMoney } from "@/lib/money-context";

const STARFLARE_COST = 50;
const STARFLARE_TOTAL_KEY = "starflare_total_v1";
const STARFLARE_MINE_KEY = "starflare_mine_v1";

function BountyCard({ label, done, total }) {
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-white/15 bg-[#141414] px-3 py-2 text-[11px] text-header-light shadow-[0_0_0_1px_rgba(0,0,0,0.7)]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] tracking-wide text-light-grey-text">
          {label}
        </p>
        <p className="text-[11px] font-semibold text-white">{pct}%</p>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#262626]">
        <div
          className="h-full rounded-full bg-[#ff7b7b]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ExpandedHeader({ onClose }) {
  const { balance, getQuestStats, spend, ready } = useMoney();
  const stats = getQuestStats();
  const [totalStarflares, setTotalStarflares] = useState(0);
  const [myStarflares, setMyStarflares] = useState(0);

  useEffect(() => {
    try {
      const total = Number.parseInt(localStorage.getItem(STARFLARE_TOTAL_KEY) || "0", 10);
      const mine = Number.parseInt(localStorage.getItem(STARFLARE_MINE_KEY) || "0", 10);
      if (Number.isFinite(total)) setTotalStarflares(total);
      if (Number.isFinite(mine)) setMyStarflares(mine);
    } catch {
      // ignore read errors
    }
  }, []);

  const handleSendStarflare = () => {
    if (!ready) return;
    const ok = spend(STARFLARE_COST);
    if (!ok) return;
    setTotalStarflares((t) => {
      const next = t + 1;
      try {
        localStorage.setItem(STARFLARE_TOTAL_KEY, String(next));
      } catch {}
      return next;
    });
    setMyStarflares((t) => {
      const next = t + 1;
      try {
        localStorage.setItem(STARFLARE_MINE_KEY, String(next));
      } catch {}
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="relative w-full rounded-2xl border border-white/15 bg-black/90 px-5 pb-4 pt-3 text-white shadow-[0_0_0_1px_rgba(0,0,0,0.9)]"
    >
      {/* Top row: balance + close */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[12px] font-semibold tracking-wide text-[#ffb2b2]">
            your balance:
          </p>
          <div className="flex items-baseline gap-1 text-[24px] font-semibold tracking-tight">
            <span className="text-[18px]">₳</span>
            <span>{balance.toFixed(2).replace(/\.00$/, "")}</span>
            <span className="text-[13px] text-light-grey-text">k</span>
            <span className="ml-1 cursor-help text-[11px] text-light-grey-text">
              ⓘ
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-[18px] text-light-grey-text transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close wallet"
        >
          ×
        </button>
      </div>

      {/* Center title */}
      <div className="mb-5 flex w-full items-center justify-center">
        <div className="text-[18px] font-semibold tracking-[0.35em] text-transparent drop-shadow-[0_0_18px_rgba(255,199,153,0.8)]">
          <span className="bg-gradient-to-r from-[#ff7b7b] via-[#ffd08a] to-[#ffe7c2] bg-clip-text">
            GALACTIC OUTPOST
          </span>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)]">
        {/* Bounties column */}
        <div>
          <p className="mb-2 text-[13px] font-semibold tracking-wide text-white">
            Bounties
          </p>

          <div className="space-y-2">
            <BountyCard
              label="Red words found"
              done={stats.redtext.done}
              total={stats.redtext.total}
            />
            <BountyCard
              label="Projects discovered"
              done={stats.project.done}
              total={stats.project.total}
            />
            <BountyCard
              label="Links followed"
              done={stats.link.done}
              total={stats.link.total}
            />
          </div>
        </div>

        {/* Themes column */}
        <ThemeSection />
      </div>

      {/* Starflare tracker */}
      <div className="mt-4 w-full md:w-1/2 rounded-2xl border border-white/18 bg-[#0a0a0a]/90 px-4 py-3 shadow-[0_0_0_1px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-[12px] font-semibold tracking-wide text-white">
              Send a Starflare
            </p>
            <p className="text-[11px] text-light-grey-text">Cost: ₳ {STARFLARE_COST}</p>
          </div>
          <button
            type="button"
            onClick={handleSendStarflare}
            className="rounded-lg bg-gradient-to-r from-[#ff7b7b] to-[#ffd08a] px-4 py-2 text-[12px] font-semibold text-black shadow-[0_6px_24px_rgba(0,0,0,0.45)] transition hover:translate-y-[-1px] hover:shadow-[0_10px_28px_rgba(0,0,0,0.55)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!ready}
          >
            Send
          </button>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.08em] text-light-grey-text">
              Total sent
            </p>
            <p className="text-3xl font-semibold text-white leading-none">
              {totalStarflares.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.08em] text-light-grey-text">
              You sent
            </p>
            <p className="text-lg font-semibold text-white leading-none">
              {myStarflares}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
