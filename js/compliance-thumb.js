/* ==========================================================================
   Work thumbnail · Manual compliance check
   Rest state: the finished frame (the inline SVG as authored).
   Play: the regulation and the manual land, each requirement is traced to a
   page and gets its verdict, 140 requirements are counted, the report is
   stamped. ~2.8s. Hover / keyboard focus plays; leaving fast-forwards to the
   finished frame. Touch: plays once when 60% in view. Reduced motion: never.

   Usage:
     <a class="work-card" href="/work/manual-compliance-check">
       <div class="mg" data-mg="compliance"> …inline compliance-thumb.svg… </div>
     </a>
     const t = ComplianceThumb.mount(document.querySelector('[data-mg="compliance"]'));
     // later, on unmount: t.destroy()
   ========================================================================== */
(function (global) {
  'use strict';

  var EASE = {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',      /* --ease-out */
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',   /* --ease-in-out */
    press: 'cubic-bezier(0.2, 0, 0, 1)',       /* --ease-press */
    pop: 'cubic-bezier(0.34, 1.56, 0.64, 1)'   /* small overshoot for chips and tags */
  };

  /* order of the trace: row index → manual page it lands on (null = no match) */
  var ROWS = [
    { ay: 144, t: 'p8' },
    { ay: 200, t: 'p11' },
    { ay: 256, t: 'p19' },
    { ay: 312, t: null },
    { ay: 368, t: 'p14' }
  ];
  var TOTAL = 140;
  var T0 = 640;        /* first row is read */
  var STEP = 300;      /* one row every 300ms */
  var DURATION = 2850;

  function mount(root, opts) {
    opts = opts || {};
    var S = opts.speed || 1;
    var svg = root.querySelector('svg');
    var q = function (sel) { return svg.querySelector(sel); };
    var qa = function (sel) { return Array.prototype.slice.call(svg.querySelectorAll(sel)); };
    var reduce = global.matchMedia('(prefers-reduced-motion: reduce)');

    var reg = q('.mg-reg'), man = q('.mg-man');
    var count = q('.mg-count');
    var stamp = q('.mg-stamp');
    var chips = qa('.mg-chip');
    var chipWide = chips.map(function (c) { return +c.querySelector('.mg-chip-bg').getAttribute('width'); });

    var anims = [], counter = null, raf = 0, state = 'rest';

    /* compact mode for narrow cards: icons only on chips.
       Wide mode: size each chip to its label once the fonts are in. */
    function applyCompact() {
      var compact = root.getBoundingClientRect().width < 520;
      root.classList.toggle('is-compact', compact);
      chips.forEach(function (c, i) {
        var bg = c.querySelector('.mg-chip-bg');
        if (compact) { bg.setAttribute('width', 22); return; }
        var w = chipWide[i];
        try { var len = c.querySelector('.mg-chip-t').getComputedTextLength(); if (len > 0) w = Math.ceil(len + 29); } catch (e) {}
        bg.setAttribute('width', w);
      });
    }
    applyCompact();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(applyCompact);
    var ro = 'ResizeObserver' in global ? new ResizeObserver(applyCompact) : null;
    if (ro) ro.observe(root);

    function add(el, kf, at, dur, easing, fill) {
      var a = el.animate(kf, { delay: Math.round(at * S), duration: Math.max(1, Math.round(dur * S)), easing: easing || EASE.out, fill: fill || 'both' });
      anims.push(a);
      return a;
    }
    var hide = [{ opacity: 0 }, { opacity: 1 }];

    function build() {
      anims.forEach(function (a) { a.cancel(); });
      anims = [];
      var compact = root.classList.contains('is-compact');

      /* 1 · the two documents land */
      add(reg, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], 0, 320);
      qa('.mg-reg .mg-bar').forEach(function (b, i) { add(b, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 140 + i * 28, 240); });
      qa('.mg-id').forEach(function (t, i) { add(t, hide, 160 + i * 40, 200, 'linear'); });
      add(man, [{ opacity: 0, transform: 'translateX(16px)' }, { opacity: 1, transform: 'none' }], 120, 340);
      add(q('.mg-layer-1'), [{ transform: 'translate(0px, 0px)' }, { transform: 'translate(6px, 6px)' }], 260, 300);
      add(q('.mg-layer-2'), [{ transform: 'translate(0px, 0px)' }, { transform: 'translate(12px, 12px)' }], 260, 360);
      qa('.mg-mbar').forEach(function (b, i) { add(b, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 300 + i * 16, 220); });

      /* 2 · each requirement is read, traced to a page, and given a verdict */
      var scan = q('.mg-scan');
      var span = STEP * (ROWS.length - 1) + 700;
      var sStart = T0 - 80;
      var kf = [{ transform: 'translateY(0px)', offset: 0 }];
      ROWS.forEach(function (r, i) {
        var at = (T0 + i * STEP - sStart) / span;
        if (i > 0) kf.push({ transform: 'translateY(' + (ROWS[i - 1].ay - ROWS[0].ay) + 'px)', offset: Math.max(0, at - 0.09), easing: EASE.inOut });
        kf.push({ transform: 'translateY(' + (r.ay - ROWS[0].ay) + 'px)', offset: at });
      });
      kf.push({ transform: 'translateY(' + (ROWS[ROWS.length - 1].ay - ROWS[0].ay) + 'px)', offset: 1 });
      add(scan, kf, sStart, span, 'linear');
      add(scan, [{ opacity: 0 }, { opacity: 1, offset: 0.08 }, { opacity: 1, offset: 0.85 }, { opacity: 0 }], sStart, span, 'linear');

      ROWS.forEach(function (r, i) {
        var t = T0 + i * STEP;
        add(q('.mg-row[data-i="' + i + '"] .mg-row-hl'), [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], t, 560, 'linear');
        if (r.t) {
          add(q('.mg-thread[data-i="' + i + '"]'), [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], t + 60, 260, EASE.inOut);
          add(q('.mg-dot[data-i="' + i + '"]'), [{ opacity: 0, transform: 'scale(0.3)' }, { opacity: 1, transform: 'none' }], t + 300, 180, EASE.pop);
          add(q('.mg-tag[data-t="' + r.t + '"]'), [{ opacity: 0, transform: 'scale(0.5)' }, { opacity: 1, transform: 'none' }], t + 300, 220, EASE.pop);
          add(q('.mg-hl[data-t="' + r.t + '"]'), hide, t + 300, 200, 'linear');
        } else {
          /* no match: the thread searches the whole manual and stops short */
          add(q('.mg-miss'), [{ opacity: 0, transform: 'scaleX(0)' }, { opacity: 1, transform: 'scaleX(1)' }], t + 60, 300, EASE.inOut);
          add(q('.mg-sweep'), [{ opacity: 0, transform: 'translateY(0px)' }, { opacity: 0.9, offset: 0.15 }, { opacity: 0.9, offset: 0.8 }, { opacity: 0, transform: 'translateY(282px)' }], t + 60, 320, 'linear');
          add(q('.mg-miss-end'), [{ opacity: 0, transform: 'scale(0.3)' }, { opacity: 1, transform: 'none' }], t + 360, 180, EASE.pop);
        }
        add(q('.mg-chip[data-i="' + i + '"]'), [{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'none' }], t + 220, 220, EASE.pop);
      });

      /* 3 · the count and the coverage bar */
      qa('.mg-cl').forEach(function (e) { add(e, hide, 560, 200, 'linear'); });
      add(count, hide, 560, 160, 'linear');
      counter = new Animation(new KeyframeEffect(null, [], { delay: Math.round(600 * S), duration: Math.round(1700 * S), fill: 'both' }), document.timeline);
      counter.play();
      anims.push(counter);
      var segT = [[700, 1300, 'cubic-bezier(0.33, 0, 0.2, 1)'], [1980, 140], [2100, 120], [2200, 100]];
      qa('.mg-seg').forEach(function (s, k) { add(s, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], segT[k][0], segT[k][1], segT[k][2] || 'linear'); });
      qa('.mg-leg').forEach(function (l, k) { add(l, hide, 2100 + k * 60, 180, 'linear'); });

      /* 4 · stamped */
      var end = compact ? 'scale(1.3)' : 'scale(1)';
      add(stamp, [
        { opacity: 0, transform: compact ? 'scale(2.3)' : 'scale(1.8)' },
        { opacity: 1, transform: compact ? 'scale(1.25)' : 'scale(0.96)', offset: 0.75 },
        { opacity: 1, transform: end }
      ], 2380, 280, EASE.press);
      add(man, [{ transform: 'none' }, { transform: 'translateY(3px)', offset: 0.35 }, { transform: 'none' }], 2600, 220, EASE.out, 'none');
    }

    function paintCount() {
      if (!counter) { count.textContent = String(TOTAL); return; }
      var p = counter.effect.getComputedTiming().progress;
      if (p == null) p = 1;
      count.textContent = String(Math.round(TOTAL * (1 - (1 - p) * (1 - p))));
    }
    function loop() { paintCount(); if (state !== 'rest' || counter) raf = requestAnimationFrame(loop); }

    function play() {
      if (reduce.matches || state === 'playing') return;
      state = 'playing';
      build();
      cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
      Promise.all(anims.map(function (a) { return a.finished; })).then(function () {
        state = 'rest'; counter = null; paintCount(); cancelAnimationFrame(raf);
        anims.forEach(function (a) { a.cancel(); });   /* the SVG as authored is the finished frame */
        anims = [];
        root.dispatchEvent(new CustomEvent('mg:done'));
      }, function () {});
    }

    /* leaving mid-play: fast-forward to the finished frame instead of cutting */
    function settle() {
      if (state !== 'playing') return;
      state = 'settling';
      anims.forEach(function (a) { a.playbackRate = 6; });
    }

    var link = root.closest('a') || root;
    var fine = global.matchMedia('(hover: hover) and (pointer: fine)');
    var onEnter = function (e) { if (e.pointerType === 'mouse' || fine.matches) { if (state === 'settling') { state = 'rest'; } play(); } };
    var onLeave = function (e) { if (e.pointerType === 'mouse' || fine.matches) settle(); };
    var onFocus = function () { if (link.matches(':focus-visible')) play(); };
    var onBlur = function () { settle(); };
    link.addEventListener('pointerenter', onEnter);
    link.addEventListener('pointerleave', onLeave);
    link.addEventListener('focus', onFocus);
    link.addEventListener('blur', onBlur);

    var io = null;
    if (!fine.matches && 'IntersectionObserver' in global) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { play(); io.disconnect(); } });
      }, { threshold: 0.6 });
      io.observe(root);
    }

    function destroy() {
      state = 'rest'; cancelAnimationFrame(raf);
      anims.forEach(function (a) { a.cancel(); }); anims = []; counter = null; paintCount();
      if (io) io.disconnect();
      if (ro) ro.disconnect();
      link.removeEventListener('pointerenter', onEnter);
      link.removeEventListener('pointerleave', onLeave);
      link.removeEventListener('focus', onFocus);
      link.removeEventListener('blur', onBlur);
    }

    return { play: play, settle: settle, destroy: destroy, duration: Math.round(DURATION * S), get state() { return state; } };
  }

  global.ComplianceThumb = { mount: mount, EASE: EASE };
})(window);
