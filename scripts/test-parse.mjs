// Offline unit test for the Telegram parser. Runs with plain Node, no deps:
//   node scripts/test-parse.mjs
import assert from 'node:assert/strict';
import {
  extractMessages,
  postsFromHtml,
  hasSiteTag,
  deriveTitle,
  slugify,
  makeExcerpt,
  parseProgress,
  seriesForId,
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

check('media is extracted with its kind (photo)', () => {
  const msgs = extractMessages(FIXTURE);
  assert.deepEqual(msgs[0].media, [{ url: 'https://cdn.cdn-telegram.org/file/abc.jpg', kind: 'photo' }]);
  assert.deepEqual(msgs[1].media, []);
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

check('parseProgress reads the proof-of-work signature', () => {
  assert.deepEqual(parseProgress('PoW TeachTrack — день 1/30'), { series: 'TeachTrack', day: 1, total: 30 });
  assert.deepEqual(parseProgress('TripTrack — день 9/30'), { series: 'TripTrack', day: 9, total: 30 });
  assert.deepEqual(parseProgress('Day 5/30'), { series: null, day: 5, total: 30 });
  // overtime is preserved
  assert.deepEqual(parseProgress('PoW TeachTrack — день 34/30'), { series: 'TeachTrack', day: 34, total: 30 });
  assert.equal(parseProgress('just a normal post, no counter'), null);
  // 'PoW' marker and lowercase prose words are NOT mistaken for a project
  assert.deepEqual(parseProgress('PoW — день 1/30'), { series: null, day: 1, total: 30 });
  assert.deepEqual(parseProgress('I shipped my app — day 1/30'), { series: null, day: 1, total: 30 });
});

check('nested <div> in message text does not truncate or drop the post', () => {
  const html = `<div class="tgme_widget_message js-widget_message" data-post="onezee_co/77">
    <div class="tgme_widget_message_text js-message_text">Intro <div class="tgme_widget_message_inline_keyboard">btn</div> tail with <a href="?q=%23site">#site</a> and more</div>
    <div class="tgme_widget_message_footer"><time datetime="2026-06-01T00:00:00+00:00"></time></div>
  </div>`;
  const posts = postsFromHtml(html);
  assert.equal(posts.length, 1, 'post must not be dropped');
  assert.match(posts[0].markdown, /tail with/, 'content after the nested div is kept');
});

check('page thumbnails after the last message are not used as its photos', () => {
  const html = `<div class="tgme_widget_message js-widget_message" data-post="onezee_co/88">
    <div class="tgme_widget_message_text js-message_text">A post #site</div>
    <div class="tgme_widget_message_footer"><time datetime="2026-06-02T00:00:00+00:00"></time></div>
  </div>
  <div class="tgme_widget_message_photo_wrap" style="background-image:url('https://cdn/footer-ad.jpg')"></div>`;
  assert.deepEqual(extractMessages(html)[0].media, [], 'footer thumbnail must not leak');
});

check('includePow imports PoW posts without #site (bulk mode)', () => {
  const html = `<div class="tgme_widget_message js-widget_message" data-post="onezee_co/99">
    <div class="tgme_widget_message_text js-message_text">Что-то построил сегодня<br/>PoW TeachTrack — день 5/30</div>
    <div class="tgme_widget_message_footer"><time datetime="2026-05-01T00:00:00+00:00"></time></div>
  </div>`;
  assert.equal(postsFromHtml(html).length, 0, 'no #site + no includePow → skipped');
  const posts = postsFromHtml(html, { includePow: true });
  assert.equal(posts.length, 1, 'includePow → imported');
  assert.equal(posts[0].progress.series, 'TeachTrack');
  assert.equal(posts[0].progress.day, 5);
});

check('seriesForId maps message ids to a project by inclusive range', () => {
  const ranges = [
    { from: 36, to: 83, series: 'FragGram' },
    { from: 173, to: 190, series: 'TripTrack' },
  ];
  assert.equal(seriesForId(50, ranges), 'FragGram');
  assert.equal(seriesForId(83, ranges), 'FragGram'); // inclusive upper bound
  assert.equal(seriesForId(180, ranges), 'TripTrack');
  assert.equal(seriesForId(95, ranges), null); // gap between ranges
});

check('deriveTitle skips a leading "день N/30" line', () => {
  assert.equal(
    deriveTitle('День 0/30.\n\nНа этой неделе появилась идея.'),
    'На этой неделе появилась идея.',
  );
  // a trailing marker still leaves the real first line as the title
  assert.equal(
    deriveTitle('Дизайн перенёс в приложение.\n\nДень 5/30.'),
    'Дизайн перенёс в приложение.',
  );
});

check('bare "день N/30" is imported only inside a known id-range', () => {
  const html = `<div class="tgme_widget_message js-widget_message" data-post="onezee_co/50">
    <div class="tgme_widget_message_text js-message_text">День 0/30.<br/><br/>На этой неделе появилась одна идея — не могу не поделиться.</div>
    <div class="tgme_widget_message_footer"><time datetime="2026-01-10T00:00:00+00:00"></time></div>
  </div>`;
  // includePow alone isn't enough — the project isn't named in the text
  assert.equal(postsFromHtml(html, { includePow: true }).length, 0);
  // …but with the id-range it's imported and grouped under the project
  const posts = postsFromHtml(html, {
    includePow: true,
    seriesRanges: [{ from: 36, to: 83, series: 'FragGram' }],
  });
  assert.equal(posts.length, 1);
  assert.equal(posts[0].rangeSeries, 'FragGram');
  assert.equal(posts[0].progress.day, 0);
  assert.equal(posts[0].progress.total, 30);
  assert.equal(posts[0].title, 'На этой неделе появилась одна идея — не могу не поделиться.');
});

console.log(`\n${passed} checks passed ✅`);
