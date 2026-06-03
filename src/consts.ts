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
