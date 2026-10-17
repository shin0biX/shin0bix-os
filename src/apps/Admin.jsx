import { useRef, useState } from "react";
import { useContent } from "../content.jsx";

const uid = () => Math.random().toString(36).slice(2, 8);

/* ---------- tiny form primitives (all labelled for a11y) ---------- */

function Field({ label, hint, children, grow }) {
  return (
    <label className={"adm__field" + (grow ? " adm__field--grow" : "")}>
      <span className="adm__label">
        {label}
        {hint && <em>{hint}</em>}
      </span>
      {children}
    </label>
  );
}

const Input = (props) => <input className="input adm__input" {...props} />;
const Area = (props) => <textarea className="input adm__area" rows={3} {...props} />;

function RowButtons({ onUp, onDown, onDelete, deleteTitle }) {
  return (
    <span className="adm__rowbtns">
      <button type="button" className="btn btn--xs" onClick={onUp} title="Move up" aria-label="Move up">↑</button>
      <button type="button" className="btn btn--xs" onClick={onDown} title="Move down" aria-label="Move down">↓</button>
      <button type="button" className="btn btn--xs adm__danger" onClick={onDelete} title={deleteTitle || "Delete"} aria-label="Delete">{deleteTitle || "delete"}</button>
    </span>
  );
}

/* ---------- profile ---------- */

