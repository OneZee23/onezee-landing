import React from 'react';
import { skillGroups } from '../data';
import { Reveal } from './Reveal';

export const WorkWith: React.FC = () => (
  <section className="section" id="skills">
    <Reveal>
      <p className="eyebrow">I work with</p>
      <dl className="stacklist">
        {skillGroups.map((g) => (
          <div className="stacklist__row" key={g.title}>
            <dt className="stacklist__label">{g.title}</dt>
            <dd className="stacklist__items">{g.items.join('  ·  ')}</dd>
          </div>
        ))}
      </dl>
    </Reveal>
  </section>
);
