"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useMoney } from "@/lib/money-context";
import QuestSection from "@/components/QuestSection";
import AnimatedBalance from "@/components/AnimatedBalance";
import RewardLink from "@/components/RewardLink";
import Info from "@/icons/Info";
import ThemeSection from "./ThemeSection";
import StarflareSection from "./StarflareSection";
import CloseSimple from "@/icons/CloseSimple";

export default function Header() {
  const [walletOpen, setWalletOpen] = useState(false);
  const { balance, ready } = useMoney();

  const infoVariants = {
    closed: { opacity: 1, y: 0 },
    open: { opacity: 0, y: -4 },
  };

  return (
    <header
      aria-label="Site header with navigation and wallet"
      className="font-dm-sans pointer-events-none fixed inset-x-0 top-0 z-1000 px-2 py-5 sm:px-5 md:px-0"
    >
      <motion.div
        className={`border-outline-dark-gray transition-color pointer-events-auto relative mx-auto max-w-full overflow-hidden rounded-xl border duration-200 sm:max-w-[75vw] lg:max-w-[750px] ${walletOpen ? "bg-background" : "bg-background/40"} backdrop-blur-md`}
      >
        {/* Top row */}
        <div className="flex justify-between px-4 lg:grid lg:grid-cols-[1fr_4fr] lg:px-5">
          <div className="">
            {/* Money pill = toggle */}
            <button
              type="button"
              onClick={() => setWalletOpen((v) => !v)}
              aria-expanded={walletOpen}
              className={`group ${walletOpen ? "text-body-text" : "text-outline-gray"} cursor-pointer self-start text-lg font-semibold`}
            >
              <div
                className={`group-hover:text-body-text my-1.5 inline-flex flex-col items-start rounded-md py-1 text-left text-xs md:text-base`}
              >
                <div
                  className={`group-hover:text-body-text pb-0.5 leading-none transition-colors duration-100`}
                >
                  your earnings:
                </div>
                <motion.div
                  layout
                  initial={false}
                  transition={{ layout: { duration: 0 } }}
                  className="flex -translate-y-0.5 items-baseline gap-1 pt-0 leading-none"
                >
                  <span className="noto-symbol translate-colors duration-100">
                    ₳
                  </span>
                  <motion.span
                    className="text-base leading-none md:text-2xl"
                    transition={{ duration: 0.1 }}
                  >
                    {ready ? (
                      <AnimatedBalance
                        value={balance}
                        className="relative top-1 inline-block transition-colors duration-100"
                      />
                    ) : (
                      "—"
                    )}
                  </motion.span>
                  <motion.div
                    layout="position"
                    key="info"
                    variants={infoVariants}
                    initial={false}
                    animate={walletOpen ? "open" : "closed"}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    style={{ willChange: "transform,opacity" }}
                  >
                    <Info className="text-outline-gray/70 h-2.5 w-2.5 translate-y-[1px] transition-transform duration-100 group-hover:-translate-y-[0px] sm:ml-0.5 sm:h-3 sm:w-3 sm:p-0" />
                  </motion.div>
                </motion.div>
              </div>
            </button>
          </div>
          <div className="text-outline-gray flex items-center text-sm md:text-lg">
            {/* <DevMoneyReset /> */}
            {/* <OverflowButton />
                <DevBalanceInput /> */}
            <AnimatePresence initial={false} mode="wait">
              {!walletOpen ? (
                <motion.nav
                  key="nav"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="flex w-full items-center justify-end gap-x-2 font-semibold sm:gap-x-4 md:gap-x-5"
                >
                  <Link
                    href="/"
                    className="hover:text-highlight-color/80 transition-colors duration-100"
                  >
                    home
                  </Link>
                  <RewardLink
                    href="/about"
                    className="hover:text-highlight-color/80 transition-colors duration-100"
                    rewardId="about-page"
                    transparent={false}
                  >
                    about
                  </RewardLink>
                  <RewardLink
                    href="/projects"
                    className="hover:text-highlight-color/80 transition-colors duration-100"
                    rewardId="projects-page"
                    transparent={false}
                  >
                    projects
                  </RewardLink>
                  <RewardLink
                    href="https://drive.google.com/file/d/1YzK4a7QVQ6JAAOIF_WcgJk7MnkVXQfzC/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-highlight-color/80 transition-colors duration-100"
                    rewardId="resume"
                    transparent={false}
                  >
                    resume
                  </RewardLink>
                </motion.nav>
              ) : (
                <div className="flex w-full justify-end">
                  <span className="relative flex items-center justify-end md:space-x-2">
                    <motion.button
                      key="close"
                      type="button"
                      onClick={() => setWalletOpen(false)}
                      aria-label="Close"
                      initial={{ opacity: 0, rotate: -45, scale: 0.9 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 45, scale: 0.9 }}
                      transition={{ duration: 0.18 }}
                      className="cursor-pointer px-3 py-2 transition-colors duration-100 hover:text-white/75 md:px-[2px] md:py-[2px]"
                    >
                      <CloseSimple className="text-dark-grey-text h-3 w-3" />
                    </motion.button>
                  </span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* Expanded panel */}
        <AnimatePresence initial={false}>
          {walletOpen && (
            <motion.div
              key="wallet"
              initial={{
                height: 0,
                opacity: 0,
                paddingTop: 0,
                paddingBottom: 0,
              }}
              animate={{
                height: "auto",
                opacity: 1,
                paddingTop: 0,
                paddingBottom: 16,
              }}
              exit={{
                height: 0,
                opacity: 0,
                paddingTop: 0,
                paddingBottom: 0,
              }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{ overflow: "visible" }}
              className="px-4 lg:px-5"
            >
              <div className="animate-fade-in-7 flex w-full flex-col justify-center">
                <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-4 text-base sm:mt-5 lg:grid-cols-[2fr_3fr] lg:gap-y-0">
                  <motion.div className="text-body-text flex flex-col gap-y-2">
                    <h3 className="font-bold tracking-[0.2em]">Bounties</h3>
                    <QuestSection className="" />
                  </motion.div>
                  <div className="grid h-full grid-cols-[3fr_2fr] gap-x-5 sm:gap-x-6">
                    <div className="text-body-text flex flex-col gap-y-2">
                      <h3 className="font-bold tracking-[0.2em]">Themes</h3>
                      <ThemeSection className="h-full" />
                    </div>
                    <div className="text-body-text flex flex-col gap-y-2">
                      <h3 className="font-bold tracking-[0.2em]">Starflares</h3>
                      <StarflareSection />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
}
