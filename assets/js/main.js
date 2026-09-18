/**
 * «Калория» — связывание CALORIYA с DOM и лёгкие взаимодействия.
 * Ноль фреймворков, ноль сборки. Страница полностью читается без JS: все
 * ссылки и тексты стоят в разметке как fallback, JS только переписывает их
 * значениями из конфига — единственного места, где их правят.
 */
(function () {
  'use strict';

  var C = window.CALORIYA || {};

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function each(sel, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), fn);
  }

  function setHref(sel, url) {
    if (!url) return;
    each(sel, function (el) { el.setAttribute('href', url); });
  }

  /* ── Метки рекламы: лендинг обязан их передать дальше ─────────────────────
   * Клик из Директа приземляется здесь, а аккаунт рождается на my.calorybot.ru
   * — на первом ответе квиза. Метки читает там `captureAttribution()`
   * (@calorybot frontend/assets/api.js) из `location.search`, так что не
   * передать их значит записать в таблицу `acquisition` пустоту: визит Метрика
   * склеит (cookie одна на домен второго уровня), а вот какая кампания и какая
   * фраза его привели — мы не узнаем. Ровно этого здесь и не было.
   *
   * Переносим только известные метки, а не весь query. Слепой перенос дал бы
   * любому желающему складывать в нашу таблицу произвольные значения ссылкой,
   * а заодно тащил бы на воронку мусор вроде `fbclid`.
   *
   * Список — те же имена, что читает воронка. Разойдётся — метка молча
   * перестанет доезжать, поэтому имена держать одинаковыми.
   */
  var AD_MARKS = ['yclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
    'utm_term', 'source', 'source_type', 'device_type', 'match_type',
    'matched_keyword', 'gbid', 'ad_id'];

  function adQuery() {
    var from = new URLSearchParams(location.search);
    var out = new URLSearchParams();
    AD_MARKS.forEach(function (k) { if (from.get(k)) out.set(k, from.get(k)); });
    var s = out.toString();
    return s ? '?' + s : '';
  }

  /* Наши собственные адреса — им метки нужны. Ссылка в бота метки в query не
   * принимает (Telegram их не передаёт боту), у неё свой механизм — ниже. */
  function withMarks(url) {
    if (!url) return url;
    var marks = adQuery();
    if (!marks) return url;
    return url + (url.indexOf('?') >= 0 ? '&' + marks.slice(1) : marks);
  }

  /* ── Ссылка в бота: почему она несёт payload ──────────────────────────────
   * Человек, ушедший в Telegram, для Директа невидим дважды: бот-ссылки на
   * пейвол не несут `r=web`, поэтому счётчик их оплаты не видит вовсе, а у
   * свежего бот-аккаунта нет ни ClientID, ни yclid, к которым можно привязать
   * платёж. Поэтому ссылка отдаёт ClientID сама: `/start` кладёт его в
   * `acquisition` бот-аккаунта (@calorybot handlers/commands.py), и оттуда уже
   * работающий фид офлайн-конверсий сообщает Директу первый ребил этого
   * человека как `rebill_1_ok`.
   *
   * ⚠️ Формат общий с @calorybot frontend/assets/lib.js (`botUrl`) и разбирается
   * @calorybot web/attribution.py. Три места, сборки между ними нет — то же
   * правило и та же цена ошибки, что у номера счётчика и у цен. Поэтому формат
   * намеренно тупой.
   *
   * `ym-` с дефисом — несущая деталь: тот же аргумент `/start` уже занят
   * партнёрскими ссылками (`<hashid>[_<tag>]`), а алфавит Hashids
   * буквенно-цифровой и дефис в нём невозможен. Значит payload, начинающийся с
   * `ym-`, партнёрским хэшем быть не может, и разбор их различает, а не угадывает.
   */
  function botUrl(base, clientID) {
    if (!base) return base;
    var parts = [];
    if (clientID) parts.push('c' + clientID);
    var yclid = new URLSearchParams(location.search).get('yclid');
    if (yclid) parts.push('y' + yclid);
    if (!parts.length) return base;
    var payload = 'ym-' + parts.join('-');
    return base + (base.indexOf('?') >= 0 ? '&' : '?') + 'start=' + encodeURIComponent(payload);
  }

  /* ── Ссылки ───────────────────────────────────────────────────────────────
   * Точки входа адресуются через [data-cta], документы — через [data-link].
   * Разделение не косметическое: data-cta — это места, по которым считается
   * воронка, и именно их перечисляет блок целей Метрики ниже.
   */
  /* Метки на всех четырёх наших адресах, а не только на квизе. Аккаунт рождается
   * только в квизе, но зайти по объявлению можно в любую из дверей, а запись
   * атрибуции insert-only (первое касание побеждает) — так что лишняя метка не
   * стоит ничего, а недостающая стоит потерянной кампании. */
  setHref('[data-cta="start"]', withMarks(C.LINK_START));
  setHref('[data-cta="login"]', withMarks(C.LINK_LOGIN));
  setHref('[data-cta="app"]', withMarks(C.LINK_APP));
  setHref('[data-cta="bot"]', botUrl(C.TELEGRAM_BOT_URL, null));
  setHref('[data-cta="support"]', C.TELEGRAM_SUPPORT_URL);
  setHref('[data-link="privacy"]', C.LINK_PRIVACY);
  setHref('[data-link="terms"]', C.LINK_TERMS);
  setHref('[data-link="cancel"]', C.LINK_CANCEL);
  setHref('[data-link="account"]', withMarks(C.LINK_ACCOUNT));

  /* Каналы «скоро». Плитка размечена неактивной, и это состояние по умолчанию:
   * появился адрес в конфиге — плитка сама становится ссылкой. Обратный порядок
   * (активна по умолчанию) означал бы живую кнопку в никуда при пустом конфиге. */
  [['max', C.LINK_MAX], ['rustore', C.LINK_RUSTORE]].forEach(function (pair) {
    var url = pair[1];
    if (!url) return;
    each('[data-entry="' + pair[0] + '"]', function (el) {
      var link = document.createElement('a');
      link.className = 'entry';
      link.href = url;
      link.innerHTML = el.innerHTML;
      var badge = link.querySelector('.badge-soon');
      if (badge) badge.remove();
      var go = link.querySelector('.go');
      if (go) go.innerHTML = 'Открыть <svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#i-arrow-right"></use></svg>';
      el.replaceWith(link);
    });
  });

  /* ── Почта поддержки ──────────────────────────────────────────────────── */
  if (C.SUPPORT_EMAIL) {
    each('[data-email]', function (el) {
      el.setAttribute('href', 'mailto:' + C.SUPPORT_EMAIL);
      (el.querySelector('span') || el).textContent = C.SUPPORT_EMAIL;
    });
  }

  /* ── Команда отмены ──────────────────────────────────────────────────── */
  if (C.CANCEL_CMD) {
    each('[data-cancel-cmd]', function (el) { el.textContent = C.CANCEL_CMD; });
  }

  /* ── Реквизиты и год ─────────────────────────────────────────────────── */
  var legal = document.querySelector('[data-legal]');
  if (legal && C.LEGAL_ENTITY) {
    legal.textContent = C.LEGAL_ENTITY + ' · ИНН ' + C.INN + ' · ОГРНИП ' + C.OGRNIP;
  }
  [['[data-legal-entity]', C.LEGAL_ENTITY], ['[data-inn]', C.INN], ['[data-ogrnip]', C.OGRNIP]]
    .forEach(function (pair) {
      if (!pair[1]) return;
      each(pair[0], function (el) { el.textContent = pair[1]; });
    });
  each('[data-year]', function (el) { el.textContent = new Date().getFullYear(); });

  /* ── Тарифы ───────────────────────────────────────────────────────────────
   * Карточки информационные, кнопки в них нет намеренно: тариф выбирается на
   * шаге оплаты, и четыре кнопки «Выбрать», которые ведут в одно и то же место,
   * обещали бы выбор, которого на лендинге не происходит. Действие — одно,
   * в блоке .pricing-cta под сеткой.
   */
  var grid = document.getElementById('pricingGrid');
  if (grid && Array.isArray(C.PRICING)) {
    var nf = new Intl.NumberFormat('ru-RU');
    var cur = C.CURRENCY || '₽';
    // Разметка несёт копию цен как fallback для «без JS» и для краулеров,
    // которые скрипты не исполняют. Копия может отстать молча — поэтому
    // расхождение с конфигом кричит в консоль, а не доживает до продакшена.
    var fallback = grid.textContent.replace(/\s+/g, ' ');
    C.PRICING.forEach(function (p) {
      if (fallback.indexOf(String(p.price).replace(/\B(?=(\d{3})+$)/g, ' ')) === -1) {
        console.warn('[Калория] цена тарифа «' + p.title + '» в разметке не совпадает с config.js');
      }
    });
    grid.innerHTML = C.PRICING.map(function (p) {
      // «N ₽ в день» — не для триала: делить стартовую цену на 3 дня значит
      // рекламировать 4 ₽/день, по которым сервис не продаётся ни одного дня.
      var meta = p.featured
        ? esc(p.caption || '')
        : nf.format(Math.round(p.price / p.days)) + ' ' + esc(cur) + ' в день';
      return '' +
        '<article class="plan' + (p.featured ? ' plan--featured' : '') + '">' +
          '<span class="plan-badge' + (p.badge ? '' : ' plan-badge--empty') + '">' + esc(p.badge || '·') + '</span>' +
          '<span class="plan-title">' + esc(p.title) + '</span>' +
          '<span class="plan-duration">' + esc(p.duration) + '</span>' +
          '<span class="plan-price"><b>' + nf.format(p.price) + '</b><span class="cur">' + esc(cur) + '</span></span>' +
          '<span class="plan-meta">' + meta + '</span>' +
        '</article>';
    }).join('');
  }

  /* ── Формулировки оферты, привязанные к тарифам ──────────────────────── */
  each('[data-plan]', function (el) {
    var p = (C.PRICING || []).filter(function (x) { return x.id === el.getAttribute('data-plan'); })[0];
    if (!p) return;
    var f = el.getAttribute('data-field');
    if (p[f] != null) el.textContent = p[f];
  });

  /* ── Раскрытие условий автопродления ─────────────────────────────────── */
  var note = document.getElementById('billingNote');
  if (note && C.BILLING_NOTE) {
    var html = esc(C.BILLING_NOTE);
    if (C.CANCEL_CMD) {
      html = html.split(esc(C.CANCEL_CMD)).join('<code>' + esc(C.CANCEL_CMD) + '</code>');
    }
    note.innerHTML = html;
  }

  /* ── Тень у шапки при скролле ────────────────────────────────────────── */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Мобильное меню ──────────────────────────────────────────────────── */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobileMenu');
  if (toggle && menu) {
    var setMenu = function (open) {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      // Полные пути, а не склейка: имя глифа, собранное из куска строки,
      // невидимо для аудита спрайта — и ссылка на удалённый символ рисует
      // пустую кнопку молча. Ровно это и случилось при чистке icons.svg.
      var icon = toggle.querySelector('use');
      if (icon) {
        icon.setAttribute('href', open
          ? '/assets/img/icons.svg#i-x'
          : '/assets/img/icons.svg#i-menu');
      }
    };
    toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* ── Аккордеон: открыт один вопрос ───────────────────────────────────────
   * <details> доступен и работает без JS; JS добавляет только взаимное
   * закрытие, чтобы список не разъезжался на весь экран.
   */
  var qas = document.querySelectorAll('.faq .qa');
  Array.prototype.forEach.call(qas, function (qa) {
    qa.addEventListener('toggle', function () {
      if (!qa.open) return;
      Array.prototype.forEach.call(qas, function (other) {
        if (other !== qa) other.open = false;
      });
    });
  });

  /* ── Появление при скролле ───────────────────────────────────────────── */
  var reveal = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && reveal.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-visible');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    Array.prototype.forEach.call(reveal, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(reveal, function (el) { el.classList.add('is-visible'); });
  }

  /* ── Яндекс Метрика ───────────────────────────────────────────────────────
   * Счётчик 112507894 — тот же, что на my.calorybot.ru и pay.calorybot.ru.
   * Обоснование, почему один, а не три — в config.js рядом с номером.
   *
   * Загрузчик — дословно тот, что генерирует сам кабинет счётчика: URL
   * библиотеки с `?id=`, защита от повторной вставки, те же опции `init`. Своя
   * версия — это вторая реализация того, что Яндекс меняет, не спрашивая нас;
   * первая редакция этого файла как раз отличалась от эталона (не было `?id=` и
   * не было защиты от дубля), и разошлась бы дальше.
   *
   * `<noscript>`-пиксель не ставим: из внешнего файла он невозможен — при
   * выключенном JS этот код не выполняется вовсе.
   */
  if (C.METRIKA_ID) {
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
      k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=' + C.METRIKA_ID, 'ym');

    window.ym(C.METRIKA_ID, 'init', {
      ssr: true,
      webvisor: true,
      clickmap: true,
      referrer: document.referrer,
      url: location.href,
      accurateTrackBounce: true,
      trackLinks: true,
    });

    /* ── Цели ───────────────────────────────────────────────────────────────
     * Ровно одна, и это исправление, а не урезание. Раньше здесь стояло
     * `reachGoal('cta_' + data-cta)`, то есть имя цели собиралось из атрибута
     * разметки: улетали `cta_start`, `cta_bot`, `cta_login`, `cta_app`,
     * `cta_support` — и ни одна из них не была создана в Метрике. Незнакомый
     * идентификатор Метрика принимает молча и никуда не записывает, так что
     * весь блок был no-op, выглядящим как аналитика.
     *
     * `bot_click` (создана на счётчике, §10.2) — это выбор побочного канала:
     * человек уходит в Telegram вместо веба. Только продуктовый бот; поддержка
     * не считается — написать в поддержку не значит войти в продукт.
     *
     * Отдельной цели на переход в квиз нет намеренно. Теперь, когда лендинг и
     * my.calorybot.ru в одном счётчике, шаг «лендинг → квиз» виден в отчёте по
     * страницам бесплатно, а первое действие в квизе уже считает `quiz_start`.
     * Цель на клик была бы третьей копией того же факта.
     *
     * Один раз за визит: бюджет при оплате за конверсии списывается за каждое
     * достижение цели в визите, поэтому цель, которую можно нащёлкать, — это
     * цель, за которую можно заплатить дважды.
     */
    var goalSent = false;
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-cta="bot"]');
      if (!el || goalSent) return;
      goalSent = true;
      window.ym(C.METRIKA_ID, 'reachGoal', 'bot_click');
    }, { passive: true });

    /* ClientID → ссылки в бота. Асинхронно, поэтому ссылки уже стоят без метки,
     * а колбэк их дописывает: клик в первые ~200 мс потеряет метку, и это
     * дешевле, чем задерживать разметку до ответа счётчика. Значение то же, что
     * получит квиз — cookie одна на весь домен второго уровня. */
    window.ym(C.METRIKA_ID, 'getClientID', function (clientID) {
      setHref('[data-cta="bot"]', botUrl(C.TELEGRAM_BOT_URL, clientID));
    });
  }
})();
