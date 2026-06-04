import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

// Canonical public origin (sitemap + <link rel=canonical>). Domain: onezee.dev.
// Override at build time with SITE_URL only if you serve from a different host.
const site = process.env.SITE_URL || 'https://onezee.dev';

// https://astro.build/config
export default defineConfig({
  site,
  // Mostly static (great SEO). Individual routes opt into on-demand
  // rendering with `export const prerender = false` (the likes API + health).
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: [react(), sitemap({ filter: (page) => !page.includes('/api/') })],
  trailingSlash: 'ignore',
});
