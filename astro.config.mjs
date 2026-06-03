import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

// Canonical public origin. Overridable at build time via SITE_URL env.
// NOTE: CI currently deploys to onezee.ru while the brand is onezee.dev —
// set SITE_URL to whichever domain is the indexed one. See docs/superpowers/specs.
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
