import * as THREE from './three.module.min.js';
import { RoomEnvironment } from './RoomEnvironment.js';

/* ============ helpers ============ */
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const easeOut = t => 1 - Math.pow(1 - t, 4);
const easeIn = t => t * t * t;
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  return t;
}

/* lattice (diagonal double-line grid like their gates) */
function latticeAlpha() {
  const t = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#fff'; g.lineWidth = 7;
    const P = 128;
    for (let k = -4; k <= 8; k++) {
      for (const o of [-11, 11]) {
        const c = k * P + o;
        g.beginPath(); g.moveTo(c - h, -h); g.lineTo(c + 2 * h, 2 * h); g.stroke();   // x - y = c
        g.beginPath(); g.moveTo(c + h, -h); g.lineTo(c - 2 * h, 2 * h); g.stroke();   // x + y = c
      }
    }
  }, true);
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

function woodTex(base, dark) {
  return canvasTex(512, 64, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      g.strokeStyle = dark; g.globalAlpha = 0.08 + rnd() * 0.18; g.lineWidth = 0.6 + rnd() * 1.8;
      const y = rnd() * h; g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.01 + i) * (1 + rnd() * 2));
      g.stroke();
    }
    g.globalAlpha = 1;
  }, true);
}

function glowTex() {
  const t = canvasTex(256, 256, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(233,179,32,0.55)'); gr.addColorStop(0.45, 'rgba(233,179,32,0.12)'); gr.addColorStop(1, 'rgba(233,179,32,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  return t;
}

/* ============ materials ============ */
function makeMaterials() {
  const lattice = latticeAlpha();
  return {
    graphite: new THREE.MeshStandardMaterial({ color: 0x4a4d52, metalness: 0.55, roughness: 0.42 }),
    graphiteDark: new THREE.MeshStandardMaterial({ color: 0x2b2d31, metalness: 0.55, roughness: 0.4 }),
    black: new THREE.MeshStandardMaterial({ color: 0x1b1c1f, metalness: 0.5, roughness: 0.38 }),
    lattice: new THREE.MeshStandardMaterial({ color: 0x3c3f44, metalness: 0.55, roughness: 0.42, alphaMap: lattice, alphaTest: 0.5, side: THREE.DoubleSide }),
    latticeTex: lattice,
    stone: new THREE.MeshStandardMaterial({ color: 0xb5aa95, roughness: 0.92, metalness: 0 }),
    stone2: new THREE.MeshStandardMaterial({ color: 0xa39884, roughness: 0.92, metalness: 0 }),
    stoneDark: new THREE.MeshStandardMaterial({ color: 0x3a3b3e, roughness: 0.9, metalness: 0 }),
    concrete: new THREE.MeshStandardMaterial({ color: 0x6d6a65, roughness: 0.95 }),
    paving: new THREE.MeshStandardMaterial({ color: 0x4a4946, roughness: 0.9 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xe9b320, metalness: 0.9, roughness: 0.25 }),
    deck: new THREE.MeshStandardMaterial({ map: woodTex('#b08a63', '#5a3d22'), roughness: 0.75 }),
    woodSlat: new THREE.MeshStandardMaterial({ map: woodTex('#9a6a3e', '#3e2412'), roughness: 0.55, metalness: 0.15 }),
    greySlat: new THREE.MeshStandardMaterial({ map: woodTex('#6d6f72', '#2a2b2e'), roughness: 0.55, metalness: 0.2 }),
    led: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4dc, emissiveIntensity: 2.4 }),
    poly: new THREE.MeshPhysicalMaterial({ color: 0x6b4a2a, metalness: 0, roughness: 0.18, transparent: true, opacity: 0.52, clearcoat: 1, clearcoatRoughness: 0.1, side: THREE.DoubleSide, depthWrite: false }),
    cassette: new THREE.MeshStandardMaterial({ color: 0xe9dcc0, metalness: 0.35, roughness: 0.38 }),
    linear: new THREE.MeshStandardMaterial({ color: 0x24262b, metalness: 0.6, roughness: 0.35 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x3d4f5e, metalness: 0.7, roughness: 0.06, clearcoat: 1 }),
    wall: new THREE.MeshStandardMaterial({ color: 0x46484c, roughness: 0.9 }),
    roof: new THREE.MeshStandardMaterial({ color: 0x26282c, metalness: 0.5, roughness: 0.45 })
  };
}

