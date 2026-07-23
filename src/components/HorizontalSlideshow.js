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

    // Momentum model: everything drives a `target` scroll position, and a rAF
    // loop eases scrollLeft toward it. That gives trackpad/wheel smoothing and
    // drift after a drag release, instead of stopping dead.
    const EASE = 0.16; // per-frame approach toward target (higher = snappier)
    const DRAG_MOMENTUM = 12; // how far a drag flick coasts on release
    const maxScroll = () => el.scrollWidth - el.clientWidth;
    const clamp = (v) => Math.max(0, Math.min(maxScroll(), v));

    let target = el.scrollLeft;
    let raf = 0;
    const tick = () => {
      const diff = target - el.scrollLeft;
      if (Math.abs(diff) < 0.5) {
        el.scrollLeft = target;
        raf = 0;
        return;
      }
      el.scrollLeft += diff * EASE;
      raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    // Horizontal trackpad gestures (and shift+wheel on a mouse) feed the target.
    // preventDefault only when we can consume the scroll, so vertical page
    // scroll and edge overscroll stay intact.
    const onWheel = (e) => {
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY)
          ? e.deltaX
          : e.shiftKey
            ? e.deltaY
            : 0;
      if (!delta) return;
      const max = maxScroll();
      const atStart = delta < 0 && target <= 0;
      const atEnd = delta > 0 && target >= max - 0.5;
      if (atStart || atEnd) return;
      e.preventDefault();
      target = clamp(target + delta);
      kick();
    };

    // Click-drag scrolling for mouse users: 1:1 while held, then coast on release.
    let dragging = false;
    let startX = 0;
    let startLeft = 0;
    let prev = 0;
    let velocity = 0;
    const onPointerDown = (e) => {
      if (e.pointerType === "touch") return;
      dragging = true;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      startX = e.clientX;
      startLeft = el.scrollLeft;
      prev = el.scrollLeft;
      velocity = 0;
      target = el.scrollLeft;
      el.setPointerCapture?.(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const onPointerMove = (e) => {
      if (!dragging) return;
      const next = clamp(startLeft - (e.clientX - startX));
      velocity = next - prev;
      prev = next;
      el.scrollLeft = next;
      target = next;
    };
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = "";
      target = clamp(el.scrollLeft + velocity * DRAG_MOMENTUM);
      kick();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    return () => {
      if (raf) cancelAnimationFrame(raf);
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
