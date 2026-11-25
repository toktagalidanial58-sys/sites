/* ===== «Ботақан» — баптаулар ===== */
const CFG = {
  whatsapp: '77759831437',
  phone: '+77759831437',
  phoneText: '8 775 983 14 37',
  instagram: 'https://www.instagram.com/botaqan_balabaqwasy',
  gis: 'https://2gis.kz/almaty/geo/70000001033531294'
};

const PHOTOS = [
  ['p03', 'Мобильді кітапхана: «Ертегілер еліне саяхат»'],
  ['p01', 'Ұйықтау бөлмесі мен сабақ үстелдері'],
  ['p02', 'Кең дәліз бен спорт бұрышы'],
  ['p12', 'Ойын кілемі бар топ бөлмесі'],
  ['p05', 'Түрлі түсті баспалдақ'],
  ['p04', 'Әр балаға жеке шкаф'],
  ['p14', 'Ас үстелдері мен төсектер'],
  ['p09', '«Шынықсаң — шымыр боласың» спорт бұрышы'],
  ['p11', 'Жарық топ бөлмесі'],
  ['p07', 'Жол ережесі мен өрт қауіпсіздігі бұрышы'],
  ['p10', 'Сабақ бөлмесі'],
  ['p13', 'Ойыншықтар'],
  ['p06', 'Жарық дәліз'],
  ['p08', 'Құндылықтар қабырғасы'],
  ['p15', 'Таза санитарлық бөлме']
];

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
document.documentElement.classList.add('js');

/* links */
const wa = m => `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(m || 'Сәлеметсіз бе!')}`;
$$('.js-wa').forEach(a => { a.href = wa(a.dataset.msg); a.target = '_blank'; a.rel = 'noopener'; });
$$('.js-tel').forEach(a => a.href = 'tel:' + CFG.phone);
$$('.js-tel-text').forEach(a => a.textContent = CFG.phoneText);
$$('.js-ig').forEach(a => a.href = CFG.instagram);
$$('.js-2gis').forEach(a => a.href = CFG.gis);
$$('.js-year').forEach(e => e.textContent = new Date().getFullYear());

/* nav */
const nav = $('#nav');
const onScroll = () => nav.classList.toggle('is-solid', scrollY > 10);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
requestAnimationFrame(() => document.body.classList.add('loaded'));

/* gallery */
const track = $('#galTrack');
track.innerHTML = PHOTOS.map(([f, t], i) => `
  <button class="shot" data-i="${i}" style="--r:${[-2, 1.5, -1, 2, -1.5][i % 5]}deg">
    <img src="img/${f}.webp" alt="${t}" loading="lazy">
    <span>${t}</span>
  </button>`).join('');

/* reveal */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
$$('.rv, .rv-clip').forEach(el => {
  const sib = [...el.parentElement.children].filter(c => c.classList.contains('rv'));
  const i = sib.indexOf(el);
  if (i > 0) el.style.transitionDelay = Math.min(i * 70, 490) + 'ms';
  io.observe(el);
});

/* counters */
$$('.js-count').forEach(el => {
  const to = +el.dataset.to; if (reduced) return;
  const o = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return; o.disconnect();
    let n = 0; el.textContent = '0';
    const id = setInterval(() => { n++; el.textContent = n; if (n >= to) clearInterval(id); }, 160);
  });
  o.observe(el);
});

/* 3D tilt */
if (matchMedia('(hover:hover)').matches && !reduced) {
  $$('.tilt').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(800px) rotateX(${-y * 10}deg) rotateY(${x * 12}deg) translateY(-4px)`;
      el.style.setProperty('--gx', (x + .5) * 100 + '%'); el.style.setProperty('--gy', (y + .5) * 100 + '%');
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* horizontal gallery driven by vertical scroll (desktop) */
const gal = $('#gallery'), sticky = $('.gal__sticky');
function galLayout() {
  if (innerWidth < 900 || reduced) { gal.style.height = ''; track.style.transform = ''; gal.classList.remove('is-pinned'); return; }
  gal.classList.add('is-pinned');
  const dist = track.scrollWidth - innerWidth + 80;
  gal.style.height = (innerHeight + Math.max(0, dist) * 0.6) + "px";
  galScroll();
}
function galScroll() {
  if (!gal.classList.contains('is-pinned')) return;
  const r = gal.getBoundingClientRect();
  const max = gal.offsetHeight - innerHeight;
  const p = Math.min(1, Math.max(0, -r.top / max));
  const dist = track.scrollWidth - innerWidth + 80;
  track.style.transform = `translate3d(${-p * dist}px,0,0)`;
}
addEventListener('resize', galLayout); addEventListener('scroll', galScroll, { passive: true });
addEventListener('load', galLayout); galLayout();

/* lightbox */
const lb = $('#lb'), lbImg = $('img', lb), lbCap = $('figcaption', lb);
let pos = 0;
const draw = () => { const [f, t] = PHOTOS[pos]; lbImg.src = `img/${f}.webp`; lbImg.alt = t; lbCap.textContent = t; };
const open = i => { pos = i; draw(); lb.hidden = false; requestAnimationFrame(() => lb.classList.add('open')); document.body.style.overflow = 'hidden'; };
const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; setTimeout(() => lb.hidden = true, 250); };
const go = d => { pos = (pos + d + PHOTOS.length) % PHOTOS.length; draw(); };
track.addEventListener('click', e => { const b = e.target.closest('.shot'); if (b) open(+b.dataset.i); });
$('.lb__x', lb).onclick = close; $('.lb__prev', lb).onclick = () => go(-1); $('.lb__next', lb).onclick = () => go(1);
lb.addEventListener('click', e => { if (e.target === lb) close(); });
addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); });
let tx = 0;
lb.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) go(d < 0 ? 1 : -1); });

/* sign-up form -> WhatsApp */
$('#signForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, el = n => f.elements.namedItem(n), name = el("pname").value.trim(), age = el("age").value, q = el("q").value.trim();
  const err = $('.form__err', f);
  if (!name || !age) { err.hidden = false; return; }
  err.hidden = true;
  const msg = `Сәлеметсіз бе! Сынақ күніне жазылғым келеді.\nАтым: ${name}\nБаламның жасы: ${age}` + (q ? `\nСұрақ: ${q}` : '');
  window.open(wa(msg), '_blank', 'noopener');
});

/* 3D blocks */
function webgl() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } }
const cv = $('#blocks');
if (webgl()) {
  document.fonts.load('800 64px Rubik').catch(() => {}).finally(() => {
    import('./blocks.js').then(m => { m.createBlocks(cv); document.body.classList.add('blocks-ready'); })
      .catch(err => { console.error(err); fb(); });
  });
} else fb();
function fb() { cv.hidden = true; $('.hero__fallback').hidden = false; $('.hero__hint').hidden = true; }

/* video */
(() => {
  const v = document.getElementById('bVideo'), b = document.getElementById('bPlay');
  if (!v || !b) return;
  const fr = v.parentElement;
  b.addEventListener('click', () => { v.controls = true; v.play(); });
  v.addEventListener('play', () => fr.classList.add('playing'));
  v.addEventListener('ended', () => { fr.classList.remove('playing'); v.controls = false; v.load(); });
})();
