"use client";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

function CardRotate({ children, onSendToBack, sensitivity }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  function handleDragEnd(_, info) {
    if (
      Math.abs(info.offset.x) > sensitivity ||
      Math.abs(info.offset.y) > sensitivity
    ) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      className="absolute cursor-grab"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: "grabbing" }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

export default function Stack({
  sensitivity = 150,
  cardDimensions,
  animationConfig = { stiffness: 260, damping: 20 },
}) {
  const [cards, setCards] = useState([
    {
      id: 1,
      img: "/about/stack_images/about_image_4_v1.jpeg",
    },
    {
      id: 2,
      img: "/about/stack_images/about_image_3_v1.jpg",
    },
    {
      id: 3,
      img: "/about/stack_images/about_image_5_v1.jpeg",
    },
    {
      id: 4,
      img: "/about/stack_images/about_image_2.jpg",
    },
    {
      id: 5,
      img: "/about/stack_images/about_image_1.png",
    },
  ]);

  const cardSizeClasses = "w-[200px] h-[200px] md:w-[250px] md:h-[250px]";
  const sizeStyle = cardDimensions
    ? { width: cardDimensions.width, height: cardDimensions.height }
    : undefined;
  const imageSizes = cardDimensions?.width
    ? `${cardDimensions.width}px`
    : "(min-width: 768px) 250px, 200px";

  const sendToBack = (id) => {
    setCards((prev) => {
      const newCards = [...prev];
      const index = newCards.findIndex((card) => card.id === id);
      const [card] = newCards.splice(index, 1);
      newCards.unshift(card);
      return newCards;
    });
  };

  return (
    <div
      className={`relative ${cardSizeClasses}`}
      style={{
        perspective: 600,
        ...sizeStyle,
      }}
    >
      {cards.map((card, index) => {
        return (
          <CardRotate
            key={card.id}
            onSendToBack={() => sendToBack(card.id)}
            sensitivity={sensitivity}
          >
            <motion.div
              className={`border-outline-gray relative overflow-hidden rounded-2xl border-1 ${cardSizeClasses}`}
              animate={{
                rotateZ: (() => {
                  let base = 0;
                  if (index == cards.length - 1) base = 1;
                  else base = 6;
                  return (index % 2 === 0 ? -1 : 1) * base;
                })(),
                scale: (() => (index === cards.length - 1 ? 1 : 0.94))(),
                transformOrigin: "50% 90%",
              }}
              initial={false}
              transition={{
                type: "spring",
                stiffness: animationConfig.stiffness,
                damping: animationConfig.damping,
                // duration: 0.1,
              }}
              style={sizeStyle}
            >
              <Image
                src={card.img}
                alt={`card-${card.id}`}
                className="pointer-events-none object-cover select-none"
                fill
                sizes={imageSizes}
              />
            </motion.div>
          </CardRotate>
        );
      })}
    </div>
  );
}
