/**
 * Калория — runtime binding of CALORIYA config into the DOM + light interactions.
 * No framework, no build step. Progressive enhancement: page is fully readable
 * without JS (config-driven bits fall back to inline defaults).
 */
(function () {
  'use strict';
  var C = window.CALORIYA || {};

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function setHref(selector, url) {
    if (!url) return;
    document.querySelectorAll(selector).forEach(function (el) { el.setAttribute('href', url); });
  }

  // --- Links ---
  setHref('[data-cta="bot"]', C.TELEGRAM_BOT_URL);
  setHref('[data-cta="support"]', C.TELEGRAM_SUPPORT_URL);
  setHref('[data-link="privacy"]', C.LINK_PRIVACY);
  setHref('[data-link="terms"]', C.LINK_TERMS);
  setHref('[data-link="cancel"]', C.LINK_CANCEL);

  // --- Support email ---
  if (C.SUPPORT_EMAIL) {
    document.querySelectorAll('[data-email]').forEach(function (el) {
      el.setAttribute('href', 'mailto:' + C.SUPPORT_EMAIL);
      (el.querySelector('span') || el).textContent = C.SUPPORT_EMAIL;
    });
  }

  // --- Cancel command tokens ---
  if (C.CANCEL_CMD) {
    document.querySelectorAll('[data-cancel-cmd]').forEach(function (el) { el.textContent = C.CANCEL_CMD; });
  }

  // --- Legal line + year ---
  var legal = document.querySelector('[data-legal]');
  if (legal && C.LEGAL_ENTITY) {
    legal.textContent = C.LEGAL_ENTITY + ' · ИНН ' + C.INN + ' · ОГРНИП ' + C.OGRNIP;
  }

  // --- Individual legal details (reused in legal documents) ---
  [['[data-legal-entity]', C.LEGAL_ENTITY], ['[data-inn]', C.INN], ['[data-ogrnip]', C.OGRNIP]].forEach(function (pair) {
    if (!pair[1]) return;
    document.querySelectorAll(pair[0]).forEach(function (el) { el.textContent = pair[1]; });
  });
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // --- Pricing (data-driven; layout adapts to any number of plans) ---
  var grid = document.getElementById('pricingGrid');
  if (grid && Array.isArray(C.PRICING)) {
    var nf = new Intl.NumberFormat('ru-RU');
    var cur = C.CURRENCY || '₽';
    var bot = C.TELEGRAM_BOT_URL || '#';
    grid.innerHTML = C.PRICING.map(function (p) {
      var featured = !!p.featured;
      return '<article class="plan' + (featured ? ' plan--featured' : '') + '">' +
        (p.badge ? '<span class="plan-badge">' + esc(p.badge) + '</span>' : '') +
        '<div class="plan-title">' + esc(p.title) + '</div>' +
        '<div class="plan-duration">' + esc(p.duration) + '</div>' +
        '<div class="plan-price"><b>' + nf.format(p.price) + '</b><span class="cur">' + esc(cur) + '</span></div>' +
        (!featured && p.days
          ? '<div class="plan-perday">≈ ' + nf.format(Math.round(p.price / p.days)) + ' ' + esc(cur) + '/день</div>'
          : '<div class="plan-caption">' + esc(p.caption || '') + '</div>') +
        '<a class="btn ' + (featured ? 'btn-tg' : 'btn-ghost') + '" href="' + esc(bot) + '">' +
          '<img class="tg-logo" src="/assets/img/telegram.svg" alt="">' + (featured ? 'Начать' : 'Выбрать') +
        '</a>' +
      '</article>';
    }).join('');
  }

  // --- Billing disclosure ---
  var note = document.getElementById('billingNote');
  if (note && C.BILLING_NOTE) {
    var html = esc(C.BILLING_NOTE);
    if (C.CANCEL_CMD) html = html.split(esc(C.CANCEL_CMD)).join('<code>' + esc(C.CANCEL_CMD) + '</code>');
    note.innerHTML = html;
  }

  // --- Header elevation on scroll ---
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // --- Mobile menu ---
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobileMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // --- Reveal on scroll ---
  var reveal = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && reveal.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    reveal.forEach(function (el) { io.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
