// js/pages/profile.js (guest-mode)
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

function getFavs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_FAV) || "[]"); }
  catch { return []; }
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

  if (!s || !s.email) {
    // Guest mode
    $("#pName").textContent = "Guest";
    $("#pEmail").textContent = "—";
    $("#pSince").textContent = "—";
    setAccountUI(false);
    return;
  }

  $("#pName").textContent = s.name || "—";
  $("#pEmail").textContent = s.email || "—";
  $("#pSince").textContent = s.loggedInAt ? fmtDate(s.loggedInAt) : "—";
  setAccountUI(true);
}

function mountListening() {
  const last = localStorage.getItem(STORAGE_LAST);

  if (!last) {
    $("#lastPlayed").textContent = "—";
    $("#lastPos").textContent = "—";
    $("#resumeBtn").href = "player.html";
    $("#openPlayerBtn").href = "player.html";
    return;
  }

  const a = findAudio(last);
  $("#lastPlayed").textContent = a ? `${a.surah} • ${a.title}` : last;

  const pos = localStorage.getItem(STORAGE_TIME(last)) || "0";
  $("#lastPos").textContent = fmtTime(pos);

  const href = `player.html?audio=${encodeURIComponent(last)}`;
  $("#resumeBtn").href = href;
  $("#openPlayerBtn").href = href;
}

function renderFavs() {
  const favIds = getFavs();
  const grid = $("#favGrid");
  const empty = $("#favEmpty");
  const hint = $("#favHint");

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
      const next = favIds.filter((x) => x !== id);
      localStorage.setItem(STORAGE_FAV, JSON.stringify(next));
      renderFavs();
    });

    actions.appendChild(play);
    actions.appendChild(remove);

    card.appendChild(title);
    card.appendChild(actions);

    grid.appendChild(card);
  }
}

function bindLogout() {
  const btn = $("#logoutBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_SESSION);
    // stay on profile, refresh UI into guest mode
    mountSession();
  });
}

function boot() {
  initYear();
  initMobileMenu();
  mountSession();
  mountListening();
  renderFavs();
  bindLogout();

  const app = $("#downloadAppLink");
  if (app) {
    app.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Mobile app link will be provided here.");
    });
  }
}

boot();
