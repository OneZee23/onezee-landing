import React from 'react';
import type { Locale } from '../content/site';

/** EN · RU toggle. Links to the other locale's homepage. */
export const LangSwitch: React.FC<{ lang: Locale }> = ({ lang }) => (
  <nav className="langswitch" aria-label="Language">
    <a className={`langswitch__opt${lang === 'en' ? ' is-active' : ''}`} href="/" hrefLang="en" aria-current={lang === 'en' ? 'true' : undefined}>
      EN
    </a>
    <span className="langswitch__sep" aria-hidden="true">·</span>
    <a className={`langswitch__opt${lang === 'ru' ? ' is-active' : ''}`} href="/ru/" hrefLang="ru" aria-current={lang === 'ru' ? 'true' : undefined}>
      RU
    </a>
  </nav>
);
