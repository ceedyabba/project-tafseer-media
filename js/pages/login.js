// js/pages/login.js
const STORAGE_SESSION = "tafseer:session";
const $ = (sel) => document.querySelector(sel);

function safeJsonParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}

function getSession() {
  return safeJsonParse(localStorage.getItem(STORAGE_SESSION) || "null");
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
}

function setMessage(text = "", type = "ok") {
  const el = $("#msg");
  if (!el) return;
  el.hidden = !text;
  el.textContent = text;
  el.dataset.type = type;
}

function initYear() {
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
}

function saveSession(session) {
  localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent("auth:changed", { detail: session }));
}

function boot() {
  initYear();

  // already logged in -> go home
const existing = getSession();
if (existing?.email) {
  setMessage(`You are already signed in as ${existing.email}.`, "ok");

  // hide the form inputs
  const form = $("#loginForm");
  if (form) form.querySelectorAll("input, button[type='submit']").forEach(el => (el.disabled = true));

  // add actions inside the message box
  const msg = $("#msg");
  if (msg) {
    const actions = document.createElement("div");
    actions.style.marginTop = "10px";
    actions.style.display = "flex";
    actions.style.gap = "10px";
    actions.innerHTML = `
      <a class="btn btn-primary" href="profile.html">Go to Profile</a>
      <button class="btn btn-outline" type="button" id="logoutInline">Logout</button>
    `;
    msg.appendChild(actions);

    $("#logoutInline")?.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_SESSION);
      window.dispatchEvent(new CustomEvent("auth:changed", { detail: null }));
      window.location.reload();
    });
  }
  return;
}


  const form = $("#loginForm");
  const nameEl = $("#name");
  const emailEl = $("#email");
  const passEl = $("#password");

  if (!form || !nameEl || !emailEl || !passEl) {
    console.warn("Missing login elements. Check IDs: loginForm, name, email, password.");
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    setMessage("");

    const name = nameEl.value.trim();
    const email = emailEl.value.trim().toLowerCase();
    const password = passEl.value.trim();

    if (name.length < 2) return setMessage("Enter your full name.", "err");
    if (!isEmail(email)) return setMessage("Enter a valid email.", "err");
    if (password.length < 6) return setMessage("Password must be at least 6 characters.", "err");

    saveSession({ name, email, loggedInAt: new Date().toISOString() });
    setMessage("Signed in. Redirecting…", "ok");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 250);
  });

  const app = $("#downloadAppLink");
  if (app) {
    app.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Mobile app link will be provided here.");
    });
  }
}

boot();
