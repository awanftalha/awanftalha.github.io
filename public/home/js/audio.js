/* Loads Howler from jsDelivr the first time sound is asked for, and keeps
   one shared "audio is on" switch that the player and UI sounds both read. */

const HOWLER = 'https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.core.min.js';
let loading = null;

export function loadHowler() {
  if (window.Howl) return Promise.resolve(window.Howl);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = HOWLER;
      s.async = true;
      s.onload = () => resolve(window.Howl);
      s.onerror = () => { loading = null; reject(new Error('Howler failed to load')); };
      document.head.append(s);
    });
  }
  return loading;
}

/* Sound is on only while the music player is playing. */
export const audio = {
  on: false,
  set(v) {
    this.on = v;
    window.dispatchEvent(new CustomEvent('audiochange', { detail: { on: v } }));
  },
};
