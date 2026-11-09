(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const DOORS = window.DV_DOORS, ST = window.DV_STYLES, CO = window.DV_COATS, MA = window.DV_MADE, FA = window.DV_FAMS;
const byId = id => DOORS.find(d => d.id === id);
const WA = '77473690303';
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const title = d => d.model || d.color;
const colorLine = d => d.model ? d.color : 'Коллекция Dverium';
const fullName = d => d.model ? `${d.model} — ${d.color}` : `Dverium, ${d.color}`;
const waUrl = t => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
const priceMsg = d => `Здравствуйте! Хочу узнать стоимость двери: ${fullName(d)} (${ST[d.style]}).`;
function openWA(text) {
  const w = window.open(waUrl(text), '_blank');
  if (w) { try { w.opener = null; } catch (e) {} } else location.href = waUrl(text);
}

/* ---------- cards ---------- */
function card(d) {
  const made = d.made === 'dverium' ? '<span class="card__badge card__badge--d">Dverium</span>' : `<span class="card__badge">${MA[d.made]}</span>`;
  return `<article class="card">
    <a class="card__ph" href="#/door/${d.id}" aria-label="${esc(fullName(d))}">${made}
      <img src="img/card/${d.img}.jpg" alt="Межкомнатная дверь ${esc(fullName(d))}" loading="lazy" decoding="async"></a>
    <div class="card__body">
      <h3 class="card__t"><a href="#/door/${d.id}">${esc(title(d))}</a></h3>
      <div class="card__c">${esc(colorLine(d))}</div>
      <div class="card__m">${ST[d.style]} · ${CO[d.coat] === CO.model ? 'покрытие по модели' : CO[d.coat].toLowerCase()}</div>
      <div class="card__act"><a href="#/door/${d.id}">Подробнее</a><a href="${waUrl(priceMsg(d))}" target="_blank" rel="noopener" data-wa="${esc(priceMsg(d))}">Узнать стоимость</a></div>
    </div></article>`;
}

/* ---------- reveal ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target; el.classList.add('in'); io.unobserve(el);
  const n = el.querySelector('[data-count]'); if (n) countUp(n);
}), { rootMargin: '0px 0px -8% 0px', threshold: .12 });
function observe(root = document) {
  $$('.split:not([data-split])', root).forEach(el => {
    el.dataset.split = 1;
    const walk = node => [...node.childNodes].forEach(ch => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
          p.split(' ').forEach((q, i, arr) => {
            const w = document.createElement('span'); w.className = 'w';
            const s = document.createElement('span'); s.textContent = q + (i < arr.length - 1 ? ' ' : ''); w.appendChild(s); frag.appendChild(w);
          });
        });
        ch.replaceWith(frag);
      } else if (ch.nodeType === 1) walk(ch);
    });
    walk(el);
    $$('.w > span', el).forEach((s, i) => s.style.transitionDelay = (i * 0.045) + 's');
  });
  $$('[data-reveal]:not(.in), .card:not(.in)', root).forEach(el => RM ? el.classList.add('in') : io.observe(el));
}
function countUp(el) {
  const to = +el.dataset.count; if (RM) return;
  const t0 = performance.now();
  const tick = t => { const k = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}

/* ---------- collections ---------- */
const COLS = [
  { k: 'min', img: 'B13', label: 'Современный минимализм' },
  { k: 'neo', img: 'B04', label: 'Неоклассика' },
  { k: 'fr', img: 'A15', label: 'Французская классика' },
  { k: 'bag', img: 'A07', label: 'Багетная серия' },
  { k: 'custom', img: 'A13', label: 'Двери под заказ' }
];
$('#colsGrid').innerHTML = COLS.map(c => {
  const n = c.k === 'custom' ? DOORS.filter(d => d.made === 'dverium').length : DOORS.filter(d => d.style === c.k).length;
  const href = c.k === 'custom' ? '#/s/custom' : '#/s/catalog';
  const filt = c.k === 'custom' ? '' : ` data-filter="style:${c.k}"`;
  return `<a class="col" href="${href}"${filt} data-reveal><img src="img/card/${c.img}.jpg" alt="${c.label}" loading="lazy"><span class="col__t"><small>${n} ${plural(n, 'модель', 'модели', 'моделей')}</small><b>${c.label}</b></span></a>`;
}).join('');
function plural(n, a, b, c) { const m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 10 || h >= 20) ? b : c; }

