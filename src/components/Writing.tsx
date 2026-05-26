import React from 'react';
import { writing } from '../data';
import { Icon } from './Icon';
import { Reveal } from './Reveal';

export const Writing: React.FC = () => (
  <section className="section" id="writing">
    <Reveal>
      <p className="eyebrow">I write</p>
      <p className="prose">
        I write about backend, web3 and the messy reality of shipping indie apps — on Habr and in
        my Telegram channel.
      </p>
      <div className="hero__links">
        {writing.map((w) => (
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
