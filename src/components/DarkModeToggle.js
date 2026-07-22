'use client';

import { useEffect, useState, useRef } from 'react';
import { flushSync } from 'react-dom';
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { useMoney } from "@/lib/money-context";

function SunIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="4"/>
            <line x1="12" y1="2" x2="12" y2="4"/>
            <line x1="12" y1="20" x2="12" y2="22"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="2" y1="12" x2="4" y2="12"/>
            <line x1="20" y1="12" x2="22" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {/* Crescent translated +0.97,-0.97 so its stroke centroid sits at the
                viewBox center (12,12) — rotation pivots on the visual center. */}
            <path d="M21.97 11.82A9 9 0 1 1 12.18 2.03 7 7 0 0 0 21.97 11.82z"/>
        </svg>
    );
}

export default function DarkModeToggle({ className = "", onFailedToggle, questClicked }) {
    const [mounted, setMounted] = useState(false);
    const [denied, setDenied] = useState(false);
    const [clickedAnim, setClickedAnim] = useState(false);
    const [spin, setSpin] = useState(0);
    const [allowInquiry, setAllowInquiry] = useState(true);
    const buttonRef = useRef(null);

    const { resolvedTheme, setTheme } = useTheme();
    const shouldReduceMotion = useReducedMotion();

    const { getAllQuestsComplete, ready } = useMoney();
    const allQuestComp = getAllQuestsComplete();
    // TEMP(light-mode): toggle unlocked unconditionally for testing.
    // Restore the quest gate before merging: `const canToggle = ready && allQuestComp;`
    const canToggle = ready || allQuestComp;

    const isDark = resolvedTheme === "dark";

    useEffect(() => {
        setMounted(true);
    }, []);

    // Track last questClicked value to replay the shake hint when the user
    // pokes the locked toggle from elsewhere (the quest progress bars).
    const lastClick = useRef(questClicked);
    useEffect(() => {
        if (questClicked !== lastClick.current) {
            lastClick.current = questClicked;
            if (questClicked > 0) {
                setClickedAnim(true);
                const t = setTimeout(() => setClickedAnim(false), 500);
                return () => clearTimeout(t);
            }
        }
    }, [questClicked]);

    const handleClick = () => {
        if (canToggle) {
            setAllowInquiry(false);
            const nextTheme = isDark ? "light" : "dark";
            if (!shouldReduceMotion) setSpin((s) => s + 360);

            if (!shouldReduceMotion && typeof document.startViewTransition === "function") {
                const rect = buttonRef.current?.getBoundingClientRect();
                const vw = window.visualViewport?.width ?? window.innerWidth;
                const vh = window.visualViewport?.height ?? window.innerHeight;
                const cx = rect ? rect.left + rect.width / 2 : vw / 2;
                const cy = rect ? rect.top + rect.height / 2 : vh / 2;
                const maxRadius = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy));
                const clipFrom = `circle(0px at ${cx}px ${cy}px)`;
                const clipTo = `circle(${maxRadius}px at ${cx}px ${cy}px)`;

                const root = document.documentElement;
                root.dataset.themeVt = "active";
                root.style.setProperty("--theme-vt-clip-from", clipFrom);

                const transition = document.startViewTransition(() => {
                    flushSync(() => setTheme(nextTheme));
                });

                transition.ready.then(() => {
                    root.animate(
                        { clipPath: [clipFrom, clipTo] },
                        {
                            duration: 280,
                            easing: "ease-in-out",
                            fill: "forwards",
                            pseudoElement: "::view-transition-new(root)",
                        }
                    );
                });

                transition.finished.finally(() => {
                    delete root.dataset.themeVt;
                    root.style.removeProperty("--theme-vt-clip-from");
                });
            } else {
                // Option A: reduced-motion / no-startViewTransition fallback — instant atomic swap
                document.documentElement.classList.add("no-transition");
                setTheme(nextTheme);
                requestAnimationFrame(() =>
                    requestAnimationFrame(() =>
                        document.documentElement.classList.remove("no-transition")
                    )
                );
            }
        } else {
            setDenied(true);
            onFailedToggle?.();
            setTimeout(() => setDenied(false), 500);
        }
    };

    if (!mounted) return null;

    return (
        <motion.button
            ref={buttonRef}
            key="darkmode"
            type="button"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={!isDark}
            title={canToggle ? undefined : "The progress bars (left) track quest completion"}
            onClick={handleClick}
            initial={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
            animate={
                clickedAnim || denied
                    ? {
                        x: [0, -1, 1, -1, 1, -1, 0],
                        opacity: 1,
                        rotate: spin,
                        scale: 1,
                        transition: { duration: 0.3 },
                    }
                    : { x: 0, opacity: 1, rotate: spin, scale: 1 }
            }
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
            transition={{ rotate: { type: "spring", stiffness: 180, damping: 18 }, duration: 0.2 }}
            style={{ lineHeight: 0 }}
            className={`-m-1.5 p-1.5 ${canToggle ? "cursor-pointer" : "cursor-default"} ${canToggle ? "opacity-100" : "opacity-0 md:opacity-50"} ${className}`}
        >
            <span
                className={allowInquiry && !shouldReduceMotion ? "dm-icon-hover" : undefined}
                onMouseLeave={() => setAllowInquiry(true)}
                style={{ display: "inline-flex" }}
            >
                {isDark ? <SunIcon /> : <MoonIcon />}
            </span>
        </motion.button>
    );
}
