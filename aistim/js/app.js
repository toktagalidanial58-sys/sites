/* ===== AIS-TIM — settings ===== */
const CFG = {
  whatsapp: '77471203974',          // номер WhatsApp (только цифры, без +)
  phone: '+77770259612',
  phoneText: '8 777 025 96 12',
  instagram: 'https://www.instagram.com/ais_tim.kz',
  tiktok: 'https://www.tiktok.com/@ais_tim.kz',
  gis: 'https://2gis.kz/almaty/geo/70000001075829096'
};

const MODELS = {
  gates:   { name: 'Ворота', price: '500 000 ₸', desc: 'Распашные ворота с калиткой, решёткой и автоматикой.', img: 'img/vorota-1.webp' },
  canopy:  { name: 'Навесы и террасы', price: '15 000 ₸/м²', desc: 'Каркас из металла, кровля из израильского поликарбоната.', img: 'img/terrasa-1.webp' },
  ceiling: { name: 'Кубический потолок', price: '10 000 ₸/м²', desc: 'Рейки кубического профиля со встроенной подсветкой.', img: 'img/potolok-1.webp' },
  facade:  { name: 'Фасады', price: '10 000 ₸/м²', desc: 'Металлокассеты и линеарные панели.', img: 'img/fasad-2.webp' }
};

const WORKS = [
  { src: 'img/vorota-1.webp', f: 'vorota', t: 'Распашные ворота с калиткой', w: 1195, h: 896 },
  { src: 'img/terrasa-1.webp', f: 'naves', t: 'Терраса с навесом из поликарбоната', w: 1280, h: 960 },
  { src: 'img/fasad-2.webp', f: 'fasad', t: 'Фасад: металлокассеты и линеарные панели', w: 1200, h: 1600 },
  { src: 'img/potolok-1.webp', f: 'potolok', t: 'Кубический потолок под дерево с подсветкой', w: 1023, h: 1170 },
  { src: 'img/naves-1.webp', f: 'naves', t: 'Навес для машин, металлочерепица', w: 1280, h: 960 },
  { src: 'img/fasad-1.webp', f: 'fasad', t: 'Фасад частного дома', w: 1200, h: 1600 },
  { src: 'img/vorota-2.webp', f: 'vorota', t: 'Монтаж ворот и калитки', w: 1280, h: 960 },
  { src: 'img/potolok-2.webp', f: 'potolok', t: 'Кубический потолок в графите', w: 719, h: 1280 },
  { src: 'img/fasad-3.webp', f: 'fasad', t: 'Облицовка коммерческого здания', w: 960, h: 1280 },
  { src: 'img/naves-2.webp', f: 'naves', t: 'Навес во дворе частного дома', w: 1280, h: 960 },
  { src: 'img/potolok-3.webp', f: 'potolok', t: 'Козырёк с кубическим потолком', w: 589, h: 1052 },
  { src: 'img/fasad-4.webp', f: 'fasad', t: 'Фасад частного дома', w: 960, h: 1280 }
];

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ===== links ===== */
const wa = msg => `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(msg || 'Здравствуйте!')}`;
$$('.js-wa').forEach(a => { a.href = wa(a.dataset.msg); a.target = '_blank'; a.rel = 'noopener'; });
$$('.js-tel').forEach(a => a.href = 'tel:' + CFG.phone);
$$('.js-tel-text').forEach(a => a.textContent = CFG.phoneText);
$$('.js-ig').forEach(a => a.href = CFG.instagram);
$$('.js-tt').forEach(a => a.href = CFG.tiktok);
$$('.js-2gis').forEach(a => a.href = CFG.gis);
$$('.js-year').forEach(e => e.textContent = new Date().getFullYear());
const yrs = new Date().getFullYear() - 2017;
const plural = (n, a, b, c) => { const m = n % 100, k = n % 10; return m > 10 && m < 20 ? c : k === 1 ? a : k > 1 && k < 5 ? b : c; };
$$('.js-years').forEach(e => { e.textContent = yrs; e.nextSibling.textContent = ' ' + plural(yrs, 'год', 'года', 'лет'); });

/* ===== nav ===== */
const nav = $('#nav');
const onScroll = () => nav.classList.toggle('is-solid', scrollY > 20);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* ===== reveal on scroll ===== */
document.documentElement.classList.add('js');
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
function watch(root = document) {
  $$('.reveal, .reveal-clip, .steps, .process__line', root).forEach((el) => {
    // stagger siblings
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    const i = sibs.indexOf(el);
    if (i > 0) el.style.transitionDelay = Math.min(i * 70, 420) + 'ms';
    io.observe(el);
  });
}
watch();
requestAnimationFrame(() => document.body.classList.add('loaded'));

