"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useMoney } from "@/lib/money-context";
import QuestSection from "@/components/QuestSection";
import AnimatedBalance from "@/components/AnimatedBalance";
import RewardLink from "@/components/RewardLink";
import DarkModeToggle from "@/components/DarkModeToggle";
import CloseButton from "@/icons/CloseButton";
import * as commodityData from "@/app/data/commodities";
import CommodityDisplay from "@/components/CommodityDisplay";

//unify commodity list
const COMMODITIES = (
  commodityData.default ??
  commodityData.commodities ??
  []
).filter((c) => c && typeof c.price !== "undefined");

function useIsMdUp() {
  const [isMdUp, setIsMdUp] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)"); // Tailwind md
    const onChange = (e) => setIsMdUp(e.matches);
    setIsMdUp(mql.matches); // set initial
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMdUp;
}

// sample items
function sampleDistinct(arr, n) {
  const copy = [...arr];
  // Fisher–Yates shuffle (partial is fine)
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

// If your balance display is "$Xk", multiply by 1000 for calculations.
// Set to 1 if your balance is already in dollars.
const BALANCE_MULTIPLIER = 1000;

export default function Header() {
  const [showHeader, setShowHeader] = useState(true);
  const [walletOpen, setWalletOpen] = useState(false);
  const [holdOpen, setHoldOpen] = useState(false);

  const lastBalanceRef = useRef(null);
  const holdTimerRef = useRef(null);

  const firstBalanceRender = useRef(true);
  const lastYRef = useRef(0);

  const { balance, ready } = useMoney();
  const [flashTrigger, setFlashTrigger] = useState(0);
  const [questClicked, setQuestClicked] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimerRef = useRef(null);
  const [resumeFlashlight, setResumeFlashlight] = useState({
    x: -999,
    y: -999,
    active: false,
  });

  // Clear tooltip timer on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    };
  }, []);

  const infoVariants = {
    closed: { opacity: 1, y: 0 },
    open: { opacity: 0, y: -4 },
  };

  const popHeaderBriefly = (ms = 2000) => {
    setShowHeader(true);
    setHoldOpen(true);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => setHoldOpen(false), ms);
  };

  // clear timer on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);

  // Scroll show/hide, respecting the hold
  useEffect(() => {
    const onScroll = () => {
      if (holdOpen) return;

      const y = Math.max(0, window.scrollY);

      setShowHeader(y <= lastYRef.current);
      lastYRef.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [holdOpen]);

  // Pop header when balance changes
  useEffect(() => {
    if (!ready) return;

    // normalize to 2 decimals to avoid float jitter
    const current = Number.isFinite(balance)
      ? +Number(balance).toFixed(2)
      : null;

    // first ready render: record but don't show
    if (lastBalanceRef.current === null) {
      lastBalanceRef.current = current;
      return;
    }

    if (current !== lastBalanceRef.current) {
      popHeaderBriefly(2000);
      lastBalanceRef.current = current;
    }
  }, [balance, ready]);

  const isMdUp = useIsMdUp();

  const picks = useMemo(() => {
    if (!walletOpen) return [];
    const count = isMdUp ? 3 : 2; // md+ → 3, mobile → 1
    return sampleDistinct(COMMODITIES, count);
  }, [walletOpen, isMdUp]);

  const dollarBalance = (ready ? balance : 0) * BALANCE_MULTIPLIER;

  return (
    <header
      aria-label="Site header with navigation and wallet"
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 transition-transform duration-300 ease-in-out ${showHeader ? "translate-y-0" : "-translate-y-full"} font-dm-sans py-5`}
    >
      <motion.div className="bg-background-light/96 border-outline-gray pointer-events-auto mx-auto w-5/6 overflow-hidden rounded-xl border shadow-[0px_5.47px_13.68px_0px_rgba(0,0,0,0.15)] transition-colors duration-150 md:w-3/4 2xl:w-1/2 2xl:max-w-[60rem]">
        {/* Top row */}
        <div className="flex justify-between px-3 md:pr-6 md:pl-4.5 lg:grid lg:grid-cols-[1fr_4fr]">
          <div className="justify-self-start">
            {/* Money pill = toggle */}
            <button
              type="button"
              onClick={() => setWalletOpen((v) => !v)}
              aria-expanded={walletOpen}
              className={`group 5xl:text-[20px] text-outline-gray cursor-pointer self-start text-xs font-semibold md:text-[17px] lg:text-lg`}
            >
              <div className="my-1.5 inline-flex flex-col items-start rounded-md px-1.5 py-1 group-hover:bg-black/7">
                <div className="gradient-text-header pb-0.5 leading-none">
                  your earnings:
                </div>
                <motion.div
                  layout
                  initial={false}
                  transition={{ layout: { duration: 0 } }}
                  className="flex -translate-y-0.5 items-baseline gap-1 pt-0 leading-none"
                >
                  <span className="leading-none">$</span>
                  <motion.span
                    className="5xl:text-[27px] text-lg leading-none md:text-[24px]"
                    transition={{ duration: 1, ease: "easeInOut" }}
                  >
                    {ready ? (
                      <AnimatedBalance
                        value={balance}
                        className="relative top-1 inline-block transition-colors duration-250"
                      />
                    ) : (
                      "—"
                    )}
                  </motion.span>
                  <motion.span
                    className="leading-none"
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    k
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
                    <Image
                      src="/icons/info_icon_v1-01.svg"
                      width={14}
                      height={14}
                      alt="Info"
                      className="5xl:w-[13px] block w-2 max-w-none md:ml-1 md:w-3"
                      draggable={false}
                    />
                  </motion.div>
                </motion.div>
              </div>
            </button>
          </div>

          <div className="text-outline-gray flex items-center text-sm md:text-lg">
            {/* <DevMoneyReset />  */}
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
                  className="5xl:text-[19px] flex w-full items-center justify-end font-semibold"
                >
                  <Link
                    href="/"
                    className="hover:text-custom-red after:bg-header-light/80 5xl:after:w-[3px] relative py-3 pr-2.5 transition-colors after:absolute after:top-1/2 after:right-0 after:h-5 after:w-[2px] after:-translate-y-1/2 after:content-[''] md:py-1 md:pr-5 md:after:h-6 md:after:w-[2.5px]"
                  >
                    home
                  </Link>
                  <RewardLink
                    href="/about"
                    className="hover:text-custom-red after:bg-header-light/80 5xl:after:w-[3px] relative px-2.5 py-3 transition-colors after:absolute after:top-1/2 after:right-0 after:h-5 after:w-[2px] after:-translate-y-1/2 after:content-[''] md:px-5 md:py-1 md:after:h-6 md:after:w-[2.5px]"
                    rewardId="about-page"
                    transparent={false}
                  >
                    about
                  </RewardLink>
                  <RewardLink
                    href="/projects"
                    className="hover:text-custom-red after:bg-header-light/80 5xl:after:w-[3px] relative px-2.5 py-3 transition-colors after:absolute after:top-1/2 after:right-0 after:h-5 after:w-[2px] after:-translate-y-1/2 after:content-[''] md:px-5 md:py-1 md:after:h-6 md:after:w-[2.5px]"
                    rewardId="projects-page"
                    transparent={false}
                  >
                    projects
                  </RewardLink>
                  <RewardLink
                    href="https://drive.google.com/file/d/1YzK4a7QVQ6JAAOIF_WcgJk7MnkVXQfzC/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-custom-red flashlight-btn py-3 pl-2.5 transition-colors md:py-1 md:pl-5"
                    rewardId="header:resume"
                    transparent={false}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setResumeFlashlight({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                        active: true,
                      });
                    }}
                    onMouseLeave={() =>
                      setResumeFlashlight({ x: -999, y: -999, active: false })
                    }
                    style={{
                      "--flash-x": `${resumeFlashlight.x}px`,
                      "--flash-y": `${resumeFlashlight.y}px`,
                      "--flash-opacity": resumeFlashlight.active ? 1 : 0,
                    }}
                    data-flashlight
                  >
                    resume
                  </RewardLink>
                </motion.nav>
              ) : (
                <div className="flex justify-between lg:grid lg:h-full lg:w-full lg:grid-cols-[8fr_1fr]">
                  <motion.div
                    key="with-your-money"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { duration: 1, ease: "easeOut" },
                    }} // 1s in
                    exit={{
                      opacity: 0,
                      transition: { duration: 0.2, ease: "easeIn" },
                    }} // 0.5s out
                    className="text-light-grey-text 5xl:text-[25px] hidden translate-y-2 cursor-default self-end justify-self-center font-semibold tracking-wide italic lg:ml-5 lg:block lg:translate-y-0 lg:text-[22px] xl:text-[22px] 2xl:text-[24px]"
                  >
                    with your earnings, I would buy...
                  </motion.div>

                  <span className="relative flex items-center justify-end md:space-x-2">
                    <DarkModeToggle
                      className="px-3 py-2 md:px-[2.5px] md:py-[2.5px]"
                      onFailedToggle={() => {
                        setFlashTrigger((t) => t + 1);
                        setShowTooltip(true);

                        // Clear existing timer before setting a new one
                        if (tooltipTimerRef.current)
                          clearTimeout(tooltipTimerRef.current);
                        tooltipTimerRef.current = setTimeout(() => {
                          setShowTooltip(false);
                          tooltipTimerRef.current = null;
                        }, 800);
                      }}
                      questClicked={questClicked}
                    />

                    <AnimatePresence>
                      {showTooltip && (
                        <motion.div
                          initial={{ opacity: 0, y: -1 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -1 }}
                          transition={{ duration: 0.2 }}
                          className="bg-dark-grey-text absolute left-1/2 z-[9999] mt-14 -translate-x-4/5 rounded-md px-2 py-1 text-[10px] font-medium whitespace-nowrap text-white"
                        >
                          complete all quests first!
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      key="close"
                      type="button"
                      onClick={() => setWalletOpen(false)}
                      aria-label="Close"
                      initial={{ opacity: 0, rotate: -90, scale: 0.9 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 90, scale: 0.9 }}
                      transition={{ duration: 0.18 }}
                      className="cursor-pointer rounded-md px-3 py-2 transition-colors duration-250 hover:bg-black/7 md:px-[2px] md:py-[2px]"
                    >
                      <CloseButton className="text-dark-grey-text h-6 w-6" />
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
                paddingBottom: 18,
              }}
              exit={{ height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
              className="px-3 md:pr-6 md:pl-4.5"
            >
              <div className="animate-fade-in-7">
                <div className="grid grid-cols-1 gap-2 text-sm lg:grid-cols-[1fr_4fr]">
                  <QuestSection
                    className="order-2 px-5 pt-4 md:px-20 md:pt-2 lg:order-1 lg:px-0"
                    triggerFlash={flashTrigger}
                    onQuestClick={() => setQuestClicked((c) => c + 1)}
                  />
                  <motion.div
                    key="with-your-money"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { duration: 1, ease: "easeOut" },
                    }} // 1s in
                    exit={{
                      opacity: 0,
                      transition: { duration: 0.2, ease: "easeIn" },
                    }} // 0.5s out
                    className="text-light-grey-text col-start -mb-2 block translate-y-2 self-end justify-self-center text-center text-lg font-semibold tracking-wide italic md:mb-0 md:text-[22px] lg:hidden"
                  >
                    with your earnings, I would buy:
                  </motion.div>
                  <div className="mt-4 grid lg:order-2 lg:grid-cols-[7fr_1fr]">
                    <div className="grid grid-cols-2 items-start gap-8 md:grid-cols-3 md:gap-7 lg:ml-5">
                      {picks.length === 0 ? (
                        <p className="text-xs text-gray-400">
                          No commodities available.
                        </p>
                      ) : (
                        picks.map((c) => (
                          <CommodityDisplay
                            key={c.id ?? c.what}
                            commodity={c}
                            balanceInDollars={dollarBalance}
                          />
                        ))
                      )}
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
