'use client';

import { useEffect, useState, useRef } from 'react';
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
            {/* Outer 9-radius arc centered exactly at (12,12): the silhouette's
                enclosing circle sits on the rotation pivot, so spins don't wobble. */}
            <path d="M20.96 12.83A9 9 0 1 1 11.17 3.04 7 7 0 0 0 20.96 12.83z"/>
        </svg>
    );
}

// Theme swap animation: a solid circle grows from the toggle button; once it
// fully covers the screen every component's colors snap at once (no
// per-component transition) so they change together, then it fades out.
// The grow uses clip-path: circle(), drawn as a crisp vector at native
// resolution every frame (no bitmap scaling, so no pixelated edge). It stays
// smooth because the fill is flat and cheap to re-clip, and the expensive theme
// re-render is deferred until AFTER the grow (hidden under full cover); the
// fade-out is opacity-only (compositor), so it can't jank on a slow machine.
// Reduced-motion falls back to an instant swap.
const REVEAL_GROW_MS = 380;
const REVEAL_FADE_MS = 200;
const REVEAL_BG = { dark: "#03040c", light: "#e8f1fb" };

function snapTheme(next, setTheme) {
    const root = document.documentElement;
    root.classList.add("no-transition");
    setTheme(next);
    return root;
}

function revealTheme(next, setTheme, originEl, shouldReduceMotion) {
    if (shouldReduceMotion || typeof document === "undefined") {
        const root = snapTheme(next, setTheme);
        requestAnimationFrame(() =>
            requestAnimationFrame(() => root.classList.remove("no-transition"))
        );
        return;
    }

    // Center the reveal on the toggle. Source the rect from the clicked element
    // itself (never a stale/null ref); only fall back to viewport center if the
    // rect is genuinely missing or zero-sized.
    const rect = originEl?.getBoundingClientRect();
    const vw = window.visualViewport?.width ?? window.innerWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const hasRect = rect && rect.width > 0 && rect.height > 0;
    const cx = hasRect ? rect.left + rect.width / 2 : vw / 2;
    const cy = hasRect ? rect.top + rect.height / 2 : vh / 2;
    const radius = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy));
    const clipFrom = `circle(0px at ${cx}px ${cy}px)`;
    const clipTo = `circle(${radius}px at ${cx}px ${cy}px)`;

    const disc = document.createElement("div");
    Object.assign(disc.style, {
        position: "fixed",
        inset: "0",
        background: REVEAL_BG[next],
        pointerEvents: "none",
        zIndex: "2147483646",
        clipPath: clipFrom,
        willChange: "clip-path",
    });
    document.body.appendChild(disc);

    const cleanup = () => {
        disc.remove();
        document.documentElement.classList.remove("no-transition");
    };

    disc
        .animate(
            [{ clipPath: clipFrom }, { clipPath: clipTo }],
            { duration: REVEAL_GROW_MS, easing: "ease-in-out", fill: "forwards" }
        )
        .finished.then(() => {
            const root = snapTheme(next, setTheme);
            // let the theme class + highlight-color vars paint before revealing
            requestAnimationFrame(() =>
                requestAnimationFrame(() => {
                    const fade = disc.animate([{ opacity: 1 }, { opacity: 0 }], {
                        duration: REVEAL_FADE_MS,
                        easing: "ease-out",
                        fill: "forwards",
                    });
                    fade.finished.then(() => {
                        disc.remove();
                        root.classList.remove("no-transition");
                    }, cleanup);
                })
            );
        }, cleanup); // interrupted grow (rapid re-toggle / navigation): tidy up
}

export default function DarkModeToggle({ className = "", onFailedToggle, questClicked }) {
    const [mounted, setMounted] = useState(false);
    const [denied, setDenied] = useState(false);
    const [clickedAnim, setClickedAnim] = useState(false);
    const [spin, setSpin] = useState(0);
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

    const handleClick = (event) => {
        if (canToggle) {
            const nextTheme = isDark ? "light" : "dark";
            if (!shouldReduceMotion) setSpin((s) => s + 360);
            const originEl = event?.currentTarget ?? buttonRef.current;
            revealTheme(nextTheme, setTheme, originEl, shouldReduceMotion);
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
            initial={{ opacity: 0 }}
            animate={
                clickedAnim || denied
                    ? {
                        x: [0, -1, 1, -1, 1, -1, 0],
                        opacity: 1,
                        rotate: spin,
                        transition: { duration: 0.3 },
                    }
                    : { x: 0, opacity: 1, rotate: spin }
            }
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
            transition={{ rotate: { type: "spring", stiffness: 180, damping: 18 }, duration: 0.2 }}
            style={{ lineHeight: 0 }}
            className={`-m-1.5 p-1.5 ${canToggle ? "cursor-pointer" : "cursor-default"} ${canToggle ? "opacity-100" : "opacity-0 md:opacity-50"} ${className}`}
        >
            <span style={{ display: "inline-flex" }}>
                {isDark ? <SunIcon /> : <MoonIcon />}
            </span>
        </motion.button>
    );
}
