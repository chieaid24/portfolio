"use client";

// PROTOTYPE - throwaway floating variant switcher. Renders nothing in a
// production build. Reads/writes ?variant= directly on the URL (no
// useSearchParams, which would force a Suspense boundary on this client page).

import { useCallback, useEffect, useState } from "react";

export const PARAM = "variant";

export function useVariant(keys) {
  const [variant, setVariant] = useState(keys[0]);

  useEffect(() => {
    const read = () => {
      const v = new URLSearchParams(window.location.search).get(PARAM);
      setVariant(keys.includes(v) ? v : keys[0]);
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [keys]);

  const select = useCallback((next) => {
    const url = new URL(window.location.href);
    url.searchParams.set(PARAM, next);
    window.history.replaceState(null, "", url);
    setVariant(next);
  }, []);

  return [variant, select];
}

export default function PrototypeSwitcher({ keys, current, names, onSelect }) {
  const step = useCallback(
    (dir) => {
      const i = keys.indexOf(current);
      onSelect(keys[(i + dir + keys.length) % keys.length]);
    },
    [keys, current, onSelect],
  );

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t?.matches?.("input, textarea, [contenteditable]")) return;
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-2000 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-neutral-900/95 px-1.5 py-1.5 font-mono text-xs text-white shadow-2xl backdrop-blur-md">
      <button
        type="button"
        onClick={() => step(-1)}
        aria-label="Previous variant"
        className="cursor-pointer rounded-full px-2.5 py-1 hover:bg-white/15"
      >
        {"<"}
      </button>
      <span className="min-w-[13rem] text-center tabular-nums">
        {current} - {names[current]}
        <span className="ml-2 text-white/40">
          {keys.indexOf(current) + 1}/{keys.length}
        </span>
      </span>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label="Next variant"
        className="cursor-pointer rounded-full px-2.5 py-1 hover:bg-white/15"
      >
        {">"}
      </button>
    </div>
  );
}