/* ===== counter ===== */
$$('.js-count').forEach(el => {
  const to = +el.dataset.to;
  const fmt = n => n.toLocaleString('ru-RU').replace(/ /g, ' ');
  if (reduced) { el.textContent = fmt(to); return; }
  const o = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return; o.disconnect();
    const t0 = performance.now(), dur = 1800;
    const step = now => { const p = Math.min(1, (now - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - p, 4))); el.textContent = fmt(v); if (p < 1) requestAnimationFrame(step); };
    el.textContent = '0'; requestAnimationFrame(step);
  });
  o.observe(el);
});

/* ===== 3D showroom ===== */
const tabs = $$('.stage__tabs [data-model]');
const setInfo = k => {
  const m = MODELS[k];
  $('#stName').textContent = m.name; $('#stDesc').textContent = m.desc; $('#stPrice').textContent = m.price;
  tabs.forEach(b => b.setAttribute('aria-selected', String(b.dataset.model === k)));
  const fb = $('.stage__fallback img'); if (fb) { fb.src = m.img; fb.alt = m.name; }
};
setInfo('gates');
let room = null;
function webglOK() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } }
if (webglOK()) {
  import('./scene.js').then(({ createShowroom }) => {
    room = createShowroom($('#scene'));
    room.show('gates');
    document.body.classList.add('scene-ready');
  }).catch(err => { console.error(err); fallback(); });
} else fallback();
function fallback() { $('#scene').hidden = true; $('.stage__fallback').hidden = false; $('.stage__hint').hidden = true; }
tabs.forEach(b => b.addEventListener('click', () => { const k = b.dataset.model; setInfo(k); room && room.show(k); }));

/* ===== works grid + filter + lightbox ===== */
const grid = $('#worksGrid');
grid.innerHTML = WORKS.map((w, i) => `
  <button class="work reveal" data-f="${w.f}" data-i="${i}" style="--ar:${w.w}/${w.h}">
    <img src="${w.src}" alt="${w.t}" loading="lazy" width="${w.w}" height="${w.h}">
    <span class="work__cap">${w.t}</span>
  </button>`).join('');
watch(grid);
let filter = 'all';
$$('.filters button').forEach(b => b.addEventListener('click', () => {
  filter = b.dataset.f;
  $$('.filters button').forEach(x => x.setAttribute('aria-selected', String(x === b)));
  $$('.work', grid).forEach(w => {
    const on = filter === 'all' || w.dataset.f === filter;
    if (on) { w.hidden = false; requestAnimationFrame(() => w.classList.remove('is-off')); }
    else { w.classList.add('is-off'); setTimeout(() => { if (w.classList.contains('is-off')) w.hidden = true; }, 260); }
  });
}));

const lb = $('#lb'), lbImg = $('img', lb), lbCap = $('figcaption', lb);
let list = [], pos = 0;
function openLb(i) {
  list = WORKS.map((w, k) => k).filter(k => filter === 'all' || WORKS[k].f === filter);
  pos = Math.max(0, list.indexOf(i));
  draw(); lb.hidden = false; requestAnimationFrame(() => lb.classList.add('open'));
  document.body.style.overflow = 'hidden';
}
function draw() { const w = WORKS[list[pos]]; lbImg.src = w.src; lbImg.alt = w.t; lbCap.textContent = w.t; }
function closeLb() { lb.classList.remove('open'); document.body.style.overflow = ''; setTimeout(() => lb.hidden = true, 250); }
const go = d => { pos = (pos + d + list.length) % list.length; draw(); };
grid.addEventListener('click', e => { const b = e.target.closest('.work'); if (b) openLb(+b.dataset.i); });
$('.lb__x', lb).onclick = closeLb;
$('.lb__prev', lb).onclick = () => go(-1);
$('.lb__next', lb).onclick = () => go(1);
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1);
});
let tx = 0;
lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) go(d < 0 ? 1 : -1); });

/* ===== subtle parallax on CTA bg ===== */
const ctaBg = $('.cta__bg img');
if (ctaBg && !reduced) {
  addEventListener('scroll', () => {
    const r = ctaBg.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
    ctaBg.style.transform = `translate3d(0, ${p * -60}px, 0) scale(1.15)`;
  }, { passive: true });
}
