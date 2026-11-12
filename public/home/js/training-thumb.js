/* ==========================================================================
   Work thumbnail · Training management
     1 Record   Tomasz Bielik's AW139 syllabus fills session by session, every
                outcome checked against the syllabus (pass or repeat)
     2 Cleared  each repeat is traced by an arc to the later session that cleared
                it; repeats stay on the record
     3 Gate     "checks outstanding" counts 39 → 0; only then the lock opens and
                the examiner signs
     4 Roster   validity is written: 16 Sep 2026 → 16 Sep 2027, revalidation opens
                18 Jun, "can be rostered on AW139 from today"
   Rest state = the SVG as authored (complete). Hover / focus plays (~7.2s).
   Leaving fast-forwards to the end. Touch: once when 60% in view. Reduced motion: never.

   Usage:
     <a class="work-card" href="/work/training-management"><div class="tr" data-tr="training"> …inline training-thumb.svg… </div></a>
     const t = TrainingThumb.mount(document.querySelector('[data-tr="training"]'));   // t.destroy() on unmount
   ========================================================================== */
(function (global) {
  'use strict';

  var EASE = {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    press: 'cubic-bezier(0.2, 0, 0, 1)',
    pop: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  };
  var INK = '#292A2E', PASS = '#5B7F24';
  var SESSION_AT = [400, 1000, 1600, 2200, 2700, 3200];
  var CELL_STEP = 45;
  var ARC_AFTER = 30, ARC_DUR = 380;
  var UNLOCK_AT = 3480;
  var END = 7200;
  var TOTAL = 39;

  function mount(root, opts) {
    opts = opts || {};
    var S = opts.speed || 1;
    var svg = root.querySelector('svg');
    var q = function (s) { return svg.querySelector(s); };
    var qa = function (s) { return Array.prototype.slice.call(svg.querySelectorAll(s)); };
    var reduce = global.matchMedia('(prefers-reduced-motion: reduce)');
    var anims = [], counters = [], raf = 0, state = 'rest';

    function layout() { root.classList.toggle('is-compact', root.getBoundingClientRect().width < 480); }
    layout();
    var ro = 'ResizeObserver' in global ? new ResizeObserver(layout) : null;
    if (ro) ro.observe(root);

    function push(a) { anims.push(a); return a; }
    function one(el, kf, at, dur, easing, fill) {
      return push(el.animate(kf, { delay: Math.round(at * S), duration: Math.max(1, Math.round(dur * S)), easing: easing || EASE.out, fill: fill || 'both' }));
    }
    function driver(el, t0, t1, fn) {
      var a = new Animation(new KeyframeEffect(null, [], { delay: Math.round(t0 * S), duration: Math.round((t1 - t0) * S), fill: 'both' }), document.timeline);
      a.play(); push(a);
      counters.push(function () { var p = a.effect.getComputedTiming().progress; if (p == null) p = 1; el.textContent = fn(t0 + p * (t1 - t0)); });
    }
    var pop = [{ opacity: 0, transform: 'scale(0.4)' }, { opacity: 1, transform: 'none' }];
    var draw = [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }];
    var rise = [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }];

    function build() {
      anims.forEach(function (a) { a.cancel(); });
      anims = []; counters = [];

      one(q('.tr-rec'), rise, 0, 320);
      one(q('.tr-gate'), rise, 80, 320);
      one(q('.tr-roster'), rise, 160, 320);

      /* 1 · every outcome recorded against the syllabus */
      var events = [];   /* times at which an outstanding check is closed */
      var cellAt = {};
      qa('.tr-cell').forEach(function (c) {
        var s = +c.getAttribute('data-s'), r = +c.getAttribute('data-r');
        var t = SESSION_AT[s] + r * CELL_STEP;
        cellAt[s + ':' + r] = t;
        one(c, pop, t, 220, EASE.pop);
        if (c.getAttribute('data-o') === 'P') events.push(t + 110);
      });
      qa('.tr-col').forEach(function (col, s) {
        one(col.querySelector('.tr-snum'), [{ fill: '#B8BBB4' }, { fill: INK }], SESSION_AT[s] - 60, 200, 'linear');
      });

      /* 2 · repeats cleared later (arcs), they stay on the record */
      var targets = [[2, 2], [3, 3], [4, 1]];
      qa('.tr-arc').forEach(function (arc, k) {
        var t = cellAt[targets[k][0] + ':' + targets[k][1]] + ARC_AFTER;
        one(arc, draw, t, ARC_DUR, EASE.inOut);
        one(q('.tr-clear[data-k="' + k + '"]'), pop, t + ARC_DUR - 40, 220, EASE.pop);
        events.push(t + ARC_DUR);
      });
      events.sort(function (x, y) { return x - y; });
      driver(q('.tr-big'), 0, UNLOCK_AT, function (t) {
        var n = 0; for (var i = 0; i < events.length; i++) if (events[i] <= t) n++;
        return String(TOTAL - n);
      });

      /* 3 · the gate opens only at zero; the examiner signs */
      var shack = q('.tr-shackle');
      one(shack, [{ transform: 'none' }, { transform: 'translateY(-13px)', offset: 0.55 }, { transform: 'translateY(-10px)' }], UNLOCK_AT, 420, EASE.press);
      one(q('.tr-body'), [{ fill: INK }, { fill: PASS }], UNLOCK_AT + 120, 260, 'linear');
      one(q('.tr-lock'), [{ transform: 'none' }, { transform: 'scale(1.1)', offset: 0.5 }, { transform: 'none' }], UNLOCK_AT, 360, EASE.out, 'none');
      one(q('.tr-sig'), draw, 3850, 700, 'cubic-bezier(0.45, 0, 0.55, 1)');
      qa('.tr-gate .tr-small, .tr-gate .tr-sub').slice(-2).forEach(function (e, i) { one(e, [{ opacity: 0 }, { opacity: 1 }], 4450 + i * 80, 220, 'linear'); });

      /* 4 · validity written to the roster */
      one(q('.tr-bar'), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 4900, 1200, EASE.inOut);
      one(q('.tr-reval'), pop, 5800, 260, EASE.pop);
      one(q('.tr-valid'), pop, 6050, 260, EASE.pop);
      one(q('.tr-ok'), pop, 6350, 320, EASE.pop);
    }

    function paint() { counters.forEach(function (f) { f(); }); }
    function loop() { paint(); if (state !== 'rest') raf = requestAnimationFrame(loop); }
    function restoreText() { q('.tr-big').textContent = '0'; }

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
        root.dispatchEvent(new CustomEvent('tr:done'));
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

  global.TrainingThumb = { mount: mount, EASE: EASE };
})(window);
