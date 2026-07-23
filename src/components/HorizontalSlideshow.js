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

    // Wheel/trackpad drives a `target` that a rAF loop eases toward (smooth
    // glide). Mouse drag is 1:1 while held, then throws with an exponential
    // decay tuned to match framer-motion's old dragMomentum feel.
    const EASE = 0.16; // wheel/trackpad glide (higher = snappier)
    const POWER = 0.8; // drag throw distance = POWER * release velocity (framer default)
    const TIME_CONSTANT = 750; // drag coast decay, ms (framer default)
    const maxScroll = () => el.scrollWidth - el.clientWidth;
    const clamp = (v) => Math.max(0, Math.min(maxScroll(), v));

    let target = el.scrollLeft;
    let raf = 0;
    let mode = null; // "ease" (wheel) | "inertia" (drag release)
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      mode = null;
    };

    const easeTick = () => {
      const diff = target - el.scrollLeft;
      if (Math.abs(diff) < 0.5) {
        el.scrollLeft = target;
        raf = 0;
        mode = null;
        return;
      }
      el.scrollLeft += diff * EASE;
      raf = requestAnimationFrame(easeTick);
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
      const base = mode === "ease" ? target : el.scrollLeft;
      const atStart = delta < 0 && base <= 0;
      const atEnd = delta > 0 && base >= max - 0.5;
      if (atStart || atEnd) return;
      e.preventDefault();
      if (mode !== "ease") stop();
      target = clamp(base + delta);
      mode = "ease";
      if (!raf) raf = requestAnimationFrame(easeTick);
    };

    // Drag throw: value(t) = to - amplitude * e^(-t/TIME_CONSTANT), resting at
    // to = from + POWER * velocity. Same exponential throw framer-motion uses.
    const runInertia = (v0) => {
      stop();
      const from = el.scrollLeft;
      const amplitude = POWER * v0;
      const to = from + amplitude;
      const startTime = performance.now();
      mode = "inertia";
      const step = (now) => {
        const d = -amplitude * Math.exp(-(now - startTime) / TIME_CONSTANT);
        const pos = to + d;
        const max = maxScroll();
        if (pos <= 0 || pos >= max) {
          el.scrollLeft = clamp(pos);
          target = el.scrollLeft;
          raf = 0;
          mode = null;
          return;
        }
        el.scrollLeft = pos;
        target = pos;
        if (Math.abs(d) > 0.5) {
          raf = requestAnimationFrame(step);
        } else {
          raf = 0;
          mode = null;
        }
      };
      raf = requestAnimationFrame(step);
    };

    // Click-drag scrolling: 1:1 while held, tracking px/s velocity for the throw.
    let dragging = false;
    let startX = 0;
    let startLeft = 0;
    let lastT = 0;
    let velocity = 0; // scrollLeft px/s at release
    const onPointerDown = (e) => {
      if (e.pointerType === "touch") return;
      dragging = true;
      stop();
      startX = e.clientX;
      startLeft = el.scrollLeft;
      lastT = e.timeStamp || performance.now();
      velocity = 0;
      target = el.scrollLeft;
      el.setPointerCapture?.(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const onPointerMove = (e) => {
      if (!dragging) return;
      const now = e.timeStamp || performance.now();
      const next = clamp(startLeft - (e.clientX - startX));
      const dt = now - lastT;
      if (dt > 0) {
        const inst = ((next - el.scrollLeft) / dt) * 1000;
        // light smoothing so one jittery sample doesn't dominate the throw
        velocity = 0.7 * inst + 0.3 * velocity;
      }
      el.scrollLeft = next;
      target = next;
      lastT = now;
    };
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = "";
      runInertia(velocity);
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
