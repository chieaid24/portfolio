'use client';

import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { motion } from "framer-motion";
import { useMoney } from "@/lib/money-context"

export default function DarkModeToggle({ className = "", onFailedToggle, questClicked }) {
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [denied, setDenied] = useState(false);
    const [clickedAnim, setClickedAnim] = useState(false);


    const { getAllQuestsComplete, ready } = useMoney();
    const allQuestComp = getAllQuestsComplete();
    const canToggle = ready && allQuestComp;


    // On mount, read from the DOM/localStorage (no system check)
    useEffect(() => {
        setMounted(true);
        try {
            const saved = localStorage.getItem("theme");     // 'dark' | 'light' | null
            const initial = saved === "dark";                // default false (light) if null
            setIsDark(initial);
        } catch {
            setIsDark(false);
        }
    }, []);

    // Apply class + persist
    useEffect(() => {
        if (!mounted) return;
        const root = document.documentElement;
        root.classList.toggle("dark", isDark);
        root.style.colorScheme = isDark ? "dark" : "light";
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }, [isDark, mounted]);


    // Track last triggerFlash value
    const lastClick = useRef(questClicked);
    // Trigger animation when questClicked changes
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
            setIsDark((v) => !v);
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
            aria-label="Dark Mode"
            title={canToggle ? undefined : "Complete all quests to unlock!"}
            onClick={handleClick}
            initial={{ opacity: 0, rotate: -90, scale: 0.9, transition: { duration: 0.18 }  }}
            animate={
                clickedAnim || denied
                    ? {
                        x: [0, -1, 1, -1, 1, -1, 0], // shake
                        opacity: 1,
                        rotate: 0,
                        scale: 1,
                        transition: {duration: 0.3}
                    }
                    : { x: 0, backgroundColor: "transparent", opacity: 1, rotate: 0, scale: 1 }
            }
            exit={{ opacity: 0, rotate: 90, scale: 0.9, transition: { duration: 0.18 } }}
            transition={{ duration: 0.18 }}
            className={`rounded-md ${canToggle ? "hover:bg-black/7 cursor-pointer" : "cursor-default"} transition-colors duration-250 ${className}`}
        >

            <Image
                key={isDark ? "dark" : "light"}
                src={isDark ? "/icons/darkmode_light.svg" : "/icons/darkmode_dark.svg"}
                width={20}
                height={20}
                alt="Dark mode toggle"
                className={canToggle ? "opacity-100" : "opacity-0 md:opacity-50"}
                draggable={false}
            />
        </motion.button>

    );
}