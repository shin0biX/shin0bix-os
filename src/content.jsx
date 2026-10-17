import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import DEFAULT_CONTENT from "./data/content.default.json";

/**
 * Content system — one source of truth for everything editable.
 *
 * Precedence (highest first):
 *   1. localStorage  — edits made in the ADMIN app on this browser
 *   2. content.json  — `public/content.json`, fetched at runtime (edit without rebuilding)
 *   3. bundled default — `src/data/content.default.json` (guaranteed fallback)
 *
 * The ADMIN app writes to (1); export the JSON there and replace
 * `public/content.json` to make edits permanent for every visitor.
 */

const LS_KEY = "shin0bixos.content.v1";

export const STATUS_LABELS = { live: "live", source: "source", wip: "wip" };

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/** Deep-merge `over` onto `base`. Arrays and primitives replace; objects merge. */
export function merge(base, over) {
  if (over === undefined || over === null) return base;
  if (!isObj(base) || !isObj(over)) return over;
  const out = { ...base };
  for (const k of Object.keys(over)) out[k] = merge(base[k], over[k]);
  return out;
}

function readLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isObj(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocal(content) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(content));
  } catch {
    /* storage full or unavailable — edits stay in memory */
  }
}

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [base, setBase] = useState(DEFAULT_CONTENT);
  const [fileLoaded, setFileLoaded] = useState(false);
  const [local, setLocal] = useState(readLocal);

  // runtime content.json: wins over the bundled default, loses to local edits
  useEffect(() => {
    let alive = true;
    fetch("./content.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((json) => {
        if (!alive || !isObj(json)) return;
        setBase(merge(DEFAULT_CONTENT, json));
        setFileLoaded(true);
      })
      .catch(() => {
        /* offline / missing file → bundled default already in place */
      });
    return () => {
      alive = false;
    };
  }, []);

  const content = useMemo(() => merge(base, local), [base, local]);
  const ref = useRef(content);
  ref.current = content;

  /** Apply an editing function to a deep copy of the current content and persist. */
  const update = useCallback((fn) => {
    const next = fn(structuredClone(ref.current));
    setLocal(next);
    writeLocal(next);
  }, []);

  /** Drop local edits — back to content.json / bundled default. */
  const resetToFile = useCallback(() => {
    setLocal(null);
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  /** Replace local state with imported JSON (already-normalised). Returns false on bad input. */
  const importJSON = useCallback((text) => {
    try {
      const parsed = JSON.parse(text);
      if (!isObj(parsed)) return false;
      const next = merge(DEFAULT_CONTENT, parsed);
      setLocal(next);
      writeLocal(next);
      return true;
    } catch {
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({
      content,
      update,
      resetToFile,
      importJSON,
      hasLocalEdits: Boolean(local),
      fileLoaded,
      defaultContent: DEFAULT_CONTENT,
    }),
    [content, update, resetToFile, importJSON, local, fileLoaded]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used inside <ContentProvider>");
  return ctx;
}