/* ============ model builder ============ */
class Builder {
  constructor() { this.group = new THREE.Group(); this.parts = []; this.geoCache = new Map(); }
  geo(w, h, d) {
    const k = `${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}`;
    if (!this.geoCache.has(k)) this.geoCache.set(k, new THREE.BoxGeometry(w, h, d));
    return this.geoCache.get(k);
  }
  add(mesh, from, delay) {
    mesh.castShadow = true; mesh.receiveShadow = true;
    this.group.add(mesh);
    const p = { mesh, end: mesh.position.clone(), endQ: mesh.quaternion.clone(), from: from || new THREE.Vector3(0, 3, 0), delay: delay || 0 };
    p.startQ = new THREE.Quaternion().setFromEuler(new THREE.Euler((rnd() - 0.5) * 1.2, (rnd() - 0.5) * 1.2, (rnd() - 0.5) * 1.2)).multiply(p.endQ);
    this.parts.push(p);
    return mesh;
  }
  box(w, h, d, mat, x, y, z, from, delay) {
    const m = new THREE.Mesh(this.geo(w, h, d), mat);
    m.position.set(x, y, z);
    return this.add(m, from, delay);
  }
}

/* ---------- 1. ВОРОТА ---------- */
function buildGates(M) {
  seed = 11;
  const B = new Builder();
  const H = 2.3, T = 0.06;
  const pillarW = 0.46;
  // layout along x: pillar | gate 4.0 | pillar | wicket 1.0 | pillar
  const gateW = 4.0, wicketW = 1.0;
  const x0 = -(pillarW * 3 + gateW + wicketW) / 2;
  const pillarsX = [x0 + pillarW / 2, x0 + pillarW * 1.5 + gateW, x0 + pillarW * 2.5 + gateW + wicketW];
  const pillarH = H + 0.25;

  // slab
  B.box(7.4, 0.08, 1.8, M.paving, 0, -0.04, 0.35, new THREE.Vector3(0, -1.5, 0), 0);

  // pillars: stacked blocks fall from the sky
  let d = 0.05;
  pillarsX.forEach((px, pi) => {
    const rows = Math.round(pillarH / 0.2);
    for (let r = 0; r < rows; r++) {
      const mat = (r + pi) % 3 === 0 ? M.stone2 : M.stone;
      B.box(pillarW, 0.19, pillarW, mat, px, 0.1 + r * 0.2, 0, new THREE.Vector3(0, 4 + r * 0.15, 0), d + r * 0.035 + pi * 0.08);
    }
    B.box(pillarW + 0.1, 0.08, pillarW + 0.1, M.stone2, px, rows * 0.2 + 0.04, 0, new THREE.Vector3(0, 5, 0), d + rows * 0.035 + 0.2);
    B.box(pillarW - 0.06, 0.08, pillarW - 0.06, M.stone, px, rows * 0.2 + 0.12, 0, new THREE.Vector3(0, 5, 0), d + rows * 0.035 + 0.25);
  });

  const leaf = (lx, w, side, del, slideDir, withHandles) => {
    // lx = left edge
    const cx = lx + w / 2;
    const from = new THREE.Vector3(slideDir * 6, 0, 0);
    const z = 0;
    const y0 = 0.08;
    // outer frame
    B.box(w, T, T, M.graphite, cx, y0 + T / 2, z, from, del);
    B.box(w, T, T, M.graphite, cx, y0 + H - T / 2, z, from, del + 0.02);
    B.box(T, H, T, M.graphite, lx + T / 2, y0 + H / 2, z, from, del + 0.04);
    B.box(T, H, T, M.graphite, lx + w - T / 2, y0 + H / 2, z, from, del + 0.06);
    // top cornice
    B.box(w + 0.04, 0.05, 0.1, M.graphite, cx, y0 + H + 0.025, z, new THREE.Vector3(0, 3, 0), del + 0.5);
    // top lattice band
    const topH = 0.5;
    const latY = y0 + H - T - topH / 2;
    const lat = new THREE.Mesh(new THREE.PlaneGeometry(w - 2 * T, topH), M.lattice);
    lat.material = M.lattice.clone();
    lat.material.alphaMap = M.latticeTex.clone(); lat.material.alphaMap.needsUpdate = true;
    lat.material.alphaMap.repeat.set((w - 2 * T) / 0.5, topH / 0.5);
    lat.position.set(cx, latY, z);
    B.add(lat, from.clone().add(new THREE.Vector3(0, 1, 0)), del + 0.12);
    B.box(w - 2 * T, 0.04, T * 0.8, M.graphite, cx, latY - topH / 2 - 0.02, z, from, del + 0.14);
    // side lattice strip (outer side)
    const sideW = 0.36, sideH = H - T * 2 - topH - 0.04;
    const sx = side < 0 ? lx + T + sideW / 2 : lx + w - T - sideW / 2;
    const sl = new THREE.Mesh(new THREE.PlaneGeometry(sideW, sideH), M.lattice.clone());
    sl.material.alphaMap = M.latticeTex.clone(); sl.material.alphaMap.needsUpdate = true;
    sl.material.alphaMap.repeat.set(sideW / 0.5, sideH / 0.5);
    sl.position.set(sx, y0 + T + sideH / 2, z);
    B.add(sl, from.clone().add(new THREE.Vector3(0, -1, 0)), del + 0.16);
    B.box(0.04, sideH, T * 0.8, M.graphite, side < 0 ? lx + T + sideW + 0.02 : lx + w - T - sideW - 0.02, y0 + T + sideH / 2, z, from, del + 0.18);
    // horizontal planks
    const pw = w - 2 * T - sideW - 0.04;
    const px = side < 0 ? lx + T + sideW + 0.04 + pw / 2 : lx + T + pw / 2;
    const ph = sideH;
    const n = 7, gap = 0.018, plH = (ph - gap * (n - 1)) / n;
    for (let i = 0; i < n; i++) {
      B.box(pw, plH, 0.035, M.graphite, px, y0 + T + plH / 2 + i * (plH + gap), z, new THREE.Vector3(slideDir * 5, (i - 3) * 0.6, 1.5), del + 0.22 + i * 0.05);
    }
    // nested moulding frames (stepped rectangles towards the centre)
    if (withHandles) {
      for (let k = 0; k < 3; k++) {
        const inset = 0.08 + k * 0.07;
        const fw = pw - inset * 2, fh = ph - inset * 2 + (k * 0.05);
        const fx = px + (side < 0 ? inset * 0.6 : -inset * 0.6), fy = y0 + T + ph / 2 - k * 0.02;
        const zz = z + 0.03 + k * 0.012, s = 0.022, fd = del + 0.6 + k * 0.08;
        const fr = new THREE.Vector3(0, 0, 2.5);
        B.box(fw, s, s, M.graphiteDark, fx, fy + fh / 2, zz, fr, fd);
        B.box(fw, s, s, M.graphiteDark, fx, fy - fh / 2, zz, fr, fd);
        B.box(s, fh, s, M.graphiteDark, fx - fw / 2, fy, zz, fr, fd);
        B.box(s, fh, s, M.graphiteDark, fx + fw / 2, fy, zz, fr, fd);
      }
      // ring handles (half circles facing the centre seam)
      const seamX = side < 0 ? lx + w : lx;
      [0.24, 0.17].forEach((r, i) => {
        const tor = new THREE.Mesh(new THREE.TorusGeometry(r, 0.014, 10, 40, Math.PI), M.black);
        tor.rotation.z = side < 0 ? Math.PI / 2 : -Math.PI / 2;
        tor.position.set(seamX + (side < 0 ? -0.06 : 0.06), y0 + 1.05, z + 0.08);
        B.add(tor, new THREE.Vector3(0, 0, 3), del + 0.9 + i * 0.08);
      });
      B.box(0.03, 0.42, 0.03, M.black, seamX + (side < 0 ? -0.04 : 0.04), y0 + 1.05, z + 0.1, new THREE.Vector3(0, 0, 3), del + 1.0);
    }
  };
  const gx = pillarsX[0] + pillarW / 2;
  leaf(gx, gateW / 2, -1, 0.7, -1, true);
  leaf(gx + gateW / 2, gateW / 2, 1, 0.78, 1, true);
  // wicket
  const wx = pillarsX[1] + pillarW / 2;
  leaf(wx, wicketW, 1, 1.0, 1, false);
  B.box(0.03, 0.5, 0.03, M.black, wx + 0.14, 1.1, 0.06, new THREE.Vector3(0, 0, 3), 1.6);
  // gold house-number plate on the middle pillar
  B.box(0.26, 0.16, 0.02, M.gold, pillarsX[1], 1.55, pillarW / 2 + 0.01, new THREE.Vector3(0, 0, 3), 1.8);

  return { group: B.group, parts: B.parts, view: { yaw: -0.5, elev: 0.14, target: new THREE.Vector3(0, 1.2, 0), radius: 3.7 } };
}

