import { useState } from "react";
import { useContent } from "../content.jsx";

const pretty = (url) => String(url || "").replace(/^https?:\/\//, "").replace(/\/$/, "");

export default function Contact() {
  const { content } = useContent();
  const id = content.identity;
  const EMAIL = id.email;
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [copied, setCopied] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`shin0biX OS — message from ${form.name || "a visitor"}`);
    const body = encodeURIComponent(
      `${form.message}\n\n— ${form.name || "anonymous"}${form.email ? ` (${form.email})` : ""}`
    );
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="contact">
      <p className="contact__lead">{content.contact.lead}</p>

      <form className="contact__form" onSubmit={submit}>
        <div className="contact__row2">
          <input
            className="input"
            placeholder="your name"
            value={form.name}
            onChange={set("name")}
            aria-label="Your name"
          />
          <input
            className="input"
            type="email"
            placeholder="your email (optional)"
            value={form.email}
            onChange={set("email")}
            aria-label="Your email"
          />
        </div>
        <textarea
          className="input"
          placeholder="message…"
          value={form.message}
          onChange={set("message")}
          required
          aria-label="Message"
        />
        <div className="contact__send">
          <button className="btn btn--acid" type="submit">
            Send message
          </button>
          <button className="btn" type="button" onClick={copy}>
            {copied ? "copied ✓" : "Copy email"}
          </button>
          {copied && <span className="contact__copied">{EMAIL}</span>}
        </div>
        <p className="contact__note">opens your mail client — nothing leaves this page.</p>
      </form>

      <div className="contact__links">
        {id.github && (
          <a className="contact__link" href={id.github} target="_blank" rel="noreferrer">
            <span className="glyph">→</span> <b>GitHub</b>{" "}
            <span className="t-muted">{pretty(id.github)}</span>
          </a>
        )}
        <a className="contact__link" href={`mailto:${EMAIL}`}>
          <span className="glyph">→</span> <b>Email</b> <span className="t-muted">{EMAIL}</span>
        </a>
        {id.website && (
          <a className="contact__link" href={id.website} target="_blank" rel="noreferrer">
            <span className="glyph">→</span> <b>Website</b>{" "}
            <span className="t-muted">{pretty(id.website)}</span>
          </a>
        )}
      </div>
    </div>
  );
}
