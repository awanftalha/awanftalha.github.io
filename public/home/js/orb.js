/* The hero orb: a sphere of orange dots that turns, breathes, and has
   signal waves sweeping across it, like an AI at work. Plain canvas, no
   libraries. Pauses when scrolled out of view; holds still for visitors
   who ask for reduced motion. Size it with --orb-size in home.css. */

export function initOrb() {
  const wrap = document.querySelector('[data-orb]');
  const canvas = wrap && wrap.querySelector('canvas');
  const ctx = canvas && canvas.getContext('2d');
  if (!ctx) return;

  // ---------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------
  const CFG = {
    rotateSpeed: 0.55,   // radians per second (it speeds up and eases off around this)
    tilt: 0.38,          // how far the top leans towards you, so the bands curve
    perspective: 4,      // camera distance in orb radii; smaller = stronger depth
    bands: 26,           // latitude bands
    perBand: 56,         // dots on the widest band
    pulseEvery: 1.6,     // seconds between signal waves sweeping across the orb
    pulseWidth: 0.17,    // how thick each wave is
    pulseLift: 0.07,     // how far a wave lifts dots off the surface
    breathe: 0.025,      // how much the whole orb swells and settles
  };

  const ORANGE = [244, 116, 28];
  const PEACH  = [255, 192, 152];
  const SPARK  = [255, 166, 92];    // colour of dots caught in a wave

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------
  const TAU = Math.PI * 2;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const lerp = (a, b, t) => a + (b - a) * t;

  // Seeded random numbers: the orb is built the same way every time and
  // nothing is ever regenerated while it runs.
  function mulberry32(a) {
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(20261112);

  // ---------------------------------------------------------------------
  // Particles, in latitude bands on a sphere. Fixed at start-up.
  // ---------------------------------------------------------------------
  const P = [];
  for (let b = 0; b < CFG.bands; b++) {
    const lat = -Math.PI / 2 + ((b + 0.5) / CFG.bands) * Math.PI;
    const ring = Math.cos(lat);
    const n = Math.max(3, Math.round(CFG.perBand * ring));
    const offset = b * 2.39996; // golden angle, so bands don't line up
    for (let k = 0; k < n; k++) {
      const lon = offset + (k / n) * TAU;
      P.push({
        x: ring * Math.cos(lon), y: -Math.sin(lat), z: ring * Math.sin(lon),
        tint: rand(), sizeVar: 0.8 + 0.4 * rand(),
        phase: rand() * TAU, freq: 1.2 + 1.4 * rand(),
      });
    }
  }
  const N = P.length;
  const ix = new Float32Array(N), iy = new Float32Array(N), ir = new Float32Array(N);
  const ia = new Float32Array(N), ik = new Float32Array(N);
  const icol = new Array(N);
  const order = Array.from({ length: N }, (_, i) => i);

  // Signal waves: each sweeps across the orb along its own direction.
  // Directions are in view space, so the waves read as activity on the
  // orb rather than spinning with it.
  const waves = [
    { axis: [0.35, -0.9, 0.25], offset: 0.0 },
    { axis: [-0.8, 0.2, 0.55], offset: 0.5 },
    { axis: [0.6, 0.55, -0.6], offset: 0.25 },
  ].map((w) => {
    const l = Math.hypot(...w.axis);
    return { axis: w.axis.map((c) => c / l), offset: w.offset };
  });

  // ---------------------------------------------------------------------
  // Size and high-DPI
  // ---------------------------------------------------------------------
  let dpr = 1, R = 0;
  function resize() {
    const w = canvas.clientWidth;
    if (!w) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    R = w / 3.2;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(w * dpr);
    render();
  }

  // ---------------------------------------------------------------------
  // Motion
  // ---------------------------------------------------------------------
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let time = 0, rotY = 0.6;

  function update(dt) {
    time += dt;
    // Spins faster and eases off in a slow rhythm, like it's working
    // through something.
    const surge = 1 + 0.45 * Math.sin(time * 0.9) + 0.2 * Math.sin(time * 2.3 + 1);
    rotY += CFG.rotateSpeed * surge * dt;
  }

  // ---------------------------------------------------------------------
  // Drawing
  // ---------------------------------------------------------------------
  function render() {
    if (!R) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, canvas.width / 2, canvas.height / 2);

    const breathe = 1 + CFG.breathe * Math.sin(time * 2.6);

    // Wave fronts: each travels from one side of the orb to the other, then
    // waits a beat off the far side before coming round again.
    const fronts = waves.map((w) => -1.4 + (((time / CFG.pulseEvery + w.offset) % 1) * 3.4));

    // Ambient glow, pulsing gently with the activity
    const ga = 0.17 + 0.05 * Math.sin(time * 2.6);
    const g = ctx.createRadialGradient(0, 0, R * 0.3, 0, 0, R * 1.58);
    g.addColorStop(0, `rgba(247,119,31,${ga})`);
    g.addColorStop(0.45, `rgba(247,119,31,${ga * 0.4})`);
    g.addColorStop(1, 'rgba(247,119,31,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-R * 1.6, -R * 1.6, R * 3.2, R * 3.2);

    const cy = Math.cos(rotY), sy = Math.sin(rotY);
    const tl = CFG.tilt + 0.06 * Math.sin(time * 0.7);
    const cx = Math.cos(tl), sx = Math.sin(tl);
    const D = CFG.perspective, K = Math.sqrt(D * D - 1) / D;
    const w2 = CFG.pulseWidth * CFG.pulseWidth;

    for (let i = 0; i < N; i++) {
      const p = P[i];
      // spin around the vertical axis, then lean the top towards the viewer
      const x1 = p.x * cy + p.z * sy;
      const z1 = -p.x * sy + p.z * cy;
      const y2 = p.y * cx + z1 * sx;
      const z2 = -p.y * sx + z1 * cx;

      // How strongly the passing waves catch this dot
      let wave = 0;
      for (let w = 0; w < waves.length; w++) {
        const a = waves[w].axis;
        const d = x1 * a[0] + y2 * a[1] + z2 * a[2] - fronts[w];
        wave += Math.exp(-(d * d) / w2);
      }
      wave = clamp01(wave * 0.85);

      // Lift off the surface: breathing, a little shimmer per dot, and the waves
      const shimmer = Math.sin(time * p.freq + p.phase);
      const lift = breathe * (1 + 0.012 * shimmer + CFG.pulseLift * wave);
      const X = x1 * lift, Y = y2 * lift, Z = z2 * lift;

      const s = (D / (D - Z)) * K;
      const depth = clamp01((Z + 1) / 2);

      const r = (0.006 + 0.012 * Math.pow(depth, 1.3)) * p.sizeVar * (1 + 0.7 * wave);
      const a = clamp01((0.1 + 0.9 * Math.pow(depth, 1.8)) * (1 + 0.6 * wave) + 0.08 * shimmer * depth);
      const ct = clamp01(depth * 1.15 - 0.05 + (p.tint - 0.5) * 0.35);
      const hot = wave * (0.4 + 0.6 * depth);
      const c0 = lerp(lerp(PEACH[0], ORANGE[0], ct), SPARK[0], hot);
      const c1 = lerp(lerp(PEACH[1], ORANGE[1], ct), SPARK[1], hot);
      const c2 = lerp(lerp(PEACH[2], ORANGE[2], ct), SPARK[2], hot);

      ix[i] = X * s * R; iy[i] = Y * s * R; ir[i] = r * R; ia[i] = a; ik[i] = Z;
      icol[i] = `rgba(${c0 | 0},${c1 | 0},${c2 | 0},`;
    }

    // Back to front
    order.sort((i, j) => ik[i] - ik[j]);
    for (let n = 0; n < N; n++) {
      const i = order[n];
      if (ia[i] < 0.004) continue;
      ctx.fillStyle = icol[i] + ia[i].toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(ix[i], iy[i], ir[i], 0, TAU);
      ctx.fill();
    }
  }

  // ---------------------------------------------------------------------
  // Loop: runs only while the orb is on screen
  // ---------------------------------------------------------------------
  let raf = 0, last = 0;
  function frame(now) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    if ((window.devicePixelRatio || 1) !== dpr && dpr < 2.5) resize();
    update(dt);
    render();
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf && !reduce) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop())).observe(wrap);
  resize();
}
