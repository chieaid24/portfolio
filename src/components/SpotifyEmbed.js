"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import SpotifyIcon from "@/icons/SpotifyIcon";

export default function SpotifyEmbed({
  playlistId, // e.g. "1oQngKRVkU7oI8hmB4hf7i"
  theme = 0, // 0 = dark, 1 = light (fallback before the resolved theme is known)
  className = "", // extra Tailwind classes
}) {
  const [isReady, setIsReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const loadTimerRef = useRef(null);
  const { resolvedTheme } = useTheme();

  // Resolved theme is only known on the client; until mounted, render the prop
  // fallback so SSR and the first client render agree (no hydration mismatch).
  useEffect(() => setMounted(true), []);

  // Follow the site theme: Spotify's embed takes theme=1 for light, 0 for dark.
  const spotifyTheme = mounted ? (resolvedTheme === "light" ? 1 : 0) : theme;
  const src = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=${spotifyTheme}`;

  useEffect(() => {
    // Reset ready state when playlist changes so fade replays.
    setIsReady(false);
    if (loadTimerRef.current) {
      clearTimeout(loadTimerRef.current);
      loadTimerRef.current = null;
    }

    return () => {
      if (loadTimerRef.current) {
        clearTimeout(loadTimerRef.current);
      }
    };
  }, [src]);

  if (!playlistId) {
    return (
      <div className="rounded-xl border border-main-text/15 bg-main-text/5 p-4 text-sm text-main-text shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
        Couldn&apos;t load Spotify right now. Please try again later.
      </div>
    );
  }

  return (
    <div className="border-outline-dark-gray relative overflow-hidden rounded-xl border-1">
      <div
        className={`absolute inset-0 flex items-center justify-center rounded-xl bg-main-text/5 transition-opacity duration-500 ${isReady ? "pointer-events-none opacity-0" : "opacity-100"}`}
        aria-hidden={isReady}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <SpotifyIcon className="h-8 w-8 animate-pulse text-main-text/80" />
        </div>
      </div>
      <iframe
        title="Spotify playlist"
        className={`w-full transition-opacity duration-600 ease-out ${className}`}
        src={src}
        height={152}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        loading="eager"
        onLoad={() => {
          if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
          loadTimerRef.current = setTimeout(() => setIsReady(true), 700);
        }}
        onError={(e) => {
          if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
          setIsReady(true);
          const container = e.currentTarget.parentElement;
          if (!container) return;
          const fallback = document.createElement("div");
          fallback.className =
            "rounded-xl border border-main-text/15 bg-main-text/5 p-4 text-sm text-main-text shadow-[0_16px_40px_rgba(0,0,0,0.25)]";
          fallback.textContent =
            "Couldn't load Spotify right now. Please try again later.";
          container.replaceChild(fallback, e.currentTarget);
        }}
        style={{
          borderRadius: 12 + "px",
          opacity: isReady ? 1 : 0,
        }}
      />
    </div>
  );
}
