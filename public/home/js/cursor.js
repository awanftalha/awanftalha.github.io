/* Cursor label: a small pill that trails the pointer (14px right and below)
   and appears over anything with data-cursor-text. When the target changes,
   its text scrambles into the new label. The system cursor stays visible.
   Fine pointers only; off with reduced motion. */

import { gsap, motionOn } from './motion.js';
import { scrambleTo } from './scramble.js';

export function initCursor() {
  const el = document.querySelector('[data-cursor]');
  const label = el?.querySelector('[data-cursor-label]');
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!el || !label || !motionOn || !fine) return;

  const OFFSET = 14;
  const x = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
  const y = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });
  gsap.set(el, { scale: 0.8, opacity: 0 });
  let current = null;
  let first = true;

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    if (first) {   // start at the pointer, not from the corner
      gsap.set(el, { x: e.clientX + OFFSET, y: e.clientY + OFFSET });
      first = false;
    }
    x(e.clientX + OFFSET);
    y(e.clientY + OFFSET);

    // Innermost labelled element under the pointer wins (a card beats the hero).
    const target = e.target.closest?.('[data-cursor-text]');
    if (target === current) return;
    current = target;
    if (!target) {
      gsap.to(el, { scale: 0.8, opacity: 0, duration: 0.2, overwrite: 'auto' });
      return;
    }
    const text = target.dataset.cursorText;
    const visible = gsap.getProperty(el, 'opacity') > 0.5;
    if (visible) scrambleTo(label, text, { duration: 0.35, hold: false });
    else label.textContent = text;
    gsap.to(el, { scale: 1, opacity: 1, duration: 0.2, overwrite: 'auto' });
  }, { passive: true });

  document.documentElement.addEventListener('pointerleave', () => {
    current = null;
    gsap.to(el, { scale: 0.8, opacity: 0, duration: 0.2, overwrite: 'auto' });
  });
}
