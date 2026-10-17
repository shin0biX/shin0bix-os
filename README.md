# shin0biX OS

**Interactive personal portfolio** — a browser-based desktop built as a tiny operating system.

```console
shin0biX@portfolio:~$ whoami
ujjawal jain — full-stack developer · security learner
```

shin0biX OS renders the portfolio of **Ujjawal Jain (shin0biX)** as a futuristic
developer workstation instead of a conventional page. It boots, gives you a
desktop, and lets you explore projects, a terminal and a security lab the way
you'd explore a real machine.

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
│   └── Contact.jsx      # CONTACT
└── data/
    ├── projects.js      # project content (edit me)
    └── resume.js        # resume content (edit me)
```

## Customization

- **Projects** live in `src/data/projects.js` — add an entry and it appears in
  both the explorer and the terminal's `projects` command.
- **Resume** content lives in `src/data/resume.js`.
- **Branding strings** (titles, boot text, prompt) are centralized in
  `src/registry.js`, `src/components/BootScreen.jsx` and `src/components/Chrome.jsx`.
- **Theme tokens** (colors, glow, radius) live at the top of `src/index.css`.

## Deploy

The build is fully static (`base: "./"`), so `dist/` can be served anywhere:

- **GitHub Pages** — push `dist/` to a `gh-pages` branch (or use an action).
- **Netlify / Vercel / Cloudflare Pages** — build command `npm run build`,
  output directory `dist`.
- **Own server** — copy `dist/` behind nginx, e.g. as a new
  `ujjawalcodes.site` subdomain.

## License

[MIT](./LICENSE) © 2026 Ujjawal Jain
