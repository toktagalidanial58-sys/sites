import * as THREE from './three.module.min.js';
import { RoundedBoxGeometry } from './RoundedBoxGeometry.js';
import { RoomEnvironment } from './RoomEnvironment.js';

const canvas = document.getElementById('scene');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch (e) { return false; }
}

if (canvas && webglOK()) init();
else document.documentElement.classList.add('no3d');

function init() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  camera.position.set(0, 0, 7.2);

  /* ---------- backdrop: night over Almaty mountains ---------- */
  function skyTexture() {
    const c = document.createElement('canvas'); c.width = 2048; c.height = 1024;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 1024);
    g.addColorStop(0, '#050a16'); g.addColorStop(.45, '#0c1a33'); g.addColorStop(.72, '#1d3557'); g.addColorStop(1, '#2a3d5e');
    x.fillStyle = g; x.fillRect(0, 0, 2048, 1024);
    // stars
    for (let i = 0; i < 420; i++) {
      const sx = Math.random() * 2048, sy = Math.random() * 520, r = Math.random() * 1.3 + .2;
      x.fillStyle = `rgba(220,235,255,${Math.random() * .7 + .2})`; x.beginPath(); x.arc(sx, sy, r, 0, 7); x.fill();
    }
    // moon glow
    const mg = x.createRadialGradient(1520, 210, 0, 1520, 210, 260);
    mg.addColorStop(0, 'rgba(210,228,255,.55)'); mg.addColorStop(.12, 'rgba(210,228,255,.25)'); mg.addColorStop(1, 'rgba(210,228,255,0)');
    x.fillStyle = mg; x.fillRect(1100, 0, 900, 600);
    x.fillStyle = '#eef4ff'; x.beginPath(); x.arc(1520, 210, 34, 0, 7); x.fill();
    // mountain ranges
    function ridge(n, rough, seed) {
      let r = seed * 9301 + 49297; const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
      const N = 1 << n, a = new Array(N + 1).fill(0);
      a[0] = rnd(); a[N] = rnd();
      for (let step = N, amp = 1; step > 1; step >>= 1, amp *= rough)
        for (let i = step >> 1; i < N; i += step) a[i] = (a[i - (step >> 1)] + a[i + (step >> 1)]) / 2 + (rnd() - .5) * amp;
      const mn = Math.min(...a), mx = Math.max(...a); return a.map(v => (v - mn) / (mx - mn));
    }
    function range(base, amp, seed, col, snow) {
      const R = ridge(9, .56, seed); const N = R.length - 1;
      x.beginPath(); x.moveTo(0, 1024);
      for (let i = 0; i <= N; i++) x.lineTo(i / N * 2048, base - R[i] * amp);
      x.lineTo(2048, 1024); x.closePath();
      const mg = x.createLinearGradient(0, base - amp, 0, base + 60); mg.addColorStop(0, col[0]); mg.addColorStop(1, col[1]);
      x.fillStyle = mg; x.fill();
      if (snow) {
        x.save(); x.clip();
        for (let i = 0; i <= N; i++) {
          const px = i / N * 2048, py = base - R[i] * amp;
          if (R[i] > .55) { const depth = (R[i] - .55) * amp * .9; const sg = x.createLinearGradient(0, py, 0, py + depth);
            sg.addColorStop(0, 'rgba(236,244,255,.95)'); sg.addColorStop(1, 'rgba(236,244,255,0)'); x.fillStyle = sg; x.fillRect(px - 2, py, 6, depth); }
        }
        x.restore();
      }
    }
    range(650, 340, 3, ['#3a5580', '#22365a'], true);
    range(770, 220, 11, ['#22385e', '#16243f'], true);
    range(890, 110, 29, ['#121d33', '#0d1628'], false);
    // city lights
    for (let i = 0; i < 900; i++) {
      const cx = Math.random() * 2048, cy = 900 + Math.random() * 124;
      const warm = Math.random() > .25;
      x.fillStyle = warm ? `rgba(255,${180 + Math.random() * 50 | 0},120,${Math.random() * .8 + .2})` : `rgba(170,210,255,${Math.random() * .6 + .2})`;
      x.fillRect(cx, cy, Math.random() * 2.4 + .6, Math.random() * 2.4 + .6);
    }
    const hz = x.createLinearGradient(0, 860, 0, 1024);
    hz.addColorStop(0, 'rgba(255,170,90,0)'); hz.addColorStop(1, 'rgba(255,150,70,.18)');
    x.fillStyle = hz; x.fillRect(0, 860, 2048, 164);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    return t;
  }
  const back = new THREE.Mesh(new THREE.PlaneGeometry(26, 13), new THREE.MeshBasicMaterial({ map: skyTexture(), toneMapped: false }));
  back.position.set(0, 0.6, -7);
  scene.add(back);

  /* ---------- snow (outside) ---------- */
  const SN = innerWidth < 700 ? 700 : 1400;
  const sp = new Float32Array(SN * 3), sv = new Float32Array(SN);
  for (let i = 0; i < SN; i++) {
    sp[i * 3] = (Math.random() - .5) * 16; sp[i * 3 + 1] = (Math.random() - .5) * 9; sp[i * 3 + 2] = -6.5 + Math.random() * 6;
    sv[i] = .25 + Math.random() * .45;
  }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const flake = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
  })();
  const snow = new THREE.Points(sg, new THREE.PointsMaterial({ size: .07, map: flake, transparent: true, depthWrite: false, opacity: .9, toneMapped: false }));
  scene.add(snow);

  /* ---------- the window ---------- */
  const W = 2.5, H = 1.9, D = 0.13, F = 0.12;       // outer frame
  const pvc = new THREE.MeshPhysicalMaterial({ color: 0xf6f7f8, roughness: .32, metalness: 0, clearcoat: .6, clearcoatRoughness: .25 });
  const seal = new THREE.MeshStandardMaterial({ color: 0x1b1f26, roughness: .7 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xdfe3e8, metalness: 1, roughness: .18 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xeaf6ff, metalness: 0, roughness: .03, transmission: 1, thickness: .06, ior: 1.5,
    specularIntensity: 1, envMapIntensity: 1.4, transparent: true, opacity: 1
  });

  const win = new THREE.Group(); scene.add(win);
  const box = (w, h, d, r = .018, m = pvc) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), m);

  // outer frame
  const top = box(W, F, D); top.position.y = H / 2 - F / 2;
  const bot = box(W, F, D); bot.position.y = -H / 2 + F / 2;
  const lft = box(F, H, D); lft.position.x = -W / 2 + F / 2;
  const rgt = box(F, H, D); rgt.position.x = W / 2 - F / 2;
  const mul = box(.1, H - 2 * F, D * .95); mul.position.x = -.12;
  win.add(top, bot, lft, rgt, mul);

  // sill (подоконник)
  const sill = box(W + .34, .045, .42, .012); sill.position.set(0, -H / 2 - .02, .2); win.add(sill);

  // left fixed glass
  const innerL = -W / 2 + F, innerR = -.12 - .05;
  const lgW = innerR - innerL, lgH = H - 2 * F;
  const lg = new THREE.Mesh(new THREE.BoxGeometry(lgW - .02, lgH - .02, .028), glass);
  lg.position.set((innerL + innerR) / 2, 0, 0); win.add(lg);
  const beadL = new THREE.Group();
  [[lgW, .035, 0, lgH / 2 - .018], [lgW, .035, 0, -lgH / 2 + .018], [.035, lgH, -lgW / 2 + .018, 0], [.035, lgH, lgW / 2 - .018, 0]].forEach(([w, h, x, y]) => {
    const b = box(w, h, .04, .01); b.position.set(x, y, .04); beadL.add(b);
  });
  beadL.position.x = lg.position.x; win.add(beadL);

  // right opening sash: tilt pivot (bottom) -> turn pivot (right hinge) -> sash
  const sL = -.12 + .05, sR = W / 2 - F;
  const sW = sR - sL, sH = H - 2 * F, SF = .085;
  const tilt = new THREE.Group(); tilt.position.set((sL + sR) / 2, -sH / 2, .015); win.add(tilt);
  const turn = new THREE.Group(); turn.position.set(sW / 2, sH / 2, 0); tilt.add(turn);
  const sash = new THREE.Group(); sash.position.set(-sW / 2, 0, 0); turn.add(sash);
  [[sW, SF, 0, sH / 2 - SF / 2], [sW, SF, 0, -sH / 2 + SF / 2], [SF, sH, -sW / 2 + SF / 2, 0], [SF, sH, sW / 2 - SF / 2, 0]].forEach(([w, h, x, y]) => {
    const b = box(w, h, .1, .016); b.position.set(x, y, .03); sash.add(b);
  });
  const sg2 = new THREE.Mesh(new THREE.BoxGeometry(sW - SF * 2, sH - SF * 2, .028), glass); sg2.position.z = .03; sash.add(sg2);
  // handle
  const hb = box(.05, .13, .03, .012, chrome); hb.position.set(-sW / 2 + SF / 2, .05, .1); sash.add(hb);
  const hl = box(.035, .24, .035, .015, chrome); hl.position.set(-sW / 2 + SF / 2, -.07, .125); sash.add(hl);

  // warm interior light + cool moon rim
  const warm = new THREE.PointLight(0xffb36b, 9, 9, 1.6); warm.position.set(-2.2, -1.2, 2.4); scene.add(warm);
  const warm2 = new THREE.PointLight(0xffc98f, 4, 8, 1.8); warm2.position.set(2.6, 1.4, 2.2); scene.add(warm2);
  const moon = new THREE.DirectionalLight(0x9fc4ff, 1.4); moon.position.set(2, 3, -4); scene.add(moon);
  scene.add(new THREE.AmbientLight(0x8fa3c4, .35));

  // glow halo behind frame edges (soft plane)
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.9, H * 1.9), new THREE.MeshBasicMaterial({
    map: (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
      const g = x.createRadialGradient(128, 128, 30, 128, 128, 128); g.addColorStop(0, 'rgba(120,170,255,.22)'); g.addColorStop(1, 'rgba(120,170,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c); })(),
    transparent: true, depthWrite: false, toneMapped: false
  }));
  halo.position.z = -.6; win.add(halo);

  /* ---------- state ---------- */
  const st = { turn: 0, tilt: 0, tTurn: 0, tTilt: 0 };
  window.oknaHero = {
    set(mode) {
      st.tTurn = mode === 'turn' ? 1.05 : 0;
      st.tTilt = mode === 'tilt' ? .2 : 0;
      document.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('on', b.dataset.mode === mode));
      document.documentElement.dataset.sash = mode;
    }
  };

  let px = 0, py = 0, dx = 0, dy = 0, drag = false, lx = 0, ly = 0, ry = 0, rx = 0;
  addEventListener('pointermove', e => { px = e.clientX / innerWidth - .5; py = e.clientY / innerHeight - .5; });
  canvas.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointerup', () => { drag = false; });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    dx += (e.clientX - lx) * .006; dy += (e.clientY - ly) * .004; lx = e.clientX; ly = e.clientY;
    dx = Math.max(-.9, Math.min(.9, dx)); dy = Math.max(-.35, Math.min(.35, dy));
  });

  let mobile = false, scrollK = 0;
  function resize() {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    mobile = camera.aspect < 1;
    camera.fov = mobile ? 44 : 32;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();
  addEventListener('scroll', () => { scrollK = Math.min(1, scrollY / innerHeight); }, { passive: true });

  // intro
  const t0 = performance.now();
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
    const intro = Math.min(1, (performance.now() - t0) / 2200), ei = 1 - Math.pow(1 - intro, 4);

    // snow
    const p = sg.attributes.position.array;
    for (let i = 0; i < SN; i++) {
      p[i * 3 + 1] -= sv[i] * dt * (reduced ? .3 : 1);
      p[i * 3] += Math.sin(t * .6 + i) * dt * .08;
      if (p[i * 3 + 1] < -4.5) p[i * 3 + 1] = 4.5;
    }
    sg.attributes.position.needsUpdate = true;

    // sash
    st.turn += (st.tTurn - st.turn) * Math.min(1, dt * 3.2);
    st.tilt += (st.tTilt - st.tilt) * Math.min(1, dt * 3.2);
    turn.rotation.y = st.turn; tilt.rotation.x = st.tilt;

    // pose
    const baseX = mobile ? 0 : 1.3, baseY = mobile ? 1.02 : 0.05;
    const s = mobile ? .72 : .9;
    win.scale.setScalar(s * (.86 + .14 * ei));
    if (!drag) { dx *= .965; dy *= .965; }
    ry += (((mobile ? -.2 : -.42) + (1 - ei) * .9) + px * .28 + dx - scrollK * .25 - ry) * .06;
    rx += ((.06 + py * .14 + dy) + scrollK * .12 - rx) * .06;
    win.rotation.set(rx, ry, 0);
    win.position.set(baseX, baseY + Math.sin(t * .8) * .04 + scrollK * .8, -(1 - ei) * 2);
    back.position.x = -px * .6; back.position.y = .6 + py * .3;
    renderer.render(scene, camera);
  }
  frame();
  document.documentElement.classList.add('has3d');
}