/* ---------- catalog + filters ---------- */
const state = { style: 'all', fam: 'all', coat: 'all', made: 'all' };
const DICT = { style: ST, fam: FA, coat: { enamel: 'Эмаль', film: 'Антивандальная плёнка', paint: 'Итальянская краска', model: 'По модели (Dverium)' }, made: MA };
let limit = 12;
function buildChips() {
  $$('.chips').forEach(box => {
    const key = box.dataset.key, dict = DICT[key];
    const opts = [['all', 'Все', DOORS.length], ...Object.keys(dict).map(k => [k, dict[k], DOORS.filter(d => d[key] === k).length]).filter(o => o[2])];
    box.innerHTML = opts.map(([k, l, n]) => `<button type="button" class="chip${state[key] === k ? ' on' : ''}" data-k="${key}" data-v="${k}" aria-pressed="${state[key] === k}">${l}<sup>${n}</sup></button>`).join('');
  });
}
function filtered() { return DOORS.filter(d => Object.keys(state).every(k => state[k] === 'all' || d[k] === state[k])); }
function renderGrid() {
  const list = filtered();
  const g = $('#grid');
  g.innerHTML = list.length ? list.slice(0, limit).map(card).join('') : '<p class="empty">По этим фильтрам моделей нет. Попробуйте изменить параметры или <a href="#" data-wa="Здравствуйте! Помогите подобрать дверь." class="link-btn">спросите менеджера</a>.</p>';
  $('#fCount').textContent = `Найдено: ${list.length} ${plural(list.length, 'модель', 'модели', 'моделей')}`;
  $('#more').parentElement.hidden = list.length <= limit;
  observe(g); bindTilt(g);
}
$('#filters').addEventListener('click', e => {
  const b = e.target.closest('.chip'); if (!b) return;
  state[b.dataset.k] = b.dataset.v; limit = 12; buildChips(); renderGrid();
});
$('#fReset').addEventListener('click', () => { Object.keys(state).forEach(k => state[k] = 'all'); limit = 12; buildChips(); renderGrid(); });
$('#more').addEventListener('click', () => { limit += 12; renderGrid(); });
buildChips(); renderGrid();

/* ---------- rail (Dverium) ---------- */
const rail = $('#rail');
rail.innerHTML = DOORS.filter(d => d.made === 'dverium').map(card).join('');
observe(rail);
$$('[data-rail]').forEach(b => b.addEventListener('click', () => rail.scrollBy({ left: +b.dataset.rail * (rail.querySelector('.card').offsetWidth + 16) * 2, behavior: 'smooth' })));
(function dragScroll(el) {
  let down = false, x0 = 0, s0 = 0, moved = false;
  el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; s0 = el.scrollLeft; });
  addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - x0; if (Math.abs(dx) > 4) { moved = true; el.classList.add('drag'); } el.scrollLeft = s0 - dx; });
  addEventListener('pointerup', () => { if (!down) return; down = false; setTimeout(() => el.classList.remove('drag'), 0); });
  el.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  el.addEventListener('dragstart', e => e.preventDefault());
})(rail);

/* reviews */
const rev = $('#rev');
$$('[data-rev]').forEach(b => b.addEventListener('click', () => rev.scrollBy({ left: +b.dataset.rev * (rev.firstElementChild.offsetWidth + 18), behavior: 'smooth' })));

/* ---------- card 3D tilt ---------- */
function bindTilt(root) {
  if (!FINE || RM) return;
  $$('.card__ph', root).forEach(ph => {
    ph.addEventListener('pointermove', e => { const r = ph.getBoundingClientRect(); ph.style.setProperty('--ty', ((e.clientX - r.left) / r.width - .5) * 14 + 'deg'); });
    ph.addEventListener('pointerleave', () => ph.style.setProperty('--ty', '0deg'));
  });
}
bindTilt(rail);

