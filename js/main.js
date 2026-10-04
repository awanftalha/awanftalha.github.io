/* =========================================================================
   Site — motion and interaction, for Home and the case study pages.
   H-codes follow the margin markers on the Figma Home page, C-codes those on
   the "Case study template" page. CS- and MC-codes follow the build notes of
   the two long-form case studies in NGFT_design (offer page, manual
   compliance check). S-codes are defined in css/motion.css.
   All timings read from the tokens in css/tokens.css, so changing a token
   there retimes everything here.
   ========================================================================= */

(() => {
  'use strict';

  window.__motion = true; // tells the <head> failsafe that we're running

  const root = document.documentElement;
  const MOTION = root.classList.contains('motion');
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches; // S12

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const styles = getComputedStyle(root);
  const token = (name) => {
    const raw = styles.getPropertyValue(name).trim();
    const value = parseFloat(raw);
    return raw.endsWith('ms') ? value : value * 1000;
  };

  const T = {
    fast: token('--dur-fast'),
    slow: token('--dur-slow'),
    slower: token('--dur-slower'),
    count: token('--dur-count'),
    stagger: token('--stagger'),
    word: token('--stagger-word'),
    ruleLead: token('--rule-lead'),
  };

  const after = (ms, fn) => window.setTimeout(fn, ms);

  /* ==== Interaction (runs with or without motion) ====================== */

  // H1 / C1 · Nav — S5 sticky, plus the small-screen menu
  const nav = $('[data-nav]');
  if (nav) {
    const setStuck = () => nav.classList.toggle('is-stuck', window.scrollY > 4);
    setStuck();
    window.addEventListener('scroll', setStuck, { passive: true });

    const setNavBottom = () => root.style.setProperty('--nav-bottom', `${nav.offsetHeight}px`);
    setNavBottom();
    window.addEventListener('resize', setNavBottom);

    const toggle = $('[data-nav-toggle]', nav);
    const menu = $('#nav-menu');
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => {
      if (e.matches) setOpen(false);
    });
  }

  // H9 · Email — S3. Click copies; the label reads "Copied" for 1.6s.
  const copyStatus = $('[data-copy-status]');
  $$('[data-copy-email]').forEach((button) => {
    const label = $('[data-copy-label]', button);
    const original = label.textContent;
    let timer;

    button.addEventListener('click', async () => {
      const address = button.dataset.copyEmail;
      if (!(await copyText(address))) {
        window.location.href = `mailto:${address}`;
        return;
      }
      label.textContent = 'Copied';
      if (copyStatus) copyStatus.textContent = 'Email address copied';
      clearTimeout(timer);
      timer = setTimeout(() => {
        label.textContent = original;
        if (copyStatus) copyStatus.textContent = '';
      }, 1600);
    });
  });

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Clipboard API is unavailable off https/localhost; fall back to a selection copy.
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.append(field);
      field.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      field.remove();
      return ok;
    }
  }

  // C6 · Flow stepper — tabs. Click or arrow keys select a step; the screen
  // and caption swap together. No autoplay.
  $$('[data-stepper]').forEach((flow) => {
    const list = $('[role="tablist"]', flow);
    const tabs = $$('[role="tab"]', flow);
    const panel = $('[role="tabpanel"]', flow);
    const screens = $$('[data-step-screen]', flow);
    const captions = $$('[data-step-caption]', flow);
    let current = Math.max(0, tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true'));
    let swapTimer;

    // Preload all five screens: nothing in the stage waits to be scrolled to.
    $$('img', flow).forEach((img) => { img.loading = 'eager'; });

    const select = (next, { focus = false } = {}) => {
      if (focus) tabs[next].focus();
      if (next === current) return;
      const prev = current;
      current = next;

      tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === next));
        tab.tabIndex = i === next ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', tabs[next].id);

      // Out: the old screen and caption leave, --dur-fast. In: the new ones arrive.
      clearTimeout(swapTimer);
      [screens, captions].forEach((set) => {
        set.forEach((el, i) => { if (i !== prev) el.classList.remove('is-active', 'is-leaving'); });
        set[prev]?.classList.remove('is-active');
        set[prev]?.classList.add('is-leaving');
      });
      swapTimer = after(T.fast, () => {
        [screens, captions].forEach((set) => {
          set[prev]?.classList.remove('is-leaving');
          set[next]?.classList.add('is-active');
        });
      });

      // On narrow screens the steps scroll sideways; keep the chosen one in view.
      if (list.scrollWidth > list.clientWidth) {
        const tab = tabs[next];
        const left = tab.offsetLeft - list.offsetLeft - parseFloat(getComputedStyle(list).paddingLeft);
        list.scrollTo({ left, behavior: MOTION ? 'smooth' : 'auto' });
      }
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(i));
      tab.addEventListener('keydown', (e) => {
        const moves = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in moves)) return;
        e.preventDefault();
        select((moves[e.key] + tabs.length) % tabs.length, { focus: true });
      });
    });
  });

  // CS5 · Side nav — scroll spy, one sliding indicator, smooth jumps.
  // Below 1024px the same links render as a chip bar under the Nav.
  const toc = $('[data-toc]');
  if (toc) {
    const links = $$('.toc__link', toc);
    const list = $('.toc__list', toc);
    const indicator = $('[data-toc-indicator]', toc);
    const sections = links.map((link) => document.getElementById(link.hash.slice(1)));
    let active = Math.max(0, links.findIndex((link) => link.getAttribute('aria-current') === 'true'));

    const moveIndicator = () => {
      const link = links[active];
      if (!indicator || !link) return;
      indicator.style.setProperty('--y', `${link.offsetTop}px`);
      indicator.style.setProperty('--h', `${link.offsetHeight}px`);
    };

    const setActive = (index) => {
      if (index < 0) return;
      active = index;
      links.forEach((link, i) => {
        if (i === index) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
      moveIndicator();

      // Chip bar: keep the active chip in view.
      if (list.scrollWidth > list.clientWidth) {
        const item = links[index].parentElement;
        const left = item.offsetLeft - list.offsetLeft - (list.clientWidth - item.offsetWidth) / 2;
        list.scrollTo({ left: Math.max(0, left), behavior: REDUCE ? 'auto' : 'smooth' });
      }
    };

    // The section crossing the band 45–50% down the viewport is current.
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(sections.indexOf(entry.target));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((section) => { if (section) spy.observe(section); });

    moveIndicator();
    window.addEventListener('resize', moveIndicator);
    if (document.fonts) document.fonts.ready.then(moveIndicator);

    // Click: smooth scroll (instant under S12), update the URL, focus the heading.
    links.forEach((link, i) => {
      link.addEventListener('click', (e) => {
        const target = sections[i];
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', link.hash);
        $('.cs-section__title', target)?.focus({ preventScroll: true });
        setActive(i);
      });
    });

    $('[data-to-top]', toc)?.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' });
      history.replaceState(null, '', window.location.pathname + window.location.search);
    });
  }

  // CS7 / MC9 · Screens — click (or Enter/Space) opens a full-size lightbox.
  // A native modal <dialog> keeps focus inside; Esc or a click closes it.
  // MC12 · Screens that share a data-zoom-group page through the set: the
  // pager's buttons or the arrow keys, with a "3 of 6" counter.
  const lightbox = $('[data-lightbox]');
  if (lightbox && typeof lightbox.showModal === 'function') {
    const bigImg = document.createElement('img');
    bigImg.className = 'lightbox__img';
    bigImg.alt = '';
    $('[data-lightbox-frame]', lightbox).append(bigImg);
    const closeButton = $('[data-lightbox-close]', lightbox);
    const pager = $('[data-lightbox-pager]', lightbox);
    const counter = $('[data-lightbox-count]', lightbox);
    const groups = new Map();
    let opener = null;
    let trigger = null;
    let group = null;
    let index = 0;
    let closeTimer;

    const show = (el) => {
      const img = $('img', el);
      bigImg.src = img.currentSrc || img.src;
      bigImg.alt = img.alt;
      if (group) counter.textContent = `${index + 1} of ${group.length}`;
    };

    const step = (by) => {
      if (!group) return;
      index = (index + by + group.length) % group.length;
      opener = group[index];
      show(opener);
    };

    const open = (el) => {
      clearTimeout(closeTimer);
      group = (pager && groups.get(el.dataset.zoomGroup)) || null;
      index = group ? group.indexOf(el) : 0;
      if (pager) pager.hidden = !group;
      lightbox.classList.toggle('is-grouped', Boolean(group));
      show(el);
      opener = el;
      trigger = el;
      lightbox.classList.remove('is-closing');
      lightbox.showModal();
      root.style.overflow = 'hidden';
      closeButton.focus();
      requestAnimationFrame(() => requestAnimationFrame(() => lightbox.classList.add('is-open')));
    };

    const close = () => {
      if (!lightbox.open || lightbox.classList.contains('is-closing')) return;
      lightbox.classList.remove('is-open');
      lightbox.classList.add('is-closing');
      closeTimer = after(REDUCE ? 0 : T.fast, () => {
        lightbox.close();
        lightbox.classList.remove('is-closing');
        root.style.overflow = '';
        // Paged to a different screen? Focus that one, scrolling it into view.
        opener?.focus({ preventScroll: opener === trigger });
      });
    };

    lightbox.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    lightbox.addEventListener('click', close);
    pager?.addEventListener('click', (e) => e.stopPropagation());
    $('[data-lightbox-prev]', lightbox)?.addEventListener('click', () => step(-1));
    $('[data-lightbox-next]', lightbox)?.addEventListener('click', () => step(1));
    lightbox.addEventListener('keydown', (e) => {
      if (!group || !(e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return;
      e.preventDefault();
      step(e.key === 'ArrowRight' ? 1 : -1);
    });

    // Only screens that actually hold an image become zoomable.
    $$('[data-zoom]').forEach((el) => {
      const img = $('img', el);
      if (!img) return;
      const name = el.dataset.zoomGroup;
      if (name) groups.set(name, [...(groups.get(name) || []), el]);
      el.classList.add('is-zoomable');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-haspopup', 'dialog');
      el.setAttribute('aria-label', `Enlarge screen: ${img.alt}`);
      el.tabIndex = 0;
      el.addEventListener('click', () => open(el));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(el);
        }
      });
    });
  }

  // Placeholder links (href="#todo-…") stay put until the real URL is filled in.
  document.addEventListener('click', (e) => {
    if (e.target.closest('a[href^="#todo"]')) e.preventDefault();
  });

  // H5 · Offer card thumbnail — hover (or Tab to the card) replays the case
  // study over the finished screen; touch plays it once when 60% in view.
  // Mounted within 300px of the viewport, so the empty-form image only loads
  // when it might play. Under S12 it never mounts and the poster is the card.
  const offerThumb = $('[data-wt="offer"]');
  if (offerThumb && window.WorkThumb && !REDUCE) {
    const mountThumb = () => WorkThumb.mount(offerThumb, WorkThumb.OFFER, {
      final: 'assets/work/priced-offer/offer-final.webp',
      base: 'assets/work/priced-offer/offer-base.webp',
    });
    if ('IntersectionObserver' in window) {
      const near = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        near.disconnect();
        mountThumb();
      }, { rootMargin: '300px 0px' });
      near.observe(offerThumb);
    } else {
      mountThumb();
    }
  }

  // H5 · Compliance card motion graphic — the inline SVG is the finished frame;
  // hover (or Tab) replays how it got there, leaving mid-play fast-forwards to
  // the end, touch plays it once when 60% in view. Mounted even under S12: it
  // never plays then, but it still switches narrow cards to the compact layout.
  const complianceThumb = $('[data-mg="compliance"]');
  if (complianceThumb && window.ComplianceThumb) ComplianceThumb.mount(complianceThumb);

  // H5 · SMS card motion graphic — at rest the closed report; hover (or Tab)
  // takes SR-2026-0142 through all five steps. speed 1.6 is about 17.4s, much
  // slower than the handoff's default 0.72 (7.9s), so each step can be read.
  // Leaving fast-forwards to the closed frame; touch plays it once in view.
  // Mounted under S12 too, for the compact layout on narrow cards.
  const smsThumb = $('[data-sd="sms"]');
  if (smsThumb && window.SmsThumb) SmsThumb.mount(smsThumb, { speed: 1.6 });

  // H5 · Instructor card motion graphic — at rest the signed tablet over the
  // put-down paper; hover (or Tab) plays paper → tablet → graded mid-exercise →
  // signed, about 8.9s at the handoff's speed (1). Leaving fast-forwards to the
  // signed frame; touch plays it once in view. Mounted under S12 too, for the
  // compact layout on narrow cards.
  const tabletThumb = $('[data-tb="tablet"]');
  if (tabletThumb && window.TabletThumb) TabletThumb.mount(tabletThumb);

  // H5 · Training card motion graphic — at rest the complete record, signed off
  // and written to the roster; hover (or Tab) fills it session by session, clears
  // the repeats, counts the outstanding checks to zero, unlocks, signs and writes
  // the validity, about 7.2s at the handoff's speed (1). Leaving fast-forwards to
  // the end; touch plays it once in view. Mounted under S12 too, for the compact
  // layout on narrow cards.
  const trainingThumb = $('[data-tr="training"]');
  if (trainingThumb && window.TrainingThumb) TrainingThumb.mount(trainingThumb);

  // H5 · HX Insight card motion graphic — at rest all four flows finished;
  // hover (or Tab) plays leave, resourcing, onboarding and attendance in turn,
  // about 9.3s at the handoff's speed (1). Leaving fast-forwards to the end;
  // touch plays it once in view. Mounted under S12 too, for the compact layout
  // on narrow cards.
  const hxThumb = $('[data-hx="hx-insight"]');
  if (hxThumb && window.HxThumb) HxThumb.mount(hxThumb);

  if (!MOTION) return;

  /* ==== Motion helpers ================================================== */

  // Start an entrance. The delay rides on --d so CSS owns the timing curve.
  function play(el, delay = 0) {
    if (!el) return;
    el.style.setProperty('--d', `${Math.round(delay)}ms`);
    el.classList.add('is-in');
  }

  // S9 · draw an element's top rule
  function drawRule(el, delay = 0) {
    if (!el) return;
    el.style.setProperty('--rule-d', `${Math.round(delay)}ms`);
    el.classList.add('rule-in');
  }

  // Fire once, when an element comes into view.
  function onEnter(el, fn, { threshold = 0, rootMargin = '0px 0px -12% 0px' } = {}) {
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        io.disconnect();
        fn();
      }
    }, { threshold, rootMargin });
    io.observe(el);
  }

  // A ratio the element can actually reach, even when it's taller than the screen.
  const reachable = (el, ratio) => Math.min(ratio, (window.innerHeight / el.offsetHeight) * 0.9);

  // On-load intros wait for the webfonts (capped) so nothing rises in a fallback face.
  function afterFonts(fn) {
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise((r) => setTimeout(r, 700))]).then(() => {
      requestAnimationFrame(() => requestAnimationFrame(fn));
    });
  }

  // S11 · split each [data-s11] group into masked words
  $$('[data-s11]').forEach((group) => {
    const words = group.textContent.trim().split(/\s+/);
    group.textContent = '';
    words.forEach((word, i) => {
      const mask = document.createElement('span');
      const inner = document.createElement('span');
      mask.className = 'w';
      inner.textContent = word;
      inner.addEventListener('transitionend', () => mask.classList.add('is-done'), { once: true });
      mask.append(inner);
      group.append(mask);
      if (i < words.length - 1) group.append(' ');
    });
    group.classList.add('is-split');
  });

  // S11 · play every word in scope, in document order. Returns when the last one lands.
  function playWords(scope, start = 0) {
    const masks = $$('.w', scope);
    masks.forEach((mask, i) => play(mask, start + i * T.word));

    // Accent word: enters in ink, turns accent 200ms after it lands.
    $$('[data-s11="accent"]', scope).forEach((word) => {
      const index = masks.indexOf($('.w', word));
      after(start + index * T.word + T.slow + 200, () => word.classList.add('is-accent'));
    });

    return start + (masks.length - 1) * T.word + T.slow;
  }

  // S10 · count up from 0. Width is held at the final number so nothing shifts.
  // Only the site's own .count spans: the SMS card's SVG has data-count hooks too.
  $$('.count[data-count]').forEach((el) => { el.textContent = '0'; });

  function countUp(el) {
    if (!el) return Promise.resolve();
    const target = parseInt(el.dataset.count, 10);
    el.textContent = String(target);
    el.style.minWidth = `${el.getBoundingClientRect().width}px`;
    el.textContent = '0';

    return new Promise((resolve) => {
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / T.count);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) {
          requestAnimationFrame(tick);
        } else {
          el.style.minWidth = '';
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
  }

  /* ==== Shared: outcome grids (Home H3, Case study C4) ================== */

  $$('[data-outcomes]').forEach((grid) => {
    onEnter(grid, () => {
      drawRule(grid, 0);                                  // top ink rule S9
      $$('.outcome', grid).forEach((column, i) => {
        const start = T.ruleLead + i * 80;                // columns S6, 80ms left to right
        play(column, start);
        $$('[data-seq] > [data-s6]', column).forEach((piece, j) => {
          play(piece, start + j * 120);                   // C4 "2 → 1": 2, arrow, 1, 120ms apart
        });
        const count = $('[data-count]', column);
        if (count) {                                      // S10, then the last line, --dur-fast
          after(start, () => countUp(count).then(() => play($('[data-after-count]', column))));
        }
      });
    }, { threshold: reachable(grid, 0.5), rootMargin: '0px' });  // grid 50% in view
  });

  /* ==== Home ============================================================ */

  // H2 · Hero intro — on load, above the fold
  const hero = $('[data-hero]');
  if (hero) {
    afterFonts(() => {
      play($('[data-fade]', hero), 0);                    // Eyebrow: opacity, --dur-slow, delay 0
      playWords($('h1', hero), 0);                        // Headline: S11 per word, line 1 then 2
      play($('[data-pop]', hero), 180);                   // Photo: scale 0.6 → 1 + opacity, 180ms
      const row = $('.hero__row', hero);
      drawRule(row, 500);                                 // Row: top rule S9 at 500ms
      $$('[data-s6]', row).forEach((el, i) => play(el, 600 + i * T.stagger)); // Subtext, CTAs: S6 at 600ms
    });
  }

  // H3 · My work heading — S6 as it enters
  const outcomesHead = $('[data-outcomes-head]');
  onEnter(outcomesHead, () => {
    $$('[data-s6]', outcomesHead).forEach((el, i) => play(el, i * T.stagger));
  });

  // H5 · Work cards
  $$('[data-card-row]').forEach((row) => {
    onEnter(row, () => {
      $$('[data-s7]', row).forEach((card, i) => {
        const start = i * 100;                            // right card 100ms after the left
        play(card, start);                                // S7
        $$('[data-s6]', card).forEach((el, j) => {        // Info S6 after 120ms
          play(el, start + 120 + j * T.stagger);
        });
      });
    });
  });

  // H7 · Approach
  const approachHead = $('[data-approach-head]');
  onEnter(approachHead, () => {
    $$('[data-s6]', approachHead).forEach((el, i) => play(el, i * T.stagger));
  });

  const principles = $('[data-principles]');
  onEnter(principles, () => {
    $$('.principle', principles).forEach((row, i) => {
      const start = i * 100;                              // rows 100ms apart
      drawRule(row, start);                               // ink rule S9 first
      $$('[data-s6]', row).forEach((el, j) => {           // then number, title, body S6
        play(el, start + T.ruleLead + j * T.stagger);
      });
    });
  });

  // H8 · About
  const portrait = $('[data-clip]');
  onEnter(portrait, () => play(portrait));                // clip-path wipe, --ease-in-out

  const aboutIntro = $('[data-about-intro]');
  onEnter(aboutIntro, () => {
    $$('[data-s6]', aboutIntro).forEach((el, i) => play(el, i * T.stagger));
  });

  const experience = $('[data-experience]');
  onEnter(experience, () => {
    play($('.experience__label', experience), 0);
    $$('.job', experience).forEach((job, i) => {
      const start = (i + 1) * T.stagger;
      drawRule(job, start);                               // rule S9 first
      play($('[data-s6]', job), start + T.ruleLead);      // then the row S6
    });
  });

  const aboutActions = $('[data-about-actions]');
  onEnter(aboutActions, () => {
    $$('[data-s6]', aboutActions).forEach((el, i) => play(el, i * T.stagger));
  });

  // H9 · Contact
  const contact = $('[data-contact]');
  if (contact) {
    let ruleStartedAt = null;
    const startRule = () => {
      if (ruleStartedAt !== null) return;
      drawRule(contact, 0);                               // section top rule S9 first
      ruleStartedAt = performance.now();
    };
    onEnter(contact, startRule);

    const title = $('.contact__title', contact);
    onEnter(title, () => {
      startRule();
      const lead = Math.max(0, T.ruleLead - (performance.now() - ruleStartedAt));
      const landed = playWords(title, lead);              // S11; "usable" is the accent word
      $$('[data-s6]', contact).forEach((el, i) => {
        play(el, landed - T.slow / 2 + i * T.stagger);
      });
    }, { threshold: reachable(title, 0.4), rootMargin: '0px' });
  }

  // H10 · Footer — no entrance.

  /* ==== Case study ====================================================== */

  // C2 · Header and C3 · Hero image — both on load
  const csHeader = $('[data-cs-header]');
  if (csHeader) {
    afterFonts(() => {
      playWords($('.cs-title', csHeader), 0);             // Title: S11 on load
      play($('.cs-subtitle', csHeader), 100);             // MC2 subtitle (not in the notes): S6, ahead of the lede
      play($('.cs-lede', csHeader), 200);                 // Lede: S6, delay 200ms
      const meta = $('.cs-meta', csHeader);
      drawRule(meta, 300);                                // Meta: top rule S9,
      $$('[data-s6]', meta).forEach((el, i) => {          // then columns S6, --stagger
        play(el, 300 + T.ruleLead + i * T.stagger);
      });
      play($('[data-cs-hero]'), 300);                     // C3 / CS3: S7, delay 300ms
      play($('.cs-hero__caption'), 300 + 120);            // its caption follows the panel
    });
  }

  // IT3 · Hero triptych — on load: the panel fades (--dur-slow); the three
  // screens rise 40px in order, 120ms apart; each caption fades in after its
  // screen (--dur-fast). No parallax.
  const triptych = $('[data-triptych]');
  if (triptych) {
    afterFonts(() => {
      play($('[data-fade]', triptych), 300);
      $$('.triptych__item', triptych).forEach((item, i) => {
        const at = 300 + i * 120;
        play($('[data-rise]', item), at);
        play($('[data-fade-fast]', item), at + T.slow);
      });
    });
  }

  // C5 · Problem — paragraphs S6; Before image S7 (no shadow); caption follows it
  const problemText = $('[data-problem-text]');
  onEnter(problemText, () => {
    $$('[data-s6]', problemText).forEach((el, i) => play(el, i * T.stagger));
  });

  const before = $('[data-before]');
  onEnter(before, () => {
    play($('[data-s7]', before), 0);
    play($('[data-s6]', before), T.stagger * 2);
  });

  // C7 · Failure states — heading S6; cards S7, 80ms apart in reading order;
  // each marker scales in once its card lands
  const statesHead = $('[data-states-head]');
  onEnter(statesHead, () => play(statesHead));

  $$('[data-states-row]').forEach((row) => {
    onEnter(row, () => {
      $$('.state', row).forEach((card, i) => {
        const start = i * 80;
        play(card, start);
        play($('[data-marker]', card), start + T.slow);
      });
    });
  });

  // C8 · Constraints — each row: top rule S9, then its text S6, --stagger
  const constraints = $('[data-constraints]');
  onEnter(constraints, () => {
    $$('.constraint', constraints).forEach((row, i) => {
      const start = i * T.stagger;
      drawRule(row, start);
      play($('[data-s6]', row), start + T.ruleLead);
    });
  });

  // C9 · Next case study — S6
  const next = $('[data-next]');
  onEnter(next, () => play(next));

  /* ==== Long-form case studies (CS- and MC-codes) ======================== */

  // CS4 · By the numbers — row rules S9; tiles S6, --stagger, row 1 then row 2;
  // 8, 60, 16 and 50 count up (S10); ranges and arrows only fade (S6).
  const numbers = $('[data-numbers]');
  onEnter(numbers, () => {
    let k = 0;
    $$('.numbers__row', numbers).forEach((row) => {
      drawRule(row, k * T.stagger);
      $$('.numbers__tile', row).forEach((tile) => {
        const start = T.ruleLead + k * T.stagger;
        play(tile, start);
        const count = $('[data-count]', tile);
        if (count) after(start, () => countUp(count));
        k += 1;
      });
    });
  });

  // CS6 · Sections — top ink rule S9 first, then overline, heading and lede S6.
  const sectionStarts = new Map();
  const headOf = (section) => $$(':scope > [data-s6]:not([data-block])', section);

  const startSection = (section) => {
    if (!section || sectionStarts.has(section)) return;
    sectionStarts.set(section, performance.now());
    drawRule(section, 0);
    headOf(section).forEach((el, i) => play(el, T.ruleLead + i * T.stagger));
  };

  $$('.cs-section').forEach((section) => onEnter(section, () => startSection(section)));

  // Blocks enter as they reach the viewport, but never ahead of their section's head.
  // A block marked data-follows also waits for the block before it to finish
  // (MC8, MC10: the figure after the steps and after the failure table).
  const blockEnds = new Map();

  $$('[data-block]').forEach((block) => {
    onEnter(block, () => {
      const section = block.closest('.cs-section');
      startSection(section);
      const headEnd = section
        ? sectionStarts.get(section) + T.ruleLead + headOf(section).length * T.stagger
        : 0;
      const now = performance.now();
      let delay = Math.max(0, headEnd - now);
      const kind = block.dataset.block;
      const endsAt = (ms) => blockEnds.set(block, now + ms);   // when its last piece starts

      if (block.hasAttribute('data-follows')) {
        const prevEnd = blockEnds.get(block.previousElementSibling);
        if (prevEnd !== undefined) delay = Math.max(delay, prevEnd + T.stagger - now);
      }

      if (kind === 'stagger') {
        // Columns, table rows, list items: S6, 40ms apart
        $$('[data-s6]', block).forEach((el, i) => play(el, delay + i * 40));
      } else if (kind === 'screen') {
        // CS7 / MC9: the panel fades, the screen rises 40px inside it; caption follows.
        // SM8: a caption marked data-fade-fast waits for the screen to land.
        play($('[data-s7="screen"]', block), delay);
        play($('figcaption[data-s6]', block), delay + T.stagger * 2);
        play($('figcaption[data-fade-fast]', block), delay + T.slower);
      } else if (kind === 'decision') {
        // SM8: top rule S9, then label, title and body S6; the screen below
        // follows (data-follows)
        drawRule(block, delay);
        let last = delay;
        $$('[data-s6]', block).forEach((el, j) => {
          last = delay + T.ruleLead + j * T.stagger;
          play(el, last);
        });
        endsAt(last);
      } else if (kind === 'screenstep') {
        // IT7: top rule S9, then number, title and body S6; then the panel S7
        drawRule(block, delay);
        const pieces = $$('.screen-step__text [data-s6]', block);
        pieces.forEach((el, j) => play(el, delay + T.ruleLead + j * T.stagger));
        play($('[data-s7="screen"]', block), delay + T.ruleLead + pieces.length * T.stagger);
      } else if (kind === 'measures') {
        // SM11: each row's top rule S9, then both cells S6; rows --stagger apart
        $$('[data-rule]', block).forEach((row, i) => {
          const start = delay + i * T.stagger;
          drawRule(row, start);
          $$('[data-s6]', row).forEach((el) => play(el, start + T.ruleLead));
        });
      } else if (kind === 'numbers') {
        // MC6: tiles S6, --stagger, row 1 then row 2; a number counts up (S10)
        // as its tile starts. "5–6" and "Zero" have no data-count, so only fade.
        $$('.numbers__tile', block).forEach((tile, i) => {
          const start = delay + i * T.stagger;
          play(tile, start);
          const count = $('[data-count]', tile);
          if (count) after(start, () => countUp(count));
        });
      } else if (kind === 'callout') {
        // MC7 / SM6: the bar draws (--dur-slow); the text is S6 once it's
        // halfway (the SM6 big quote rises word by word, S11 instead); the
        // source line fades in after the text
        play(block, delay);
        const textAt = delay + T.slow / 2;
        const words = $('[data-s11]', block);
        let landed = textAt + T.slow;
        if (words) {
          landed = playWords(words, textAt);
        } else {
          const lines = $$('[data-s6]', block);      // TM11 caveat: a title, then its text
          lines.forEach((el, i) => play(el, textAt + i * T.stagger));
          landed = textAt + (lines.length - 1) * T.stagger + T.slow;
        }
        play($('[data-fade-fast]', block), landed);
      } else if (kind === 'steps') {
        // MC8: each row's top rule S9, then number, title and body S6;
        // rows --stagger apart
        let last = delay;
        $$('.flow-step', block).forEach((row, i) => {
          const start = delay + i * T.stagger;
          drawRule(row, start);
          $$('[data-s6]', row).forEach((el, j) => {
            last = start + T.ruleLead + j * T.stagger;
            play(el, last);
          });
        });
        endsAt(last);
      } else if (kind === 'table') {
        // MC10: head row rule S9, labels S6; rows S6 in order, 40ms apart
        drawRule(block, delay);
        $$('thead [data-s6]', block).forEach((el) => play(el, delay + T.ruleLead));
        const rows = $$('tbody [data-s6]', block);
        rows.forEach((row, i) => play(row, delay + T.ruleLead + (i + 1) * 40));
        endsAt(delay + T.ruleLead + rows.length * 40);
      } else if (kind === 'lists') {
        // MC11: "What shipped" first, the second list 120ms later; items S6,
        // 60ms apart; each marker scales in once its row has landed
        $$('.claim-list', block).forEach((list, j) => {
          const start = delay + j * 120;
          play($('.claim-list__label', list), start);
          $$('.claim-list__item', list).forEach((item, i) => {
            const at = start + (i + 1) * 60;
            play(item, at);
            play($('[data-marker]', item), at + T.slow);
          });
        });
      } else if (kind === 'grid') {
        // MC12: cells S7 in reading order, --stagger apart, each one as it
        // comes into view. One observer, so cells that arrive together can be
        // sorted into page order.
        // A grid can set its own gap between cells (TM10: 40ms for sixteen).
        const cells = $$('[data-s7="cell"]', block);
        const gap = Number(block.dataset.stagger) || T.stagger;
        let lastAt = -Infinity;
        const io = new IntersectionObserver((entries) => {
          const t = performance.now();
          entries
            .filter((entry) => entry.isIntersecting)
            .map((entry) => entry.target)
            .sort((a, b) => cells.indexOf(a) - cells.indexOf(b))
            .forEach((cell) => {
              io.unobserve(cell);
              const at = Math.max(t, headEnd, lastAt + gap);
              lastAt = at;
              play(cell, at - t);
            });
        }, { rootMargin: '0px 0px -12% 0px' });
        cells.forEach((cell) => io.observe(cell));
      } else {
        // Tint, dark and accent-bordered panels, and single lines: S6 as one unit
        play(block, delay);
        if (block.hasAttribute('data-claim')) {
          after(delay, () => countUp($('[data-count]', block)));   // CS8: 0 → 50
        }
      }
    });
  });

  // C10 / CS10 · Footer — no entrance.
})();