/* ---------- 2. НАВЕС / ТЕРРАСА (израильский поликарбонат) ---------- */
function buildCanopy(M) {
  seed = 23;
  const B = new Builder();
  const W = 6.4, D = 4.2, Hf = 2.75, Hb = 3.0; // front lower than back (slope)
  const y0 = 0.25;
  // deck base
  B.box(W + 0.2, 0.2, D + 0.2, M.stoneDark, 0, 0.1, 0, new THREE.Vector3(0, -2, 0), 0);
  // deck boards slide in one by one
  const bw = 0.145, n = Math.floor(W / (bw + 0.008));
  for (let i = 0; i < n; i++) {
    const x = -W / 2 + bw / 2 + i * (bw + 0.008);
    B.box(bw, 0.035, D, M.deck, x, y0 - 0.03, 0, new THREE.Vector3(0, 0, -6 - i * 0.05), 0.15 + i * 0.022);
  }
  // back wall with windows (context)
  const wallZ = -D / 2 - 0.12;
  B.box(W + 0.4, Hb + 0.6, 0.2, M.wall, 0, y0 + (Hb + 0.6) / 2 - 0.02, wallZ, new THREE.Vector3(0, -5, 0), 0.1);
  [-1.9, 0.2].forEach((wx, i) => {
    B.box(1.8, 2.2, 0.04, M.glass, wx, y0 + 1.1, wallZ + 0.12, new THREE.Vector3(0, 0, 3), 0.5 + i * 0.1);
    B.box(0.05, 2.2, 0.06, M.black, wx, y0 + 1.1, wallZ + 0.14, new THREE.Vector3(0, 0, 3), 0.6 + i * 0.1);
  });
  // posts
  const post = 0.1;
  const postsX = [-W / 2 + 0.08, -W / 6, W / 6, W / 2 - 0.08];
  postsX.forEach((px, i) => B.box(post, Hf, post, M.graphiteDark, px, y0 + Hf / 2, D / 2 - 0.08, new THREE.Vector3(0, 5, 0), 0.9 + i * 0.07));
  [-D / 6].forEach((pz, i) => B.box(post, (Hf + Hb) / 2, post, M.graphiteDark, W / 2 - 0.08, y0 + (Hf + Hb) / 4, pz, new THREE.Vector3(0, 5, 0), 1.2));
  // ladder side panels (like the photo)
  [-W / 2 + 0.08, W / 2 - 0.08].forEach((px, s) => {
    for (let k = 0; k < 9; k++) B.box(0.04, 0.03, 0.42, M.graphiteDark, px, y0 + 0.3 + k * 0.28, D / 2 - 0.36, new THREE.Vector3(0, 4, 0), 1.25 + k * 0.03 + s * 0.1);
    B.box(0.05, Hf, 0.05, M.graphiteDark, px, y0 + Hf / 2, D / 2 - 0.58, new THREE.Vector3(0, 5, 0), 1.2);
  });
  // perimeter beams
  const slope = (Hb - Hf) / D;
  const yAt = z => y0 + Hf + (D / 2 - z) * slope;
  B.box(W, 0.16, 0.1, M.graphiteDark, 0, yAt(D / 2 - 0.08) + 0.08, D / 2 - 0.08, new THREE.Vector3(0, 4, 0), 1.45);
  B.box(W, 0.16, 0.1, M.graphiteDark, 0, yAt(-D / 2 + 0.05) + 0.08, -D / 2 + 0.05, new THREE.Vector3(0, 4, 0), 1.5);
  // rafters + purlins (grid)
  const ang = Math.atan(slope);
  const raftL = D / Math.cos(ang);
  for (let i = 0; i <= 8; i++) {
    const x = -W / 2 + 0.05 + i * (W - 0.1) / 8;
    const m = new THREE.Mesh(B.geo(0.06, 0.12, raftL), M.graphiteDark);
    m.position.set(x, yAt(0) + 0.16, 0); m.rotation.x = ang;
    B.add(m, new THREE.Vector3(0, 3, 0), 1.6 + i * 0.04);
  }
  for (let j = 0; j < 5; j++) {
    const z = -D / 2 + 0.3 + j * (D - 0.6) / 4;
    B.box(W, 0.05, 0.05, M.graphiteDark, 0, yAt(z) + 0.24, z, new THREE.Vector3(0, 3, 0), 1.95 + j * 0.04);
  }
  // polycarbonate sheets (Israeli bronze polycarbonate)
  for (let i = 0; i < 8; i++) {
    const x = -W / 2 + 0.05 + (i + 0.5) * (W - 0.1) / 8;
    const m = new THREE.Mesh(B.geo((W - 0.1) / 8 - 0.02, 0.012, raftL), M.poly);
    m.position.set(x, yAt(0) + 0.28, 0); m.rotation.x = ang;
    m.renderOrder = 2;
    B.add(m, new THREE.Vector3(0, 2.5, 0), 2.2 + i * 0.06);
    m.castShadow = false;
  }
  // front railing
  const ry = [0.35, 0.6, 0.85];
  ry.forEach((h, k) => B.box(W * 0.42, 0.04, 0.04, M.graphiteDark, W * 0.27, y0 + h, D / 2 - 0.08, new THREE.Vector3(6, 0, 0), 2.6 + k * 0.06));
  B.box(W * 0.42, 0.06, 0.1, M.graphiteDark, W * 0.27, y0 + 1.0, D / 2 - 0.08, new THREE.Vector3(6, 0, 0), 2.8);
  return { group: B.group, parts: B.parts, view: { yaw: 0.55, elev: 0.3, target: new THREE.Vector3(0, 1.4, 0), radius: 4.5 } };
}

