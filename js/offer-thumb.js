/* ==========================================================================
   Work thumbnail · Offer page
   Plays a ~2.8s replay of "a phone call becomes a priced offer" over the real
   SENTRY OPS screen. Rest state = finished screen (poster). Hover / focus plays,
   leaving restores the poster. Touch: plays once when 60% in view.
   Reduced motion: never plays.

   Usage:
     <a class="work-card" href="/work/offer-page">
       <div class="wt" data-wt="offer">
         <div class="wt__screen">
           <img class="wt__img wt__poster" src="/thumbs/offer-final.webp" alt="…">
         </div>
       </div>
     </a>
     WorkThumb.mount(document.querySelector('[data-wt="offer"]'), WorkThumb.OFFER, {
       final: '/thumbs/offer-final.webp', base: '/thumbs/offer-base.webp'
     });
   ========================================================================== */
(function (global) {
  'use strict';

  var EASE = {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',      /* --ease-out */
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',   /* --ease-in-out */
    press: 'cubic-bezier(0.2, 0, 0, 1)'        /* --ease-press */
  };

  /* ------------------------------------------------------------------------
     Offer page config. Coordinates are native px on the 1680 x 1084 screen
     (Figma: NGFT_design › playground › "Offer 44532-10 — Job & client",
     as used in the case study hero). Times are ms from play start.
     ------------------------------------------------------------------------ */
  var OFFER = {
    speed: 1,            /* multiply every time; 0.85 = snappier */
    duration: 2900,
    chip: {
      ring: 'Incoming call',
      live: 'On the call \u00b7 Thomas Bruger, Alpine Rescue',
      done: 'Offer sent \u00b7 client still on the line',
      liveAt: 420,
      doneAt: 2600
    },
    /* rectangles cut from the finished screen */
    regions: {
      client:   { x: 442, y: 458, w: 724, h: 104 },
      offerNo:  { x: 498, y: 566, w: 296, h: 24 },
      contact:  { x: 442, y: 650, w: 724, h: 76 },
      fl1:      { x: 8,   y: 208, w: 280, h: 40 },
      fl2:      { x: 8,   y: 248, w: 280, h: 40 },
      jobNote:  { x: 1044, y: 224, w: 268, h: 64 },
      crewNote: { x: 1044, y: 364, w: 268, h: 64 },
      att1:     { x: 1037, y: 523, w: 115, h: 26 },
      att2:     { x: 1156, y: 523, w: 115, h: 26 },
      leg1:     { x: 1366, y: 421, w: 300, h: 22 },
      leg2:     { x: 1366, y: 443, w: 300, h: 22 },
      sub:      { x: 1366, y: 484, w: 300, h: 22 },
      dsc:      { x: 1366, y: 506, w: 300, h: 22 },
      hdrFinal:   { x: 1324, y: 74, w: 110, h: 28 },
      totalFinal: { x: 1578, y: 544, w: 88, h: 32 }
    },
    /* typed values: w is the width of the glyphs, n the character count */
    typed: {
      project:  { x: 450, y: 206, w: 147, h: 22, n: 19 },
      jobName:  { x: 450, y: 248, w: 179, h: 22, n: 25 },
      location: { x: 450, y: 290, w: 268, h: 22, n: 38 },
      manager:  { x: 450, y: 332, w: 70,  h: 22, n: 9 },
      language: { x: 738, y: 332, w: 52,  h: 22, n: 7 },
      curr:     { x: 1486, y: 156, w: 33, h: 22, n: 3 },
      rate:     { x: 1486, y: 194, w: 26, h: 22, n: 3 },
      fuel:     { x: 1486, y: 254, w: 40, h: 22, n: 4 },
      terms:    { x: 1486, y: 292, w: 83, h: 22, n: 11 },
      disc:     { x: 1486, y: 330, w: 24, h: 22, n: 2 }
    },
    total: 37050,
    meter: [
      { x: 1368, w: 138, color: '#1868DB' },
      { x: 1508, w: 156, color: '#BD5B00' }
    ],
    lozenge: { fromW: 57, toW: 47, toBg: '#E9F2FE' },
    beats: [
      /* 1 · the call comes in */
      { at: 0,    kind: 'chip-in' },
      /* 2 · the client is found while they talk */
      { at: 460,  kind: 'rise',  id: 'client',  dur: 300 },
      { at: 600,  kind: 'fade',  id: 'offerNo', dur: 220 },
      { at: 900,  kind: 'rise',  id: 'contact', dur: 300 },
      /* 3 · the job is dictated */
      { at: 640,  kind: 'type',  id: 'project',  dur: 280 },
      { at: 780,  kind: 'type',  id: 'jobName',  dur: 320 },
      { at: 940,  kind: 'type',  id: 'location', dur: 380 },
      { at: 1120, kind: 'type',  id: 'manager',  dur: 150 },
      { at: 1200, kind: 'type',  id: 'language', dur: 120 },
      { at: 1260, kind: 'lines', id: 'jobNote',  dur: 300 },
      { at: 1380, kind: 'lines', id: 'crewNote', dur: 300 },
      { at: 1520, kind: 'pop',   id: 'att1',     dur: 200 },
      { at: 1580, kind: 'pop',   id: 'att2',     dur: 200 },
      /* 4 · flights and commercial terms */
      { at: 1180, kind: 'slide', id: 'fl1', dur: 240 },
      { at: 1300, kind: 'slide', id: 'fl2', dur: 240 },
      { at: 1340, kind: 'type',  id: 'curr',  dur: 90 },
      { at: 1420, kind: 'type',  id: 'rate',  dur: 80 },
      { at: 1490, kind: 'type',  id: 'fuel',  dur: 100 },
      { at: 1560, kind: 'type',  id: 'terms', dur: 170 },
      { at: 1650, kind: 'type',  id: 'disc',  dur: 70 },
      /* 5 · it prices itself */
      { at: 1700, kind: 'grow',  seg: 0, dur: 320 },
      { at: 1900, kind: 'grow',  seg: 1, dur: 340 },
      { at: 1760, kind: 'fade',  id: 'leg1', dur: 200 },
      { at: 1960, kind: 'fade',  id: 'leg2', dur: 200 },
      { at: 1820, kind: 'count', dur: 820 },
      { at: 2120, kind: 'fade',  id: 'sub', dur: 200 },
      { at: 2180, kind: 'fade',  id: 'dsc', dur: 200 },
      /* 6 · sent, still on the call */
      { at: 2560, kind: 'press' },
      { at: 2640, kind: 'flip' }
    ]
  };

  function el(tag, cls, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }
  function setBox(e, r) {
    e.style.setProperty('--x', r.x);
    e.style.setProperty('--y', r.y);
    e.style.setProperty('--w', r.w);
    e.style.setProperty('--h', r.h);
  }
  function fmt(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function mount(root, cfg, assets) {
    var screen = root.querySelector('.wt__screen');
    var poster = root.querySelector('.wt__poster');
    var finalUrl = new URL(assets.final, document.baseURI).href;
    root.style.setProperty('--wt-final', 'url("' + finalUrl + '")');

    var reduce = global.matchMedia('(prefers-reduced-motion: reduce)');
    var S = cfg.speed || 1;
    var T = Math.round(cfg.duration * S);

    /* ---- build the played layer under the poster ---- */
    var layer = el('div', 'wt__layer', screen);
    var base = el('img', 'wt__img', layer);
    base.src = assets.base; base.alt = ''; base.decoding = 'async';

    var nodes = {};
    Object.keys(cfg.regions).forEach(function (k) {
      var r = el('div', 'wt__r', layer); setBox(r, cfg.regions[k]); nodes[k] = r;
    });
    var carets = {};
    Object.keys(cfg.typed).forEach(function (k) {
      var t = cfg.typed[k];
      var r = el('div', 'wt__r', layer); setBox(r, t); nodes[k] = r;
      var c = el('div', 'wt__caret', layer); setBox(c, t); carets[k] = c;
    });
    var segs = cfg.meter.map(function (m) {
      var s = el('div', 'wt__seg', layer);
      s.style.left = 'calc(' + m.x + ' * var(--u))';
      s.style.width = 'calc(' + m.w + ' * var(--u))';
      s.style.background = m.color;
      return s;
    });
    var hdr = el('div', 'wt__num wt__num--hdr', layer);
    hdr.innerHTML = '<small>CHF</small><span>' + fmt(cfg.total) + '</span>';
    var hdrNum = hdr.querySelector('span');
    var total = el('div', 'wt__num wt__num--total', layer);
    total.textContent = fmt(cfg.total);
    var loz = el('div', 'wt__loz', layer);
    loz.innerHTML = '<span class="is-from">Draft</span><span class="is-to">Sent</span>';
    var press = el('div', 'wt__press', layer);

    /* ---- the call chip, over the panel ---- */
    var chip = el('div', 'wt__chip', root);
    chip.setAttribute('aria-hidden', 'true');
    var labels = el('div', 'wt__chip-labels', chip);
    var lRing = el('span', 'wt__chip-label wt__chip-label--ring', labels);
    lRing.innerHTML = '<i class="wt__mark"></i>' + cfg.chip.ring;
    var lLive = el('span', 'wt__chip-label', labels);
    lLive.innerHTML = '<i class="wt__mark"></i>' + cfg.chip.live +
      '<span class="wt__wave"><i></i><i></i><i></i><i></i></span>';
    var lDone = el('span', 'wt__chip-label', labels);
    lDone.innerHTML = '<svg class="wt__check" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
      '<path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg>' +
      cfg.chip.done;

    var anims = [];
    var outs = [];
    var counter = null;
    var raf = 0;
    var state = 'rest';

    function add(target, keyframes, at, dur, easing, extra) {
      var opts = { delay: Math.round(at * S), duration: Math.max(1, Math.round(dur * S)), fill: 'both', easing: easing || EASE.out };
      if (extra) for (var k in extra) opts[k] = extra[k];
      var a = target.animate(keyframes, opts);
      anims.push(a);
      return a;
    }

    function chipWidths() {
      var pad = chip.offsetWidth - labels.offsetWidth;
      return [lRing, lLive, lDone].map(function (l) { return l.scrollWidth + pad; });
    }

    function build() {
      anims.forEach(function (a) { a.cancel(); });
      outs.forEach(function (a) { a.cancel(); });
      anims = []; outs = [];
      var u = screen.getBoundingClientRect().width / 1680;

      /* poster out */
      add(poster, [{ opacity: 1 }, { opacity: 0 }], 0, 160, 'linear');

      cfg.beats.forEach(function (b) {
        var n = b.id ? nodes[b.id] : null;
        switch (b.kind) {
          case 'fade':
            add(n, [{ opacity: 0 }, { opacity: 1 }], b.at, b.dur, 'linear'); break;
          case 'rise':
            add(n, [{ opacity: 0, transform: 'translateY(' + (10 * u) + 'px)' }, { opacity: 1, transform: 'none' }], b.at, b.dur); break;
          case 'slide':
            add(n, [{ opacity: 0, transform: 'translateX(' + (-10 * u) + 'px)' }, { opacity: 1, transform: 'none' }], b.at, b.dur); break;
          case 'pop':
            add(n, [{ opacity: 0, transform: 'scale(0.9)' }, { opacity: 1, transform: 'none' }], b.at, b.dur); break;
          case 'lines':
            add(n, [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], b.at, b.dur, 'steps(3, end)'); break;
          case 'type': {
            var t = cfg.typed[b.id];
            add(n, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], b.at, b.dur, 'steps(' + t.n + ', end)');
            add(carets[b.id], [{ transform: 'translateX(0)' }, { transform: 'translateX(' + ((t.w - 2) * u) + 'px)' }], b.at, b.dur, 'steps(' + t.n + ', end)');
            add(carets[b.id], [{ opacity: 0 }, { opacity: 1, offset: 0.001 }, { opacity: 1, offset: 0.999 }, { opacity: 0 }], b.at, b.dur + 140, 'linear');
            break;
          }
          case 'grow':
            add(segs[b.seg], [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], b.at, b.dur, EASE.inOut); break;
          case 'count': {
            add(hdr, [{ opacity: 0 }, { opacity: 1 }], b.at, 160, 'linear');
            add(total, [{ opacity: 0 }, { opacity: 1 }], b.at, 160, 'linear');
            counter = new Animation(new KeyframeEffect(null, [], { delay: Math.round(b.at * S), duration: Math.round(b.dur * S), fill: 'both' }), document.timeline);
            anims.push(counter);
            counter.play();
            /* settle on the exact pixels of the finished screen */
            var settle = b.at + b.dur;
            add(hdr, [{ opacity: 1 }, { opacity: 0 }], settle, 140, 'linear', { fill: 'forwards' });
            add(total, [{ opacity: 1 }, { opacity: 0 }], settle, 140, 'linear', { fill: 'forwards' });
            add(nodes.hdrFinal, [{ opacity: 0 }, { opacity: 1 }], settle, 140, 'linear');
            add(nodes.totalFinal, [{ opacity: 0 }, { opacity: 1 }], settle, 140, 'linear');
            break;
          }
          case 'press':
            add(press, [{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }], b.at, 320, EASE.press); break;
          case 'flip':
            add(loz, [{ width: (cfg.lozenge.fromW * u) + 'px', background: '#F0F1F2' }, { width: (cfg.lozenge.toW * u) + 'px', background: cfg.lozenge.toBg }], b.at, 260, EASE.inOut);
            add(loz.children[0], [{ transform: 'none' }, { transform: 'translateY(-100%)' }], b.at, 260, EASE.inOut);
            add(loz.children[1], [{ transform: 'translateY(100%)' }, { transform: 'none' }], b.at, 260, EASE.inOut);
            break;
          case 'chip-in': {
            var w = chipWidths();
            var tl = cfg.chip.liveAt, td = cfg.chip.doneAt, end = cfg.duration;
            var o = function (ms) { return Math.min(1, Math.max(0, ms / end)); };
            add(chip, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], b.at, 220);
            add(chip, [
              { width: w[0] + 'px', offset: 0 },
              { width: w[0] + 'px', offset: o(tl), easing: EASE.inOut },
              { width: w[1] + 'px', offset: o(tl + 220) },
              { width: w[1] + 'px', offset: o(td), easing: EASE.inOut },
              { width: w[2] + 'px', offset: o(td + 220) },
              { width: w[2] + 'px', offset: 1 }
            ], 0, end, 'linear');
            add(lRing, [{ opacity: 1 }, { opacity: 1, offset: o(tl) }, { opacity: 0, offset: o(tl + 120) }, { opacity: 0 }], 0, end, 'linear');
            add(lLive, [{ opacity: 0 }, { opacity: 0, offset: o(tl + 80) }, { opacity: 1, offset: o(tl + 220) }, { opacity: 1, offset: o(td) }, { opacity: 0, offset: o(td + 120) }, { opacity: 0 }], 0, end, 'linear');
            add(lDone, [{ opacity: 0 }, { opacity: 0, offset: o(td + 80) }, { opacity: 1, offset: o(td + 220) }, { opacity: 1 }], 0, end, 'linear');
            break;
          }
        }
      });
    }

    function paintCount() {
      if (!counter) return;
      var p = counter.effect.getComputedTiming().progress;
      if (p == null) p = counter.currentTime >= (counter.effect.getTiming().delay || 0) ? 1 : 0;
      var eased = 1 - Math.pow(1 - p, 3);
      var v = fmt(cfg.total * eased);
      hdrNum.textContent = v; total.textContent = v;
    }
    function loop() {
      paintCount();
      if (state === 'playing') raf = requestAnimationFrame(loop);
    }

    function play() {
      if (reduce.matches || state === 'playing') return;
      state = 'playing';
      root.classList.add('is-playing');
      build();
      cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
      Promise.all(anims.map(function (a) { return a.finished; })).then(function () {
        if (state === 'playing') { state = 'done'; paintCount(); root.classList.remove('is-playing'); root.dispatchEvent(new CustomEvent('wt:done')); }
      }, function () {});
    }

    function reset(instant) {
      if (state === 'rest') return;
      state = 'rest';
      root.classList.remove('is-playing');
      cancelAnimationFrame(raf);
      var out = outs = [
        poster.animate([{ opacity: getComputedStyle(poster).opacity }, { opacity: 1 }], { duration: instant ? 1 : 220, easing: 'linear', fill: 'forwards' }),
        chip.animate([{ opacity: getComputedStyle(chip).opacity }, { opacity: 0 }], { duration: instant ? 1 : 160, easing: 'linear', fill: 'forwards' })
      ];
      Promise.all(out.map(function (a) { return a.finished; })).then(function () {
        if (state !== 'rest') return;
        anims.forEach(function (a) { a.cancel(); });
        anims = []; counter = null;
        out.forEach(function (a) { a.cancel(); });
        outs = [];
        hdrNum.textContent = fmt(cfg.total); total.textContent = fmt(cfg.total);
      }, function () { /* a new play() cancelled the fade back; nothing to do */ });
    }

    /* scrub support for the review page */
    function seek(ms) {
      if (state === 'rest' || !anims.length) { state = 'paused'; build(); }
      state = 'paused';
      root.classList.add('is-playing');
      anims.forEach(function (a) { a.pause(); a.currentTime = ms; });
      paintCount();
    }

    /* ---- triggers ---- */
    var link = root.closest('a') || root;
    var finePointer = global.matchMedia('(hover: hover) and (pointer: fine)');
    var onEnter = function (e) { if (e.pointerType === 'mouse' || finePointer.matches) play(); };
    var onLeave = function (e) { if (e.pointerType === 'mouse' || finePointer.matches) reset(); };
    var onFocus = function () { if (link.matches(':focus-visible')) play(); };
    var onBlur = function () { reset(); };
    link.addEventListener('pointerenter', onEnter);
    link.addEventListener('pointerleave', onLeave);
    link.addEventListener('focus', onFocus);
    link.addEventListener('blur', onBlur);

    var io = null;
    if (!finePointer.matches && 'IntersectionObserver' in global) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { play(); io.disconnect(); } });
      }, { threshold: 0.6 });
      io.observe(root);
    }

    /* for SPA route changes: undo everything mount() added */
    function destroy() {
      state = 'rest';
      cancelAnimationFrame(raf);
      anims.concat(outs).forEach(function (a) { a.cancel(); });
      anims = []; outs = []; counter = null;
      if (io) io.disconnect();
      link.removeEventListener('pointerenter', onEnter);
      link.removeEventListener('pointerleave', onLeave);
      link.removeEventListener('focus', onFocus);
      link.removeEventListener('blur', onBlur);
      layer.remove(); chip.remove();
      root.classList.remove('is-playing');
      root.style.removeProperty('--wt-final');
    }

    return { play: play, reset: reset, seek: seek, destroy: destroy, duration: T, get state() { return state; } };
  }

  global.WorkThumb = { mount: mount, OFFER: OFFER, EASE: EASE };
})(window);
