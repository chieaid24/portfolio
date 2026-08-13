"use client";

// PROTOTYPE - throwaway floating variant switcher. Renders nothing in a
// production build. Reads/writes its query param directly on the URL (no
// useSearchParams, which would force a Suspense boundary on this client page).
//
// One instance per independent axis; each owns its own param and its own
// arrow-key pair, so two switchers can stack without fighting.

import { useCallback, useEffect, useState } from "react";

export function useVariant(keys, param) {
  const [variant, setVariant] = useState(keys[0]);

  useEffect(() => {
    const read = () => {
      const v = new URLSearchParams(window.location.search).get(param);
      setVariant(keys.includes(v) ? v : keys[0]);
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [keys, param]);

  const select = useCallback(
    (next) => {
      const url = new URL(window.location.href);
      url.searchParams.set(param, next);
      window.history.replaceState(null, "", url);
      setVariant(next);
    },
    [param],
  );

  return [variant, select];
}

const AXIS_KEYS = {
  horizontal: ["ArrowLeft", "ArrowRight"],
  vertical: ["ArrowUp", "ArrowDown"],
};

export default function PrototypeSwitcher({
  keys,
  current,
  names,
  onSelect,
  label,
  axis = "horizontal",
  row = 0,
}) {
  const step = useCallback(
    (dir) => {
      const i = keys.indexOf(current);
      onSelect(keys[(i + dir + keys.length) % keys.length]);
    },
    [keys, current, onSelect],
  );

  useEffect(() => {
    const [prev, next] = AXIS_KEYS[axis];
    const onKey = (e) => {
      const t = e.target;
      if (t?.matches?.("input, textarea, [contenteditable]")) return;
      if (e.key === prev) step(-1);
      if (e.key === next) step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, axis]);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div
      className="fixed left-1/2 z-2000 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-neutral-900/95 px-1.5 py-1.5 font-mono text-xs text-white shadow-2xl backdrop-blur-md"
      style={{ bottom: 16 + row * 48 }}
    >
      <button
        type="button"
        onClick={() => step(-1)}
        aria-label={`Previous ${label}`}
        className="cursor-pointer rounded-full px-2.5 py-1 hover:bg-white/15"
      >
        {"<"}
      </button>
      <span className="min-w-[15rem] text-center tabular-nums">
        <span className="text-white/40">{label}:</span> {names[current]}
        <span className="ml-2 text-white/40">
          {keys.indexOf(current) + 1}/{keys.length}
        </span>
      </span>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label={`Next ${label}`}
        className="cursor-pointer rounded-full px-2.5 py-1 hover:bg-white/15"
      >
        {">"}
      </button>
    </div>
  );
}
