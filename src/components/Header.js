"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useMoney } from "@/lib/money-context";
import QuestSection from "@/components/QuestSection";
import AnimatedBalance from "@/components/AnimatedBalance";
import RewardLink from "@/components/RewardLink";
import DarkModeToggle from "@/components/DarkModeToggle"
import CloseButton from "@/icons/CloseButton"
import * as commodityData from "@/app/data/commodities";
import CommodityDisplay from "@/components/CommodityDisplay";

//unify commodity list 
const COMMODITIES = (commodityData.default ?? commodityData.commodities ?? []).filter(
    (c) => c && typeof c.price !== "undefined"
);

function useIsMdUp() {
    const [isMdUp, setIsMdUp] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia('(min-width: 768px)'); // Tailwind md
        const onChange = (e) => setIsMdUp(e.matches);
        setIsMdUp(mql.matches);           // set initial
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
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
        const current = Number.isFinite(balance) ? +Number(balance).toFixed(2) : null;

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
        const count = isMdUp ? 3 : 2;          // md+ → 3, mobile → 1
        return sampleDistinct(COMMODITIES, count);
    }, [walletOpen, isMdUp]);


    const dollarBalance = (ready ? balance : 0) * BALANCE_MULTIPLIER;

    return (
        <header
            aria-label="Site header with navigation and wallet"
            className={`fixed inset-x-0 top-0 z-50 transition-transform ease-in-out duration-300 pointer-events-none ${showHeader ? "translate-y-0" : "-translate-y-full"} py-5 font-dm-sans`}
        >
            <motion.div
                className="pointer-events-auto w-5/6 mx-auto rounded-xl shadow-[0px_5.47px_13.68px_0px_rgba(0,0,0,0.15)] overflow-hidden transition-colors duration-150 bg-background-light/96
                md:w-3/4 
                2xl:w-1/2 2xl:max-w-[60rem]"
            >
                {/* Top row */}
                <div className="px-3 flex justify-between
                                md:pl-4.5 md:pr-6 
                                lg:grid lg:grid-cols-[1fr_4fr]">
                    <div className="justify-self-start">
                        {/* Money pill = toggle */}
                        <button
                            type="button"
                            onClick={() => setWalletOpen((v) => !v)}
                            aria-expanded={walletOpen}
                            className={`group self-start font-semibold text-xs md:text-[17px] lg:text-lg 5xl:text-[20px] text-dark-grey-text cursor-pointer`}
                        >
                            <div className="px-1.5 py-1 my-1.5 rounded-md inline-flex flex-col items-start group-hover:bg-black/7">
                                <div className="leading-none gradient-text-header pb-0.5">
                                    your earnings:
                                </div>
                                <motion.div
                                    layout
                                    initial={false}
                                    transition={{ layout: { duration: 0 } }}
                                    className="flex gap-1 items-baseline leading-none pt-0 -translate-y-0.5"
                                >
                                    <span className="leading-none">$</span>
                                    <motion.span
                                        className="text-lg md:text-[24px] 5xl:text-[27px] leading-none "
                                        transition={{ duration: 1, ease: "easeInOut" }}
                                    >
                                        {ready ? (
                                            <AnimatedBalance value={balance} className="relative inline-block top-1  transition-colors duration-250" />
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
                                            className="md:ml-1 block w-2 md:w-3 5xl:w-[13px] max-w-none"
                                            draggable={false}
                                        />
                                    </motion.div>
                                </motion.div>
                            </div>
                        </button>
                    </div>

                    <div className="flex items-center text-sm md:text-lg text-dark-grey-text">
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
                                    className="flex items-center font-semibold justify-end w-full 5xl:text-[19px]"
                                >
                                    <Link
                                        href="/"
                                        className="relative hover:text-custom-red transition-colors pr-2.5 py-3
                               after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2
                               after:w-[2px] after:h-5  after:bg-header-light/80
                               md:pr-5 md:py-1 md:after:w-[2.5px] md:after:h-6
                               5xl:after:w-[3px]"
                                    >
                                        home
                                    </Link>
                                    <RewardLink
                                        href="/about"
                                        className="relative hover:text-custom-red transition-colors px-2.5 py-3
                               after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2
                                after:w-[2px] after:h-5 after:bg-header-light/80
                               md:px-5 md:py-1 md:after:w-[2.5px] md:after:h-6
                               5xl:after:w-[3px]"
                                        rewardId="header:about"
                                        transparent={false}
                                    >
                                        about
                                    </RewardLink>
                                    <RewardLink
                                        href="https://drive.google.com/file/d/1YzK4a7QVQ6JAAOIF_WcgJk7MnkVXQfzC/view?usp=sharing"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-custom-red transition-colors pl-2.5  py-3
                                        md:pl-5 md:py-1"
                                        rewardId="header:resume"
                                        transparent={false}
                                    >
                                        resume
                                    </RewardLink>
                                </motion.nav>
                            ) : (
                                <div className="flex justify-between
                                lg:grid lg:grid-cols-[8fr_1fr] lg:w-full lg:h-full">

                                    <motion.div
                                        key="with-your-money"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1, transition: { duration: 1, ease: "easeOut" } }}   // 1s in
                                        exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}      // 0.5s out
                                        className="font-semibold tracking-wide self-end justify-self-center translate-y-2 hidden italic text-light-grey-text cursor-default
                                                         lg:block lg:text-[22px] lg:translate-y-0 lg:ml-5
                                                         xl:text-[22px]
                                                         2xl:text-[24px]
                                                         5xl:text-[25px]"
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
                                                if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
                                                tooltipTimerRef.current = setTimeout(() => {
                                                    setShowTooltip(false);
                                                    tooltipTimerRef.current = null;
                                                }, 1200);
                                            }}
                                            questClicked={questClicked}
                                        />

                                        <AnimatePresence>
                                            {showTooltip && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -2 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -2 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute left-1/2 -translate-x-4/5 mt-14 px-2 py-1 text-[10px] rounded-md bg-dark-grey-text text-white z-[9999] shadow-sm whitespace-nowrap font-medium"
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
                                            className="px-3 py-2 md:px-[2px] md:py-[2px] rounded-md hover:bg-black/7 transition-colors duration-250 cursor-pointer"
                                        >
                                            <CloseButton className="h-6 w-6 text-dark-grey-text" />
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
                            initial={{ height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0 }}
                            animate={{ height: "auto", opacity: 1, paddingTop: 0, paddingBottom: 18 }}
                            exit={{ height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0 }}
                            transition={{ duration: 0.28, ease: "easeInOut" }}
                            style={{ overflow: "hidden" }}
                            className="px-3 
                                        md:pl-4.5 md:pr-6"
                        >
                            <div className="animate-fade-in-7">
                                <div className="grid grid-cols-1 gap-2 text-sm
                                                lg:grid-cols-[1fr_4fr]">
                                    <QuestSection className="order-2 pt-4 px-5
                                                             md:pt-2 md:px-20
                                                             lg:px-0 lg:order-1"
                                        triggerFlash={flashTrigger}
                                        onQuestClick={() => setQuestClicked((c) => c + 1)} />
                                    <motion.div
                                        key="with-your-money"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1, transition: { duration: 1, ease: "easeOut" } }}   // 1s in
                                        exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}      // 0.5s out
                                        className="text-light-grey-text italic font-semibold text-lg text-center tracking-wide self-end justify-self-center translate-y-2 block col-start -mb-2
                                        md:text-[22px] md:mb-0 
                                        lg:hidden"
                                    >
                                        with your earnings, I would buy:
                                    </motion.div>
                                    <div className="grid mt-4 
                                                    lg:grid-cols-[7fr_1fr] lg:order-2">
                                        <div className="grid grid-cols-2 gap-8 items-start lg:ml-5
                                                        md:grid-cols-3 md:gap-7 ">
                                            {picks.length === 0 ? (
                                                <p className="text-xs text-gray-400">No commodities available.</p>
                                            ) : (
                                                picks.map((c) => (
                                                    <CommodityDisplay
                                                        key={(c.id ?? c.what)}
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
