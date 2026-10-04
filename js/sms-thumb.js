/* ==========================================================================
   Work thumbnail · SMS safety manager flow
   One report, SR-2026-0142, taken through the whole flow:
     1 Inbox    the list re-sorts by what needs attention; 3A Intolerable jumps to the top
     2 Review   the AI's synopsis, every line tagged with its source; two hazards found
     3 ECCAIRS  97 attributes matched; "need a decision" counts 5 → 0; all values decided
     4 Risk     ICAO 5×5 matrix: 3A intolerable, mitigated to 2A tolerable
     5 Close    6 of 6 checks tick, the lock shuts: closed, read-only record
   Rest state = the SVG as authored (closed). Hover / focus plays (~7.8s at the
   default speed, 0.72; pass { speed } to change it). Leaving fast-forwards to the end. Touch: once when 60% in view.
   Reduced motion: never.

   Usage:
     <a class="work-card" href="/work/sms"><div class="sd" data-sd="sms"> …inline sms-thumb.svg… </div></a>
     const t = SmsThumb.mount(document.querySelector('[data-sd="sms"]'));   // t.destroy() on unmount
   ========================================================================== */
(function (global) {
  'use strict';

  var EASE = {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    press: 'cubic-bezier(0.2, 0, 0, 1)',
    pop: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  };
  var LIGHT = '#F2F3F0', ACCENT = '#E4521F', DIM = '#6E737A';
  var STEP_AT = [2300, 2650, 4550, 6700, 8850];   /* Intake, Review, ECCAIRS, Risk, Close */
  var END = 10900;

  function mount(root, opts) {
    opts = opts || {};
    var S = opts.speed || 0.72;
    var svg = root.querySelector('svg');
    var q = function (s) { return svg.querySelector(s); };
    var qa = function (s) { return Array.prototype.slice.call(svg.querySelectorAll(s)); };
    var reduce = global.matchMedia('(prefers-reduced-motion: reduce)');
    var anims = [], counters = [], raf = 0, state = 'rest';

    /* right-align every lozenge to its measured label once fonts are in */
    function layout() {
      root.classList.toggle('is-compact', root.getBoundingClientRect().width < 440);
      qa('.sd-loz').forEach(function (g) {
        var t = g.querySelector('text'), r = g.querySelector('rect'), right = +g.getAttribute('data-right');
        var len = 0; try { len = t.getComputedTextLength(); } catch (e) {}
        if (!len) return;
        var w = Math.ceil(len + 18);
        r.setAttribute('x', right - w); r.setAttribute('width', w); t.setAttribute('x', right - w + 9);
      });
    }
    layout();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    var ro = 'ResizeObserver' in global ? new ResizeObserver(layout) : null;
    if (ro) ro.observe(root);

    function push(a) { anims.push(a); return a; }
    function one(el, kf, at, dur, easing, fill) {
      return push(el.animate(kf, { delay: Math.round(at * S), duration: Math.max(1, Math.round(dur * S)), easing: easing || EASE.out, fill: fill || 'both' }));
    }
    /* one animation through timed points: [[ms, {props}, easingToNext], ...] */
    function seq(el, pts) {
      var t0 = pts[0][0], t1 = pts[pts.length - 1][0], span = Math.max(1, t1 - t0);
      var kf = pts.map(function (p) {
        var k = {}; for (var n in p[1]) k[n] = p[1][n];
        k.offset = (p[0] - t0) / span; k.easing = p[2] || 'linear'; return k;
      });
      return push(el.animate(kf, { delay: Math.round(t0 * S), duration: Math.round(span * S), fill: 'both' }));
    }
    function counter(el, from, to, at, dur) {
      var eff = new KeyframeEffect(null, [], { delay: Math.round(at * S), duration: Math.round(dur * S), fill: 'both' });
      var a = new Animation(eff, document.timeline); a.play(); push(a);
      counters.push({ el: el, from: from, to: to, a: a });
    }
    var fadeIn = [{ opacity: 0 }, { opacity: 1 }];
    var up = function (d) { return [{ opacity: 0, transform: 'translateY(' + d + 'px)' }, { opacity: 1, transform: 'none' }]; };
    var pop = [{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'none' }];
    function windowed(el, a, b, fade, dy) {   /* visible from a to b, then gone */
      seq(el, [[a, { opacity: 0, transform: 'translateY(' + (dy || 0) + 'px)' }, EASE.out], [a + fade, { opacity: 1, transform: 'none' }], [b - fade, { opacity: 1, transform: 'none' }, EASE.inOut], [b, { opacity: 0, transform: 'translateY(' + (dy ? -dy * 0.6 : 0) + 'px)' }]]);
    }

    function build() {
      anims.forEach(function (a) { a.cancel(); });
      anims = []; counters = [];

      /* ---- stepper ---- */
      qa('.sd-step').forEach(function (s, i) {
        one(s, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], STEP_AT[i], 260, EASE.inOut);
        if (i < 4) seq(s, [[STEP_AT[i], { fill: ACCENT }], [STEP_AT[i + 1], { fill: ACCENT }], [STEP_AT[i + 1] + 160, { fill: LIGHT }]]);
      });
      qa('.sd-step-t').forEach(function (t, i) { seq(t, [[0, { fill: DIM }], [STEP_AT[i], { fill: DIM }], [STEP_AT[i] + 160, { fill: LIGHT }]]); });

      /* ---- 1 · inbox, sorted by what needs attention (0 to 2.6s) ---- */
      windowed(q('.sd-inbox-head'), 100, 2400, 300, 8);
      var order = [0, 1, 2, 4];
      qa('.sd-row').forEach(function (r, k) {
        var at = 200 + order[k] * 90, shift = +r.getAttribute('data-shift');
        seq(r, [[at, { opacity: 0 }], [at + 320, { opacity: 1 }], [2100, { opacity: 1 }], [2400, { opacity: 0 }]]);
        seq(r, [[at, { transform: 'translateY(12px)' }, EASE.out], [at + 320, { transform: 'translateY(0px)' }], [1000, { transform: 'translateY(0px)' }, EASE.inOut], [1700, { transform: 'translateY(' + shift + 'px)' }]]);
      });
      var head = q('.sd-head');
      one(head, fadeIn, 470, 320, 'linear');
      seq(head, [[470, { transform: 'translateY(368px)' }, EASE.out], [790, { transform: 'translateY(356px)' }], [1000, { transform: 'translateY(356px)' }, EASE.inOut], [1700, { transform: 'translateY(80px)' }], [2100, { transform: 'translateY(80px)' }, EASE.inOut], [2550, { transform: 'translateY(0px)' }]]);
      seq(q('.sd-lift'), [[950, { opacity: 0 }], [1150, { opacity: 1 }], [1600, { opacity: 1 }], [1750, { opacity: 0 }]]);
      seq(q('.sd-attn'), [[1300, { opacity: 0 }], [1500, { opacity: 1 }], [2200, { opacity: 1 }], [2450, { opacity: 0 }]]);
      var risk = q('.sd-risk');
      seq(risk, [[470, { opacity: 0 }], [790, { opacity: 1 }], [2300, { opacity: 1 }], [2500, { opacity: 0 }]]);
      seq(risk, [[1750, { transform: 'scale(1)' }, EASE.out], [1900, { transform: 'scale(1.14)' }, EASE.inOut], [2100, { transform: 'scale(1)' }]]);
      one(q('.sd-divider'), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 2350, 400, EASE.inOut);

      /* header status follows the step */
      windowed(q('.sd-status[data-s="review"]'), 2550, 4600, 250);
      windowed(q('.sd-status[data-s="eccairs"]'), 4500, 6700, 250);
      windowed(q('.sd-status[data-s="risk"]'), 6650, 8850, 250);
      one(q('.sd-closed'), pop, 10500, 350, EASE.pop);

      /* ---- 2 · review: synopsis with sources, hazards (2.6 to 4.5s) ---- */
      windowed(q('.sd-body[data-s="review"]'), 2600, 4500, 300, 10);
      one(q('.sd-spark'), [{ transform: 'rotate(-90deg) scale(0.4)', opacity: 0 }, { transform: 'none', opacity: 1 }], 2650, 600, EASE.pop);
      qa('.sd-syn').forEach(function (e, i) { one(e, [{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], 2750 + i * 180, 350); });
      qa('.sd-src').forEach(function (e, i) { one(e, pop, 2900 + i * 180, 300, EASE.pop); });
      qa('.sd-hz').forEach(function (e, i) { one(e, up(10), 3400 + i * 160, 380); });

      /* ---- 3 · ECCAIRS by exception (4.5 to 6.65s) ---- */
      windowed(q('.sd-body[data-s="eccairs"]'), 4550, 6650, 300, 10);
      counter(q('.sd-big'), 0, 97, 4650, 800);
      qa('.sd-tile').forEach(function (e, k) { one(e, up(10), 4750 + k * 100, 350); });
      counter(q('[data-count="need"]'), 5, 0, 5300, 700);
      counter(q('[data-count="corr"]'), 0, 5, 5300, 700);
      seq(q('[data-count="need"]'), [[5300, { fill: '#9E4C00' }], [6000, { fill: '#9E4C00' }], [6100, { fill: '#292A2E' }]]);
      one(q('.sd-banner'), up(12), 6000, 400);

      /* ---- 4 · risk: one matrix, one rule (6.65 to 8.8s) ---- */
      windowed(q('.sd-body[data-s="risk"]'), 6700, 8800, 300, 10);
      qa('.sd-cell').forEach(function (c) { one(c, pop, 6800 + (+c.getAttribute('data-d')) * 60, 300, EASE.pop); });
      var cross = qa('.sd-cross line');
      cross[1].style.transformOrigin = 'center top';
      one(cross[0], [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 7450, 350, EASE.inOut);
      one(cross[1], [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], 7450, 350, EASE.inOut);
      var ring = q('.sd-ring');
      one(ring, [{ opacity: 0 }, { opacity: 1 }], 7750, 200, 'linear');
      seq(ring, [[7750, { transform: 'translateY(-44px) scale(1.25)' }, EASE.pop], [8000, { transform: 'translateY(-44px) scale(1)' }], [8200, { transform: 'translateY(-44px) scale(1)' }, EASE.inOut], [8650, { transform: 'translateY(0px) scale(1)' }]]);
      seq(q('.sd-verdict-a'), [[7800, { opacity: 0 }], [8000, { opacity: 1 }], [8250, { opacity: 1 }], [8350, { opacity: 0 }]]);
      one(q('.sd-verdict-b'), pop, 8350, 350, EASE.pop);
      one(q('.sd-mitig'), fadeIn, 8450, 300, 'linear');

      /* ---- 5 · a real finish line (8.8 to 10.9s) ---- */
      one(q('.sd-body-close'), up(10), 8850, 350);
      qa('.sd-check').forEach(function (e, i) {
        one(e, [{ opacity: 0.25 }, { opacity: 1 }], 9000 + i * 160, 300, 'linear');
        one(e.querySelector('.sd-tick'), pop, 9000 + i * 160, 350, EASE.pop);
      });
      one(q('.sd-ok'), pop, 10000, 300, EASE.pop);
      one(q('.sd-final'), up(14), 10050, 450);
      one(q('.sd-shackle'), [{ transform: 'translateY(-9px)' }, { transform: 'translateY(-9px)', offset: 0.5 }, { transform: 'none' }], 10050, 800, EASE.press);
      one(q('.sd-lock'), [{ transform: 'none' }, { transform: 'scale(1.08)', offset: 0.5 }, { transform: 'none' }], 10650, 260, EASE.out, 'none');
    }

    function paint() {
      counters.forEach(function (c) {
        var p = c.a.effect.getComputedTiming().progress; if (p == null) p = 1;
        var e = 1 - (1 - p) * (1 - p);
        c.el.textContent = String(Math.round(c.from + (c.to - c.from) * e));
      });
    }
    function loop() { paint(); if (state !== 'rest') raf = requestAnimationFrame(loop); }

    function restoreText() {
      q('.sd-big').textContent = '97';
      q('[data-count="need"]').textContent = '0';
      q('[data-count="corr"]').textContent = '5';
    }

    function play() {
      if (reduce.matches || state === 'playing') return;
      state = 'playing';
      build();
      cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
      var mine = anims;
      Promise.all(mine.map(function (a) { return a.finished; })).then(function () {
        if (mine !== anims) return;
        state = 'rest'; cancelAnimationFrame(raf);
        anims.forEach(function (a) { a.cancel(); }); anims = []; counters = [];
        restoreText();
        root.dispatchEvent(new CustomEvent('sd:done'));
      }, function () {});
    }
    function settle() {
      if (state !== 'playing') return;
      state = 'settling';
      anims.forEach(function (a) { a.playbackRate = 10; });
    }

    var link = root.closest('a') || root;
    var fine = global.matchMedia('(hover: hover) and (pointer: fine)');
    var onEnter = function (e) { if (e.pointerType === 'mouse' || fine.matches) { if (state === 'settling') state = 'rest'; play(); } };
    var onLeave = function (e) { if (e.pointerType === 'mouse' || fine.matches) settle(); };
    var onFocus = function () { if (link.matches(':focus-visible')) play(); };
    var onBlur = function () { settle(); };
    link.addEventListener('pointerenter', onEnter);
    link.addEventListener('pointerleave', onLeave);
    link.addEventListener('focus', onFocus);
    link.addEventListener('blur', onBlur);

    var io = null;
    if (!fine.matches && 'IntersectionObserver' in global) {
      io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { play(); io.disconnect(); } }); }, { threshold: 0.6 });
      io.observe(root);
    }

    function destroy() {
      state = 'rest'; cancelAnimationFrame(raf);
      anims.forEach(function (a) { a.cancel(); }); anims = []; counters = [];
      restoreText();
      if (io) io.disconnect(); if (ro) ro.disconnect();
      link.removeEventListener('pointerenter', onEnter);
      link.removeEventListener('pointerleave', onLeave);
      link.removeEventListener('focus', onFocus);
      link.removeEventListener('blur', onBlur);
    }

    return { play: play, settle: settle, destroy: destroy, duration: Math.round(END * S), get state() { return state; } };
  }

  global.SmsThumb = { mount: mount, EASE: EASE };
})(window);
