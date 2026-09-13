import React from 'react';
import type { Locale } from '../content/site';
import { bucketDays, type Grain, jobHunt, stage, pct, plural, daySpan, type LogDay } from '../content/job-hunt';

// Static, no hydration. Every figure comes from src/data/job-hunt.json, which is generated.

const N: React.FC<{ v: number }> = ({ v }) => <b>{v}</b>;

/**
 * One logged day, as sentences. Chips were unreadable to a first-time visitor:
 * "3 ответа" names an object with no actor and no direction. Grammar carries
 * direction for free, in both languages, and survives a screen reader.
 * Clauses stay independent: on 24 Aug three accepted and three replied, but they
 * may be different people, so never "of whom" / "из них".
 */
function sentences(d: LogDay, lang: Locale): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const ru = lang === 'ru';
  const { applied: a = 0, invites: i = 0, acc = 0, reply = 0, msg = 0, ref = 0, rejected: rej = 0 } = d;

  if (a || i) {
    const parts: React.ReactNode[] = [];
    if (a) parts.push(<><N v={a} /> {ru ? plural(a, 'отклик', 'отклика', 'откликов') : `application${a === 1 ? '' : 's'}`}</>);
    if (i) parts.push(<><N v={i} /> {ru ? `${plural(i, 'приглашение', 'приглашения', 'приглашений')} в LinkedIn` : `LinkedIn connection request${i === 1 ? '' : 's'}`}</>);
    out.push(
      <>{ru ? 'Отправил ' : 'I sent '}{parts[0]}{parts[1] ? <>{ru ? ' и ' : ' and '}{parts[1]}</> : null}.</>
    );
  }
  if (acc) {
    out.push(ru
      ? <>{acc === 1 ? <>Приглашение принял <N v={1} /> человек.</> : <>Приглашение приняли <N v={acc} /> {plural(acc, 'человек', 'человека', 'человек')}.</>}</>
      : <><N v={acc} /> {acc === 1 ? 'person' : 'people'} accepted my connection request.</>);
  }
  if (reply) {
    out.push(ru
      ? <>{reply === 1 ? <>Мне ответил <N v={1} /> человек.</> : <>Мне ответили <N v={reply} /> {plural(reply, 'человек', 'человека', 'человек')}.</>}</>
      : <><N v={reply} /> {reply === 1 ? 'person' : 'people'} replied.</>);
  }
  if (msg) {
    out.push(ru
      ? <>Написал <N v={msg} /> {plural(msg, 'сообщение', 'сообщения', 'сообщений')}.</>
      : <>I sent <N v={msg} /> message{msg === 1 ? '' : 's'}.</>);
  }
  if (ref) {
    out.push(ru
      ? <>{ref === 1 ? 'Один предложил' : <><N v={ref} /> предложили</>} рекомендацию в свою компанию.</>
      : <>{ref === 1 ? 'One' : <N v={ref} />} offered to recommend me at their company.</>);
  }
  // Отказ идёт последним предложением дня: он приходит по чужому решению,
  // а не по моему действию. Без него дни, в которые пришли только отказы,
  // рендерились пустой датой без единой строки.
  if (rej) {
    out.push(ru
      ? <>{rej === 1 ? <>Пришёл <N v={1} /> отказ.</> : <>Пришло <N v={rej} /> {plural(rej, 'отказ', 'отказа', 'отказов')}.</>}</>
      : <><N v={rej} /> rejection{rej === 1 ? '' : 's'} came in.</>);
  }
  return out;
}

