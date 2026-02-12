// js/pages/profile.js
import { AUDIO } from "../data/audio.js";

const $ = (sel) => document.querySelector(sel);

const STORAGE_SESSION = "tafseer:session";
const STORAGE_LAST = "tafseer:last_played";
const STORAGE_FAV = "tafseer:favorites";
const STORAGE_TIME = (id) => `tafseer:last_time:${id}`;

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
    menu.toggleAttribute("hidden", open);
    btn.setAttribute("aria-expanded", String(!open));
  });
}

function safeJsonParse(str, fallback) {
  try {
    const v = JSON.parse(str);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function getSession() {
  return safeJsonParse(localStorage.getItem(STORAGE_SESSION) || "null", null);
}

function getFavs() {
  return safeJsonParse(localStorage.getItem(STORAGE_FAV) || "[]", []);
}

function setFavs(ids) {
  localStorage.setItem(STORAGE_FAV, JSON.stringify(ids));
}

function findAudio(id) {
  return AUDIO.find((x) => x.id === id) || null;
}

function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return "—";
  }
}

function fmtTime(sec) {
  const n = Number(sec);
  if (!Number.isFinite(n) || n <= 0) return "0:00";
  const m = Math.floor(n / 60);
  const s = Math.floor(n % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function setAccountUI(isLoggedIn) {
  const logoutBtn = $("#logoutBtn");
  const signInBtn = $("#signInBtn");
  const badge = $("#accountBadge");

  if (badge) badge.textContent = isLoggedIn ? "Signed in" : "Guest";
  if (logoutBtn) logoutBtn.hidden = !isLoggedIn;
  if (signInBtn) signInBtn.hidden = isLoggedIn;
}

function mountSession() {
  const s = getSession();

  const pName = $("#pName");
  const pEmail = $("#pEmail");
  const pSince = $("#pSince");

  if (!s || !s.email) {
    if (pName) pName.textContent = "Guest";
    if (pEmail) pEmail.textContent = "—";
    if (pSince) pSince.textContent = "—";
    setAccountUI(false);
    return;
  }

  if (pName) pName.textContent = s.name || "—";
  if (pEmail) pEmail.textContent = s.email || "—";
  if (pSince) pSince.textContent = s.loggedInAt ? fmtDate(s.loggedInAt) : "—";
  setAccountUI(true);
}

function mountListening() {
  const last = localStorage.getItem(STORAGE_LAST);

  const lastPlayed = $("#lastPlayed");
  const lastPos = $("#lastPos");
  const resumeBtn = $("#resumeBtn");
  const openPlayerBtn = $("#openPlayerBtn");

  if (!last) {
    if (lastPlayed) lastPlayed.textContent = "—";
    if (lastPos) lastPos.textContent = "—";
    if (resumeBtn) resumeBtn.href = "player.html";
    if (openPlayerBtn) openPlayerBtn.href = "player.html";
    return;
  }

  const a = findAudio(last);
  if (lastPlayed) lastPlayed.textContent = a ? `${a.surah} • ${a.title}` : last;

  const pos = localStorage.getItem(STORAGE_TIME(last)) || "0";
  if (lastPos) lastPos.textContent = fmtTime(pos);

  const href = `player.html?audio=${encodeURIComponent(last)}`;
  if (resumeBtn) resumeBtn.href = href;
  if (openPlayerBtn) openPlayerBtn.href = href;
}

function renderFavs() {
  const grid = $("#favGrid");
  const empty = $("#favEmpty");
  const hint = $("#favHint");
  if (!grid || !empty || !hint) return;

  const favIds = getFavs();
  grid.innerHTML = "";

  if (!favIds.length) {
    hint.textContent = "0 saved item(s)";
    empty.hidden = false;
    return;
  }

  hint.textContent = `${favIds.length} saved item(s)`;
  empty.hidden = true;

  for (const id of favIds) {
    const a = findAudio(id);

    const card = document.createElement("article");
    card.className = "fav-card";

    const title = document.createElement("div");
    title.className = "fav-title";
    title.textContent = a ? `${a.surah} • ${a.title}` : id;

    const actions = document.createElement("div");
    actions.className = "fav-actions";

    const play = document.createElement("a");
    play.className = "btn btn-primary btn-sm";
    play.href = `player.html?audio=${encodeURIComponent(id)}`;
    play.textContent = "Play";

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn btn-outline btn-sm";
    remove.textContent = "Remove";

    remove.addEventListener("click", () => {
      const current = getFavs();              // always read latest
      const next = current.filter((x) => x !== id);
      setFavs(next);
      renderFavs();
    });

    actions.appendChild(play);
    actions.appendChild(remove);

    card.appendChild(title);
    card.appendChild(actions);

    grid.appendChild(card);
  }
}

function broadcastAuthChange(sessionOrNull) {
  window.dispatchEvent(new CustomEvent("auth:changed", { detail: sessionOrNull }));
}

function bindLogout() {
  const btn = $("#logoutBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_SESSION);
    window.dispatchEvent(new CustomEvent("auth:changed", { detail: null }));
    window.location.href = "index.html";
  });
}

function bindSignIn() {
  const btn = $("#signInBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    window.location.href = "login.html";
  });
}

function syncOnStorage() {
  mountSession();
  mountListening();
  renderFavs();
}

function boot() {
  initYear();
  initMobileMenu();

  mountSession();
  mountListening();
  renderFavs();

  bindLogout();
  bindSignIn();

  window.addEventListener("storage", syncOnStorage);
  window.addEventListener("auth:changed", syncOnStorage);

  const app = $("#downloadAppLink");
  if (app) {
    app.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Mobile app link will be provided here.");
    });
  }
}

const session = getSession();
if (!session?.email) {
  window.location.replace("login.html");
} else {
  boot();
}
