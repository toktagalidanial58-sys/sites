/* =========================================================
   NOIR BARBERSHOP — app.js
   ▸ Чтобы поменять номер WhatsApp / телефон / Instagram / адрес —
     правьте только объект CONFIG ниже.
   ========================================================= */
const CONFIG = {
  whatsapp: '77000000000',            // номер WhatsApp без «+» и пробелов
  phoneDisplay: '+7 700 000 00 00',   // как показывать телефон на сайте
  instagram: 'noir.barbershop.kz',    // ник Instagram без @
  address: 'Алматы, проспект Достык, 105',
  open: 10, close: 21,                // часы работы (последняя запись — за час до закрытия)
  tz: 'Asia/Almaty'
};

const SERVICES = [
  { id: 'haircut', name: 'Мужская стрижка',      price: 8000,  dur: 60 },
  { id: 'fade',    name: 'Fade',                 price: 7000,  dur: 50 },
  { id: 'combo',   name: 'Стрижка + борода',     price: 12000, dur: 90 },
  { id: 'beard',   name: 'Моделирование бороды', price: 6000,  dur: 40 },
  { id: 'kids',    name: 'Детская стрижка',      price: 6000,  dur: 40 },
  { id: 'grey',    name: 'Камуфляж седины',      price: 8000,  dur: 30 }
];
const BARBERS = [
  { id: 'any',     name: 'Любой свободный мастер', short: 'любому мастеру', role: 'Подберём ближайшее время' },
  { id: 'arman',   name: 'Арман Сейткали',  short: 'Арману',  role: 'Head barber · 9 лет',  img: 'photo-1642795730901-84f82e088e17' },
  { id: 'dauren',  name: 'Даурен Ахметов',  short: 'Даурену', role: 'Beard master · 8 лет', img: 'photo-1598264294394-ba29cf557627' },
  { id: 'timur',   name: 'Тимур Ким',       short: 'Тимуру',  role: 'Senior barber · 6 лет', img: 'photo-1607346256330-dee7af15f7c5' },
  { id: 'alikhan', name: 'Алихан Нурланов', short: 'Алихану', role: 'Barber · 5 лет',       img: 'photo-1759346617233-9c57f44535fd' }
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = n => n.toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₸';
const unsplash = (id, w) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;
const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const waLink = text => `https://wa.me/${CONFIG.whatsapp}${text ? '?text=' + encodeURIComponent(text) : ''}`;

/* ---------- config → links ---------- */
$$('[data-wa-direct]').forEach(a => {
  a.href = waLink('Здравствуйте! Хочу записаться в NOIR Barbershop.');
  a.target = '_blank'; a.rel = 'noopener';
});
$$('[data-phone-link]').forEach(a => {
  a.href = 'tel:+' + CONFIG.whatsapp;
  if (!a.querySelector('svg')) a.textContent = CONFIG.phoneDisplay;
});
$$('[data-insta-link]').forEach(a => {
  a.href = 'https://instagram.com/' + CONFIG.instagram;
  if (!a.querySelector('svg') && a.textContent.startsWith('@')) a.textContent = '@' + CONFIG.instagram;
});
$('#routeBtn').href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(CONFIG.address);
$('#year').textContent = new Date().getFullYear();

/* ---------- broken image guard ---------- */
document.addEventListener('error', e => {
  if (e.target.tagName === 'IMG') e.target.classList.add('failed');
}, true);

/* ---------- preloader ---------- */
(() => {
  const bar = $('#plBar'), num = $('#plNum'), pl = $('#preloader');
  const heroImg = $('#heroMedia img');
  let p = 0, done = false, ready = false;
  const finish = () => {
    if (done) return; done = true;
    p = 100; bar.style.transform = 'scaleX(1)'; num.textContent = '100%';
    setTimeout(() => {
      pl.classList.add('done');
      document.body.classList.remove('locked');
      document.documentElement.classList.add('loaded');
      document.body.classList.add('loaded');
      setTimeout(() => pl.remove(), 1200);
    }, 250);
  };
  const markReady = () => { ready = true; };
  if (heroImg.complete) markReady(); else { heroImg.addEventListener('load', markReady); heroImg.addEventListener('error', markReady); }
  const tick = () => {
    if (done) return;
    const target = ready ? 100 : 86;
    p += (target - p) * (ready ? 0.18 : 0.045);
    bar.style.transform = `scaleX(${p / 100})`;
    num.textContent = Math.round(p) + '%';
    if (ready && p > 99) return finish();
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  setTimeout(finish, 3200); // safety: never block the site longer than 3.2s
})();

/* ---------- smooth scroll (desktop wheel) + parallax ---------- */
const scroller = (() => {
  let current = scrollY, target = scrollY, running = false;
  const enabled = !isTouch && !reduced;
  const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
  const locked = () => document.body.classList.contains('locked') || document.body.classList.contains('menu-open') || $('#lb').classList.contains('open');
  const loop = () => {
    current += (target - current) * 0.1;
    if (Math.abs(target - current) < 0.5) { current = target; running = false; }
    window.scrollTo(0, current);
    if (running) requestAnimationFrame(loop);
  };
  const start = () => { if (!running) { running = true; requestAnimationFrame(loop); } };
  if (enabled) {
    document.documentElement.classList.add('no-smooth');
    addEventListener('wheel', e => {
      if (e.ctrlKey || locked()) return;
      if (e.target.closest('[data-native-scroll]') && Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      const d = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
      if (!running) current = scrollY;
      target = Math.max(0, Math.min(maxScroll(), target + d));
      start();
    }, { passive: false });
    addEventListener('scroll', () => { if (!running) { current = target = scrollY; } }, { passive: true });
  }
  return {
    to(y) {
      y = Math.max(0, Math.min(maxScroll(), y));
      if (!enabled) { window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' }); return; }
      current = scrollY; target = y; start();
    }
  };
})();

// anchor links
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id === '#') { e.preventDefault(); return; }
  const el = id === '#top' ? document.body : $(id);
  if (!el) return;
  e.preventDefault();
  closeMenu();
  const y = id === '#top' ? 0 : el.getBoundingClientRect().top + scrollY - (id === '#booking' ? 70 : 0);
  scroller.to(y);
  history.replaceState(null, '', id === '#top' ? location.pathname : id);
});

/* ---------- nav ---------- */
const nav = $('#nav'), waFloat = $('#waFloat'), mbar = $('#mbar');
let lastY = scrollY;
const sections = $$('main section[id]');
const navLinks = $$('.nav__links a');
function onScroll() {
  const y = scrollY;
  nav.classList.toggle('scrolled', y > 40);
  const menuOpen = document.body.classList.contains('menu-open');
  nav.classList.toggle('hidden', !menuOpen && y > innerHeight * 0.9 && y > lastY + 2);
  if (y < lastY - 2) nav.classList.remove('hidden');
  lastY = y;
  const past = y > innerHeight * 0.6;
  waFloat.classList.toggle('show', past);
  const bookingEl = $('#booking').getBoundingClientRect();
  const inBooking = bookingEl.top < innerHeight * 0.6 && bookingEl.bottom > innerHeight * 0.4;
  mbar.classList.toggle('show', past && !inBooking);
  let cur = '';
  for (const s of sections) if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = s.id;
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- mobile menu ---------- */
const burger = $('#burger');
function closeMenu() {
  document.body.classList.remove('menu-open', 'locked-menu');
  burger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}
burger.addEventListener('click', () => {
  const open = !document.body.classList.contains('menu-open');
  document.body.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
  nav.classList.remove('hidden');
});

/* ---------- custom cursor ---------- */
if (!isTouch) {
  const c = $('#cursor'), dot = $('.cursor__dot', c), ring = $('.cursor__ring', c);
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`; });
  (function loop() {
    rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();
  document.addEventListener('mouseover', e => {
    c.classList.toggle('is-hover', !!e.target.closest('a,button,.svc,.barber,.gal__item,.ba,.date,.slot,.opt'));
  });
}

/* ---------- magnetic buttons ---------- */
if (!isTouch && !reduced) {
  $$('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      el.style.transition = 'transform .2s ease-out, color .5s, border-color .5s, background .5s';
      el.style.transform = `translate(${x * 0.28}px, ${y * 0.38}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform .8s cubic-bezier(.22,1,.36,1), color .5s, border-color .5s, background .5s';
      el.style.transform = '';
    });
  });
}

