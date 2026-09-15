/**
 * Калория — single source of truth for all editable values.
 * Change links, contacts, legal details and pricing here only.
 * main.js binds these into the DOM at runtime ([data-cta], [data-link], pricing grid).
 */
window.CALORIYA = {
  // === Точки входа в продукт ==================================================
  // «Калория» — платформа с несколькими входами в один и тот же аккаунт, а не
  // один бот. Порядок здесь = приоритет воронки: главный CTA лендинга ведёт на
  // веб-квиз, потому что платный трафик (Яндекс.Директ) обязан оставаться на
  // нашем домене — иначе конверсия и цели Метрики считаются в Telegram, где их
  // не видно.
  LINK_START: 'https://my.calorybot.ru/',        // квиз-регистрация (главный CTA)
  LINK_LOGIN: 'https://my.calorybot.ru/auth',    // вход для тех, кто уже зарегистрирован
  LINK_APP: 'https://my.calorybot.ru/app',       // дневник в браузере
  LINK_ACCOUNT: 'https://my.calorybot.ru/account', // личный кабинет: отмена подписки в один тап
  TELEGRAM_BOT_URL: 'https://t.me/CaloryzBot',   // бот / Mini App
  TELEGRAM_SUPPORT_URL: 'https://t.me/CalorysSupportBot',

  // Каналы, которых ещё нет. Пустая ссылка = плитка рендерится неактивной с
  // бейджем «скоро»; как только появится адрес, достаточно вписать его сюда.
  LINK_MAX: '',       // бот в мессенджере MAX
  LINK_RUSTORE: '',   // приложение в RuStore

  // === Contacts & documents ===
  SUPPORT_EMAIL: 'support@calorybot.ru',
  LINK_PRIVACY: '/privacy/',                     // served from /privacy/index.html
  LINK_TERMS: '/terms/',                         // served from /terms/index.html
  LINK_CANCEL: '/cancel/',                       // served from /cancel/index.html

  // === Аналитика ==============================================================
  // Политика конфиденциальности (§9.2) уже объявляет Яндекс Метрику, включая
  // Вебвизор. Счётчик не зашит в разметку: без номера он бы висел мёртвым
  // <script>, а с чужим номером — сливал бы данные не туда. Впишите номер —
  // main.js подключит счётчик сам; оставьте null — счётчика на странице нет.
  METRIKA_ID: null,

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
    'каждого нового периода. Отменить автопродление можно в любой момент — в личном кабинете ' +
    'на сайте или командой /unsub боту в Telegram. Все цены указаны в рублях, скрытых платежей нет.',

  // === Pricing tiers (array order = order on the page) ===
  // The UI is data-driven: add/remove/reorder items freely, layout adapts.
  // `days` powers the "≈ N ₽/день" line (shown for non-trial tiers).
  // `legalDuration`/`legalPrice` carry the spelled-out wording reused verbatim
  // in the offer (terms); kept as strings since Russian number-to-words is locale-heavy.
  //
  // ВАЖНО: эти значения обязаны совпадать с прод-настройками биллинга
  // (calorybot: PRICE_*/​*_PERIOD_DAYS, calorybot_billing: PLANS). Расхождение
  // здесь — это не опечатка на лендинге, а недостоверные сведения в оферте,
  // которую плательщик принимает галочкой перед оплатой, то есть готовый повод
  // для чарджбэка. 2026-09-12 так и было: «Неделя» стояла 299 против 399, а
  // «Месяц» — 30 дней против фактических 14. Тариф называется «2 недели»
  // именно поэтому: период 14 дней, и слово «месяц» в клиентском тексте было бы
  // неправдой.
  PRICING: [
    { id: 'trial', title: 'Пробный период', duration: '3 дня',    days: 3,   price: 12,   caption: 'затем автопродление', badge: 'Старт', featured: true,
      legalDuration: '3 (три) дня',                       legalPrice: '12 (двенадцать) рублей' },
    { id: 'week',  title: 'Неделя',         duration: '7 дней',   days: 7,   price: 399,
      legalDuration: '7 (семь) дней',                     legalPrice: '399 (триста девяносто девять) рублей' },
    { id: 'month', title: '2 недели',       duration: '14 дней',  days: 14,  price: 990,  badge: 'Популярный',
      legalDuration: '14 (четырнадцать) дней',            legalPrice: '990 (девятьсот девяносто) рублей' },
    { id: 'year',  title: 'Год',            duration: '365 дней', days: 365, price: 2990, badge: 'Выгодно',
      legalDuration: '365 (триста шестьдесят пять) дней', legalPrice: '2 990 (две тысячи девятьсот девяносто) рублей' },
  ],
};
