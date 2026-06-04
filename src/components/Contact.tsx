import React from 'react';
import { legacyYoutube } from '../data';
import { useSite } from '../i18n/context';
import { Icon } from './Icon';
import { Reveal } from './Reveal';

export const Contact: React.FC = () => {
  const { c } = useSite();
  return (
    <footer className="contact" id="contact">
      <Reveal>
        <p className="eyebrow">{c.contact.title}</p>
        <h2 className="contact__title">{c.contact.heading}</h2>
        <p className="contact__sub">{c.contact.sub}</p>

        <nav className="contact__links" aria-label="Contact">
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

        <p className="contact__meta">{c.contact.languages}</p>
        <p className="contact__meta contact__meta--dim">
          {c.contact.ossMeta} ·{' '}
          <a href={legacyYoutube} target="_blank" rel="noreferrer noopener">{c.contact.oldYoutube}</a>
        </p>
      </Reveal>
    </footer>
  );
};
