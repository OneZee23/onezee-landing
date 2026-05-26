import React from 'react';
import { dayJob } from '../data';
import { ProjectIcon } from './ProjectIcon';
import { Reveal } from './Reveal';

export const DayJob: React.FC = () => (
  <section className="section" id="work">
    <Reveal>
      <p className="eyebrow">The day job</p>
      <div className="dayjob__head">
        <ProjectIcon src={dayJob.icon} name="iMe" href={dayJob.url} />
        <div>
          <p className="dayjob__period">{dayJob.period}</p>
          <h3 className="dayjob__org">
            <a href={dayJob.url} target="_blank" rel="noreferrer noopener">{dayJob.org}</a>
          </h3>
        </div>
      </div>
      <p className="dayjob__lead">{dayJob.lead}</p>
      <ul className="bullets">
        {dayJob.points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </Reveal>
  </section>
);
