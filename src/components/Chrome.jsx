import { useEffect, useState } from "react";
import { APP_DEFS, DESKTOP_ICONS, DOCK_APPS } from "../registry.js";
import { useOS } from "../context.js";

/* ---------- icons: hand-drawn line set, no icon library ---------- */

const ICONS = {
  welcome: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5 13.9 9.6 20 11.5l-6.1 1.9L12 19.5l-1.9-6.1L4 11.5l6.1-1.9Z" />
      <path d="M19 4v2.6M17.7 5.3h2.6" />
    </svg>
  ),
  terminal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4.5" width="18" height="15" rx="2.2" />
      <path d="m7 9.6 2.9 2.7L7 15" />
      <path d="M12.5 15.2H17" />
    </svg>
  ),
  projects: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7.5a2 2 0 0 1 2-2h3.6l2 2.2H19a2 2 0 0 1 2 2v7.6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M3 11.2h18" />
    </svg>
  ),
  security: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 5 6v5.2c0 4.3 2.9 8.2 7 9.3 4.1-1.1 7-5 7-9.3V6Z" />
      <path d="m9.4 12.4 1.9 1.9 3.5-4" />
    </svg>
  ),
  resume: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3.5h7l5 5V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5v5h5" />
      <path d="M9.5 13h5M9.5 16.5H13" />
    </svg>
  ),
  contact: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3.6" />
      <path d="M15.6 8.4v4.8a2.6 2.6 0 0 0 5.2 0V12A8.8 8.8 0 1 0 17 20.1" />
    </svg>
  ),
};

export function AppIcon({ name }) {
  return (
    <span className="appicon" aria-hidden="true">
      {ICONS[name] || ICONS.welcome}
    </span>
  );
}

/* ---------- background ---------- */

export function Background() {
  return (
    <div className="bg" aria-hidden="true">
      <div className="bg__gradient" />
      <div className="bg__grid" />
      <div className="bg__vignette" />
      <div className="bg__scan" />
    </div>
  );
}

/* ---------- top bar ---------- */

export function TopBar({ onOpen }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(iv);
  }, []);
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <header className="topbar">
      <button
        className="topbar__brand"
        onClick={() => onOpen("welcome")}
        aria-label="Open WELCOME.EXE"
        title="shin0biX OS — v1.0.0"
      >
        <span className="topbar__dot" aria-hidden="true" />
        shin0biX OS
      </button>
      <div className="topbar__meta">
        <span className="topbar__status">
          <i aria-hidden="true" /> online
        </span>
        <span className="topbar__version">v1.0.0</span>
        <span>{time}</span>
      </div>
    </header>
  );
}

/* ---------- desktop icons ---------- */

export function DesktopIcons({ onOpen }) {
  return (
    <div className="dicons">
      {DESKTOP_ICONS.map((app) => (
        <button key={app} className="dicons__item" onClick={() => onOpen(app)}>
          <AppIcon name={APP_DEFS[app].icon} />
          <span>{APP_DEFS[app].label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- dock ---------- */

export function Dock() {
  const { openApp, windows } = useOS();
  return (
    <nav className="dock" aria-label="Dock">
      {DOCK_APPS.map((app) => {
        const def = APP_DEFS[app];
        const isOpen = windows.some((w) => w.app === app);
        return (
          <button
            key={app}
            className={"dock__item" + (isOpen ? " dock__item--open" : "")}
            onClick={() => openApp(app)}
            aria-label={`Open ${def.label}`}
          >
            <AppIcon name={def.icon} />
            <span className="dock__tip">{def.title}</span>
            {isOpen && <span className="dock__dot" aria-hidden="true" />}
          </button>
        );
      })}
    </nav>
  );
}

/* ---------- footer ---------- */

export function Footer() {
  return (
    <footer className="footer">
      <span className="footer__brand">
        <b>shin0biX OS</b> | Personal Workspace
      </span>
      <span className="footer__hint">
        drag windows · type <b>help</b> in the terminal · v1.0.0
      </span>
    </footer>
  );
}