type Copy = {
  eyebrow: string;
  hero: (c: number, a: number) => React.ReactNode;
  tiles: { calls: string; second: string; offers: string; awaiting: string };
  ofApplied: string;
  ladderTitle: string;
  ladderHint: string;
  stages: Record<string, string>;
  outcomeLine: (r: number, a: number) => string;
  channelsLine: (hh: number, b: number, r: number) => string;
  noReferralLine: (a: number) => string;
  whenTitle: string;
  whenLead: (early: number, total: number, late: number) => string;
  whenTiles: { by: string; on: string };
  platformsTitle: string;
  platformsCols: { src: string; applied: string; calls: string };
  platformsHint: string;
  platformNames: Record<string, string>;
  chartLegend: { sent: string; got: string };
  grainWords: Record<Grain, { one: string; empty: string }>;
  chartHint: (unit: string, empty: string) => string;
  gapNote: string;
  loggedDays: (n: number) => string;
  logTitle: string;
  logLead: (from: string, to: string) => string;
  netLine: (conv: number, refs: number) => string;
  metaRole: string;
  metaTarget: string;
  updated: string;
  checked: string;
  back: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    eyebrow: 'Job hunt in the open',
    hero: (c, a) => (
      <>
        <span className="jh__hero-n">{c}</span> first call{c === 1 ? '' : 's'} out of{' '}
        <span className="jh__hero-d">{a}</span> application{a === 1 ? '' : 's'}
      </>
    ),
    tiles: { calls: 'Invited to a call', second: 'Second interview', offers: 'Job offers', awaiting: 'No answer yet' },
    ofApplied: 'of applications',
    ladderTitle: 'What happened to the applications',
    ladderHint: 'The rows follow the hiring stages on one shared scale. A zero here is a real zero, not missing data.',
    stages: { applied: 'Applied', call1: 'Invited to a call', call2: 'Second interview', final: 'Final interview', offer: 'Job offer' },
    outcomeLine: (r, a) =>
      `${r} rejections, and that is a minimum: I stopped logging them after 5 June. Another ${a} applications have no answer.`,
    channelsLine: (hh, b, r) =>
      `Where they went: ${hh} to a Russian job board, ${b} to LinkedIn and European sites, ${r} through a personal recommendation.`,
    noReferralLine: (a) => `Not one of those ${a} applications led to a recommendation.`,
    whenTitle: 'When the applications went out',
    whenLead: (e, t, l) => `${e} of the ${t} applications were out by 5 June. The other ${l} have gone out since 1 September.`,
    whenTiles: { by: 'by 5 June', on: 'on 1 September' },
    platformsTitle: 'Where the applications went out',
    platformsCols: { src: 'Source', applied: 'Applied', calls: 'First calls' },
    platformsHint: 'Too early to read anything into this. A reply takes one to three weeks, so a zero here is a lag, not a verdict. I will switch a source off once it has enough applications behind it and still nothing.',
    platformNames: {
      hh: 'hh.ru', getmatch: 'getmatch', greenhouse: 'Company boards (Greenhouse)',
      recruiter: 'Inbound recruiter', referral: 'Referral', linkedin: 'LinkedIn',
      'не записано': 'Not recorded',
    },
    chartLegend: { sent: 'I sent', got: 'came back' },
    grainWords: {
      day: { one: 'day', empty: 'A day with no column is a day with nothing logged.' },
      week: { one: 'week', empty: 'A week with no column is a week with nothing logged.' },
      month: { one: 'month', empty: 'A month with no column is a month with nothing logged.' },
    },
    chartHint: (unit, empty) =>
      `One column per ${unit}. The two rows have separate scales: I sent far more than came back, so a shared scale would flatten the replies to nothing. ${empty}`,
    gapNote: 'Between 5 June and 24 August there are no records at all. I kept applying and stopped writing it down.',
    loggedDays: (n) => `${n} logged day${n === 1 ? '' : 's'}`,
    logTitle: 'Day by day',
    // Derived from the log itself: a hardcoded range goes stale every single day.
    logLead: (from, to) => `${from} to ${to}. Requests, replies and messages are all LinkedIn.`,
    netLine: (c, r) =>
      `${c} conversations in total. In ${r} of them the other person offered to recommend me. I never had to ask.`,
    metaRole: 'Role',
    metaTarget: 'Where',
    updated: 'Updated',
    checked: 'checked against primary sources',
    back: '← onezee.dev',
  },
  ru: {
    eyebrow: 'Поиск работы в открытую',
    hero: (c, a) => (
      <>
        <span className="jh__hero-n">{c}</span>{' '}
        {plural(c, 'первый созвон', 'первых созвона', 'первых созвонов')} из{' '}
        <span className="jh__hero-d">{a}</span> откликов
      </>
    ),
    tiles: { calls: 'Позвали на созвон', second: 'Второе интервью', offers: 'Предложений работы', awaiting: 'Откликов без ответа' },
    ofApplied: 'откликов',
    ladderTitle: 'Что стало с откликами',
    ladderHint: 'Строки идут по порядку отбора, шкала общая. Ноль здесь настоящий, а не пропуск в данных.',
    stages: { applied: 'Отправлено', call1: 'Позвали на созвон', call2: 'Второе интервью', final: 'Финальное интервью', offer: 'Предложение работы' },
    outcomeLine: (r, a) =>
      `${r} отказов, и это минимум: после 5 июня я перестал их записывать. Ещё ${a} откликов без ответа.`,
    channelsLine: (hh, b, r) =>
      `Куда отправлял: ${hh} на российский сайт вакансий, ${b} на LinkedIn и европейские сайты, ${r} по рекомендации знакомого.`,
    noReferralLine: (a) => `Ни один из этих ${a} откликов не привёл к рекомендации.`,
    whenTitle: 'Когда уходили отклики',
    // «с 1 сентября», а не «1 сентября»: отклики уходят каждый день кампании.
    // plural обязателен - число меняется и проходит через 1-4.
    whenLead: (e, t, l) =>
      `К 5 июня было отправлено ${e} ${plural(e, 'отклик', 'отклика', 'откликов')} из ${t}. `
      + `${plural(l, 'Оставшийся', 'Оставшиеся', 'Оставшиеся')} ${l} `
      + `${plural(l, 'ушёл', 'ушли', 'ушли')} с 1 сентября.`,
    whenTiles: { by: 'к 5 июня', on: '1 сентября' },
    platformsTitle: 'Откуда уходили отклики',
    platformsCols: { src: 'Площадка', applied: 'Откликов', calls: 'Первых созвонов' },
    platformsHint: 'Выводов пока никаких. Ответ идёт от одной до трёх недель, поэтому ноль здесь это задержка, а не приговор. Площадку выключу, когда за ней накопится достаточно откликов и всё равно будет пусто.',
    platformNames: {
      hh: 'hh.ru', getmatch: 'getmatch', greenhouse: 'Сайты компаний (Greenhouse)',
      recruiter: 'Входящий рекрутер', referral: 'Реферал', linkedin: 'LinkedIn',
      'не записано': 'Не записано',
    },
    chartLegend: { sent: 'отправил', got: 'пришло в ответ' },
    grainWords: {
      day: { one: 'день', empty: 'День без столбца это день, за который ничего не записано.' },
      week: { one: 'неделя', empty: 'Неделя без столбца это неделя, за которую ничего не записано.' },
      month: { one: 'месяц', empty: 'Месяц без столбца это месяц, за который ничего не записано.' },
    },
    chartHint: (unit, empty) =>
      `Один столбец это ${unit}. У рядов разные шкалы: отправляю я намного больше, чем приходит в ответ, и на общей шкале ответы схлопнулись бы в ничто. ${empty}`,
    gapNote: 'С 5 июня по 24 августа записей нет вообще. Я продолжал откликаться и перестал записывать.',
    loggedDays: (n) => `${n} ${plural(n, 'день', 'дня', 'дней')} с записями`,
    logTitle: 'Что было по дням',
    logLead: (from, to) => `С ${from} по ${to}. Приглашения, ответы и сообщения это LinkedIn.`,
    netLine: (c, r) =>
      `Всего ${c} ${plural(c, 'разговор', 'разговора', 'разговоров')}. В ${r} из них мне сами предложили рекомендацию, просить не пришлось ни разу.`,
    metaRole: 'Специальность',
    metaTarget: 'Куда ищу',
    updated: 'Обновлено',
    checked: 'сверено с первоисточниками',
    back: '← onezee.dev',
  },
};

