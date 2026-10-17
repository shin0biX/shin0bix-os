import { useEffect, useRef, useState } from "react";
import { useOS } from "../context.js";
import { PROJECTS, STATUS_LABELS } from "../data/projects.js";
import { DOCK_APPS } from "../registry.js";

let uid = 0;
const L = (kind, content) => ({ id: `l${++uid}`, kind, content });

const FILES = {
  "about.txt": () => [
    "ujjawal jain — full-stack developer & security learner.",
    "b.tech CSE student. i build web apps end-to-end and break",
    "them in labs afterwards. this desktop is my portfolio.",
  ],
  "skills.txt": () => [
    "languages   python · javascript · c · c++ · html/css",
    "backend     fastapi · flask · sqlalchemy · alembic · redis",
    "frontend    react · vite · tailwind",
    "infra       linux · git · docker · sqlite · nginx",
    "security    recon · web app sec · linux privesc · AD (learning)",
  ],
  "contact.txt": () => [
    "email     ujjwalfromkosi@gmail.com",
    "github    github.com/shin0biX",
    "web       ujjawalcodes.site",
  ],
};

function bannerBox() {
  const title = "— shin0biX OS —";
  const body = "   >_   personal workspace";
  const w = Math.max(title.length, body.length);
  return ["┌" + title.padEnd(w, "─") + "┐", "│" + body.padEnd(w) + "│", "└" + "─".repeat(w) + "┘"];
}

const makeBanner = () => [
  L("ok", bannerBox().join("\n")),
  L("sys", "shin0biX OS v1.0.0 — personal workspace"),
  L("out", 'type "help" for commands · "neofetch" for specs'),
];

const Prompt = () => (
  <span className="term__prompt">
    <span className="t-user">shin0biX</span>
    <span className="t-muted">@</span>
    <span className="t-host">portfolio</span>
    <span className="t-muted">{":~$ "}</span>
  </span>
);

const HELP = [
  "help              this list",
  "whoami            identity check",
  "ls                list ~",
  "cat <file>        read about.txt / skills.txt / contact.txt",
  "open <app>        projects · security · resume · contact · welcome",
  "projects          project index",
  "social            where to find me",
  "neofetch          system specs",
  "banner            reprint the banner",
  "matrix            follow the white rabbit",
  "clear             wipe the screen",
  "reboot            restart shin0biX OS",
  "exit              close this session",
  "sudo <cmd>        ...go ahead, try it",
];

export default function Terminal() {
  const { openApp, closeApp, reboot, bootedAt } = useOS();
  const [lines, setLines] = useState(makeBanner);
  const [value, setValue] = useState("");
  const histRef = useRef([]);
  const histIdxRef = useRef(-1);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const uptime = () => {
    const s = Math.max(1, Math.floor((Date.now() - (bootedAt || Date.now())) / 1000));
    return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  const neofetch = () => {
    const logo = bannerBox();
    const info = [
      ["OS", "shin0biX OS v1.0.0"],
      ["Host", "Ujjawal Jain (shin0biX)"],
      ["Kernel", "react-19 · vite-8"],
      ["Uptime", uptime()],
      ["Shell", "shin0biX — zsh"],
      ["DE", "acid-desktop"],
      ["Accent", "#9fff3d · #46e6ff"],
      ["Memory", "plenty of projects / endless ideas"],
    ];
    const lw = Math.max(...logo.map((l) => l.length));
    const rows = Math.max(logo.length, info.length);
    const out = [];
    for (let i = 0; i < rows; i++) {
      const left = (logo[i] || "").padEnd(lw);
      const right = info[i] ? `${info[i][0].padEnd(8)}${info[i][1]}` : "";
      out.push((left + "   " + right).trimEnd());
    }
    return out.join("\n");
  };

  const run = (raw) => {
    const [cmd, ...args] = raw.trim().split(/\s+/);
    const out = [];
    const push = (kind, content) => out.push(L(kind, content));

    switch (cmd) {
      case "":
        break;
      case "help":
        push("out", HELP.join("\n"));
        break;
      case "whoami":
        push("ok", "ujjawal jain — full-stack developer · security learner (aka shin0biX)");
        break;
      case "ls":
        push("out", "about.txt   skills.txt   contact.txt   projects/   security-lab/   resume.pdf");
        break;
      case "cat": {
        const file = FILES[args[0]];
        if (!file)
          push("err", `cat: ${args[0] || "?"}: no such file — try about.txt, skills.txt or contact.txt`);
        else push("out", file().join("\n"));
        break;
      }
      case "open": {
        const target = (args[0] || "").toLowerCase();
        if (DOCK_APPS.includes(target)) {
          openApp(target);
          push("ok", `launching ${target}...`);
        } else {
          push("err", `open: unknown app "${args[0] || ""}" — try projects, security, resume, contact, welcome`);
        }
        break;
      }
      case "projects":
        push(
          "out",
          PROJECTS.map(
            (p) => `${p.name.padEnd(20)} ${STATUS_LABELS[p.status].padEnd(7)} ${p.repo}`
          ).join("\n")
        );
        push("sys", "run `open projects` for the full explorer");
        break;
      case "social":
        push(
          "out",
          [
            "github    https://github.com/shin0biX",
            "email     ujjwalfromkosi@gmail.com",
            "web       https://ujjawalcodes.site",
          ].join("\n")
        );
        break;
      case "neofetch":
        push("out", neofetch());
        break;
      case "banner":
        push("ok", bannerBox().join("\n"));
        break;
      case "matrix":
        push("sys", "wake up, operator...");
        push(
          "ok",
          "shin0biX OS"
            .split("")
            .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
            .join(" ")
        );
        break;
      case "clear":
        return { clear: true, out };
      case "reboot":
        push("sys", "rebooting shin0biX OS...");
        setTimeout(reboot, 700);
        break;
      case "exit":
        push("sys", "logout — closing session...");
        setTimeout(() => closeApp("terminal"), 500);
        break;
      case "sudo":
        push("err", "shin0biX is not in the sudoers file. This incident has been reported.");
        break;
      default:
        push("err", `zsh: command not found: ${cmd}`);
        push("sys", 'type "help" to see what this shell can do');
        break;
    }
    return { clear: false, out };
  };

  const submit = (e) => {
    e.preventDefault();
    const raw = value;
    histRef.current = [raw, ...histRef.current].slice(0, 60);
    histIdxRef.current = -1;
    setValue("");
    const { clear, out } = run(raw);
    setLines((ls) => (clear ? [] : [...ls, L("in", <><Prompt />{raw}</>), ...out]));
  };

  const onKeyDown = (e) => {
    const h = histRef.current;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!h.length) return;
      histIdxRef.current = Math.min(histIdxRef.current + 1, h.length - 1);
      setValue(h[histIdxRef.current]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdxRef.current <= 0) {
        histIdxRef.current = -1;
        setValue("");
      } else {
        histIdxRef.current -= 1;
        setValue(h[histIdxRef.current]);
      }
    }
  };

  return (
    <div className="term" onClick={() => inputRef.current?.focus()}>
      <div className="term__scroll" ref={scrollRef}>
        {lines.map((l) => (
          <div key={l.id} className={`term__line term__line--${l.kind}`}>
            {l.content}
          </div>
        ))}
      </div>
      <form className="term__input-row" onSubmit={submit}>
        <Prompt />
        <input
          ref={inputRef}
          className="term__input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoComplete="off"
          aria-label="Terminal input"
          placeholder='type "help"'
        />
      </form>
    </div>
  );
}
