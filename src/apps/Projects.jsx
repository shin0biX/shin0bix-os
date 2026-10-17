import { useMemo, useState } from "react";
import { PROJECTS, STATUS_LABELS } from "../data/projects.js";
import { useOS } from "../context.js";

function Card({ p }) {
  return (
    <article className="card">
      <header>
        <h3>{p.name}</h3>
        <span className={`badge badge--${p.status}`}>{STATUS_LABELS[p.status]}</span>
      </header>
      <p className="card__tag">{p.tagline}</p>
      <p className="card__desc">{p.description}</p>
      <div className="chips">
        {p.stack.map((s) => (
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

function Readme({ openApp }) {
  return (
    <div className="readme">
      <h2>README.md</h2>
      <p>
        Hi, I'm <span className="mono-acid">shin0biX</span> — Ujjawal Jain, a developer who
        likes building full-stack products and studying how to break them.
      </p>
      <p>Feature projects, in production:</p>
      <ul>
        <li>
          <b>Meetly</b> — WebRTC video calls & chat, live on meetly.ujjawalcodes.site
        </li>
        <li>
          <b>StoriX</b> — file-storage platform with versioning, live on files.ujjawalcodes.site
        </li>
        <li>
          <b>Shorty</b> — URL shortener with Redis caching, live on shorty.ujjawalcodes.site
        </li>
      </ul>
      <p>
        The rest of the tree holds learning-tier builds — from flask-blog-app to the Spotify
        Top 100 bot. More from the terminal: <span className="mono-acid">projects</span>.
      </p>
      <button className="btn" onClick={() => openApp("terminal")}>
        Open terminal
      </button>
    </div>
  );
}

export default function Projects() {
  const { openApp } = useOS();
  const [sel, setSel] = useState("all");

  const filtered = useMemo(() => {
    if (sel === "readme") return [];
    if (sel === "all") return PROJECTS;
    if (sel === "full-stack" || sel === "learning")
      return PROJECTS.filter((p) => p.cat === sel);
    return PROJECTS.filter((p) => p.id === sel);
  }, [sel]);

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
          <li>
            <button className={nodeCls("full-stack")} onClick={() => setSel("full-stack")}>
              <span className="glyph">▾</span> full-stack/
            </button>
          </li>
          {PROJECTS.filter((p) => p.cat === "full-stack").map((p) => (
            <li key={p.id}>
              <button className={nodeCls(p.id, true)} onClick={() => setSel(p.id)}>
                <span className="glyph">·</span> {p.name}
              </button>
            </li>
          ))}
          <li>
            <button className={nodeCls("learning")} onClick={() => setSel("learning")}>
              <span className="glyph">▾</span> learning/
            </button>
          </li>
          {PROJECTS.filter((p) => p.cat === "learning").map((p) => (
            <li key={p.id}>
              <button className={nodeCls(p.id, true)} onClick={() => setSel(p.id)}>
                <span className="glyph">·</span> {p.name}
              </button>
            </li>
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
          <Readme openApp={openApp} />
        ) : (
          <>
            <div className="proj__head">
              <h2>{heading}</h2>
              <span className="proj__count">
                {filtered.length} project{filtered.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="proj__grid">
              {filtered.map((p) => (
                <Card key={p.id} p={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
