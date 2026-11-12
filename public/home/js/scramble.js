/* Scrambling text (ScrambleTextPlugin).
   data-scramble="load"   plays once on load (the hero name; driven by the intro)
   data-scramble-hover    re-scrambles its own text on hover or focus (0.4s)
   data-scramble="loop" data-scramble-words="a|b|c"   cycles words forever
   Screen readers always get the real text: hover targets keep it in an
   aria-label on their link or button, and loops sit inside aria-hidden text
   whose heading carries the full sentence. */

import { gsap, motionOn, has, CHARS } from './motion.js';

const ok = () => motionOn && has('ScrambleTextPlugin');

/* A string of random characters the same shape as the text (spaces kept). */
export function noise(text) {
  return [...text].map((c) => (c === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)])).join('');
}

/* Scramble an element into `text`. Its width is held while it runs, so the
   letters around it do not shift. */
export function scrambleTo(el, text, { duration = 0.4, speed = 1, revealDelay = 0, hold = true } = {}) {
  if (!ok()) { el.textContent = text; return null; }
  if (!hold) {
    return gsap.to(el, { duration, ease: 'none', overwrite: true, scrambleText: { text, chars: CHARS, speed, revealDelay } });
  }
  const w = el.getBoundingClientRect().width;
  const prev = { width: el.style.width, display: el.style.display };
  if (getComputedStyle(el).display === 'inline') el.style.display = 'inline-block';
  el.style.width = `${Math.ceil(w)}px`;
  el.style.whiteSpace = 'nowrap';
  return gsap.to(el, {
    duration,
    ease: 'none',
    overwrite: true,
    scrambleText: { text, chars: CHARS, speed, revealDelay, tweenLength: false },
    onComplete: () => { el.style.width = prev.width; el.style.display = prev.display; el.style.whiteSpace = ''; },
  });
}

export function initScramble() {
  // Hover: the trigger is the link or button that holds the text.
  document.querySelectorAll('[data-scramble-hover]').forEach((el) => {
    const text = el.textContent.trim();
    const trigger = el.closest('a, button') || el;
    if (!trigger.hasAttribute('aria-label')) trigger.setAttribute('aria-label', trigger.textContent.replace(/\s+/g, ' ').trim());
    if (!ok()) return;
    const run = () => scrambleTo(el, text, { duration: 0.4 });
    trigger.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') run(); });
    trigger.addEventListener('focus', run);
  });

  // Loop: cycles words at speed 0.8, holding each for 1.5s.
  document.querySelectorAll('[data-scramble="loop"]').forEach((el) => {
    const words = (el.dataset.scrambleWords || el.textContent).split('|');
    if (!ok() || words.length < 2) return;
    const tl = gsap.timeline({ repeat: -1, paused: true });
    words.forEach((_, k) => {
      const next = words[(k + 1) % words.length];
      tl.to(el, { duration: 0.6, ease: 'none', scrambleText: { text: next, chars: CHARS, speed: 0.8 } }, '+=1.5');
    });
    // Only loop while it is on screen.
    new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause())).observe(el);
  });
}
