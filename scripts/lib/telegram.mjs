// Pure, dependency-free helpers for turning a Telegram public channel preview
// (https://t.me/s/<channel>) into blog content. No npm deps so it runs in CI
// with plain Node and can be unit-tested offline (see scripts/test-parse.mjs).
//
// The markup we target (stable for years on t.me/s):
//   <div class="tgme_widget_message ..." data-post="channel/123" ...>
//     <a class="tgme_widget_message_photo_wrap" style="background-image:url('...')"></a>
//     <div class="tgme_widget_message_text">text with <a>links</a>, <b>bold</b>, #tags</div>
//     <time datetime="2026-06-01T12:00:00+00:00"></time>
//   </div>

const HTML_ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#039;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&hellip;': '…',
  '&mdash;': '—',
  '&ndash;': '–',
};

export function decodeEntities(str = '') {
  return str
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&[a-z#0-9]+;/gi, (m) => HTML_ENTITIES[m.toLowerCase()] ?? m);
}

function removeTags(html = '') {
  return html.replace(/<[^>]+>/g, '');
}

/** Tags removed, entities decoded, whitespace tidied — for titles / tag detection. */
export function stripTags(html = '') {
  const noBr = html.replace(/<br\s*\/?>/gi, '\n');
  return decodeEntities(removeTags(noBr))
    .replace(/ /g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** True when the post carries the routing tag (default #site), as a whole word. */
export function hasSiteTag(textPlain, tag = '#site') {
  const re = new RegExp(`(^|[^\\w])${escapeRegex(tag)}(?![\\w])`, 'i');
  return re.test(textPlain);
}

/** Remove the routing tag from text (both linked and bare forms). */
export function stripSiteTag(text, tag = '#site') {
  return text.replace(new RegExp(`(^|[^\\w])${escapeRegex(tag)}(?![\\w])`, 'gi'), '$1');
}

/** Convert the Telegram message_text inner HTML to Markdown. */
export function htmlToMarkdown(html = '', { siteTag = '#site' } = {}) {
  let s = html;

  // 1. Telegram emoji: <i class="emoji" style="..."><b>😀</b></i> → keep the glyph.
  s = s.replace(/<i class="emoji"[^>]*>([\s\S]*?)<\/i>/gi, (_, inner) => removeTags(inner));
  s = s.replace(/<\/?tg-emoji[^>]*>/gi, '');

  // 2. Line breaks.
  s = s.replace(/<br\s*\/?>/gi, '\n');

  // 3. Blockquotes (Telegram expandable quotes included).
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, inner) => {
    const text = removeTags(inner.replace(/<br\s*\/?>/gi, '\n')).trim();
    return '\n' + text.split('\n').map((l) => '> ' + l).join('\n') + '\n';
  });

  // 4. Code blocks then inline code.
  s = s.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, inner) => '\n```\n' + removeTags(inner).trim() + '\n```\n');
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, inner) => '`' + removeTags(inner) + '`');

  // 5. Inline emphasis (safe now that emoji <i>/<b> are gone).
  s = s.replace(/<(b|strong)[^>]*>([\s\S]*?)<\/\1>/gi, (_, _t, inner) => '**' + inner.trim() + '**');
  s = s.replace(/<(i|em)[^>]*>([\s\S]*?)<\/\1>/gi, (_, _t, inner) => '_' + inner.trim() + '_');
  s = s.replace(/<(s|del|strike)[^>]*>([\s\S]*?)<\/\1>/gi, (_, _t, inner) => '~~' + inner.trim() + '~~');

  // 6. Links: real links → [text](href); hashtag links → plain text.
  s = s.replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, inner) => {
    const text = removeTags(inner).trim();
    if (text.startsWith('#')) return text; // hashtag — drop the t.me search link
    if (!text) return '';
    return `[${text}](${href})`;
  });

  // 7. Spoilers and anything left.
  s = removeTags(s);

  // 8. Decode entities once, drop the routing tag, tidy whitespace.
  s = decodeEntities(s);
  s = stripSiteTag(s, siteTag);
  s = s
    .replace(/ /g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  return s;
}

/** First meaningful line, tag-stripped, trimmed to a sensible title length. */
export function deriveTitle(textPlain, { siteTag = '#site' } = {}) {
  const cleaned = stripSiteTag(textPlain, siteTag).trim();
  const firstLine = cleaned.split('\n').map((l) => l.trim()).find(Boolean) || 'Untitled';
  if (firstLine.length <= 100) return firstLine.replace(/[*_`~]+/g, '');
  const cut = firstLine.slice(0, 100);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).replace(/[*_`~]+/g, '').trim() + '…';
}

const CYRILLIC = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y',
  ь: '', э: 'e', ю: 'yu', я: 'ya',
};

export function slugify(str = '') {
  let out = '';
  for (const ch of str.toLowerCase()) {
    if (Object.prototype.hasOwnProperty.call(CYRILLIC, ch)) out += CYRILLIC[ch];
    else if (/[a-z0-9]/.test(ch)) out += ch;
    else if (/[\s\-_]/.test(ch)) out += '-';
    // everything else (punctuation, emoji) is dropped
  }
  return out.replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 60).replace(/-$/, '');
}

/** A URL slug from the title, falling back to the Telegram id. */
export function buildSlug(title, id) {
  return slugify(title) || `post-${id}`;
}

