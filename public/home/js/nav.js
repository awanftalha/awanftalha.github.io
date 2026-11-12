/* Mobile menu: the hamburger scales open into a full-screen panel (a clip
   that grows from the button), then the links rise in, 0.05s apart. Focus
   stays inside while open; Esc, the close button or any link closes it. */

import { gsap, motionOn } from './motion.js';

/* The bar is see-through over the first screen, then picks up a solid
   background once the second screen reaches it. */
function initNavSurface() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  let queued = false;
  const update = () => {
    queued = false;
    nav.classList.toggle('is-solid', scrollY > innerHeight - nav.offsetHeight);
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  update();
}

export function initNav() {
  initNavSurface();
  const menu = document.querySelector('[data-menu]');
  const openBtn = document.querySelector('[data-menu-open]');
  if (!menu || !openBtn) return;
  const closeBtn = menu.querySelector('[data-menu-close]');
  const links = menu.querySelectorAll('.menu__links li, .menu__foot');
  const focusables = () => [...menu.querySelectorAll('a, button')];

  /* The clip that matches the button, in px from each edge. */
  const fromButton = () => {
    const r = openBtn.getBoundingClientRect();
    return `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 4px)`;
  };

  const open = () => {
    menu.hidden = false;
    openBtn.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    closeBtn.focus();
    if (!motionOn) return;
    gsap.fromTo(menu, { clipPath: fromButton() }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 0.6, overwrite: true });
    gsap.fromTo(links, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, delay: 0.2, overwrite: true });
  };

  const close = ({ restore = true } = {}) => {
    openBtn.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    const done = () => {
      menu.hidden = true;
      if (motionOn) gsap.set(menu, { clearProps: 'clipPath' });
      if (restore) openBtn.focus();
    };
    if (!motionOn) return done();
    gsap.to(menu, { clipPath: fromButton(), duration: 0.45, overwrite: true, onComplete: done });
  };

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', () => close());
  menu.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', () => close({ restore: false })));
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if (e.key !== 'Tab') return;
    const f = focusables();
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  matchMedia('(min-width: 768px)').addEventListener('change', (e) => { if (e.matches && !menu.hidden) close({ restore: false }); });
}
