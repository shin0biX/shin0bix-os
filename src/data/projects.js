/**
 * Project content — used by the explorer AND the terminal (`projects` command).
 * Add an entry and it shows up everywhere. Keep descriptions honest and short.
 */

export const CATEGORIES = [
  { id: "all", label: "all" },
  { id: "full-stack", label: "full-stack/" },
  { id: "learning", label: "learning/" },
];

export const PROJECTS = [
  {
    id: "meetly",
    name: "Meetly",
    cat: "full-stack",
    status: "live",
    tagline: "Real-time video calls & chat.",
    description:
      "WebRTC calling with JWT-authenticated WebSocket signaling, room management and a TURN-backed media pipeline. Built to understand the whole life of a realtime connection.",
    stack: ["FastAPI", "WebRTC", "WebSockets", "SQLite"],
    live: "https://meetly.ujjawalcodes.site",
    repo: "https://github.com/shin0biX/Meetly",
  },
  {
    id: "storix",
    name: "StoriX",
    cat: "full-stack",
    status: "live",
    tagline: "A file-storage platform with opinions.",
    description:
      "Versioning, share links, usage plans and an admin console — a full-stack storage product built with FastAPI and SQLAlchemy, deployed in Docker.",
    stack: ["FastAPI", "SQLAlchemy", "Docker", "SQLite"],
    live: "https://files.ujjawalcodes.site",
    repo: "https://github.com/shin0biX/StoriX",
  },
  {
    id: "shorty",
    name: "Shorty",
    cat: "full-stack",
    status: "live",
    tagline: "URL shortener with superpowers.",
    description:
      "Custom aliases, password-protected links, Redis caching and click analytics, with a React frontend talking to a FastAPI backend.",
    stack: ["FastAPI", "React", "Redis", "SQLite"],
    live: "https://shorty.ujjawalcodes.site",
    repo: "https://github.com/shin0biX/Shorty",
  },
  {
    id: "flask-blog-app",
    name: "flask-blog-app",
    cat: "learning",
    status: "source",
    tagline: "Blog with auth, comments & rich text.",
    description:
      "A full Flask blog — user authentication, comments and sanitized rich-text posts. A deep dive into Flask-Login, WTForms and CKEditor.",
    stack: ["Flask", "SQLAlchemy", "WTForms", "CKEditor"],
    repo: "https://github.com/shin0biX/flask-blog-app",
  },
  {
    id: "fastapi-todo",
    name: "FastAPI-Todo",
    cat: "learning",
    status: "source",
    tagline: "Server-rendered todo app with JWT auth.",
    description:
      "Server-rendered tasks with JWT sessions, an admin panel and Alembic migrations — my first proper database-backed FastAPI application.",
    stack: ["FastAPI", "Jinja2", "Alembic", "SQLite"],
    repo: "https://github.com/shin0biX/FastAPI-Todo",
  },
  {
    id: "password-manager",
    name: "Password Manager",
    cat: "learning",
    status: "source",
    tagline: "Desktop password vault, built while learning.",
    description:
      "A Python + Tkinter desktop password manager with a generator and search — a small project that taught me a lot about plain UI code.",
    stack: ["Python", "Tkinter"],
    repo: "https://github.com/shin0biX/Password-Manger-Tkinter",
  },
  {
    id: "spotify-top-100",
    name: "Spotify Top 100",
    cat: "learning",
    status: "source",
    tagline: "Billboard Hot 100 → your Spotify playlist.",
    description:
      "Scrapes the current Billboard Hot 100 with BeautifulSoup and builds a ready-to-play playlist through Spotipy and the Spotify API.",
    stack: ["Python", "BeautifulSoup", "Spotipy"],
    repo: "https://github.com/shin0biX/Spotify_Top_100",
  },
];

export const STATUS_LABELS = {
  live: "live",
  source: "source",
  wip: "wip",
};

export function projectsByCat(cat) {
  if (!cat || cat === "all") return PROJECTS;
  return PROJECTS.filter((p) => p.cat === cat);
}
