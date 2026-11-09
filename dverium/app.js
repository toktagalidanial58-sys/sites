(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const D = window.DV_DOORS, ST = window.DV_STYLES, CO = window.DV_COATS, MA = window.DV_MADE, FA = window.DV_FAMS;
const byId = id => D.find(d => d.id === id);
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const HOVER = matchMedia('(hover: hover) and (pointer: fine)').matches;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const plural = (n, a, b, c) => { const m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 10 || h >= 20) ? b : c; };

const title = d => d.model || d.color;
const sub = d => d.model ? d.color : 'Коллекция Dverium';
const full = d => d.model ? `${d.model} — ${d.color}` : `Dverium, ${d.color}`;
const waUrl = t => `https://wa.me/77473690303?text=${encodeURIComponent(t)}`;
const priceMsg = d => `Здравствуйте! Хочу узнать стоимость двери: ${full(d)} (${ST[d.style]}).`;
function openWA(t) { const w = window.open(waUrl(t), '_blank'); if (w) { try { w.opener = null; } catch (e) {} } else location.href = waUrl(t); }

/* ---------- reveal ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: .1 });
/* на телефоне двери приоткрываются, когда появляются на экране */
const ajar = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const img = e.target; ajar.unobserve(img);
  setTimeout(() => { img.style.transform = 'rotateY(-20deg)'; img.style.boxShadow = '14px 0 26px rgba(0,0,0,.12)'; }, 350);
  setTimeout(() => { img.style.transform = ''; img.style.boxShadow = ''; }, 1900);
}), { threshold: .7 });
function observe(root = document) {
  $$('.rv:not(.in), .card:not(.in)', root).forEach(el => RM ? el.classList.add('in') : io.observe(el));
  if (!HOVER && !RM) $$('.card__ph img, .ld__d img', root).forEach(i => ajar.observe(i));
}

/* ---------- cards ---------- */
const card = d => `<article class="card">
  <a class="card__ph" href="#/door/${d.id}" aria-label="${esc(full(d))}">
    <span class="card__tag">${d.made === 'dverium' ? 'Dverium' : MA[d.made]}</span>
    <img src="img/s/${d.img}.jpg" alt="Межкомнатная дверь ${esc(full(d))}" loading="lazy" decoding="async"></a>
  <div class="card__b">
    <h3 class="card__t"><a href="#/door/${d.id}">${esc(title(d))}</a></h3>
    <span class="card__c">${esc(sub(d))}</span>
    <div class="card__a"><a href="#/door/${d.id}">Подробнее</a><a href="${waUrl(priceMsg(d))}" data-wa="${esc(priceMsg(d))}">Узнать стоимость</a></div>
  </div></article>`;

/* ---------- collection line ---------- */
const LINE = ['temnyj-oreh', 'agaro', 'ral-6018', 'beatris', 'baget-ral-1013', 'dl-810-al2-tryufel', 'venza', 'yurta', 'barselona-2-mokko', 'baget-ral-9016', 'platinum-oreh-lusso', 'franciya', 'ral-8025', 'dubaj'];
const track = $('#lineTrack');
track.innerHTML = LINE.map(byId).filter(Boolean).map(d => `<a class="ld" href="#/door/${d.id}"><span class="ld__d"><img src="img/s/${d.img}.jpg" alt="${esc(full(d))}" loading="lazy"></span><span class="ld__t"><b>${esc(title(d))}</b><span>${esc(ST[d.style])}</span></span></a>`).join('');
(function drag(el) {
  let down = false, x0 = 0, s0 = 0, moved = false;
  el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; s0 = el.scrollLeft; });
  addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - x0; if (Math.abs(dx) > 5) { moved = true; el.classList.add('drag'); } el.scrollLeft = s0 - dx; });
  addEventListener('pointerup', () => { if (down) { down = false; setTimeout(() => el.classList.remove('drag'), 0); } });
  el.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  el.addEventListener('dragstart', e => e.preventDefault());
})(track);

