// PROTOTYPE (throwaway): swappable light/dark toggle animations.
// Pick a winner in the browser via the ToggleAnimSwitcher bar, then fold the
// chosen strategy back into DarkModeToggle and delete this file + the switcher.
//
// Constraint: site components run their own color transitions at DIFFERENT
// durations, so a naive swap makes colors finish at staggered times. Every
// strategy below makes the swap read as "all colors change at once" by either
// (a) snapping colors instantly under a full-screen cover, then revealing, or
// (b) forcing every element onto one shared transition duration (sync).
'use client';

import { flushSync } from 'react-dom';

const LS_KEY = 'ttaVariant_proto';

// --- tunable timings (ms) --------------------------------------------------
const DIP_IN = 160;
const DIP_OUT = 240;
const CIRCLE_GROW = 360;
const CIRCLE_OUT = 160;
const WIPE_COVER = 260;
const WIPE_UNCOVER = 280;
const SYNC_MS = 460; // synchronized cross-fade window

export const TOGGLE_VARIANTS = [
  { key: 'dip', name: 'Opacity dip sheet' },
  { key: 'circle', name: 'CSS circle reveal' },
  { key: 'wipe', name: 'Directional wipe' },
  { key: 'sync', name: 'Synchronized cross-fade' },
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

// two rAFs so the theme class + CSS-var rewrite paint before the next step
function nextFrame(fn) {
  requestAnimationFrame(() => requestAnimationFrame(fn));
}

// Wait for React's theme re-render AND MoneyProvider's --highlight-* var
// rewrite (both land an effect/frame after setTheme) to fully settle before we
// uncover, so the revealed frame is 100% final.
function afterSettle(fn) {
  nextFrame(() => setTimeout(fn, 40));
}

// Snap all component colors instantly (no per-component transition) while the
// screen is covered. no-transition stays on until the caller cleans up, so the
// late --highlight-* rewrite can't animate either. globals.css defines
// `html.no-transition * { transition: none !important }`.
function snapSwap(next, setTheme) {
  document.documentElement.classList.add('no-transition');
  setTheme(next);
}
function endSnap() {
  document.documentElement.classList.remove('no-transition');
}

let syncStyleInjected = false;
function ensureSyncStyle() {
  if (syncStyleInjected) return;
  syncStyleInjected = true;
  const s = document.createElement('style');
  // Force EVERY element (and pseudo-elements) onto one shared color-transition
  // duration so nothing finishes early or late -> all colors move together.
  s.textContent =
    'html.tta-sync *, html.tta-sync *::before, html.tta-sync *::after {' +
    ' transition-property: color, background-color, border-color, outline-color,' +
    ' text-decoration-color, fill, stroke, box-shadow !important;' +
    ` transition-duration: ${SYNC_MS}ms !important;` +
    ' transition-timing-function: ease !important;' +
    ' transition-delay: 0s !important; }';
  document.head.appendChild(s);
}

// --- strategies ------------------------------------------------------------

// Synchronized cross-fade: no cover. Every element's color transition is
// normalized to one duration, so the whole page recolors as a single motion.
function runSync(next, setTheme) {
  ensureSyncStyle();
  const root = document.documentElement;
  root.classList.add('tta-sync');
  setTheme(next);
  setTimeout(() => root.classList.remove('tta-sync'), SYNC_MS + 60);
}

// Cover fully (opacity 1) -> snap colors under it -> reveal once settled.
function runDip(next, setTheme) {
  const sheet = makeSheet(DEST_BG[next]);
  sheet.style.opacity = '0';
  sheet
    .animate([{ opacity: 0 }, { opacity: 1 }], { duration: DIP_IN, easing: 'ease-in', fill: 'forwards' })
    .finished.then(() => {
      snapSwap(next, setTheme);
      afterSettle(() => {
        sheet
          .animate([{ opacity: 1 }, { opacity: 0 }], { duration: DIP_OUT, easing: 'ease-out', fill: 'forwards' })
          .finished.finally(() => {
            sheet.remove();
            endSnap();
          });
      });
    });
}

// Circle of the destination color grows to cover -> snap -> fade off.
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
      { duration: CIRCLE_GROW, easing: 'ease-in-out', fill: 'forwards' }
    )
    .finished.then(() => {
      snapSwap(next, setTheme);
      afterSettle(() => {
        sheet
          .animate([{ opacity: 1 }, { opacity: 0 }], { duration: CIRCLE_OUT, easing: 'ease-out', fill: 'forwards' })
          .finished.finally(() => {
            sheet.remove();
            endSnap();
          });
      });
    });
}

// Panel slides in to fully cover -> snap under it -> slides off revealing final.
function runWipe(next, setTheme) {
  const sheet = makeSheet(DEST_BG[next]);
  sheet.style.transform = 'translateX(-100%)';
  sheet
    .animate([{ transform: 'translateX(-100%)' }, { transform: 'translateX(0%)' }], {
      duration: WIPE_COVER,
      easing: 'ease-in',
      fill: 'forwards',
    })
    .finished.then(() => {
      snapSwap(next, setTheme);
      afterSettle(() => {
        sheet
          .animate([{ transform: 'translateX(0%)' }, { transform: 'translateX(100%)' }], {
            duration: WIPE_UNCOVER,
            easing: 'ease-out',
            fill: 'forwards',
          })
          .finished.finally(() => {
            sheet.remove();
            endSnap();
          });
      });
    });
}

// current production animation, kept as an A/B baseline (the laggy one)
function runViewTransition(next, setTheme, buttonRef) {
  if (typeof document.startViewTransition !== 'function') {
    runSync(next, setTheme);
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
    case 'sync':
      return runSync(next, setTheme);
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