function ProfileSection() {
  const { content, update } = useContent();
  const id = content.identity;
  const set = (k, v) => update((c) => ({ ...c, identity: { ...c.identity, [k]: v } }));
  return (
    <div className="adm__card">
      <h3>Profile</h3>
      <p className="adm__note">Used across the welcome text, contact app, resume header and terminal shortcuts.</p>
      <div className="adm__row">
        <Field label="Name"><Input value={id.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Alias"><Input value={id.alias} onChange={(e) => set("alias", e.target.value)} /></Field>
      </div>
      <div className="adm__row">
        <Field label="Role"><Input value={id.role} onChange={(e) => set("role", e.target.value)} /></Field>
        <Field label="Location"><Input value={id.location} onChange={(e) => set("location", e.target.value)} /></Field>
      </div>
      <div className="adm__row">
        <Field label="Email"><Input type="email" value={id.email} onChange={(e) => set("email", e.target.value)} /></Field>
      </div>
      <div className="adm__row">
        <Field label="GitHub URL"><Input value={id.github} onChange={(e) => set("github", e.target.value)} /></Field>
        <Field label="Website URL"><Input value={id.website} onChange={(e) => set("website", e.target.value)} /></Field>
      </div>
    </div>
  );
}

/* ---------- projects ---------- */

function ProjectsSection() {
  const { content, update } = useContent();
  const ps = content.projects;
  const mut = (fn) => update((c) => ({ ...c, projects: fn(c.projects) }));
  const patch = (i, key, val) => mut((arr) => arr.map((p, j) => (j === i ? { ...p, [key]: val } : p)));
  const del = (i) => mut((arr) => arr.filter((_, j) => j !== i));
  const move = (i, d) =>
    mut((arr) => {
      const n = [...arr];
      const t = i + d;
      if (t < 0 || t >= n.length) return n;
      [n[i], n[t]] = [n[t], n[i]];
      return n;
    });
  const add = () =>
    mut((arr) => [
      ...arr,
      {
        id: `project-${uid()}`,
        name: "New project",
        cat: arr[0]?.cat || "full-stack",
        status: "source",
        tagline: "",
        description: "",
        stack: [],
        live: "",
        repo: "",
      },
    ]);
  const cats = [...new Set(ps.map((p) => p.cat).filter(Boolean))];

  return (
    <>
      <div className="adm__card">
        <h3>
          Projects <span className="adm__count">{ps.length}</span>
        </h3>
        <p className="adm__note">
          Shown in the project explorer and the terminal's <b>projects</b> command. <b>Category</b> groups the
          tree (e.g. full-stack/learning). <b>Status</b> drives the badge: live · source · wip.
        </p>
        <button type="button" className="btn btn--acid btn--xs" onClick={add}>+ Add project</button>
      </div>
      {ps.map((p, i) => (
        <div className="adm__card" key={p.id || i}>
          <div className="adm__row">
            <Field label="Name"><Input value={p.name} onChange={(e) => patch(i, "name", e.target.value)} /></Field>
            <Field label="Category" hint="group in the tree">
              <Input list="adm-cats" value={p.cat} onChange={(e) => patch(i, "cat", e.target.value)} />
            </Field>
            <Field label="Status">
              <select className="input adm__input" value={p.status} onChange={(e) => patch(i, "status", e.target.value)}>
                <option value="live">live</option>
                <option value="source">source</option>
                <option value="wip">wip</option>
              </select>
            </Field>
            <RowButtons onUp={() => move(i, -1)} onDown={() => move(i, 1)} onDelete={() => del(i)} />
          </div>
          <div className="adm__row">
            <Field label="Tagline" grow><Input value={p.tagline} onChange={(e) => patch(i, "tagline", e.target.value)} /></Field>
          </div>
          <div className="adm__row">
            <Field label="Description" grow><Area value={p.description} onChange={(e) => patch(i, "description", e.target.value)} /></Field>
          </div>
          <div className="adm__row">
            <Field label="Stack" hint="comma separated" grow>
              <Input
                value={(p.stack || []).join(", ")}
                onChange={(e) => patch(i, "stack", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              />
            </Field>
          </div>
          <div className="adm__row">
            <Field label="Live URL" hint="optional"><Input value={p.live || ""} onChange={(e) => patch(i, "live", e.target.value)} /></Field>
            <Field label="Repo URL" hint="optional"><Input value={p.repo || ""} onChange={(e) => patch(i, "repo", e.target.value)} /></Field>
          </div>
        </div>
      ))}
      <datalist id="adm-cats">
        {cats.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </>
  );
}

/* ---------- resume ---------- */

function ResumeSection() {
  const { content, update } = useContent();
  const r = content.resume;
  const mut = (fn) => update((c) => ({ ...c, resume: fn(c.resume) }));

  return (
    <>
      <div className="adm__card">
        <h3>Resume — header links</h3>
        <button
          type="button"
          className="btn btn--xs"
          onClick={() => mut((s) => ({ ...s, links: [...s.links, { label: "new link", href: "https://" }] }))}
        >
          + Add link
        </button>
      </div>
      {r.links.map((l, i) => (
        <div className="adm__card" key={i}>
          <div className="adm__row">
            <Field label="Label"><Input value={l.label} onChange={(e) => mut((s) => ({ ...s, links: s.links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) }))} /></Field>
            <Field label="URL" grow><Input value={l.href} onChange={(e) => mut((s) => ({ ...s, links: s.links.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)) }))} /></Field>
            <RowButtons onDelete={() => mut((s) => ({ ...s, links: s.links.filter((_, j) => j !== i) }))} />
          </div>
        </div>
      ))}

      <div className="adm__card">
        <h3>Summary</h3>
        <Area rows={4} value={r.summary} onChange={(e) => mut((s) => ({ ...s, summary: e.target.value }))} aria-label="Resume summary" />
      </div>

      <div className="adm__card">
        <h3>
          Highlights <span className="adm__count">{r.highlights.length}</span>
        </h3>
        <button
          type="button"
          className="btn btn--xs"
          onClick={() => mut((s) => ({ ...s, highlights: [...s.highlights, "new highlight"] }))}
        >
          + Add highlight
        </button>
      </div>
      {r.highlights.map((h, i) => (
        <div className="adm__card" key={i}>
          <div className="adm__row">
            <Field label={`Highlight ${i + 1}`} grow>
              <Area rows={2} value={h} onChange={(e) => mut((s) => ({ ...s, highlights: s.highlights.map((x, j) => (j === i ? e.target.value : x)) }))} />
            </Field>
            <RowButtons onDelete={() => mut((s) => ({ ...s, highlights: s.highlights.filter((_, j) => j !== i) }))} />
          </div>
        </div>
      ))}

      <div className="adm__card">
        <h3>
          Skill groups <span className="adm__count">{r.skillGroups.length}</span>
        </h3>
        <button
          type="button"
          className="btn btn--xs"
          onClick={() => mut((s) => ({ ...s, skillGroups: [...s.skillGroups, { label: "New group", items: [] }] }))}
        >
          + Add group
        </button>
      </div>
      {r.skillGroups.map((g, i) => (
        <div className="adm__card" key={i}>
          <div className="adm__row">
            <Field label="Group label"><Input value={g.label} onChange={(e) => mut((s) => ({ ...s, skillGroups: s.skillGroups.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) }))} /></Field>
            <Field label="Items" hint="comma separated" grow>
              <Input
                value={g.items.join(", ")}
                onChange={(e) => mut((s) => ({ ...s, skillGroups: s.skillGroups.map((x, j) => (j === i ? { ...x, items: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) } : x)) }))}
              />
            </Field>
            <RowButtons onDelete={() => mut((s) => ({ ...s, skillGroups: s.skillGroups.filter((_, j) => j !== i) }))} />
          </div>
        </div>
      ))}

      <div className="adm__card">
        <h3>
          Education <span className="adm__count">{r.education.length}</span>
        </h3>
        <button
          type="button"
          className="btn btn--xs"
          onClick={() => mut((s) => ({ ...s, education: [...s.education, { title: "New entry", meta: "", note: "" }] }))}
        >
          + Add entry
        </button>
      </div>
      {r.education.map((ed, i) => (
        <div className="adm__card" key={i}>
          <div className="adm__row">
            <Field label="Title"><Input value={ed.title} onChange={(e) => mut((s) => ({ ...s, education: s.education.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) }))} /></Field>
            <Field label="Meta"><Input value={ed.meta} onChange={(e) => mut((s) => ({ ...s, education: s.education.map((x, j) => (j === i ? { ...x, meta: e.target.value } : x)) }))} /></Field>
            <RowButtons onDelete={() => mut((s) => ({ ...s, education: s.education.filter((_, j) => j !== i) }))} />
          </div>
          <div className="adm__row">
            <Field label="Note" grow><Area rows={2} value={ed.note} onChange={(e) => mut((s) => ({ ...s, education: s.education.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)) }))} /></Field>
          </div>
        </div>
      ))}
    </>
  );
}