/* ---------- catalog ---------- */
const state = { style: 'all', fam: 'all', coat: 'all', made: 'all' };
const DICT = { style: ST, fam: FA, coat: CO, made: MA };
let limit = 12;
function buildFilters() {
  const row = $('.flt__row');
  row.innerHTML = [['all', 'Все модели'], ...Object.keys(ST).filter(k => D.some(d => d.style === k)).map(k => [k, ST[k]])]
    .map(([k, l]) => `<button type="button" data-v="${k}" class="${state.style === k ? 'on' : ''}" aria-pressed="${state.style === k}">${l}</button>`).join('');
  $$('.flt__more select').forEach(sel => {
    const key = sel.dataset.key;
    sel.innerHTML = `<option value="all">Любое</option>` + Object.keys(DICT[key]).filter(k => D.some(d => d[key] === k)).map(k => `<option value="${k}">${DICT[key][k]}</option>`).join('');
    if (key === 'fam') sel.options[0].textContent = 'Любой';
    sel.value = state[key];
  });
}
const list = () => D.filter(d => Object.keys(state).every(k => state[k] === 'all' || d[k] === state[k]));
function renderGrid() {
  const l = list(), g = $('#grid');
  g.innerHTML = l.length ? l.slice(0, limit).map(card).join('') : `<p class="empty">По этим параметрам моделей нет — <a class="lnk" href="#" data-reset>сбросить фильтры</a></p>`;
  $('#fCount').textContent = `${l.length} ${plural(l.length, 'модель', 'модели', 'моделей')}`;
  $('#more').parentElement.hidden = l.length <= limit;
  observe(g);
}
$('.flt__row').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; state.style = b.dataset.v; limit = 12; buildFilters(); renderGrid(); });
$$('.flt__more select').forEach(s => s.addEventListener('change', () => { state[s.dataset.key] = s.value; limit = 12; renderGrid(); }));
$('#more').addEventListener('click', () => { limit += 12; renderGrid(); });
function setFilter(k, v) { Object.keys(state).forEach(x => state[x] = 'all'); if (k) state[k] = v; limit = 12; buildFilters(); renderGrid(); }
buildFilters(); renderGrid();

/* reviews */
const rev = $('#rev');
$$('[data-rev]').forEach(b => b.addEventListener('click', () => rev.scrollBy({ left: +b.dataset.rev * (rev.firstElementChild.offsetWidth + 20), behavior: 'smooth' })));

/* ---------- phone ---------- */
function mask(inp) {
  inp.addEventListener('input', () => {
    let d = inp.value.replace(/\D/g, '');
    if (!inp.value.includes('+') && d.length === 10) d = '7' + d;
    if (d[0] === '8' && d.length === 11) d = '7' + d.slice(1);
    if (d && d[0] !== '7') d = '7' + d;
    d = d.slice(0, 11); const p = d.slice(1);
    let o = d ? '+7' : '';
    if (p.length) o += ' (' + p.slice(0, 3);
    if (p.length >= 3) o += ')';
    if (p.length > 3) o += ' ' + p.slice(3, 6);
    if (p.length > 6) o += '-' + p.slice(6, 8);
    if (p.length > 8) o += '-' + p.slice(8, 10);
    inp.value = o;
  });
  inp.addEventListener('focus', () => { if (!inp.value) inp.value = '+7 ('; });
  inp.addEventListener('blur', () => { if (inp.value.replace(/\D/g, '').length <= 1) inp.value = ''; });
}
const ok = v => v.replace(/\D/g, '').length === 11;

