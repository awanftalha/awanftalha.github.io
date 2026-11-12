/* UI sounds: very quiet blips on hover and click for anything marked
   data-sound-hover / data-sound-click. They only exist while the music
   player is playing (the visitor has chosen sound), and the page ships fine
   without the files: a missing file simply stays silent. */

import { loadHowler, audio } from './audio.js';

const FILES = {
  hover: ['home/audio/hover.webm', 'home/audio/hover.mp3'],
  click: ['home/audio/click.webm', 'home/audio/click.mp3'],
};
const VOLUME = { hover: 0.08, click: 0.15 };

export function initSounds() {
  const sounds = {};
  const ready = async () => {
    const Howl = await loadHowler();
    for (const [name, src] of Object.entries(FILES)) {
      sounds[name] ??= new Howl({ src, volume: VOLUME[name], preload: true, onloaderror: () => { sounds[name] = null; } });
    }
  };
  window.addEventListener('audiochange', (e) => { if (e.detail.on) ready().catch(() => {}); });

  const play = (name) => { if (audio.on && sounds[name]) sounds[name].play(); };
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const t = e.target.closest('[data-sound-hover]');
    if (t && !t.contains(e.relatedTarget)) play('hover');
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-sound-click]')) play('click');
  });
}
