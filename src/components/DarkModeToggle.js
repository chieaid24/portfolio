'use client';

import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { useMoney } from "@/lib/money-context"

export default function DarkModeToggle({ className = "", onFailedToggle, questClicked }) {
    const [mounted, setMounted] = useState(false);
    const [denied, setDenied] = useState(false);
    const [clickedAnim, setClickedAnim] = useState(false);
    const [spin, setSpin] = useState(0);

    const { resolvedTheme, setTheme } = useTheme();
    const shouldReduceMotion = useReducedMotion();

    const { getAllQuestsComplete, ready } = useMoney();
    const allQuestComp = getAllQuestsComplete();
    // TEMP(light-mode): toggle unlocked unconditionally for testing.
    // Restore the quest gate before merging: `const canToggle = ready && allQuestComp;`
    const canToggle = ready || allQuestComp;

    const isDark = resolvedTheme === "dark";

    // next-themes applies the html class + persistence; we only flip the theme.
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
            setTheme(isDark ? "light" : "dark");
            if (!shouldReduceMotion) setSpin((s) => s + 360);
        } else {
            // trigger failed animation
            setDenied(true);
            onFailedToggle?.();

            // reset denied after animation ends
            setTimeout(() => setDenied(false), 500);
        }
    };

    if (!mounted) return null;

    return (
        <motion.button
            key="darkmode"
            type="button"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={!isDark}
            title={canToggle ? undefined : "The progress bars (left) track quest completion"}
            onClick={handleClick}
            initial={{ opacity: 0, rotate: -90, scale: 0.9, transition: { duration: 0.18 }  }}
            animate={
                clickedAnim || denied
                    ? {
                        x: [0, -1, 1, -1, 1, -1, 0], // shake
                        opacity: 1,
                        rotate: spin,
                        scale: 1,
                        transition: {duration: 0.3}
                    }
                    : { x: 0, backgroundColor: "transparent", opacity: 1, rotate: spin, scale: 1 }
            }
            exit={{ opacity: 0, rotate: 90, scale: 0.9, transition: { duration: 0.18 } }}
            transition={{ rotate: { type: "spring", stiffness: 180, damping: 18 }, duration: 0.18 }}
            className={`rounded-md ${canToggle ? "hover:bg-black/7 cursor-pointer" : "cursor-default"} transition-colors duration-250 ${className}`}
        >

            <Image
                key={isDark ? "dark" : "light"}
                src={isDark ? "/icons/darkmode_light.svg" : "/icons/darkmode_dark.svg"}
                width={20}
                height={20}
                alt=""
                className={canToggle ? "opacity-100" : "opacity-0 md:opacity-50"}
                draggable={false}
            />
        </motion.button>

    );
}
