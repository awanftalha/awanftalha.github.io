/* The hero intro and the few scroll reveals the page has.
   Intro (under 1.5s, never blocks input): nav fades in, the name scrambles
   in from random characters, the intro lines rise. Scroll: section titles
   rise 20px, card meta rows fade, Approach lines slide up. Once each. */

import { gsap, motionOn, has, CHARS } from './motion.js';
import { noise } from './scramble.js';

export async function playIntro() {
  const root = document.documentElement;
  if (!motionOn) return;
  const nav = document.querySelectorAll('.nav > *');
  const name = document.querySelector('[data-scramble="load"]');
  const intro = document.querySelector('[data-intro-lines]');
  const media = document.querySelector('.hero__media');

  // Wait briefly for the fonts so lines split where they will stay.
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 150))]);

  const tl = gsap.timeline({ onComplete: () => root.classList.remove('motion') });
  tl.fromTo(nav, { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.04 }, 0);
  if (media) tl.fromTo(media, { opacity: 0 }, { opacity: 1, duration: 1 }, 0.05);

  if (name) {
    const text = name.textContent;
    name.setAttribute('aria-label', text);
    if (has('ScrambleTextPlugin')) {
      name.textContent = noise(text);
      tl.set(name, { opacity: 1 }, 0);
      tl.to(name, { duration: 0.9, ease: 'none', scrambleText: { text, chars: CHARS, speed: 0.6, revealDelay: 0.15 } }, 0);
    } else {
      tl.fromTo(name, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0);
    }
  }

  if (intro) {
    tl.set(intro, { opacity: 1 }, 0);
    if (has('SplitText')) {
      const split = window.SplitText.create(intro, { type: 'lines' });
      tl.fromTo(split.lines, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08 }, 0.25);
    } else {
      tl.fromTo(intro, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.25);
    }
  }
  return tl;
}

export function initReveals() {
  if (!motionOn || !has('ScrollTrigger')) return;
  const ST = window.ScrollTrigger;

  // Section titles: rise 20px and fade in.
  gsap.utils.toArray('.section-title[data-reveal]').forEach((el) => {
    gsap.from(el, { y: 20, opacity: 0, duration: 1, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  // Card meta rows: fade in.
  gsap.set('[data-reveal="fade"]', { opacity: 0 });
  ST.batch('[data-reveal="fade"]', {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => gsap.fromTo(batch, { opacity: 0 }, { opacity: 1, duration: 1, stagger: 0.08, overwrite: true }),
  });

  // Approach: lines slide up out of a mask.
  if (has('SplitText')) {
    gsap.utils.toArray('.habit').forEach((habit) => {
      const parts = habit.querySelectorAll('[data-reveal-lines]');
      const lines = [];
      parts.forEach((p) => lines.push(...window.SplitText.create(p, { type: 'lines', mask: 'lines' }).lines));
      gsap.from(lines, {
        yPercent: 100,
        duration: 1,
        stagger: 0.06,
        scrollTrigger: { trigger: habit, start: 'top 80%', once: true },
      });
    });
  }

  document.fonts?.ready.then(() => ST.refresh());
}
