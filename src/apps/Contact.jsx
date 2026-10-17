import { useState } from "react";

const EMAIL = "ujjwalfromkosi@gmail.com";

export default function Contact() {
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
      <p className="contact__lead">
        Got a project, an internship, or a security question? The fastest line is email — or
        drop a message below and your mail client does the rest.
      </p>

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
        <a
          className="contact__link"
          href="https://github.com/shin0biX"
          target="_blank"
          rel="noreferrer"
        >
          <span className="glyph">→</span> <b>GitHub</b>{" "}
          <span className="t-muted">github.com/shin0biX</span>
        </a>
        <a className="contact__link" href={`mailto:${EMAIL}`}>
          <span className="glyph">→</span> <b>Email</b> <span className="t-muted">{EMAIL}</span>
        </a>
        <a
          className="contact__link"
          href="https://ujjawalcodes.site"
          target="_blank"
          rel="noreferrer"
        >
          <span className="glyph">→</span> <b>Website</b>{" "}
          <span className="t-muted">ujjawalcodes.site</span>
        </a>
      </div>
    </div>
  );
}
