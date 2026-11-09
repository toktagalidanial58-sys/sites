/* Каталог Dverium — все данные взяты из подписей клиента. Фото: img/card (полотно), img/full (дверь в шоуруме). */
window.DV_STYLES = {
  min: 'Современный минимализм',
  neo: 'Неоклассика',
  fr: 'Французская классика',
  bag: 'Багетная серия',
  mcl: 'Современная классика'
};
window.DV_COATS = {
  enamel: 'Эмаль',
  film: 'Антивандальная плёнка',
  paint: 'Итальянская краска',
  model: 'Уточняется по модели'
};
window.DV_MADE = { dverium: 'Dverium', ru: 'Россия', cn: 'Китай' };
window.DV_FAMS = {
  light: 'Светлые',
  beige: 'Бежевые и серые',
  dark: 'Тёмные',
  wood: 'Древесные',
  color: 'Цветные',
  mirror: 'Зеркало'
};
/* model — название модели (если клиент его указал), color — цвет как в подписи */
window.DV_AI = ["B02", "B05", "B06", "B09", "B12", "B14", "B16", "B17", "B20", "C01", "C02", "A16", "A17", "A18", "A19", "A20"];
window.DV_DOORS = [
  // ——— Собственное производство Dverium (по индивидуальным размерам, высота под заказ)
  { id: 'temnyj-oreh', img: 'A13', model: '', color: 'Тёмный орех (Dark Walnut)', style: 'min', coat: 'model', h: 'Под заказ', made: 'dverium', fam: 'wood' },
  { id: 'ral-6018', img: 'A02', model: '', color: 'RAL 6018', style: 'min', coat: 'model', h: 'Под заказ', made: 'dverium', fam: 'color' },
  { id: 'yurta', img: 'A03', model: 'Юрта', color: 'RAL 1001', style: 'min', coat: 'model', h: 'Под заказ', made: 'dverium', fam: 'light' },
  { id: 'ral-1019', img: 'A04', model: '', color: 'RAL 1019', style: 'min', coat: 'model', h: 'Под заказ', made: 'dverium', fam: 'beige' },
  { id: 'baget-ral-1013', img: 'A05', model: '', color: 'RAL 1013', style: 'bag', coat: 'model', h: 'Под заказ', made: 'dverium', fam: 'light' },
  { id: 'baget-ral-5040', img: 'A06', model: '', color: 'RAL 5040', style: 'bag', coat: 'model', h: 'Под заказ', made: 'dverium', fam: 'beige' },
  { id: 'baget-ral-9016', img: 'A07', model: '', color: 'RAL 9016', style: 'bag', coat: 'model', h: 'Под заказ', made: 'dverium', fam: 'light' },
  { id: 'skrytaya-zerkalo', img: 'A08', model: 'Скрытая дверь с зеркалом', color: 'Зеркальное полотно', style: 'min', coat: 'model', h: 'Под заказ', made: 'dverium', fam: 'mirror' },
  { id: 'dub-naturalnyj', img: 'A09', model: '', color: 'Шпон дуб натуральный', style: 'min', coat: 'model', h: 'Под заказ', made: 'dverium', fam: 'wood' },
  { id: 'ral-8025', img: 'A10', model: '', color: 'RAL 8025', style: 'min', coat: 'model', h: 'Под заказ', made: 'dverium', fam: 'dark' },
  { id: 'belaya-relef', img: 'A11', model: '', color: 'Белый', style: 'min', coat: 'model', h: 'Под заказ', made: 'dverium', fam: 'light' },
  { id: 'tik-konyak', img: 'A12', model: '', color: 'Тик коньяк', style: 'min', coat: 'model', h: 'Под заказ', made: 'dverium', fam: 'wood' },

  // ——— Россия / Китай
  { id: 'urban-z-antracit', img: 'A14', model: 'URBAN Z Эмалекс', color: 'Антрацит', style: 'min', coat: 'film', h: '2,00 и 2,20 м', made: 'ru', fam: 'dark' },
  { id: 'agaro', img: 'A15', model: 'Агаро', color: 'Тепло-серый и белый', style: 'fr', coat: 'enamel', h: '2,20–2,30 м', made: 'ru', fam: 'light' },
  { id: 'manchester-mokko', img: 'A16', model: 'Манчестер', color: 'Мокко', style: 'fr', coat: 'enamel', h: '2,00–2,30 м', made: 'ru', fam: 'beige' },
  { id: 'manchester-belyj', img: 'A17', model: 'Манчестер', color: 'Белый', style: 'fr', coat: 'enamel', h: '2,00–2,30 м', made: 'ru', fam: 'light' },
  { id: 'sietl', img: 'A18', model: 'Сиэтл', color: 'Тепло-серый и белый', style: 'fr', coat: 'enamel', h: '2,00 / 2,20 / 2,30 м', made: 'ru', fam: 'light' },
  { id: 'neapol', img: 'A19', model: 'Неаполь', color: 'Тепло-серый и белый', style: 'fr', coat: 'enamel', h: '2,20–2,30 м', made: 'ru', fam: 'light' },
  { id: 'parizh', img: 'A20', model: 'Париж', color: 'Тепло-серый и белый', style: 'fr', coat: 'enamel', h: '2,20–2,30 м', made: 'ru', fam: 'light' },
  { id: 'dubaj', img: 'B01', model: 'Дубай', color: 'Тепло-серый и белый', style: 'fr', coat: 'enamel', h: '2,00–2,20 м', made: 'ru', fam: 'light' },
  { id: 'ronda', img: 'B02', model: 'Ронда', color: 'Мокко', style: 'neo', coat: 'enamel', h: '2,20 м', made: 'ru', fam: 'beige' },
  { id: 'barselona-1', img: 'B03', model: 'Барселона 1', color: 'Мокко и белый', style: 'neo', coat: 'enamel', h: '2,00–2,20 м', made: 'ru', fam: 'beige' },
  { id: 'prado', img: 'B04', model: 'Прадо', color: 'Ваниль', style: 'neo', coat: 'film', h: '2,00–2,20 м', made: 'ru', fam: 'light' },
  { id: 'beatris', img: 'B05', model: 'Беатрис', color: 'Белый', style: 'neo', coat: 'enamel', h: '2,20 м', made: 'ru', fam: 'light' },
  { id: 'veneciya-5', img: 'B06', model: 'Венеция-5', color: 'Магнолия, серый, белый', style: 'neo', coat: 'film', h: '2,00–2,20 м', made: 'cn', fam: 'light' },
  { id: 'barselona-2-mokko', img: 'B08', model: 'Барселона 2', color: 'Мокко и белый', style: 'neo', coat: 'enamel', h: '2,00–2,20 м', made: 'ru', fam: 'beige' },
  { id: 'barselona-2-ajvori', img: 'B09', model: 'Барселона 2', color: 'Айвори', style: 'neo', coat: 'enamel', h: '2,00–2,20 м', made: 'ru', fam: 'light' },
  { id: 'urban-z-toup', img: 'B10', model: 'URBAN Z Эмалекс', color: 'Тоуп', style: 'min', coat: 'film', h: '2,00–2,20 м', made: 'ru', fam: 'beige' },
  { id: 'platinum-sharm-shokolad', img: 'B12', model: 'Платинум Шарм-шоколад', color: 'Шоколадный', style: 'min', coat: 'film', h: '2,00–2,20 м', made: 'ru', fam: 'dark' },
  { id: 'dl-810-al2-tryufel', img: 'B13', model: 'DL 810 AL2', color: 'Дуб винчестер трюфель', style: 'min', coat: 'film', h: '2,00 / 2,20 / 2,30 м', made: 'ru', fam: 'wood' },
  { id: 'dl-810-al2-svetlyj', img: 'B14', model: 'DL 810 AL2', color: 'Дуб винчестер светлый', style: 'min', coat: 'film', h: '2,00 / 2,20 / 2,30 м', made: 'ru', fam: 'wood' },
  { id: 'platinum-bodega', img: 'B15', model: 'Платинум Бодега натуральный', color: 'Бодега натуральный', style: 'min', coat: 'film', h: '2,00–2,20 м', made: 'ru', fam: 'wood' },
  { id: 'platinum-sharm-mokko', img: 'B16', model: 'Платинум Шарм-мокко', color: 'Шарм-мокко', style: 'min', coat: 'film', h: '2,00–2,20 м', made: 'ru', fam: 'beige' },
  { id: 'platinum-ematiks-krem', img: 'B17', model: 'Платинум Эматикс крем', color: 'Кремовый', style: 'min', coat: 'film', h: '2,00–2,20 м', made: 'ru', fam: 'light' },
  { id: 'platinum-oreh-lusso', img: 'B18', model: 'Платинум Орех луссо', color: 'Орех луссо', style: 'min', coat: 'film', h: '2,00 / 2,30 / 2,40 м', made: 'ru', fam: 'wood' },
  { id: 'franciya', img: 'B20', model: 'Франция', color: 'Белый с синим оттенком', style: 'neo', coat: 'enamel', h: '2,00–2,20 м', made: 'ru', fam: 'light' },
  { id: 'venza', img: 'C01', model: 'Венза', color: 'Слоновая кость', style: 'mcl', coat: 'enamel', h: '2,00 / 2,20 / 2,30 м', made: 'cn', fam: 'light' },
  { id: 'stella-madrid', img: 'C02', model: 'Стелла Мадрид', color: 'Белый и бежевый агат', style: 'fr', coat: 'film', h: '2,00–2,20 м', made: 'ru', fam: 'light' },
  { id: 'dl-750', img: 'C03', model: 'DL 750', color: 'Капучино и белый', style: 'neo', coat: 'enamel', h: '2,00–2,20 м', made: 'ru', fam: 'beige' },
  { id: 'dl-795', img: 'C04', model: 'DL 795', color: 'Агат, капучино, белый', style: 'fr', coat: 'enamel', h: '2,00 / 2,20 / 2,30 м', made: 'ru', fam: 'light' },
  { id: 'uno', img: 'C05', model: 'UNO', color: 'Белый', style: 'neo', coat: 'paint', h: '2,00–2,20 м', made: 'cn', fam: 'light' },
];