/* ---------- phone mask ---------- */
function maskPhone(inp) {
  inp.addEventListener('input', () => {
    let d = inp.value.replace(/\D/g, '');
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (d && !d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    const p = d.slice(1);
    let out = d ? '+7' : '';
    if (p.length) out += ' (' + p.slice(0, 3);
    if (p.length >= 3) out += ')';
    if (p.length > 3) out += ' ' + p.slice(3, 6);
    if (p.length > 6) out += '-' + p.slice(6, 8);
    if (p.length > 8) out += '-' + p.slice(8, 10);
    inp.value = out;
  });
  inp.addEventListener('focus', () => { if (!inp.value) inp.value = '+7 ('; });
  inp.addEventListener('blur', () => { if (inp.value.replace(/\D/g, '').length <= 1) inp.value = ''; });
}
const phoneOk = v => v.replace(/\D/g, '').length === 11;

/* ---------- calculator ---------- */
const cModel = $('#cModel');
cModel.innerHTML = '<option value="">Помогите подобрать модель</option>' + Object.keys(ST).map(k => {
  const ds = DOORS.filter(d => d.style === k); if (!ds.length) return '';
  return `<optgroup label="${ST[k]}">${ds.map(d => `<option value="${d.id}">${esc(fullName(d))}</option>`).join('')}</optgroup>`;
}).join('');
let mode = 'calc';
const form = $('#calcForm');
function sumCalc() {
  const f = form, m = byId(f.model.value);
  const needs = ['install', 'delivery', 'design'].filter(n => f[n].checked).map(n => ({ install: 'установка', delivery: 'доставка', design: 'помощь с подбором' }[n]));
  const rows = [
    ['Модель', m ? fullName(m) : 'нужна помощь с выбором'],
    ['Количество', `${f.qty.value} шт.`],
    ['Высота проёма', f.h.value],
    ['Дополнительно', needs.join(', ') || '—'],
    ['Город', f.city.value]
  ];
  if (mode === 'measure') { if (f.addr.value) rows.push(['Адрес', f.addr.value]); if (f.date.value) rows.push(['Дата', new Date(f.date.value).toLocaleDateString('ru-RU')]); }
  $('#cSum').innerHTML = rows.map(r => `<div>${r[0]}: <b>${esc(r[1])}</b></div>`).join('');
  return rows;
}
form.addEventListener('input', sumCalc); form.addEventListener('change', sumCalc);
$$('[data-step]').forEach(b => b.addEventListener('click', () => { const q = form.qty; q.value = Math.max(1, Math.min(99, (+q.value || 1) + +b.dataset.step)); sumCalc(); }));
form.qty.addEventListener('blur', () => { form.qty.value = Math.max(1, Math.min(99, +form.qty.value || 1)); sumCalc(); });
$$('.calc__tabs button').forEach(b => b.addEventListener('click', () => {
  mode = b.dataset.tab;
  $$('.calc__tabs button').forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', x === b); });
  $$('[data-only="measure"]', form).forEach(x => x.hidden = mode !== 'measure');
  $('#cBtn').textContent = mode === 'measure' ? 'Записаться на замер в WhatsApp' : 'Получить расчёт в WhatsApp';
  sumCalc();
}));
maskPhone(form.phone);
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!phoneOk(form.phone.value)) { $('#cErr').textContent = 'Укажите номер полностью: +7 (XXX) XXX-XX-XX'; form.phone.focus(); return; }
  $('#cErr').textContent = '';
  const rows = sumCalc();
  const head = mode === 'measure' ? 'Здравствуйте! Хочу записаться на замер.' : 'Здравствуйте! Прошу рассчитать стоимость дверей.';
  openWA([head, ...rows.map(r => `${r[0]}: ${r[1]}`), form.name.value ? `Имя: ${form.name.value}` : '', `Телефон: ${form.phone.value}`].filter(Boolean).join('\n'));
});
form.phone.addEventListener('input', () => { if (phoneOk(form.phone.value)) $('#cErr').textContent = ''; });
sumCalc();

/* ---------- callback modal ---------- */
const modal = $('#modal'); let lastFocus;
function openModal() { lastFocus = document.activeElement; modal.hidden = false; document.body.classList.add('lock'); setTimeout(() => $('#mPhone').focus(), 60); }
function closeModal() { modal.hidden = true; document.body.classList.remove('lock'); lastFocus && lastFocus.focus(); }
maskPhone($('#mPhone'));
modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });
addEventListener('keydown', e => { if (e.key === 'Escape') { if (!modal.hidden) closeModal(); if (document.body.classList.contains('menu-open')) toggleMenu(false); } });
$('#cbForm').addEventListener('submit', e => {
  e.preventDefault();
  const p = $('#mPhone').value;
  if (!phoneOk(p)) { $('#mErr').textContent = 'Укажите номер полностью'; return; }
  $('#mErr').textContent = '';
  const n = $('#mName').value.trim();
  openWA(`Здравствуйте! Прошу перезвонить мне.${n ? '\nИмя: ' + n : ''}\nТелефон: ${p}`);
  closeModal();
});

