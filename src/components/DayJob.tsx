import React from 'react';
import { useSite } from '../i18n/context';
import { ProjectIcon } from './ProjectIcon';
import { Reveal } from './Reveal';

export const DayJob: React.FC = () => {
  const { c } = useSite();
  const d = c.dayJob;
  return (
    <section className="section" id="work">
      <Reveal>
        <p className="eyebrow">{d.title}</p>
        <div className="dayjob__head">
          <ProjectIcon src={d.icon} name="iMe" href={d.url} />
          <div>
            <p className="dayjob__period">{d.period}</p>
            <h3 className="dayjob__org">
              <a href={d.url} target="_blank" rel="noreferrer noopener">{d.org}</a>
            </h3>
          </div>
        </div>
        <p className="dayjob__lead">{d.lead}</p>
        <ul className="bullets">
          {d.points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
};
