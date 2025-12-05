"use client";
import { useEffect, useState } from "react";
import ScrollArrowUp from "@/icons/ScrollArrowUp";
import ScrollArrowDown from "@/icons/ScrollArrowDown";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return isDesktop;
}

export default function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(48);
  const [trackHeight, setTrackHeight] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const isDesktop = useIsDesktop();

  // Only attach scroll handlers on desktop
  useEffect(() => {
    if (!isDesktop) return;
    const handleScroll = () => {
      const { scrollHeight, clientHeight } = document.documentElement;
      const totalScrollable = scrollHeight - clientHeight;
      const currentScroll = window.scrollY;
      setIsVisible(totalScrollable > 0);

      // Mirror rendered spacing: outer py-1, flex gap-2 between arrow/track, 8px track padding each side, 8px arrow icons
      const arrowSize = 8;
      const outerPadding = 8; // py-1 => 4px top + 4px bottom
      const gapSize = 8;
      const gapsTotal = gapSize * 2;
      const trackPadding = 8;
      const usableTrack =
        window.innerHeight -
        outerPadding -
        gapsTotal -
        arrowSize * 2 -
        trackPadding * 2;
      const clampedTrack = Math.max(0, usableTrack);
      setTrackHeight(clampedTrack);

      const visibleRatio =
        totalScrollable > 0 ? clientHeight / scrollHeight : 1;
      const computedThumbHeight = Math.max(
        32,
        Math.min(clampedTrack, clampedTrack * visibleRatio),
      );
      setThumbHeight(computedThumbHeight);

      const maxTravel = Math.max(0, clampedTrack - computedThumbHeight);
      const progress =
        totalScrollable > 0 ? (currentScroll / totalScrollable) * maxTravel : 0;
      setScrollProgress(Math.min(maxTravel, Math.max(0, progress)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isDesktop]);

  // Hide native scrollbar **only on desktop**
  useEffect(() => {
    if (!isDesktop) return;
    const style = document.createElement("style");
    style.textContent = `
      /* Chrome/Safari/Opera */
      ::-webkit-scrollbar { display: none; }
      /* IE/Edge/Firefox */
      html, body { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, [isDesktop]);

  // On mobile: show default scrollbar (render nothing)
  if (!isDesktop) return null;

  return (
    <div
      className={`pointer-events-none fixed top-0 right-[2px] z-[100] h-full w-1.5 py-1 transition-opacity duration-400 ${isVisible ? "opacity-100" : "opacity-0"} text-outline-gray`}
    >
      <div className="flex h-full flex-col items-center gap-2">
        <ScrollArrowUp className="h-1.5 w-1.5" />
        <div className="relative w-full flex-1">
          <div className="absolute inset-0 mx-auto w-full rounded-full" />
          <div
            className="bg-outline-gray absolute right-[10px] left-0 mx-auto w-full rounded-full shadow-sm transition-transform duration-100"
            style={{
              height: `${thumbHeight}px`,
              transform: `translateY(${scrollProgress}px)`,
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 mx-auto w-full"
            style={{ height: trackHeight }}
          />
        </div>
        <ScrollArrowDown className="h-1.5 w-1.5" />
      </div>
    </div>
  );
}
