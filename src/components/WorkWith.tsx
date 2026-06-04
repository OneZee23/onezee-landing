import React from 'react';
import { useSite } from '../i18n/context';
import { Reveal } from './Reveal';

export const WorkWith: React.FC = () => {
  const { c } = useSite();
  return (
    <section className="section" id="skills">
      <Reveal>
        <p className="eyebrow">{c.skills.title}</p>
        <dl className="stacklist">
          {c.skills.groups.map((g) => (
            <div className="stacklist__row" key={g.title}>
              <dt className="stacklist__label">{g.title}</dt>
              <dd className="stacklist__items">{g.items.join('  ·  ')}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
};
