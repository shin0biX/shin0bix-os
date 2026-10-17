import { useState } from "react";
import { useOS } from "../context.js";
import { useContent } from "../content.jsx";
import { Rich } from "../rich.jsx";

export default function Welcome() {
  const { openApp } = useOS();
  const { content } = useContent();
  const [hide, setHide] = useState(
    () => localStorage.getItem("shin0bixos.welcome.done") === "1"
  );

  const toggleHide = () => {
    const next = !hide;
    setHide(next);
    if (next) localStorage.setItem("shin0bixos.welcome.done", "1");
    else localStorage.removeItem("shin0bixos.welcome.done");
  };

  return (
    <div className="welcome">
      <div>
        <div className="welcome__logo">
          shin0biX <em>OS</em>
        </div>
        <p className="welcome__tag">v1.0.0 — interactive personal workspace</p>
      </div>

      <p className="welcome__text">
        <Rich text={content.welcome.intro} />
      </p>

      <div className="welcome__cta">
        <button className="btn btn--acid" onClick={() => openApp("projects")}>
          Explore projects
        </button>
        <button className="btn" onClick={() => openApp("terminal")}>
          Open terminal
        </button>
        <button className="btn" onClick={() => openApp("contact")}>
          Contact
        </button>
      </div>

      <ul className="welcome__tips">
        {content.welcome.tips.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>

      <label className="welcome__hide">
        <input type="checkbox" checked={hide} onChange={toggleHide} />
        don't auto-open this window on boot
      </label>
    </div>
  );
}
