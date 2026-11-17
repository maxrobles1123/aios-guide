/* AIOS guide: the four agents in 3D (v3, 2026-11-17).
   Recipe from the award-site teardowns (vault: Award-Site Motion Teardown 2026-11-13, 3D Site Teardowns 2026-11-07):
   - One contained object, not a full-screen scene; edges feathered into the page by a CSS mask (Belgrade Arbor).
   - Fog in the page colour, so the far tiles fade into the paper (Belgrade Arbor).
   - Ambient light plus one key light; narrow camera (Agrumea, Belgrade).
   - Pixel ratio capped at 1.25 on desktop and 2 on phones (Lando Norris).
   - Labels drawn to 2D canvases and used as textures (Agrumea's jar labels).
   - Scroll is the playhead (USAvionix): the stack of four opens out, then turns to face each agent as you read it.
   The words on the tiles are read from the agent cards on the page, so nothing is written twice.
   The canvas is decorative (aria-hidden); the cards stay the content. */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, PlaneGeometry, MeshStandardMaterial, MeshBasicMaterial,
  CanvasTexture, SRGBColorSpace, AmbientLight, SpotLight, DirectionalLight, Fog, Color, Raycaster, Vector2, MathUtils,
  RoundedBoxGeometry
} from '../vendor/three-lite.min.js';

const INK = 0xa39b8c, MINT = 0x5fe6bb, PAGE = 0xffffff;   /* a warm mid-tone edge: reads as depth, not as a black line */
const W = 1.5, H = 2.0, D = 0.1;
const LINEAR = 1006;   /* THREE.LinearFilter (not exported by the slim bundle) */

