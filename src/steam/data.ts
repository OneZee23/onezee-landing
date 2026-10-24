// Build-time view of the public data for the Steam-style pages.
// Job hunt: src/data/job-hunt.json (generated from the funnel, never by hand).
// Products: src/data/product-stats.json (scripts/fetch-product-stats.mjs).
import type { Locale } from './copy';
import { jobHunt, type StageKey } from '../content/job-hunt';
import products from '../data/product-stats.json';
import { COPY, LOCALE, counted } from './copy';

/** The chart starts here: day-by-day applications are logged from September. */
export const CHART_FROM = '2026-09-01';

/**
 * LinkedIn restriction periods, shaded on the chart. A day is shaded if the account was
 * restricted for any part of it: restricted on 3 Sep in the evening, lifted on 5 Oct at
 * 05:51 MSK (support email), restricted again on 15 Oct at about 16:00 MSK. The open one
 * runs to the last day.
 */
export const BANS: [string, string | null][] = [
  ['2026-09-03', '2026-10-05'],
  ['2026-10-15', null],
];

export const STAGES = ['call1', 'call2', 'final', 'offer'] as const;
export type Stage = (typeof STAGES)[number];

/** Ordinal blue ramp, later stage = lighter; validated against the plot surface. */
export const STAGE_COLOR: Record<Stage, string> = {
  call1: '#3f7fb3',
  call2: '#5ea8dc',
  final: '#97cff2',
  offer: '#d9f0fd',
};

export interface ChartData {
  /** [date, applied, rejected, call1, call2, final, offer] for every calendar day. */
  days: [string, number, number, number, number, number, number][];
  bans: [string, string | null][];
}

/** Every calendar day from CHART_FROM to the last update, zeros where nothing happened. */
export function chartData(): ChartData {
  const byDate = new Map(jobHunt.log.map((d) => [d.date, d]));
  const days: ChartData['days'] = [];
  const end = jobHunt.meta.updated;
  for (let d = new Date(`${CHART_FROM}T12:00Z`); ; d.setUTCDate(d.getUTCDate() + 1)) {
    const k = d.toISOString().slice(0, 10);
    if (k > end) break;
    const r = byDate.get(k);
    days.push([k, r?.applied ?? 0, r?.rejected ?? 0, r?.call1 ?? 0, r?.call2 ?? 0, r?.final ?? 0, r?.offer ?? 0]);
  }
  return { days, bans: BANS };
}

const ladderOf = (k: StageKey) => jobHunt.ladder.find((s) => s.key === k)?.n ?? 0;

export const totals = {
  applied: jobHunt.headline.applied,
  calls: jobHunt.headline.calls,
  rejected: jobHunt.outcomes.rejected,
  awaiting: jobHunt.outcomes.awaiting,
};

/**
 * The note under the chart: the totals are wider than the chart (summer has no
 * daily log, a few rows have no date), and the page says so instead of letting
 * the two disagree.
 */
