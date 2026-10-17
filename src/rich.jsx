/**
 * Tiny inline rich text for editable strings:
 *   **bold**  →  <b>
 *   `code`    →  <span class="mono-acid">
 * Everything else renders as plain text.
 */
export function Rich({ text }) {
  const parts = String(text ?? "").split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) return <b key={i}>{p.slice(2, -2)}</b>;
        if (p.startsWith("`") && p.endsWith("`")) return <span key={i} className="mono-acid">{p.slice(1, -1)}</span>;
        return p;
      })}
    </>
  );
}
