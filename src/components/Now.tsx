import React from 'react';
import { now } from '../data';
import { Reveal } from './Reveal';

export const Now: React.FC = () => (
  <section className="section" id="now">
    <Reveal>
      <p className="eyebrow">Now</p>
      <ul className="bullets">
        {now.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </Reveal>
  </section>
);
