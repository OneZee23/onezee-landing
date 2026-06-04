// Site-wide constants. The canonical origin lives in astro.config.mjs (`site`)
// and is read at runtime via `Astro.site`.

export const SITE_TITLE = 'Nikita Shevelev — Senior Backend Engineer';

export const SITE_DESCRIPTION =
  'Senior Backend Engineer — NestJS, TypeScript, Node.js. High-load systems, payments, and blockchain. I build the backend of a crypto/fintech super-app and ship indie apps.';

export const AUTHOR = 'Nikita Shevelev';

// Public Telegram channel the blog ingests from.
export const TELEGRAM_CHANNEL = 'onezee_co';
export const TELEGRAM_CHANNEL_URL = `https://t.me/${TELEGRAM_CHANNEL}`;

// Default social share image (lives in public/).
export const DEFAULT_OG_IMAGE = '/logo192.jpg';

/** URL slug for a series/project name → used by /blog/series/<slug>. */
export const seriesSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Project logos (in public/icons/) for blog chapters + topic pages, keyed by
// the series name as it appears in the PoW signature. Add new projects here.
const SERIES_ICON: Record<string, string> = {
  TeachTrack: '/icons/teachtrack.png',
  TripTrack: '/icons/triptrack.png',
  LifeTrack: '/icons/lifetrack.png',
  Fraggram: '/icons/fraggram.png',
  'onezee.dev': '/icons/onezee.png',
};

/** Project logo path for a series name, or null to fall back to text only. */
export const seriesIcon = (name: string): string | null => SERIES_ICON[name] ?? null;