const MONTHS: Record<Locale, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ru: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
};

/* Полный месяц для текста в предложении: короткая форма в русском несёт свою
   точку («3 сент.»), и рядом с точкой предложения выходит двойная. */
const fmtLong = (iso: string, lang: Locale) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric', month: 'long', timeZone: 'UTC',
  });

const fmt = (iso: string, lang: Locale) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric', month: 'short', timeZone: 'UTC',
  });

export const JobHuntPage: React.FC<{ lang: Locale }> = ({ lang }) => {
  const t = COPY[lang];
  const { meta, headline, ladder, channels, outcomes, timeline, log, network, platforms, visa, method } = jobHunt;
  const max = ladder[0].n;

  // Coverage strip: which days have records. A binary presence encoding cannot be
  // interpolated, so a twelve-week hole is structurally incapable of reading as a value.
  const days = daySpan(meta.startDate, meta.updated);
  const logged = new Set([...timeline.map((p) => p.date), ...log.map((d) => d.date)]);

  // Daily activity: every calendar day from the first logged day to today.
  // A day with no record renders no column at all - never a zero, never interpolated.
  const byDate = new Map(log.map((d) => [d.date, d]));
  const chartDays = daySpan(log[0].date, meta.updated).map((date) => {
    const d = byDate.get(date);
    return {
      date,
      sent: d ? (d.applied ?? 0) + (d.invites ?? 0) + (d.msg ?? 0) : 0,
      got: d ? (d.acc ?? 0) + (d.reply ?? 0) + (d.ref ?? 0) : 0,
    };
  });
  // Static page, no hydration: no day/week/month control to offer, so the grain is
  // resolved here at build time and widens on its own as the search gets longer.
  const { grain, buckets } = bucketDays(chartDays);
  const gw = t.grainWords[grain];
  // A week label has to carry its month: bare day numbers across a month boundary
  // read as noise (15, 22, 29, 6, 13...), and the range in the section subtitle
  // is not enough to decode them.
  const tick = (b: { key: string }) => {
    const mon = MONTHS[lang][Number(b.key.slice(5, 7)) - 1];
    const day = String(Number(b.key.slice(8, 10)));
    return grain === 'month' ? mon : grain === 'week' ? `${day} ${mon}` : day;
  };

  // Один источник и для заголовка «N дней с записями», и для самих строк:
  // иначе счётчик обещает день, которого в списке нет. День без единой фразы
  // отбрасываем - в логе есть события вроде закрытого контакта, которые
  // наружу не идут, и такой день рендерился пустой строкой с одной датой.
  const shownLog = log
    .map((d) => ({ d, said: sentences(d, lang) }))
    .filter(({ said }) => said.length > 0);

  const early = timeline[1].applied;
  const late = headline.applied - early;

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
            { v: headline.calls, l: t.tiles.calls, sub: headline.callRatePct !== null ? `${pct(headline.callRatePct)} ${t.ofApplied}` : null },
            { v: stage('call2'), l: t.tiles.second, sub: null },
            { v: stage('offer'), l: t.tiles.offers, sub: null },
            { v: outcomes.awaiting, l: t.tiles.awaiting, sub: null },
          ].map((c) => (
            <div className="jh__card" key={c.l}>
              <span className={`jh__card-val${c.v === 0 ? ' jh__card-val--zero' : ''}`}>{c.v}</span>
              <span className="jh__card-lbl">{c.l}</span>
              {c.sub && <span className="jh__card-sub">{c.sub}</span>}
            </div>
          ))}
        </div>
      </header>

      {/* The one chart. No tracks: five full-width tubs were 78% of the ink and none of it
          was data. One hairline baseline instead. The input bar is grey, outcomes are accent. */}
      <section className="section reveal">
        <p className="eyebrow">{t.ladderTitle}</p>
        <p className="jh__hint jh__hint--block">{t.ladderHint}</p>
        <div className="jh__ladder">
          {ladder.map((s, i) => (
            <div className={`jh__row${s.n === 0 ? ' jh__row--zero' : ''}`} key={s.key}>
              <span className="jh__row-lbl">{t.stages[s.key]}</span>
              <span className="jh__row-plot">
                {s.n > 0 && (
                  <i
                    className={`jh__bar${i === 0 ? ' jh__bar--ctx' : ''}`}
                    style={{ width: `${(s.n / max) * 100}%` }}
                  />
                )}
                <b className="jh__row-n">{s.n}</b>
              </span>
            </div>
          ))}
        </div>
        <p className="jh__note">{t.outcomeLine(outcomes.rejected, outcomes.awaiting)}</p>
        <p className="jh__note">{t.channelsLine(channels.hh, channels.boards, channels.referral)}</p>
        <p className="jh__note jh__note--strong">{t.noReferralLine(headline.applied)}</p>
      </section>

      {/* Three points on a 93-day axis is not a series. Two numbers say it better,
          and a presence strip shows the hole without ever drawing a value across it. */}
      {/* Table, not a chart: five rows of which four are zero is noise, and with
          fewer than ten applications behind a source a percentage would lie. */}
      <section className="section reveal">
        <p className="eyebrow">{t.platformsTitle}</p>
        <div className="jh__src">
          <div className="jh__src-h">
            <span>{t.platformsCols.src}</span>
            <span>{t.platformsCols.applied}</span>
            <span>{t.platformsCols.calls}</span>
          </div>
          {platforms.map((p) => (
            <div className="jh__src-r" key={p.key}>
              <span>{t.platformNames[p.key] ?? p.key}</span>
              <span>{p.applied}</span>
              <span className={p.call1 === 0 ? 'jh__src-z' : undefined}>{p.call1}</span>
            </div>
          ))}
        </div>
        <p className="jh__note">{t.platformsHint}</p>
      </section>

      <section className="section reveal">
        <p className="eyebrow">{t.whenTitle}</p>
        <p className="jh__lead">{t.whenLead(early, headline.applied, late)}</p>
        <div className="jh__stats">
          <div className="jh__stat">
            <span className="jh__stat-v">{early} / {headline.applied}</span>
            <span className="jh__stat-l">{t.whenTiles.by}</span>
          </div>
          <div className="jh__stat">
            <span className="jh__stat-v">{late}</span>
            <span className="jh__stat-l">{t.whenTiles.on}</span>
          </div>
        </div>
        <p className="jh__note">{t.gapNote}</p>
      </section>

      {/* Sentences, not chips. */}
      <section className="section reveal">
        <p className="eyebrow">{t.logTitle}</p>
        <p className="jh__lead">{t.loggedDays(shownLog.length)}. {t.logLead(fmtLong(shownLog[0].d.date, lang), fmtLong(shownLog[shownLog.length - 1].d.date, lang))}</p>

        {/* Two rows, each on its own scale. Sent peaks at 33, replies at 7: on one shared
            scale the replies collapse into invisible stubs. Small multiples, never a dual axis. */}
        <div className="jh__chart">
          {([
            { key: 'sent' as const, label: t.chartLegend.sent },
            { key: 'got' as const, label: t.chartLegend.got },
          ]).map(({ key, label }) => {
            const rowMax = Math.max(...buckets.map((b) => b[key]));
            return (
              <div className="jh__crow" key={key}>
                <div className="jh__crow-head">
                  <span className={`jh__key jh__key--${key}`} />
                  <span className="jh__crow-lbl">{label}</span>
                  <span className="jh__crow-max">max {rowMax}</span>
                </div>
                <div className="jh__plot">
                  {buckets.map((b) => (
                    <div className="jh__col" key={b.key}>
                      {b[key] > 0 && (
                        <i
                          className={`jh__b jh__b--${key}`}
                          style={{ height: `${(b[key] / rowMax) * 100}%` }}
                          title={`${b.from === b.to ? fmt(b.from, lang) : `${fmt(b.from, lang)} - ${fmt(b.to, lang)}`}: ${label} ${b[key]}`}
                        >
                          <em>{b[key]}</em>
                        </i>
                      )}
                    </div>
                  ))}
                </div>
                <div className="jh__axis">
                  {buckets.map((b) => <span key={b.key}>{b.showLabel ? tick(b) : ''}</span>)}
                </div>
              </div>
            );
          })}
        </div>
        <p className="jh__note">{t.chartHint(gw.one, gw.empty)}</p>
        <div className="jh__log">
          {[...shownLog]
            .reverse()
            .map(({ d, said }) => (
              <div className="jh__log-row" key={d.date}>
                <span className="jh__log-d">{fmt(d.date, lang)}</span>
                <p className="jh__log-t">
                  {said.map((s, i) => <React.Fragment key={i}>{s}{' '}</React.Fragment>)}
                </p>
              </div>
            ))}
        </div>
        <p className="jh__note jh__note--strong">{t.netLine(network.conversations, network.referralOffers)}</p>
      </section>

      <section className="section reveal">
        <p className="eyebrow">{visa.title[lang]}</p>
        <p className="jh__lead">{visa.intro[lang]}</p>
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
