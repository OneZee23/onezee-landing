import React from 'react';
import type { Locale } from '../content/site';
import {
  jobHunt,
  metrics,
  stageTotal,
  stageByKey,
  depthFunnel,
  pct,
  CHANNEL_KEYS,
} from '../content/job-hunt';

// Static, no-hydration page (rendered to HTML at build time, like the homepage).
// Reveal handled by the global IntersectionObserver in BaseLayout (.reveal class).

type Copy = {
  eyebrow: string;
  title: string;
  intro: string;
  stats: { applied: string; calls: string; offers: string; reject: string };
  funnelTitle: string;
  funnelHint: string;
  th: { stage: string; total: string };
  pendingHint: string;
  depthTitle: string;
  depthHint: string;
  netConversations: string;
  benchTitle: string;
  benchIntro: string;
  benchApplied: string;
  benchOffer: string;
  benchMonths: string;
  takeaway: string;
  trendTitle: string;
  trendCols: { date: string; applied: string; interviews: string; offers: string };
  metaRole: string;
  metaTarget: string;
  metaStarted: string;
  updated: string;
  checked: string;
  disclaimer: string;
  back: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    eyebrow: 'Job hunt — in the open',
    title: 'How the market actually behaves',
    intro:
      "I'm looking for my next senior backend role and tracking the real funnel here, updated as it moves. No spin — aggregate numbers, honest about the zeros. The point is to see how far today's market sits from the comfortable myth that good engineers just get snapped up.",
    stats: { applied: 'Applied', calls: 'First calls', offers: 'Offers', reject: 'Reject rate' },
    funnelTitle: 'The application funnel, by channel',
    funnelHint: 'Summer 2026 — closed and reconciled.',
    th: { stage: 'Stage', total: 'Total' },
    pendingHint: 'still in flight — a subset of “applied”, no answer yet',
    depthTitle: 'How far applications get',
    depthHint: 'Share of applications that reached each stage.',
    netConversations: 'real conversations with engineers in Europe',
    benchTitle: 'Market vs. reality',
    benchIntro: 'For scale, a friend who searched recently:',
    benchApplied: 'applications',
    benchOffer: 'offer',
    benchMonths: '~6 months of searching',
    takeaway:
      'The pattern so far is the same on both sides: cold applications convert near zero, and the few real conversations came through warm intros. So that’s where the effort goes now.',
    trendTitle: 'Over time',
    trendCols: { date: 'Date', applied: 'Applied', interviews: 'First calls', offers: 'Offers' },
    metaRole: 'Role',
    metaTarget: 'Target',
    metaStarted: 'Started',
    updated: 'Updated',
    checked: 'Checked against primary sources on',
    disclaimer:
      'Aggregate only — no company names, no salaries, no names of people I talk to. Honest numbers, including the zeros.',
    back: '← onezee.dev',
  },
  ru: {
    eyebrow: 'Поиск работы — в открытую',
    title: 'Как рынок ведёт себя на самом деле',
    intro:
      'Ищу следующую senior backend-роль и веду здесь реальную воронку — обновляется по ходу. Без приукрашивания: агрегированные цифры, честно про нули. Смысл — увидеть, насколько сегодняшний рынок далёк от удобного мифа «хорошего инженера сразу разбирают».',
    stats: { applied: 'Подано', calls: 'Первых созвонов', offers: 'Офферов', reject: 'Доля отказов' },
    funnelTitle: 'Воронка откликов по каналам',
    funnelHint: 'Лето 2026 — закрыто и сверено.',
    th: { stage: 'Этап', total: 'Итого' },
    pendingHint: 'ещё в процессе — часть «подано», ответа пока нет',
    depthTitle: 'Докуда доходят отклики',
    depthHint: 'Доля откликов, дошедших до каждого этапа.',
    netConversations: 'живых разговоров с инженерами в Европе',
    benchTitle: 'Рынок против реальности',
    benchIntro: 'Для масштаба — знакомый, искавший недавно:',
    benchApplied: 'откликов',
    benchOffer: 'оффер',
    benchMonths: '~6 месяцев поиска',
    takeaway:
      'Картина пока одинаковая с обеих сторон: холодные отклики конвертят почти в ноль, а немногие живые разговоры пришли через тёплые интро. Туда теперь и уходит усилие.',
    trendTitle: 'В динамике',
    trendCols: { date: 'Дата', applied: 'Подано', interviews: 'Первых созвонов', offers: 'Офферы' },
    metaRole: 'Роль',
    metaTarget: 'Цель',
    metaStarted: 'Старт',
    updated: 'Обновлено',
    checked: 'Сверено с первоисточниками',
    disclaimer:
      'Только агрегат — без названий компаний, зарплат и имён людей, с которыми я говорю. Честные цифры, включая нули.',
    back: '← onezee.dev',
  },
};

const fmtDate = (iso: string, lang: Locale): string =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });

