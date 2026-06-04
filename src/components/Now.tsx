import React from 'react';
import { useSite } from '../i18n/context';
import { Reveal } from './Reveal';

export const Now: React.FC = () => {
  const { c } = useSite();
  return (
    <section className="section" id="now">
      <Reveal>
        <p className="eyebrow">{c.now.title}</p>
        <ul className="bullets">
          {c.now.items.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
};
