import Welcome from "./apps/Welcome.jsx";
import Terminal from "./apps/Terminal.jsx";
import Projects from "./apps/Projects.jsx";
import SecurityLab from "./apps/SecurityLab.jsx";
import Resume from "./apps/Resume.jsx";
import Contact from "./apps/Contact.jsx";

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
};

export const DOCK_APPS = ["terminal", "projects", "security", "resume", "contact", "welcome"];

export const DESKTOP_ICONS = ["projects", "terminal", "security", "resume", "contact"];
