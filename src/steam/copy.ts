// Every word a visitor reads on the Steam-style pages, in both languages.
// English is plain on purpose: short sentences, common words.

export type Locale = 'en' | 'ru';
import type { StageKey } from '../content/job-hunt';

/** Russian numeral agreement: 1 отклик / 2 отклика / 5 откликов. */
export const ruPlural = (n: number, one: string, few: string, many: string): string => {
  const a = n % 10;
  const b = n % 100;
  if (a === 1 && b !== 11) return one;
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
  return many;
};

export const LOCALE: Record<Locale, string> = { ru: 'ru-RU', en: 'en-GB' };

/** [full name, short name for narrow lanes and table heads, lane name if different]. */
type StageNames = Record<Exclude<StageKey, 'applied'>, [string, string, string?]>;
type Forms = [string, string, string?];

export interface Copy {
  title: string;
  description: string;
  nav: { profile: string; jobs: string; blog: string; aria: string; lang: string };
  city: string;
  name: string;
  place: string;
  sum: [string, string];
  side: {
    aria: string;
    level: string;
    levelCap: string;
    badge: string;
    badgeCap: string;
    online: string;
    asleep: string;
    open: string;
    until: [string, string];
    back: [string, string];
    offer: string;
  };
  tabs: { aria: string; show: string; inv: string; market: string; about: string; trade: string };
  show: {
    title: string;
    sub: string;
    items: [string, string, string][];
    note: string;
    path: string;
  };
  inv: {
    title: string;
    updated: (d: string) => string;
    search: string;
    aria: string;
    count: (n: number) => string;
    pager: [string, string];
    live: string;
    source: string;
    nothing: string;
    hint: string;
    rarity: Record<'covert' | 'classified' | 'milspec' | 'consumer', string>;
  };
  market: {
    crumbs: [string, string];
    since: string;
    where: string;
    cap: (calls: number, applied: number, appliedText: string) => string;
    chart: string;
    zoomAria: string;
    zoom: string;
    zWeek: string;
    zMonth: string;
    zAll: string;
    chartAria: string;
    applied: string;
    rejected: string;
    awaiting: string;
    ban: string;
    stages: StageNames;
    funnel: string;
    funnelSub: string;
    stage: string;
    count: string;
    noticed: string;
    noticedSub: string;
    method: string;
    sent: string;
    calls: string;
    tg: string;
    forms: string;
    noticedNote: string;
    weekly: string;
    week: string;
    all: string;
    page: {
      title: string;
      description: string;
      thesis: string;
      updated: (d: string) => string;
      platforms: string;
      platformsSub: string;
      platform: string;
      platformApplied: string;
      platformCalls: string;
      platformNames: Record<string, string>;
      platformsNote: string;
      other: string;
      visaChecked: (d: string) => string;
      method: string;
      germany: string;
    };
    note: {
      start: (d: string) => string;
      more: (x: string) => string;
      summer: (x: string) => string;
      undated: (x: string) => string;
      and: string;
      priv: string;
      n: Record<'applied' | 'rejected' | 'call1' | 'call2' | 'final' | 'offer', Forms>;
    };
  };
  about: { title: string; pace: string; paceText: string; langs: string; langsText: string };
  trade: {
    title: string;
    from: string;
    get: string;
    give: string;
    gets: string[];
    gives: string[];
    msgLabel: string;
    msg: string;
    accept: string;
    email: string;
    cv: string;
  };
  foot: { copy: string; aria: string; tg: string };
}

