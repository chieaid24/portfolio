"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import Image from "next/image";
import BulletIcon from "@/icons/BulletIcon";

function Slide({ src, alt, priority }) {
  // Fade each image in as it finishes loading so slides don't "pop in"
  // over the placeholder once their bytes arrive on production.
  const [loaded, setLoaded] = useState(false);
  const markLoaded = () => setLoaded(true);

  return (
    <motion.div className="relative h-[220px] w-full overflow-hidden rounded-xl bg-widget-surface-2 shadow-lg">
      {/* Spinner placeholder so the slide doesn't read as blank pre-load */}
      {!loaded && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-main-text/20 border-t-main-text/40" />
        </div>
      )}
      <motion.div
        className="relative h-full w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 768px) 350px, 250px"
          priority={priority}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          onLoad={markLoaded}
          onError={markLoaded}
          className="object-cover select-none"
          style={{ WebkitUserDrag: "none" }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function Carousel() {
  const viewportRef = useRef(null); // clips the strip and bounds the drag
  const trackRef = useRef(null); // the draggable strip
  const x = useMotionValue(0);

  // Trackpad horizontal scroll: nudge the same motion value framer drags, eased
  // for a light inertia. Pushing past an end rubber-bands and springs back once
  // the gesture stops, matching the drag's elastic edges.
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const EASE = 0.16; // glide toward target (higher = snappier)
    const ELASTIC = 0.5; // overscroll give as a fraction of the viewport
    const IDLE_MS = 120; // gesture-end delay before snapping back to the edge
    const bounds = () => ({
      min: Math.min(0, viewport.offsetWidth - track.scrollWidth),
      max: 0,
    });
    // Diminishing resistance the further past an edge you push.
    const rubber = (over) => {
      const give = viewport.offsetWidth * ELASTIC;
      return (give * over) / (give + over);
    };
    // Displayed position for an unbounded target, rubber-banded past the edges.
    const display = (t) => {
      const { min, max } = bounds();
      if (t > max) return max + rubber(t - max);
      if (t < min) return min - rubber(min - t);
      return t;
    };

    let target = x.get(); // unbounded; may sit past an edge mid-gesture
    let raf = 0;
    let idle = 0;
    const ease = () => {
      const cur = x.get();
      const dest = display(target);
      const diff = dest - cur;
      if (Math.abs(diff) < 0.5) {
        x.set(dest);
        raf = 0;
        return;
      }
      x.set(cur + diff * EASE);
      raf = requestAnimationFrame(ease);
    };
    const startEase = () => {
      if (!raf) raf = requestAnimationFrame(ease);
    };
    const stopEase = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onWheel = (e) => {
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY)
          ? e.deltaX
          : e.shiftKey
            ? e.deltaY
            : 0;
      if (!delta) return; // vertical intent -> let the page scroll
      e.preventDefault();
      const { min, max } = bounds();
      const cap = viewport.offsetWidth * ELASTIC; // limit the raw overscroll
      if (!raf) target = x.get();
      target = Math.max(min - cap, Math.min(max + cap, target - delta));
      startEase();
      // Once the gesture (and its momentum) stops, pull back to the edge.
      clearTimeout(idle);
      idle = setTimeout(() => {
        target = Math.max(min, Math.min(max, target));
        startEase();
      }, IDLE_MS);
    };

    // Framer owns the motion value during a drag; stop the wheel glide so they
    // don't fight, then resume from wherever the drag left off.
    const onPointerDown = () => {
      clearTimeout(idle);
      stopEase();
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    track.addEventListener("pointerdown", onPointerDown);
    return () => {
      clearTimeout(idle);
      stopEase();
      viewport.removeEventListener("wheel", onWheel);
      track.removeEventListener("pointerdown", onPointerDown);
    };
  }, [x]);

  const images = [
    {
      src: "/about/carousel_images/about_slides_1.JPEG",
      caption: "Climbing in Red Rock",
    },
    {
      src: "/about/carousel_images/about_slides_5.jpeg",
      caption: "Sensoji Temple in Tokyo",
    },
    {
      src: "/about/carousel_images/about_slides_6.jpeg",
      caption: "Jeju City, South Korea",
    },
    {
      src: "/about/carousel_images/about_slides_3.JPG",
      caption: "Shooting for a video",
    },
    {
      src: "/about/carousel_images/about_slides_2_v1.JPEG",
      caption: "Volunteering in Nairobi",
    },
    {
      src: "/about/carousel_images/about_slides_4.JPG",
      caption: "All-program rafting trip",
    },
  ];

  return (
    <div className="border-outline-dark-gray w-full rounded-xl border bg-widget-surface p-3 md:p-5">
      <div ref={viewportRef} className="overflow-hidden rounded-xl">
        <motion.div
          ref={trackRef}
          drag="x"
          dragConstraints={viewportRef}
          style={{ x }}
          className="flex w-max cursor-grab gap-5"
          whileTap={{ cursor: "grabbing" }}
        >
          {images.map((item, i) => (
            <figure
              key={i}
              className="flex h-[160px] min-w-[250px] flex-col items-center gap-3 md:h-[200px] md:min-w-[300px]"
            >
              <Slide
                src={item.src}
                alt={item.caption || `Slide ${i + 1}`}
                priority={i === 0}
              />
              <figcaption className="font-base text-body-text flex items-center gap-2 text-center text-xs sm:text-sm">
                <BulletIcon className="text-highlight-color h-2 w-2" />
                {item.caption}
              </figcaption>
            </figure>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