/* ---------- global clicks ---------- */
document.addEventListener('click', e => {
  const wa = e.target.closest('[data-wa]');
  if (wa) { e.preventDefault(); openWA(wa.dataset.wa); return; }
  if (e.target.closest('[data-callback]')) { e.preventDefault(); openModal(); return; }
  const a = e.target.closest('a[href^="#/"]');
  if (a) {
    e.preventDefault();
    const f = a.dataset.filter;
    if (f) { const [k, v] = f.split(':'); Object.keys(state).forEach(x => state[x] = 'all'); state[k] = v; limit = 12; buildChips(); renderGrid(); }
    if (a.dataset.model) { cModel.value = a.dataset.model; sumCalc(); }
    toggleMenu(false);
    const href = a.getAttribute('href');
    if (location.hash === href) route(); else location.hash = href;
  }
});

/* ---------- menu ---------- */
const burger = $('#burger');
function toggleMenu(on) {
  on = on ?? !document.body.classList.contains('menu-open');
  document.body.classList.toggle('menu-open', on); document.body.classList.toggle('lock', on);
  burger.setAttribute('aria-expanded', on); burger.setAttribute('aria-label', on ? 'Закрыть меню' : 'Открыть меню');
  $('#mnav').setAttribute('aria-hidden', !on);
}
burger.addEventListener('click', () => toggleMenu());

/* ---------- header ---------- */
const hdr = $('#hdr'); let lastY = 0;
function onScrollHdr() {
  const y = scrollY;
  hdr.classList.toggle('solid', y > 20 || !$('#door').hidden);
  hdr.classList.toggle('hide', y > 500 && y > lastY + 4 && !document.body.classList.contains('menu-open'));
  if (y < lastY - 4) hdr.classList.remove('hide');
  lastY = y;
}
addEventListener('scroll', onScrollHdr, { passive: true });

/* active nav */
const navIO = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) $$('.nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#/s/' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
['catalog', 'custom', 'hidden', 'process', 'reviews', 'faq', 'contacts'].forEach(id => navIO.observe(document.getElementById(id)));

/* ---------- parallax + hero tilt ---------- */
if (!RM) {
  let ticking = false;
  const par = () => {
    ticking = false;
    const vh = innerHeight;
    $$('[data-speed]').forEach(el => {
      if (el.closest('[hidden]')) return;
      const r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return;
      const t = (r.top + r.height / 2 - vh / 2) * +el.dataset.speed;
      const img = el.tagName === 'IMG' ? el : el.querySelector('img');
      if (img) img.style.transform = `translate3d(0,${t.toFixed(1)}px,0) scale(1.08)`;
    });
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(par); } }, { passive: true });
  par();
  const stage = $('#stage'), hero = $('.hero');
  if (FINE) {
    hero.addEventListener('pointermove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      stage.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg'); stage.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg');
    });
    hero.addEventListener('pointerleave', () => { stage.style.setProperty('--ry', '0deg'); stage.style.setProperty('--rx', '0deg'); });
  }
}
function ajarOnce() {
  if (RM) return;
  const c = $('.d3--c'); setTimeout(() => c.classList.add('ajar'), 700); setTimeout(() => c.classList.remove('ajar'), 3200);
}

