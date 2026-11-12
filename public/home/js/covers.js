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
  ops(root, tl) {
    const vals = $$(root, '[data-type]');
    const send = $(root, '[data-send]');
    const timer = $(root, '[data-timer]');
    const t = { m: 160 };
    const fmt = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${String(Math.round(m % 60)).padStart(2, '0')}m` : `${Math.round(m)}m`);
    tl.set(vals, { clipPath: HIDE })
      .set(send, { opacity: 0.3 })
      .set(t, { m: 160 })
      .call(() => { timer.textContent = fmt(160); })
      .to(vals, { clipPath: SHOW, duration: 0.45, stagger: 0.4, ease: 'none' }, 0.5)
      .to(send, { opacity: 1, duration: 0.3 })
      .to(send, { scale: 0.94, duration: 0.12, yoyo: true, repeat: 1 })
      .to(t, { m: 20, duration: 1.2, onUpdate: () => { timer.textContent = fmt(t.m); } }, '-=0.1');
  },

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

  hx(root, tl) {
    const status = $(root, '[data-status]');
    const approve = $(root, '[data-approve]');
    const note = $(root, '[data-note]');
    const pointer = $(root, '[data-pointer]');
    const finalHTML = status.innerHTML;
    tl.set(note, { opacity: 0, y: 6 })
      .set(pointer, { opacity: 0, x: '-6em', y: '4em' })
      .call(() => { status.textContent = 'Pending'; status.classList.remove('cv-chip--c'); })
      .to(pointer, { opacity: 1, duration: 0.3 }, 0.6)
      .to(pointer, { x: 0, y: 0, duration: 0.8 }, 0.6)
      .to(approve, { scale: 0.92, duration: 0.12, yoyo: true, repeat: 1 })
      .call(() => { status.innerHTML = finalHTML; status.classList.add('cv-chip--c'); })
      .fromTo(status, { scale: 0.85 }, { scale: 1, duration: 0.35 })
      .to(pointer, { opacity: 0, duration: 0.3 }, '+=0.1')
      .to(note, { opacity: 1, y: 0, duration: 0.5 }, '<');
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

export function initCovers() {
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
