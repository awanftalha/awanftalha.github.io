/* Shared motion setup: GSAP (loaded from jsDelivr before the modules run),
   the one "main" easing curve, and the reduced-motion flag. */

export const gsap = window.gsap || null;
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (gsap && window.CustomEase) {
  gsap.registerPlugin(window.CustomEase);
  window.CustomEase.create('main', '0.65, 0.01, 0.05, 0.99');
  gsap.defaults({ ease: 'main' });
  document.documentElement.classList.add('gsap');
}
