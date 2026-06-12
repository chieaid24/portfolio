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
    <motion.div className="relative h-[220px] w-full overflow-hidden rounded-xl bg-[#2a2a2a] shadow-lg">
      {/* Spinner placeholder so the slide doesn't read as blank pre-load */}
      {!loaded && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/40" />
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
  const carouselRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!carouselRef.current) return;
    const scrollWidth = carouselRef.current.scrollWidth;
    const offsetWidth = carouselRef.current.offsetWidth;
    setWidth(scrollWidth - offsetWidth);
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
    <div className="border-outline-dark-gray w-full rounded-xl border bg-[#1f1f1f] p-3 md:p-5">
      <div className="overflow-hidden rounded-xl">
        <motion.div
          ref={carouselRef}
          className="flex cursor-grab"
          whileTap={{ cursor: "grabbing" }}
        >
          <motion.div
            drag="x"
            dragConstraints={{ left: -width, right: 0 }}
            className="flex gap-5"
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
        </motion.div>
      </div>
    </div>
  );
}
