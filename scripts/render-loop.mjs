#!/usr/bin/env node
// Renders one case-study loop from Figma frames.
//
//   node scripts/render-loop.mjs <slug>/<name> [--fps 30] [--preview] [--keep-frames]
//
// Reads   media-src/<slug>/<name>/scene.json  (+ the PNGs it names, exported from Figma at 2x)
// Writes  public/media/<slug>/<name>.mp4      (H.264, no audio, ≤ 2 MB)
//         public/media/<slug>/<name>.webp     (first frame, used as the poster)
//
// The timeline is deterministic: the page is told "you are at t seconds", a screenshot is taken,
// repeat at the frame rate. Nothing depends on real-time playback, so every render is identical.
// Needs: playwright (npm i -D playwright; npx playwright install chromium) and ffmpeg on PATH.
// Scene format: docs/LOOP_SCENES.md.

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, statSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
const flag = (n) => args.includes(`--${n}`);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i > -1 ? args[i + 1] : d; };
if (!id || !id.includes("/")) {
  console.error("Usage: node scripts/render-loop.mjs <slug>/<name> [--fps 30] [--preview] [--keep-frames]");
  process.exit(2);
}

const ROOT = process.cwd();
const SRC = join(ROOT, "media-src", id);
const OUT_DIR = join(ROOT, "public", "media", dirname(id));
const NAME = id.split("/").pop();
const FPS = Number(opt("fps", 30));
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_WIDTH = 1440;

// ---------- load and validate the scene ----------
const scenePath = join(SRC, "scene.json");
if (!existsSync(scenePath)) fail(`No scene file at media-src/${id}/scene.json`);
const scene = JSON.parse(readFileSync(scenePath, "utf8"));
const [W, H] = scene.size || fail("scene.size [width, height] is required (CSS px of one frame)");
const touch = scene.touch ?? W < 1000;
const scale = scene.scale ?? (W < 1000 ? 2 : 1);
const frames = scene.frames || fail("scene.frames is required");
if (!frames["01"]) fail('scene.frames must include "01" (the starting state)');
const layers = scene.layers || {};
for (const [k, f] of Object.entries(frames)) if (!existsSync(join(SRC, f))) fail(`frame "${k}" file missing: ${f}`);
for (const [k, l] of Object.entries(layers)) {
  if (!existsSync(join(SRC, l.src))) fail(`layer "${k}" file missing: ${l.src}`);
  for (const p of ["x", "y", "w", "h"]) if (typeof l[p] !== "number") fail(`layer "${k}" needs numeric ${p}`);
}
const KNOWN = ["wait", "move", "click", "show", "highlight", "layer", "reveal", "scroll", "hide"];
(scene.steps || []).forEach((s, i) => {
  const kind = KNOWN.find((k) => k in s);
  if (!kind) fail(`step ${i + 1} has no known action (${KNOWN.join(", ")})`);
  if (kind === "show" && !frames[s.show]) fail(`step ${i + 1}: frame "${s.show}" not in scene.frames`);
  if (["layer", "reveal", "scroll", "hide"].includes(kind) && !layers[s[kind]]) fail(`step ${i + 1}: layer "${s[kind]}" not in scene.layers`);
});

// ---------- build the page ----------
const imgURL = (f) => pathToFileURL(resolve(SRC, f)).href;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;background:#fff;overflow:hidden}
  #stage{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:#fff}
  .f,.ov{position:absolute;inset:0;width:${W}px;height:${H}px;will-change:opacity,transform}
  .ly{position:absolute;overflow:hidden}
  .ly img{position:absolute;left:0;top:0;display:block}
  #hl{position:absolute;z-index:7;border:2px solid rgba(17,17,17,.62);box-shadow:0 0 0 4px rgba(255,255,255,.55);opacity:0;pointer-events:none}
  #cur{position:absolute;left:0;top:0;width:22px;height:22px;pointer-events:none;z-index:10}
  #dot{position:absolute;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;background:rgba(255,255,255,.42);border:2px solid rgba(17,17,17,.38);box-shadow:0 2px 10px rgba(0,0,0,.22);opacity:0;z-index:10}
  .rip{position:absolute;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;border:2px solid rgba(255,255,255,.95);box-shadow:0 0 0 1.5px rgba(17,17,17,.45),inset 0 0 0 1.5px rgba(17,17,17,.25);opacity:0;z-index:9}
