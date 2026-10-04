/* ==========================================================================
   Work thumbnail · HX Insight, four flows
     01 Leave       team cover is checked day by day (Thu is low), Bilal approves,
                    the record is already with HR and finance
     02 Resourcing  the 50% request lands on each person's 8 weeks, the list ranks
                    itself (best fit, overbooks, fully booked), Zain is booked
     03 Onboarding  Rabia nudges 3 owners, their tasks close, readiness 61% → ready
     04 Attendance  the 3 exceptions are decided, 3 → 6 of 6 ready, week 46 is
                    approved, locked and sent to payroll
   One pointer walks through all four. The tile that is playing is lit, the
   others are dimmed; at the end all four are lit together.
   Rest state = the SVG as authored (all finished). Hover / focus plays (~9.3s).
   Leaving fast-forwards to the end. Touch: once when 60% in view. Reduced motion: never.

   Usage:
     <a class="work-card" href="/work/hx-insight"><div class="hx" data-hx="hx-insight"> …inline hx-thumb.svg… </div></a>
     const t = HxThumb.mount(document.querySelector('[data-hx="hx-insight"]'));   // t.destroy() on unmount
   ========================================================================== */
(function (global) {
  'use strict';

  var EASE = {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    press: 'cubic-bezier(0.2, 0, 0, 1)',
    pop: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  };
  var C = {
    b600: '#0070E0', b50: '#EBF5FF', b100: '#D6EBFF', n50: '#F6F7FB', n100: '#EEF0F6', n500: '#5F6680',
    g500: '#12B76A', a50: '#FFFAEB', a200: '#FEDF89', white: '#FFFFFF'
  };
  var F = [450, 2550, 4650, 6750];   /* when each flow starts */
  var FLOW = 2100;                   /* how long each flow has */
  var END = 9300;
  var DIM_NEXT = 0.36, DIM_DONE = 0.6;
  var START = [400, 262];            /* pointer starts between the tiles */
  var CLICK = [[335, 207], [719, 119], [314, 295], [588, 444]];
  var SORT_FROM = [84, -42, -42];    /* resourcing rows arrive unranked: Fatima, Ali, Zain */

  function mount(root, opts) {
    opts = opts || {};
    var S = opts.speed || 1;
    var svg = root.querySelector('svg');
    var q = function (s, el) { return (el || svg).querySelector(s); };
    var qa = function (s, el) { return Array.prototype.slice.call((el || svg).querySelectorAll(s)); };
    var reduce = global.matchMedia('(prefers-reduced-motion: reduce)');
    var anims = [], counters = [], raf = 0, state = 'rest';

    /* pills hug their label once the real fonts are in */
    function fitPills() {
      qa('.hx-pill').forEach(function (p) {
        var t = q('.hx-pill-t', p), bg = q('.hx-pill-bg', p), dot = q('.hx-pill-dot', p);
        var len = 0;
        try { len = t.getComputedTextLength(); } catch (e) {}
        if (!(len > 0)) return;
        var right = +p.getAttribute('data-r');
        var left = right - 10 - len - 6 - 6 - 9;
        bg.setAttribute('x', left.toFixed(1));
        bg.setAttribute('width', (right - left).toFixed(1));
        dot.setAttribute('cx', (left + 12).toFixed(1));
      });
    }
    function layout() { root.classList.toggle('is-compact', root.getBoundingClientRect().width < 480); }
    layout(); fitPills();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPills);
    var ro = 'ResizeObserver' in global ? new ResizeObserver(layout) : null;
    if (ro) ro.observe(root);

    function push(a) { anims.push(a); return a; }
    function one(el, kf, at, dur, easing, fill) {
      return push(el.animate(kf, { delay: Math.round(at * S), duration: Math.max(1, Math.round(dur * S)), easing: easing || EASE.out, fill: fill || 'both' }));
    }
    /* one animation through several timed points: [[ms, {props}, easingToNext], ...] */
    function seq(el, pts, fill) {
      var t0 = pts[0][0], span = Math.max(1, pts[pts.length - 1][0] - t0);
      var kf = pts.map(function (p) {
        var k = {}; for (var n in p[1]) k[n] = p[1][n];
        k.offset = Math.min(1, Math.max(0, (p[0] - t0) / span));
        k.easing = p[2] || 'linear';
        return k;
      });
      return push(el.animate(kf, { delay: Math.round(t0 * S), duration: Math.round(span * S), fill: fill || 'both' }));
    }
    function driver(el, t0, t1, fn) {
      var a = new Animation(new KeyframeEffect(null, [], { delay: Math.round(t0 * S), duration: Math.round((t1 - t0) * S), fill: 'both' }), document.timeline);
      a.play(); push(a);
      counters.push(function () { var p = a.effect.getComputedTiming().progress; if (p == null) p = 1; el.textContent = fn(t0 + p * (t1 - t0)); });
    }
    var show = [{ opacity: 0 }, { opacity: 1 }];
    var hide = [{ opacity: 1 }, { opacity: 0 }];
    var pop = [{ opacity: 0, transform: 'scale(0.4)' }, { opacity: 1, transform: 'none' }];
    var out = [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(0.6)' }];
    var rise = [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }];
    function press(el, at) { seq(el, [[at, { transform: 'none' }], [at + 70, { transform: 'scale(0.94)' }, EASE.out], [at + 220, { transform: 'none' }]], 'none'); }
    function ripple(k, at) { one(q('.hx-rip[data-k="' + k + '"]'), [{ opacity: 0.45, transform: 'scale(0.3)' }, { opacity: 0, transform: 'scale(1.6)' }], at, 520, EASE.out, 'forwards'); }
    function swapPill(tile, at) {
      var pre = q('.hx-p-pre', tile);
      if (pre) one(pre, out, at, 180, EASE.press);
      one(q('.hx-p-post', tile), pop, at + 90, 320, EASE.pop);
    }

    function build() {
      anims.forEach(function (a) { a.cancel(); });
      anims = []; counters = [];
      var tiles = qa('.hx-tile');

      /* the tiles: lit while their flow plays, dimmed before and after */
      tiles.forEach(function (t, i) {
        var f = F[i], e = i * 70, pts;
        if (i === 0) pts = [[0, { opacity: 0 }], [380, { opacity: 1 }]];
        else pts = [[e, { opacity: 0 }], [e + 380, { opacity: DIM_NEXT }], [f - 220, { opacity: DIM_NEXT }, EASE.inOut], [f, { opacity: 1 }]];
        if (i < 3) pts.push([f + FLOW - 40, { opacity: 1 }, EASE.inOut], [f + FLOW + 220, { opacity: DIM_DONE }], [END - 450, { opacity: DIM_DONE }, EASE.inOut], [END - 150, { opacity: 1 }]);
        pts.push([END, { opacity: 1 }]);
        seq(t, pts);
        one(q('.hx-tin', t), [{ transform: 'translateY(14px)' }, { transform: 'none' }], e, 460);
        one(q('.hx-badge-bg', t), [{ fill: C.n100 }, { fill: C.b600 }], f - 160, 260, 'linear');
        one(q('.hx-badge-t', t), [{ fill: C.n500 }, { fill: C.white }], f - 160, 260, 'linear');
      });
      var T1 = tiles[0], T2 = tiles[1], T3 = tiles[2], T4 = tiles[3];

      /* 01 Leave: cover checked day by day, then approved */
      var f = F[0];
      qa('.hx-cov', T1).forEach(function (c, i) { one(c, rise, f + 150 + i * 260, 340); });
      one(q('.hx-dbg[data-i="1"]', T1), [{ fill: C.n50, stroke: C.n50 }, { fill: C.a50, stroke: C.a200 }], f + 410, 320, 'linear');
      press(q('.hx-l-ok', T1), f + 1100);
      ripple(0, f + 1110);
      one(q('.hx-l-act', T1), hide, f + 1230, 220, 'linear');
      one(q('.hx-l-done', T1), rise, f + 1330, 380);
      one(q('.hx-l-tick', T1), pop, f + 1460, 280, EASE.pop);
      swapPill(T1, f + 1250);

      /* 02 Resourcing: the request lands on each person's weeks, the list ranks itself, Zain is booked */
      f = F[1];
      var visual = [2, 0, 1];   /* row order on arrival: Fatima, Ali, Zain */
      qa('.hx-req', T2).forEach(function (r) {
        var i = +r.getAttribute('data-i'), k = +r.getAttribute('data-k');
        one(r, [{ transform: 'scaleY(0)' }, { transform: 'none' }], f + 120 + visual[i] * 230 + k * 35, 300, EASE.out);
      });
      qa('.hx-row', T2).forEach(function (row) {
        var i = +row.getAttribute('data-i');
        one(row, [{ transform: 'translateY(' + SORT_FROM[i] + 'px)' }, { transform: 'none' }], f + 1000, 560, EASE.inOut);
        one(q('.hx-verdict', row), rise, f + 1420 + i * 90, 280);
        if (i > 0) one(row, [{ opacity: 1 }, { opacity: 0.5 }], f + 1860, 380, 'linear');
      });
      seq(q('.hx-assign', T2), [[f + 1430, { opacity: 0, transform: 'scale(0.7)' }, EASE.pop], [f + 1640, { opacity: 1, transform: 'none' }],
        [f + 1700, { opacity: 1, transform: 'none' }, EASE.out], [f + 1770, { opacity: 1, transform: 'scale(0.92)' }], [f + 1860, { opacity: 0, transform: 'scale(0.92)' }]]);
      ripple(1, f + 1710);
      one(q('.hx-row[data-i="0"] .hx-rbg', T2), [{ fill: C.white, stroke: C.white }, { fill: C.b50, stroke: C.b100 }], f + 1760, 320, 'linear');
      one(q('.hx-booked', T2), pop, f + 1830, 320, EASE.pop);
      swapPill(T2, f + 1880);

      /* 03 Onboarding: nudge 3 owners, their tasks close, ready for day one */
      f = F[2];
      var nudge = q('.hx-nudge', T3);
      press(nudge, f + 700);
      ripple(2, f + 710);
      qa('.hx-ping', T3).forEach(function (p, i) {
        one(p, [{ opacity: 0.9, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.9)' }], f + 820 + i * 110, 640, EASE.out, 'forwards');
      });
      [0, 1, 2].forEach(function (i) {
        var at = f + 1080 + i * 260;
        one(q('.hx-st-pre[data-i="' + i + '"]', T3), out, at, 160, EASE.press);
        one(q('.hx-st-post[data-i="' + i + '"]', T3), pop, at + 80, 300, EASE.pop);
      });
      var ring = q('.hx-ring', T3);
      seq(ring, [[f + 1000, { strokeDashoffset: 0.39 }, EASE.inOut], [f + 1640, { strokeDashoffset: 0.17 }], [f + 1720, { strokeDashoffset: 0.17 }, EASE.inOut], [f + 2020, { strokeDashoffset: 0 }]]);
      one(ring, [{ stroke: C.b600 }, { stroke: C.g500 }], f + 1720, 300, 'linear');
      var pct = q('.hx-pct', T3);
      var p0 = f + 1000;
      driver(pct, p0, p0 + 640, function (t) {
        var p = (t - p0) / 640; p = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        return Math.round(61 + 22 * p) + '%';
      });
      one(pct, hide, f + 1700, 160, 'linear');
      one(nudge, hide, f + 1700, 180, 'linear');
      one(q('.hx-ring-av', T3), pop, f + 1760, 320, EASE.pop);
      qa('.hx-ring-ok', T3).forEach(function (e) { one(e, pop, f + 1880, 260, EASE.pop); });
      one(q('.hx-p-post', T3), pop, f + 1790, 320, EASE.pop);

      /* 04 Attendance: three decisions, 6 of 6 ready, approve and lock, to payroll */
      f = F[3];
      var decided = [f + 300, f + 560, f + 820];
      decided.forEach(function (at, i) {
        one(q('.hx-ex-pre[data-i="' + i + '"]', T4), out, at, 160, EASE.press);
        one(q('.hx-exc[data-i="' + i + '"] .hx-ex-post', T4), pop, at + 80, 300, EASE.pop);
      });
      driver(q('.hx-big', T4), f, f + 1100, function (t) {
        var n = 3; decided.forEach(function (d) { if (t >= d + 120) n++; });
        return n + ' of 6';
      });
      var lockBtn = q('.hx-lockbtn', T4);
      press(lockBtn, f + 1200);
      ripple(3, f + 1210);
      one(lockBtn, hide, f + 1290, 200, 'linear');
      one(q('.hx-locked', T4), rise, f + 1360, 380);
      one(q('.hx-shackle', T4), [{ transform: 'translateY(-5px)' }, { transform: 'none' }], f + 1600, 320, EASE.press);
      swapPill(T4, f + 1420);

      /* the pointer: one hand through all four flows */
      var cur = q('.hx-cur'), tr = function (p) { return { transform: 'translate(' + p[0] + 'px, ' + p[1] + 'px)' }; };
      seq(cur, [
        [F[0] + 450, tr(START), EASE.inOut], [F[0] + 1050, tr(CLICK[0])],
        [F[1] + 820, tr(CLICK[0]), EASE.inOut], [F[1] + 1560, tr(CLICK[1])],
        [F[2] - 100, tr(CLICK[1]), EASE.inOut], [F[2] + 650, tr(CLICK[2])],
        [F[3] + 450, tr(CLICK[2]), EASE.inOut], [F[3] + 1150, tr(CLICK[3])],
        [END, tr(CLICK[3])]
      ]);
      seq(cur, [[F[0] + 380, { opacity: 0 }], [F[0] + 600, { opacity: 1 }], [F[3] + 1650, { opacity: 1 }], [F[3] + 1900, { opacity: 0 }], [END, { opacity: 0 }]]);
      var taps = [F[0] + 1100, F[1] + 1700, F[2] + 700, F[3] + 1200], pts = [[0, { transform: 'none' }]];
      taps.forEach(function (t) { pts.push([t - 10, { transform: 'none' }, EASE.out], [t + 60, { transform: 'scale(0.82)' }, EASE.out], [t + 200, { transform: 'none' }]); });
      seq(q('.hx-cur-i'), pts);

      /* all four done: the status pills answer together */
      tiles.forEach(function (t, i) {
        var at = END - 420 + i * 70;
        one(q('.hx-p-post', t), [{ transform: 'none' }, { transform: 'scale(1.12)', offset: 0.4 }, { transform: 'none' }], at, 380, EASE.out, 'none');
      });
    }

    function paint() { counters.forEach(function (fn) { fn(); }); }
    function loop() { paint(); if (state !== 'rest') raf = requestAnimationFrame(loop); }
    function restoreText() { q('.hx-pct').textContent = '61%'; q('.hx-big').textContent = '6 of 6'; }

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
        root.dispatchEvent(new CustomEvent('hx:done'));
      }, function () {});
    }
    /* leaving mid-play: fast-forward to the finished frame instead of cutting */
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

  global.HxThumb = { mount: mount, EASE: EASE };
})(window);
