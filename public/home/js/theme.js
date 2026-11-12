/* Theme: light by default. The toggle switches to dark (and back), and the
   choice is remembered across pages and visits. The inline script in
   <head> has already applied it before first paint. */

const root = document.documentElement;
const COLOUR = { light: '#fbfbfb', dark: '#0d0d0d' };

const current = () => (root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

function label(theme) {
  const next = theme === 'dark' ? 'light' : 'dark';
  document.querySelectorAll('[data-theme-toggle]').forEach((b) => b.setAttribute('aria-label', `Switch to ${next} theme`));
}

function apply(theme) {
  root.classList.add('theme-switching');
  clearTimeout(apply.t);
  apply.t = setTimeout(() => root.classList.remove('theme-switching'), 250);
  root.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = COLOUR[theme];
  label(theme);
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

export function initTheme() {
  label(current());
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = current() === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', next); } catch { /* private mode: still switches */ }
      apply(next);
    });
  });
}