/* ---------- 3. КУБИЧЕСКИЙ ПОТОЛОК ---------- */
function buildCeiling(M) {
  seed = 37;
  const B = new Builder();
  const L = 4.4, n = 34, pitch = 0.12, sw = 0.05, sh = 0.1;
  const Y = 2.9;
  const half = (n - 1) * pitch / 2;
  // black carrier profiles above the slats
  for (let k = 0; k < 4; k++) {
    const x = -L / 2 + 0.4 + k * (L - 0.8) / 3;
    B.box(0.05, 0.04, n * pitch + 0.1, M.black, x, Y + sh / 2 + 0.03, 0, new THREE.Vector3(0, 2.5, 0), k * 0.08);
  }
  // dark backing so slats read clearly from below
  B.box(L + 0.1, 0.02, n * pitch + 0.1, M.black, 0, Y + sh / 2 + 0.08, 0, new THREE.Vector3(0, 3, 0), 0);
  // wood-look slats drop in one by one, LED lines between some of them
  for (let i = 0; i < n; i++) {
    const z = -half + i * pitch;
    B.box(L, sh, sw, M.woodSlat, 0, Y, z, new THREE.Vector3(0, 2.2, 0), 0.3 + i * 0.03);
    if (i % 7 === 3) B.box(L * 0.62, 0.012, 0.028, M.led, (i % 14 === 3 ? -1 : 1) * L * 0.12, Y - 0.02, z + pitch / 2, new THREE.Vector3(0, 2.2, 0), 1.5 + i * 0.02);
  }
  // supporting walls: dark panel + glazing
  B.box(L + 0.1, Y - 0.1, 0.08, M.linear, 0, (Y - 0.1) / 2, -half - 0.1, new THREE.Vector3(0, -4, 0), 0.05);
  return { group: B.group, parts: B.parts, view: { yaw: -0.55, elev: -0.5, target: new THREE.Vector3(0, 2.35, 0), radius: 3.3 } };
}

