"use client";

import { useState } from "react";

export default function StarflareSection({ initialTotal = 4102, cost = 50 }) {
  const [myFlares, setMyFlares] = useState(0);

  const handleSend = () => {
    setMyFlares((prev) => prev + 1);
  };

  const totalSent = initialTotal + myFlares;

  return (
    <div className="border-outline-gray h-full w-full rounded-2xl border px-5 py-2 text-center text-white shadow-[0_0_0_1px_rgba(0,0,0,0.7)]">
      <p className="text-3xl font-semibold tracking-tight">
        {totalSent.toLocaleString()}
      </p>

      <div className="mt-2">
        <button
          type="button"
          onClick={handleSend}
          className="inline-flex items-center justify-center rounded-full bg-[#ff7b7b] px-5 py-0 text-sm font-semibold text-black shadow-[0_6px_18px_rgba(0,0,0,0.35)] transition hover:-translate-y-[1px] hover:shadow-[0_10px_26px_rgba(0,0,0,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff7b7b]"
          aria-live="polite"
        >
          Send ($ {cost})
        </button>
      </div>

      <p className="mt-4 text-sm font-semibold text-white">
        you&apos;ve sent {myFlares} flare{myFlares === 1 ? "" : "s"}
      </p>
    </div>
  );
}
