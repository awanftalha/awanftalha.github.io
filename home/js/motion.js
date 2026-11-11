/* Shared motion setup: GSAP and its plugins (loaded from jsDelivr before the
   modules run), the one "main" easing curve, and the reduced-motion flag. */

export const gsap = window.gsap || null;
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const CHARS = '/!<>-_\\[]{}+*^#';

if (gsap) {
  const plugins = ['CustomEase', 'ScrollTrigger', 'SplitText', 'ScrambleTextPlugin'].map((n) => window[n]).filter(Boolean);
  gsap.registerPlugin(...plugins);
  if (window.CustomEase) window.CustomEase.create('main', '0.65, 0.01, 0.05, 0.99');
  gsap.defaults({ ease: 'main' });
  document.documentElement.classList.add('gsap');
}

/* Motion runs only with GSAP and without a reduced-motion request. */
export const motionOn = !!gsap && !reduce;
window.__motion = motionOn;
if (!motionOn) document.documentElement.classList.remove('motion');

export const has = (name) => !!(gsap && window[name]);