/* ---------- 4. ФАСАД (металлокассеты + линейные панели) ---------- */
function buildFacade(M) {
  seed = 51;
  const B = new Builder();
  const Hc = 5.4, y0 = 0.5;
  // core + plinth
  B.box(6.6, Hc + y0, 4.2, M.wall, 0, (Hc + y0) / 2, -2.1, new THREE.Vector3(0, -6, 0), 0);
  B.box(6.7, y0, 4.3, M.stoneDark, 0, y0 / 2, -2.1, new THREE.Vector3(0, -3, 0), 0.05);
  const face = (segments, origin, dir, normal, delBase) => {
    // segments: [{w, type:'c'|'w'}] laid out along dir starting at origin
    let s = 0;
    const rows = 9, rh = Hc / rows;
    segments.forEach(seg => {
      const cx = s + seg.w / 2;
      const pos = (u, y, out) => origin.clone().add(dir.clone().multiplyScalar(u)).add(normal.clone().multiplyScalar(out)).setY(y);
      const rotY = Math.atan2(normal.x, normal.z);
      if (seg.type === 'c') {
        const cols = Math.max(1, Math.round(seg.w / 0.95)), cw = seg.w / cols;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const m = new THREE.Mesh(B.geo(cw - 0.018, rh - 0.018, 0.04), M.cassette);
          m.position.copy(pos(s + cw * (c + 0.5), y0 + rh * (r + 0.5), 0.03)); m.rotation.y = rotY;
          B.add(m, normal.clone().multiplyScalar(4).add(new THREE.Vector3(0, 1.5, 0)), delBase + r * 0.07 + c * 0.03 + s * 0.02);
        }
      } else {
        // dark linear lamellas around a tall window
        const lam = 0.16, nl = Math.round(Hc / lam);
        for (let k = 0; k < nl; k++) {
          const yy = y0 + lam * (k + 0.5);
          const inWin = (yy > y0 + 0.5 && yy < y0 + 2.4) || (yy > y0 + 3.1 && yy < y0 + 5.0);
          if (inWin) continue;
          const m = new THREE.Mesh(B.geo(seg.w, lam - 0.012, 0.05), M.linear);
          m.position.copy(pos(cx, yy, 0.035)); m.rotation.y = rotY;
          B.add(m, normal.clone().multiplyScalar(3).add(new THREE.Vector3(dir.x * 2, 0, dir.z * 2)), delBase + 0.4 + k * 0.03);
        }
        [[y0 + 0.5, y0 + 2.4], [y0 + 3.1, y0 + 5.0]].forEach(([a, b], i) => {
          const g = new THREE.Mesh(B.geo(seg.w - 0.2, b - a, 0.03), M.glass);
          g.position.copy(pos(cx, (a + b) / 2, 0.0)); g.rotation.y = rotY;
          B.add(g, normal.clone().multiplyScalar(2.5), delBase + 1.4 + i * 0.1);
          const f = new THREE.Mesh(B.geo(seg.w - 0.1, 0.06, 0.07), M.black);
          f.position.copy(pos(cx, a - 0.03, 0.04)); f.rotation.y = rotY;
          B.add(f, normal.clone().multiplyScalar(2.5), delBase + 1.5 + i * 0.1);
        });
      }
      s += seg.w;
    });
  };
  // front (+z) face
  face([{ w: 0.95, type: 'c' }, { w: 1.05, type: 'w' }, { w: 1.9, type: 'c' }, { w: 1.05, type: 'w' }, { w: 1.65, type: 'c' }],
    new THREE.Vector3(-3.3, 0, 0), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), 0.3);
  // right side (+x) face
  face([{ w: 1.6, type: 'c' }, { w: 1.05, type: 'w' }, { w: 1.55, type: 'c' }],
    new THREE.Vector3(3.3, 0, 0), new THREE.Vector3(0, 0, -1), new THREE.Vector3(1, 0, 0), 0.6);
  // mansard roof
  const shape = new THREE.Shape();
  shape.moveTo(-3.45, 0); shape.lineTo(3.45, 0); shape.lineTo(2.7, 1.3); shape.lineTo(-2.7, 1.3); shape.closePath();
  const rg = new THREE.ExtrudeGeometry(shape, { depth: 4.5, bevelEnabled: false });
  rg.translate(0, 0, -4.5 + 0.15);
  const roof = new THREE.Mesh(rg, M.roof);
  roof.position.set(0, y0 + Hc, 0);
  B.add(roof, new THREE.Vector3(0, 5, 0), 2.4);
  // cornice
  B.box(7.0, 0.12, 0.25, M.black, 0, y0 + Hc + 0.02, 0.15, new THREE.Vector3(0, 4, 0), 2.3);
  B.box(0.25, 0.12, 4.4, M.black, 3.42, y0 + Hc + 0.02, -2.05, new THREE.Vector3(0, 4, 0), 2.3);
  B.box(8.4, 0.06, 6.4, M.paving, 0, -0.03, -1.2, new THREE.Vector3(0, -3, 0), 0);
  return { group: B.group, parts: B.parts, view: { yaw: -0.55, elev: 0.1, target: new THREE.Vector3(0.6, 3.1, -1.4), radius: 5.8 } };
}

