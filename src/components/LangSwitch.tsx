import React from 'react';
import type { Locale } from '../content/site';

/** EN · RU glass segmented control. Links to the other locale's matching page
 *  (defaults to the homepages); the sliding pill marks the active language. */
export const LangSwitch: React.FC<{ lang: Locale; enHref?: string; ruHref?: string }> = ({
  lang,
  enHref = '/',
  ruHref = '/ru/',
}) => (
  <nav className={`langswitch langswitch--${lang}`} aria-label="Language">
    <span className="langswitch__pill" aria-hidden="true" />
    <a
      className={`langswitch__opt${lang === 'en' ? ' is-active' : ''}`}
      href={enHref}
      hrefLang="en"
      aria-current={lang === 'en' ? 'true' : undefined}
    >
      EN
    </a>
    <a
      className={`langswitch__opt${lang === 'ru' ? ' is-active' : ''}`}
      href={ruHref}
      hrefLang="ru"
      aria-current={lang === 'ru' ? 'true' : undefined}
    >
      RU
    </a>
  </nav>
);