export async function start(host, cards, state) {
  const holder = host.querySelector('.stage3d');
  const canvas = document.createElement('canvas');
  holder.appendChild(canvas);

  const phone = () => window.innerWidth <= 768;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  scene.fog = new Fog(PAGE, 10.5, 19);   /* pushed back: only the farthest tile softens */
  const camera = new PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0.1, 6.9);

  scene.add(new AmbientLight(0xffffff, 0.95));
  const key = new DirectionalLight(0xffffff, 2.4); key.position.set(-3, 4, 6); scene.add(key);
  const spot = new SpotLight(0xfff6e6, 40, 22, Math.PI / 5, 0.7, 1.2); spot.position.set(3.5, 3, 7); scene.add(spot);

  /* ---- the tile faces, drawn from the cards ---- */
  await Promise.all([
    document.fonts.load('400 64px Newsreader'), document.fonts.load('600 30px "Hanken Grotesk"'), document.fonts.load('800 30px "Hanken Grotesk"'), document.fonts.load('500 64px Newsreader')
  ]).catch(() => {});
  /* Sharp, not blurry (Maxx 2026-11-17): the faces are drawn at the size the front tile is shown on this screen,
     in device pixels, and sampled without mipmaps, so the words are never softened by a smaller copy. */
  const dpr = () => Math.min(devicePixelRatio || 1, 2);
  const hb = holder.getBoundingClientRect();
  const texScale = MathUtils.clamp((hb.height || 480) * 0.62 * dpr() / 512, 1.25, 3.5);
  const faces = await Promise.all(cards.map((card, i) => drawFace(card, i, renderer, texScale)));

  const root = new Group(); scene.add(root);
  const bodyGeo = new RoundedBoxGeometry(W, H, D, 4, 0.07);
  const faceGeo = new PlaneGeometry(W - 0.035, H - 0.035);
  const tiles = faces.map((tex, i) => {
    const g = new Group();
    const bodyMat = new MeshStandardMaterial({ color: INK, roughness: 0.38, metalness: 0.08, transparent: true });
    const body = new Mesh(bodyGeo, bodyMat);
    /* The face is unlit (Maxx, 2026-11-17: "a little faded"): the lights shape the tile's body, the words stay full black on white. */
    const faceMat = new MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.02 });
    const face = new Mesh(faceGeo, faceMat); face.position.z = D / 2 + 0.003;
    g.add(body, face); g.userData = { i, bodyMat, faceMat, cur: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, op: 1 } };
    body.userData.tile = g; face.userData.tile = g;
    root.add(g); return g;
  });

  /* a soft shadow under the stack */
  const shTex = shadowTexture();
  const shadow = new Mesh(new PlaneGeometry(6.5, 2.2), new MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, opacity: 0.8 }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.32; scene.add(shadow);

  /* ---- size ---- */
  function size() {
    const r = holder.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    renderer.setPixelRatio(dpr());   /* full sharpness on every screen (was capped at 1.25 on desktop: the blur) */
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    /* keep a whole tile and a half each side in frame, whatever the shape of the box */
    /* fit the front tile and both neighbours, side by side with clear space between them, inside the box */
    const halfW = 2.1, tanH = Math.tan(MathUtils.degToRad(camera.fov / 2));
    camera.position.z = Math.max(6.9, halfW / (tanH * camera.aspect));
    camera.updateProjectionMatrix();
  }
  size();
  new ResizeObserver(size).observe(holder);

  /* ---- pointer: the stack leans toward the cursor; a tile under the cursor can be clicked ---- */
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 }, ray = new Raycaster(), ndc = new Vector2();
  let hoverTile = null;
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ptr.tx = ndc.x; ptr.ty = ndc.y;
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(root.children, true)[0];
    hoverTile = hit ? hit.object.userData.tile : null;
    canvas.classList.toggle('is-pointing', !!hoverTile);
  });
  canvas.addEventListener('pointerleave', () => { ptr.tx = 0; ptr.ty = 0; hoverTile = null; canvas.classList.remove('is-pointing'); });
  canvas.addEventListener('click', () => { if (hoverTile && state.goTo) state.goTo(hoverTile.userData.i); });

  /* ---- where each tile wants to be ---- */
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  function target(i, f, s, t) {
    // the stack: one block, turned a little, the first agent on top
    const st = { x: -0.15 + i * 0.05, y: 0.05 - i * 0.04, z: -i * 0.16, rx: 0.16, ry: -0.62, rz: 0.035 * i };
    // the fan: the agent being read faces you; the others step back and turn away (a carousel told by scroll)
    const d = i - f, ad = Math.abs(d), sg = Math.sign(d);
    /* Maxx 2026-11-17: the tiles were "overlapping on each other". Now the neighbours sit clear of the front tile,
       and a tile two away fades out behind its neighbour instead of piling up. */
    const fan = {
      x: sg * (ad < 1 ? ad * 1.68 : 1.68 + (ad - 1) * 0.35),
      y: -Math.min(ad, 2) * 0.05,
      z: -Math.min(ad, 2.4) * 1.05,
      rx: 0.02,
      ry: -MathUtils.clamp(d, -1.2, 1.2) * 0.62,
      rz: 0
    };
    const k = ease(MathUtils.clamp(s * 1.7 - (3 - i) * 0.18, 0, 1)); // the tiles peel off the stack one after another
    const o = {};
    for (const key in st) o[key] = st[key] + (fan[key] - st[key]) * k;
    o.op = 1 + (MathUtils.clamp((1.75 - ad) / 0.75, 0, 1) - 1) * k;   // in the stack all four show; in the fan, three at most
    o.y += Math.sin(t * 0.9 + i * 1.7) * 0.035;              // a slow breath, never still, never busy
    o.rx += Math.cos(t * 0.7 + i) * 0.012;
    return o;
  }

  /* ---- render only while the scene is on screen ---- */
  let visible = true, raf = 0, last = performance.now();
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }, { rootMargin: '10% 0px' }).observe(host);

  const c1 = new Color(INK), c2 = new Color(MINT), tmp = new Color();
  let focusI = -1;
  function loop(now) {
    raf = 0;
    if (!visible) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = now / 1000;
    const damp = 1 - Math.exp(-dt * 5.5);            // the lag that makes it feel heavy (scrub ~0.55 in Spyker terms)
    ptr.x += (ptr.tx - ptr.x) * (1 - Math.exp(-dt * 3));
    ptr.y += (ptr.ty - ptr.y) * (1 - Math.exp(-dt * 3));
    root.rotation.y = ptr.x * 0.16;
    root.rotation.x = -ptr.y * 0.09;

    const f = state.f, s = state.s;
    tiles.forEach((g, i) => {
      const tg = target(i, f, s, t), c = g.userData.cur;
      for (const k in tg) c[k] += (tg[k] - c[k]) * damp;
      g.position.set(c.x, c.y, c.z);
      const op = MathUtils.clamp(c.op, 0, 1);
      g.userData.bodyMat.opacity = op; g.userData.faceMat.opacity = op; g.visible = op > 0.01;
      g.rotation.set(c.rx, c.ry, c.rz);
      // the tile you are reading takes the mint edge
      const on = s > 0.6 ? Math.max(0, 1 - Math.abs(i - f) * 1.6) : 0;
      const hov = hoverTile === g ? 0.25 : 0;
      tmp.copy(c1).lerp(c2, Math.min(1, on + hov));
      g.userData.bodyMat.color.lerp(tmp, damp);
      const sc = 1 + (hoverTile === g ? 0.03 : 0);
      g.scale.x += (sc - g.scale.x) * damp; g.scale.y = g.scale.z = g.scale.x;
    });
    const fi = Math.round(f);
    if (fi !== focusI) { focusI = fi; state.onFocus && state.onFocus(fi); }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
  host.classList.add('is-ready');
}

