import { useEffect, useMemo, useRef, useState } from "react";
import { useContent } from "../content.jsx";

function Recon() {
  const [target, setTarget] = useState("10.10.14.42");
  const [lines, setLines] = useState([]);
  const [scanning, setScanning] = useState(false);
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };
  useEffect(() => clearTimers, []);

  const scanFor = (t) => [
    { k: "head", t: `$ shin0biX-scan -sV ${t}` },
    { k: "head", t: `starting scan against ${t}` },
    { k: "head", t: "" },
    { k: "head", t: "PORT      STATE   SERVICE" },
    { k: "ok", t: "22/tcp    open    ssh          OpenSSH 9.6 (protocol 2.0)" },
    { k: "ok", t: "80/tcp    open    http         nginx 1.24" },
    { k: "ok", t: "443/tcp   open    https        tls 1.3" },
    { k: "ok", t: "3000/tcp  open    node         shin0biX OS dev server" },
    { k: "ok", t: "6379/tcp  open    redis        auth required" },
    { k: "dim", t: "5432/tcp  closed  postgresql" },
    { k: "ok", t: "8080/tcp  open    http-proxy" },
    { k: "head", t: "" },
    { k: "ok", t: `scan complete — 6 services up on ${t}` },
  ];

  const start = () => {
    if (scanning) return;
    clearTimers();
    setLines([]);
    setScanning(true);
    const all = scanFor(target.trim() || "10.10.14.42");
    timersRef.current = all.map((line, i) =>
      setTimeout(() => {
        setLines((ls) => [...ls, line]);
        if (i === all.length - 1) setScanning(false);
      }, 170 * i)
    );
  };

  return (
    <div className="sec__panel">
      <div className="sec__row">
        <input
          className="input"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="target (e.g. 10.10.14.42)"
          aria-label="Scan target"
          onKeyDown={(e) => e.key === "Enter" && start()}
        />
        <button className="btn btn--acid" onClick={start} disabled={scanning}>
          {scanning ? "scanning…" : "Run scan"}
        </button>
      </div>
      <div className="termbox" aria-live="polite">
        {lines.length === 0 && <div className="termbox__line termbox__line--head">$ ready — pick a target and run the scan</div>}
        {lines.map((l, i) => (
          <div key={i} className={`termbox__line termbox__line--${l.k === "ok" ? "ok" : "head"}`}>
            {l.t}
          </div>
        ))}
      </div>
      <p className="sec__hint">
        simulated output — no packets leave your browser. keep it ethical: only scan what's
        yours to scan.
      </p>
    </div>
  );
}

function Challenge() {
  const { content } = useContent();
  const FLAG = content.security.flag;
  const TOKEN = useMemo(() => {
    const raw = `shin0biX OS :: lab unlocked :: flag ${FLAG}`;
    try {
      return btoa(raw);
    } catch {
      // non-Latin1 characters — encode UTF-8 bytes first
      return btoa(String.fromCharCode(...new TextEncoder().encode(raw)));
    }
  }, [FLAG]);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState(false);
  const [dec, setDec] = useState("");
  const [decOut, setDecOut] = useState("");

  const decode = () => {
    try {
      setDecOut(atob(dec.trim()) || "(empty)");
    } catch {
      setDecOut("not valid base64 — check for missing padding");
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const ok = answer.trim().toUpperCase() === FLAG.toUpperCase();
    setStatus(ok ? "right" : "wrong");
    if (!ok) setAttempts((a) => a + 1);
  };

  return (
    <div className="sec__panel">
      <p className="sec__hint" style={{ fontSize: "12.5px" }}>
        The lab dumped an encoded token. Decode it, submit the flag, and prove you belong in
        the terminal.
      </p>
      <div className="token">{TOKEN}</div>
      <form className="sec__row" onSubmit={submit}>
        <input
          className="input"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="the flag, please"
          aria-label="Flag answer"
        />
        <button className="btn btn--acid" type="submit">
          Submit
        </button>
        <button className="btn" type="button" onClick={() => setHint((h) => !h)}>
          {hint ? "hide hint" : "hint"}
        </button>
      </form>
      {hint && (
        <p className="sec__hint">
          it's Base64. paste the token into the field below and hit decode — or cheat with{" "}
          <span className="mono-acid">base64 -d</span> in a real terminal.
        </p>
      )}
      <div className="sec__row">
        <input
          className="input"
          value={dec}
          onChange={(e) => setDec(e.target.value)}
          placeholder="lab tool: paste anything to base64-decode it"
          aria-label="Base64 decoder input"
        />
        <button className="btn" type="button" onClick={decode}>
          Decode
        </button>
      </div>
      {decOut && <div className="token" style={{ color: "var(--text)", borderStyle: "solid" }}>{decOut}</div>}
      {status === "wrong" && (
        <p className="sec__hint" style={{ color: "var(--danger)" }}>
          nope — keep digging. attempts: {attempts}
        </p>
      )}
      {status === "right" && (
        <div className="sec__success">
          <div className="flag">{FLAG}</div>
          <p className="sec__hint">
            access granted, operator. +50 respect points. maybe try{" "}
            <span className="mono-acid">sudo</span> in the terminal anyway.
          </p>
        </div>
      )}
    </div>
  );
}

function Skills() {
  const { content } = useContent();
  const SKILLS = content.security.skills || [];
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setArmed(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="sec__panel">
      <div className="skills">
        {SKILLS.map((s) => (
          <div key={s.label}>
            <div className="skill__top">
              <b>{s.label}</b>
              <span className="skill__pct">{s.level}%</span>
            </div>
            <div className="skill__bar">
              <i style={{ width: armed ? `${s.level}%` : "0%" }} />
            </div>
            <p className="skill__note">{s.note}</p>
          </div>
        ))}
      </div>
      <p className="sec__hint">
        self-assessment of lab practice and coursework — numbers go up with time, not claims.
      </p>
    </div>
  );
}

export default function SecurityLab() {
  const [tab, setTab] = useState("recon");
  const tabsRef = useRef(null);
  const tabs = [
    ["recon", "01 · recon"],
    ["challenge", "02 · challenge"],
    ["skills", "03 · skills"],
  ];
  const onTabKey = (e) => {
    const ids = tabs.map(([id]) => id);
    const i = ids.indexOf(tab);
    let next = null;
    if (e.key === "ArrowRight") next = ids[(i + 1) % ids.length];
    else if (e.key === "ArrowLeft") next = ids[(i - 1 + ids.length) % ids.length];
    else if (e.key === "Home") next = ids[0];
    else if (e.key === "End") next = ids[ids.length - 1];
    if (!next) return;
    e.preventDefault();
    setTab(next);
    tabsRef.current?.querySelector(`[data-tab="${next}"]`)?.focus();
  };
  return (
    <div className="sec">
      <div className="sec__tabs" role="tablist" ref={tabsRef} onKeyDown={onTabKey}>
        {tabs.map(([id, label]) => (
          <button
            key={id}
            data-tab={id}
            id={`sec-tab-${id}`}
            role="tab"
            aria-selected={tab === id}
            aria-controls="sec-panel"
            tabIndex={tab === id ? 0 : -1}
            className={"sec__tab" + (tab === id ? " sec__tab--active" : "")}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="sec-panel" aria-labelledby={`sec-tab-${tab}`}>
        {tab === "recon" && <Recon />}
        {tab === "challenge" && <Challenge />}
        {tab === "skills" && <Skills />}
      </div>
    </div>
  );
}