/* ---------- hero: mouse parallax + scroll parallax ---------- */
(() => {
  const media = $('#heroMedia'), glow = $('#heroGlow'), content = $('#heroContent');
  let tx = 0, ty = 0, cx = 0, cy = 0;
  if (!isTouch && !reduced) {
    $('#hero').addEventListener('mousemove', e => {
      tx = (e.clientX / innerWidth - 0.5);
      ty = (e.clientY / innerHeight - 0.5);
    });
  }
  const parallaxEls = $$('[data-speed]');
  (function loop() {
    cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
    const y = scrollY;
    if (y < innerHeight * 1.2) {
      media.style.transform = `translate3d(${cx * -22}px, ${cy * -16 + y * 0.28}px, 0)`;
      glow.style.transform = `translate3d(${cx * 60}px, ${cy * 40}px, 0)`;
      content.style.transform = `translate3d(${cx * 10}px, ${y * -0.12}px, 0)`;
      content.style.opacity = String(Math.max(0, 1 - y / (innerHeight * 0.75)));
    }
    if (!reduced) for (const el of parallaxEls) {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) continue;
      const off = (r.top + r.height / 2 - innerHeight / 2) * parseFloat(el.dataset.speed);
      el.style.translate = `0 ${off}px`;
    }
    requestAnimationFrame(loop);
  })();
})();

