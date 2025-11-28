"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import BulletIcon from "@/icons/BulletIcon";

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
      src: "/about/carousel_images/about_slides_5.JPEG",
      caption: "Sensoji Temple in Tokyo",
    },
    {
      src: "/about/carousel_images/about_slides_6.JPEG",
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
    <div className="border-outline-gray w-full rounded-xl border bg-[#1f1f1f] p-5">
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
                className="flex h-[220px] min-w-[350px] flex-col items-center gap-3"
              >
                <motion.div className="h-[250px] w-full overflow-hidden rounded-xl shadow-lg">
                  <Image
                    src={item.src}
                    alt={item.caption || `Slide ${i + 1}`}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    className="h-full w-full object-cover select-none"
                    style={{ WebkitUserDrag: "none" }}
                    height="220"
                    width="350"
                  />
                </motion.div>
                <figcaption className="font-base text-body-text flex items-center gap-2 text-center text-sm">
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