</style></head><body><div id="stage">
  ${Object.entries(frames).map(([k, f]) => `<img class="f" data-f="${k}" src="${imgURL(f)}" style="opacity:0">`).join("\n  ")}
  ${Object.entries(layers).map(([k, l]) => `<div class="ly" data-l="${k}" style="left:${(l.clip || [l.x])[0]}px;top:${(l.clip || [0, l.y])[1]}px;width:${(l.clip || [0, 0, l.w])[2]}px;height:${(l.clip || [0, 0, 0, l.h])[3]}px"><img src="${imgURL(l.src)}" style="width:${l.w}px;height:${l.h}px;left:${l.x - (l.clip ? l.clip[0] : l.x)}px;top:${l.y - (l.clip ? l.clip[1] : l.y)}px"></div>`).join("\n  ")}
  <img class="ov" id="ov" src="${imgURL(frames["01"])}" style="opacity:0">
  <div id="hl"></div>
  ${touch ? '<div id="dot"></div>' : `<svg id="cur" viewBox="0 0 22 22"><path d="M3 2 L3 17.5 L7.2 13.6 L10 19.8 L12.9 18.6 L10.2 12.5 L16 12.5 Z" fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>`}
  <div class="rip" id="rip"></div>
</div>
<script>
const SCENE = ${JSON.stringify({ steps: scene.steps || [], layers, start: scene.cursor?.start || [W * 0.8, H * 0.85], loopBack: scene.loopBack ?? 0.6, touch })};
// One easing curve for the whole site: cubic-bezier(0.65, 0.01, 0.05, 0.99)
function bez(x1,y1,x2,y2){const cx=3*x1,bx=3*(x2-x1)-cx,ax=1-cx-bx,cy=3*y1,by=3*(y2-y1)-cy,ay=1-cy-by;
  const sx=t=>((ax*t+bx)*t+cx)*t, sy=t=>((ay*t+by)*t+cy)*t, dx=t=>(3*ax*t+2*bx)*t+cx;
  return x=>{if(x<=0)return 0;if(x>=1)return 1;let t=x;for(let i=0;i<8;i++){const e=sx(t)-x,d=dx(t);if(Math.abs(e)<1e-6)break;if(Math.abs(d)<1e-6)break;t-=e/d}
    let lo=0,hi=1;for(let i=0;i<30&&Math.abs(sx(t)-x)>1e-6;i++){if(sx(t)<x)lo=t;else hi=t;t=(lo+hi)/2}return sy(t)}}
const ease=bez(0.65,0.01,0.05,0.99), out=t=>1-Math.pow(1-t,3);
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)), lerp=(a,b,p)=>a+(b-a)*p;

// Compile steps into timed entries.
const T=[]; let cursorT=0, prevStart=0;
for(const s of SCENE.steps){
  const kind=["wait","move","click","show","highlight","layer","reveal","scroll","hide"].find(k=>k in s);
  const dur = s.dur ?? ({wait:s.wait,move:0.6,click:0.35,show:0.5,highlight:1.0,layer:0.5,reveal:0.8,scroll:1.2,hide:0.3})[kind];
  const t0 = (s.with ? prevStart : cursorT) + (s.delay ?? 0); const t1=t0+(kind==="show"&&s.transition==="cut"?0:dur);
  T.push({...s,kind,t0,t1,dur}); prevStart=t0; cursorT=Math.max(cursorT,t0+dur);
}
const LOOP0=cursorT, TOTAL=cursorT+SCENE.loopBack;
window.__total=TOTAL;
const $=q=>document.querySelector(q), F={}, L={};
document.querySelectorAll(".f").forEach(e=>F[e.dataset.f]=e);
document.querySelectorAll(".ly").forEach(e=>L[e.dataset.l]=e);
const lyInit=k=>({x:0,y:0,opacity:SCENE.layers[k].visible?1:0,scale:1,
  reveal:T.some(e=>e.kind==="reveal"&&e.reveal===k)?0:1,scroll:0});