export const JobHuntPage: React.FC<{ lang: Locale }> = ({ lang }) => {
  const t = COPY[lang];
  const m = metrics();
  const { meta, phase, funnel, network, visa, benchmark, snapshots } = jobHunt;
  const appliedTotal = stageTotal(stageByKey('applied')!);
  const depth = depthFunnel();

  const statCards = [
    { value: String(m.applied), label: t.stats.applied },
    { value: String(m.firstCalls), label: t.stats.calls },
    { value: String(m.offers), label: t.stats.offers, accent: m.offers === 0 },
    { value: pct(m.rejectRate), label: t.stats.reject },
  ];

  return (
    <div className="jh content">
      {/* Header + headline metrics */}
      <header className="jh__head section reveal">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="jh__title">{t.title}</h1>
        <p className="jh__intro">{t.intro}</p>

        <dl className="jh__meta">
          <div><dt>{t.metaRole}</dt><dd>{meta.role}</dd></div>
          <div><dt>{t.metaTarget}</dt><dd>{meta.target}</dd></div>
          <div><dt>{t.metaStarted}</dt><dd>{fmtDate(meta.startDate, lang)}</dd></div>
        </dl>

        <div className="jh__cards">
          {statCards.map((c) => (
            <div className={`jh__card${c.accent ? ' jh__card--accent' : ''}`} key={c.label}>
              <span className="jh__card-val">{c.value}</span>
              <span className="jh__card-lbl">{c.label}</span>
            </div>
          ))}
        </div>

        <p className="jh__metric">{meta.metric[lang]}</p>
      </header>

      {/* Current phase */}
      <section className="section reveal">
        <p className="eyebrow">{phase.label[lang]}</p>
        <p className="jh__phase">{phase.note[lang]}</p>
      </section>

      {/* Funnel by channel */}
      <section className="section reveal">
        <p className="eyebrow">{t.funnelTitle}</p>
        <p className="jh__hint jh__hint--block">{t.funnelHint}</p>
        <table className="jh__table">
          <thead>
            <tr>
              <th>{t.th.stage}</th>
              {meta.channels.map((ch) => <th key={ch.key} className="jh__num">{ch.label}</th>)}
              <th className="jh__num">{t.th.total}</th>
            </tr>
          </thead>
          <tbody>
            {funnel.map((s) => (
              <tr
                key={s.key}
                className={
                  (s.note ? 'jh__row--note ' : '') + (s.terminal ? 'jh__row--term' : '')
                }
              >
                <th scope="row">{s.label[lang]}</th>
                {CHANNEL_KEYS.map((k) => (
                  <td key={k} className="jh__num">{s.counts[k] || <span className="jh__zero">0</span>}</td>
                ))}
                <td className="jh__num jh__num--total">{stageTotal(s)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="jh__note">
          <b>{stageByKey('pending')?.label[lang]}</b> — {t.pendingHint}
        </p>
      </section>

      {/* Depth funnel bars */}
      <section className="section reveal">
        <p className="eyebrow">{t.depthTitle}</p>
        <p className="jh__hint jh__hint--block">{t.depthHint}</p>
        <ul className="jh__bars">
          {depth.map((s) => {
            const n = stageTotal(s);
            const w = appliedTotal ? Math.max((n / appliedTotal) * 100, n > 0 ? 4 : 0) : 0;
            return (
              <li className="jh__bar" key={s.key}>
                <span className="jh__bar-lbl">{s.label[lang]}</span>
                <span className="jh__bar-track">
                  <span className="jh__bar-fill" style={{ width: `${w}%` }} />
                </span>
                <span className="jh__bar-val">{n}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* The other channel — aggregate reach, deliberately not a funnel */}
      <section className="section reveal">
        <p className="eyebrow">{network.label[lang]}</p>
        <p className="jh__net-lead">{network.why[lang]}</p>
        <div className="jh__net">
          <div className="jh__net-item">
            <span className="jh__net-val">{network.conversations}</span>
            <span className="jh__net-lbl">{t.netConversations}</span>
          </div>
        </div>
        <p className="jh__note">{network.note[lang]}</p>
      </section>

      {/* What hiring me involves — the objection, answered before it is raised */}
      <section className="section reveal">
        <p className="eyebrow">{visa.title[lang]}</p>
        <p className="jh__visa-intro">{visa.intro[lang]}</p>
        <ul className="jh__visa">
          {visa.points.map((p) => (
            <li key={p.en}>{p[lang]}</li>
          ))}
        </ul>
        <p className="jh__visa-src">
          {visa.sourcesLabel[lang]}: {visa.sources} · {t.checked} {fmtDate(visa.checkedAt, lang)}
        </p>
      </section>

      {/* Market vs reality — only once the people behind the numbers have said yes */}
      {benchmark.show && (
        <section className="section reveal">
          <p className="eyebrow">{t.benchTitle}</p>
          <p className="jh__bench-intro">{t.benchIntro}</p>
          <p className="jh__bench-line">
            <strong>{benchmark.applied}</strong> {t.benchApplied}
            <span className="jh__arrow"> → </span>
            <strong>{benchmark.offers}</strong> {t.benchOffer}
            <span className="jh__bench-months"> · {t.benchMonths}</span>
          </p>
          <p className="jh__bench-profile">{benchmark.profile[lang]}{' '}{benchmark.via[lang]}</p>
          <p className="jh__takeaway">{t.takeaway}</p>
        </section>
      )}

      {/* Trend over time */}
      {snapshots.length > 1 && (
        <section className="section reveal">
          <p className="eyebrow">{t.trendTitle}</p>
          <table className="jh__table jh__table--trend">
            <thead>
              <tr>
                <th>{t.trendCols.date}</th>
                <th className="jh__num">{t.trendCols.applied}</th>
                <th className="jh__num">{t.trendCols.interviews}</th>
                <th className="jh__num">{t.trendCols.offers}</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((s) => (
                <tr key={s.date}>
                  <th scope="row">{fmtDate(s.date, lang)}</th>
                  <td className="jh__num">{s.applied}</td>
                  <td className="jh__num">{s.interviews}</td>
                  <td className="jh__num">{s.offer || <span className="jh__zero">0</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <footer className="jh__foot reveal">
        <p className="jh__disclaimer">{t.disclaimer}</p>
        <p className="jh__updated">{t.updated} {fmtDate(meta.updated, lang)}</p>
        <a className="ilink ilink--sm" href={lang === 'ru' ? '/ru/' : '/'}>{t.back}</a>
      </footer>
    </div>
  );
};

export default JobHuntPage;
