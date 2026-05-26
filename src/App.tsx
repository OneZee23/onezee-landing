import React from 'react';
import { Hero } from './components/Hero';
import { Now } from './components/Now';
import { Shipped } from './components/Shipped';
import { DayJob } from './components/DayJob';
import { WorkWith } from './components/WorkWith';
import { Writing } from './components/Writing';
import { Contact } from './components/Contact';

const App: React.FC = () => (
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
);

export default App;