/* ---------- terminal files ---------- */

function TerminalSection() {
  const { content, update } = useContent();
  const t = content.terminal;
  const set = (k, v) => update((c) => ({ ...c, terminal: { ...c.terminal, [k]: v } }));
  const lines = (arr) => arr.join("\n");
  const toLines = (s) => s.split("\n").filter((l) => l.trim().length > 0);
  return (
    <>
      <div className="adm__card">
        <h3>Terminal</h3>
        <p className="adm__note">
          <b>contact.txt</b> and the <b>social</b> / <b>whoami</b> commands are generated from Profile &amp; the whoami line
          below. One file line per row.
        </p>
        <Field label="whoami output" grow>
          <Input value={t.whoami} onChange={(e) => set("whoami", e.target.value)} />
        </Field>
      </div>
      <div className="adm__card">
        <h3>about.txt</h3>
        <Area rows={4} value={lines(t.about)} onChange={(e) => set("about", toLines(e.target.value))} aria-label="about.txt contents" />
      </div>
      <div className="adm__card">
        <h3>skills.txt</h3>
        <Area rows={6} value={lines(t.skills)} onChange={(e) => set("skills", toLines(e.target.value))} aria-label="skills.txt contents" />
      </div>
    </>
  );
}

/* ---------- welcome ---------- */

function WelcomeSection() {
  const { content, update } = useContent();
  const w = content.welcome;
  const mut = (fn) => update((c) => ({ ...c, welcome: fn(c.welcome) }));
  return (
    <>
      <div className="adm__card">
        <h3>Welcome window</h3>
        <p className="adm__note">
          Inline styles: <b>**bold**</b> and <span className="mono-acid">`code`</span>.
        </p>
        <Area rows={4} value={w.intro} onChange={(e) => mut((s) => ({ ...s, intro: e.target.value }))} aria-label="Welcome intro text" />
      </div>
      <div className="adm__card">
        <h3>
          Tips <span className="adm__count">{w.tips.length}</span>
        </h3>
        <button type="button" className="btn btn--xs" onClick={() => mut((s) => ({ ...s, tips: [...s.tips, "new tip"] }))}>
          + Add tip
        </button>
      </div>
      {w.tips.map((tip, i) => (
        <div className="adm__card" key={i}>
          <div className="adm__row">
            <Field label={`Tip ${i + 1}`} grow>
              <Input value={tip} onChange={(e) => mut((s) => ({ ...s, tips: s.tips.map((x, j) => (j === i ? e.target.value : x)) }))} />
            </Field>
            <RowButtons onDelete={() => mut((s) => ({ ...s, tips: s.tips.filter((_, j) => j !== i) }))} />
          </div>
        </div>
      ))}
    </>
  );
}

/* ---------- contact ---------- */

function ContactSection() {
  const { content, update } = useContent();
  return (
    <div className="adm__card">
      <h3>Contact</h3>
      <p className="adm__note">
        The email, GitHub and website on this screen come from <b>Profile</b>. This is the lead paragraph above the form.
      </p>
      <Area rows={4} value={content.contact.lead} onChange={(e) => update((c) => ({ ...c, contact: { ...c.contact, lead: e.target.value } }))} aria-label="Contact lead text" />
    </div>
  );
}

/* ---------- security lab ---------- */