/* ---------- door page ---------- */
function setMeta(t, d) { document.title = t; $('meta[name="description"]').setAttribute('content', d); }
const HOME_TITLE = document.title, HOME_DESC = $('meta[name="description"]').content;
function renderDoor(d) {
  const i = DOORS.indexOf(d), prev = DOORS[(i - 1 + DOORS.length) % DOORS.length], next = DOORS[(i + 1) % DOORS.length];
  let sim = DOORS.filter(x => x.style === d.style && x !== d);
  if (sim.length < 4) sim = sim.concat(DOORS.filter(x => x.fam === d.fam && x !== d && !sim.includes(x)));
  sim = sim.slice(0, 4);
  const specs = [
    d.model && ['Модель', d.model], ['Цвет', d.color], ['Дизайн', ST[d.style]], ['Покрытие', CO[d.coat]], ['Высота', d.h],
    d.made === 'dverium' && ['Изготовление', 'По индивидуальным размерам'], ['Производство', MA[d.made]]
  ].filter(Boolean);
  const msg = priceMsg(d);
  $('#door').innerHTML = `<article class="dp"><div class="wrap">
    <nav class="crumbs" aria-label="Навигация"><a href="#/">Главная</a><span>/</span><a href="#/s/catalog">Каталог</a><span>/</span><span>${esc(title(d))}</span></nav>
    <div class="dp__grid">
      <div class="dp__gal">
        <div class="dp__thumbs">
          <button type="button" class="on" data-src="img/full/${d.img}.jpg" data-mode="full" aria-label="Фото в шоуруме"><img src="img/full/${d.img}.jpg" alt="" loading="lazy"></button>
          <button type="button" data-src="img/card/${d.img}.jpg" data-mode="leaf" aria-label="Полотно"><img src="img/card/${d.img}.jpg" alt="" style="object-fit:contain;background:#e9e1d4"></button>
        </div>
        <div class="dp__main" id="dpMain"><img src="img/full/${d.img}.jpg" alt="Межкомнатная дверь ${esc(fullName(d))}"><span class="dp__hint">${FINE ? 'Нажмите, чтобы приблизить' : 'Фото из шоурума'}</span></div>
      </div>
      <div class="dp__info">
        <p class="eyebrow" data-reveal>${MA[d.made] === 'Dverium' ? 'Производство Dverium' : 'Производство: ' + MA[d.made]} · ${ST[d.style]}</p>
        <h1 class="split" data-reveal>${esc(title(d))}</h1>
        <p class="dp__color" data-reveal>${esc(colorLine(d))}</p>
        <dl class="specs" data-reveal>${specs.map(s => `<div><dt>${s[0]}</dt><dd>${esc(s[1])}</dd></div>`).join('')}</dl>
        <div class="dp__cta" data-reveal>
          <a class="btn btn--dark" href="${waUrl(msg)}" target="_blank" rel="noopener" data-wa="${esc(msg)}"><span>Узнать стоимость</span></a>
          <a class="btn btn--line" href="#/s/calc" data-model="${d.id}"><span>Рассчитать комплект</span></a>
        </div>
        <form class="qf" id="qf" novalidate data-reveal>
          <h3 class="h-sm">Быстрая заявка на эту модель</h3>
          <div class="field"><label for="qName">Имя</label><input id="qName" type="text" autocomplete="name" placeholder="Имя"></div>
          <div class="field"><label for="qPhone">Телефон</label><input id="qPhone" type="tel" autocomplete="tel" inputmode="tel" placeholder="+7 (___) ___-__-__"></div>
          <div class="field"><label for="qQty">Количество</label><select id="qQty">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option>${n}</option>`).join('')}<option>Больше 10</option></select></div>
          <div class="field"><label for="qH">Высота проёма</label><select id="qH"><option>2,00 м</option><option>2,20 м</option><option>2,30 м</option><option>2,40 м</option><option>Не знаю</option></select></div>
          <small class="err" id="qErr" role="alert" style="grid-column:1/-1"></small>
          <button class="btn btn--dark" type="submit"><span>Отправить в WhatsApp</span></button>
        </form>
      </div>
    </div>
    <nav class="dp__nav" aria-label="Другие модели"><a href="#/door/${prev.id}"><small>← Предыдущая</small><b>${esc(title(prev))}</b></a><a href="#/door/${next.id}"><small>Следующая →</small><b>${esc(title(next))}</b></a></nav>
    <section class="dp__sim"><div class="sec__head"><p class="eyebrow">Похожие модели</p><h2 class="h-sec">Вам может понравиться</h2></div><div class="grid">${sim.map(card).join('')}</div></section>
  </div></article>`;
  const main = $('#dpMain'), mimg = main.querySelector('img');
  $$('.dp__thumbs button').forEach(b => b.addEventListener('click', () => {
    $$('.dp__thumbs button').forEach(x => x.classList.toggle('on', x === b));
    mimg.style.opacity = 0;
    setTimeout(() => { mimg.src = b.dataset.src; main.classList.toggle('leaf', b.dataset.mode === 'leaf'); main.classList.remove('zoom'); mimg.style.opacity = 1; }, 200);
  }));
  if (FINE) {
    main.addEventListener('click', () => main.classList.toggle('zoom'));
    main.addEventListener('pointermove', e => { const r = main.getBoundingClientRect(); mimg.style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`; });
    main.addEventListener('pointerleave', () => main.classList.remove('zoom'));
  }
  const qf = $('#qf'); maskPhone($('#qPhone'));
  qf.addEventListener('submit', e => {
    e.preventDefault();
    const p = $('#qPhone').value;
    if (!phoneOk(p)) { $('#qErr').textContent = 'Укажите номер полностью: +7 (XXX) XXX-XX-XX'; $('#qPhone').focus(); return; }
    $('#qErr').textContent = '';
    const n = $('#qName').value.trim();
    openWA(`${msg}\nКоличество: ${$('#qQty').value}\nВысота проёма: ${$('#qH').value}${n ? '\nИмя: ' + n : ''}\nТелефон: ${p}`);
  });
  setMeta(`${fullName(d)} — межкомнатная дверь | Dverium Алматы`, `${fullName(d)}: ${ST[d.style].toLowerCase()}, ${CO[d.coat].toLowerCase()}, высота ${d.h}. Производство: ${MA[d.made]}. Бесплатная доставка по Алматы и Казахстану, установка.`);
  observe($('#door')); bindTilt($('#door'));
}

