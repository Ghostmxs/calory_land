/**
 * Калория — single source of truth for all editable values.
 * Change links, contacts, legal details and pricing here only.
 * main.js binds these into the DOM at runtime ([data-bind], [data-href], pricing grid).
 */
window.CALORIYA = {
  // === Telegram links ===
  TELEGRAM_BOT_URL: 'https://t.me/Calorysbot',          // bot / mini-app entry point
  TELEGRAM_SUPPORT_URL: 'https://t.me/CalorysSupportBot', // support bot

  // === Contacts & documents ===
  SUPPORT_EMAIL: 'support@calorybot.ru',
  LINK_PRIVACY: '/privacy/',                           // served from /privacy/index.html
  LINK_TERMS: '/terms/',                               // served from /terms/index.html
  LINK_CANCEL: '/cancel/',                             // served from /cancel/index.html

  // === Legal entity (also reused in legal documents) ===
  LEGAL_ENTITY: 'ИП Ханин Кирилл Русланович',
  INN: '611904153140',
  OGRNIP: '325619600062361',

  // === Billing ===
  CURRENCY: '₽',
  CANCEL_CMD: '/unsub',
  // Recurring-billing disclosure shown near the pricing block. Edit freely.
  BILLING_NOTE:
    'Подписка продлевается автоматически: после окончания оплаченного периода доступ ' +
    'продлевается на следующий период по выбранному тарифу, а оплата списывается в начале ' +
    'каждого нового периода. Отменить автопродление можно в любой момент — отправьте команду ' +
    '/unsub боту в Telegram. Все цены указаны в рублях, скрытых платежей нет.',

  // === Pricing tiers (array order = order on the page) ===
  // The UI is data-driven: add/remove/reorder items freely, layout adapts.
  // `days` powers the "≈ N ₽/день" line (shown for non-trial tiers).
  // `legalDuration`/`legalPrice` carry the spelled-out wording reused verbatim
  // in the offer (terms); kept as strings since Russian number-to-words is locale-heavy.
  PRICING: [
    { id: 'trial', title: 'Пробный период', duration: '3 дня',    days: 3,   price: 12,   caption: 'затем автопродление', badge: 'Старт', featured: true,
      legalDuration: '3 (три) дня',                       legalPrice: '12 (двенадцать) рублей' },
    { id: 'week',  title: 'Неделя',         duration: '7 дней',   days: 7,   price: 299,
      legalDuration: '7 (семь) дней',                     legalPrice: '299 (двести девяносто девять) рублей' },
    { id: 'month', title: 'Месяц',          duration: '30 дней',  days: 30,  price: 990,  badge: 'Популярный',
      legalDuration: '30 (тридцать) дней',                legalPrice: '990 (девятьсот девяносто) рублей' },
    { id: 'year',  title: 'Год',            duration: '365 дней', days: 365, price: 2990, badge: 'Выгодно',
      legalDuration: '365 (триста шестьдесят пять) дней', legalPrice: '2 990 (две тысячи девятьсот девяносто) рублей' },
  ],
};
