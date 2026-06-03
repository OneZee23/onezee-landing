# Launch checklist — Telegram blog + likes

Everything is implemented on the branch `feat/telegram-blog`. This was authored
in an offline environment, so the **Astro build was not run yet** — step 1 is to
verify it locally. Nothing is deployed until you merge to `master`.

Order matters. Steps marked **(you)** need your accounts/infra.

---

## 1. Verify locally (15 min)

```bash
git checkout feat/telegram-blog
npm install            # regenerates package-lock.json for the Astro stack
npm run test:parser    # Telegram parser unit test — should print "10 checks passed"
npm run dev            # open http://localhost:4321
```
Check: the homepage looks **identical** to before, and `/blog` renders (it has one
placeholder post). Then the real test:

```bash
npm run build          # must succeed — this is the one step I could not run offline
npm run preview        # serves the production Node build on http://localhost:4321
```
If `npm run build` reports an error, send me the output — it'll be a small Astro 5
API/typing tweak, not a design problem. Everything else is verified.

## 2. (you) Decide the canonical domain

CI deploys to **onezee.ru**, but the branding is **onezee.dev**. Pick the one
Google should index and make these match it:
- `Dockerfile` → `ARG SITE_URL=` (default is `https://onezee.dev`)
- `public/robots.txt` → the `Sitemap:` line
- `src/components/BaseHead.astro` → `og:site_name`

## 3. First deploy

```bash
# after `npm run build` passes locally:
git checkout master
git merge feat/telegram-blog
git push                # triggers the existing werf → Kubernetes deploy
```
The container is now a small Node server (port 4321) instead of nginx — the Helm
chart is already updated (port, env, probes stay on `/health/check`). After it
rolls out, check: site loads, `/blog` works, `https://<domain>/sitemap-index.xml`
exists.

> Heads-up: `npm install` rewrote `package-lock.json`. Commit it (it's part of the
> merge) so the Docker build is reproducible.

## 4. Turn on the Telegram blog

The channel `onezee_co` is public, so **no bot or token is needed**.

- **Use it:** write a post in the channel and put `#site` anywhere in it. Within
  ~15 minutes the scheduled GitHub Action turns it into `/blog/<title>` and
  deploys. First line = the title. Other `#hashtags` = tags. Photos = cover + inline.
- **Backfill old posts:** GitHub → Actions → **Ingest Telegram posts** →
  *Run workflow* → set **backfill = true**. It walks the whole history and imports
  every post you've tagged `#site`. (Add `#site` to the old posts you want first —
  you can edit old Telegram posts.)
- **Note:** the scheduled job only runs once this branch is on `master` (GitHub runs
  schedules from the default branch).

## 5. (you) Enable likes — optional

Likes need a Redis. Without it the like button simply hides; the site works fine.

1. Provision Redis (DigitalOcean Managed Redis is easiest, or run one in-cluster).
2. Put the URL in `.helm/secret-values-prod.yaml` (werf-encrypted), e.g.:
   ```yaml
   app:
     redisUrl: "redis://:PASSWORD@HOST:6379"
   ```
3. Redeploy. The like button appears and counts persist.

## 6. (you) Auto-deploy of new posts — optional but recommended

The ingest workflow commits new posts and then tries to trigger a deploy
(`gh workflow run deploy.yaml`). If your org restricts that, add a Personal Access
Token so the content commit itself triggers the deploy:
- Create a PAT (classic: `repo` + `workflow` scope, or fine-grained with contents
  + actions write).
- Add it as repo secret **`PUSH_TOKEN`**. The ingest workflow already prefers it.

## 7. (you) SEO kickstart

After the first deploy, submit `https://<domain>/sitemap-index.xml` in
**Google Search Console** so the articles get crawled sooner.

---

## What you do day-to-day

> Write a post in your Telegram channel → add `#site` → done. It shows up at
> `onezee.dev/blog/...` within ~15 minutes, indexable, with a like button.

## Local commands

| Command | What |
|---|---|
| `npm run dev` | Dev server (localhost:4321) |
| `npm run build` | Production build |
| `npm run preview` | Serve the production build locally |
| `npm run test:parser` | Telegram parser unit test |
| `npm run ingest` | Pull newest `#site` posts now (needs network) |
| `npm run ingest:backfill` | Import the whole channel history |

Full design rationale: `docs/superpowers/specs/2026-06-03-onezee-blog-telegram-design.md`.
