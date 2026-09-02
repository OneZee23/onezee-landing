import React from 'react';
import type { Locale } from '../content/site';
import { jobHunt, stage, pct, weeksBetween, plural, type LogDay } from '../content/job-hunt';

// Static, no hydration. Hover affordances are CSS + native title attributes.

type Copy = {
  eyebrow: string;
  hero: (calls: number, applied: number) => React.ReactNode;
  tiles: { calls: string; second: string; offers: string; awaiting: string };
  ladderTitle: string;
  ladderHint: string;
  stages: Record<string, string>;
  outcomeLine: (r: number, a: number) => string;
  channelsLine: (hh: number, b: number, r: number) => string;
  timelineTitle: string;
  gapLine: (w: number) => string;
  logTitle: string;
  logHint: string;
  ev: Record<string, (n: number) => string>;
  netTitle: string;
  netUnit: (n: number) => string;
  netLine: (refs: number, applied: number) => string;
  metaRole: string;
  metaTarget: string;
  updated: string;
  checked: string;
  back: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    eyebrow: 'Job hunt, in the open',
    hero: (c, a) => (
      <>
        <span className="jh__hero-n">{c}</span> first call{c === 1 ? '' : 's'} out of{' '}
        <span className="jh__hero-d">{a}</span> application{a === 1 ? '' : 's'}
      </>
    ),
    tiles: { calls: 'First calls', second: 'Second rounds', offers: 'Offers', awaiting: 'No answer yet' },
    ladderTitle: 'How far applications get',
    ladderHint: 'Same scale across all stages. A dot marks a real zero.',
    stages: { applied: 'Applied', call1: 'First call', call2: 'Second round', final: 'Final', offer: 'Offer' },
    outcomeLine: (r, a) =>
      `${r} rejection${r === 1 ? '' : 's'} (a floor - they stopped being logged after 5 June), ${a} still without an answer.`,
    channelsLine: (hh, b, r) => `By channel: ${hh} on a Russian job board, ${b} on LinkedIn and EU boards, ${r} through a referral.`,
    timelineTitle: 'Applications over time',
    gapLine: (w) => `${w} week${w === 1 ? '' : 's'} with no records. The search was running; the log was not.`,
    logTitle: 'Logged days',
    logHint: 'Day-level logging started 24 August. A day with no entry is a day with nothing logged.',
    ev: {
      applied: (n) => `application${n === 1 ? '' : 's'}`,
      invites: (n) => `invitation${n === 1 ? '' : 's'}`,
      acc: () => 'accepted',
      reply: (n) => (n === 1 ? 'reply' : 'replies'),
      msg: (n) => `message${n === 1 ? '' : 's'}`,
      ref: (n) => `referral offer${n === 1 ? '' : 's'}`,
    },
    netTitle: 'The other channel',
    netUnit: (n) => `real conversation${n === 1 ? '' : 's'} with engineers in Europe`,
    netLine: (r, a) =>
      `One number on purpose. These are conversations, not leads: no names, no per-person tracking, no funnel, no conversion rate. So far they have ruled out two companies and produced ${r} referral offer${r === 1 ? '' : 's'}, none of which had to be asked for. ${a} applications have produced none.`,
    metaRole: 'Role',
    metaTarget: 'Target',
    updated: 'Updated',
    checked: 'checked against primary sources',
    back: '← onezee.dev',
  },
  ru: {
    eyebrow: 'Поиск работы, в открытую',
    hero: (c, a) => (
      <>
        <span className="jh__hero-n">{c}</span>{' '}
        {plural(c, 'первый созвон', 'первых созвона', 'первых созвонов')} из{' '}
        <span className="jh__hero-d">{a}</span> откликов
      </>
    ),
    tiles: { calls: 'Первых созвонов', second: 'Вторых этапов', offers: 'Офферов', awaiting: 'Без ответа' },
    ladderTitle: 'Докуда доходят отклики',
    ladderHint: 'Единый масштаб по всем стадиям. Точка отмечает настоящий ноль.',
    stages: { applied: 'Подано', call1: 'Первый созвон', call2: 'Второй этап', final: 'Финал', offer: 'Оффер' },
    outcomeLine: (r, a) =>
      `${r} ${plural(r, 'отказ', 'отказа', 'отказов')} (это пол: после 5 июня они перестали фиксироваться), ${a} без ответа.`,
    channelsLine: (hh, b, r) => `По каналам: ${hh} на российской доске, ${b} на LinkedIn и европейских бордах, ${r} через реферал.`,
    timelineTitle: 'Отклики во времени',
    gapLine: (w) => `${w} ${plural(w, 'неделя', 'недели', 'недель')} без записей. Поиск шёл, учёт не вёлся.`,
    logTitle: 'Записанные дни',
    logHint: 'Посуточный учёт начат 24 августа. День без строки это день, за который ничего не записано.',
    ev: {
      applied: (n) => plural(n, 'отклик', 'отклика', 'откликов'),
      invites: (n) => plural(n, 'приглашение', 'приглашения', 'приглашений'),
      acc: (n) => plural(n, 'принял', 'приняли', 'приняли'),
      reply: (n) => plural(n, 'ответ', 'ответа', 'ответов'),
      msg: (n) => plural(n, 'сообщение', 'сообщения', 'сообщений'),
      ref: (n) => plural(n, 'реферал', 'реферала', 'рефералов'),
    },
    netTitle: 'Второй канал',
    netUnit: (n) => `${plural(n, 'живой разговор', 'живых разговора', 'живых разговоров')} с инженерами в Европе`,
    netLine: (r, a) =>
      `Одно число намеренно. Это разговоры, а не лиды: ни имён, ни поимённого учёта, ни воронки, ни конверсии. Пока они вычеркнули из списка две компании и принесли ${r} ${plural(r, 'реферал', 'реферала', 'рефералов')}, и ни одного не пришлось просить. ${a} ${plural(a, 'отклик', 'отклика', 'откликов')} не принесли ни одного.`,
    metaRole: 'Роль',
    metaTarget: 'Цель',
    updated: 'Обновлено',
    checked: 'сверено с первоисточниками',
    back: '← onezee.dev',
  },
};

