/* Mobile menu: a full-screen panel. Holds focus while open; Esc, the close
   button or any link closes it. (The scaling open animation comes in Phase 3.) */

export function initNav() {
  const menu = document.querySelector('[data-menu]');
  const openBtn = document.querySelector('[data-menu-open]');
  if (!menu || !openBtn) return;
  const closeBtn = menu.querySelector('[data-menu-close]');
  const focusables = () => [...menu.querySelectorAll('a, button')];

  const open = () => {
    menu.hidden = false;
    openBtn.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    closeBtn.focus();
  };
  const close = ({ restore = true } = {}) => {
    menu.hidden = true;
    openBtn.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    if (restore) openBtn.focus();
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
