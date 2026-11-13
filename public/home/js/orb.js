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
  // A smaller orb (phones) gets fewer dots: same look, about 40% less work.
  if (wrap.clientWidth < 400) { CFG.bands = 22; CFG.perBand = 44; }
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
  const icol = new Uint16Array(N);
  const order = Array.from({ length: N }, (_, i) => i);
  // Dot colours, worked out once: 17 steps from peach to orange, each in 9
  // steps towards the wave colour. Each frame just picks one (no new strings).
  const CT = 16, HOT = 8;
  const PALETTE = [];
  for (let c = 0; c <= CT; c++) {
    for (let h = 0; h <= HOT; h++) {
      const ct = c / CT, hot = h / HOT;
      const rgb = [0, 1, 2].map((k) => Math.round(lerp(lerp(PEACH[k], ORANGE[k], ct), SPARK[k], hot)));
      PALETTE.push(`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`);
    }
  }

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
    dpr = Math.min(window.devicePixelRatio || 1, 2);
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

  // The cursor parts the dots: they slide away from it and leave a small
  // empty space. As the orb turns, fresh dots flow into that space and part
  // too, so the gap follows the cursor across the turning surface.
  const hole = { x: 0, y: 0, tx: 0, ty: 0, on: 0, want: 0 };
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    hole.tx = e.clientX - r.left - r.width / 2;
    hole.ty = e.clientY - r.top - r.height / 2;
    if (!hole.want) { hole.x = hole.tx; hole.y = hole.ty; }   // appear where the cursor is
    hole.want = 1;
  });
  canvas.addEventListener('pointerleave', () => { hole.want = 0; });

  function update(dt) {
    time += dt;
    // Ease the gap after the cursor and in/out, so nothing snaps
    const follow = 1 - Math.exp(-dt * 16), fade = 1 - Math.exp(-dt * (hole.want ? 7 : 4));
    hole.x += (hole.tx - hole.x) * follow;
    hole.y += (hole.ty - hole.y) * follow;
    hole.on += (hole.want - hole.on) * fade;
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
    const holeR = R * 0.22, holeReach = holeR * 1.9;

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
      const hot = clamp01(wave * (0.4 + 0.6 * depth));

      let sxp = X * s * R, syp = Y * s * R;
      if (hole.on > 0.001) {
        // Push away from the cursor, hardest at its centre
        let dx = sxp - hole.x, dy = syp - hole.y;
        let d = Math.hypot(dx, dy);
        if (d < holeReach) {
          if (d < 0.5) { dx = sxp || 1; dy = syp; d = Math.hypot(dx, dy); }
          const k = 1 - d / holeReach;
          const push = holeR * Math.pow(k, 1.4) * hole.on;
          sxp += (dx / d) * push;
          syp += (dy / d) * push;
        }
      }
      ix[i] = sxp; iy[i] = syp; ir[i] = r * R; ia[i] = a; ik[i] = Z;
      icol[i] = Math.round(ct * CT) * (HOT + 1) + Math.round(hot * HOT);
    }

    // Back to front. The order barely changes between frames, so an
    // insertion sort on last frame's order is close to free.
    for (let n = 1; n < N; n++) {
      const v = order[n], key = ik[v];
      let m = n - 1;
      while (m >= 0 && ik[order[m]] > key) { order[m + 1] = order[m]; m--; }
      order[m + 1] = v;
    }
    for (let n = 0; n < N; n++) {
      const i = order[n];
      if (ia[i] < 0.004) continue;
      ctx.globalAlpha = ia[i];
      ctx.fillStyle = PALETTE[icol[i]];
      ctx.beginPath();
      ctx.arc(ix[i], iy[i], ir[i], 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
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
  // The first frame is drawn straight away; the motion starts once the page
  // has finished loading and the browser is idle, so it never competes with
  // the page appearing.
  let ready = false, visible = false;
  function start() { if (ready && visible && !raf && !reduce) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }
  const go = () => { ready = true; start(); };
  const begin = () => ('requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 1500 }) : setTimeout(go, 300));
  if (document.readyState === 'complete') begin(); else addEventListener('load', begin, { once: true });

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; visible ? start() : stop(); }).observe(wrap);
  resize();
}