export function chartNote(lang: Locale): string {
  const n = COPY[lang].market.note;
  const { days } = chartData();
  const onChart = (i: 1 | 2) => days.reduce((s, d) => s + d[i], 0);
  const summer = jobHunt.summer;
  const outside = {
    applied: totals.applied - summer.applied - onChart(1),
    rejected: totals.rejected - summer.rejected - onChart(2),
  };
  const list = (src: Partial<Record<keyof typeof n.n, number>>, keys: (keyof typeof n.n)[]) =>
    keys.filter((k) => (src[k] ?? 0) > 0).map((k) => counted(lang, src[k]!, n.n[k]));
  const summerList = list(
    { applied: summer.applied, rejected: summer.rejected, call1: summer.call1, call2: summer.call2, final: summer.final, offer: summer.offer },
    ['applied', 'rejected', 'call1', 'call2', 'final', 'offer'],
  );
  const undatedList = list(outside, ['applied', 'rejected']);
  const wider = [summerList.length ? n.summer(summerList.join(', ')) : '', undatedList.length ? n.undated(undatedList.join(', ')) : ''].filter(Boolean);
  const start = new Intl.DateTimeFormat(LOCALE[lang], { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${CHART_FROM}T12:00Z`));
  return [n.start(start), wider.length ? n.more(wider.join(n.and)) : '', n.priv].filter(Boolean).join(' ');
}

const MON: Record<Locale, string[]> = {
  ru: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};
export const months = (lang: Locale): string[] => MON[lang];
export const shortDate = (lang: Locale, k: string): string => `${+k.slice(8)} ${MON[lang][+k.slice(5, 7) - 1]}`;
/** "1–6 сен", "28 сен – 4 окт": one month is written once. */
export const dayRange = (lang: Locale, a: string, b: string): string =>
  a === b ? shortDate(lang, a) : a.slice(5, 7) === b.slice(5, 7) ? `${+a.slice(8)}–${shortDate(lang, b)}` : `${shortDate(lang, a)} – ${shortDate(lang, b)}`;

export interface Week {
  from: string;
  to: string;
  /** applied, rejected, call1, call2, final, offer */
  v: number[];
}

/** Calendar weeks from Monday; the first and last weeks are cut to the data. */
export function weeks(): Week[] {
  const out: (Week & { key: string })[] = [];
  for (const d of chartData().days) {
    const day = new Date(`${d[0]}T12:00Z`);
    day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
    const key = day.toISOString().slice(0, 10);
    let w = out[out.length - 1];
    if (!w || w.key !== key) {
      w = { key, from: d[0], to: d[0], v: [0, 0, 0, 0, 0, 0] };
      out.push(w);
    }
    w.to = d[0];
    for (let i = 0; i < 6; i++) w.v[i] += d[i + 1] as number;
  }
  return out;
}

export const ladder = (): { key: StageKey; n: number }[] =>
  (['applied', 'call1', 'call2', 'final', 'offer'] as StageKey[]).map((key) => ({ key, n: ladderOf(key) }));

/* ---------- inventory ---------- */

export type Rarity = 'covert' | 'classified' | 'milspec' | 'consumer';

/** Stripe colours are Steam's; text colours are the same hues lifted to 4.5:1 on the panel. */
export const RARITY: Record<Rarity, { stripe: string; text: string }> = {
  covert: { stripe: '#eb4b4b', text: '#f07676' },
  classified: { stripe: '#d32ce6', text: '#de5fec' },
  milspec: { stripe: '#4b69ff', text: '#768dff' },
  consumer: { stripe: '#b0c3d9', text: '#c3d1e2' },
};
export const STATTRAK = '#db8e63';

export interface Item {
  name: string;
  rarity: Rarity;
  stattrak?: boolean;
  img: string;
  kind: string;
  desc: string;
  tags: string[];
  live: [string, string][] | null;
  source?: string;
  links: [string, string][];
}

const ITEM_COPY = {
  ru: {
    none: 'нет',
    triptrack: {
      kind: 'iOS-приложение',
      desc: 'Дневник автопутешествий: сам записывает каждую поездку, маршрут, фото и места. Раньше не писал на Swift, собрал приложение и бэкенд по вечерам.',
      live: ['Путешественников', 'Активны за 7 дней', 'Поездок записано', 'Пройдено, км'],
      links: ['App Store', 'Сайт'],
    },
    teachtrack: {
      kind: 'веб-сервис',
      desc: 'Кабинет частного репетитора: расписание, пакеты уроков, учёт оплат, напоминания ученикам в Telegram.',
      live: ['Преподавателей', 'Заходили за 7 дней', 'Учеников', 'Уроков проведено'],
      links: ['Сайт'],
    },
    lifetrack: {
      kind: 'iOS и Android',
      desc: 'Трекер привычек. Нативный SwiftUI на iOS и React Native на Android, работает без интернета и без сервера.',
      live: ['Оценка в App Store', 'Оценок', 'Версия'],
      links: ['App Store', 'Google Play'],
      rating: (r: string) => `${r} из 5`,
      offline: 'офлайн',
    },
    onezee: { kind: 'сайт, open source', desc: 'Этот сайт. Блог из Telegram и открытая статистика поиска работы.', links: ['Исходники'] },
    fraggram: {
      kind: 'закрыт до запуска',
      desc: 'Маркетплейс на Telegram Stars. Бэкенд и бот были готовы, но платёжные провайдеры отказали модели, и я закрыл проект до запуска.',
    },
  },
  en: {
    none: 'none',
    triptrack: {
      kind: 'iOS app',
      desc: 'A road trip journal. It records every trip by itself: the route, photos and places. I had never written Swift before; I built the app and its backend in the evenings.',
      live: ['Travellers', 'Active in 7 days', 'Trips recorded', 'Distance, km'],
      links: ['App Store', 'Website'],
    },
    teachtrack: {
      kind: 'web service',
      desc: 'A workspace for private tutors: schedule, lesson packages, payments and reminders to students in Telegram.',
      live: ['Tutors', 'Active in 7 days', 'Students', 'Lessons done'],
      links: ['Website'],
    },
    lifetrack: {
      kind: 'iOS and Android',
      desc: 'A habit tracker. Native SwiftUI on iOS and React Native on Android. It works offline and has no server.',
      live: ['App Store rating', 'Ratings', 'Version'],
      links: ['App Store', 'Google Play'],
      rating: (r: string) => `${r} of 5`,
      offline: 'offline',
    },
    onezee: { kind: 'website, open source', desc: 'This website. A blog from Telegram and open job search stats.', links: ['Source code'] },
    fraggram: {
      kind: 'closed before launch',
      desc: 'A marketplace on Telegram Stars. The backend and the bot were ready, but payment providers rejected the model, so I closed the project before launch.',
    },
  },
} as const;

export function items(lang: Locale): Item[] {
  const c = ITEM_COPY[lang];
  const nf = new Intl.NumberFormat(LOCALE[lang]);
  const num = (n: number | null | undefined) => (n == null ? c.none : nf.format(n));
  const rows = (names: readonly string[], values: string[]) => names.map((n, i) => [n, values[i]] as [string, string]);
  const { triptrack: tt, teachtrack: te, lifetrack: lt } = products;
  return [
    {
      name: 'TripTrack', rarity: 'covert', stattrak: true, img: '/icons/triptrack.png', ...c.triptrack,
      tags: ['Swift', 'SwiftUI', 'watchOS', 'NestJS', 'PostgreSQL'],
      live: tt ? rows(c.triptrack.live, [num(tt.users), num(tt.activeUsers7d), num(tt.trips), num(tt.distanceKm)]) : null,
      source: tt?.source,
      links: rows(c.triptrack.links, ['https://apps.apple.com/us/app/triptrack-road-journal/id6760650361', 'https://trip-track.app']),
    },
    {
      name: 'TeachTrack', rarity: 'classified', img: '/icons/teachtrack.png', ...c.teachtrack,
      tags: ['React', 'TypeScript', 'NestJS', 'PostgreSQL', 'Telegram'],
      live: te ? rows(c.teachtrack.live, [num(te.teachers), num(te.teachersSeen7d), num(te.students), num(te.lessonsCompleted)]) : null,
      source: te?.source,
      links: rows(c.teachtrack.links, ['https://teachtrack.ru']),
    },
    {
      name: 'LifeTrack', rarity: 'milspec', img: '/icons/lifetrack.png', ...c.lifetrack,
      tags: ['SwiftUI', 'React Native', 'Expo', c.lifetrack.offline],
      live: lt
        ? rows(c.lifetrack.live, [
            lt.rating != null ? c.lifetrack.rating(new Intl.NumberFormat(LOCALE[lang], { minimumFractionDigits: 1 }).format(lt.rating)) : c.none,
            num(lt.ratings),
            lt.version ?? c.none,
          ])
        : null,
      source: lt?.source,
      links: rows(c.lifetrack.links, ['https://apps.apple.com/app/id6759284836', 'https://play.google.com/store/apps/details?id=co.onezee.lifetrack']),
    },
    {
      name: 'onezee.dev', rarity: 'milspec', img: '/icons/onezee.png', ...c.onezee,
      tags: ['Astro', 'React', 'Docker'], live: null,
      links: rows(c.onezee.links, ['https://github.com/OneZee23/onezee-landing']),
    },
    { name: 'Fraggram', rarity: 'consumer', img: '/icons/fraggram.png', ...c.fraggram, tags: ['NestJS', 'Telegram Stars'], live: null, links: [] },
  ];
}

export const productsUpdated = (lang: Locale): string =>
  new Intl.DateTimeFormat(LOCALE[lang], { day: 'numeric', month: 'long' }).format(new Date(products.updatedAt));
