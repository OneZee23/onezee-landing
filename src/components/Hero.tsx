import React from 'react';
import { heroLead, heroSub, socials, resumeUrl } from '../data';
import { Portrait } from './Portrait';
import { Icon } from './Icon';

export const Hero: React.FC = () => (
  <header className="hero">
    <div className="hero__grid">
      <div className="hero__text">
        <p className="status">
          <span className="status__dot" aria-hidden="true" />
          Open to senior backend roles · EU · remote · CIS
        </p>
        <h1 className="hero__lead">{heroLead}</h1>
        <p className="hero__sub">{heroSub}</p>
        <nav className="hero__links" aria-label="Profiles">
          <a className="ilink ilink--cv" href={resumeUrl} target="_blank" rel="noreferrer noopener">
            <span>Résumé (PDF)</span>
            <Icon name="arrow" size={13} className="ilink__arrow" />
          </a>
          {socials.map((s) => (
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
