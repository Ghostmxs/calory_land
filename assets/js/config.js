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
  SUPPORT_EMAIL: 'support@calorybot.org',
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
  PRICING: [
    { id: 'trial', title: 'Пробный период', duration: '72 часа', days: 3,   price: 1,    caption: 'затем автопродление', badge: 'Старт', featured: true },
    { id: 'week',  title: 'Неделя',         duration: '7 дней',   days: 7,   price: 299 },
    { id: 'month', title: 'Месяц',          duration: '30 дней',  days: 30,  price: 749,  badge: 'Популярный' },
    { id: 'year',  title: 'Год',            duration: '365 дней', days: 365, price: 2990, badge: 'Выгодно' },
  ],
};
