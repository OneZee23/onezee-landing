// Offline unit test for the Telegram parser. Runs with plain Node, no deps:
//   node scripts/test-parse.mjs
import assert from 'node:assert/strict';
import {
  extractMessages,
  postsFromHtml,
  hasSiteTag,
  deriveTitle,
  slugify,
  htmlToMarkdown,
  makeExcerpt,
} from './lib/telegram.mjs';

// A representative slice of t.me/s/<channel> markup: one tagged post (with a
// photo, bold, an emoji and a link) and one untagged post (with a #sitemap
// false-positive that must NOT be treated as #site).
const FIXTURE = `
<div class="tgme_widget_message_wrap js-widget_message_wrap">
  <div class="tgme_widget_message js-widget_message" data-post="onezee_co/42" data-peer="x">
    <a class="tgme_widget_message_photo_wrap" style="background-image:url('https://cdn.cdn-telegram.org/file/abc.jpg')" href="https://t.me/onezee_co/42"></a>
    <div class="tgme_widget_message_text js-message_text" dir="auto">How I fixed a <b>serialization storm</b> in Postgres <i class="emoji" style="background-image:url('e.png')"><b>🔥</b></i><br/>Read more on <a href="https://onezee.dev">my&nbsp;site</a> <a href="?q=%23site">#site</a></div>
    <div class="tgme_widget_message_footer">
      <a class="tgme_widget_message_date" href="https://t.me/onezee_co/42"><time datetime="2026-06-01T12:00:00+00:00" class="time">12:00</time></a>
    </div>
  </div>
</div>
<div class="tgme_widget_message_wrap js-widget_message_wrap">
  <div class="tgme_widget_message js-widget_message" data-post="onezee_co/43">
    <div class="tgme_widget_message_text js-message_text" dir="auto">Just a regular post without the tag. See my #sitemap notes.</div>
    <a class="tgme_widget_message_date" href="https://t.me/onezee_co/43"><time datetime="2026-06-02T09:30:00+00:00"></time></a>
  </div>
</div>`;

let passed = 0;
const check = (name, fn) => {
  fn();
  passed++;
  console.log(`  ✓ ${name}`);
};

console.log('telegram parser');

check('extractMessages finds both posts with correct ids', () => {
  const msgs = extractMessages(FIXTURE);
  assert.equal(msgs.length, 2);
  assert.equal(msgs[0].id, 42);
  assert.equal(msgs[1].id, 43);
  assert.equal(msgs[0].channel, 'onezee_co');
});

check('photo background-image is extracted', () => {
  const msgs = extractMessages(FIXTURE);
  assert.deepEqual(msgs[0].photos, ['https://cdn.cdn-telegram.org/file/abc.jpg']);
  assert.deepEqual(msgs[1].photos, []);
});

check('datetime is extracted', () => {
  const msgs = extractMessages(FIXTURE);
  assert.equal(msgs[0].datetime, '2026-06-01T12:00:00+00:00');
});

check('#site matches but #sitemap does not', () => {
  assert.equal(hasSiteTag('hello #site world'), true);
  assert.equal(hasSiteTag('see my #sitemap notes'), false);
  assert.equal(hasSiteTag('no tag here'), false);
});

check('postsFromHtml keeps only the tagged post', () => {
  const posts = postsFromHtml(FIXTURE);
  assert.equal(posts.length, 1);
  assert.equal(posts[0].id, 42);
});

check('title is the first line, tag-stripped', () => {
  const posts = postsFromHtml(FIXTURE);
  assert.equal(posts[0].title, 'How I fixed a serialization storm in Postgres 🔥');
});

check('slug is transliterated and clean', () => {
  const posts = postsFromHtml(FIXTURE);
  assert.equal(posts[0].slug, 'how-i-fixed-a-serialization-storm-in-postgres');
  assert.equal(slugify('Привет, мир!'), 'privet-mir');
});

check('markdown keeps bold + link, drops #site and emoji wrapper', () => {
  const posts = postsFromHtml(FIXTURE);
  const md = posts[0].markdown;
  assert.match(md, /\*\*serialization storm\*\*/);
  assert.match(md, /\[my site\]\(https:\/\/onezee\.dev\)/);
  assert.match(md, /🔥/);
  assert.doesNotMatch(md, /#site/);
  assert.doesNotMatch(md, /<\/?[a-z]/i, 'no leftover HTML tags');
});

check('excerpt strips markdown syntax', () => {
  const md = '**Hello** world, read [this](http://x)';
  assert.equal(makeExcerpt(md), 'Hello world, read this');
});

check('deriveTitle truncates long lines on a word boundary', () => {
  const long = 'a'.repeat(40) + ' ' + 'b'.repeat(80);
  const t = deriveTitle(long);
  assert.ok(t.length <= 102);
  assert.ok(t.endsWith('…'));
});

console.log(`\n${passed} checks passed ✅`);
