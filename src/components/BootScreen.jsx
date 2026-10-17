import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

const LINES = [
  "[  OK  ] loading kernel modules",
  "[  OK  ] mounting /dev/projects",
  "[  OK  ] starting window manager",
  "[  OK  ] initializing security lab",
  "[  OK  ] calibrating acid-green accent",
  "[  OK  ] welcome service ready",
];

const LINE_MS = 230;
const BAR_MS = 950;

export default function BootScreen({ onDone }) {
  const reduced = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const total = reduced ? 600 : 450 + LINES.length * LINE_MS + BAR_MS + 350;
  const [count, setCount] = useState(0);
  const [pct, setPct] = useState(reduced ? 100 : 0);
  const [finishing, setFinishing] = useState(false);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    if (reduced) {
      const t = setTimeout(finish, 600);
      return () => clearTimeout(t);
    }
    const timers = LINES.map((_, i) => setTimeout(() => setCount(i + 1), 450 + i * LINE_MS));
    timers.push(setTimeout(() => setFinishing(true), total - 350));
    const bar = setInterval(() => setPct((p) => Math.min(100, p + (100 * 50) / total)), 50);
    timers.push(setTimeout(finish, total));
    const onKey = () => finish();
    window.addEventListener("keydown", onKey);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(bar);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, total]);

  return (
    <motion.div
      className="boot"
      onClick={finish}
      role="region"
      aria-label="shin0biX OS — boot sequence"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45 } }}
    >
      <div className="boot__log">
        <div className="boot__line boot__line--muted">shin0biX bootloader v1.0.0</div>
        {LINES.slice(0, count).map((line) => (
          <div key={line} className="boot__line">
            {line}
          </div>
        ))}
      </div>
      <div className="boot__center">
        <div className="boot__logo">
          shin0biX <em>OS</em>
        </div>
        <div className="boot__status">
          {finishing ? "LAUNCHING WORKSPACE..." : "INITIALIZING shin0biX OS..."}
        </div>
        <div className="boot__bar">
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="boot__hint">click anywhere to skip</div>
      </div>
    </motion.div>
  );
}
