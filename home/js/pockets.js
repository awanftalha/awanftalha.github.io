/* Apps: the inner card lifts out of its pocket on hover or keyboard focus,
   its description clears the frosted lip, and the arrow turns from ↗ to →.
   On touch screens there is no hover, so a card lifts while it is the one
   in view. With reduced motion the state changes instantly. */

import { gsap, reduce } from './motion.js';

const LIFT = -70;

export function initPockets() {
  const pockets = [...document.querySelectorAll('[data-pocket]')];
  if (!pockets.length) return;
  const touch = matchMedia('(hover: none)').matches;

  pockets.forEach((pocket) => {
    const card = pocket.querySelector('.pocket__card');
    const arrow = pocket.querySelector('.pocket__action svg');
    let set;

    if (gsap) {
      const tl = gsap.timeline({ paused: true });
      tl.to(card, { y: LIFT, duration: reduce ? 0 : 0.6 }, 0);
      if (arrow) tl.to(arrow, { rotate: 45, duration: reduce ? 0 : 0.4 }, 0);
      set = (open) => (open ? tl.play() : tl.reverse());
    } else {
      // No GSAP (blocked CDN): the CSS fallback in home.css does the same move.
      set = (open) => pocket.classList.toggle('is-open', open);
    }

    pocket.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') set(true); });
    pocket.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') set(false); });
    pocket.addEventListener('focus', () => set(true));
    pocket.addEventListener('blur', () => set(false));
    pocket._set = set;
  });

  if (touch) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target._set(e.intersectionRatio >= 0.75));
    }, { threshold: [0, 0.75, 1] });
    pockets.forEach((p) => io.observe(p));
  }
}
