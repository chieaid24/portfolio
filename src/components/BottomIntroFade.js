'use client';
import { useEffect, useState } from 'react';

export default function BottomIntroFade({ className = '' }) {
  const [hidden, setHidden] = useState(false);   // for fade-out
  const [render, setRender] = useState(() => {
    if (typeof window === 'undefined') return true;
    return sessionStorage.getItem('bottomFadeDismissed') !== '1';
  });

  useEffect(() => {
    if (!render) return;

    const dismiss = () => {
      setHidden(true); // animate opacity to 0
      try { sessionStorage.setItem('bottomFadeDismissed', '1'); } catch {}
      window.removeEventListener('scroll', onScroll);
    };

    const onScroll = () => {
      if (window.scrollY > 0) dismiss();
    };

    // if the page loads already scrolled (history restore), dismiss immediately
    if (window.scrollY > 0) dismiss();
    else window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, [render]);

  // unmount after the fade-out finishes
  useEffect(() => {
    if (!hidden) return;
    const t = setTimeout(() => setRender(false), 300);
    return () => clearTimeout(t);
  }, [hidden]);

  if (!render) return null;

  return (
    <div
      aria-hidden
      className={[
        // fixed overlay at bottom
        'fixed inset-x-0 bottom-0 pointer-events-none z-30',
        // height = ~10% of viewport (responsive & mobile-safe via svh)
        'lg:h-[13vh]',
        // the actual fade-to-background
        'bg-gradient-to-b from-transparent to-[var(--color-background-light)]',
        // fade-out when dismissed
        'transition-opacity duration-1000',
        hidden ? 'opacity-0' : 'opacity-100',
        className,
      ].join(' ')}
    />
  );
}
