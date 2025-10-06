'use client'
import { useState } from "react";
import CarouselArrow from "@/icons/CarouselArrow";
import CarouselDot from "@/icons/CarouselDot"

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
    const translate =
        pressed ? (dir === "left" ? "-translate-x-0.5" : "translate-x-0.5") : "";

    return (
        <button
            type="button"
            onClick={handleClick}
            className="text-neutral-300 dark:text-background-light px-4 py-1 md:px-2 md:py-1 text-sm cursor-pointer disabled:cursor-default disabled:text-neutral-600 dark:disabled:text-neutral-400 disabled:pointer-events-none transition-colors duration-200 hover:bg-black/10 rounded-full"
            aria-label={dir === "left" ? "Previous widget" : "Next widget"}
            disabled={disabled}
        >
            <CarouselArrow className={`${iconBase}${translate ? " " + translate : ""}`} />
        </button>
    );
}

export default function WidgetCarousel({
    items = [],         // [{ id, title, element }]
    className = "",
    initialIndex = 0,
}) {
    const [index, setIndex] = useState(
        Math.min(initialIndex, Math.max(0, items.length - 1))
    );

    const clamp = (n, min, max) => Math.max(min, Math.min(n, max));
    const goTo = (i) => setIndex((prev) => clamp(i, 0, items.length - 1));

    const atStart = index === 0;
    const atEnd = index === items.length - 1;

    return (
        <section className={`relative ${className} min-w-[335px] max-w-[540px] h-[384px] md:w-[540px] md:h-[384px]`} aria-roledescription="carousel" aria-label="Widget carousel">
            {/* Header (always visible) */}
            <header className="bg-dark-grey-text absolute inset-x-0 top-0  z-20 flex items-center justify-center gap-2.5 p-2 overflow-hidden rounded-t-xl">
                <div className="flex items-center gap-4 outline-2 outline-neutral-600 dark:outline-neutral-400 rounded-xl">
                    {/* Left */}
                    <div className="flex items-center gap-10">
                        <ArrowButton dir="left" disabled={atStart} onClick={() => goTo(index - 1)} />

                        {/* Dots (indicators only; non-interactive) */}
                        <div className="flex gap-[8px] pointer-events-none select-none" aria-hidden="true">
                            {items.map((_, i) => (
                                <CarouselDot
                                    key={i}
                                    className={`w-1.5 h-1.5 transition ${index === i
                                        ? "dark:text-background-light text-neutral-300 scale-135"   // selected = light
                                        : "dark:text-neutral-400 text-neutral-600 "   // not selected = grey
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Right */}
                        <ArrowButton dir="right" disabled={atEnd} onClick={() => goTo(index + 1)} />
                    </div>
                </div>
            </header>

            {/* Slides: transform-based, no scrolling */}
            <div className="overflow-hidden rounded-xl translate-y-[29px] md:translate-y-[21px]">
                <div
                    className="flex w-full transition-transform duration-300 ease-out will-change-transform"
                    style={{ transform: `translateX(-${index * 100}%)` }}
                >
                    {items.map((it, i) => (
                        <div
                            key={it.id ?? i}
                            className="shrink-0 basis-full min-w-0"
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
