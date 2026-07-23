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
  const trackRef = useRef(null);

  useEffect(() => {
    const el = scrollerRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    const EASE = 0.16; // wheel/trackpad glide (higher = snappier)
    const POWER = 0.8; // drag throw distance = POWER * release velocity (framer default)
    const TIME_CONSTANT = 750; // drag coast decay, ms (framer default)
    const ELASTIC = 0.5; // edge rubber-band give (fraction of the viewport)
    const SPRING_K = 0.1; // snap-back stiffness
    const SPRING_D = 0.72; // snap-back damping (velocity kept per frame)

    const maxScroll = () => el.scrollWidth - el.clientWidth;
    const clamp = (v) => Math.max(0, Math.min(maxScroll(), v));

    // Rubber-band: resistance that grows the further past the edge you pull,
    // asymptotically capped so it never runs away.
    const rubber = (over) => {
      const give = (el.clientWidth || 1) * ELASTIC;
      const x = Math.abs(over);
      return (Math.sign(over) * (give * x)) / (give + x);
    };

    // ---- in-range scroll (wheel glide + drag throw) ----
    let target = el.scrollLeft;
    let raf = 0;
    let mode = null; // "ease" (wheel) | "inertia" (drag release)
    const stopScroll = () => {
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

    // ---- edge overshoot (visual translate on the track) ----
    let over = 0; // signed px past the edge, pre-rubber
    let overV = 0; // spring velocity
    let overRaf = 0;
    const renderOver = () => {
      track.style.transform = over
        ? `translate3d(${-rubber(over)}px, 0, 0)`
        : "translate3d(0, 0, 0)";
    };
    const overSpring = () => {
      overV = (overV - SPRING_K * over) * SPRING_D;
      over += overV;
      if (Math.abs(over) < 0.3 && Math.abs(overV) < 0.3) {
        over = 0;
        overV = 0;
        renderOver();
        overRaf = 0;
        return;
      }
      renderOver();
      overRaf = requestAnimationFrame(overSpring);
    };
    const startOverSpring = (v0 = 0) => {
      overV = v0;
      if (!overRaf) overRaf = requestAnimationFrame(overSpring);
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
      if (mode !== "ease") stopScroll();
      target = clamp(base + delta);
      mode = "ease";
      if (!raf) raf = requestAnimationFrame(easeTick);
    };

    // Drag throw: value(t) = to - amplitude * e^(-t/TIME_CONSTANT), resting at
    // to = from + POWER * velocity. A flick that hits an edge hands its leftover
    // speed to the spring for an elastic bounce.
    const runInertia = (v0) => {
      stopScroll();
      const from = el.scrollLeft;
      const amplitude = POWER * v0;
      const to = from + amplitude;
      const startTime = performance.now();
      let prevPos = from;
      mode = "inertia";
      const step = (now) => {
        const d = -amplitude * Math.exp(-(now - startTime) / TIME_CONSTANT);
        const pos = to + d;
        const max = maxScroll();
        if (pos < 0 || pos > max) {
          el.scrollLeft = pos < 0 ? 0 : max;
          raf = 0;
          mode = null;
          startOverSpring(pos - prevPos); // leftover per-frame speed -> bounce
          return;
        }
        el.scrollLeft = pos;
        target = pos;
        prevPos = pos;
        if (Math.abs(d) > 0.5) {
          raf = requestAnimationFrame(step);
        } else {
          raf = 0;
          mode = null;
        }
      };
      raf = requestAnimationFrame(step);
    };

    // ---- click-drag ----
    let dragging = false;
    let startX = 0;
    let startLeft = 0;
    let lastT = 0;
    let velocity = 0; // scrollLeft px/s at release
    const onPointerDown = (e) => {
      if (e.pointerType === "touch") return;
      dragging = true;
      stopScroll();
      if (overRaf) {
        cancelAnimationFrame(overRaf);
        overRaf = 0;
      }
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
      const desired = startLeft - (e.clientX - startX);
      const next = clamp(desired);
      const dt = now - lastT;
      if (dt > 0) {
        const inst = ((next - el.scrollLeft) / dt) * 1000;
        // light smoothing so one jittery sample doesn't dominate the throw
        velocity = 0.7 * inst + 0.3 * velocity;
      }
      el.scrollLeft = next;
      target = next;
      over = desired - next; // 0 in range, signed past an edge
      renderOver();
      lastT = now;
    };
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = "";
      if (over !== 0) {
        startOverSpring(); // snap the rubber-band back to the edge
      } else {
        runInertia(velocity);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (overRaf) cancelAnimationFrame(overRaf);
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
        className="no-scrollbar flex cursor-grab overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-xl select-none"
        style={{ touchAction: "pan-x", WebkitOverflowScrolling: "touch" }}
      >
        <div ref={trackRef} className="flex w-max gap-5 will-change-transform">
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
    </div>
  );
}
