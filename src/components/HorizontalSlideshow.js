"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
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
  const scrollerRef = useRef(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    // Map horizontal trackpad gestures (and shift+wheel on a mouse) to the
    // strip's scroll. preventDefault only when we can actually consume the
    // scroll, so vertical page scroll and edge overscroll stay intact and
    // native scrolling never double-applies.
    const onWheel = (e) => {
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY)
          ? e.deltaX
          : e.shiftKey
            ? e.deltaY
            : 0;
      if (!delta) return;
      const max = el.scrollWidth - el.clientWidth;
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= max - 0.5;
      if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return;
      e.preventDefault();
      el.scrollLeft += delta;
    };

    // Click-drag scrolling for mouse users; touch and trackpad are handled above/natively.
    let dragging = false;
    let startX = 0;
    let startLeft = 0;
    const onPointerDown = (e) => {
      if (e.pointerType === "touch") return;
      dragging = true;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      el.setPointerCapture?.(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const onPointerMove = (e) => {
      if (!dragging) return;
      el.scrollLeft = startLeft - (e.clientX - startX);
    };
    const endDrag = () => {
      dragging = false;
      el.style.cursor = "";
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
    };
  }, []);

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
      <div
        ref={scrollerRef}
        className="no-scrollbar flex cursor-grab gap-5 overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-xl select-none"
        style={{ touchAction: "pan-x", WebkitOverflowScrolling: "touch" }}
      >
        {images.map((item, i) => (
          <figure
            key={i}
            className="flex h-[160px] min-w-[250px] shrink-0 flex-col items-center gap-3 md:h-[200px] md:min-w-[300px]"
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
      </div>
    </div>
  );
}
