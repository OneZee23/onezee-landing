import React from 'react';
import { useSite } from '../i18n/context';
import { Icon } from './Icon';
import { Reveal } from './Reveal';

export const Writing: React.FC = () => {
  const { c } = useSite();
  return (
    <section className="section" id="writing">
      <Reveal>
        <p className="eyebrow">{c.writing.title}</p>
        <p className="prose">{c.writing.prose}</p>
        <div className="hero__links">
          <a className="ilink ilink--cv" href="/blog">
            <span>{c.writing.cta}</span>
            <Icon name="arrow" size={13} className="ilink__arrow" />
          </a>
          {c.writing.links.map((w) => (
            <a
              key={w.kind + w.url}
              className="ilink"
              href={w.url}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Icon name={w.kind} size={16} />
              <span>{w.label}</span>
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  );
};
