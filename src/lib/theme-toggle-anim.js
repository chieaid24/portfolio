// PROTOTYPE (throwaway): swappable light/dark toggle animations.
// Pick a winner in the browser via the ToggleAnimSwitcher bar, then fold the
// chosen strategy back into DarkModeToggle and delete this file + the switcher.
'use client';

import { flushSync } from 'react-dom';

const LS_KEY = 'ttaVariant_proto';

export const TOGGLE_VARIANTS = [
  { key: 'dip', name: 'Opacity dip sheet' },
  { key: 'circle', name: 'CSS circle reveal' },
  { key: 'wipe', name: 'Directional wipe' },
  { key: 'instant', name: 'Instant + color fade' },
  { key: 'vt', name: 'View Transitions (current)' },
];

export const DEFAULT_VARIANT = 'dip';

// destination page-bg approximations (sheets fake the incoming theme)
const DEST_BG = { dark: '#03040c', light: '#e8f1fb' };

export function getToggleVariant() {
  if (typeof window === 'undefined') return DEFAULT_VARIANT;
  return localStorage.getItem(LS_KEY) || DEFAULT_VARIANT;
}

export function setToggleVariant(key) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, key);
  window.dispatchEvent(new CustomEvent('tta-variant-change', { detail: key }));
}

function centerOf(buttonRef) {
  const rect = buttonRef?.current?.getBoundingClientRect();
  const vw = window.visualViewport?.width ?? window.innerWidth;
  const vh = window.visualViewport?.height ?? window.innerHeight;
  const cx = rect ? rect.left + rect.width / 2 : vw / 2;
  const cy = rect ? rect.top + rect.height / 2 : vh / 2;
  return { vw, vh, cx, cy };
}

function makeSheet(bg) {
  const el = document.createElement('div');
  Object.assign(el.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '2147483646',
    background: bg,
    pointerEvents: 'none',
    willChange: 'opacity, transform, clip-path',
  });
  document.body.appendChild(el);
  return el;
}

// two rAFs so the theme class + CSS-var rewrite paint before we animate again
function nextFrame(fn) {
  requestAnimationFrame(() => requestAnimationFrame(fn));
}

let fadeStyleInjected = false;
function ensureFadeStyle() {
  if (fadeStyleInjected) return;
  fadeStyleInjected = true;
  const s = document.createElement('style');
  s.textContent =
    'html.tta-fade, html.tta-fade body { transition: background-color .18s ease, color .18s ease !important; }';
  document.head.appendChild(s);
}

// --- strategies ------------------------------------------------------------

function runInstant(next, setTheme) {
  ensureFadeStyle();
  const root = document.documentElement;
  root.classList.add('tta-fade');
  setTheme(next);
  setTimeout(() => root.classList.remove('tta-fade'), 240);
}

function runDip(next, setTheme) {
  const sheet = makeSheet(DEST_BG[next]);
  sheet.style.opacity = '0';
  sheet
    .animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: 'ease-in', fill: 'forwards' })
    .finished.then(() => {
      setTheme(next);
      nextFrame(() => {
        sheet
          .animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-out', fill: 'forwards' })
          .finished.finally(() => sheet.remove());
      });
    });
}

function runCircle(next, setTheme, buttonRef) {
  const { vw, vh, cx, cy } = centerOf(buttonRef);
  const r = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy));
  const sheet = makeSheet(DEST_BG[next]);
  sheet.style.clipPath = `circle(0px at ${cx}px ${cy}px)`;
  sheet
    .animate(
      [
        { clipPath: `circle(0px at ${cx}px ${cy}px)` },
        { clipPath: `circle(${r}px at ${cx}px ${cy}px)` },
      ],
      { duration: 320, easing: 'ease-in-out', fill: 'forwards' }
    )
    .finished.then(() => {
      setTheme(next);
      nextFrame(() => {
        sheet
          .animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'ease-out', fill: 'forwards' })
          .finished.finally(() => sheet.remove());
      });
    });
}

function runWipe(next, setTheme) {
  const sheet = makeSheet(DEST_BG[next]);
  sheet.style.transform = 'translateX(-100%)';
  const dur = 440;
  const a = sheet.animate(
    [
      { transform: 'translateX(-100%)' },
      { transform: 'translateX(0%)' },
      { transform: 'translateX(100%)' },
    ],
    { duration: dur, easing: 'ease-in-out', fill: 'forwards' }
  );
  setTimeout(() => setTheme(next), dur / 2); // swap while the panel fully covers
  a.finished.finally(() => sheet.remove());
}

// current production animation, kept as an A/B baseline (the laggy one)
function runViewTransition(next, setTheme, buttonRef) {
  if (typeof document.startViewTransition !== 'function') {
    runInstant(next, setTheme);
    return;
  }
  const { vw, vh, cx, cy } = centerOf(buttonRef);
  const maxRadius = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy));
  const clipFrom = `circle(0px at ${cx}px ${cy}px)`;
  const clipTo = `circle(${maxRadius}px at ${cx}px ${cy}px)`;
  const root = document.documentElement;
  root.dataset.themeVt = 'active';
  root.style.setProperty('--theme-vt-clip-from', clipFrom);

  const transition = document.startViewTransition(() => {
    flushSync(() => setTheme(next));
  });
  transition.ready.then(() => {
    root.animate(
      { clipPath: [clipFrom, clipTo] },
      { duration: 280, easing: 'ease-in-out', fill: 'forwards', pseudoElement: '::view-transition-new(root)' }
    );
  });
  transition.finished.finally(() => {
    delete root.dataset.themeVt;
    root.style.removeProperty('--theme-vt-clip-from');
  });
}

// Run the swap using the given variant. next = 'dark' | 'light'.
export function runThemeSwap({ variant, next, setTheme, buttonRef, shouldReduceMotion }) {
  if (shouldReduceMotion) {
    document.documentElement.classList.add('no-transition');
    setTheme(next);
    nextFrame(() => document.documentElement.classList.remove('no-transition'));
    return;
  }
  switch (variant) {
    case 'instant':
      return runInstant(next, setTheme);
    case 'circle':
      return runCircle(next, setTheme, buttonRef);
    case 'wipe':
      return runWipe(next, setTheme);
    case 'vt':
      return runViewTransition(next, setTheme, buttonRef);
    case 'dip':
    default:
      return runDip(next, setTheme);
  }
}