window.__render=function(t){
  // frames
  let cur="01"; const op={}; for(const k in F)op[k]=0; op["01"]=1; const tf={};
  for(const e of T.filter(e=>e.kind==="show")){
    if(t<e.t0)break;
    const p=e.t1>e.t0?ease(clamp((t-e.t0)/(e.t1-e.t0))):1, from=cur, to=e.show;
    for(const k in op)op[k]=0;
    const tr=e.transition||"fade";
    if(tr==="slide-left"){op[from]=1;op[to]=1;tf[from]="translateX("+(-30*p)+"%)";tf[to]="translateX("+(100-100*p)+"%)"}
    else if(tr==="slide-up"){op[from]=1-p;op[to]=1;tf[to]="translateY("+(24*(1-p))+"px)"}
    else{op[from]=1;op[to]=p}
    if(p>=1){for(const k in op)op[k]=0;op[to]=1;delete tf[from];delete tf[to]}
    cur=to;
  }
  for(const k in F){F[k].style.opacity=op[k];F[k].style.transform=tf[k]||"none";F[k].style.zIndex=k===cur?2:1}
  // layers
  for(const k in L){
    const st=lyInit(k);
    for(const e of T){
      const target=e.layer??e.reveal??e.scroll??e.hide; if(target!==k||t<e.t0)continue;
      const p=ease(clamp((t-e.t0)/e.dur));
      if(e.kind==="layer"){for(const pr of ["x","y","opacity","scale"]){const a=e.from&&pr in e.from?e.from[pr]:st[pr];const b=e.to&&pr in e.to?e.to[pr]:a;st[pr]=lerp(a,b,p)}}
      if(e.kind==="reveal"){st.opacity=1;st.reveal=p}
      if(e.kind==="scroll"){const s0=st.scroll;st.scroll=lerp(s0,s0+e.by,p)}
      if(e.kind==="hide"){st.opacity=lerp(st.opacity,0,p)}
    }
    const el=L[k], img=el.firstElementChild;
    el.style.opacity=st.opacity; el.style.zIndex=5;
    el.style.transform="translate("+st.x+"px,"+st.y+"px) scale("+st.scale+")";
    el.style.clipPath="inset(0 "+(100-st.reveal*100)+"% 0 0)";
    img.style.transform="translateY("+st.scroll+"px)";
  }
  // cursor / touch dot
  let pos=[...SCENE.start], seen=false;
  for(const e of T.filter(e=>e.kind==="move")){ if(t<e.t0)break; const p=ease(clamp((t-e.t0)/e.dur)); pos=[lerp(pos[0],e.move[0],p),lerp(pos[1],e.move[1],p)]; seen=true }
  let cursorOpacity=1;
  if(t>LOOP0){const p=ease(clamp((t-LOOP0)/SCENE.loopBack));pos=[lerp(pos[0],SCENE.start[0],p),lerp(pos[1],SCENE.start[1],p)]}
  // highlight
  const hl=$("#hl"); hl.style.opacity=0;
  for(const e of T.filter(e=>e.kind==="highlight")){ if(t<e.t0||t>e.t1)continue;
    const a=clamp((t-e.t0)/0.2), b=clamp((e.t1-t)/0.25), [x,y,w,h]=e.highlight;
    Object.assign(hl.style,{left:x-4+"px",top:y-4+"px",width:w+8+"px",height:h+8+"px",borderRadius:(e.radius??6)+"px",opacity:Math.min(a,b)}) }
  // click ripple
  const rip=$("#rip"); rip.style.opacity=0; let press=0;
  for(const e of T.filter(e=>e.kind==="click")){ const d=t-e.t0; if(d<0||d>0.45)continue;
    const p=out(clamp(d/0.45)); let cp=[...SCENE.start];
    for(const m of T.filter(m=>m.kind==="move"&&m.t0<=e.t0)){const q=ease(clamp((e.t0-m.t0)/m.dur));cp=[lerp(cp[0],m.move[0],q),lerp(cp[1],m.move[1],q)]}
    Object.assign(rip.style,{left:cp[0]+"px",top:cp[1]+"px",opacity:0.65*(1-p),transform:"scale("+(0.5+1.1*p)+")"}); press=Math.sin(clamp(d/0.18)*Math.PI) }
  if(SCENE.touch){ const dot=$("#dot");
    const active=T.filter(e=>e.kind==="move"||e.kind==="click").some(e=>t>=e.t0-0.25&&t<=e.t1+0.5);
    dot.style.opacity=active?1:0; dot.style.left=pos[0]+"px"; dot.style.top=pos[1]+"px"; dot.style.transform="scale("+(1-0.15*press)+")" }
  else { const c=$("#cur"); c.style.transform="translate("+pos[0]+"px,"+pos[1]+"px) scale("+(1-0.12*press)+")"; c.style.opacity=cursorOpacity }
  // seamless loop: fade the starting frame back in over the last loopBack seconds
  $("#ov").style.opacity = t>LOOP0 ? ease(clamp((t-LOOP0)/SCENE.loopBack)) : 0; $("#ov").style.zIndex=8;
};
</script></body></html>`;

mkdirSync(SRC, { recursive: true });
const pagePath = join(SRC, "_render.html");
writeFileSync(pagePath, html);

if (flag("preview")) {
  writeFileSync(join(SRC, "preview.html"), html.replace("</body>", `<script>
    const t0=performance.now();(function f(){const t=((performance.now()-t0)/1000)%window.__total;window.__render(t);requestAnimationFrame(f)})();
  </script></body>`));
  console.log(`Preview written: media-src/${id}/preview.html (open it in a browser)`);
}

// ---------- capture ----------
let chromium;
try { ({ chromium } = await import("playwright")); }
catch { fail("Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium"); }
try { execFileSync("ffmpeg", ["-version"], { stdio: "ignore" }); }
catch { fail("ffmpeg is not on PATH. Install it first (ask Talha before installing anything system-wide)."); }

const tmp = join(SRC, "_frames");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ["--allow-file-access-from-files"] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
await page.goto(pathToFileURL(pagePath).href);
await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => { throw new Error("image failed: " + i.src); }))));
const total = await page.evaluate(() => window.__total);
const count = Math.round(total * FPS);
const t0 = Date.now();
for (let i = 0; i < count; i++) {
  await page.evaluate((t) => window.__render(t), i / FPS);
  await page.locator("#stage").screenshot({ path: join(tmp, String(i + 1).padStart(5, "0") + ".png") });
  if (i % FPS === 0) process.stdout.write(`\r  rendering ${i}/${count} frames`);
}
await browser.close();
process.stdout.write(`\r  rendered ${count} frames (${total.toFixed(1)} s at ${FPS} fps) in ${((Date.now() - t0) / 1000).toFixed(0)} s\n`);

// ---------- encode ----------
mkdirSync(OUT_DIR, { recursive: true });
const mp4 = join(OUT_DIR, `${NAME}.mp4`);
const outW = Math.min(W * scale, MAX_WIDTH);
const vf = `scale=${outW}:-2:flags=lanczos`;
let crf = 20, bytes = Infinity;
while (crf <= 36) {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", join(tmp, "%05d.png"),
    "-vf", vf, "-c:v", "libx264", "-preset", "slow", "-tune", "animation", "-crf", String(crf),
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", mp4]);
  bytes = statSync(mp4).size;
  if (bytes <= MAX_BYTES) break;
  crf += 2;
}
if (bytes > MAX_BYTES) fail(`Still ${(bytes / 1048576).toFixed(2)} MB at CRF 36. Shorten the loop or use fewer full-screen changes.`);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", join(tmp, "00001.png"), "-vf", vf, "-c:v", "libwebp", "-quality", "88", join(OUT_DIR, `${NAME}.webp`)]);
if (!flag("keep-frames")) rmSync(tmp, { recursive: true, force: true });
rmSync(pagePath, { force: true });
console.log(`✓ public/media/${id}.mp4  ${(bytes / 1048576).toFixed(2)} MB · CRF ${crf} · ${outW}px wide · ${total.toFixed(1)} s`);
console.log(`✓ public/media/${id}.webp  (poster = first frame)`);

function fail(msg) { console.error("✗ " + msg); process.exit(1); }
