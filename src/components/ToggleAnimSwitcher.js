// PROTOTYPE (throwaway): floating bar to flip between toggle-animation variants
// and fire the theme swap. Dev-only. Delete once a variant wins.
'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { useReducedMotion } from 'framer-motion';
import {
  TOGGLE_VARIANTS,
  DEFAULT_VARIANT,
  getToggleVariant,
  setToggleVariant,
  runThemeSwap,
} from '@/lib/theme-toggle-anim';

export default function ToggleAnimSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [variant, setVariant] = useState(DEFAULT_VARIANT);
  const { resolvedTheme, setTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const toggleRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    setVariant(getToggleVariant());
    const onChange = (e) => setVariant(e.detail);
    window.addEventListener('tta-variant-change', onChange);
    return () => window.removeEventListener('tta-variant-change', onChange);
  }, []);

  const cycle = (dir) => {
    const i = TOGGLE_VARIANTS.findIndex((v) => v.key === variant);
    const nextIdx = (i + dir + TOGGLE_VARIANTS.length) % TOGGLE_VARIANTS.length;
    setToggleVariant(TOGGLE_VARIANTS[nextIdx].key); // fires event -> setVariant
  };

  const toggleTheme = () => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    runThemeSwap({ variant: getToggleVariant(), next, setTheme, buttonRef: toggleRef, shouldReduceMotion });
  };

  useEffect(() => {
    const onKey = (e) => {
      const el = document.activeElement;
      const typing =
        el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (typing) return;
      if (e.key === 'ArrowLeft') cycle(-1);
      else if (e.key === 'ArrowRight') cycle(1);
      else if (e.key === 't' || e.key === 'T') toggleTheme();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!mounted) return null;

  const current = TOGGLE_VARIANTS.find((v) => v.key === variant) ?? TOGGLE_VARIANTS[0];

  const arrowStyle = {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.25)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 16,
    lineHeight: 1,
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2147483647,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        borderRadius: 12,
        background: 'rgba(17,17,20,0.92)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.45)',
        color: '#fff',
        font: '500 13px/1.2 ui-sans-serif, system-ui, sans-serif',
        backdropFilter: 'blur(6px)',
      }}
    >
      <span style={{ opacity: 0.55, fontSize: 11, letterSpacing: 0.4 }}>ANIM</span>
      <button type="button" aria-label="Previous animation" style={arrowStyle} onClick={() => cycle(-1)}>
        {'‹'}
      </button>
      <span style={{ minWidth: 168, textAlign: 'center' }}>
        <span style={{ opacity: 0.5 }}>{current.key}</span>
        {'  '}
        {current.name}
      </span>
      <button type="button" aria-label="Next animation" style={arrowStyle} onClick={() => cycle(1)}>
        {'›'}
      </button>
      <button
        type="button"
        ref={toggleRef}
        onClick={toggleTheme}
        style={{
          marginLeft: 4,
          padding: '6px 12px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.25)',
          background: '#fff',
          color: '#111',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Toggle (T)
      </button>
    </div>
  );
}