/* ============ showroom ============ */
export function createShowroom(canvas, { onReady } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  const key = new THREE.DirectionalLight(0xfff0d8, 2.6);
  key.position.set(5, 8, 6); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xe9b320, 2.2); rim.position.set(-6, 4, -6); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xdfe6ee, 0x1a1a1c, 0.5));

  const turn = new THREE.Group(); scene.add(turn);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ map: glowTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.rotation.x = -Math.PI / 2; glow.position.y = -0.06; scene.add(glow);
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.45 }));
  catcher.rotation.x = -Math.PI / 2; catcher.position.y = -0.07; catcher.receiveShadow = true; scene.add(catcher);

  const M = makeMaterials();
  const builders = { gates: buildGates, canopy: buildCanopy, ceiling: buildCeiling, facade: buildFacade };
  const cache = {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cur = null, curKey = null, phase = 'idle', phaseT = 0, queued = null;
  const view = { yaw: 0, elev: 0.15, target: new THREE.Vector3(0, 1, 0), radius: 4 };
  const viewTo = { ...view, target: view.target.clone() };
  let userYaw = 0, userVel = 0, dragging = false, lastInteract = -10;

  function fitDistance(radius) {
    const vf = THREE.MathUtils.degToRad(camera.fov);
    const hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
    const f = Math.min(vf, hf);
    return radius / Math.sin(f / 2) * 0.92;
  }

  function show(k) {
    if (k === curKey && !queued) return;
    if (phase === 'out') { queued = k; return; }
    if (cur && phase !== 'out') { phase = 'out'; phaseT = 0; queued = k; return; }
    mount(k);
  }
  function mount(k) {
    if (cur) turn.remove(cur.group);
    cur = cache[k] || (cache[k] = builders[k](M));
    curKey = k; queued = null;
    turn.add(cur.group);
    Object.assign(viewTo, { yaw: cur.view.yaw, elev: cur.view.elev, radius: cur.view.radius }); viewTo.target = cur.view.target.clone();
    userYaw *= 0.3;
    phase = 'in'; phaseT = 0;
    applyParts(reduced ? 99 : 0, 'in');
  }
  function applyParts(t, mode) {
    for (const p of cur.parts) {
      let e;
      if (mode === 'in') { e = easeOut(clamp((t - p.delay * 0.85) / 0.9, 0, 1)); }
      else { e = 1 - easeIn(clamp((t - (1 - p.delay / 3) * 0.15) / 0.45, 0, 1)); }
      p.mesh.position.copy(p.end).addScaledVector(p.from, 1 - e);
      p.mesh.quaternion.copy(p.startQ).slerp(p.endQ, e);
      p.mesh.visible = e > 0.001;
    }
  }
  const maxDelay = () => cur.parts.reduce((m, p) => Math.max(m, p.delay), 0) * 0.85 + 0.9;

  /* interaction: horizontal drag rotates, vertical scroll stays with the page */
  let sx = 0, sy = 0, lx = 0, lockAxis = null;
  canvas.addEventListener('pointerdown', e => { dragging = true; lockAxis = null; sx = lx = e.clientX; sy = e.clientY; lastInteract = clock.elapsedTime; });
  addEventListener('pointermove', e => {
    if (!dragging) return;
    if (!lockAxis) { const dx = Math.abs(e.clientX - sx), dy = Math.abs(e.clientY - sy); if (dx + dy > 6) lockAxis = dx > dy ? 'x' : 'y'; }
    if (lockAxis === 'x') { const d = (e.clientX - lx) * 0.008; userYaw += d; userVel = d; }
    lx = e.clientX; lastInteract = clock.elapsedTime;
  });
  addEventListener('pointerup', () => { dragging = false; });
  addEventListener('pointercancel', () => { dragging = false; });

  function resize() {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '100px' }).observe(canvas);

  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!visible || document.hidden || !cur) return;
    const t = clock.elapsedTime;
    phaseT += dt;
    if (phase === 'in') { applyParts(phaseT, 'in'); if (phaseT > maxDelay()) { phase = 'idle'; applyParts(99, 'in'); } }
    else if (phase === 'out') { applyParts(phaseT, 'out'); if (phaseT > 0.62) mount(queued || curKey); }

    if (!dragging) { userYaw += userVel; userVel *= 0.92; }
    const idle = t - lastInteract > 3.5 && !reduced;
    const sway = idle ? Math.sin(t * 0.22) * 0.22 : 0;
    const k = 1 - Math.pow(0.02, dt);
    view.yaw += (viewTo.yaw - view.yaw) * k;
    view.elev += (viewTo.elev - view.elev) * k;
    view.radius += (viewTo.radius - view.radius) * k;
    view.target.lerp(viewTo.target, k);
    turn.rotation.y += ((view.yaw + userYaw + sway) - turn.rotation.y) * (1 - Math.pow(0.05, dt));

    const dist = fitDistance(view.radius);
    camera.position.set(view.target.x, view.target.y + Math.sin(view.elev) * dist, view.target.z + Math.cos(view.elev) * dist);
    camera.lookAt(view.target);
    renderer.render(scene, camera);
  }
  frame();
  if (onReady) onReady();
  return { show, get current() { return curKey; } };
}
