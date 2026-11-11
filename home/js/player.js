/* Music player, floating bottom-right. Nothing loads or plays until the
   button is pressed. While playing, the track title marquees. If the track
   file is missing, the player says so and stays paused.
   Sources come from data-src ("a.webm|a.mp3"), the title from data-title. */

import { gsap, motionOn } from './motion.js';
import { loadHowler, audio } from './audio.js';

export function initPlayer() {
  const el = document.querySelector('[data-player]');
  if (!el) return;
  const btn = el.querySelector('[data-player-btn]');
  const status = el.querySelector('[data-player-status]');
  const marquee = el.querySelector('[data-player-marquee]');
  let howl = null;
  let playing = false;
  let scroll = null;

  const setUI = (on, word) => {
    playing = on;
    el.classList.toggle('is-playing', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
    status.textContent = word || (on ? 'Playing' : 'Paused');
    audio.set(on);
    if (!motionOn || !marquee) return;
    if (on) {
      // The title is written twice; slide by one copy's width, forever.
      const one = marquee.firstElementChild.getBoundingClientRect().width;
      scroll ??= gsap.to(marquee, { x: -one, duration: one / 22, ease: 'none', repeat: -1, paused: true });
      scroll.play();
    } else {
      scroll?.pause();
    }
  };

  const missing = () => {
    setUI(false, 'No track yet');
    howl = null;
  };

  btn.addEventListener('click', async () => {
    if (playing) { howl?.pause(); setUI(false); return; }
    status.textContent = 'Loading';
    try {
      const Howl = await loadHowler();
      if (!howl) {
        howl = new Howl({
          src: el.dataset.src.split('|'),
          html5: true,      // stream; don't download the whole track first
          loop: true,
          volume: 0.5,
          onplay: () => setUI(true),
          onloaderror: missing,
          onplayerror: missing,
        });
      }
      howl.play();
    } catch {
      missing();
    }
  });
}