/* ---------- split headings into words ---------- */
$$('.split').forEach(h => {
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'w';
          const i = document.createElement('span'); i.textContent = part;
          w.appendChild(i); frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(h);
  $$('.w > span', h).forEach((s, i) => s.style.transitionDelay = (i * 0.06) + 's');
});

/* ---------- reveal on scroll + counters ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    $$('[data-count]', en.target).forEach(countUp);
    io.unobserve(en.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
$$('.rv, .split').forEach(el => io.observe(el));
// clip-path hides .rv-img from IntersectionObserver → watch the parent instead
const ioImg = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    $$(':scope > .rv-img', en.target).forEach((el, i) => setTimeout(() => el.classList.add('in'), i * 180));
    ioImg.unobserve(en.target);
  });
}, { threshold: 0.15 });
new Set($$('.rv-img').map(el => el.parentElement)).forEach(p => ioImg.observe(p));

function countUp(el) {
  if (el.dataset.done) return; el.dataset.done = 1;
  const end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), k = el.dataset.format === 'k';
  const dur = 2000, t0 = performance.now();
  const step = t => {
    const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
    const v = end * e;
    el.textContent = k ? Math.round(v).toLocaleString('ru-RU').replace(/,/g, ' ') : v.toFixed(dec);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- 3D tilt service cards ---------- */
