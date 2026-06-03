// Telegram → blog ingestion. Reads the public channel preview, turns posts
// tagged #site into Markdown files under src/content/posts, downloads their
// images into public/posts/<id>/, and skips anything already imported.
//
// Zero npm dependencies (Node 18+ built-ins only) — runs in CI with plain Node.
//
//   node scripts/ingest-telegram.mjs            # newest page only (incremental)
//   BACKFILL=1 node scripts/ingest-telegram.mjs # walk the whole history once
//
// Env: TELEGRAM_CHANNEL, SITE_TAG, CONTENT_DIR, PUBLIC_DIR, MAX_PAGES, BACKFILL
import fs from 'node:fs/promises';
import path from 'node:path';
import { postsFromHtml, extractMessages } from './lib/telegram.mjs';

const CHANNEL = process.env.TELEGRAM_CHANNEL || 'onezee_co';
const SITE_TAG = process.env.SITE_TAG || '#site';
const CONTENT_DIR = process.env.CONTENT_DIR || 'src/content/posts';
const PUBLIC_DIR = process.env.PUBLIC_DIR || 'public';
const IMAGE_SUBDIR = 'posts'; // → public/posts/<id>/<n>.<ext>, served at /posts/<id>/<n>.<ext>
const BACKFILL = /^(1|true|yes)$/i.test(process.env.BACKFILL || '');
const MAX_PAGES = Number(process.env.MAX_PAGES || (BACKFILL ? 60 : 1));
const UA = 'Mozilla/5.0 (compatible; onezee-blog-ingest/1.0; +https://onezee.dev)';

async function fetchPage(beforeId) {
  const url = beforeId
    ? `https://t.me/s/${CHANNEL}?before=${beforeId}`
    : `https://t.me/s/${CHANNEL}`;
  const res = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'en' } });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.text();
}

async function readExisting() {
  const ids = new Set();
  const slugs = new Set();
  let files = [];
  try {
    files = await fs.readdir(CONTENT_DIR);
  } catch {
    return { ids, slugs };
  }
  for (const f of files) {
    if (!f.endsWith('.md')) continue;
    slugs.add(f.replace(/\.md$/, ''));
    try {
      const txt = await fs.readFile(path.join(CONTENT_DIR, f), 'utf8');
      const match = txt.match(/^telegramId:\s*(\d+)/m);
      if (match) ids.add(Number(match[1]));
    } catch {
      /* ignore unreadable file */
    }
  }
  return { ids, slugs };
}

function extOf(url) {
  const clean = url.split('?')[0];
  const m = clean.match(/\.(jpe?g|png|webp|gif)$/i);
  return m ? m[0].toLowerCase() : '.jpg';
}

async function downloadImage(url, destPath) {
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`img ${url} → ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, buf);
}

function extractTags(markdown) {
  const found = new Set();
  const re = /#([A-Za-zЀ-ӿ][\wЀ-ӿ]{1,30})/g;
  let m;
  while ((m = re.exec(markdown)) !== null) {
    const t = m[1].toLowerCase();
    if (t !== 'site') found.add(t);
  }
  return [...found].slice(0, 6);
}

// Map a project hashtag in a post to a human-readable series name.
// Edit this as you add projects; posts without any of these tags stay ungrouped.
const SERIES_TAGS = {
  triptrack: 'TripTrack',
  teachtrack: 'TeachTrack',
  lifetrack: 'LifeTrack',
  fraggram: 'Fraggram',
  onezee: 'onezee.dev',
};

function detectSeries(markdown) {
  const re = /#([A-Za-z][A-Za-z0-9_]*)/g;
  let m;
  while ((m = re.exec(markdown)) !== null) {
    const key = m[1].toLowerCase();
    if (SERIES_TAGS[key]) return { key, name: SERIES_TAGS[key] };
  }
  return null;
}

function frontmatter(post, slug, cover) {
  const series = detectSeries(post.markdown);
  const tags = extractTags(post.markdown).filter((t) => !series || t !== series.key);
  const lines = [
    '---',
    `title: ${JSON.stringify(post.title)}`,
    `date: ${JSON.stringify(post.date || new Date().toISOString())}`,
    post.excerpt ? `excerpt: ${JSON.stringify(post.excerpt)}` : null,
    cover ? `cover: ${JSON.stringify(cover)}` : null,
    series ? `series: ${JSON.stringify(series.name)}` : null,
    `telegramId: ${post.id}`,
    `telegramUrl: ${JSON.stringify(post.telegramUrl)}`,
    `tags: [${tags.map((t) => JSON.stringify(t)).join(', ')}]`,
    'draft: false',
    '---',
  ];
  return lines.filter((l) => l !== null).join('\n');
}

async function writePost(post, slug) {
  const imagePaths = [];
  for (let i = 0; i < post.photos.length; i++) {
    const ext = extOf(post.photos[i]);
    const rel = `/${IMAGE_SUBDIR}/${post.id}/${i}${ext}`;
    const dest = path.join(PUBLIC_DIR, IMAGE_SUBDIR, String(post.id), `${i}${ext}`);
    try {
      await downloadImage(post.photos[i], dest);
      imagePaths.push(rel);
    } catch (err) {
      console.warn(`    image skipped (${post.photos[i]}): ${err.message}`);
    }
  }
  const cover = imagePaths[0];
  const extraImages = imagePaths.slice(1).map((p) => `\n\n![](${p})`).join('');
  const body = `${frontmatter(post, slug, cover)}\n\n${post.markdown}${extraImages}\n`;
  await fs.writeFile(path.join(CONTENT_DIR, `${slug}.md`), body, 'utf8');
  console.log(`  + ${slug}.md  (tg#${post.id}, ${imagePaths.length} image(s))`);
}

async function main() {
  console.log(`Ingesting #${SITE_TAG} posts from t.me/s/${CHANNEL}${BACKFILL ? ' (backfill)' : ''}`);
  await fs.mkdir(CONTENT_DIR, { recursive: true });

  const { ids: existingIds, slugs: existingSlugs } = await readExisting();
  const collected = new Map();
  let before;

  for (let page = 0; page < MAX_PAGES; page++) {
    const html = await fetchPage(before);
    const msgs = extractMessages(html);
    if (msgs.length === 0) break;
    for (const p of postsFromHtml(html, { siteTag: SITE_TAG })) {
      if (!collected.has(p.id)) collected.set(p.id, p);
    }
    if (!BACKFILL) break; // incremental: newest page is enough
    const minId = Math.min(...msgs.map((m) => m.id));
    if (!Number.isFinite(minId) || minId <= 1) break;
    before = minId;
  }

  const fresh = [...collected.values()]
    .filter((p) => !existingIds.has(p.id))
    .sort((a, b) => a.id - b.id);

  const usedSlugs = new Set(existingSlugs);
  let written = 0;
  for (const post of fresh) {
    let slug = post.slug;
    if (usedSlugs.has(slug)) slug = `${slug}-${post.id}`;
    usedSlugs.add(slug);
    await writePost(post, slug);
    written++;
  }

  console.log(`Done. ${written} new post(s); ${collected.size} tagged seen.`);
}

main().catch((err) => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
