"use client";
import { useState, useMemo, useEffect } from "react";
import { getYouTubeId } from "@/utils/youtube";

export default function YouTubePlayer({ urlOrId, title }) {
  const [play, setPlay] = useState(false);
  const id = useMemo(() => getYouTubeId(urlOrId) ?? "", [urlOrId]);
  const highResThumb = id
    ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`
    : null;
  const fallbackThumb = id
    ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    : null;
  const [thumbSrc, setThumbSrc] = useState(highResThumb);

  useEffect(() => {
    setThumbSrc(highResThumb);
  }, [highResThumb]);

  if (!id) return null; // or render a fallback

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      {!play ? (
        <button
          onClick={() => setPlay(true)}
          className="group relative block h-full w-full"
          aria-label={`Play ${title}`}
        >
          <img
            src={thumbSrc}
            alt=""
            className="h-full w-full object-cover opacity-80 transition duration-200 group-hover:opacity-85"
            onError={() => {
              // Fallback when a video doesn't have a max-res thumbnail available.
              if (thumbSrc !== fallbackThumb) setThumbSrc(fallbackThumb);
            }}
          />
          {/* Play button */}
          <span className="absolute inset-0 grid place-items-center">
            <span className="bg-highlight-color group-hover:bg-highlight-color/70 grid h-14 w-14 place-items-center rounded-full transition duration-200">
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      ) : (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      )}
    </div>
  );
}