$$('.svc').forEach(card => {
  if (!isTouch && !reduced) {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', px * 100 + '%');
      card.style.setProperty('--my', py * 100 + '%');
      card.style.transition = 'transform .15s ease-out, border-color .6s, box-shadow .6s';
      card.style.transform = `rotateY(${(px - 0.5) * 12}deg) rotateX(${(0.5 - py) * 10}deg) translateZ(10px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = '';
      card.style.transform = '';
    });
  }
  const go = () => { booking.preset({ service: card.dataset.service }); };
  card.addEventListener('click', go);
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
});

/* ---------- barbers ---------- */
$$('.barber').forEach(b => {
  const go = () => booking.preset({ barber: b.dataset.barber });
  b.addEventListener('click', go);
  b.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
});

/* ---------- before / after ---------- */
(() => {
  const ba = $('#ba'), range = $('#baRange');
  let drag = false;
  const set = x => {
    const r = ba.getBoundingClientRect();
    const p = Math.max(2, Math.min(98, (x - r.left) / r.width * 100));
    ba.style.setProperty('--pos', p + '%'); range.value = p;
  };
  ba.addEventListener('pointerdown', e => { drag = true; ba.setPointerCapture(e.pointerId); set(e.clientX); });
  ba.addEventListener('pointermove', e => { if (drag) set(e.clientX); });
  ba.addEventListener('pointerup', () => drag = false);
  ba.addEventListener('pointercancel', () => drag = false);
  range.addEventListener('input', () => ba.style.setProperty('--pos', range.value + '%'));
  // gentle intro animation when it appears
  const o = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting) return; o.disconnect();
    if (reduced) return;
    const t0 = performance.now();
    const anim = t => {
      if (drag) return;
      const p = Math.min(1, (t - t0) / 1800);
      const v = 50 + Math.sin(p * Math.PI * 2) * 18 * (1 - p);
      ba.style.setProperty('--pos', v + '%');
      if (p < 1) requestAnimationFrame(anim);
    };
    setTimeout(() => requestAnimationFrame(anim), 700);
  }, { threshold: 0.5 });
  o.observe(ba);
})();

/* ---------- gallery filters + lightbox ---------- */
(() => {
  const items = $$('.gal__item');
  $('#filters').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('#filters button').forEach(x => x.classList.toggle('on', x === b));
    const f = b.dataset.f;
    items.forEach((it, i) => {
      const show = f === 'all' || it.dataset.cat === f;
      it.classList.toggle('hide', !show);
      it.classList.remove('pop');
      if (show) { void it.offsetWidth; it.style.animationDelay = (i % 6) * 0.05 + 's'; it.classList.add('pop'); }
    });
  });

  const lb = $('#lb'), img = $('#lbImg'), cap = $('#lbCap'), cnt = $('#lbCount');
  let list = [], idx = 0;
  const show = i => {
    idx = (i + list.length) % list.length;
    const it = list[idx], src = $('img', it).src.replace(/w=\d+/, 'w=1800');
    img.style.opacity = 0;
    const n = new Image();
    n.onload = n.onerror = () => { img.src = src; img.alt = $('img', it).alt; img.style.transition = 'opacity .5s'; img.style.opacity = 1; };
    n.src = src;
    cap.textContent = $('figcaption b', it).textContent;
    cnt.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
  };
  const open = it => {
    list = items.filter(x => !x.classList.contains('hide'));
    show(list.indexOf(it));
    lb.classList.add('open'); document.body.style.overflow = 'hidden';
  };
  const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
  items.forEach(it => it.addEventListener('click', () => open(it)));
  $('#lbClose').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', e => { e.stopPropagation(); show(idx - 1); });
  $('#lbNext').addEventListener('click', e => { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  let sx = null;
  lb.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend', e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    sx = null;
  });
})();

/* ---------- reviews slider ---------- */
(() => {
  const view = $('#revView'), track = $('#revTrack'), dotsWrap = $('#revDots');
  const cards = $$('.rev', track);
  let idx = 0, per = 3, timer;
  const perView = () => innerWidth <= 680 ? 1 : innerWidth <= 980 ? 2 : 3;
  const pages = () => cards.length - per + 1;
  const offsetFor = i => cards[i].offsetLeft - cards[0].offsetLeft;
  const go = (i, user) => {
    idx = Math.max(0, Math.min(pages() - 1, i));
    track.style.transform = `translateX(${-offsetFor(idx)}px)`;
    $$('button', dotsWrap).forEach((d, j) => d.classList.toggle('on', j === idx));
    if (user) restart();
  };
  const build = () => {
    per = perView();
    dotsWrap.innerHTML = '';
    for (let i = 0; i < pages(); i++) {
      const d = document.createElement('button');
      d.setAttribute('aria-label', 'Отзыв ' + (i + 1));
      d.addEventListener('click', () => go(i, true));
      dotsWrap.appendChild(d);
    }
    track.classList.add('nt'); go(Math.min(idx, pages() - 1)); void track.offsetWidth; track.classList.remove('nt');
  };
  const restart = () => { clearInterval(timer); timer = setInterval(() => go(idx + 1 >= pages() ? 0 : idx + 1), 6000); };
  $('#revPrev').addEventListener('click', () => go(idx - 1, true));
  $('#revNext').addEventListener('click', () => go(idx + 1, true));
  view.addEventListener('mouseenter', () => clearInterval(timer));
  view.addEventListener('mouseleave', restart);
  // drag / swipe
  let startX = null, startY = null, base = 0, dx = 0, horiz = null;
  view.addEventListener('pointerdown', e => {
    startX = e.clientX; startY = e.clientY; dx = 0; horiz = null; base = -offsetFor(idx);
  });
  addEventListener('pointermove', e => {
    if (startX === null) return;
    dx = e.clientX - startX;
    if (horiz === null && (Math.abs(dx) > 6 || Math.abs(e.clientY - startY) > 6)) horiz = Math.abs(dx) > Math.abs(e.clientY - startY);
    if (!horiz) return;
    view.classList.add('drag'); track.classList.add('nt');
    track.style.transform = `translateX(${base + dx}px)`;
  });
  const end = () => {
    if (startX === null) return;
    track.classList.remove('nt'); view.classList.remove('drag');
    if (horiz && Math.abs(dx) > 60) go(idx + (dx < 0 ? 1 : -1), true); else go(idx);
    startX = null;
  };
  addEventListener('pointerup', end); addEventListener('pointercancel', end);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 150); });
  build(); restart();
})();

/* ---------- map + open now ---------- */
(() => {
  const frame = $('#mapFrame');
  const src = 'https://maps.google.com/maps?q=' + encodeURIComponent(CONFIG.address) + '&z=16&hl=ru&output=embed';
  const o = new IntersectionObserver(([en]) => { if (en.isIntersecting) { frame.src = src; o.disconnect(); } }, { rootMargin: '400px' });
  o.observe(frame);
})();
function almatyNow() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: CONFIG.tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const g = t => +parts.find(p => p.type === t).value;
  return { y: g('year'), m: g('month'), d: g('day'), h: g('hour'), min: g('minute') };
}
(() => {
  const n = almatyNow(), el = $('#openNow');
  const open = n.h >= CONFIG.open && n.h < CONFIG.close;
  el.classList.toggle('closed', !open);
  $('span', el).textContent = open ? `Сейчас открыто · до ${CONFIG.close}:00` : `Сейчас закрыто · откроемся в ${CONFIG.open}:00`;
})();

/* ---------- toast ---------- */
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2800);
}

/* =========================================================
   BOOKING
   ========================================================= */
const booking = (() => {
  const state = { service: null, barber: null, date: null, time: null, name: '', phone: '' };
  let step = 1;
  const panel = $('#bk'), next = $('#bkNext'), nextText = $('#bkNextText'), back = $('#bkBack');
  const DOW = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const DOW_FULL = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const check = '<span class="chk"><svg><use href="#i-check"/></svg></span>';

  // services
  $('#optServices').innerHTML = SERVICES.map(s =>
    `<button class="opt" data-v="${s.id}" type="button"><span><b>${s.name}</b><small>${s.dur} мин</small></span><span class="pr">${fmt(s.price)}</span>${check}</button>`).join('');
  // barbers
  $('#optBarbers').innerHTML = BARBERS.map(b =>
    `<button class="opt opt--barber" data-v="${b.id}" type="button">${b.img ? `<img src="${unsplash(b.img, 160)}" alt="" loading="lazy">` : `<span class="any"><svg><use href="#i-users"/></svg></span>`}<span><b>${b.name}</b><small>${b.role}</small></span>${check}</button>`).join('');

  // dates (14 days, Almaty time)
  const n = almatyNow();
  const days = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(Date.UTC(n.y, n.m - 1, n.d + i));
    days.push({ key: d.toISOString().slice(0, 10), dow: d.getUTCDay(), day: d.getUTCDate(), mon: d.getUTCMonth(), today: i === 0, tomorrow: i === 1 });
  }
  const dateLabel = d => `${d.today ? 'сегодня' : d.tomorrow ? 'завтра' : DOW_FULL[d.dow]}, ${d.day} ${MON[d.mon]}`;
  $('#dates').innerHTML = days.map(d =>
    `<button class="date" type="button" data-v="${d.key}"><small>${d.today ? 'Сегодня' : d.tomorrow ? 'Завтра' : DOW[d.dow]}</small><b>${d.day}</b><small>${MON[d.mon].slice(0, 3)}</small></button>`).join('');

  const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) % 100; };
  function renderSlots() {
    const box = $('#slots');
    if (!state.date) { box.innerHTML = '<div class="slots-empty">Сначала выберите дату</div>'; $('#slotsDay').textContent = ''; return; }
    const d = days.find(x => x.key === state.date);
    $('#slotsDay').textContent = dateLabel(d);
    const now = almatyNow();
    const busyRate = state.barber === 'any' ? 12 : 34;
    let html = '', free = 0;
    for (let h = CONFIG.open; h < CONFIG.close; h++) {
      for (const m of [0, 30]) {
        if (h === CONFIG.close - 1 && m === 30) continue;
        const t = `${String(h).padStart(2, '0')}:${m ? '30' : '00'}`;
        const past = d.today && (h * 60 + m) <= (now.h * 60 + now.min + 30);
        const busy = past || hash(state.date + state.barber + t) < busyRate;
        if (!busy) free++;
        html += `<button class="slot${busy ? ' busy' : ''}${state.time === t ? ' sel' : ''}" type="button" data-v="${t}"${busy ? ' disabled aria-disabled="true"' : ''}>${t}</button>`;
      }
    }
    box.innerHTML = free ? html : '<div class="slots-empty">На этот день свободного времени нет — выберите другую дату.</div>';
  }

  // selection handlers
  const pick = (box, key, after) => box.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    state[key] = b.dataset.v;
    $$('button', box).forEach(x => x.classList.toggle('sel', x === b));
    after && after();
    update();
  });
  pick($('#optServices'), 'service');
  pick($('#optBarbers'), 'barber', () => { state.time = null; renderSlots(); });
  pick($('#dates'), 'date', () => { state.time = null; renderSlots(); });
  pick($('#slots'), 'time');

  // phone mask +7 (___) ___-__-__
  const inPhone = $('#inPhone'), inName = $('#inName');
  const digits = v => { let d = v.replace(/\D/g, ''); if (d[0] === '8') d = '7' + d.slice(1); if (d.startsWith('78')) d = '7' + d.slice(2); if (d && d[0] !== '7') d = '7' + d; return d.slice(0, 11); };
  const maskPhone = d => {
    if (!d) return '';
    let r = '+7';
    if (d.length > 1) r += ' (' + d.slice(1, 4);
    if (d.length >= 4) r += ')';
    if (d.length > 4) r += ' ' + d.slice(4, 7);
    if (d.length > 7) r += '-' + d.slice(7, 9);
    if (d.length > 9) r += '-' + d.slice(9, 11);
    return r;
  };
  inPhone.addEventListener('focus', () => { if (!inPhone.value) inPhone.value = '+7 ('; });
  inPhone.addEventListener('blur', () => { if (digits(inPhone.value).length <= 1) inPhone.value = ''; });
  inPhone.addEventListener('input', () => {
    state.phone = digits(inPhone.value);
    inPhone.value = maskPhone(state.phone);
    $('#fPhone').classList.remove('err'); $('#fPhone .msg').textContent = '';
    update();
  });
  inName.addEventListener('input', () => {
    state.name = inName.value.trim();
    $('#fName').classList.remove('err'); $('#fName .msg').textContent = '';
    update();
  });

  const valid = s => s === 1 ? !!state.service
    : s === 2 ? !!state.barber
    : s === 3 ? !!(state.date && state.time)
    : s === 4 ? state.name.length >= 2 && state.phone.length === 11 : true;

  function update() {
    // summary
    const sv = SERVICES.find(x => x.id === state.service), br = BARBERS.find(x => x.id === state.barber), d = days.find(x => x.key === state.date);
    const setS = (id, v, empty) => { const el = $(id); el.textContent = v || empty; el.classList.toggle('empty', !v); };
    setS('#sService', sv && sv.name, 'не выбрана');
    setS('#sBarber', br && (br.id === 'any' ? 'Любой мастер' : br.name), 'не выбран');
    setS('#sDate', d && dateLabel(d), '—');
    setS('#sTime', state.time, '—');
    $('#sTotal').textContent = sv ? fmt(sv.price) : '0 ₸';
    // nav
    next.disabled = step === 4 ? false : !valid(step);
    nextText.textContent = step === 4 ? 'Подтвердить запись' : 'Далее';
    back.hidden = step === 1;
  }

  function goStep(s, scroll) {
    step = s;
    $$('.bk__step', panel).forEach(x => x.classList.toggle('on', +x.dataset.step === s));
    $$('.steps i', panel).forEach((x, i) => x.classList.toggle('on', i < s));
    $('#bkNav').style.display = s === 5 ? 'none' : '';
    if (s === 3) {
      renderSlots();
      if (!state.date) {
        $('#dates .date').click();
        if (!$('#slots .slot:not(.busy)')) $$('#dates .date')[1].click(); // сегодня всё занято → завтра
      }
    }
    update();
    if (scroll) {
      const top = panel.getBoundingClientRect().top + scrollY - 90;
      if (Math.abs(top - scrollY) > 120) scroller.to(top);
    }
  }

  function message() {
    const sv = SERVICES.find(x => x.id === state.service), br = BARBERS.find(x => x.id === state.barber), d = days.find(x => x.key === state.date);
    return [
      'Здравствуйте! Хочу записаться в NOIR Barbershop.',
      '',
      `Услуга: ${sv.name} — ${fmt(sv.price)}`,
      `Мастер: ${br.id === 'any' ? 'любой свободный' : br.name}`,
      `Дата: ${dateLabel(d)}`,
      `Время: ${state.time}`,
      `Имя: ${state.name}`,
      `Телефон: ${maskPhone(state.phone)}`
    ].join('\n');
  }

  next.addEventListener('click', () => {
    if (step < 4) { if (valid(step)) goStep(step + 1, true); return; }
    // step 4 — validate & confirm
    let ok = true;
    if (state.name.length < 2) { $('#fName').classList.add('err'); $('#fName .msg').textContent = 'Введите имя'; ok = false; }
    if (state.phone.length !== 11) { $('#fPhone').classList.add('err'); $('#fPhone .msg').textContent = 'Введите номер полностью: +7 (7XX) XXX-XX-XX'; ok = false; }
    if (!ok) { toast('Проверьте имя и номер телефона'); return; }
    const url = waLink(message());
    $('#waAgain').href = url;
    $('#doneText').textContent = `${state.name}, мы открыли WhatsApp с вашей заявкой. Отправьте сообщение — администратор подтвердит запись в течение 10 минут.`;
    goStep(5, true);
    const w = window.open(url, '_blank');
    if (w) { try { w.opener = null; } catch (e) {} } else setTimeout(() => { location.href = url; }, 300);
  });
  back.addEventListener('click', () => { if (step > 1) goStep(step - 1, false); });
  $('#bkReset').addEventListener('click', () => {
    Object.assign(state, { service: null, barber: null, date: null, time: null, name: '', phone: '' });
    inName.value = ''; inPhone.value = '';
    $$('.opt, .date', panel).forEach(x => x.classList.remove('sel'));
    goStep(1, true);
  });

  goStep(1);

  return {
    preset({ service, barber }) {
      if (service) {
        state.service = service;
        $$('#optServices .opt').forEach(x => x.classList.toggle('sel', x.dataset.v === service));
      }
      if (barber) {
        state.barber = barber; state.time = null;
        $$('#optBarbers .opt').forEach(x => x.classList.toggle('sel', x.dataset.v === barber));
      }
      const target = !state.service ? 1 : !state.barber ? 2 : 3;
      goStep(target);
      const sv = SERVICES.find(x => x.id === state.service), br = BARBERS.find(x => x.id === state.barber);
      toast(service ? `Выбрано: ${sv.name}` : `Запись к ${br.short}`);
      const el = $('#booking');
      scroller.to(el.getBoundingClientRect().top + scrollY - 70);
    }
  };
})();