/* ---------- calculator ---------- */
const form = $('#calcForm'), cModel = $('#cModel');
cModel.innerHTML = '<option value="">Помогите подобрать модель</option>' + Object.keys(ST).map(k => {
  const ds = D.filter(d => d.style === k); return ds.length ? `<optgroup label="${ST[k]}">${ds.map(d => `<option value="${d.id}">${esc(full(d))}</option>`).join('')}</optgroup>` : '';
}).join('');
let mode = 'calc';
$$('.tabs button').forEach(b => b.addEventListener('click', () => {
  mode = b.dataset.tab;
  $$('.tabs button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
  $$('[data-only="measure"]', form).forEach(x => x.hidden = mode !== 'measure');
  $('#cBtn').textContent = mode === 'measure' ? 'Записаться на замер в WhatsApp' : 'Получить расчёт в WhatsApp';
}));
$$('[data-step]').forEach(b => b.addEventListener('click', () => { const q = form.qty; q.value = Math.max(1, Math.min(99, (+q.value || 1) + +b.dataset.step)); }));
form.qty.addEventListener('blur', () => { form.qty.value = Math.max(1, Math.min(99, +form.qty.value || 1)); });
mask(form.phone);
form.phone.addEventListener('input', () => { if (ok(form.phone.value)) $('#cErr').textContent = ''; });
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!ok(form.phone.value)) { $('#cErr').textContent = 'Укажите номер полностью: +7 (XXX) XXX-XX-XX'; form.phone.focus(); return; }
  const m = byId(form.model.value);
  const needs = ['install', 'delivery', 'design'].filter(n => form[n].checked).map(n => ({ install: 'установка', delivery: 'доставка', design: 'помощь с подбором' }[n]));
  const lines = [mode === 'measure' ? 'Здравствуйте! Хочу записаться на замер.' : 'Здравствуйте! Прошу рассчитать стоимость дверей.',
    `Модель: ${m ? full(m) : 'нужна помощь с выбором'}`, `Количество: ${form.qty.value} шт.`, `Высота проёма: ${form.h.value}`,
    `Дополнительно: ${needs.join(', ') || '—'}`, `Город: ${form.city.value}`];
  if (mode === 'measure') { if (form.addr.value) lines.push(`Адрес: ${form.addr.value}`); if (form.date.value) lines.push(`Дата: ${new Date(form.date.value).toLocaleDateString('ru-RU')}`); }
  if (form.name.value.trim()) lines.push(`Имя: ${form.name.value.trim()}`);
  lines.push(`Телефон: ${form.phone.value}`);
  openWA(lines.join('\n'));
});

/* ---------- callback ---------- */
const modal = $('#modal'); let last;
const openM = () => { last = document.activeElement; modal.hidden = false; document.body.classList.add('lock'); setTimeout(() => $('#mPhone').focus(), 50); };
const closeM = () => { modal.hidden = true; document.body.classList.remove('lock'); last && last.focus(); };
mask($('#mPhone'));
modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeM(); });
$('#cbForm').addEventListener('submit', e => {
  e.preventDefault(); const p = $('#mPhone').value;
  if (!ok(p)) { $('#mErr').textContent = 'Укажите номер полностью'; return; }
  $('#mErr').textContent = ''; const n = $('#mName').value.trim();
  openWA(`Здравствуйте! Прошу перезвонить мне.${n ? '\nИмя: ' + n : ''}\nТелефон: ${p}`); closeM();
});
addEventListener('keydown', e => { if (e.key === 'Escape') { if (!modal.hidden) closeM(); menu(false); } });

/* ---------- menu ---------- */
const burger = $('#burger');
function menu(on) {
  on = on ?? !document.body.classList.contains('menu');
  document.body.classList.toggle('menu', on); document.body.classList.toggle('lock', on && modal.hidden);
  burger.setAttribute('aria-expanded', on); burger.setAttribute('aria-label', on ? 'Закрыть меню' : 'Открыть меню');
  $('#mnav').setAttribute('aria-hidden', !on);
}
burger.addEventListener('click', () => menu());

/* ---------- clicks ---------- */
document.addEventListener('click', e => {
  const w = e.target.closest('[data-wa]'); if (w) { e.preventDefault(); openWA(w.dataset.wa); return; }
  if (e.target.closest('[data-callback]')) { e.preventDefault(); openM(); return; }
  if (e.target.closest('[data-reset]')) { e.preventDefault(); setFilter(); return; }
  const a = e.target.closest('a[href^="#/"]'); if (!a) return;
  e.preventDefault();
  if (a.dataset.filter) { const [k, v] = a.dataset.filter.split(':'); setFilter(k, v); }
  if (a.dataset.model) cModel.value = a.dataset.model;
  menu(false);
  const h = a.getAttribute('href'); if (location.hash === h) route(); else location.hash = h;
});