/* ---------- drawing a tile face ---------- */
function drawFace(card, i, renderer, S) {
  const cw = Math.round(384 * S), ch = Math.round(512 * S);
  const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
  const x = cv.getContext('2d');
  const name = (card.querySelector('h3') || {}).textContent || '';
  const line = (card.querySelector('.line') || {}).textContent || '';
  const svg = card.querySelector('.icon svg');

  // the face: warm white, rounded to match the tile's corners
  const r = 16 * S;
  x.fillStyle = '#ffffff'; roundRect(x, 0, 0, cw, ch, r); x.fill();
  // the brand's two mint corner squares (as on the hero photo)
  x.save(); roundRect(x, 0, 0, cw, ch, r); x.clip();
  x.fillStyle = '#74eec7'; x.fillRect(cw - 40 * S, 0, 40 * S, 40 * S); x.fillRect(0, ch - 40 * S, 40 * S, 40 * S);
  x.restore();

  const pad = 34 * S;
  x.fillStyle = '#141414'; x.font = `700 ${16 * S}px "Hanken Grotesk", Arial, sans-serif`;
  x.fillText(`AGENT 0${i + 1}`, pad, pad + 14 * S);
  // icon tile
  x.fillStyle = '#74eec7'; x.fillRect(pad, 86 * S, 88 * S, 88 * S);

  /* name, rule and line, sized down together until they end well above the AIOS foot
     (Maxx 2026-11-17: the Client Experience line sat right on top of the AIOS logo). */
  const maxW = cw - pad * 2, floor = ch - pad - 62 * S;
  let k = 1;
  for (; k > 0.6; k -= 0.04) {
    x.font = `500 ${44 * k * S}px Newsreader, Georgia, serif`;
    const nl = lines(x, name, maxW).length;
    x.font = `600 ${22 * Math.max(k, 0.82) * S}px "Hanken Grotesk", Arial, sans-serif`;
    const ll = lines(x, line, maxW).length;
    const end = 228 * S + (nl - 1) * 46 * k * S + 64 * k * S + (ll - 1) * 30 * Math.max(k, 0.82) * S;
    if (end <= floor) break;
  }
  const lk = Math.max(k, 0.82);
  x.fillStyle = '#141414'; x.font = `500 ${44 * k * S}px Newsreader, Georgia, serif`;
  let y = wrap(x, name, pad, 228 * S, maxW, 46 * k * S);
  x.fillRect(pad, y + 20 * k * S, 56 * S, 4 * S);
  x.font = `600 ${22 * lk * S}px "Hanken Grotesk", Arial, sans-serif`;
  wrap(x, line, pad, y + 64 * k * S, maxW, 30 * lk * S);
  // foot
  x.fillStyle = '#141414'; x.font = `500 ${24 * S}px Newsreader, Georgia, serif`;
  x.fillText('AIOS', pad, ch - pad - 4 * S);
  /* Maxx: "Chirag Shah Coaching can be a little more bold" */
  x.fillStyle = '#141414'; x.font = `800 ${15 * S}px "Hanken Grotesk", Arial, sans-serif`;
  const tag = 'CHIRAG SHAH COACHING'; x.fillText(tag, cw - pad - x.measureText(tag).width, ch - pad - 4 * S);

  const tex = new CanvasTexture(cv);
  tex.colorSpace = SRGBColorSpace;
  tex.generateMipmaps = false; tex.minFilter = LINEAR; tex.magFilter = LINEAR;

  // the icon, drawn from the card's own SVG
  return new Promise((resolve) => {
    if (!svg) return resolve(tex);
    const s = svg.cloneNode(true);
    s.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); s.setAttribute('width', '96'); s.setAttribute('height', '96');
    const img = new Image();
    img.onload = () => { x.drawImage(img, pad + 18 * S, 104 * S, 52 * S, 52 * S); tex.needsUpdate = true; resolve(tex); };
    img.onerror = () => resolve(tex);
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(s));
  });
}
function roundRect(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
function lines(x, text, maxW) {
  const out = []; let ln = '';
  for (const w of text.split(/\s+/)) { const t = ln ? ln + ' ' + w : w; if (x.measureText(t).width > maxW && ln) { out.push(ln); ln = w; } else ln = t; }
  if (ln) out.push(ln); return out;
}
function wrap(x, text, a, y, maxW, lh) {
  const words = text.split(/\s+/); let ln = '';
  for (const w of words) {
    const test = ln ? ln + ' ' + w : w;
    if (x.measureText(test).width > maxW && ln) { x.fillText(ln, a, y); ln = w; y += lh; } else ln = test;
  }
  if (ln) x.fillText(ln, a, y);
  return y;
}
function shadowTexture() {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 192;
  const x = cv.getContext('2d');
  x.scale(1, 0.375);                                  // an ellipse: squash a circle
  const g = x.createRadialGradient(256, 256, 4, 256, 256, 250);
  g.addColorStop(0, 'rgba(20,20,20,0.32)'); g.addColorStop(0.5, 'rgba(20,20,20,0.10)'); g.addColorStop(1, 'rgba(20,20,20,0)');
  x.fillStyle = g; x.fillRect(0, 0, 512, 512);
  const t = new CanvasTexture(cv); t.colorSpace = SRGBColorSpace; return t;
}
