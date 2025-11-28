"use client";

export default function SpotifyEmbed({
  playlistId, // e.g. "1oQngKRVkU7oI8hmB4hf7i"
  theme = 0, // 0 = dark, 1 = light
  className = "", // extra Tailwind classes
}) {
  if (!playlistId) {
    return (
      <div className="rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-white shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
        Couldn&apos;t load Spotify right now. Please try again later.
      </div>
    );
  }

  const src = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=${theme}`;
  return (
    <iframe
      style={{ borderRadius: 12 + "px" }}
      title="Spotify playlist"
      className={`w-full ${className}`}
      src={src}
      height={152}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      allowFullScreen
      loading="eager"
      onError={(e) => {
        const container = e.currentTarget.parentElement;
        if (!container) return;
        const fallback = document.createElement("div");
        fallback.className =
          "rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-white shadow-[0_16px_40px_rgba(0,0,0,0.25)]";
        fallback.textContent =
          "Couldn't load Spotify right now. Please try again later.";
        container.replaceChild(fallback, e.currentTarget);
      }}
    />
  );
}
