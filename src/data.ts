// Shared, locale-independent site data: types + structured links.
// Homepage COPY (bilingual) lives in src/content/site.ts — edit wording there.
// This file holds the things that don't change between EN and RU: types,
// profile, social/contact URLs, and the blog's link lists.

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

export const socials: SiteLink[] = [
  { kind: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/nikita-shevelev-onezee/' },
  { kind: 'github', label: 'GitHub', url: 'https://github.com/OneZee23' },
  { kind: 'telegram', label: 'Telegram', url: 'https://t.me/onezee_co' },
  { kind: 'habr', label: 'Habr', url: 'https://habr.com/ru/users/OneZee/' },
  { kind: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@onezee_dev' },
  { kind: 'email', label: 'Email', url: 'mailto:onezeecsgo@gmail.com' },
];

// Downloadable CV (lives at public/cv.pdf → served at /cv.pdf)
export const resumeUrl = '/cv.pdf';

export interface ShipItem {
  year: string;
  name: string;
  icon?: string; // path under public/, e.g. '/icons/triptrack.png'; falls back to a monogram
  archived?: boolean; // greyed out as a relic (dead/never launched)
  blurb: string;
  links: SiteLink[]; // links[0] is treated as the project's "home" (the clickable icon target)
}

export interface SkillGroup {
  title: string;
  items: string[];
}

// Homepage "I write" links (Habr + Telegram channel).
export const writing: SiteLink[] = [
  { kind: 'habr', label: 'Habr', url: 'https://habr.com/ru/users/OneZee/' },
  { kind: 'telegram', label: 'Telegram channel', url: 'https://t.me/onezee_co' },
];

// Articles published elsewhere — shown on /blog under "Elsewhere I write".
export const externalWriting: SiteLink[] = [
  { kind: 'habr', label: 'Habr — OneZee', url: 'https://habr.com/ru/users/OneZee/' },
  // Add more as you publish, e.g.:
  // { kind: 'site', label: 'dev.to — onezee', url: 'https://dev.to/onezee' },
];

// Interviews / press / mentions of my work — shown on /blog under "Interviews & mentions".
export interface Mention {
  label: string; // what it is, e.g. "Interview about building TripTrack"
  outlet: string; // where, e.g. "Some Podcast"
  url: string;
}
export const mentions: Mention[] = [
  // { label: 'How I shipped TripTrack solo', outlet: 'Indie Hackers', url: 'https://...' },
];

// Old channel, kept as a relic of the past.
export const legacyYoutube = 'https://www.youtube.com/c/onezee';
