// Case-study behaviour. Everything works without it (details open, images
// show, tables scroll); this adds motion, the lightbox and conveniences.

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'cubic-bezier(0.65, 0.01, 0.05, 0.99)';   // the homepage's "main" curve
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* 4.4 Loops: play only while at least 40% visible. Reduced motion: never
   autoplay; a small play button starts and stops it. */
function loops() {
  const videos = $$('[data-loop]');
  if (!videos.length) return;
  const mark = (v) => {
    const wrap = v.closest('.cs-device__screen');
    if (wrap) wrap.dataset.cursorText = v.paused ? 'Play' : '';
    if (!v.paused) wrap?.removeAttribute('data-cursor-text');
  };
  videos.forEach((v) => {
    v.addEventListener('play', () => mark(v));
    v.addEventListener('pause', () => mark(v));
    mark(v);
    const btn = v.parentElement.querySelector('[data-loop-play]');
    if (reduce && btn) {
      btn.hidden = false;
      btn.addEventListener('click', () => (v.paused ? v.play() : v.pause()));
    }
  });
  if (reduce) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.intersectionRatio >= 0.4) v.play().catch(() => {});
      else v.pause();
    });
  }, { threshold: [0, 0.4, 1] });
  videos.forEach((v) => io.observe(v));
}

/* 4.3 Before/after slider: the range input drives the reveal. */
function beforeAfter() {
  $$('[data-ba]').forEach((stage) => {
    const range = stage.querySelector('[data-ba-range]');
    const set = () => stage.style.setProperty('--pos', `${range.value}%`);
    range.addEventListener('input', set);
    set();
  });
}

/* 4.12 Lightbox: native modal <dialog> (focus held inside, Esc closes),
   arrow keys move through the group, captions shown, focus returns. */
function lightbox() {
  const triggers = $$('[data-open]');
  if (!triggers.length) return;
  const dlg = document.createElement('dialog');
  dlg.className = 'cs-lightbox';
  dlg.setAttribute('aria-label', 'Image viewer');
  dlg.innerHTML = `
    <div class="cs-lightbox__bar">
      <p class="cs-lightbox__count" aria-live="polite"></p>
      <button class="btn-line" type="button" data-lb-close>Close</button>
    </div>
    <figure class="cs-lightbox__stage"><img alt=""><figcaption class="cs-lightbox__caption"></figcaption></figure>
    <div class="cs-lightbox__nav">
      <button class="btn-line" type="button" data-lb-prev>Previous</button>
      <button class="btn-line" type="button" data-lb-next>Next</button>
    </div>`;
  document.body.append(dlg);
  const img = dlg.querySelector('img');
  const cap = dlg.querySelector('figcaption');
  const count = dlg.querySelector('.cs-lightbox__count');
  const nav = dlg.querySelector('.cs-lightbox__nav');
  let set = [];
  let i = 0;
  const show = (k) => {
    i = (k + set.length) % set.length;
    const src = set[i].querySelector('img');
    img.src = src.currentSrc || src.src;
    img.alt = src.alt;
    cap.textContent = set[i].dataset.caption || '';
    count.textContent = set.length > 1 ? `${i + 1} of ${set.length}` : '';
    nav.hidden = set.length < 2;
  };
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open]');
    if (!t || dlg.contains(t)) return;
    const group = t.closest('.cs-gallery, .cs-states, .cs-devices, .cs-moments, .cs-ba__stack');
    set = group ? $$('[data-open]', group) : [t];
    show(set.indexOf(t));
    dlg.showModal();
  });
  dlg.querySelector('[data-lb-close]').addEventListener('click', () => dlg.close());
  dlg.querySelector('[data-lb-prev]').addEventListener('click', () => show(i - 1));
  dlg.querySelector('[data-lb-next]').addEventListener('click', () => show(i + 1));
  dlg.addEventListener('keydown', (e) => {
    if (set.length < 2) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); show(i + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(i - 1); }
  });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => { img.removeAttribute('src'); set[i]?.focus({ preventScroll: true }); });
}

