"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import useMeasure from "react-use-measure";
import Image from "next/image";
import BulletIcon from "@/icons/BulletIcon";
import { experiences } from "@/app/data/experiences";
import { useMoney } from "@/lib/money-context";

const tabs = [
  { id: "work", label: "Work" },
  { id: "education", label: "Education" },
];

const badgeImagePath = "/company-images/waterloo-logo_v2.png";

function TimelineItem({ item }) {
  return (
    <div className="relative flex gap-3 sm:gap-6">
      <div className="h-10 w-10 overflow-hidden rounded-full border-[2px] border-outline-dark-gray sm:h-13 sm:w-13">
        <Image
          src={item.badge?.src ?? badgeImagePath}
          alt={item.badge?.alt ?? `${item.title} logo`}
          width={60}
          height={60}
          className="h-full w-full scale-105"
          sizes="(max-width: 640px) 40px, 52px"
          quality={75}
        />
      </div>

      <div className="flex-1 space-y-2">
        <div className="space-y-0">
          <h3 className="text-lg leading-tight font-semibold text-main-text sm:text-lg sm:leading-tight">
            {item.title}
          </h3>
          {(item.subtitle || item.period) && (
            <div className="flex items-baseline justify-between gap-2">
              {item.subtitle && (
                <p className="text-base font-medium text-dark-body-text">{item.subtitle}</p>
              )}
              {item.period && (
                <p className="tracking-wide ml-auto text-sm text-dark-body-text">{item.period}</p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-1 font-normal tracking-wide text-gray-100">
          {item.highlights.map((highlight, index) => (
            <div
              key={`${item.id}-highlight-${index}`}
              className="relative flex items-center gap-x-3 pl-0 sm:gap-x-4"
            >
              <BulletIcon className="text-highlight-color h-2 w-2 shrink-0" />
              <div className="space-y-0">
                <p className="text-body-text text-sm leading-tight sm:text-base">
                  {highlight.text}
                </p>
                {highlight.note && (
                  <p className="text-xs text-experience-meta sm:text-sm">
                    {highlight.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Experience() {
  const [activeTab, setActiveTab] = useState("work");
  const [tabFills, setTabFills] = useState({});
  const shouldReduceMotion = useReducedMotion();
  const { awardOnce } = useMoney();
  const tabItems = tabs.map((tab) => ({
    ...tab,
    items: experiences[tab.id] ?? [],
  }));
  let [ref, { height }] = useMeasure();

  // Cursor-follow flash for inactive tabs (same technique as the Resume button
  // on the landing page). A single rAF "lerp" loop eases the highlight toward
  // the latest pointer position each frame, decoupled from sparse mousemove
  // events, so the motion stays smooth. The tab rect is read once on enter.
  const flashRaf = useRef(0);
  const flashLast = useRef(0);
  const flashEl = useRef(null);
  const flashRect = useRef(null);
  const flashTarget = useRef({ x: 0, y: 0 });
  const flashPos = useRef({ x: 0, y: 0 });

  const flashTick = useCallback((now) => {
    const el = flashEl.current;
    if (!el) {
      flashRaf.current = 0;
      return;
    }
    const dt = Math.min(now - flashLast.current, 64);
    flashLast.current = now;
    // Framerate-independent smoothing: ~0.25 catch-up per 60fps frame.
    const k = 1 - Math.pow(0.75, dt / 16.6667);
    const pos = flashPos.current;
    const t = flashTarget.current;
    pos.x += (t.x - pos.x) * k;
    pos.y += (t.y - pos.y) * k;
    el.style.setProperty("--flash-x", `${pos.x}px`);
    el.style.setProperty("--flash-y", `${pos.y}px`);
    flashRaf.current = requestAnimationFrame(flashTick);
  }, []);

  const stopFlash = useCallback((el) => {
    const node = el ?? flashEl.current;
    if (node) {
      node.style.setProperty("--flash-active", "0");
      node.style.setProperty("--flash-size", "0");
    }
    if (flashRaf.current) {
      cancelAnimationFrame(flashRaf.current);
      flashRaf.current = 0;
    }
    flashEl.current = null;
    flashRect.current = null;
  }, []);

  const handleFlashEnter = (event) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    flashEl.current = el;
    flashRect.current = rect;
    flashTarget.current = { x, y };
    flashPos.current = { x, y }; // start under the cursor (no fly-in)
    el.style.setProperty("--flash-x", `${x}px`);
    el.style.setProperty("--flash-y", `${y}px`);
    el.style.setProperty("--flash-active", "0.05");
    el.style.setProperty("--flash-size", "1");
    if (!flashRaf.current) {
      flashLast.current = performance.now();
      flashRaf.current = requestAnimationFrame(flashTick);
    }
  };

  const handleFlashMove = (event) => {
    const rect = flashRect.current;
    if (!rect) return;
    flashTarget.current.x = event.clientX - rect.left;
    flashTarget.current.y = event.clientY - rect.top;
  };

  const handleFlashLeave = () => stopFlash();

  // Capture the click point so the highlight can expand outward from the cursor.
  const handleTabClick = (tabId, event) => {
    // Clicking the Education tab is an in-page action (no navigation) — pay out
    // immediately, once ever (dedup handled by awardOnce).
    if (tabId === "education") {
      awardOnce("education-tab", "link");
    }
    if (tabId !== activeTab) {
      const rect = event.currentTarget.getBoundingClientRect();
      // Keyboard activation has no pointer position; fall back to the center.
      const isKeyboard = event.detail === 0;
      const x = isKeyboard ? rect.width / 2 : event.clientX - rect.left;
      const y = isKeyboard ? rect.height / 2 : event.clientY - rect.top;
      // Radius needed to reach the farthest corner from the click point.
      const radius = Math.hypot(
        Math.max(x, rect.width - x),
        Math.max(y, rect.height - y),
      );
      setTabFills((prev) => ({ ...prev, [tabId]: { x, y, radius } }));
      // This tab is becoming active, so its hover handlers are about to be
      // removed and mouseLeave won't fire — kill the follow circle now.
      stopFlash(event.currentTarget);
    }
    setActiveTab(tabId);
  };

  return (
    <section className="text-main-text">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="bg-background border-outline-dark-gray rounded-2xl border p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]">
          <div className="grid grid-cols-2 gap-1">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              const fill = tabFills[tab.id];
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={(event) => handleTabClick(tab.id, event)}
                  onMouseEnter={isActive ? undefined : handleFlashEnter}
                  onMouseMove={isActive ? undefined : handleFlashMove}
                  onMouseLeave={isActive ? undefined : handleFlashLeave}
                  className={`relative isolate overflow-hidden rounded-xl px-4 py-2 text-sm font-semibold text-main-text transition-[color,background-color,box-shadow] duration-200 sm:text-base ${
                    isActive
                      ? "shadow-[0_5px_30px_rgba(255,255,255,0.2)]"
                      : "cursor-follow-btn cursor-follow-btn--lg cursor-pointer"
                  }`}
                >
                  <AnimatePresence initial={false}>
                    {isActive &&
                      (fill ? (
                        <motion.span
                          key="fill"
                          aria-hidden="true"
                          initial={{ scale: 0.05, opacity: 0.5 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={
                            shouldReduceMotion
                              ? { duration: 0 }
                              : {
                                  scale: {
                                    duration: 0.45,
                                    // Smooth settle: gentle ramp-in, soft finish.
                                    ease: [0.22, 1, 0.36, 1],
                                    // Previous ease — uncomment to toggle back:
                                    // ease: "linear",
                                  },
                                  opacity: { duration: 0.2, ease: "easeOut" },
                                }
                          }
                          style={{
                            left: fill.x - fill.radius,
                            top: fill.y - fill.radius,
                            width: fill.radius * 2,
                            height: fill.radius * 2,
                          }}
                          className="bg-highlight-color pointer-events-none absolute rounded-full"
                        />
                      ) : (
                        <motion.span
                          key="fill-initial"
                          aria-hidden="true"
                          exit={{ opacity: 0 }}
                          transition={
                            shouldReduceMotion
                              ? { duration: 0 }
                              : { opacity: { duration: 0.2, ease: "easeOut" } }
                          }
                          className="bg-highlight-color pointer-events-none absolute inset-0 rounded-[inherit]"
                        />
                      ))}
                  </AnimatePresence>
                  <span
                    className={`relative z-10 ${isActive ? "text-white" : ""}`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <motion.div
          animate={{ height }}
          transition={{ duration: 0 }}
          className="bg-background border-outline-dark-gray relative rounded-2xl border shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
        >
          {tabItems.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <div
                key={tab.id}
                aria-hidden={!isActive}
                className={`transition-opacity duration-0 ${
                  isActive
                    ? "relative opacity-100"
                    : "pointer-events-none absolute inset-0 opacity-0"
                }`}
              >
                <div
                  ref={isActive ? ref : undefined}
                  className="relative px-3 py-5 sm:px-6 sm:py-6"
                >
                  <div
                    className="absolute top-0 bottom-0.5 left-[2rem] w-[1px] bg-outline-dark-gray sm:left-[3.1rem]"
                    aria-hidden="true"
                  />
                  <div className="z-10 space-y-8">
                    {tab.items.map((item) => (
                      <TimelineItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
