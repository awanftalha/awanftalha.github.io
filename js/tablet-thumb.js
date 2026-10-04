/* ==========================================================================
   Work thumbnail · Instructor tablet app ("The instructors put the paper down")
     1 Paper    a grading sheet is ticked and signed by hand, then put down
     2 Tablet   the tablet slides in over it: session 3 running, 5 of 9 recorded
     3 Grade    tap the exercise being flown, tap Partial, tap "Checklist from
                memory", Save: 6 of 9, recorded mid-exercise
     4 Session  the clock runs on to 3 h 52; 7, 8, 9 of 9
     5 Sign     review totals, sign with a finger, "Signed"
   Rest state = the SVG as authored (signed tablet over the put-down paper).
   Hover / focus plays (~8.9s at speed 1). Leaving fast-forwards to the end.
   Touch: once when 60% in view. Reduced motion: never.

   Usage:
     <a class="work-card" href="/work/instructor-tablet"><div class="tb" data-tb="tablet"> …inline tablet-thumb.svg… </div></a>
     const t = TabletThumb.mount(document.querySelector('[data-tb="tablet"]'));   // t.destroy() on unmount
   ========================================================================== */
(function (global) {
  'use strict';

  var EASE = {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    press: 'cubic-bezier(0.2, 0, 0, 1)',
    pop: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  };
  var BLUE = '#1868DB';
  var END = 8900;
  /* screen geometry (user units inside the screen) */
  var SW = 428;
  var BW = (SW - 32 - 16) / 3;
  var TAPS = {
    fly: [214, 226], partial: [16 + BW + 8 + BW / 2, 363], chip: [86, 437], save: [SW - 72, 585], sign: [SW - 78, 575]
  };
  var SIG_PTS = [[66, 332, 7000], [96, 326, 7140], [124, 322, 7280], [152, 324, 7420], [184, 318, 7560], [214, 326, 7700], [252, 316, 7840], [286, 324, 7930], [326, 312, 8000], [364, 318, 8050]];

  function clock(sec) {
    sec = Math.floor(sec);
    var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    return [h, m, s].map(function (n) { return (n < 10 ? '0' : '') + n; }).join(':');
  }

  function mount(root, opts) {
    opts = opts || {};
    var S = opts.speed || 1;
    var svg = root.querySelector('svg');
    var q = function (s) { return svg.querySelector(s); };
    var qa = function (s) { return Array.prototype.slice.call(svg.querySelectorAll(s)); };
    var reduce = global.matchMedia('(prefers-reduced-motion: reduce)');
    var anims = [], counters = [], raf = 0, state = 'rest';

    function layout() { root.classList.toggle('is-compact', root.getBoundingClientRect().width < 440); }
    layout();
    var ro = 'ResizeObserver' in global ? new ResizeObserver(layout) : null;
    if (ro) ro.observe(root);

    function push(a) { anims.push(a); return a; }
    function one(el, kf, at, dur, easing, fill) {
      return push(el.animate(kf, { delay: Math.round(at * S), duration: Math.max(1, Math.round(dur * S)), easing: easing || EASE.out, fill: fill || 'both' }));
    }
    function seq(el, pts, fill) {
      var t0 = pts[0][0], t1 = pts[pts.length - 1][0], span = Math.max(1, t1 - t0);
      var kf = pts.map(function (p) { var k = {}; for (var n in p[1]) k[n] = p[1][n]; k.offset = (p[0] - t0) / span; k.easing = p[2] || 'linear'; return k; });
      return push(el.animate(kf, { delay: Math.round(t0 * S), duration: Math.round(span * S), fill: fill || 'both' }));
    }
    /* text driven by the progress of a timeline span: fn(ms since play) → string */
    function driver(el, t0, t1, fn) {
      var a = new Animation(new KeyframeEffect(null, [], { delay: Math.round(t0 * S), duration: Math.round((t1 - t0) * S), fill: 'both' }), document.timeline);
      a.play(); push(a);
      counters.push(function () { var p = a.effect.getComputedTiming().progress; if (p == null) p = 1; el.textContent = fn(t0 + p * (t1 - t0)); });
    }
    var pop = [{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'none' }];
    var draw = [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }];
    var T = function (xy, sc) { return 'translate(' + xy[0] + 'px, ' + xy[1] + 'px) scale(' + (sc || 1) + ')'; };

    function build() {
      anims.forEach(function (a) { a.cancel(); });
      anims = []; counters = [];

      /* ---- 1 · the paper way ---- */
      var front = 'translate(190px, -40px) rotate(6deg) scale(1.12)';
      seq(q('.tb-paper'), [[0, { opacity: 0, transform: front }, EASE.out], [300, { opacity: 1, transform: front }], [1450, { opacity: 1, transform: front }, EASE.inOut], [2150, { opacity: 1, transform: 'none' }]]);
      var inks = qa('.tb-paper .tb-ink');
      one(inks[0], draw, 350, 300, EASE.inOut);
      qa('.tb-tick').forEach(function (t, i) { one(t, draw, 600 + i * 85, 140, EASE.inOut); });
      one(q('.tb-p-sig'), draw, 1380, 320, EASE.inOut);

      /* ---- 2 · the tablet arrives, mid-session ---- */
      seq(q('.tb-device'), [[1600, { opacity: 0, transform: 'translate(300px, 60px) rotate(10deg)' }, EASE.out], [2400, { opacity: 1, transform: 'none' }]]);
      seq(q('.tb-scr-a'), [[1600, { opacity: 0 }], [1601, { opacity: 1 }], [6300, { opacity: 1 }], [6600, { opacity: 0 }]]);
      driver(q('.tb-timer'), 1600, 6200, function (t) {
        if (t < 5000) return clock(2538 + (t - 1600) / 1000);
        var p = (t - 5000) / 1200, e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        return clock(2541.4 + (13920 - 2541.4) * e);
      });
      driver(q('.tb-count'), 1600, 6000, function (t) { return String(t < 4750 ? 5 : t < 5300 ? 6 : t < 5600 ? 7 : t < 5900 ? 8 : 9); });

      /* the finger */
      var touch = q('.tb-touch'), rip = q('.tb-ripple');
      seq(touch, [[2400, { opacity: 0 }], [2500, { opacity: 1 }], [4350, { opacity: 1 }], [4500, { opacity: 0 }], [6900, { opacity: 0 }], [7000, { opacity: 1 }], [8050, { opacity: 1 }], [8250, { opacity: 0 }], [8350, { opacity: 1 }], [8650, { opacity: 1 }], [8800, { opacity: 0 }]]);
      seq(touch, [
        [2400, { transform: T(TAPS.fly, 1.4) }, EASE.out], [2550, { transform: T(TAPS.fly) }], [3100, { transform: T(TAPS.fly) }, EASE.inOut],
        [3300, { transform: T(TAPS.partial) }], [3560, { transform: T(TAPS.partial) }, EASE.inOut],
        [3750, { transform: T(TAPS.chip) }], [4040, { transform: T(TAPS.chip) }, EASE.inOut],
        [4250, { transform: T(TAPS.save) }], [6900, { transform: T([66, 332], 1.3) }, EASE.out]
      ].concat(SIG_PTS.map(function (p) { return [p[2], { transform: T([p[0], p[1]]) }]; })).concat([
        [8250, { transform: T(TAPS.sign, 1.3) }, EASE.out], [8350, { transform: T(TAPS.sign) }], [8800, { transform: T(TAPS.sign) }]
      ]));
      [2550, 3300, 3750, 4250, 8350].forEach(function (t) {
        one(rip, [{ opacity: 0.8, transform: 'scale(0.6)' }, { opacity: 0, transform: 'scale(1.9)' }], t, 420, EASE.out, 'none');
      });

      /* ---- 3 · record the outcome mid-exercise ---- */
      seq(q('.tb-scrim'), [[2700, { opacity: 0 }], [2950, { opacity: 1 }], [4400, { opacity: 1 }], [4650, { opacity: 0 }]]);
      seq(q('.tb-sheet'), [[2700, { opacity: 1, transform: 'translateY(400px)' }, EASE.out], [3150, { opacity: 1, transform: 'none' }], [4400, { opacity: 1, transform: 'none' }, EASE.inOut], [4800, { opacity: 1, transform: 'translateY(400px)' }], [4801, { opacity: 0, transform: 'translateY(400px)' }]]);
      seq(q('.tb-sheet'), [[2699, { visibility: 'hidden' }], [2700, { visibility: 'visible' }], [4800, { visibility: 'visible' }], [4801, { visibility: 'hidden' }]]);
      one(q('.tb-partial'), pop, 3360, 240, EASE.pop);
      one(q('.tb-chip'), pop, 3810, 240, EASE.pop);
      seq(q('.tb-save'), [[4250, { fill: BLUE }], [4320, { fill: '#0F4FAD' }], [4520, { fill: BLUE }]], 'none');

      var fills = qa('.tb-seg-fill');
      var byI = {}; fills.forEach(function (f) { byI[f.getAttribute('data-i')] = f; });
      [[1, 4700], [2, 5300], [7, 5600], [8, 5900]].forEach(function (p) {
        one(byI[p[0]], [{ opacity: 0, transform: 'scaleX(0)' }, { opacity: 1, transform: 'none' }], p[1], 320, EASE.inOut);
      });
      seq(q('.tb-row-fly'), [[1600, { opacity: 1 }], [4700, { opacity: 1 }], [4800, { opacity: 0 }]]);
      seq(q('.tb-row-nr'), [[1600, { opacity: 1 }], [5300, { opacity: 1 }], [5400, { opacity: 0 }]]);
      var news = qa('.tb-row-new');
      one(news[0], pop, 4750, 260, EASE.pop);
      one(news[1], pop, 5350, 260, EASE.pop);

      /* ---- 5 · review and sign ---- */
      seq(q('.tb-scr-c'), [[6300, { opacity: 0, transform: 'translateX(30px)' }, EASE.out], [6650, { opacity: 1, transform: 'none' }]]);
      qa('.tb-tile').forEach(function (t, k) { one(t, pop, 6700 + k * 90, 300, EASE.pop); });
      one(q('.tb-sig'), draw, 7000, 1050, 'cubic-bezier(0.45, 0, 0.55, 1)');
      one(q('.tb-cb'), pop, 8150, 260, EASE.pop);
      seq(q('.tb-signbtn'), [[6300, { opacity: 1 }], [8480, { opacity: 1 }], [8560, { opacity: 0 }]]);
      seq(q('.tb-signbtn rect'), [[8350, { fill: BLUE }], [8420, { fill: '#0F4FAD' }], [8560, { fill: '#0F4FAD' }]], 'none');
      one(q('.tb-signed'), pop, 8520, 320, EASE.pop);
    }

    function paint() { counters.forEach(function (f) { f(); }); }
    function loop() { paint(); if (state !== 'rest') raf = requestAnimationFrame(loop); }
    function restoreText() { q('.tb-timer').textContent = '00:42:18'; q('.tb-count').textContent = '5'; }

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
        root.dispatchEvent(new CustomEvent('tb:done'));
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

  global.TabletThumb = { mount: mount, EASE: EASE };
})(window);
