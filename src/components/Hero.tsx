import React from 'react';
import { useSite } from '../i18n/context';
import { Portrait } from './Portrait';
import { Icon } from './Icon';

export const Hero: React.FC = () => {
  const { c, lang } = useSite();
  return (
    <header className="hero">
      <div className="hero__grid">
        <div className="hero__text">
          <p className="status">
            <span className="status__dot" aria-hidden="true" />
            {c.hero.status}
          </p>
          <h1 className="hero__lead">{c.hero.lead}</h1>
          <p className="hero__sub">{c.hero.sub}</p>
          <nav className="hero__links" aria-label="Profiles">
            <a className="ilink ilink--cv" href="/blog">
              <span>{c.hero.blog}</span>
              <Icon name="arrow" size={13} className="ilink__arrow" />
            </a>
            <a className="ilink ilink--cv" href={lang === 'ru' ? '/ru/job-hunt' : '/job-hunt'}>
              <span>{c.hero.jobHunt}</span>
              <Icon name="arrow" size={13} className="ilink__arrow" />
            </a>
            <a className="ilink ilink--cv" href={c.resumeUrl} target="_blank" rel="noreferrer noopener">
              <span>{c.hero.resume}</span>
              <Icon name="arrow" size={13} className="ilink__arrow" />
            </a>
            {c.socials.map((s) => (
              <a
                key={s.kind + s.url}
                className="ilink"
                href={s.url}
                target={s.kind === 'email' ? undefined : '_blank'}
                rel="noreferrer noopener"
              >
                <Icon name={s.kind} size={16} />
                <span>{s.label}</span>
              </a>
            ))}
          </nav>
        </div>
        <div className="hero__portrait">
          <Portrait />
        </div>
      </div>
    </header>
  );
};
