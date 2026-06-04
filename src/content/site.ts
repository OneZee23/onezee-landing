// Bilingual homepage content. Shared structure (links, icons, years, tech) is
// defined once; only the human copy differs per locale.
//
// 🇷🇺 The Russian below is a solid FIRST PASS — Nikita, polish the voice here.
// This is the only file you need to touch for homepage wording.
import type { ShipItem, SiteLink, SkillGroup } from '../data';
import { profile, resumeUrl, socials, writing as writingLinks } from '../data';

export type Locale = 'en' | 'ru';

export interface SiteContent {
  profile: typeof profile;
  socials: SiteLink[];
  resumeUrl: string;
  hero: { status: string; lead: string; sub: string; resume: string; blog: string };
  now: { title: string; items: string[] };
  shipped: { title: string; items: ShipItem[] };
  dayJob: { title: string; period: string; org: string; url: string; icon: string; lead: string; points: string[] };
  skills: { title: string; groups: SkillGroup[] };
  writing: { title: string; prose: string; cta: string; links: SiteLink[] };
  contact: { title: string; heading: string; sub: string; languages: string; ossMeta: string; oldYoutube: string };
}

// ---- shared, locale-independent structure ----
const SHIP_LINKS: Record<string, SiteLink[]> = {
  teachtrack: [
    { kind: 'site', label: 'teachtrack.ru', url: 'https://teachtrack.ru' },
    { kind: 'stats', label: 'live stats', url: 'https://stats.teachtrack.ru' },
    { kind: 'telegram', label: 'bot', url: 'https://t.me/teachtrackbot' },
  ],
  triptrack: [
    { kind: 'appstore', label: 'App Store', url: 'https://apps.apple.com/us/app/triptrack-road-journal/id6760650361' },
    { kind: 'site', label: 'trip-track.app', url: 'https://trip-track.app' },
    { kind: 'github', label: 'iOS source', url: 'https://github.com/OneZee23/trip-track-ios' },
    { kind: 'telegram', label: 'channel', url: 'https://t.me/triptrack_app' },
  ],
  lifetrack: [
    { kind: 'appstore', label: 'App Store', url: 'https://apps.apple.com/us/app/lifetrack-%D1%82%D1%80%D0%B5%D0%BA%D0%B5%D1%80-%D0%BF%D1%80%D0%B8%D0%B2%D1%8B%D1%87%D0%B5%D0%BA/id6759284836' },
    { kind: 'googleplay', label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=co.onezee.lifetrack' },
    { kind: 'github', label: 'iOS source', url: 'https://github.com/OneZee23/life-track-ios' },
    { kind: 'github', label: 'Android source', url: 'https://github.com/OneZee23/life-track-android' },
  ],
  onezee: [{ kind: 'github', label: 'source', url: 'https://github.com/OneZee23/onezee-landing' }],
};

// year/name/icon/links are shared; only blurb is translated (by index).
const SHIP_META = [
  { year: 'Apr–May 2026', name: 'TeachTrack', icon: '/icons/teachtrack.png', links: SHIP_LINKS.teachtrack },
  { year: 'Mar–Apr 2026', name: 'TripTrack', icon: '/icons/triptrack.png', links: SHIP_LINKS.triptrack },
  { year: 'Feb 2026', name: 'LifeTrack', icon: '/icons/lifetrack.png', links: SHIP_LINKS.lifetrack },
  { year: 'Jan 2026', name: 'Fraggram', icon: '/icons/fraggram.png', archived: true, links: [] as SiteLink[] },
  { year: '2025', name: 'onezee.dev', icon: '/icons/onezee.png', links: SHIP_LINKS.onezee },
];
const buildShipped = (blurbs: string[]): ShipItem[] =>
  SHIP_META.map((m, i) => ({ ...m, blurb: blurbs[i] }));

const SKILL_ITEMS = [
  ['NestJS', 'Node.js', 'TypeScript', 'PostgreSQL', 'TypeORM', 'Fastify'],
  ['RabbitMQ', 'Transactional Outbox', 'Redis (sharded)', 'Circuit Breaker', 'Rate limiting'],
  ['Kubernetes', 'Helm', 'werf', 'Docker', 'GitLab CI', 'GitHub Actions', 'Grafana', 'Prometheus', 'Loki'],
  ['EVM', 'Bitcoin', 'Solana', 'TON', 'Tron', 'ethers / web3', 'Solidity'],
  ['React', 'React Native', 'Swift / SwiftUI'],
];
const buildSkills = (titles: string[]): SkillGroup[] =>
  SKILL_ITEMS.map((items, i) => ({ title: titles[i], items }));

const DAYJOB = { period: '2021 — 2026', url: 'https://imem.app', icon: '/icons/ime.png' };

// ---- locale content ----
export const SITE: Record<Locale, SiteContent> = {
  en: {
    profile,
    socials,
    resumeUrl,
    hero: {
      status: 'Open to senior backend roles · EU · remote · CIS',
      lead: "Hi, I'm Nikita. I build backends that handle real money — and ship small apps in public.",
      sub: "Senior backend engineer, 5+ years. My current role is winding down — I'm after the next senior backend role: EU, remote, or a CIS product team. Open to talk.",
      resume: 'Résumé (PDF)',
      blog: 'Blog',
    },
    now: {
      title: 'Now',
      items: [
        'Looking for my next senior backend role — EU (Blue Card eligible), remote, or a CIS product team.',
        'Running build-in-public sprints to grow my own apps.',
        'Pushing my English toward B2 — and starting to learn German for the EU move.',
      ],
    },
    shipped: {
      title: 'Shipped',
      items: buildShipped([
        'A SaaS for private tutors — scheduling, lesson-package invoicing, and a Telegram reminder bot. Live, with a public metrics dashboard. ~25 people use it.',
        '“Strava for cars.” I’d never written Swift — I built the iOS app (iPhone, iPad, watchOS) and a NestJS backend in evenings. Live on the App Store, ~50 people use it.',
        'A minimalist habit tracker. Native SwiftUI on iOS, React Native on Android — on both stores. ~5 daily users, no revenue yet, and that’s fine.',
        'A marketplace built entirely on Telegram Stars payments — backend, bot, infra, all done. Then three payment processors refused the model, so I killed it before launch. Learned more from that than from any tutorial.',
        'This site. Open-source Astro + React, containerized and shipped to Kubernetes via Helm, werf and GitHub Actions — with a blog fed straight from Telegram.',
      ]),
    },
    dayJob: {
      title: 'The day job',
      ...DAYJOB,
      org: 'iMe — a crypto/fintech Telegram super-app',
      lead: 'My day job for five years. I joined as an intern and grew into a senior engineer who owns core systems. A few of the things I built:',
      points: [
        'A high-load API gateway — one entry point for iOS, Android and Desktop, with autoscaling, multi-tier rate limiting and a sharded Redis layer.',
        'A subscription & payments platform across 8+ providers — App Store, Google Play, Stripe, Telegram Stars, YooKassa, Binance Pay.',
        'A self-custodial wallet across 9+ blockchains (Bitcoin, EVM, Solana, TON, Tron) with DEX/swap aggregation and on-chain scanning.',
        'An AI Telegram assistant on OpenAI with token-streaming replies.',
        'The unglamorous glue that keeps it correct under load: transactional outbox, circuit breakers, durable messaging — all Kubernetes-native.',
      ],
    },
    skills: {
      title: 'I work with',
      groups: buildSkills(['Backend', 'Distributed', 'Infra & Ops', 'Blockchain', 'Also']),
    },
    writing: {
      title: 'I write',
      prose: 'Notes on backend, web3 and the messy reality of shipping indie apps — published from my Telegram channel.',
      cta: 'Read the blog',
      links: writingLinks,
    },
    contact: {
      title: 'Say hi',
      heading: "Let's build something that has to stay up.",
      sub: 'Open to senior backend roles — EU, remote, or a CIS product team (Blue Card eligible for the EU). Or just send a message.',
      languages: 'Russian (native) · English (B1, improving to B2)',
      ossMeta: 'Open source · built with Astro, deployed on Kubernetes',
      oldYoutube: 'old YouTube',
    },
  },

  ru: {
    profile,
    socials,
    resumeUrl,
    hero: {
      status: 'Открыт к senior backend-ролям · EU · remote · СНГ',
      lead: 'Привет, я Никита. Делаю бэкенды, через которые идут реальные деньги — и публично выпускаю свои приложения.',
      sub: 'Senior backend-инженер, 5+ лет. Текущая роль сворачивается — ищу следующую senior backend-позицию: EU, remote или продуктовая команда в СНГ. Открыт к разговору.',
      resume: 'Резюме (PDF)',
      blog: 'Блог',
    },
    now: {
      title: 'Сейчас',
      items: [
        'Ищу следующую senior backend-роль — EU (подхожу под Blue Card), remote или продуктовая команда в СНГ.',
        'Веду build-in-public спринты, развиваю свои приложения.',
        'Подтягиваю английский к B2 — и начинаю учить немецкий ради переезда в EU.',
      ],
    },
    shipped: {
      title: 'Выпустил',
      items: buildShipped([
        'SaaS для частных репетиторов — расписание, учёт оплат по пакетам уроков и Telegram-бот с напоминаниями. Живёт в проде, с публичным дашбордом метрик. Пользуются ~25 человек.',
        '«Strava для машин». Никогда не писал на Swift — собрал iOS-приложение (iPhone, iPad, watchOS) и NestJS-бэкенд по вечерам. Живёт в App Store, пользуются ~50 человек.',
        'Минималистичный трекер привычек. Нативный SwiftUI на iOS, React Native на Android — в обоих сторах. ~5 ежедневных пользователей, выручки пока нет — и это окей.',
        'Маркетплейс целиком на платежах Telegram Stars — бэкенд, бот, инфра, всё готово. Потом три платёжных провайдера отказали модели, и я закрыл его до запуска. Научился на этом больше, чем на любом туториале.',
        'Этот сайт. Open-source Astro + React, в контейнере, выкатывается в Kubernetes через Helm, werf и GitHub Actions — с блогом, который тянет посты прямо из Telegram.',
      ]),
    },
    dayJob: {
      title: 'Основная работа',
      ...DAYJOB,
      org: 'iMe — крипто/финтех Telegram super-app',
      lead: 'Моя основная работа пять лет. Пришёл стажёром и вырос до senior-инженера, который владеет ключевыми системами. Кое-что из того, что построил:',
      points: [
        'Высоконагруженный API-gateway — единая точка входа для iOS, Android и Desktop, с автоскейлингом, многоуровневым rate limiting и шардированным Redis.',
        'Платформа подписок и платежей с 8+ провайдерами — App Store, Google Play, Stripe, Telegram Stars, ЮKassa, Binance Pay.',
        'Некастодиальный кошелёк на 9+ блокчейнах (Bitcoin, EVM, Solana, TON, Tron) с агрегацией DEX/свопов и on-chain-сканированием.',
        'AI-ассистент в Telegram на OpenAI с потоковой выдачей токенов.',
        'Невидимый клей, который держит всё корректным под нагрузкой: transactional outbox, circuit breakers, durable-сообщения — всё Kubernetes-native.',
      ],
    },
    skills: {
      title: 'Работаю с',
      groups: buildSkills(['Бэкенд', 'Распределённые', 'Инфра и Ops', 'Блокчейн', 'Ещё']),
    },
    writing: {
      title: 'Пишу',
      prose: 'Заметки о бэкенде, web3 и суровой реальности инди-разработки — публикуются из моего Telegram-канала.',
      cta: 'Читать блог',
      links: writingLinks,
    },
    contact: {
      title: 'Напиши',
      heading: 'Давай построим то, что обязано работать без падений.',
      sub: 'Открыт к senior backend-ролям — EU, remote или продуктовая команда в СНГ (подхожу под Blue Card для EU). Или просто напиши.',
      languages: 'Русский (родной) · Английский (B1, подтягиваю до B2)',
      ossMeta: 'Open source · собрано на Astro, развёрнуто в Kubernetes',
      oldYoutube: 'старый YouTube',
    },
  },
};
