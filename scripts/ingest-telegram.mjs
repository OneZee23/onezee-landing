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
// Bulk mode: also import posts that carry a PoW signature ("день N/30"), even
// without #site — for a one-time import of the whole devlog.
const INCLUDE_POW = /^(1|true|yes)$/i.test(process.env.IMPORT_ALL_POW || '');
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

// ru if Cyrillic outweighs Latin — a single quoted Russian word in an English
// post (or vice-versa) shouldn't flip the language.
function detectLang(text) {
  const cyrillic = (text.match(/[Ѐ-ӿ]/g) || []).length;
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  return cyrillic > latin ? 'ru' : 'en';
}

function frontmatter(post, cover) {
  const hashtagSeries = detectSeries(post.markdown);
  const progress = post.progress; // { series, day, total } | null from the PoW signature
  // Prefer the project name from the PoW signature, normalised through SERIES_TAGS.
  const seriesName =
    (progress && progress.series && (SERIES_TAGS[progress.series.toLowerCase()] || progress.series)) ||
    (hashtagSeries && hashtagSeries.name) ||
    null;
  const tags = extractTags(post.markdown).filter((t) => !hashtagSeries || t !== hashtagSeries.key);
  const lines = [
    '---',
    `title: ${JSON.stringify(post.title)}`,
    `date: ${JSON.stringify(post.date || new Date().toISOString())}`,
    post.excerpt ? `excerpt: ${JSON.stringify(post.excerpt)}` : null,
    cover ? `cover: ${JSON.stringify(cover)}` : null,
    seriesName ? `series: ${JSON.stringify(seriesName)}` : null,
    progress && Number.isFinite(progress.day) ? `day: ${progress.day}` : null,
    progress && Number.isFinite(progress.total) ? `total: ${progress.total}` : null,
    `lang: ${JSON.stringify(detectLang(`${post.title} ${post.markdown}`))}`,
    `telegramId: ${post.id}`,
    `telegramUrl: ${JSON.stringify(post.telegramUrl)}`,
    `tags: [${tags.map((t) => JSON.stringify(t)).join(', ')}]`,
    'draft: false',
    '---',
  ];
  return lines.filter((l) => l !== null).join('\n');
}

function videoCard(post, src) {
  return (
    `<a class="post-video" href="${post.telegramUrl}" target="_blank" rel="noreferrer noopener">` +
    `<img src="${src}" alt="" loading="lazy" />` +
    `<span class="post-video__play" aria-hidden="true"></span></a>`
  );
}

async function writePost(post, slug) {
  // Download all media (photos + video thumbnails) into public/posts/<id>/.
  const downloaded = [];
  for (let i = 0; i < post.media.length; i++) {
    const { url, kind } = post.media[i];
    const ext = extOf(url);
    const rel = `/${IMAGE_SUBDIR}/${post.id}/${i}${ext}`;
    const dest = path.join(PUBLIC_DIR, IMAGE_SUBDIR, String(post.id), `${i}${ext}`);
    try {
      await downloadImage(url, dest);
      downloaded.push({ path: rel, kind });
    } catch (err) {
      console.warn(`    media skipped (${url}): ${err.message}`);
    }
  }

  const photos = downloaded.filter((m) => m.kind === 'photo');
  const videos = downloaded.filter((m) => m.kind === 'video');
  const cover = photos[0]?.path; // first photo → cover (top hero + og:image)

  // Remaining photos: single → plain image; many → a gallery grid.
  let extras = '';
  const rest = photos.slice(1);
  if (rest.length === 1) {
    extras += `\n\n![](${rest[0].path})`;
  } else if (rest.length > 1) {
    extras +=
      '\n\n<div class="post-gallery">\n' +
      rest.map((p) => `  <img src="${p.path}" alt="" loading="lazy" />`).join('\n') +
      '\n</div>';
  }
  // Videos: thumbnail + ▶ overlay that opens the original (t.me/s gives no file).
  if (videos.length) {
    extras += '\n\n' + videos.map((v) => videoCard(post, v.path)).join('\n');
  }

  const body = `${frontmatter(post, cover)}\n\n${post.markdown}${extras}\n`;
  await fs.writeFile(path.join(CONTENT_DIR, `${slug}.md`), body, 'utf8');
  console.log(`  + ${slug}.md  (tg#${post.id}, ${photos.length} photo(s), ${videos.length} video(s))`);
}

async function main() {
  console.log(
    `Ingesting from t.me/s/${CHANNEL} — tag ${SITE_TAG}${INCLUDE_POW ? ' + all PoW posts' : ''}${BACKFILL ? ' (backfill)' : ''}`,
  );
  await fs.mkdir(CONTENT_DIR, { recursive: true });

  const { ids: existingIds, slugs: existingSlugs } = await readExisting();
  const collected = new Map();
  let before;
  let exhausted = false;

  for (let page = 0; page < MAX_PAGES; page++) {
    const html = await fetchPage(before);
    const msgs = extractMessages(html);
    if (msgs.length === 0) {
      exhausted = true;
      break;
    }
    for (const p of postsFromHtml(html, { siteTag: SITE_TAG, includePow: INCLUDE_POW })) {
      if (!collected.has(p.id)) collected.set(p.id, p);
    }
    if (!BACKFILL) {
      exhausted = true;
      break; // incremental: newest page is enough
    }
    const minId = Math.min(...msgs.map((m) => m.id));
    if (!Number.isFinite(minId) || minId <= 1) {
      exhausted = true;
      break;
    }
    before = minId;
  }
  if (BACKFILL && !exhausted) {
    console.warn(
      `Reached MAX_PAGES (${MAX_PAGES}) before the channel start — older posts may be missing. Re-run with MAX_PAGES higher to go deeper.`,
    );
  }

  const fresh = [...collected.values()]
    .filter((p) => !existingIds.has(p.id))
    .sort((a, b) => a.id - b.id);

  const usedSlugs = new Set(existingSlugs);
  let written = 0;
  for (const post of fresh) {
    let slug = post.slug;
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${post.id}`;
      if (usedSlugs.has(slug)) slug = `post-${post.id}`; // telegram id is unique
    }
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
