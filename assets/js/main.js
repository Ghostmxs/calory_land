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

  /* ── Ссылки ───────────────────────────────────────────────────────────────
   * Точки входа адресуются через [data-cta], документы — через [data-link].
   * Разделение не косметическое: data-cta — это места, по которым считается
   * воронка, и именно их перечисляет блок целей Метрики ниже.
   */
  setHref('[data-cta="start"]', C.LINK_START);
  setHref('[data-cta="login"]', C.LINK_LOGIN);
  setHref('[data-cta="app"]', C.LINK_APP);
  setHref('[data-cta="bot"]', C.TELEGRAM_BOT_URL);
  setHref('[data-cta="support"]', C.TELEGRAM_SUPPORT_URL);
  setHref('[data-link="privacy"]', C.LINK_PRIVACY);
  setHref('[data-link="terms"]', C.LINK_TERMS);
  setHref('[data-link="cancel"]', C.LINK_CANCEL);
  setHref('[data-link="account"]', C.LINK_ACCOUNT);

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
   * Счётчик подключается только при заданном METRIKA_ID. Политика
   * конфиденциальности (§9.2) уже объявляет Метрику и Вебвизор, поэтому
   * включение номера не требует правки документов — а отсутствие номера не
   * оставляет на странице мёртвый сторонний <script>.
   *
   * `defer` у main.js означает, что мы уже после парсинга разметки: счётчик
   * грузится, не задерживая первую отрисовку.
   */
  if (C.METRIKA_ID) {
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      k = e.createElement(t); a = e.getElementsByTagName(t)[0];
      k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

    window.ym(C.METRIKA_ID, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
    });

    // Цели воронки. Имя цели = значение data-cta, поэтому новая точка входа
    // в разметке сразу попадает в отчёты без правки этого кода.
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-cta]');
      if (!el) return;
      window.ym(C.METRIKA_ID, 'reachGoal', 'cta_' + el.getAttribute('data-cta'));
    }, { passive: true });
  }
})();
