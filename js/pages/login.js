// js/pages/login.js

const $ = (sel) => document.querySelector(sel);

const STORAGE_SESSION = "tafseer:session";

function initYear() {
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
}

function initMobileMenu() {
  const btn = $(".nav-toggle");
  const menu = $("#mobileMenu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const open = !menu.hasAttribute("hidden");
    if (open) {
      menu.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", "false");
    } else {
      menu.removeAttribute("hidden");
      btn.setAttribute("aria-expanded", "true");
    }
  });
}

function getSession() {
  try { return JSON.parse(localStorage.getItem(STORAGE_SESSION) || "null"); }
  catch { return null; }
}

function setMessage(text, type = "ok") {
  const el = $("#msg");
  if (!el) return;
  el.hidden = !text;
  el.textContent = text;
  el.dataset.type = type;
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function boot() {
  initYear();
  initMobileMenu();

  // If already logged in, go to profile
  const s = getSession();
  if (s && s.email) {
    window.location.replace("profile.html");
    return;
  }

  const form = $("#loginForm");
  const nameEl = $("#name");
  const emailEl = $("#email");
  const passEl = $("#password");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    setMessage("");

    const name = (nameEl.value || "").trim();
    const email = (emailEl.value || "").trim().toLowerCase();
    const password = (passEl.value || "").trim();

    if (name.length < 2) return setMessage("Enter your full name.", "err");
    if (!isEmail(email)) return setMessage("Enter a valid email.", "err");
    if (password.length < 6) return setMessage("Password must be at least 6 characters.", "err");

    const session = {
      name,
      email,
      loggedInAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
    setMessage("Signed in. Redirecting…", "ok");

    window.setTimeout(() => {
      window.location.href = "profile.html";
    }, 350);
  });

  // App link (placeholder)
  const app = $("#downloadAppLink");
  if (app) {
    app.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Mobile app link will be provided here.");
    });
  }
}

boot();

