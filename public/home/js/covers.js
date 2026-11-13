/* Project covers: each scene's markup is its finished frame. Here every
   cover gets a looping GSAP timeline that plays the story leading up to that
   frame, then holds it. Each loop runs only while its cover is on screen.
   With reduced motion (or no GSAP) the finished frame simply stays. */

import { gsap, motionOn } from './motion.js';

const $ = (root, sel) => root.querySelector(sel);
const $$ = (root, sel) => [...root.querySelectorAll(sel)];
const HIDE = 'inset(0 100% 0 0)';
const SHOW = 'inset(0 0% 0 0)';

/* Each scene adds its story to `tl`, starting from its own initial state. */
const scenes = {
  sg(root, tl) {
    const msg = $(root, '[data-msg]');
    const photos = $$(root, '[data-photo]');
    const ok = $(root, '[data-ok]');
    const reward = $(root, '[data-reward]');
    const pub = $(root, '[data-pub]');
    tl.set([msg, reward, pub], { opacity: 0, y: 6 })
      .set(photos, { opacity: 0, scale: 0.8 })
      .set(ok, { scale: 0 })
      .to(msg, { opacity: 1, y: 0, duration: 0.4 }, 0.5)
      .to(photos, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.25 }, '+=0.3')
      .to(ok, { scale: 1, duration: 0.35 }, '+=0.3')
      .to(reward, { opacity: 1, y: 0, duration: 0.4 }, '+=0.1')
      .to(pub, { opacity: 1, y: 0, duration: 0.4 }, '+=0.5');
  },
};

/* NGFT OPS: the demo in the card's iframe posts its clock (0 to 10, script
   seconds). The timer counts the call-to-offer time down from 2h 40m to 20m
   while the offer is built and sent, then resets with the loop. */
function initOpsTimer() {
  const timer = document.querySelector('[data-ops-timer]');
  if (!timer) return;
  const fmt = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${String(Math.round(m % 60)).padStart(2, '0')}m` : `${Math.round(m)}m`);
  const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
  window.addEventListener('message', (e) => {
    if (e.origin !== location.origin || !e.data || e.data.cover !== 'ngft-ops') return;
    const t = e.data.t;
    const u = Math.min(Math.max((t - 0.4) / (8.3 - 0.4), 0), 1);
    const m = t >= 9.6 ? 160 : 160 - 140 * ease(u);
    const text = fmt(m);
    if (timer.textContent !== text) timer.textContent = text;
  });
}

/* Cards animate only while hovered (or focused from the keyboard). On a touch
   screen there is no hover, so each plays once when it is mostly in view. */
function onHover(card, { enter, leave, once }) {
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  card.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' || fine.matches) enter(); });
  card.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' || fine.matches) leave(); });
  card.addEventListener('focus', () => { if (card.matches(':focus-visible')) enter(); });
  card.addEventListener('blur', leave);
  if (!fine.matches) {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { once(); io.disconnect(); } }, { threshold: 0.6 });
    io.observe(card);
  }
}

export function initCovers() {
  initOpsTimer();
  // The live site's graphics (NGFT SMS, AI Compliance, Training) already play
  // only on hover/focus, and once in view on touch.
  const sms = document.querySelector('[data-sd="sms"]');
  if (sms && window.SmsThumb) window.SmsThumb.mount(sms, { speed: 1.6 });
  const comp = document.querySelector('[data-mg="compliance"]');
  if (comp && window.ComplianceThumb) window.ComplianceThumb.mount(comp);
  const trn = document.querySelector('[data-tr="training"]');
  if (trn && window.TrainingThumb) window.TrainingThumb.mount(trn);

  // The product demos (NGFT OPS, HX Insight) run in iframes: the card tells
  // them when it is hovered. They rest on one frame and settle back to it.
  // Each demo loads only when its card comes within 300px of the screen,
  // so it never competes with the top of the page.
  const frames = [...document.querySelectorAll('.cover--embed iframe[data-src]')];
  const load = (f) => { if (!f.src) f.src = f.dataset.src; };
  if ('IntersectionObserver' in window) {
    const near = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { load(e.target); near.unobserve(e.target); }
    }), { rootMargin: '300px 0px' });
    frames.forEach((f) => near.observe(f));
  } else frames.forEach(load);

  document.querySelectorAll('.cover--embed iframe').forEach((frame) => {
    const send = (msg) => { if (frame.contentWindow) frame.contentWindow.postMessage(msg, location.origin); };
    onHover(frame.closest('a'), {
      enter: () => send({ cmd: 'hover', on: true }),
      leave: () => send({ cmd: 'hover', on: false }),
      // The frame may still be loading: ask again once it has (a repeat is ignored)
      once: () => { send({ cmd: 'once' }); frame.addEventListener('load', () => setTimeout(() => send({ cmd: 'once' }), 800), { once: true }); },
    });
  });

  if (!motionOn) return;
  // The coded covers (GSAP): at rest the finished frame; hover plays the story
  // on a loop; leaving fast-forwards to the finished frame and stops.
  document.querySelectorAll('[data-cover]').forEach((cover) => {
    const build = scenes[cover.dataset.cover];
    const stage = cover.querySelector('.cv');
    if (!build || !stage) return;
    const tl = gsap.timeline({ paused: true, repeat: -1 });
    tl.set(stage, { opacity: 0 });
    build(stage, tl);
    tl.to(stage, { opacity: 1, duration: 0.4 }, 0)
      .to({}, { duration: 2.2 })
      .to(stage, { opacity: 0, duration: 0.4 });
    const rest = tl.duration() - 0.4 - 2.0;   // inside the hold: the finished frame
    tl.progress(0).time(rest);
    let stopAt = null;
    tl.eventCallback('onUpdate', () => {
      if (stopAt === null || tl.totalTime() < stopAt) return;
      const at = stopAt;
      stopAt = null;
      tl.pause().timeScale(1).totalTime(at);
    });
    onHover(cover.closest('a'), {
      enter: () => {
        // From rest, skip the rest of the hold: fade out and start the story now
        if (tl.paused() && stopAt === null) tl.time(tl.duration() - 0.42);
        stopAt = null;
        tl.timeScale(1).play();
      },
      leave: () => {
        if (tl.paused()) return;
        const d = tl.duration(), t = tl.totalTime();
        stopAt = t + ((rest - (t % d) + d) % d);
        tl.timeScale(4);
      },
      once: () => { if (tl.paused()) { stopAt = tl.totalTime() + tl.duration(); tl.play(); } },
    });
  });
}
