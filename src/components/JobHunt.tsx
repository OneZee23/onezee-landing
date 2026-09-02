import React from 'react';
import { useSite } from '../i18n/context';
import { Reveal } from './Reveal';
import { Icon } from './Icon';
import { jobHunt, stage } from '../content/job-hunt';

// Compact homepage teaser for the public funnel. Numbers come straight from the
// shared job-hunt data; the full page lives at /job-hunt (+ /ru/job-hunt).
export const JobHunt: React.FC = () => {
  const { c, lang } = useSite();
  const h = jobHunt.headline;
  const href = lang === 'ru' ? '/ru/job-hunt' : '/job-hunt';
  const stats = [
    { v: h.calls, l: c.jobHunt.calls },
    { v: h.applied, l: c.jobHunt.applied },
    { v: stage('offer'), l: c.jobHunt.offers },
  ];
  return (
    <section className="section" id="job-hunt">
      <Reveal>
        <p className="eyebrow">{c.jobHunt.title}</p>
        <p className="jh-mini__lead">{c.jobHunt.lead}</p>
        <div className="jh-mini">
          {stats.map((s) => (
            <div className="jh-mini__stat" key={s.l}>
              <span className="jh-mini__val">{s.v}</span>
              <span className="jh-mini__lbl">{s.l}</span>
            </div>
          ))}
          <a className="ilink jh-mini__cta" href={href}>
            <span>{c.jobHunt.cta}</span>
            <Icon name="arrow" size={12} className="ilink__arrow" />
          </a>
        </div>
      </Reveal>
    </section>
  );
};
