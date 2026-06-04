import React from 'react';
import { Hero } from './components/Hero';
import { Now } from './components/Now';
import { Shipped } from './components/Shipped';
import { DayJob } from './components/DayJob';
import { WorkWith } from './components/WorkWith';
import { Writing } from './components/Writing';
import { Contact } from './components/Contact';
import { LangSwitch } from './components/LangSwitch';
import { SiteContext } from './i18n/context';
import { SITE, type Locale } from './content/site';

const App: React.FC<{ lang?: Locale }> = ({ lang = 'en' }) => (
  <SiteContext.Provider value={{ c: SITE[lang], lang }}>
    <LangSwitch lang={lang} />
    <div className="page">
      <Hero />
      <main className="content">
        <Now />
        <Shipped />
        <DayJob />
        <WorkWith />
        <Writing />
      </main>
      <Contact />
    </div>
  </SiteContext.Provider>
);

export default App;
