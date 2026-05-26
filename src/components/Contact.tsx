import React from 'react';
import { socials, languages, legacyYoutube } from '../data';
import { Icon } from './Icon';
import { Reveal } from './Reveal';

export const Contact: React.FC = () => (
  <footer className="contact" id="contact">
    <Reveal>
      <p className="eyebrow">Say hi</p>
      <h2 className="contact__title">Let&apos;s build something that has to stay up.</h2>
      <p className="contact__sub">
        Open to senior backend roles — EU, remote, or a CIS product team (Blue Card eligible for
        the EU). Or just send a message.
      </p>

      <nav className="contact__links" aria-label="Contact">
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

      <p className="contact__meta">{languages}</p>
      <p className="contact__meta contact__meta--dim">
        Open source · built with React, deployed on Kubernetes ·{' '}
        <a href={legacyYoutube} target="_blank" rel="noreferrer noopener">old YouTube</a>
      </p>
    </Reveal>
  </footer>
);
