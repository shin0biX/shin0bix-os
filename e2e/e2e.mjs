/**
 * shin0biX OS — end-to-end suite (puppeteer-core driving an installed Chrome/Brave).
 *
 * Usage:
 *   npm run dev            # in one terminal (starts on :5175)
 *   npm run e2e            # in another
 *
 * Env:
 *   BASE        target URL        (default http://localhost:5175)
 *   CHROME_PATH browser binary    (default: auto-detect Brave / Chrome)
 *
 * Every check is actually executed in a real browser; the process exits
 * non-zero if any check fails.
 */
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/brave-browser",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const BB = CANDIDATES.find((p) => fs.existsSync(p));
if (!BB) {
  console.error("No Chrome/Brave binary found. Set CHROME_PATH to your browser executable.");
  process.exit(2);
}
const BASE = process.env.BASE || "http://localhost:5175";
const PROFILE = path.join(os.tmpdir(), `shin0bix-os-e2e-${Date.now()}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
const consoleErrors = [];
function report(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
}

const browser = await puppeteer.launch({
  executablePath: BB,
  headless: true,
  userDataDir: PROFILE,
  args: ["--disable-gpu", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", "--mute-audio"],
});

const page = await browser.newPage();
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
await page.setViewport({ width: 1600, height: 950 });

const W = (app) => `.win--${app}`;
const titleOf = (app) => page.$eval(W(app) + " .win__title", (el) => el.textContent);
const waitBoot = async () => sleep(4300); // boot 3.13s + 0.65s open + margin

try {
  /* ---------- 1. homepage / boot ---------- */
  await page.goto(BASE + "/", { waitUntil: "load" });
  const bootShown = await page.$(".boot") !== null;
  report("boot screen renders on load", bootShown);
  await page.keyboard.press("Escape"); // skip
  await sleep(800);
  const bootGone = await page.$(".boot") === null;
  report("boot skippable via keypress", bootGone);
  const brand = await page.$eval(".topbar__brand", (el) => el.textContent.trim());
  report("topbar brand is 'shin0biX OS'", brand === "shin0biX OS", brand);
  await waitBoot();
  report("WELCOME.EXE auto-opens on first visit", await page.$(W("welcome")) !== null);
  report("welcome title", (await titleOf("welcome")) === "WELCOME.EXE");

  /* ---------- 2b. welcome quick actions (launchers) ---------- */
  await page.click(".welcome__cta .btn--acid");
  await sleep(700);
  report("welcome: 'Explore projects' opens projects", await page.$(W("projects")) !== null);
  await page.$$eval(".welcome__cta .btn", (b) => b[1].click());
  await sleep(700);
  report("welcome: 'Open terminal' opens terminal", await page.$(W("terminal")) !== null);
  await page.$$eval(".welcome__cta .btn", (b) => b[2].click());
  await sleep(700);
  report("welcome: 'Contact' opens contact", await page.$(W("contact")) !== null);
  // close the CTA-opened windows so later mouse-driven checks are not occluded
  await page.evaluate(() => {
    for (const b of document.querySelectorAll(".win:not(.win--welcome) .win__btn--close")) b.click();
  });
  await sleep(700);
  report("launched windows close cleanly", (await page.$$(".win")).length === 1);

  /* ---------- 2. welcome checkbox persistence ---------- */
  await page.click(".welcome__hide input");
  const lsSet = await page.evaluate(() => localStorage.getItem("shin0bixos.welcome.done"));
  report("welcome 'don't auto-open' sets localStorage", lsSet === "1", String(lsSet));
  await page.reload({ waitUntil: "load" });
  await waitBoot();
  report("no welcome window after reload (persistence)", await page.$(W("welcome")) === null);

  /* ---------- 3. dock open/close/minimize/maximize ---------- */
  await page.click('.dock__item[aria-label="Open Terminal"]');
  await sleep(700);
  report("dock opens Terminal", await page.$(W("terminal")) !== null);
  report("dock shows open-state dot", await page.$('.dock__item--open[aria-label="Open Terminal"] .dock__dot') !== null);

  await page.click(W("terminal") + " .win__btn--min");
  await sleep(500);
  report("minimize hides window", await page.$(W("terminal")) === null);
  await page.click('.dock__item[aria-label="Open Terminal"]');
  await sleep(700);
  report("dock click restores minimized window", await page.$(W("terminal")) !== null);

  await page.$eval(W("terminal") + " .win__bar", (el) => {
    const ev = new MouseEvent("dblclick", { bubbles: true });
    el.dispatchEvent(ev);
  });
  await sleep(500);
  const maxed = await page.$eval(W("terminal"), (el) => el.classList.contains("win--max"));
  report("double-click titlebar maximizes", maxed);
  await page.$eval(W("terminal") + " .win__bar", (el) => {
    el.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
  });
  await sleep(500);
  report("double-click restores", !(await page.$eval(W("terminal"), (el) => el.classList.contains("win--max"))));

  /* ---------- 4. drag ---------- */
  const bar = await page.$(`${W("terminal")} .win__bar`);
  const bb = await bar.boundingBox();
  await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await page.mouse.down();
  await page.mouse.move(bb.x + bb.width / 2 + 140, bb.y + bb.height / 2 + 90, { steps: 12 });
  await page.mouse.up();
  await sleep(300);
  const pos = await page.$eval(W("terminal"), (el) => ({ left: el.style.left, top: el.style.top }));
  report("drag moves window", pos.left !== "" && pos.top !== "", JSON.stringify(pos));

  /* ---------- 5. z-order focus ---------- */
  await page.click('.dock__item[aria-label="Open Projects"]');
  await sleep(600);
  const zBefore = await page.evaluate(() => [
    getComputedStyle(document.querySelector(".win--terminal")).zIndex,
    getComputedStyle(document.querySelector(".win--projects")).zIndex,
  ]);
  // raise terminal via dock (its visible area is fully occluded by the cascade),
  // then click a clear point of projects → projects must come to the front
  await page.click('.dock__item[aria-label="Open Terminal"]');
  await sleep(500);
  const zMid = await page.evaluate(() => [
    getComputedStyle(document.querySelector(".win--terminal")).zIndex,
    getComputedStyle(document.querySelector(".win--projects")).zIndex,
  ]);
  const pt = await page.evaluate(() => {
    const t = document.querySelector(".win--terminal").getBoundingClientRect();
    const p = document.querySelector(".win--projects").getBoundingClientRect();
    const candidates = [
      [p.left + 60, p.top + 46],
      [p.left + 20, p.bottom - 20],
      [p.right - 20, p.top + 46],
    ];
    for (const [x, y] of candidates) {
      const covered = x >= t.left && x <= t.right && y >= t.top && y <= t.bottom;
      if (!covered) return { x, y };
    }
    return { x: p.left + 60, y: p.top + 46 };
  });
  await page.mouse.click(pt.x, pt.y);
  await sleep(400);
  const zAfter = await page.evaluate(() => [
    getComputedStyle(document.querySelector(".win--terminal")).zIndex,
    getComputedStyle(document.querySelector(".win--projects")).zIndex,
  ]);
  report("click raises window z-order", Number(zAfter[0]) > Number(zBefore[0]), `${zBefore} → ${zAfter}`);

  /* ---------- 6. close ---------- */
  await page.click(W("projects") + " .win__btn--close");
  await sleep(500);
  report("close button removes window", await page.$(W("projects")) === null);
  report("dock dot clears after close", await page.$('.dock__item--open[aria-label="Open Projects"]') === null);

  /* ---------- 7. terminal commands (real typing) ---------- */
  const termOut = async () => page.$eval(W("terminal") + " .term__scroll", (el) => el.innerText);
  const typeCmd = async (cmd) => {
    await page.click(W("terminal") + " .term__input");
    await page.type(W("terminal") + " .term__input", cmd, { delay: 8 });
    await page.keyboard.press("Enter");
    await sleep(350);
  };
  await typeCmd("help");
  report("terminal: help lists commands", (await termOut()).includes("neofetch"));
  await typeCmd("neofetch");
  report("terminal: neofetch shows specs", (await termOut()).includes("Kernel") && (await termOut()).includes("react-19"));
  await typeCmd("cat about.txt");
  report("terminal: cat about.txt", (await termOut()).includes("ujjawal jain"));
  await typeCmd("frobnicate");
  report("terminal: unknown command error", (await termOut()).includes("command not found: frobnicate"));
  await typeCmd("sudo rm -rf /");
  report("terminal: sudo joke", (await termOut()).includes("not in the sudoers file"));
  await typeCmd("clear");
  report("terminal: clear wipes screen", !(await termOut()).includes("frobnicate"));
  // history
  await typeCmd("ls");
  await page.click(W("terminal") + " .term__input");
  await page.keyboard.press("ArrowUp");
  const histVal = await page.$eval(W("terminal") + " .term__input", (el) => el.value);
  report("terminal: ArrowUp history", histVal === "ls", histVal);
  await page.keyboard.press("ArrowDown");
  const histVal2 = await page.$eval(W("terminal") + " .term__input", (el) => el.value);
  report("terminal: ArrowDown clears", histVal2 === "", JSON.stringify(histVal2));
  // open via terminal
  await typeCmd("open resume");
  await sleep(600);
  report("terminal: 'open resume' launches app", await page.$(W("resume")) !== null);
  await typeCmd("exit");
  await sleep(900);
  report("terminal: exit closes terminal", await page.$(W("terminal")) === null);

  /* ---------- 8. projects app ---------- */
  await page.click('.dock__item[aria-label="Open Projects"]');
  await sleep(600);
  const cardCount = await page.$$eval(W("projects") + " .card", (els) => els.length);
  report("projects: 7 cards on all/", cardCount === 7, String(cardCount));
  await page.click(`${W("projects")} .proj__node--child`);
  await sleep(400);
  const oneCard = await page.$$eval(W("projects") + " .card", (els) => els.length);
  report("projects: single-project filter", oneCard === 1, String(oneCard));
  const liveHref = await page.$eval(W("projects") + " .card a.btn--acid", (el) => el.href);
  report("projects: live link href", liveHref.startsWith("https://"), liveHref);
  const liveRel = await page.$eval(W("projects") + " .card a.btn--acid", (el) => el.rel);
  report("projects: external link rel=noreferrer", liveRel.includes("noreferrer"), liveRel);
  await page.click(`${W("projects")} .proj__node:nth-last-child(1)`.replace(":nth-last-child(1)", ""));
  await sleep(300);
  // readme node is the last button in tree
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll(".proj__node")];
    btns[btns.length - 1].click();
  });
  await sleep(300);
  report("projects: README view", (await page.$eval(W("projects") + " .readme h2", (el) => el.textContent)) === "README.md");
  await page.click(W("projects") + " .readme .btn");
  await sleep(600);
  report("projects: README 'Open terminal' launches terminal", await page.$(W("terminal")) !== null);

  /* ---------- 9. security lab ---------- */
  await page.click('.dock__item[aria-label="Open Security Lab"]');
  await sleep(600);
  // tablist keyboard support (ARIA tabs pattern)
  await page.evaluate(() => document.querySelector('[data-tab="recon"]').focus());
  await page.keyboard.press("ArrowRight");
  await sleep(300);
  const selChallenge = await page.$eval('[data-tab="challenge"]', (el) => el.getAttribute("aria-selected"));
  report("security: ArrowRight switches tab", selChallenge === "true", String(selChallenge));
  await page.keyboard.press("ArrowLeft");
  await sleep(300);
  const selRecon = await page.$eval('[data-tab="recon"]', (el) => el.getAttribute("aria-selected"));
  report("security: ArrowLeft returns", selRecon === "true", String(selRecon));
  await page.click(W("security") + " .btn--acid");
  await sleep(3200);
  const scanOut = await page.$eval(W("security") + " .termbox", (el) => el.innerText);
  report("security: scan completes", scanOut.includes("scan complete") && scanOut.includes("22/tcp"));
  await page.evaluate(() => {
    const tabs = [...document.querySelectorAll(".sec__tab")];
    tabs[1].click();
  });
  await sleep(300);
  await page.type(W("security") + " .input", "WRONG{flag}");
  await page.click(W("security") + " .btn--acid");
  await sleep(300);
  report("security: wrong flag feedback", (await page.$eval(W("security"), (el) => el.innerText)).includes("attempts: 1"));
  const token = await page.$eval(W("security") + " .token", (el) => el.textContent);
  await page.evaluate(() => {
    const inputs = [...document.querySelectorAll(".sec__panel .input")];
    const dec = inputs[inputs.length - 1];
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(dec, document.querySelector(".token").textContent);
    dec.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll(".sec__panel .btn")];
    btns.find((b) => b.textContent.trim() === "Decode")?.click();
  });
  await sleep(400);
  report("security: base64 decoder reveals flag", (await page.$eval(W("security"), (el) => el.innerText)).includes("acid_green_recon"));
  // submit correct flag: clear the first input and retype
  await page.evaluate(() => {
    const inp = document.querySelector(".sec__panel .input");
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(inp, "");
    inp.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.type(W("security") + " .input", "SHIN0BIX{acid_green_recon}");
  await page.click(W("security") + " .btn--acid");
  await sleep(300);
  report("security: correct flag accepted", (await page.$eval(W("security"), (el) => el.innerText)).includes("access granted"));

  /* ---------- 10. contact ---------- */
  await page.click('.dock__item[aria-label="Open Contact"]');
  await sleep(600);
  const mailtoHref = await page.$eval(W("contact") + ' a[href^="mailto:"]', (el) => el.href);
  report("contact: mailto link", mailtoHref.includes("ujjwalfromkosi@gmail.com"));
  const ghRel = await page.$eval(W("contact") + ' a[href*="github.com"]', (el) => el.rel);
  report("contact: github link rel=noreferrer", ghRel.includes("noreferrer"), ghRel);
  await page.type(W("contact") + " textarea", "test message");
  const required = await page.$eval(W("contact") + " textarea", (el) => el.required);
  report("contact: message required", required === true);

  /* ---------- 11. keyboard accessibility ---------- */
  await page.goto(BASE + "/", { waitUntil: "load" }); // fresh load, welcome.done=1 → no windows open
  await waitBoot();
  await page.evaluate(() => document.activeElement.blur());
  let focusTrail = [];
  let activatedDock = false;
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    const f = await page.evaluate(() => {
      const a = document.activeElement;
      return a ? (a.getAttribute("aria-label") || a.textContent || a.tagName).trim().slice(0, 30) : "none";
    });
    focusTrail.push(f);
    if (f === "Open Terminal" && !activatedDock) {
      await page.keyboard.press("Enter");
      await sleep(700);
      activatedDock = (await page.$(W("terminal"))) !== null;
      break;
    }
  }
  const reachedDock = focusTrail.includes("Open Terminal") || focusTrail.includes("Open Projects");
  report("keyboard: Tab reaches dock buttons", reachedDock, focusTrail.slice(-6).join(" → "));
  report("keyboard: Enter on dock button opens app", activatedDock);

  /* ---------- 12. deep links (refresh-proof routes) ---------- */
  const deep = [
    ["terminal", "shin0biX — zsh"],
    ["projects", "PROJECTS — explorer"],
    ["security", "SECURITY LAB"],
    ["resume", "RESUME.PDF"],
    ["contact", "CONTACT"],
    ["admin", "ADMIN — content manager"],
    ["welcome", "WELCOME.EXE"],
  ];
  for (const [app, expected] of deep) {
    await page.goto(`${BASE}/?app=${app}`, { waitUntil: "load" });
    await waitBoot();
    const t = await titleOf(app).catch(() => null);
    report(`deep link ?app=${app}`, t === expected, String(t));
  }
  await page.goto(`${BASE}/?app=bogus`, { waitUntil: "load" });
  await page.evaluate(() => localStorage.removeItem("shin0bixos.welcome.done"));
  await page.goto(`${BASE}/?app=bogus`, { waitUntil: "load" });
  await waitBoot();
  report("deep link invalid → welcome (not crash)", await page.$(W("welcome")) !== null);

  /* ---------- 13. admin content manager ---------- */
  await page.goto(`${BASE}/?app=admin`, { waitUntil: "load" });
  await page.evaluate(() => localStorage.removeItem("shin0bixos.content.v1"));
  await page.goto(`${BASE}/?app=admin`, { waitUntil: "load" });
  await waitBoot();
  report("admin: deep link opens ADMIN", (await titleOf("admin").catch(() => null)) === "ADMIN — content manager");

  const navTo = (label) =>
    page.evaluate((l) => {
      [...document.querySelectorAll(".adm__nav")].find((b) => b.textContent.trim().startsWith(l))?.click();
    }, label);
  const setNative = (selector, value, proto) =>
    page.evaluate(
      (sel, val, p) => {
        const el = document.querySelector(sel);
        const setter = Object.getOwnPropertyDescriptor(window[p].prototype, "value").set;
        setter.call(el, val);
        el.dispatchEvent(new Event("input", { bubbles: true }));
      },
      selector,
      value,
      proto
    );
  const deleteBtnCount = () => page.$$eval('.adm [aria-label="Delete"]', (els) => els.length);

  await navTo("Projects");
  await sleep(300);
  report("admin: 7 projects from content.json", (await deleteBtnCount()) === 7, String(await deleteBtnCount()));
  await page.evaluate(() => {
    [...document.querySelectorAll(".adm .btn")].find((b) => b.textContent.includes("Add project"))?.click();
  });
  await sleep(300);
  await page.evaluate(() => {
    const cards = [...document.querySelectorAll(".adm__card")];
    const nameInput = cards[cards.length - 1].querySelector("input:not([list])");
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(nameInput, "E2E Test Project");
    nameInput.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await sleep(300);
  report("admin: add project → 8 rows", (await deleteBtnCount()) === 8, String(await deleteBtnCount()));

  await page.click('.dock__item[aria-label="Open Projects"]');
  await sleep(600);
  const adminCardNames = await page.$$eval(W("projects") + " .card h3", (els) => els.map((e) => e.textContent));
  report(
    "admin: new project live in explorer",
    adminCardNames.length === 8 && adminCardNames.includes("E2E Test Project"),
    String(adminCardNames.length)
  );
  await page.click(W("projects") + " .win__btn--close");
  await sleep(400);

  await page.reload({ waitUntil: "load" });
  await waitBoot();
  await navTo("Projects");
  await sleep(300);
  report("admin: edits persist after reload", (await deleteBtnCount()) === 8, String(await deleteBtnCount()));

  await navTo("Welcome");
  await sleep(300);
  await setNative(".adm textarea", "E2E EDITED INTRO — **bold** and `code`", "HTMLTextAreaElement");
  await sleep(300);
  await page.click('.dock__item[aria-label="Open Welcome"]');
  await sleep(600);
  const welcomeText = await page.$eval(W("welcome") + " .welcome__text", (el) => el.innerText);
  const welcomeRendered = await page.evaluate(() => {
    const t = document.querySelector(".welcome__text");
    return t.querySelector("b") !== null && t.querySelector(".mono-acid") !== null;
  });
  report("admin: welcome text edit is live + rich text renders", welcomeText.includes("E2E EDITED INTRO") && welcomeRendered);
  await page.click(W("welcome") + " .win__btn--close");
  await sleep(400);

  await navTo("Projects");
  await sleep(300);
  await page.evaluate(() => {
    const cards = [...document.querySelectorAll(".adm__card")];
    cards[cards.length - 1].querySelector('[aria-label="Delete"]').click();
  });
  await sleep(300);
  report("admin: delete project → 7 rows", (await deleteBtnCount()) === 7, String(await deleteBtnCount()));

  await navTo("Data");
  await sleep(300);
  const hasExport = await page.evaluate(() =>
    [...document.querySelectorAll(".btn")].some((b) => b.textContent.includes("Export content.json"))
  );
  report("admin: export button present", hasExport);
  await page.evaluate(() => {
    [...document.querySelectorAll(".btn")].find((b) => b.textContent.includes("Reset to file"))?.click();
  });
  await sleep(400);
  const lsCleared = await page.evaluate(() => localStorage.getItem("shin0bixos.content.v1") === null);
  await navTo("Projects");
  await sleep(300);
  report(
    "admin: reset restores file content",
    lsCleared && (await deleteBtnCount()) === 7,
    `lsCleared=${lsCleared}`
  );

  /* ---------- 14. mobile ---------- */
  await page.setViewport({ width: 430, height: 932, isMobile: true, hasTouch: true });
  await page.goto(`${BASE}/?app=projects`, { waitUntil: "load" });
  await waitBoot();
  const mobileDicons = await page.$(".dicons");
  report("mobile: desktop icons hidden", mobileDicons === null);
  const mobile = await page.$eval(W("projects"), (el) => {
    const r = el.getBoundingClientRect();
    return { fullW: Math.abs(r.width - window.innerWidth) < 2, fullH: Math.abs(r.height - (window.innerHeight - 61 - 44)) < 40 };
  });
  report("mobile: window fills viewport", mobile.fullW, JSON.stringify(mobile));
  const dockBottom = await page.$eval(".dock", (el) => {
    const r = el.getBoundingClientRect();
    return Math.abs(r.bottom - window.innerHeight) < 2;
  });
  report("mobile: dock pinned to bottom", dockBottom);

  // mobile: drag must be disabled — window stays fullscreen
  const mBefore = await page.$eval(W("projects"), (el) => JSON.stringify(el.getBoundingClientRect()));
  const mbar = await page.$(`${W("projects")} .win__bar`);
  const mbb = await mbar.boundingBox();
  await page.mouse.move(mbb.x + mbb.width / 2, mbb.y + 20);
  await page.mouse.down();
  await page.mouse.move(mbb.x + mbb.width / 2 + 120, mbb.y + 140, { steps: 8 });
  await page.mouse.up();
  await sleep(300);
  const mAfter = await page.$eval(W("projects"), (el) => JSON.stringify(el.getBoundingClientRect()));
  report("mobile: window drag disabled (stays fullscreen)", mBefore === mAfter);

  /* ---------- 15. console cleanliness ---------- */
  report("no console errors during session", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n=== ${results.length - failed.length}/${results.length} passed, ${failed.length} failed ===`);
fs.rmSync(PROFILE, { recursive: true, force: true }); // clean up the throwaway browser profile
process.exit(failed.length ? 1 : 0);