const fmt = (iso: string, lang: Locale) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric', month: 'short', timeZone: 'UTC',
  });

const EV_ORDER: (keyof LogDay)[] = ['applied', 'invites', 'acc', 'reply', 'msg', 'ref'];

export const JobHuntPage: React.FC<{ lang: Locale }> = ({ lang }) => {
  const t = COPY[lang];
  const { meta, headline, ladder, channels, outcomes, timeline, gap, log, network, visa, method } = jobHunt;
  const max = ladder[0].n;

  // timeline positions on a real, evenly-scaled date axis
  const t0 = Date.parse(timeline[0].date);
  const t1 = Date.parse(timeline[timeline.length - 1].date);
  const at = (d: string) => ((Date.parse(d) - t0) / (t1 - t0)) * 100;

  return (
    <div className="jh content">
      <header className="jh__head section reveal">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="jh__hero">{t.hero(headline.calls, headline.applied)}</h1>
        <p className="jh__thesis">{meta.thesis[lang]}</p>

        <dl className="jh__meta">
          <div><dt>{t.metaRole}</dt><dd>{meta.role}</dd></div>
          <div><dt>{t.metaTarget}</dt><dd>{meta.target}</dd></div>
        </dl>

        <div className="jh__cards">
          {[
            { v: `${headline.calls}`, l: t.tiles.calls, sub: headline.callRatePct !== null ? pct(headline.callRatePct) : null },
            { v: `${stage('call2')}`, l: t.tiles.second, sub: null },
            { v: `${stage('offer')}`, l: t.tiles.offers, sub: null, accent: true },
            { v: `${outcomes.awaiting}`, l: t.tiles.awaiting, sub: null },
          ].map((c) => (
            <div className={`jh__card${c.accent ? ' jh__card--accent' : ''}`} key={c.l}>
              <span className="jh__card-val">{c.v}</span>
              <span className="jh__card-lbl">{c.l}</span>
              {c.sub && <span className="jh__card-sub">{c.sub}</span>}
            </div>
          ))}
        </div>
      </header>

      {/* The one chart that earns its place: the collapse from 44 to 0. */}
      <section className="section reveal">
        <p className="eyebrow">{t.ladderTitle}</p>
        <p className="jh__hint jh__hint--block">{t.ladderHint}</p>
        <ul className="jh__ladder">
          {ladder.map((s) => {
            const w = (s.n / max) * 100;
            return (
              <li className="jh__step" key={s.key} title={`${t.stages[s.key]}: ${s.n}`}>
                <span className="jh__step-lbl">{t.stages[s.key]}</span>
                <span className="jh__step-track">
                  {s.n > 0
                    ? <span className="jh__step-fill" style={{ width: `${Math.max(w, 1.2)}%` }} />
                    : <span className="jh__step-zero" aria-hidden="true" />}
                </span>
                <span className={`jh__step-n${s.n === 0 ? ' jh__step-n--zero' : ''}`}>{s.n}</span>
              </li>
            );
          })}
        </ul>
        <p className="jh__note">{t.outcomeLine(outcomes.rejected, outcomes.awaiting)}</p>
        <p className="jh__note">{t.channelsLine(channels.hh, channels.boards, channels.referral)}</p>
      </section>

      {/* Three real points on a real axis. The emptiness is the message. */}
      <section className="section reveal">
        <p className="eyebrow">{t.timelineTitle}</p>
        <div className="jh__tl">
          <span className="jh__tl-axis" aria-hidden="true" />
          <span
            className="jh__tl-gap"
            style={{ left: `${at(gap.from)}%`, width: `${at(gap.to) - at(gap.from)}%` }}
            aria-hidden="true"
          />
          {timeline.map((p, i) => (
            // 2 and 5 June sit three days apart on a 92-day axis. Dots stay at true
            // positions; labels alternate above/below so they cannot collide.
            <span
              className={
                'jh__tl-pt' +
                (i % 2 ? ' jh__tl-pt--up' : '') +
                (i === 0 ? ' jh__tl-pt--first' : '') +
                (i === timeline.length - 1 ? ' jh__tl-pt--last' : '')
              }
              key={p.date}
              style={{ left: `${at(p.date)}%` }}
            >
              <span className="jh__tl-dot" />
              <span className="jh__tl-v">{p.applied}</span>
              <span className="jh__tl-d">{fmt(p.date, lang)}</span>
            </span>
          ))}
        </div>
        <p className="jh__note">{t.gapLine(weeksBetween(gap.from, gap.to))}</p>
      </section>

      {/* A log, not a chart: seven days is a journal, not a trend. */}
      <section className="section reveal">
        <p className="eyebrow">{t.logTitle}</p>
        <p className="jh__hint jh__hint--block">{t.logHint}</p>
        <ul className="jh__log">
          {[...log].reverse().map((d) => (
            <li className="jh__log-row" key={d.date}>
              <span className="jh__log-d">{fmt(d.date, lang)}</span>
              <span className="jh__log-ev">
                {EV_ORDER.filter((k) => d[k]).map((k) => (
                  <span className="jh__chip" key={k}>
                    <b>{d[k]}</b> {t.ev[k as string](d[k] as number)}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section reveal">
        <p className="eyebrow">{t.netTitle}</p>
        <div className="jh__net">
          <span className="jh__net-val">{network.conversations}</span>
          <span className="jh__net-lbl">{t.netUnit(network.conversations)}</span>
        </div>
        <p className="jh__note">{t.netLine(network.referralOffers, headline.applied)}</p>
      </section>

      <section className="section reveal">
        <p className="eyebrow">{visa.title[lang]}</p>
        <p className="jh__visa-intro">{visa.intro[lang]}</p>
        <ul className="jh__visa">
          {visa.points.map((p) => <li key={p.en}>{p[lang]}</li>)}
        </ul>
        <p className="jh__visa-src">
          {visa.sourcesLabel[lang]}: {visa.sources} · {t.checked} {fmt(visa.checkedAt, lang)}
        </p>
      </section>

      <section className="section reveal">
        <p className="eyebrow">{method.title[lang]}</p>
        <ul className="jh__method">
          {method.points.map((p) => <li key={p.en}>{p[lang]}</li>)}
        </ul>
      </section>

      <footer className="jh__foot reveal">
        <p className="jh__updated">{t.updated} {fmt(meta.updated, lang)}</p>
        <a className="ilink ilink--sm" href={lang === 'ru' ? '/ru/' : '/'}>{t.back}</a>
      </footer>
    </div>
  );
};

export default JobHuntPage;