function SecuritySection() {
  const { content, update } = useContent();
  const s = content.security;
  const mut = (fn) => update((c) => ({ ...c, security: fn(c.security) }));
  const patch = (i, key, val) => mut((sec) => ({ ...sec, skills: sec.skills.map((x, j) => (j === i ? { ...x, [key]: val } : x)) }));
  return (
    <>
      <div className="adm__card">
        <h3>Capture-the-flag challenge</h3>
        <p className="adm__note">
          The flag is encoded with Base64 automatically — change it and the challenge updates. Keep the
          {" "}<span className="mono-acid">PREFIX&#123;...&#125;</span> shape if you want it to feel like a flag.
        </p>
        <Field label="Flag" grow>
          <Input value={s.flag} onChange={(e) => mut((sec) => ({ ...sec, flag: e.target.value }))} />
        </Field>
      </div>
      <div className="adm__card">
        <h3>
          Skill bars <span className="adm__count">{s.skills.length}</span>
        </h3>
        <button
          type="button"
          className="btn btn--xs"
          onClick={() => mut((sec) => ({ ...sec, skills: [...sec.skills, { label: "New skill", level: 50, note: "" }] }))}
        >
          + Add skill
        </button>
      </div>
      {s.skills.map((sk, i) => (
        <div className="adm__card" key={i}>
          <div className="adm__row">
            <Field label="Label"><Input value={sk.label} onChange={(e) => patch(i, "label", e.target.value)} /></Field>
            <Field label="Level" hint="0–100">
              <Input
                type="number"
                min="0"
                max="100"
                value={sk.level}
                onChange={(e) => patch(i, "level", Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              />
            </Field>
            <RowButtons onDelete={() => mut((sec) => ({ ...sec, skills: sec.skills.filter((_, j) => j !== i) }))} />
          </div>
          <div className="adm__row">
            <Field label="Note" grow><Input value={sk.note} onChange={(e) => patch(i, "note", e.target.value)} /></Field>
          </div>
        </div>
      ))}
    </>
  );
}

/* ---------- data: save / export / import / reset ---------- */

function DataSection() {
  const { content, resetToFile, importJSON, hasLocalEdits, fileLoaded } = useContent();
  const fileRef = useRef(null);
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "content.json";
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus("content.json downloaded — replace public/content.json in the repo and redeploy.");
  };

  const copyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(content, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setStatus("clipboard unavailable — use Export instead.");
    }
  };

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok = importJSON(await file.text());
    setStatus(ok ? `imported ${file.name}` : "import failed — that file is not valid content JSON.");
    e.target.value = "";
  };

  return (
    <>
      <div className="adm__card">
        <h3>How storage works</h3>
        <ul className="adm__list">
          <li>
            Edits here are saved <b>in this browser</b> (localStorage) and preview live in every app.
          </li>
          <li>
            To publish them for visitors, click <b>Export / Download</b>, replace{" "}
            <span className="mono-acid">public/content.json</span> in the repo, and redeploy.
          </li>
          <li>
            Source in use right now: <b>{hasLocalEdits ? "this browser's edits" : fileLoaded ? "content.json" : "bundled default"}</b>
            {hasLocalEdits ? " (overrides content.json)" : ""}.
          </li>
        </ul>
      </div>
      <div className="adm__card">
        <h3>Data</h3>
        <div className="adm__row adm__btns">
          <button type="button" className="btn btn--acid" onClick={exportJSON}>Export content.json</button>
          <button type="button" className="btn" onClick={copyJSON}>{copied ? "copied ✓" : "Copy JSON"}</button>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>Import JSON…</button>
          <button type="button" className="btn adm__danger" onClick={() => { resetToFile(); setStatus("reset — back to content.json / defaults."); }}>
            Reset to file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={onImport}
            style={{ display: "none" }}
            aria-label="Import content JSON file"
          />
        </div>
        {status && <p className="adm__note">{status}</p>}
      </div>
      <div className="adm__card">
        <h3>Raw JSON preview</h3>
        <pre className="adm__preview" tabIndex={0} aria-label="Raw content JSON preview">{JSON.stringify(content, null, 2)}</pre>
      </div>
    </>
  );
}

/* ---------- shell ---------- */

const SECTIONS = [
  ["profile", "Profile", ProfileSection],
  ["projects", "Projects", ProjectsSection],
  ["resume", "Resume", ResumeSection],
  ["terminal", "Terminal", TerminalSection],
  ["welcome", "Welcome", WelcomeSection],
  ["contact", "Contact", ContactSection],
  ["security", "Security Lab", SecuritySection],
  ["data", "Data", DataSection],
];

export default function Admin() {
  const { hasLocalEdits } = useContent();
  const [tab, setTab] = useState("profile");
  const Active = SECTIONS.find(([id]) => id === tab)[2];
  return (
    <div className="adm">
      <nav className="adm__side" aria-label="Admin sections">
        {SECTIONS.map(([id, label]) => (
          <button
            key={id}
            className={"adm__nav" + (tab === id ? " adm__nav--active" : "")}
            onClick={() => setTab(id)}
            aria-current={tab === id ? "true" : undefined}
          >
            {label}
            {id === "data" && hasLocalEdits && <span className="adm__dot" aria-label="unsaved-to-file edits" />}
          </button>
        ))}
      </nav>
      <div className="adm__main">
        <div className="adm__banner">
          <b>ADMIN</b> · changes preview live and are saved to this browser
          {hasLocalEdits && " · publish via Data → Export"}
        </div>
        <Active />
      </div>
    </div>
  );
}
