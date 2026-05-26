// Single source of truth for the landing content.
// Edit here — components just render this.

export type LinkKind =
  | 'appstore'
  | 'googleplay'
  | 'github'
  | 'site'
  | 'telegram'
  | 'stats'
  | 'linkedin'
  | 'email'
  | 'youtube'
  | 'habr';

export interface SiteLink {
  kind: LinkKind;
  label: string;
  url: string;
}

export const profile = {
  name: 'Nikita Shevelev',
  role: 'Senior Backend Engineer',
  location: 'Krasnodar, RU · open to EU relocation',
  // Drop your photo at public/me.jpg — a monogram shows until it exists.
  photo: '/me.jpg',
  monogram: 'NS',
};

export const heroLead =
  "Hi, I'm Nikita. I build backends that handle real money — and ship small apps in public.";

export const heroSub =
  "Senior backend engineer, 5+ years. My current role is winding down — I'm after the next senior backend role: EU, remote, or a CIS product team. Open to talk.";

export const socials: SiteLink[] = [
  { kind: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/nikita-shevelev-9a1620208/' },
  { kind: 'github', label: 'GitHub', url: 'https://github.com/OneZee23' },
  { kind: 'telegram', label: 'Telegram', url: 'https://t.me/onezee_co' },
  { kind: 'habr', label: 'Habr', url: 'https://habr.com/ru/users/OneZee/' },
  { kind: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@onezee_dev' },
  { kind: 'email', label: 'Email', url: 'mailto:onezeecsgo@gmail.com' },
];

// "What I'm doing now" — present tense, honest.
export const now: string[] = [
  'Looking for my next senior backend role — EU (Blue Card eligible), remote, or a CIS product team.',
  'Running build-in-public sprints to grow my own apps.',
  'Pushing my English from B1 toward B2.',
];

export interface ShipItem {
  year: string;
  name: string;
  icon?: string; // path under public/, e.g. '/icons/triptrack.png'; falls back to a monogram
  archived?: boolean; // greyed out as a relic (dead/never launched)
  blurb: string;
  links: SiteLink[]; // links[0] is treated as the project's "home" (the clickable icon target)
}

// The devlog feed — newest first. Honest, failures included.
// Four build-in-public sprints, Jan–May 2026.
export const shipped: ShipItem[] = [
  {
    year: 'Apr–May 2026',
    name: 'TeachTrack',
    icon: '/icons/teachtrack.png',
    blurb:
      'A SaaS for private tutors — scheduling, lesson-package invoicing, and a Telegram reminder bot. Live, with a public metrics dashboard. ~25 people use it.',
    links: [
      { kind: 'site', label: 'teachtrack.ru', url: 'https://teachtrack.ru' },
      { kind: 'stats', label: 'live stats', url: 'https://stats.teachtrack.ru' },
      { kind: 'telegram', label: 'bot', url: 'https://t.me/teachtrackbot' },
    ],
  },
  {
    year: 'Mar–Apr 2026',
    name: 'TripTrack',
    icon: '/icons/triptrack.png',
    blurb:
      '“Strava for cars.” I’d never written Swift — I built the iOS app (iPhone, iPad, watchOS) and a NestJS backend in evenings. Live on the App Store, ~50 people use it.',
    links: [
      { kind: 'appstore', label: 'App Store', url: 'https://apps.apple.com/us/app/triptrack-road-journal/id6760650361' },
      { kind: 'site', label: 'trip-track.app', url: 'https://trip-track.app' },
      { kind: 'github', label: 'iOS source', url: 'https://github.com/OneZee23/trip-track-ios' },
      { kind: 'telegram', label: 'channel', url: 'https://t.me/triptrack_app' },
    ],
  },
  {
    year: 'Feb 2026',
    name: 'LifeTrack',
    icon: '/icons/lifetrack.png',
    blurb:
      'A minimalist habit tracker. Native SwiftUI on iOS, React Native on Android — on both stores. ~5 daily users, no revenue yet, and that’s fine.',
    links: [
      { kind: 'appstore', label: 'App Store', url: 'https://apps.apple.com/us/app/lifetrack-%D1%82%D1%80%D0%B5%D0%BA%D0%B5%D1%80-%D0%BF%D1%80%D0%B8%D0%B2%D1%8B%D1%87%D0%B5%D0%BA/id6759284836' },
      { kind: 'googleplay', label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=co.onezee.lifetrack' },
      { kind: 'github', label: 'iOS source', url: 'https://github.com/OneZee23/life-track-ios' },
      { kind: 'github', label: 'Android source', url: 'https://github.com/OneZee23/life-track-android' },
    ],
  },
  {
    year: 'Jan 2026',
    name: 'Fraggram',
    icon: '/icons/fraggram.png',
    archived: true,
    blurb:
      'A marketplace built entirely on Telegram Stars payments — backend, bot, infra, all done. Then three payment processors refused the model, so I killed it before launch. Learned more from that than from any tutorial.',
    links: [],
  },
  {
    year: '2025',
    name: 'onezee.dev',
    icon: '/icons/onezee.png',
    blurb:
      'This site. Open-source React, containerized and shipped to Kubernetes via Helm, werf and GitHub Actions.',
    links: [
      { kind: 'github', label: 'source', url: 'https://github.com/OneZee23/onezee-landing' },
    ],
  },
];

export const dayJob = {
  period: '2021 — 2026',
  org: 'iMe — a crypto/fintech Telegram super-app',
  url: 'https://imem.app',
  // Drop an iMe icon at public/icons/ime.png — a monogram shows until it exists.
  icon: '/icons/ime.png',
  lead: 'My day job for five years. I joined as an intern and grew into a senior engineer who owns core systems. A few of the things I built:',
  points: [
    'A high-load API gateway — one entry point for iOS, Android and Desktop, with autoscaling, multi-tier rate limiting and a sharded Redis layer.',
    'A subscription & payments platform across 8+ providers — App Store, Google Play, Stripe, Telegram Stars, YooKassa, Binance Pay.',
    'A self-custodial wallet across 9+ blockchains (Bitcoin, EVM, Solana, TON, Tron) with DEX/swap aggregation and on-chain scanning.',
    'An AI Telegram assistant on OpenAI with token-streaming replies.',
    'The unglamorous glue that keeps it correct under load: transactional outbox, circuit breakers, durable messaging — all Kubernetes-native.',
  ],
};

export interface SkillGroup {
  title: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  { title: 'Backend', items: ['NestJS', 'Node.js', 'TypeScript', 'PostgreSQL', 'TypeORM', 'Fastify'] },
  { title: 'Distributed', items: ['RabbitMQ', 'Transactional Outbox', 'Redis (sharded)', 'Circuit Breaker', 'Rate limiting'] },
  { title: 'Infra & Ops', items: ['Kubernetes', 'Helm', 'werf', 'Docker', 'GitLab CI', 'GitHub Actions', 'Grafana', 'Prometheus', 'Loki'] },
  { title: 'Blockchain', items: ['EVM', 'Bitcoin', 'Solana', 'TON', 'Tron', 'ethers / web3', 'Solidity'] },
  { title: 'Also', items: ['React', 'React Native', 'Swift / SwiftUI'] },
];

export const writing: SiteLink[] = [
  { kind: 'habr', label: 'Habr', url: 'https://habr.com/ru/users/OneZee/' },
  { kind: 'telegram', label: 'Telegram channel', url: 'https://t.me/onezee_co' },
];

// Old channel, kept as a relic of the past.
export const legacyYoutube = 'https://www.youtube.com/c/onezee';
export const languages = 'Russian (native) · English (B1, improving to B2)';
