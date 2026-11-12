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
  sms(root, tl) {
    const report = $(root, '[data-report]');
    const status = $(root, '[data-status]');
    const meter = $(root, '[data-meter]');
    const finalHTML = status.innerHTML;
    tl.set(report, { xPercent: -200 })
      .set(meter, { scaleX: 0 })
      .call(() => { status.textContent = 'New'; status.classList.remove('cv-chip--c'); })
      .to(report, { xPercent: -100, duration: 0.8 }, 0.9)
      .call(() => { status.textContent = 'Assessing'; })
      .to(meter, { scaleX: 1, duration: 1 }, '+=0.15')
      .to(report, { xPercent: 0, duration: 0.8 }, '+=0.3')
      .call(() => { status.innerHTML = finalHTML; status.classList.add('cv-chip--c'); });
  },

  comp(root, tl) {
    const verdicts = $$(root, '[data-verdict]');
    const refs = $$(root, '[data-ref]');
    const count = $(root, '[data-count]');
    const finalHTML = verdicts[0].innerHTML;
    const c = { n: 0 };
    tl.set(refs, { opacity: 0, x: -6 })
      .set(c, { n: 0 })
      .call(() => {
        count.textContent = '0';
        verdicts.forEach((v) => { v.textContent = 'Checking'; v.classList.remove('cv-chip--c'); });
      })
      .to(c, { n: 140, duration: 2.6, ease: 'none', onUpdate: () => { count.textContent = Math.round(c.n); } }, 0.4);
    verdicts.forEach((v, i) => {
      const at = 0.7 + i * 0.6;
      tl.call(() => { v.innerHTML = finalHTML; v.classList.add('cv-chip--c'); }, null, at)
        .fromTo(v, { scale: 0.9 }, { scale: 1, duration: 0.3 }, at)
        .to(refs[i], { opacity: 1, x: 0, duration: 0.4 }, at + 0.1);
    });
  },

  tr(root, tl) {
    const outcomes = $$(root, '[data-outcome]');
    const gaps = $(root, '[data-gaps]');
    const sign = $(root, '[data-signoff]');
    const repeat = $(root, '[data-repeat]');
    const setGaps = (n) => () => { gaps.textContent = n; };
    tl.set(outcomes, { opacity: 0, scale: 0.85 })
      .set(sign, { opacity: 0.3 })
      .call(setGaps(4))
      .call(() => { repeat.textContent = 'Repeat'; repeat.classList.add('is-repeat'); repeat.classList.remove('cv-chip--c'); });
    outcomes.forEach((o, i) => {
      const at = 0.5 + i * 0.45;
      tl.to(o, { opacity: 1, scale: 1, duration: 0.3 }, at);
      if (o !== repeat) tl.call(setGaps(3 - i + (i > 2 ? 1 : 0)), null, at);
    });
    // The repeat is flown again and passes; only then can it be signed.
    tl.call(() => { repeat.textContent = 'Pass'; repeat.classList.remove('is-repeat'); repeat.classList.add('cv-chip--c'); }, null, '+=0.6')
      .fromTo(repeat, { scale: 0.85 }, { scale: 1, duration: 0.3 }, '<')
      .call(setGaps(0))
      .to(sign, { opacity: 1, duration: 0.4 }, '+=0.15');
  },

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

export function initCovers() {
  initOpsTimer();
  if (!motionOn) return;
  document.querySelectorAll('[data-cover]').forEach((cover) => {
    const build = scenes[cover.dataset.cover];
    const stage = cover.querySelector('.cv');
    if (!build || !stage) return;
    // Fade in, tell the story, hold the finished frame, fade out, repeat.
    const tl = gsap.timeline({ paused: true, repeat: -1 });
    tl.set(stage, { opacity: 0 });
    build(stage, tl);
    tl.to(stage, { opacity: 1, duration: 0.4 }, 0)
      .to({}, { duration: 2.2 })
      .to(stage, { opacity: 0, duration: 0.4 });
    tl.progress(0);
    new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()), { rootMargin: '10% 0px' }).observe(cover);
  });
}
