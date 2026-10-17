import { Fragment, useMemo, useState } from "react";
import { useContent, STATUS_LABELS } from "../content.jsx";
import { useOS } from "../context.js";

const prettyUrl = (url) => String(url || "").replace(/^https?:\/\//, "").replace(/\/$/, "");

function Card({ p }) {
  return (
    <article className="card">
      <header>
        <h3>{p.name}</h3>
        <span className={`badge badge--${p.status}`}>{STATUS_LABELS[p.status] || p.status}</span>
      </header>
      <p className="card__tag">{p.tagline}</p>
      <p className="card__desc">{p.description}</p>
      <div className="chips">
        {(p.stack || []).map((s) => (
          <span key={s} className="chip">
            {s}
          </span>
        ))}
      </div>
      <footer className="card__links">
        {p.live && (
          <a className="btn btn--xs btn--acid" href={p.live} target="_blank" rel="noreferrer">
            live demo ↗
          </a>
        )}
        {p.repo && (
          <a className="btn btn--xs" href={p.repo} target="_blank" rel="noreferrer">
            source ↗
          </a>
        )}
      </footer>
    </article>
  );
}

function Readme({ openApp, projects, identity }) {
  const featured = useMemo(() => {
    const fullStack = projects.filter((p) => p.cat === "full-stack");
    return (fullStack.length ? fullStack : projects).slice(0, 3);
  }, [projects]);

  return (
    <div className="readme">
      <h2>README.md</h2>
      <p>
        Hi, I'm <span className="mono-acid">{identity.alias}</span> — {identity.name}, a
        developer who likes building full-stack products and studying how to break them.
      </p>
      {featured.length > 0 && (
        <>
          <p>Feature projects, in production:</p>
          <ul>
            {featured.map((p) => (
              <li key={p.id}>
                <b>{p.name}</b> — {p.tagline}
                {p.live ? `, live on ${prettyUrl(p.live)}` : ""}
              </li>
            ))}
          </ul>
        </>
      )}
      <p>
        The rest of the tree holds learning-tier builds. More from the terminal:{" "}
        <span className="mono-acid">projects</span>.
      </p>
      <button className="btn" onClick={() => openApp("terminal")}>
        Open terminal
      </button>
    </div>
  );
}

export default function Projects() {
  const { openApp } = useOS();
  const { content } = useContent();
  const PROJECTS = content.projects;
  const [sel, setSel] = useState("all");

  const cats = useMemo(
    () => [...new Set(PROJECTS.map((p) => p.cat).filter(Boolean))],
    [PROJECTS]
  );

  const filtered = useMemo(() => {
    if (sel === "readme") return [];
    if (sel === "all") return PROJECTS;
    if (cats.includes(sel)) return PROJECTS.filter((p) => p.cat === sel);
    return PROJECTS.filter((p) => p.id === sel);
  }, [sel, PROJECTS, cats]);

  const nodeCls = (id, child) =>
    "proj__node" +
    (sel === id ? " proj__node--active" : "") +
    (child ? " proj__node--child" : "");

  const heading =
    sel === "all"
      ? "~/projects"
      : sel === "readme"
        ? "README.md"
        : PROJECTS.find((p) => p.id === sel)?.name || sel + "/";

  return (
    <div className="proj">
      <aside className="proj__side">
        <div className="proj__root">
          ~/<b>projects</b>
        </div>
        <ul className="proj__tree">
          <li>
            <button className={nodeCls("all")} onClick={() => setSel("all")}>
              <span className="glyph">▾</span> all/
            </button>
          </li>
          {cats.map((cat) => (
            <Fragment key={cat}>
              <li>
                <button className={nodeCls(cat)} onClick={() => setSel(cat)}>
                  <span className="glyph">▾</span> {cat}/
                </button>
              </li>
              {PROJECTS.filter((p) => p.cat === cat).map((p) => (
                <li key={p.id}>
                  <button className={nodeCls(p.id, true)} onClick={() => setSel(p.id)}>
                    <span className="glyph">·</span> {p.name}
                  </button>
                </li>
              ))}
            </Fragment>
          ))}
          <li>
            <button className={nodeCls("readme")} onClick={() => setSel("readme")}>
              <span className="glyph">#</span> README.md
            </button>
          </li>
        </ul>
      </aside>

      <div className="proj__main">
        {sel === "readme" ? (
          <Readme openApp={openApp} projects={PROJECTS} identity={content.identity} />
        ) : (
          <>
            <div className="proj__head">
              <h2>{heading}</h2>
              <span className="proj__count">
                {filtered.length} project{filtered.length === 1 ? "" : "s"}
              </span>
            </div>
            {filtered.length === 0 ? (
              <p className="proj__empty">
                No projects yet — open <b>Admin</b> in the dock to add your first one.
              </p>
            ) : (
              <div className="proj__grid">
                {filtered.map((p) => (
                  <Card key={p.id} p={p} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
