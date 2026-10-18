/* ==========================================================================
   Work thumbnail · SnapGrid
     1 Capture   the crew app lines the after shot up with a ghost of the
                 before, the shutter fires and the shot joins the strip
     2 Ask       one tap sends the customer an upload link
     3 Upload    four photos arrive in the inbox, uploading as they land
     4 Review    each is approved or sent back with a reason; the count runs
                 0 -> 3 and consent is recorded
     5 Reward    the $25 tier is reached and the reward joins the queue
     6 Publish   the approved photo becomes a post, consent on file, scheduled
   Rest state = the SVG as authored (the loop finished). Hover / focus plays
   (~9.2s at speed 1). Leaving fast-forwards to the end. Touch: once when 60%
   in view. Reduced motion: never.

   Usage:
     <a class="card" href="work/snapgrid.html"><div class="sg" data-sg="snapgrid"> …inline snapgrid-thumb.svg… </div></a>
     const t = SnapgridThumb.mount(document.querySelector('[data-sg="snapgrid"]'));   // t.destroy() on unmount
   ========================================================================== */
(function (global) {
  'use strict';

  var EASE = {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    press: 'cubic-bezier(0.2, 0, 0, 1)',
    pop: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  };

  var STEP_AT = [0, 1150, 1750, 2750, 4450, 5450];   /* when each step stands */
  var TILE_AT = [1800, 1960, 2120, 2280];            /* uploads landing */
  var VERDICT_AT = [2850, 3200, 3550, 3900];         /* decisions, in order */
  var END = 9200;

  function mount(root, opts) {
    opts = opts || {};
    var S = opts.speed || 1;
    var svg = root.querySelector('svg');
    var q = function (s) { return svg.querySelector(s); };
    var qa = function (s) { return Array.prototype.slice.call(svg.querySelectorAll(s)); };
    var reduce = global.matchMedia('(prefers-reduced-motion: reduce)');
    var anims = [], counters = [], raf = 0, state = 'rest';

    function layout() { root.classList.toggle('is-compact', root.getBoundingClientRect().width < 560); }
    layout();
    var ro = 'ResizeObserver' in global ? new ResizeObserver(layout) : null;
    if (ro) ro.observe(root);

    function push(a) { anims.push(a); return a; }
    function one(el, kf, at, dur, easing, fill) {
      if (!el) return null;
      return push(el.animate(kf, {
        delay: Math.round(at * S),
        duration: Math.max(1, Math.round(dur * S)),
        easing: easing || EASE.out,
        fill: fill || 'both'
      }));
    }
    function driver(el, t0, t1, fn) {
      if (!el) return;
      var a = new Animation(new KeyframeEffect(null, [], {
        delay: Math.round(t0 * S), duration: Math.round((t1 - t0) * S), fill: 'both'
      }), document.timeline);
      a.play(); push(a);
      counters.push(function () {
        var p = a.effect.getComputedTiming().progress;
        if (p == null) p = 1;
        el.textContent = fn(t0 + p * (t1 - t0));
      });
    }

    var pop = [{ opacity: 0, transform: 'scale(0.4)' }, { opacity: 1, transform: 'none' }];
    var fade = [{ opacity: 0 }, { opacity: 1 }];
    var rise = [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }];

    function build() {
      anims.forEach(function (a) { a.cancel(); });
      anims = []; counters = [];

      /* the three surfaces arrive first, left to right */
      one(q('.sg-phone'), rise, 0, 340);
      one(q('.sg-review'), rise, 90, 340);
      one(q('.sg-publish'), rise, 180, 340);

      /* the rail: each step's bar wipes in as that step starts */
      qa('.sg-step').forEach(function (step, i) {
        one(step.querySelector('.sg-step-fill'),
            [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
            STEP_AT[i], 420, EASE.inOut);
        one(step.querySelector('.sg-step-t'),
            [{ fill: '#8A8F96' }, { fill: '#4338CA' }], STEP_AT[i], 220, 'linear');
        if (i < 5) {
          /* forwards only: with 'both' this would hold the indigo "from" value
             before its delay, lighting every later step from the first frame */
          one(step.querySelector('.sg-step-t'),
              [{ fill: '#4338CA' }, { fill: '#8A8F96' }], STEP_AT[i + 1], 220, 'linear', 'forwards');
        }
      });

      /* 1 · capture — the ghost lines up, the shutter fires, the shot lands */
      one(q('.sg-ghost'), [{ opacity: 0 }, { opacity: 1 }], 180, 300, 'linear');
      one(q('.sg-shutter'), [{ transform: 'none' }, { transform: 'scale(0.76)', offset: 0.45 }, { transform: 'none' }], 620, 360, EASE.press, 'none');
      one(q('.sg-shutter-r'), [{ transform: 'none' }, { transform: 'scale(1.18)', offset: 0.5 }, { transform: 'none' }], 620, 420, EASE.out, 'none');
      one(q('.sg-shot'), [{ opacity: 1 }, { opacity: 0.25, offset: 0.12 }, { opacity: 1 }], 620, 420, 'linear', 'none');
      qa('.sg-striptile').forEach(function (t, i) { one(t, pop, 820 + i * 90, 240, EASE.pop); });

      /* 2 · ask — the link goes out, then clears */
      one(q('.sg-link'), [{ opacity: 0, transform: 'translateX(-14px)' }, { opacity: 1, transform: 'none' }], 1200, 300, EASE.out, 'none');
      one(q('.sg-link'), [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(26px)' }], 1620, 300, EASE.inOut, 'none');

      /* 3 · upload — the bar fills while the four photos land */
      one(q('.sg-upbar-t'), fade, 1700, 180, 'linear');
      one(q('.sg-upbar'), fade, 1700, 180, 'linear');
      one(q('.sg-upbar'), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 1750, 620, EASE.inOut);
      one(q('.sg-upbar'), [{ opacity: 1 }, { opacity: 0 }], 2500, 260, 'linear');
      one(q('.sg-upbar-t'), [{ opacity: 1 }, { opacity: 0 }], 2500, 260, 'linear');
      qa('.sg-tile-img').forEach(function (t, i) {
        one(t, [{ opacity: 0, transform: 'scale(0.92)' }, { opacity: 1, transform: 'none' }], TILE_AT[i], 300, EASE.out);
      });

      /* 4 · review — a decision on each, the count follows, consent recorded */
      qa('.sg-verdict').forEach(function (v, i) { one(v, pop, VERDICT_AT[i], 260, EASE.pop); });
      driver(q('.sg-cnt-n'), VERDICT_AT[0], VERDICT_AT[3] + 300, function (t) {
        /* a decision counts once its mark has popped, not when it starts */
        var n = 0;
        for (var i = 0; i < VERDICT_AT.length; i++) if (VERDICT_AT[i] + 140 <= t) n++;
        return String(n);
      });
      one(q('.sg-consent'), rise, 4150, 300);

      /* 5 · reward — the tier is reached and the $25 joins the queue */
      one(q('.sg-tiers .sg-tier[data-i="1"] rect'), [{ fillOpacity: 0 }, { fillOpacity: 0.10 }], 4500, 260, 'linear');
      one(q('.sg-tiers .sg-tier[data-i="1"] circle'), [{ transform: 'scale(0.5)' }, { transform: 'none' }], 4500, 300, EASE.pop, 'none');
      one(q('.sg-btn'), [{ transform: 'scale(0.97)' }, { transform: 'none' }], 4700, 320, EASE.pop, 'none');
      one(q('.sg-coin'), [{ opacity: 0, transform: 'translate(-30px, 20px) scale(0.6)' }, { opacity: 1, transform: 'none', offset: 0.45 }, { opacity: 0, transform: 'translate(40px, -14px) scale(0.9)' }], 4850, 900, EASE.inOut, 'none');

      /* 6 · publish — the post is built and scheduled */
      one(q('.sg-post-img'), [{ opacity: 0, transform: 'scale(0.94)' }, { opacity: 1, transform: 'none' }], 5500, 380, EASE.out);
      one(q('.sg-caption'), fade, 5900, 280, 'linear');
      one(q('.sg-badge'), rise, 6150, 300);
      one(q('.sg-sched'), pop, 6500, 340, EASE.pop);
    }

    function paint() { counters.forEach(function (f) { f(); }); }
    function loop() { paint(); if (state !== 'rest') raf = requestAnimationFrame(loop); }
    function restoreText() { var n = q('.sg-cnt-n'); if (n) n.textContent = '4'; }

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
        root.dispatchEvent(new CustomEvent('sg:done'));
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
      io = new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting) { play(); io.disconnect(); } });
      }, { threshold: 0.6 });
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

  global.SnapgridThumb = { mount: mount, EASE: EASE };
})(window);