export const COPY: Record<Locale, Copy> = {
  ru: {
    title: 'Никита Шевелев, продуктовый разработчик',
    description:
      'Продуктовый разработчик: пять лет бэкенда финтех-приложения и три своих продукта. Ищу работу в Германии, Европе или удалённо. Цифры поиска в открытую.',
    nav: { profile: 'Профиль', jobs: 'Поиск работы', blog: 'Блог', aria: 'Разделы сайта', lang: 'Язык' },
    city: 'Краснодар',
    name: 'Никита Шевелев',
    place: 'Краснодар, Россия',
    sum: [
      'Продуктовый разработчик. Довожу продукты от идеи до первых пользователей.',
      'Пять лет делал бэкенд финтех-приложения, через которое шли настоящие деньги. Сам выпустил три продукта, которыми пользуются люди. Ищу работу в Германии, Европе или удалённо.',
    ],
    side: {
      aria: 'Статус',
      level: 'Уровень',
      levelCap: 'лет в продакшене',
      badge: 'Свои продукты',
      badgeCap: 'iOS, Android и веб',
      online: 'В сети',
      asleep: 'Спит',
      open: 'Открыт к предложениям',
      until: ['Отвечаю до {t}', 'по вашему времени'],
      back: ['Отвечу после {t}', 'по вашему времени'],
      offer: 'Предложить обмен',
    },
    tabs: { aria: 'Разделы профиля', show: 'Витрина', inv: 'Инвентарь', market: 'Торговая площадка', about: 'Обо мне', trade: 'Обмен' },
    show: {
      title: 'Витрина достижений',
      sub: '2020–2026, финтех-приложение на базе Telegram',
      items: [
        ['700', 'Высокая нагрузка', 'API-шлюз на 700 запросов в секунду для всех приложений'],
        ['8+', 'Платежи', 'Подписки через 8+ провайдеров: App Store, Google Play, Stripe'],
        ['9+', 'Мультичейн', 'Кошелёк на 9+ блокчейн-сетях, ресивер на outbox'],
        ['AI', 'Стриминг ответов', 'AI-ассистент, которым пользовались тысячи людей'],
      ],
      note: 'Пришёл стажёром, через три года стал senior. Почти всё время нас на бэкенде было двое, поэтому я привык отвечать за систему целиком: от схемы базы до ночного разбора, когда что-то тормозит на проде.',
      path: 'Путь от стажёра до senior',
    },
    inv: {
      title: 'Инвентарь',
      updated: (d) => `цифры обновлены ${d}`,
      search: 'Поиск по стеку',
      aria: 'Продукты',
      count: (n) => `${n} ${ruPlural(n, 'предмет', 'предмета', 'предметов')}`,
      pager: ['Страница', 'из'],
      live: 'Открытая статистика',
      source: 'источник',
      nothing: 'По запросу «{q}» ничего нет.',
      hint: 'Попробуйте NestJS, Swift или React.',
      rarity: { covert: 'Тайное', classified: 'Засекреченное', milspec: 'Армейское качество', consumer: 'Ширпотреб' },
    },
    market: {
      crumbs: ['Торговая площадка', 'Поиск работы'],
      since: 'Поиск работы 2026, с 1 сентября',
      where: 'Германия, Европа, удалённо',
      cap: (c, a, at) =>
        `${ruPlural(c, 'первый созвон', 'первых созвона', 'первых созвонов')} из ${at} ${ruPlural(a, 'отклика', 'откликов', 'откликов')}`,
      chart: 'История откликов',
      zoomAria: 'Масштаб графика',
      zoom: 'Масштаб:',
      zWeek: 'Неделя',
      zMonth: 'Месяц',
      zAll: 'Всё время',
      chartAria: 'Отклики, отказы и этапы собеседований по дням с 1 сентября 2026. Те же числа есть в таблице по неделям ниже.',
      applied: 'Отклики',
      rejected: 'Отказы',
      awaiting: 'Ждут ответа',
      ban: 'LinkedIn ограничен',
      stages: {
        call1: ['Первый созвон', '1-й созвон'],
        call2: ['Второй этап', '2-й этап'],
        final: ['Финал', 'Финал'],
        offer: ['Оффер, проектная работа', 'Оффер', 'Оффер'],
      },
      funnel: 'Воронка',
      funnelSub: 'сколько дошло до каждого этапа, за всё время',
      stage: 'Этап',
      count: 'Сколько',
      noticed: 'Где замечают',
      noticedSub: 'первые созвоны по способу связи',
      method: 'Способ',
      sent: 'Отправлено',
      calls: 'Созвоны',
      tg: 'Telegram, напрямую человеку',
      forms: 'Формы на сайтах через агента',
      noticedNote: 'Одна компания из форм прислала анкету, созвона пока не было.',
      weekly: 'Таблица по неделям',
      week: 'Неделя',
      all: 'Вся статистика поиска',
      page: {
        title: 'Поиск работы в открытую. Никита Шевелев',
        thesis: 'Ищу работу бэкенд-разработчиком в Германии, Европе или удалённо и публикую все цифры как есть. Числа собирает скрипт из моего трекера, руками не правлю.',
        description: 'Живая воронка моего поиска работы бэкенд-разработчиком: отклики, созвоны, этапы и отказы по дням. Цифры собирает скрипт, руками не правлю.',
        updated: (d) => `обновлено ${d}`,
        platforms: 'Откуда уходили отклики',
        platformsSub: 'за всё время',
        platform: 'Площадка',
        platformApplied: 'Откликов',
        platformCalls: 'Первых созвонов',
        platformNames: {
          hh: 'hh.ru', ashby: 'Ashby', linkedin: 'LinkedIn', direct: 'Сайты компаний', xing: 'XING',
          application: 'Формы откликов', 'не записано': 'Не записано', email: 'Почта', greenhouse: 'Greenhouse',
          telegram: 'Telegram', personio: 'Personio', recruiter: 'Входящий рекрутер', referral: 'Реферал',
          tg: 'Telegram', vacancy: 'Telegram', hirify: 'Hirify',
        },
        platformsNote: 'Ответ идёт от одной до трёх недель, поэтому ноль у свежей площадки это задержка, а не приговор.',
        other: 'Остальные площадки',
        visaChecked: (d) => `сверено с первоисточниками ${d}`,
        method: 'Как собраны эти цифры',
        germany: 'Работа в Германии с паспортом РФ: что я проверил',
      },
      note: {
        start: (d) => `График с ${d}.`,
        more: (x) => `В итогах ещё ${x}.`,
        summer: (x) => `лето (${x})`,
        undated: (x) => `записи без даты (${x})`,
        and: ' и ',
        priv: 'Компании и имена не публикуются.',
        n: {
          applied: ['отклик', 'отклика', 'откликов'],
          rejected: ['отказ', 'отказа', 'отказов'],
          call1: ['первый созвон', 'первых созвона', 'первых созвонов'],
          call2: ['второй этап', 'вторых этапа', 'вторых этапов'],
          final: ['финал', 'финала', 'финалов'],
          offer: ['оффер', 'оффера', 'офферов'],
        },
      },
    },
    about: {
      title: 'Обо мне',
      pace: 'Темп',
      paceText: 'Работаю спокойно и берегу здоровье: велосипед, прогулки, нормальный сон. Считаю, что так продукт получается лучше, чем в авралах.',
      langs: 'Языки',
      langsText: 'Русский родной. Английский B1, подтягиваю до B2. Немецкий A2.',
    },
    trade: {
      title: 'Обмен',
      from: 'предлагает вам обмен',
      get: 'Вы получаете',
      give: 'Вы отдаёте',
      gets: ['5 лет продакшн-бэкенда на NestJS', 'Опыт с платежами и деньгами', 'Продукты на iOS, Android и в вебе'],
      gives: [
        'Интересные задачи',
        'Нормальное собеседование, а не экзамен в универе',
        'Без паники от слова «релокация». Визу оформлю сам',
        'Темп, после которого остаются силы на велосипед',
      ],
      msgLabel: 'Сообщение к обмену',
      msg: 'Если у вас продукт, который нужно довести до людей, давайте поговорим. Отвечаю в Telegram в тот же день.',
      accept: 'Принять обмен в Telegram',
      email: 'Написать на почту',
      cv: 'Резюме PDF',
    },
    foot: { copy: '© 2026 Никита Шевелев', aria: 'Ссылки', tg: 'Telegram-канал' },
  },
  en: {
    title: 'Nikita Shevelev, product engineer',
    description:
      'Product engineer: five years on the backend of a fintech app and three products of my own. Looking for a job in Germany, the EU or remote. My job search numbers are public.',
    nav: { profile: 'Profile', jobs: 'Job search', blog: 'Blog', aria: 'Site sections', lang: 'Language' },
    city: 'Krasnodar',
    name: 'Nikita Shevelev',
    place: 'Krasnodar, Russia',
    sum: [
      'Product engineer. I take products from an idea to the first real users.',
      'For five years I built the backend of a fintech app that moved real money. I also built three products of my own, and people use them. I am looking for a job in Germany, in the EU or remote.',
    ],
    side: {
      aria: 'Status',
      level: 'Level',
      levelCap: 'years in production',
      badge: 'My own products',
      badgeCap: 'iOS, Android and web',
      online: 'Online',
      asleep: 'Snooze',
      open: 'Open to offers',
      until: ['Replying until {t},', 'your time'],
      back: ['Back at {t},', 'your time'],
      offer: 'Make a trade offer',
    },
    tabs: { aria: 'Profile sections', show: 'Showcase', inv: 'Inventory', market: 'Community Market', about: 'About', trade: 'Trade' },
    show: {
      title: 'Achievement Showcase',
      sub: '2020–2026, a fintech app inside Telegram',
      items: [
        ['700', 'High load', 'An API gateway for all our apps, 700 requests per second'],
        ['8+', 'Payments', 'Subscriptions through 8+ providers: App Store, Google Play, Stripe'],
        ['9+', 'Multichain', 'A wallet on 9+ blockchains, with a receiver built on the outbox pattern'],
        ['AI', 'Streaming replies', 'An AI assistant used by thousands of people'],
      ],
      note: 'I joined as an intern and became a senior engineer three years later. Most of the time there were only two of us on the backend, so I got used to owning the whole system: from the database schema to night-time debugging when production got slow.',
      path: 'From intern to senior',
    },
    inv: {
      title: 'Inventory',
      updated: (d) => `numbers updated ${d}`,
      search: 'Search by stack',
      aria: 'Products',
      count: (n) => `${n} item${n === 1 ? '' : 's'}`,
      pager: ['Page', 'of'],
      live: 'Public stats',
      source: 'source',
      nothing: 'Nothing found for “{q}”.',
      hint: 'Try NestJS, Swift or React.',
      rarity: { covert: 'Covert', classified: 'Classified', milspec: 'Mil-Spec Grade', consumer: 'Consumer Grade' },
    },
    market: {
      crumbs: ['Community Market', 'Job search'],
      since: 'Job search 2026, since 1 September',
      where: 'Germany, EU, remote',
      cap: (c, a, at) => `first call${c === 1 ? '' : 's'} from ${at} application${a === 1 ? '' : 's'}`,
      chart: 'Application history',
      zoomAria: 'Chart range',
      zoom: 'Zoom graph:',
      zWeek: 'Week',
      zMonth: 'Month',
      zAll: 'Lifetime',
      chartAria: 'Applications, rejections and interview stages per day since 1 September 2026. The same numbers are in the weekly table below.',
      applied: 'Applications',
      rejected: 'Rejections',
      awaiting: 'Waiting for a reply',
      ban: 'LinkedIn restricted',
      stages: {
        call1: ['First call', '1st call'],
        call2: ['Second stage', '2nd stage'],
        final: ['Final', 'Final'],
        offer: ['Offer, project work', 'Offer', 'Offer'],
      },
      funnel: 'Funnel',
      funnelSub: 'how many reached each stage, all time',
      stage: 'Stage',
      count: 'Count',
      noticed: 'Where I get noticed',
      noticedSub: 'first calls by channel',
      method: 'Channel',
      sent: 'Sent',
      calls: 'Calls',
      tg: 'Telegram, directly to a person',
      forms: 'Website forms via an AI agent',
      noticedNote: 'One company from the forms sent me a questionnaire. No call yet.',
      weekly: 'Weekly table',
      week: 'Week',
      all: 'All job search stats',
      page: {
        title: 'Job search, in the open. Nikita Shevelev',
        thesis: 'I am looking for a backend job in Germany, in the EU or remote, and I publish every number as it is. A script builds them from my tracker; I never edit them by hand.',
        description: 'A live funnel of my backend job search: applications, calls, interview stages and rejections by day. A script builds the numbers; I never edit them by hand.',
        updated: (d) => `updated ${d}`,
        platforms: 'Where the applications went',
        platformsSub: 'all time',
        platform: 'Source',
        platformApplied: 'Applied',
        platformCalls: 'First calls',
        platformNames: {
          hh: 'hh.ru', ashby: 'Ashby', linkedin: 'LinkedIn', direct: 'Company websites', xing: 'XING',
          application: 'Application forms', 'не записано': 'Not recorded', email: 'Email', greenhouse: 'Greenhouse',
          telegram: 'Telegram', personio: 'Personio', recruiter: 'Inbound recruiter', referral: 'Referral',
          tg: 'Telegram', vacancy: 'Telegram', hirify: 'Hirify',
        },
        platformsNote: 'A reply takes one to three weeks, so a zero on a new source is a lag, not a verdict.',
        other: 'Other sources',
        visaChecked: (d) => `checked against primary sources on ${d}`,
        method: 'How these numbers are made',
        germany: '',
      },
      note: {
        start: (d) => `The chart starts on ${d}.`,
        more: (x) => `The totals also include ${x}.`,
        summer: (x) => `the summer (${x})`,
        undated: (x) => `records without a date (${x})`,
        and: ' and ',
        priv: 'Company and people names are not published.',
        n: {
          applied: ['application', 'applications'],
          rejected: ['rejection', 'rejections'],
          call1: ['first call', 'first calls'],
          call2: ['second stage', 'second stages'],
          final: ['final', 'finals'],
          offer: ['offer', 'offers'],
        },
      },
    },
    about: {
      title: 'About',
      pace: 'Pace',
      paceText: 'I work at a calm pace and look after my health: cycling, walks, enough sleep. I think products come out better this way than in crunch mode.',
      langs: 'Languages',
      langsText: 'Russian is my native language. English B1, working toward B2. German A2.',
    },
    trade: {
      title: 'Trade',
      from: 'offers you a trade',
      get: 'You get',
      give: 'You give',
      gets: ['5 years of production backend on NestJS', 'Experience with payments and real money', 'Products on iOS, Android and the web'],
      gives: [
        'Interesting work',
        'A normal interview, not a university exam',
        'No panic about the word “relocation”. I will handle my visa myself',
        'A pace that leaves me energy to ride my bike',
      ],
      msgLabel: 'Message',
      msg: 'If you have a product that needs to reach people, let’s talk. I reply on Telegram the same day.',
      accept: 'Accept the trade on Telegram',
      email: 'Send an email',
      cv: 'CV (PDF)',
    },
    foot: { copy: '© 2026 Nikita Shevelev', aria: 'Links', tg: 'Telegram channel' },
  },
};

/** "600 откликов" / "600 applications", with a locale-formatted number. */
export const counted = (lang: Locale, n: number, forms: Forms): string => {
  const num = new Intl.NumberFormat(LOCALE[lang]).format(n);
  if (lang === 'ru') return `${num} ${ruPlural(n, forms[0], forms[1], forms[2] ?? forms[1])}`;
  return `${num} ${n === 1 ? forms[0] : forms[1]}`;
};

/** Where each language's pages live; the language switch and hreflang read this. */
export const ROUTES = {
  home: { en: '/', ru: '/ru/' },
  jobs: { en: '/en/job-hunt', ru: '/ru/job-hunt' },
} as const;
