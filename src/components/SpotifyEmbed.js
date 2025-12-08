"use client";

import { useEffect, useState } from "react";

export default function SpotifyEmbed({
  playlistId, // e.g. "1oQngKRVkU7oI8hmB4hf7i"
  theme = 0, // 0 = dark, 1 = light
  className = "", // extra Tailwind classes
}) {
  const [isReady, setIsReady] = useState(false);

  if (!playlistId) {
    return (
      <div className="rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-white shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
        Couldn&apos;t load Spotify right now. Please try again later.
      </div>
    );
  }

  const src = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=${theme}`;

  useEffect(() => {
    // Reset ready state when playlist changes so fade replays.
    setIsReady(false);
  }, [src]);

  return (
    <div className="border-outline-gray relative overflow-hidden rounded-xl border-1">
      {!isReady && (
        <div className="absolute inset-0 animate-pulse rounded-xl bg-white/5" />
      )}
      <iframe
        title="Spotify playlist"
        className={`w-full transition-opacity duration-600 ease-out ${className}`}
        src={src}
        height={152}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        loading="eager"
        onLoad={() => setIsReady(true)}
        onError={(e) => {
          setIsReady(true);
          const container = e.currentTarget.parentElement;
          if (!container) return;
          const fallback = document.createElement("div");
          fallback.className =
            "rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-white shadow-[0_16px_40px_rgba(0,0,0,0.25)]";
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
