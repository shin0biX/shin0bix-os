import { useState } from "react";
import { useOS } from "../context.js";

export default function Welcome() {
  const { openApp } = useOS();
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
        Hey — I'm <b>Ujjawal</b> (<span className="mono-acid">shin0biX</span>). This little
        operating system is my portfolio: poke around the <b>terminal</b>, browse{" "}
        <b>~/projects</b>, try the <b>security lab</b>, or just say hi.
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
        <li>type "help" in the terminal for the full command list</li>
        <li>drag windows by their title bar · double-click to maximize</li>
        <li>run "neofetch" for the system specs</li>
      </ul>

      <label className="welcome__hide">
        <input type="checkbox" checked={hide} onChange={toggleHide} />
        don't auto-open this window on boot
      </label>
    </div>
  );
}
