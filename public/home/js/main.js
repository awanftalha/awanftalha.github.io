/* Homepage entry. Each behaviour lives in its own module. */
import { initTheme } from './theme.js';
import { initNav } from './nav.js';
import { initClock } from './clock.js';
import { initPockets } from './pockets.js';
import { initScramble } from './scramble.js';
import { initCursor } from './cursor.js';
import { playIntro, initReveals } from './reveal.js';
import { initCovers } from './covers.js';
import { initOrb } from './orb.js';

initTheme();
initNav();
initClock();
initPockets();
initScramble();
initCursor();
playIntro();
initReveals();
initCovers();
initOrb();

/* "Email me" opens the mail app and also copies the address. */
const toast = document.querySelector('[data-toast]');
document.querySelectorAll('[data-copy-email]').forEach((a) => {
  a.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(a.dataset.copyEmail);
    } catch {
      return;   // clipboard blocked: the mailto link still works
    }
    if (!toast) return;
    toast.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { toast.hidden = true; }, 1600);
  });
});
