"use client";
import { useState } from "react";
import CarouselArrow from "@/icons/CarouselArrow";
import CarouselDot from "@/icons/CarouselDot";

function ArrowButton({ dir = "left", disabled, onClick }) {
  const [pressed, setPressed] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    setPressed(true);
    onClick?.();
    setTimeout(() => setPressed(false), 150); // animate back
  };

  const iconBase =
    "w-4 h-4 transition-transform duration-200 ease-in " +
    (dir === "left" ? "rotate-180 " : "");
  const translate = pressed
    ? dir === "left"
      ? "-translate-x-0.5"
      : "translate-x-0.5"
    : "";

  return (
    <button
      type="button"
      onClick={handleClick}
      className="dark:text-background-light cursor-pointer rounded-full px-4 py-1 text-sm text-neutral-300 transition-colors duration-200 hover:bg-black/10 disabled:pointer-events-none disabled:cursor-default disabled:text-neutral-600 md:px-2 md:py-1 dark:disabled:text-neutral-400"
      aria-label={dir === "left" ? "Previous widget" : "Next widget"}
      disabled={disabled}
    >
      <CarouselArrow
        className={`${iconBase}${translate ? " " + translate : ""}`}
      />
    </button>
  );
}

export default function WidgetCarousel({
  items = [], // [{ id, title, element }]
  className = "",
  initialIndex = 0,
}) {
  const [index, setIndex] = useState(
    Math.min(initialIndex, Math.max(0, items.length - 1)),
  );

  const clamp = (n, min, max) => Math.max(min, Math.min(n, max));
  const goTo = (i) => setIndex((prev) => clamp(i, 0, items.length - 1));

  const atStart = index === 0;
  const atEnd = index === items.length - 1;

  return (
    <section
      className={`relative ${className} h-[384px] max-w-[540px] min-w-[335px] md:h-[384px] md:w-[540px]`}
      aria-roledescription="carousel"
      aria-label="Widget carousel"
    >
      {/* Header (always visible) */}
      <header className="bg-dark-grey-text absolute inset-x-0 top-0 z-20 flex items-center justify-center gap-2.5 overflow-hidden rounded-t-xl p-2">
        <div className="flex items-center gap-4 rounded-xl outline-2 outline-neutral-600 dark:outline-neutral-400">
          {/* Left */}
          <div className="flex items-center gap-10">
            <ArrowButton
              dir="left"
              disabled={atStart}
              onClick={() => goTo(index - 1)}
            />

            {/* Dots (indicators only; non-interactive) */}
            <div
              className="pointer-events-none flex gap-[8px] select-none"
              aria-hidden="true"
            >
              {items.map((_, i) => (
                <CarouselDot
                  key={i}
                  className={`h-1.5 w-1.5 transition ${
                    index === i
                      ? "dark:text-background-light scale-135 text-neutral-300" // selected = light
                      : "text-neutral-600 dark:text-neutral-400 " // not selected = grey
                  }`}
                />
              ))}
            </div>

            {/* Right */}
            <ArrowButton
              dir="right"
              disabled={atEnd}
              onClick={() => goTo(index + 1)}
            />
          </div>
        </div>
      </header>

      {/* Slides: transform-based, no scrolling */}
      <div className="translate-y-[29px] overflow-hidden rounded-xl md:translate-y-[21px]">
        <div
          className="flex w-full transition-transform duration-300 ease-out will-change-transform"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {items.map((it, i) => (
            <div
              key={it.id ?? i}
              className="min-w-0 shrink-0 basis-full"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${items.length}`}
            >
              <div className="h-full">{it.element}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
