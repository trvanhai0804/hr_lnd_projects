/* ==========================================
   Projects: a private space behind a passcode.

   Locked card -> passcode pad -> the projects grid.

   Nothing here gives the passcode away: the page never stores it or a
   hash of it. The project list itself (titles, descriptions, links and
   covers) is encrypted (AES-256-GCM) with a key made from the passcode
   by PBKDF2 (SHA-256, 3,000,000 rounds), so only the right passcode can
   decrypt it, and every guess takes a noticeable fraction of a second.
   After a few wrong tries the pad also pauses.

   Unlocking lasts for the browser session (the decrypted list is kept
   in sessionStorage until the tab is closed or "Lock" is pressed).

   To change the passcode or the projects: unlock the page, then in the
   browser console run
     projectsLock("NEW-PASSCODE", projectsSource())
   and replace LOCKED below with what it prints. projectsSource() returns
   the current list's HTML; pass edited HTML instead to change the list.
   ========================================== */
(() => {
  "use strict";

  const PASS_LENGTH = 6;
  const LOCKED = {"i":3000000,"s":"+9zPv4LaXMWN/I3tWwGU6Q==","v":"p1SO5Nr6xgTtHm1q","c":"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"};
  const KEY = "projects-list";
  const MAX_TRIES = 5; // wrong tries before the pad pauses
  const PAUSE_S = 30;

  const enc = new TextEncoder();
  const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const toB64 = (u8) => {
    let s = "";
    u8.forEach((b) => { s += String.fromCharCode(b); });
    return btoa(s);
  };
  async function keyFor(code, salt, iterations, usage) {
    const base = await crypto.subtle.importKey("raw", enc.encode(code), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      base,
      { name: "AES-GCM", length: 256 },
      false,
      [usage],
    );
  }
  // the decrypted list, or null when the passcode is wrong
  async function open(code) {
    try {
      const key = await keyFor(code, fromB64(LOCKED.s), LOCKED.i, "decrypt");
      const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(LOCKED.v) }, key, fromB64(LOCKED.c));
      return new TextDecoder().decode(plain);
    } catch (e) {
      return null;
    }
  }
  // maintenance helpers (see the note at the top)
  window.projectsLock = async (code, html, iterations = 3000000) => {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await keyFor(String(code), salt, iterations, "encrypt");
    const c = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(html)));
    const out = JSON.stringify({ i: iterations, s: toB64(salt), v: toB64(iv), c: toB64(c) });
    console.log(out);
    return out;
  };
  window.projectsSource = () => grid.innerHTML.trim();

  const $ = (s) => document.querySelector(s);
  const views = { locked: $("#view-locked"), pass: $("#view-passcode"), list: $("#view-projects") };
  const grid = $("#project-grid");
  const dots = Array.from(document.querySelectorAll(".pin-dot"));
  const pin = $(".pin-dots");
  const msg = $("#pin-message");
  const lockIcon = $("#pass-lock");
  let code = "";
  let busy = false;
  let wrongTries = 0;
  let pausedUntil = 0;

  const saved = () => {
    try { return sessionStorage.getItem(KEY); } catch (e) { return null; }
  };
  const remember = (html) => {
    try { html ? sessionStorage.setItem(KEY, html) : sessionStorage.removeItem(KEY); } catch (e) {}
  };

  function show(name) {
    Object.entries(views).forEach(([k, v]) => { v.hidden = k !== name; });
    if (name === "pass") {
      code = "";
      render();
      say("");
      lockIcon.classList.remove("open");
      $(".numpad button").focus({ preventScroll: true });
    }
  }
  function say(text, kind) {
    msg.textContent = text;
    msg.className = "pin-message" + (kind ? " " + kind : "");
  }
  function render() {
    dots.forEach((d, i) => d.classList.toggle("filled", i < code.length));
  }

  function press(k) {
    if (busy) return;
    const wait = Math.ceil((pausedUntil - Date.now()) / 1000);
    if (wait > 0) { say("Too many tries. Wait " + wait + "s.", "wrong"); return; }
    say("");
    if (k === "clear") code = "";
    else if (k === "back") code = code.slice(0, -1);
    else if (code.length < PASS_LENGTH) code += k;
    render();
    if (code.length === PASS_LENGTH) check();
  }

  async function check() {
    busy = true;
    pin.classList.add("checking");
    say("Checking…");
    const html = await open(code);
    pin.classList.remove("checking");
    if (html !== null) {
      wrongTries = 0;
      grid.innerHTML = html;
      remember(html);
      pin.classList.add("ok");
      lockIcon.classList.add("open");
      say("Access granted", "ok");
      setTimeout(() => {
        pin.classList.remove("ok");
        busy = false;
        show("list");
        window.scrollTo(0, 0);
      }, 900);
    } else {
      wrongTries++;
      pin.classList.add("wrong");
      if (wrongTries >= MAX_TRIES) {
        wrongTries = 0;
        pausedUntil = Date.now() + PAUSE_S * 1000;
        say("Too many tries. Wait " + PAUSE_S + "s.", "wrong");
      } else {
        say("Wrong passcode. Try again.", "wrong");
      }
      setTimeout(() => {
        pin.classList.remove("wrong");
        code = "";
        render();
        busy = false;
      }, 650);
    }
  }

  document.querySelectorAll(".numpad button").forEach((b) => {
    b.addEventListener("click", () => press(b.dataset.key));
  });
  document.addEventListener("keydown", (e) => {
    if (views.pass.hidden) return;
    if (/^[0-9]$/.test(e.key)) press(e.key);
    else if (e.key === "Backspace") press("back");
    else if (e.key === "Escape") show("locked");
    else return;
    e.preventDefault();
  });

  $("#btn-enter").addEventListener("click", () => show("pass"));
  $("#btn-cancel").addEventListener("click", () => show("locked"));
  $("#btn-lock").addEventListener("click", () => {
    remember(null);
    grid.innerHTML = "";
    show("locked");
  });

  const html = saved();
  if (html) grid.innerHTML = html;
  show(html ? "list" : "locked");
})();
