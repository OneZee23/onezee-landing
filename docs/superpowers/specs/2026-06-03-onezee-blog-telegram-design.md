# onezee.dev — Telegram-ingested blog with SEO + likes

Date: 2026-06-03
Status: implemented on branch `feat/telegram-blog` (not yet build-verified — see "Verification").

## Goal

Publish posts I tag `#site` in my public Telegram channel as **real, indexable
article pages** on onezee.dev, automatically, and let visitors like them — while
keeping the existing landing page and design intact.

## Why this shape

The old site is Create React App (client-rendered). Search engines index
client-rendered SPA content poorly, and the whole point is SEO. So article pages
must be **pre-rendered HTML at real URLs**. That requires a framework that does
static generation — hence the migration to **Astro** (which still renders the
existing React components, so the look is preserved). Likes need persistent
state, so a tiny on-demand endpoint + Redis sits alongside the static pages.

## Architecture

```
Telegram channel (public)
   │  (scheduled GitHub Action, every ~15 min)
   ▼
scripts/ingest-telegram.mjs ── reads t.me/s/onezee_co, keeps #site posts,
   │                            downloads images, writes Markdown, dedups by id
   ▼
src/content/posts/*.md  +  public/posts/<id>/*   ── committed to the repo
   │  (commit → deploy)
   ▼
Astro build (static) ──► dist/  ── /blog and /blog/<slug> are pre-rendered HTML
   │                                /api/like + /health/check are on-demand (Node)
   ▼
Docker (Node server) ──► werf ──► Kubernetes (DigitalOcean)
                                   likes counter ──► Redis (optional)
```

Two rendering modes in one project (Astro `output: 'static'` + Node adapter):
pre-rendered pages for SEO, plus `prerender = false` routes for the dynamic bits.

## Components

| Unit | File | Responsibility |
|---|---|---|
| Site shell | `src/layouts/BaseLayout.astro`, `src/components/BaseHead.astro` | HTML head, meta/OG/Twitter, canonical, fonts, global CSS |
| Homepage | `src/pages/index.astro` | Renders the existing React `<App/>` (SSR + hydrated) |
| Blog index | `src/pages/blog/index.astro` | Lists posts (newest first) + "Elsewhere I write" + "Interviews & mentions" |
| Blog post | `src/pages/blog/[...slug].astro` | Renders one post, Article JSON-LD, like button, Telegram link |
| Content schema | `src/content.config.ts` | Zod schema for post frontmatter (title/date/cover/telegramId/tags/draft) |
| Likes API | `src/pages/api/like.ts` | GET count / POST increment; one-per-IP via Redis `SET NX`; fail-soft |
| Likes UI | `src/components/LikeButton.tsx` | React island; localStorage + server dedup; hides if backend disabled |
| Redis client | `src/lib/redis.ts` | Lazy ioredis singleton; null when `REDIS_URL` unset |
| Health | `src/pages/health/check.ts` | `/health/check` for K8s probes (replaces the old nginx route) |
| Ingestion lib | `scripts/lib/telegram.mjs` | Pure parser: extract messages, `#site` filter, HTML→Markdown, slug, excerpt |
| Ingestion job | `scripts/ingest-telegram.mjs` | Fetch + dedup + image download + write Markdown |
| Parser test | `scripts/test-parse.mjs` | Offline unit test (10 checks) |
| Workflows | `.github/workflows/ingest-telegram.yml`, `deploy.yaml` | Scheduled ingest → commit → trigger deploy |

## Content rules

- Only posts containing `#site` become articles (no thin-content pages).
- Title = the post's first line (tag stripped). URL slug = transliterated title.
- Other `#hashtags` become `tags`. Photos: first = cover, rest appended inline.
- Dedup by Telegram message id (idempotent — re-runs never duplicate).
- Backfill = the same job walking the whole history once (tag old posts to include them).

## SEO

Per-article pre-rendered HTML, `<title>`/description/canonical, Open Graph +
Twitter cards, `BlogPosting` JSON-LD, `@astrojs/sitemap` (`/sitemap-index.xml`),
`robots.txt` pointing at the sitemap.

## Likes

Static page + dynamic island. `POST /api/like` increments `likes:<id>` only when
`SET liked:<id>:<ipHash> NX` succeeds (idempotent, one per IP/year); the browser
also guards via localStorage. **Non-critical**: if `REDIS_URL` is unset or Redis
is down, every path returns a degraded result and the button hides — the site
never errors because of likes.

## Deploy changes

- Dockerfile: nginx-static → Node server (`node ./dist/server/entry.mjs`, port 4321).
- Helm: `app.port` 80 → 4321, container env (NODE_ENV/HOST/PORT, optional REDIS_URL),
  memory bumped for Node. Probe path `/health/check` unchanged.
- CI: `deploy.yaml` gains `workflow_dispatch` so ingestion can trigger a deploy.

## Out of scope (v1)

Editing/deleting a post after publish (re-tagging in TG won't update the file),
comments, view counts, per-post OG images.

## Verification

- ✅ Parser unit test: `node scripts/test-parse.mjs` — 10/10.
- ✅ Script syntax: `node --check` on all `scripts/*.mjs`.
- ⛔️ **Astro build NOT verified here** — the authoring environment has no network,
  so `npm install` / `npm run build` could not run. Astro code is written against
  Astro 5 patterns and reviewed, but must be built locally before deploy. See
  `LAUNCH.md`.

## Risks / known limitations

- t.me/s shows only recent posts per page; incremental run reads the newest page,
  so posting >~16 `#site` posts between runs needs a backfill run. (Rare.)
- The HTML parser targets t.me/s markup with regex; if Telegram changes markup,
  update `scripts/lib/telegram.mjs` (the test fixture pins the expected shape).
- Canonical domain: CI deploys to onezee.ru, branding is onezee.dev — set
  `SITE_URL` (Dockerfile build arg) to the domain Google should index.
