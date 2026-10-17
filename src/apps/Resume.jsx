import { Fragment } from "react";
import { RESUME } from "../data/resume.js";

export default function Resume() {
  return (
    <div className="resume">
      <div className="resume__head">
        <div className="resume__who">
          <h2>{RESUME.name}</h2>
          <p>{RESUME.role}</p>
          <div className="resume__meta">
            <span>{RESUME.location}</span>
            <a href={`mailto:${RESUME.email}`}>{RESUME.email}</a>
            {RESUME.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            ))}
          </div>
        </div>
        <div className="resume__actions">
          <button className="btn btn--acid btn--xs" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
        </div>
      </div>

      <section>
        <h3>Summary</h3>
        <p>{RESUME.summary}</p>
      </section>

      <section>
        <h3>Highlights</h3>
        <ul>
          {RESUME.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Skills</h3>
        <dl className="skillgrid">
          {RESUME.skillGroups.map((g) => (
            <Fragment key={g.label}>
              <dt>{g.label}</dt>
              <dd>
                {g.items.map((it) => (
                  <span key={it} className="chip">
                    {it}
                  </span>
                ))}
              </dd>
            </Fragment>
          ))}
        </dl>
      </section>

      <section>
        <h3>Education</h3>
        {RESUME.education.map((e) => (
          <div key={e.title} className="edu">
            <b>{e.title}</b>
            <span>{e.meta}</span>
            <em>{e.note}</em>
          </div>
        ))}
      </section>
    </div>
  );
}