/* ---------- header + hero scroll ---------- */
const hdr = $('#hdr'), hero = $('#hero'), pin = $('.hero__pin'), portal = $('#portal');
let lastY = 0, raf = 0;
const copy = $('.hero__copy');
const setCH = () => pin.style.setProperty('--ch', copy.offsetHeight + 'px');
addEventListener('resize', setCH); setCH(); if (document.fonts) document.fonts.ready.then(setCH);
function frame() {
  raf = 0; const y = scrollY;
  const onDoor = !$('#door').hidden;
  if (!onDoor && !RM) {
    const max = hero.offsetHeight - innerHeight;
    const p = Math.min(1, Math.max(0, y / max));
    const o = Math.min(1, Math.max(0, (p - .05) / .55));         // дверь открывается
    const ease = 1 - Math.pow(1 - o, 3);
    const z = Math.min(1, Math.max(0, (p - .62) / .38));         // камера «входит» в проём
    const zz = z * z * (3 - 2 * z);
    pin.style.setProperty('--p', p.toFixed(4));
    portal.style.setProperty('--o', ease.toFixed(4));
    portal.style.setProperty('--z', zz.toFixed(4));
    pin.style.setProperty('--w', Math.max(0, (z - .55) / .45).toFixed(4));
  }
  const heroEnd = onDoor ? 0 : hero.offsetHeight - innerHeight;
  hdr.classList.toggle('solid', onDoor || y > heroEnd + 10 || (y > 10 && innerWidth < 820));
  hdr.classList.toggle('up', y > heroEnd + 300 && y > lastY + 3 && !document.body.classList.contains('menu'));
  if (y < lastY - 3) hdr.classList.remove('up');
  lastY = y;
}
addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(frame); }, { passive: true });
addEventListener('resize', () => { if (!raf) raf = requestAnimationFrame(frame); });
const navIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) $$('.nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#/s/' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
['catalog', 'custom', 'about', 'process', 'faq', 'contacts'].forEach(id => navIO.observe(document.getElementById(id)));

/* ---------- door page ---------- */
const HT = document.title, HD = $('meta[name="description"]').content;
const meta = (t, d) => { document.title = t; $('meta[name="description"]').content = d; };
function renderDoor(d) {
  const i = D.indexOf(d), prev = D[(i - 1 + D.length) % D.length], next = D[(i + 1) % D.length];
  let sim = D.filter(x => x.style === d.style && x !== d);
  if (sim.length < 4) sim = sim.concat(D.filter(x => x.fam === d.fam && x !== d && !sim.includes(x)));
  sim = sim.slice(0, 4);
  const specs = [d.model && ['Модель', d.model], ['Цвет', d.color], ['Дизайн', ST[d.style]], ['Покрытие', CO[d.coat]], ['Высота', d.h],
    d.made === 'dverium' && ['Изготовление', 'По индивидуальным размерам'], ['Производство', MA[d.made]]].filter(Boolean);
  const msg = priceMsg(d);
  $('#door').innerHTML = `<article class="dp"><div class="wrap">
    <nav class="crumbs"><a href="#/">Главная</a>/<a href="#/s/catalog">Каталог</a>/<span>${esc(title(d))}</span></nav>
    <div class="dp__g">
      <div class="dp__img"><small>${HOVER ? 'Наведите — дверь откроется' : ''}</small><img src="img/d/${d.img}.jpg" alt="Межкомнатная дверь ${esc(full(d))}"></div>
      <div>
        <p class="kicker">${d.made === 'dverium' ? 'Производство Dverium' : 'Производство: ' + MA[d.made]} · ${ST[d.style]}</p>
        <h1>${esc(title(d))}</h1>
        <p class="dp__c">${esc(sub(d))}</p>
        <dl class="specs">${specs.map(s => `<div><dt>${s[0]}</dt><dd>${esc(s[1])}</dd></div>`).join('')}</dl>
        <div class="dp__cta"><a class="btn" href="${waUrl(msg)}" data-wa="${esc(msg)}">Узнать стоимость</a><a class="btn btn--ghost" href="#/s/calc" data-model="${d.id}">Рассчитать комплект</a></div>
        <form class="qf" id="qf" novalidate>
          <h3>Быстрая заявка на эту модель</h3>
          <label class="f">Имя<input id="qN" type="text" autocomplete="name" placeholder="Ваше имя"></label>
          <label class="f">Телефон<input id="qP" type="tel" autocomplete="tel" inputmode="tel" placeholder="+7 (___) ___-__-__"></label>
          <label class="f">Количество<select id="qQ">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option>${n}</option>`).join('')}<option>Больше 10</option></select></label>
          <label class="f">Высота проёма<select id="qH"><option>2,00 м</option><option>2,20 м</option><option>2,30 м</option><option>2,40 м</option><option>Не знаю</option></select></label>
          <small class="err" id="qE" role="alert"></small>
          <button class="btn" type="submit">Отправить в WhatsApp</button>
        </form>
      </div>
    </div>
    <nav class="dp__nav"><a href="#/door/${prev.id}"><small>← Предыдущая</small>${esc(title(prev))}</a><a href="#/door/${next.id}"><small>Следующая →</small>${esc(title(next))}</a></nav>
    <section class="dp__sim"><h2>Похожие модели</h2><div class="grid">${sim.map(card).join('')}</div></section>
  </div></article>`;
  mask($('#qP'));
  $('#qf').addEventListener('submit', e => {
    e.preventDefault(); const p = $('#qP').value;
    if (!ok(p)) { $('#qE').textContent = 'Укажите номер полностью: +7 (XXX) XXX-XX-XX'; $('#qP').focus(); return; }
    $('#qE').textContent = ''; const n = $('#qN').value.trim();
    openWA(`${msg}\nКоличество: ${$('#qQ').value}\nВысота проёма: ${$('#qH').value}${n ? '\nИмя: ' + n : ''}\nТелефон: ${p}`);
  });
  if (!HOVER && !RM) { const im = $('.dp__img img'); setTimeout(() => { im.style.transform = 'rotateY(-22deg)'; im.style.boxShadow = '18px 0 30px rgba(0,0,0,.14)'; }, 700); setTimeout(() => { im.style.transform = ''; im.style.boxShadow = ''; }, 2400); }
  meta(`${full(d)} — межкомнатная дверь | Dverium Алматы`, `${full(d)}: ${ST[d.style].toLowerCase()}, высота ${d.h}. Производство: ${MA[d.made]}. Бесплатная доставка по Алматы и Казахстану, установка.`);
  observe($('#door'));
}

/* ---------- router ---------- */
let view = null;
function go(id, smooth) {
  const el = id && document.getElementById(id);
  let y = el ? el.getBoundingClientRect().top + scrollY - (id === 'catalog' || id === 'calc' ? 40 : 0) : 0;
  scrollTo({ top: Math.max(0, y), behavior: smooth && !RM ? 'smooth' : 'auto' });
}
function route() {
  const h = location.hash || '#/';
  const m = h.match(/^#\/door\/([\w-]+)/);
  if (m) {
    const d = byId(m[1]); if (!d) { location.hash = '#/s/catalog'; return; }
    $('#home').hidden = true; $('#door').hidden = false; renderDoor(d); scrollTo(0, 0); view = 'door';
    $$('.nav a').forEach(a => a.classList.remove('on')); frame(); return;
  }
  const s = (h.match(/^#\/s\/([\w-]+)/) || [])[1];
  if (view !== 'home') {
    const first = view === null;
    $('#door').hidden = true; $('#door').innerHTML = ''; $('#home').hidden = false; meta(HT, HD); view = 'home';
    requestAnimationFrame(() => { if (s) go(s, false); else if (!first) scrollTo(0, 0); frame(); });
  } else go(s, true);
}
addEventListener('hashchange', route);
$('#yr').textContent = new Date().getFullYear();
observe(); route(); frame();
})();
