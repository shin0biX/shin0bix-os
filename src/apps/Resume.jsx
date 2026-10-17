import { Fragment } from "react";
import { useContent } from "../content.jsx";

export default function Resume() {
  const { content } = useContent();
  const id = content.identity;
  const R = content.resume;

  return (
    <div className="resume">
      <div className="resume__head">
        <div className="resume__who">
          <h2>{id.name}</h2>
          <p>{id.role}</p>
          <div className="resume__meta">
            <span>{id.location}</span>
            <a href={`mailto:${id.email}`}>{id.email}</a>
            {R.links.map((l) => (
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
        <p>{R.summary}</p>
      </section>

      <section>
        <h3>Highlights</h3>
        <ul>
          {R.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Skills</h3>
        <dl className="skillgrid">
          {R.skillGroups.map((g) => (
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
        {R.education.map((e) => (
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