/* 4.10 Go deeper: animated open/close, #id opens it, Expand all, print. */
function goDeeper() {
  const all = $$('[data-deeper]');
  if (!all.length) return;

  const animate = (d, open) => {
    const body = d.querySelector('.cs-deeper__body');
    if (reduce || !body.animate) { d.open = open; return; }
    if (open) d.open = true;
    const h = body.scrollHeight;
    const a = body.animate(
      [{ height: open ? '0px' : `${h}px`, opacity: open ? 0 : 1 }, { height: open ? `${h}px` : '0px', opacity: open ? 1 : 0 }],
      { duration: 400, easing: EASE },
    );
    body.style.overflow = 'hidden';
    a.onfinish = () => { body.style.overflow = ''; if (!open) d.open = false; };
  };
  all.forEach((d) => {
    d.querySelector('summary').addEventListener('click', (e) => {
      e.preventDefault();
      animate(d, !d.open);
      syncAll();
    });
  });

  const openHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const target = document.getElementById(id);
    const d = target?.closest('[data-deeper]');
    if (d && !d.open) {
      d.open = true;
      requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
    }
  };
  openHash();
  window.addEventListener('hashchange', openHash);

  const btn = document.querySelector('[data-expand-all]');
  const syncAll = () => { if (btn) btn.textContent = all.every((d) => d.open) ? 'Collapse all' : 'Expand all'; };
  if (btn) {
    btn.hidden = false;
    btn.addEventListener('click', () => {
      const open = !all.every((d) => d.open);
      all.forEach((d) => { d.open = open; });
      syncAll();
    });
  }

  let before = [];
  window.addEventListener('beforeprint', () => { before = all.map((d) => d.open); all.forEach((d) => { d.open = true; }); });
  window.addEventListener('afterprint', () => { all.forEach((d, k) => { d.open = before[k]; }); });
}

/* 4.7 / 4.19 Strips: progress line, arrow buttons, hidden when nothing to scroll. */
function strips() {
  $$('[data-strip]').forEach((strip) => {
    const track = strip.querySelector('.cs-strip__track');
    const bar = strip.querySelector('[data-strip-bar]');
    const prev = strip.querySelector('[data-strip-prev]');
    const next = strip.querySelector('[data-strip-next]');
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      strip.classList.toggle('is-static', max <= 2);
      const p = max > 0 ? track.scrollLeft / max : 1;
      if (bar) bar.style.transform = `scaleX(${Math.max(0.08, p)})`;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
    };
    const step = (dir) => track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
    prev?.addEventListener('click', () => step(-1));
    next?.addEventListener('click', () => step(1));
    track.addEventListener('scroll', update, { passive: true });
    new ResizeObserver(update).observe(track);
    update();
  });
}

/* 4.2 Stat notes: tap toggles; hover and focus show them in CSS. */
function statNotes() {
  $$('[data-stat-note]').forEach((b) => {
    b.addEventListener('click', () => b.setAttribute('aria-expanded', String(b.getAttribute('aria-expanded') !== 'true')));
    b.addEventListener('blur', () => b.setAttribute('aria-expanded', 'false'));
  });
}

/* Fade-up on Decisions and section titles only (20px, once). */
function reveals() {
  const g = window.gsap;
  if (reduce || !g || !window.ScrollTrigger) return;
  const vh = innerHeight;
  $$('[data-reveal]').forEach((el) => {
    if (el.getBoundingClientRect().top < vh * 0.9) return;
    g.from(el, { y: 20, opacity: 0, duration: 1, ease: 'main', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
}

/* Contents rail: mark the section in view. Go deeper links open their
   section through the hash handler in goDeeper(). */
function rail() {
  const nav = document.querySelector('[data-rail]');
  if (!nav) return;
  const links = $$('[data-rail-link]', nav);
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const targets = [...map.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((l) => l.removeAttribute('aria-current'));
      map.get(e.target.id)?.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  targets.forEach((t) => io.observe(t));
}

/* "Email me" in the shared CTA also copies the address, as on the homepage. */
function copyEmail() {
  const toast = document.querySelector('[data-toast]');
  $$('[data-copy-email]').forEach((a) => a.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(a.dataset.copyEmail); } catch { return; }
    if (!toast) return;
    toast.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { toast.hidden = true; }, 1600);
  }));
}

function init() {
  rail();
  copyEmail();
  loops();
  beforeAfter();
  lightbox();
  goDeeper();
  strips();
  statNotes();
  // GSAP loads with defer from the CDN; wait for it before the reveals.
  if (document.readyState === 'complete') reveals();
  else window.addEventListener('load', reveals, { once: true });
}
init();
