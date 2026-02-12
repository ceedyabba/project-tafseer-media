// js/auth-nav.js
const $ = (sel) => document.querySelector(sel);

const STORAGE_SESSION = "tafseer:session";

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_SESSION) || "null");
  } catch {
    return null;
  }
}

function initialsFromName(name = "") {
  const n = String(name).trim();
  if (!n) return "U";
  return n[0].toUpperCase();
}

function setText(el, text) {
  if (el) el.textContent = text;
}

function show(el) {
  if (el) el.hidden = false;
}

function hide(el) {
  if (el) el.hidden = true;
}

function syncNav() {
  const s = getSession();
  const isLoggedIn = !!(s && s.email);

  const loginBtn = $("#loginNavBtn");
  const loginBtnM = $("#loginNavBtnMobile");

  const profileBtn = $("#profileNavBtn");
  const profileBtnM = $("#profileNavBtnMobile");

  const nameEl = $("#navUserName");
  const nameElM = $("#navUserNameMobile");

  // Logged out → show Login (hide Profile button)
  if (!isLoggedIn) {
    show(loginBtn);
    show(loginBtnM);
    hide(profileBtn);
    hide(profileBtnM);
    setText(nameEl, "");
    setText(nameElM, "");
    return;
  }

  // Logged in → hide BOTH Login + Profile buttons in the header
  // (No Logout on home; Logout stays inside Profile page only)
  hide(loginBtn);
  hide(loginBtnM);
  hide(profileBtn);
  hide(profileBtnM);
  setText(nameEl, "");
  setText(nameElM, "");
}


function bindMobileMenu() {
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

function boot() {
  bindMobileMenu();
  syncNav();

  // update instantly when login/logout happens
  window.addEventListener("auth:changed", syncNav);
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_SESSION) syncNav();
  });
}

boot();
