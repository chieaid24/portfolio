"use client";

import Image from "next/image";
import ModelSection from "@/components/ModelSection";
import { useState, useEffect } from "react";
import YoutubePlayer from "@/components/YoutubePlayer";

// Helper function to check if file is a .glb model
const isGLBFile = (filePath) => {
  return filePath && filePath.toLowerCase().endsWith(".glb");
};

// is this a YouTube video? (full URL or 11-char ID)
const isYouTubeVideo = (input) => {
  if (!input) return false;
  const s = String(input).trim();

  // Already an 11-char YouTube ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return true;

  // Try URL patterns
  try {
    const url = new URL(s);
    const host = url.hostname.replace(/^www\./, "");

    // youtu.be/<id>
    if (host === "youtu.be") {
      const seg = url.pathname.split("/").filter(Boolean)[0] || "";
      return /^[a-zA-Z0-9_-]{11}$/.test(seg);
    }

    // youtube.com/watch?v=<id>  |  /embed/<id>  |  /shorts/<id>  |  /live/<id>
    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return true;
      if (/^\/(embed|shorts|live)\/[a-zA-Z0-9_-]{11}/.test(url.pathname))
        return true;
    }

    // playlist URLs don't point to a single video
    return false;
  } catch {
    return false; // not a URL and not an ID
  }
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)"); // Tailwind md breakpoint
    const handler = (e) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

export default function RenderPageDisplay({ info, projectTitle }) {
  const [imageHovered, setImageHovered] = useState(false);
  const isMobile = useIsMobile();
  const showDescription = isMobile || imageHovered;

  return (
    <div className="mb-15">
      <div
        onMouseEnter={() => setImageHovered(true)}
        onMouseLeave={() => setImageHovered(false)}
      >
        {isYouTubeVideo(info[0]) ? (
          <YoutubePlayer urlOrId={info[0]} title={projectTitle} />
        ) : isGLBFile(info[0]) ? (
          <ModelSection modelPath={info[0]} />
        ) : (
          <div className="relative aspect-[16/8] w-full overflow-hidden rounded-lg shadow-lg">
            <Image
              src={info[0]}
              alt={projectTitle}
              fill
              className="scale-100 object-cover object-center"
            />
          </div>
        )}
      </div>
      {info[1] && (
        <div
          className={`text-outline-gray mt-1.5 italic transition-opacity duration-200 ${showDescription ? "opacity-100" : "opacity-0 duration-200"}}`}
        >
          <span className="font-semibold">Pictured:</span> {info[1]}
        </div>
      )}
    </div>
  );
}
