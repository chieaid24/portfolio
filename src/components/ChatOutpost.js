"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";

export default function ExpandedHeader() {
  const [expanded, setExpanded] = useState(true);
  const scrollRef = useRef(null);

  // === THEME STATES (Demo: Option B) ===
  const [themes, setThemes] = useState([
    {
      id: 1,
      name: "Custom Theme: Klaxon Green",
      price: 420,
      color: "from-green-400 to-green-600",
      isOwned: true,
      isEquipped: true,
    },
    {
      id: 2,
      name: "Custom Theme: Starfall Red",
      price: 380,
      color: "from-red-400 to-pink-600",
      isOwned: true,
      isEquipped: false,
    },
    {
      id: 3,
      name: "Custom Theme: Nebula Blue",
      price: 390,
      color: "from-blue-400 to-indigo-600",
      isOwned: false,
      isEquipped: false,
    },
    {
      id: 4,
      name: "Trivia Pack: Secrets of Adam",
      price: 140,
      color: "from-slate-300 to-zinc-500",
      isOwned: false,
      isEquipped: false,
    },
    {
      id: 5,
      name: "Terminal Theme: Deep Void",
      price: 260,
      color: "from-black to-zinc-900",
      isOwned: false,
      isEquipped: false,
    },
    {
      id: 6,
      name: "Custom Theme: Solar Flare",
      price: 310,
      color: "from-yellow-300 to-orange-500",
      isOwned: false,
      isEquipped: false,
    },
  ]);

  // === ACTIONS ===
  const acquireTheme = (id) => {
    setThemes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isOwned: true } : t))
    );
  };

  const equipTheme = (id) => {
    setThemes((prev) =>
      prev.map((t) => ({
        ...t,
        isEquipped: t.id === id, // Only one equipped at a time
      }))
    );
  };

  const unequipTheme = (id) => {
    setThemes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isEquipped: false } : t))
    );
  };

  // === SCROLL CONTROLS - EXACTLY 3 CARDS PER PRESS ===
  const CARD_WIDTH = 230; // px
  const CARD_GAP = 24; // Tailwind gap-6 = 1.5rem = 24px
  const PAGE_JUMP = (CARD_WIDTH + CARD_GAP) * 3;

  const scrollLeft = () => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollTo({
      left: container.scrollLeft - PAGE_JUMP,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollTo({
      left: container.scrollLeft + PAGE_JUMP,
      behavior: "smooth",
    });
  };

  // === BOUNTIES ===
  const bounties = [
    { name: "Red words found", progress: 14 },
    { name: "Projects discovered", progress: 14 },
    { name: "Links followed", progress: 14 },
  ];

  return (
    <div className="w-full flex justify-center px-4">
      <motion.div
        initial={{ height: 80 }}
        animate={{ height: expanded ? "auto" : 80 }}
        transition={{ duration: 0.35 }}
        className="
          w-full max-w-screen-lg 
          bg-[#0B0B0C] 
          border border-neutral-800 
          rounded-2xl 
          p-8 
          text-neutral-100
          shadow-xl
        "
      >
        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-pink-300 font-medium tracking-wide">
              YOUR BALANCE
            </p>
            <p className="text-2xl font-semibold mt-1 flex items-center gap-1">
              Credits 1.42k <span className="text-neutral-500 text-sm">~</span>
            </p>
          </div>

          <button
            onClick={() => setExpanded(false)}
            className="text-neutral-500 hover:text-neutral-200 text-xl transition"
          >
            {"<"}
          </button>
        </div>

        {/* TITLE */}
        <div className="flex justify-center mt-4 mb-10">
          <div className="flex items-center gap-3 relative">
            <h1 className="text-xl font-extrabold tracking-widest relative text-transparent bg-gradient-to-r from-red-300 to-orange-300 bg-clip-text">
              GALACTIC OUTPOST
              <span
                className="
                  absolute inset-0 blur-lg opacity-40
                  bg-gradient-to-r from-red-400 to-orange-400
                "
              />
            </h1>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* BOUNTIES */}
          <section>
            <h2 className="text-sm font-semibold text-neutral-300 tracking-wide mb-4">
              Bounties
            </h2>

            <div className="space-y-5">
              {bounties.map((b, idx) => (
                <div
                  key={idx}
                  className="bg-[#111113] border border-neutral-800 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-neutral-300">{b.name}</span>
                    <span className="text-neutral-500">{b.progress}%</span>
                  </div>

                  <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${b.progress}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full bg-pink-400/90"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SHOP */}
          <section>
            <div className="flex items-center mb-4">
              <h2 className="text-sm font-semibold text-neutral-300 tracking-wide">
                Outpost Shop
              </h2>
            </div>

            <div className="relative flex items-center">
              {/* LEFT ARROW */}
              <button
                onClick={scrollLeft}
                className="
                  hidden sm:flex 
                  -ml-12
                  w-10 h-10 
                  bg-black/60 backdrop-blur-sm 
                  border border-neutral-700 
                  rounded-full shadow-lg
                  text-neutral-300 hover:text-white 
                  hover:bg-black/80 transition
                  justify-center items-center
                "
              >
                {"<"}
              </button>

              {/* CARD STRIP */}
              <div
                ref={scrollRef}
                className="
                  flex gap-6 
                  overflow-x-auto 
                  scroll-smooth
                  scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent
                  snap-x snap-mandatory
                  pb-2
                "
                style={{ scrollSnapType: "x mandatory" }}
              >
                {themes.map((item) => {
                  const { id, isOwned, isEquipped } = item;

                  // STATUS LABEL
                  let statusText = "Unowned";
                  let statusColor = "text-red-400";

                  if (isOwned && !isEquipped) {
                    statusText = "Owned";
                    statusColor = "text-sky-300";
                  }
                  if (isEquipped) {
                    statusText = "Equipped";
                    statusColor = "text-green-400";
                  }

                  // BUTTON SELECTION
                  let button;
                  if (!isOwned) {
                    button = (
                      <button
                        onClick={() => acquireTheme(id)}
                        className="
                          px-4 py-1.5 
                          bg-white text-black 
                          font-medium text-sm 
                          rounded-lg shadow 
                          hover:bg-neutral-200 transition
                        "
                      >
                        Acquire
                      </button>
                    );
                  } else if (isOwned && !isEquipped) {
                    button = (
                      <button
                        onClick={() => equipTheme(id)}
                        className="
                          px-4 py-1.5 
                          border border-sky-400/40 
                          text-sky-300 
                          font-medium text-sm 
                          rounded-lg
                          hover:bg-sky-400/10 transition
                        "
                      >
                        Equip
                      </button>
                    );
                  } else if (isEquipped) {
                    button = (
                      <button
                        onClick={() => unequipTheme(id)}
                        className="
                          px-4 py-1.5 
                          bg-neutral-800 
                          text-neutral-300 
                          font-medium text-sm
                          rounded-lg
                          border border-neutral-700
                          hover:bg-neutral-700 transition
                        "
                      >
                        Unequip
                      </button>
                    );
                  }

                  return (
                    <motion.div
                      key={id}
                      whileHover={{ scale: 1.03 }}
                      className="
                        snap-center
                        flex-shrink-0
                        w-[230px]
                        bg-[#111113]
                        border border-neutral-800
                        rounded-xl 
                        p-5 
                        shadow-md
                        flex flex-col items-center text-center
                      "
                    >
                      <p className={`text-xs mb-2 font-medium ${statusColor}`}>
                        {statusText}
                      </p>

                      <p className="text-sm font-medium text-neutral-200 mb-3 leading-tight">
                        {item.name}
                      </p>

                      <div
                        className={`
                          w-20 h-20 rounded-full mb-4
                          bg-gradient-to-br ${item.color}
                          shadow-xl
                        `}
                      />

                      {!isOwned && (
                        <p className="text-neutral-400 text-sm mb-4">
                          Credits {item.price}
                        </p>
                      )}

                      {button}
                    </motion.div>
                  );
                })}
              </div>

              {/* RIGHT ARROW */}
              <button
                onClick={scrollRight}
                className="
                  hidden sm:flex 
                  -mr-12
                  w-10 h-10 
                  bg-black/60 backdrop-blur-sm 
                  border border-neutral-700 
                  rounded-full shadow-lg
                  text-neutral-300 hover:text-white 
                  hover:bg-black/80 transition
                  justify-center items-center
                "
              >
                {">"}
              </button>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
