import * as THREE from './three.module.min.js';
import { RoundedBoxGeometry } from './RoundedBoxGeometry.js';
import { RoomEnvironment } from './RoomEnvironment.js';

const COLORS = ['#FF9A1F', '#2D63E8', '#FFC23C', '#3DBE6B', '#FF6F9C', '#21A8E8', '#FF5A4E'];
const ROWS = [['Б', 'О', 'Т', 'А'], ['Қ', 'А', 'Н']];

function faceTexture(letter, color) {
  const s = 512, c = document.createElement('canvas'); c.width = c.height = s;
  const g = c.getContext('2d');
  g.fillStyle = color; g.fillRect(0, 0, s, s);
  // soft inner panel
  const gr = g.createRadialGradient(s * 0.4, s * 0.35, 10, s / 2, s / 2, s * 0.75);
  gr.addColorStop(0, 'rgba(255,255,255,.28)'); gr.addColorStop(1, 'rgba(0,0,0,.08)');
  g.fillStyle = gr; g.fillRect(0, 0, s, s);
  g.font = `800 ${s * 0.62}px Rubik, sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = 'rgba(0,0,0,.16)'; g.fillText(letter, s / 2 + 10, s / 2 + 26);
  g.fillStyle = '#fff'; g.fillText(letter, s / 2, s / 2 + 14);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function starShape(r1, r2, n = 5) {
  const sh = new THREE.Shape();
  for (let i = 0; i <= n * 2; i++) {
    const r = i % 2 ? r2 : r1, a = (i / (n * 2)) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    i ? sh.lineTo(x, y) : sh.moveTo(x, y);
  }
  return sh;
}

export function createBlocks(canvas) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.7;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  const sun = new THREE.DirectionalLight(0xfff3df, 2.4);
  sun.position.set(4, 9, 7); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
  sun.shadow.radius = 6; sun.shadow.bias = -0.0005;
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xdff0ff, 0xffe6c4, 0.9));

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.16 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  /* ---- blocks: БОТА on the bottom, ҚАН stacked on top ---- */
  const S = 1, GAP = 0.08;
  const geo = new RoundedBoxGeometry(S, S, S, 5, 0.14);
  const blocks = [];
  let ci = 0;
  ROWS.forEach((row, r) => {
    row.forEach((ch, i) => {
      const color = COLORS[ci % COLORS.length];
      const side = new THREE.MeshPhysicalMaterial({ color, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12 });
      const tex = faceTexture(ch, color);
      const face = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12 });
      const top = side.clone();
      const mesh = new THREE.Mesh(geo, [side, side, top, side, face, face]);
      mesh.castShadow = true; mesh.receiveShadow = true;
      const x = (i - (row.length - 1) / 2) * (S + GAP);
      const y = S / 2 + r * S;
      const tilt = r === 1 ? (i - 1) * 0.06 : (i - 1.5) * -0.05;
      const b = {
        mesh, home: new THREE.Vector3(x, y, r === 1 ? 0.04 : 0), homeRot: tilt,
        y: y + 5 + ci * 0.45 + r * 1.2, vy: 0, delay: ci * 0.12, landed: false,
        spin: 0, spinV: 0, startRot: new THREE.Euler((Math.random() - .5) * 2, (Math.random() - .5) * 2, (Math.random() - .5) * 2),
        hover: 0, row: r
      };
      mesh.position.set(x, b.y, b.home.z);
      mesh.userData.b = b;
      scene.add(mesh); blocks.push(b); ci++;
    });
  });

  /* ---- decor: glossy balls + 3D stars ---- */
  const decor = [];
  const ballGeo = new THREE.SphereGeometry(0.28, 32, 24);
  const starGeo = new THREE.ExtrudeGeometry(starShape(0.32, 0.14), { depth: 0.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 4 });
  starGeo.center();
  const decoSpec = [
    ['ball', '#FF6F9C', -2.6, 2.7, -1.0], ['star', '#FFC23C', 2.5, 3.0, -0.6], ['ball', '#21A8E8', 2.9, 1.0, -1.4],
    ['star', '#FF9A1F', -2.7, 0.8, -1.0], ['ball', '#3DBE6B', -1.3, 3.5, -1.8], ['star', '#2D63E8', 1.2, 3.7, -1.6]
  ];
  decoSpec.forEach(([k, col, x, y, z], i) => {
    const m = new THREE.Mesh(k === 'ball' ? ballGeo : starGeo, new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 }));
    m.position.set(x, y, z); m.castShadow = true;
    if (k === 'ball') m.scale.setScalar(0.8 + (i % 3) * 0.2);
    scene.add(m); decor.push({ m, base: new THREE.Vector3(x, y, z), ph: i * 1.3, k });
  });

  /* ---- interaction ---- */
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(9, 9);
  let px = 0, py = 0, tpx = 0, tpy = 0;
  const meshes = blocks.map(b => b.mesh);
  function setPtr(e) {
    const r = canvas.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  }
  canvas.addEventListener('pointermove', e => { setPtr(e); tpx = ptr.x; tpy = ptr.y; });
  canvas.addEventListener('pointerleave', () => { ptr.set(9, 9); tpx = tpy = 0; });
  canvas.addEventListener('pointerdown', e => {
    setPtr(e); ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObjects(meshes)[0];
    if (!hit) return;
    const b = hit.object.userData.b;
    if (!b.landed) return;
    // a block jumps and flips; blocks stacked above jump with it
    blocks.forEach(o => {
      const above = o === b || (b.row === 0 && o.row === 1 && Math.abs(o.home.x - b.home.x) < 1.05);
      if (above && o.landed) { o.vy = 7.5 + (o === b ? 0 : 0.4); o.landed = false; o.delay = 0; o.spinV = o === b ? Math.PI * 2 : 0; o.spin = 0; o.jump = true; }
    });
  });
  canvas.style.cursor = 'pointer';

  function resize() {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas); resize();
  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(canvas);

  const G = -26, clock = new THREE.Clock();
  if (reduced) blocks.forEach(b => { b.y = b.home.y; b.landed = true; });
  const q0 = new THREE.Quaternion(), q1 = new THREE.Quaternion(), e1 = new THREE.Euler();

  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 1 / 30);
    if (!visible || document.hidden) return;
    const t = clock.elapsedTime;

    for (const b of blocks) {
      if (b.delay > 0) { b.delay -= dt; continue; }
      if (!b.landed) {
        b.vy += G * dt; b.y += b.vy * dt;
        if (b.y <= b.home.y) {
          b.y = b.home.y;
          if (Math.abs(b.vy) > 2.2) b.vy = -b.vy * 0.36; else { b.vy = 0; b.landed = true; b.jump = false; }
        }
      }
      // rotation: tumble while falling, settle when landed
      const fallK = clamp01((b.y - b.home.y) / 6);
      if (b.spinV) { b.spin = Math.min(Math.PI * 2, b.spin + dt * 9); if (b.spin >= Math.PI * 2) { b.spinV = 0; b.spin = 0; } }
      const sr = b.jump ? 0 : fallK;
      e1.set(b.startRot.x * sr + b.spin, b.startRot.y * sr, b.startRot.z * sr + b.homeRot * (1 - sr));
      q1.setFromEuler(e1);
      b.mesh.quaternion.slerp(q1, 1 - Math.pow(0.0005, dt));
      // hover lift
      b.hover += ((b.isHover ? 1 : 0) - b.hover) * (1 - Math.pow(0.001, dt));
      b.mesh.position.set(b.home.x, b.y + b.hover * 0.12, b.home.z);
      b.mesh.scale.setScalar(1 + b.hover * 0.05);
    }

    // hover test
    ray.setFromCamera(ptr, camera);
    const hit = ptr.x < 5 ? ray.intersectObjects(meshes)[0] : null;
    blocks.forEach(b => b.isHover = !!hit && hit.object === b.mesh && b.landed);

    decor.forEach((d, i) => {
      d.m.position.set(d.base.x + Math.sin(t * 0.6 + d.ph) * 0.12, d.base.y + Math.sin(t * 0.9 + d.ph) * 0.18, d.base.z);
      if (d.k === 'star') { d.m.rotation.y = t * 0.8 + d.ph; d.m.rotation.z = Math.sin(t + d.ph) * 0.2; }
    });

    // camera framing + parallax
    px += (tpx - px) * (1 - Math.pow(0.02, dt)); py += (tpy - py) * (1 - Math.pow(0.02, dt));
    const target = new THREE.Vector3(0, 1.45, 0);
    const vf = THREE.MathUtils.degToRad(camera.fov), hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
    const needW = 6.2, needH = 4.3;
    const dist = Math.max((needW / 2) / Math.tan(hf / 2), (needH / 2) / Math.tan(vf / 2));
    const sway = reduced ? 0 : Math.sin(t * 0.3) * 0.12;
    camera.position.set(px * 0.9 + sway, target.y + 1.3 + py * 0.5, dist);
    camera.lookAt(target);
    renderer.render(scene, camera);
  }
  frame();
}
const clamp01 = x => Math.min(1, Math.max(0, x));