/* ---------- router ---------- */
let view = null;
function scrollToId(id, smooth) {
  const el = id && document.getElementById(id);
  const y = el ? el.getBoundingClientRect().top + scrollY - (id === 'marquee' ? 0 : 0) : 0;
  window.scrollTo({ top: Math.max(0, y - (el && el.classList.contains('sec') ? 0 : 0)), behavior: smooth && !RM ? 'smooth' : 'auto' });
}
function swap(fn) {
  if (RM || !view) { fn(); return; }
  const c = $('#curtain');
  c.className = 'curtain in';
  setTimeout(() => { fn(); c.className = 'curtain out'; setTimeout(() => c.className = 'curtain', 600); }, 460);
}
function route() {
  const h = location.hash || '#/';
  const m = h.match(/^#\/door\/([\w-]+)/);
  if (m) {
    const d = byId(m[1]);
    if (!d) { location.hash = '#/s/catalog'; return; }
    $$('.nav a').forEach(a => a.classList.remove('on'));
    swap(() => { $('#home').hidden = true; $('#door').hidden = false; renderDoor(d); scrollTo(0, 0); view = 'door'; onScrollHdr(); });
    return;
  }
  const s = (h.match(/^#\/s\/([\w-]+)/) || [])[1];
  if (view !== 'home') {
    swap(() => {
      $('#door').hidden = true; $('#door').innerHTML = ''; $('#home').hidden = false; setMeta(HOME_TITLE, HOME_DESC);
      const first = view === null; view = 'home';
      requestAnimationFrame(() => s ? scrollToId(s, false) : (first ? null : scrollTo(0, 0)));
      onScrollHdr();
    });
  } else s ? scrollToId(s, true) : scrollToId(null, true);
}
addEventListener('hashchange', route);

/* ---------- intro ---------- */
function start() {
  observe(); route();
  const intro = $('#intro');
  let seen = false; try { seen = sessionStorage.getItem('dv_intro'); } catch (e) {}
  if (RM || seen) { intro.remove(); ajarOnce(); return; }
  document.body.classList.add('lock');
  let went = false;
  const go = () => {
    if (went) return; went = true;
    intro.classList.add('open');
    setTimeout(() => { intro.classList.add('done'); document.body.classList.remove('lock'); ajarOnce(); }, 1150);
    setTimeout(() => intro.remove(), 2100);
    try { sessionStorage.setItem('dv_intro', 1); } catch (e) {}
  };
  const t = setTimeout(go, 1300);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { clearTimeout(t); setTimeout(go, 650); });
}
$('#yr').textContent = new Date().getFullYear();
start();
})();
