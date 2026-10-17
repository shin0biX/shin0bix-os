import Welcome from "./apps/Welcome.jsx";
import Terminal from "./apps/Terminal.jsx";
import Projects from "./apps/Projects.jsx";
import SecurityLab from "./apps/SecurityLab.jsx";
import Resume from "./apps/Resume.jsx";
import Contact from "./apps/Contact.jsx";
import Admin from "./apps/Admin.jsx";

/**
 * ADMIN is a local authoring tool, not a public app.
 * It is registered only in development (`npm run dev`) so production builds
 * never ship or expose it — publish content by exporting content.json and
 * committing it. Set to `true` only if you deliberately want the editor
 * inside a deployed build.
 */
const ADMIN_ENABLED = import.meta.env.DEV;

/**
 * App registry — the single source of truth for window titles and sizes.
 * `title` is what shows in the window chrome (keep the brand casing exact).
 */
export const APP_DEFS = {
  welcome: {
    key: "welcome",
    label: "Welcome",
    title: "WELCOME.EXE",
    icon: "welcome",
    w: 640,
    h: 480,
    component: Welcome,
  },
  terminal: {
    key: "terminal",
    label: "Terminal",
    title: "shin0biX — zsh",
    icon: "terminal",
    w: 800,
    h: 520,
    component: Terminal,
  },
  projects: {
    key: "projects",
    label: "Projects",
    title: "PROJECTS — explorer",
    icon: "projects",
    w: 1000,
    h: 640,
    component: Projects,
  },
  security: {
    key: "security",
    label: "Security Lab",
    title: "SECURITY LAB",
    icon: "security",
    w: 920,
    h: 620,
    component: SecurityLab,
  },
  resume: {
    key: "resume",
    label: "Resume",
    title: "RESUME.PDF",
    icon: "resume",
    w: 840,
    h: 680,
    component: Resume,
  },
  contact: {
    key: "contact",
    label: "Contact",
    title: "CONTACT",
    icon: "contact",
    w: 660,
    h: 580,
    component: Contact,
  },
  ...(ADMIN_ENABLED
    ? {
        admin: {
          key: "admin",
          label: "Admin",
          title: "ADMIN — content manager",
          icon: "admin",
          w: 940,
          h: 660,
          component: Admin,
        },
      }
    : {}),
};

export const DOCK_APPS = [
  "terminal",
  "projects",
  "security",
  "resume",
  "contact",
  ...(ADMIN_ENABLED ? ["admin"] : []),
  "welcome",
];

export const DESKTOP_ICONS = ["projects", "terminal", "security", "resume", "contact"];
