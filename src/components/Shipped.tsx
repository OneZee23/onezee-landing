import React from 'react';
import { shipped } from '../data';
import { Icon } from './Icon';
import { ProjectIcon } from './ProjectIcon';
import { Reveal } from './Reveal';

export const Shipped: React.FC = () => (
  <section className="section" id="shipped">
    <p className="eyebrow">Shipped</p>
    <div className="feed" role="list">
      {shipped.map((s, i) => (
        <Reveal
          key={s.name}
          delay={i * 50}
          className={`feed__item${s.archived ? ' feed__item--archived' : ''}`}
        >
          <div className="feed__year">{s.year}</div>
          <div className="feed__body">
            <ProjectIcon src={s.icon} name={s.name} href={s.links[0]?.url} />
            <h3 className="feed__name">{s.name}</h3>
            <p className="feed__blurb">{s.blurb}</p>
            {s.links.length > 0 && (
              <div className="feed__links">
                {s.links.map((l) => (
                  <a
                    key={l.kind + l.url}
                    className="ilink ilink--sm"
                    href={l.url}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <Icon name={l.kind} size={14} />
                    <span>{l.label}</span>
                    <Icon name="arrow" size={12} className="ilink__arrow" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      ))}
    </div>
  </section>
);
