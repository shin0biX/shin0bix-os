# shin0biX OS

**Interactive personal portfolio** — a browser-based desktop built as a tiny operating system.

```console
shin0biX@portfolio:~$ whoami
ujjawal jain — full-stack developer · security learner
```

shin0biX OS renders the portfolio of **Ujjawal Jain (shin0biX)** as a futuristic
developer workstation instead of a conventional page. It boots, gives you a
desktop, and lets you explore projects, a terminal and a security lab the way
you'd explore a real machine. It also works as a reusable portfolio template —
every piece of personal content lives in `public/content.json`, editable through
the built-in **ADMIN** app ([Make it yours](#make-it-yours)).

---

## Brand reference

| Element          | Value                              |
| ---------------- | ---------------------------------- |
| Desktop logo     | `shin0biX OS`                      |
| Terminal prompt  | `shin0biX@portfolio:~$`            |
| Boot screen      | `INITIALIZING shin0biX OS...`      |
| Welcome window   | `WELCOME.EXE`                      |
| Terminal window  | `shin0biX — zsh`                   |
| System footer    | `shin0biX OS | Personal Workspace` |
| Version          | `v1.0.0`                           |

> Always use the exact capitalization **shin0biX OS** — in the UI, metadata,
> browser title, boot animation and documentation.

Visual identity: deep black & graphite surfaces, acid-green highlights
(`#9fff3d`), subtle cyan accents (`#46e6ff`), terminal typography and
cinematic animations. Stealthy, technical, minimal — ninja-inspired, no clichés.

## Features

- **Boot sequence** — typed kernel log, progress bar, skippable with a click.
- **Interactive desktop** — draggable windows with focus management,
  minimize / maximize / close, cascade positioning.
- **Dock** — app launcher with hover magnification and open-window indicators.
- **Terminal** (`shin0biX — zsh`) — `help`, `whoami`, `ls`, `cat`, `open`,
  `projects`, `social`, `neofetch`, `banner`, `matrix`, `sudo`, `reboot`,
  `exit` and shell history with ↑/↓.
- **Project explorer** — file-tree UI over real projects (Meetly, StoriX,
  Shorty and the learning tier), with live links.
- **Security lab** — simulated recon, a Base64 challenge, and a skill map.
- **WELCOME.EXE** — first-boot welcome window with quick actions.
- **RESUME.PDF** — printable resume view (use *Print / Save as PDF*).
- **CONTACT** — mailto-based message form, copy-email, links.
- **ADMIN** — built-in content manager: add / edit / delete projects, resume,
  terminal files, welcome & contact copy and lab content, with live preview,
  JSON export / import and reset. Ships as a reusable template — see
  [Make it yours](#make-it-yours).
- **Responsive** — the desktop folds into a mobile shell on small screens.
- **Animations** — springs, staggered reveals, scanlines, drifting grid,
  typewriter boot — all respectful of `prefers-reduced-motion`.

## Stack

React 19 · Vite 8 · Framer Motion 14 · hand-crafted CSS (no UI kit).
Fonts: [JetBrains Mono](https://www.jetbrains.com/lp/mono/).

## Quickstart

```bash
npm install
npm run dev      # http://localhost:5175
npm run build    # production build → dist/
npm run preview  # serve the build locally
```

## Project structure

```
src/
├── App.jsx              # OS shell: boot state + window manager
├── registry.js          # app definitions (titles, sizes, icons)
├── context.js           # OS context (openApp, closeApp, …)
├── content.jsx          # content store (content.json + ADMIN edits)
├── rich.jsx             # tiny **bold** / `code` renderer for editable text
├── components/
│   ├── BootScreen.jsx   # INITIALIZING shin0biX OS...
│   ├── Chrome.jsx       # background, top bar, dock, footer, icons
│   └── Window.jsx       # draggable window chrome
├── apps/
│   ├── Welcome.jsx      # WELCOME.EXE
│   ├── Terminal.jsx     # shin0biX — zsh
│   ├── Projects.jsx     # project explorer
│   ├── SecurityLab.jsx  # recon · challenge · skills
│   ├── Resume.jsx       # RESUME.PDF
│   ├── Contact.jsx      # CONTACT
│   └── Admin.jsx        # content manager (ADMIN)
└── data/
    └── content.default.json  # bundled fallback content
public/
└── content.json         # ← the one file that holds all your content
```

## Make it yours

Everything personal — projects, resume, terminal files, welcome and contact
text, the security lab — comes from one file: **`public/content.json`**. The app
reads it at runtime, so content can change without touching code.

**1 · ADMIN app (no code).** Open **ADMIN** from the dock (`?app=admin`).
Add / edit / delete anything; changes preview live in every app and are saved
in your browser. To publish: **Data → Export content.json**, replace
`public/content.json` in the repo with the download, commit, redeploy.
`Import` loads an existing `content.json`; `Reset to file` discards local
edits.

**2 · Edit the file directly.** `public/content.json` is plain JSON — you can
even edit it from the GitHub web editor:

```jsonc
{
  "identity": { "name": "…", "alias": "…", "role": "…", "location": "…",
                "email": "…", "github": "…", "website": "…" },
  "welcome":  { "intro": "… **bold** and `code` supported …",
                "tips": ["…"] },
  "terminal": { "whoami": "…", "about": ["line 1", "…"], "skills": ["…"] },
  "contact":  { "lead": "…" },
  "projects": [{ "id": "slug", "name": "…", "cat": "full-stack",
                 "status": "live|source|wip", "tagline": "…",
                 "description": "…", "stack": ["…"],
                 "live": "https://…", "repo": "https://…" }],
  "security": { "flag": "PREFIX{your_flag}", "skills": [
                 { "label": "…", "level": 72, "note": "…" }] },
  "resume":   { "links": [{ "label": "…", "href": "…" }], "summary": "…",
                "highlights": ["…"],
                "skillGroups": [{ "label": "…", "items": ["…"] }],
                "education": [{ "title": "…", "meta": "…", "note": "…" }] }
}
```

Precedence: browser edits (ADMIN) → `public/content.json` → bundled
`src/data/content.default.json` (a fallback so the app works offline and can
never render empty). Category names in `projects[].cat` group the explorer's
tree automatically — add a new category string and it appears as its own
folder.

**Brand chrome** — the OS name, boot text, prompt and dock labels — lives in
`src/registry.js`, `src/components/BootScreen.jsx` and
`src/components/Chrome.jsx`; swap strings there to rebrand the shell itself.

## Tests

An end-to-end suite runs the real app in a real browser (`puppeteer-core`
driving an installed Chrome / Brave — no browser download): boot sequence,
window management (drag / focus / minimize / maximize / close), dock, terminal
commands and history, deep links, project explorer, security lab, forms, the
ADMIN content manager (add / edit / delete / persistence / reset), mobile
layout, keyboard access and console cleanliness.

```bash
npm run dev        # terminal 1 — http://localhost:5175
npm run e2e        # terminal 2 — exits non-zero if any check fails
```

`CHROME_PATH` overrides browser auto-detection; `BASE` points the suite at a
different URL (e.g. `BASE=http://localhost:4175 npm run e2e` against
`npm run preview`).

## Deploy

The build is fully static (`base: "./"`), so `dist/` can be served anywhere:

- **GitHub Pages** — push `dist/` to a `gh-pages` branch (or use an action).
- **Netlify / Vercel / Cloudflare Pages** — build command `npm run build`,
  output directory `dist`.
- **Own server** — copy `dist/` behind nginx, e.g. as a new
  `ujjawalcodes.site` subdomain.

## License

[MIT](./LICENSE) © 2026 Ujjawal Jain