/**
 * Extract the inner HTML of a message's text div, balancing nested <div>s.
 * A plain non-greedy regex would stop at the first </div> and truncate the body
 * when Telegram nests a div (quotes, link previews, inline keyboards) — which can
 * even fuse the #site tag with following text and drop the whole post.
 */
function extractTextDiv(chunk) {
  const open = /<div class="tgme_widget_message_text[^"]*"[^>]*>/i.exec(chunk);
  if (!open) return '';
  const start = open.index + open[0].length;
  const tagRe = /<(\/?)div\b[^>]*>/gi;
  tagRe.lastIndex = start;
  let depth = 1;
  let t;
  while ((t = tagRe.exec(chunk)) !== null) {
    depth += t[1] === '/' ? -1 : 1;
    if (depth === 0) return chunk.slice(start, t.index);
  }
  return chunk.slice(start);
}

/** Parse a t.me/s channel HTML page into structured messages (newest order as on page). */
export function extractMessages(html = '') {
  const markerRe = /<div class="tgme_widget_message[ "][^>]*\bdata-post="([^"]+)"/g;
  const marks = [];
  let m;
  while ((m = markerRe.exec(html)) !== null) {
    marks.push({ index: m.index, dataPost: m[1] });
  }

  const messages = [];
  for (let i = 0; i < marks.length; i++) {
    const chunk = html.slice(marks[i].index, i + 1 < marks.length ? marks[i + 1].index : html.length);
    const dataPost = marks[i].dataPost; // "channel/123"
    const [channel, idStr] = dataPost.split('/');
    const id = Number(idStr);
    if (!Number.isFinite(id)) continue;

    const textHtml = extractTextDiv(chunk);
    const textPlain = stripTags(textHtml);

    const dateMatch = chunk.match(/<time[^>]*datetime="([^"]+)"/i);
    const datetime = dateMatch ? dateMatch[1] : null;

    // Media lives in the message bubble, before its footer. Bounding the search
    // to the pre-footer region keeps the last message from picking up page-footer
    // / recommended-channel thumbnails that follow it in the HTML. We capture the
    // kind so videos can render a play overlay (the thumbnail is all t.me/s gives).
    const footerIdx = chunk.search(/tgme_widget_message_footer/i);
    const mediaRegion = footerIdx >= 0 ? chunk.slice(0, footerIdx) : chunk;
    const media = [];
    const mediaRe =
      /tgme_widget_message_(photo|video_thumb)_wrap[^>]*style="[^"]*background-image:url\(['"]?([^'")]+)['"]?\)/gi;
    let p;
    while ((p = mediaRe.exec(mediaRegion)) !== null) {
      media.push({ url: decodeEntities(p[2]), kind: p[1] === 'video_thumb' ? 'video' : 'photo' });
    }

    messages.push({ id, channel, dataPost, datetime, textHtml, textPlain, media });
  }
  return messages;
}

/**
 * Parse the proof-of-work progress signature, e.g.
 *   "PoW TeachTrack — день 1/30", "TripTrack — день 9/30", "Day 5/30".
 * Returns { series, day, total } (series may be null), or null if absent.
 * Note: day can exceed total (overtime, e.g. 34/30) — kept as-is.
 */
export function parseProgress(text = '') {
  const m = text.match(
    /(?:pow\s+)?([A-Za-z][A-Za-z0-9]+)\s*[—–-]\s*(?:день|day)\s+(\d+)\s*\/\s*(\d+)/i,
  );
  // Only treat the captured token as a project if it looks like one (CamelCase /
  // capitalised) and isn't the "PoW" marker — avoids "...my app — day 1/30" → "app".
  if (m && /^[A-Z]/.test(m[1]) && m[1].toLowerCase() !== 'pow') {
    return { series: m[1], day: Number(m[2]), total: Number(m[3]) };
  }
  const bare = text.match(/(?:день|day)\s+(\d+)\s*\/\s*(\d+)/i);
  if (bare) {
    return { series: null, day: Number(bare[1]), total: Number(bare[2]) };
  }
  return null;
}

/**
 * High-level: page messages as content objects.
 * Kept when the message carries the routing tag (#site) — or, when includePow
 * is set, when it carries a proof-of-work signature ("день N/30"), so the whole
 * devlog can be bulk-imported without tagging each post.
 */
export function postsFromHtml(html, { siteTag = '#site', includePow = false } = {}) {
  return extractMessages(html)
    .filter((msg) => {
      if (!msg.textPlain) return false;
      if (hasSiteTag(msg.textPlain, siteTag)) return true;
      return includePow && parseProgress(msg.textPlain) != null;
    })
    .map((msg) => {
      const title = deriveTitle(msg.textPlain, { siteTag });
      const markdown = htmlToMarkdown(msg.textHtml, { siteTag });
      return {
        id: msg.id,
        channel: msg.channel,
        title,
        slug: buildSlug(title, msg.id),
        date: msg.datetime,
        telegramUrl: `https://t.me/${msg.channel}/${msg.id}`,
        media: msg.media,
        markdown,
        excerpt: makeExcerpt(markdown),
        progress: parseProgress(msg.textPlain),
      };
    });
}

export function makeExcerpt(markdown, maxLen = 180) {
  const plain = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= maxLen) return plain;
  const cut = plain.slice(0, maxLen);
  return cut.slice(0, cut.lastIndexOf(' ')).trim() + '…';
}
