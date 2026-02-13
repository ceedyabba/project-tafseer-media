// js/pages/player.js

import { AUDIO } from "../data/audio.js";

const $ = (sel) => document.querySelector(sel);

const STORAGE_LAST = "tafseer:last_played";
const STORAGE_FAV = "tafseer:favorites";
const STORAGE_TIME = (id) => `tafseer:last_time:${id}`;


const getFavs = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_FAV) || "[]"); }
  catch { return []; }
};
const setFavs = (arr) => localStorage.setItem(STORAGE_FAV, JSON.stringify(arr));

const fmtTime = (sec) => {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

let currentId = null;

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

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function findIndex(id) {
  return AUDIO.findIndex((x) => x.id === id);
}

function setSaveButton() {
  const btn = $("#saveBtn");
  if (!btn || !currentId) return;
  const favs = new Set(getFavs());
  btn.textContent = favs.has(currentId) ? "★ Saved" : "☆ Save";
}

function toggleSave() {
  if (!currentId) return;
  const list = getFavs();
  const idx = list.indexOf(currentId);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(currentId);
  setFavs(list);
  setSaveButton();
}

function renderList() {
  const listEl = $("#list");
  listEl.innerHTML = "";

  const favs = new Set(getFavs());

  for (const it of AUDIO) {
    const row = document.createElement("div");
    row.className = "list-row";
    if (it.id === currentId) row.classList.add("active");

    const left = document.createElement("button");
    left.type = "button";
    left.className = "list-hit";
    left.dataset.id = it.id;
    left.innerHTML = `
      <div class="list-main">
        <div class="list-title">${it.surah} • ${it.title}</div>
        <div class="list-sub muted">${it.date}</div>
      </div>
      <div class="list-right">
        <span class="small">${favs.has(it.id) ? "★" : ""}</span>
      </div>
    `;

    left.addEventListener("click", () => {
      loadTrack(it.id, true);
    });

    const actions = document.createElement("div");
    actions.className = "list-actions";

    // Download button (only if src exists)
    const dl = document.createElement("a");
    dl.className = "btn btn-outline btn-xs";
    dl.textContent = "Download";

    if (it.src) {
      dl.href = it.src;
      dl.setAttribute("download", "");
      dl.setAttribute("aria-label", `Download ${it.title}`);
    } else {
      // If you don't want web downloads, you can force this path instead:
      dl.href = "#";
      dl.addEventListener("click", (e) => {
        e.preventDefault();
        alert("Offline listening is available on the mobile app.");
      });
    }

    actions.appendChild(dl);

    row.appendChild(left);
    row.appendChild(actions);

    listEl.appendChild(row);
  }
}

function loadTrack(id, autoplay) {
  const idx = findIndex(id);
  if (idx < 0) {
    $("#nowTitle").textContent = "Audio not found";
    $("#nowSub").textContent = "Return to Tafsir Library and select an item.";
    return;
  }

  const it = AUDIO[idx];
  currentId = it.id;

  // Update UI
  $("#nowTitle").textContent = it.title;
  $("#nowSub").textContent = `${it.surah}`;
  $("#nowMeta").textContent = `${it.date} • ${it.duration}`;

  // Load audio
  const audio = $("#audio");
  audio.src = it.src;

  // persist last played
  localStorage.setItem(STORAGE_LAST, it.id);

  // set saved button
  setSaveButton();
  renderList();

  // Show note if no src available
  $("#playerNote").hidden = Boolean(it.src);

  // Restore last time once metadata is ready
  audio.onloadedmetadata = () => {
    const saved = parseFloat(localStorage.getItem(STORAGE_TIME(it.id)) || "0");
    if (Number.isFinite(saved) && saved > 0 && saved < audio.duration) {
      audio.currentTime = saved;
    }
    $("#tDur").textContent = fmtTime(audio.duration);
    $("#seek").value = "0";
  };

  if (autoplay) {
    audio.play().catch(() => {});
    setPlayButton(true);
  } else {
    setPlayButton(false);
  }

  // keep URL in sync
  const url = new URL(window.location.href);
  url.searchParams.set("audio", it.id);
  window.history.replaceState({}, "", url);
}

function setPlayButton(isPlaying) {
  $("#playBtn").textContent = isPlaying ? "⏸" : "▶";
}

function bindControls() {
  const audio = $("#audio");

  $("#playBtn").addEventListener("click", () => {
    if (!currentId) return;
    if (audio.paused) {
      audio.play().then(() => setPlayButton(true)).catch(() => {});
    } else {
      audio.pause();
      setPlayButton(false);
    }
  });

  $("#prevBtn").addEventListener("click", () => {
    if (!currentId) return;
    const i = findIndex(currentId);
    const next = i > 0 ? AUDIO[i - 1].id : AUDIO[AUDIO.length - 1].id;
    loadTrack(next, true);
  });

  $("#nextBtn").addEventListener("click", () => {
    if (!currentId) return;
    const i = findIndex(currentId);
    const next = i < AUDIO.length - 1 ? AUDIO[i + 1].id : AUDIO[0].id;
    loadTrack(next, true);
  });

  $("#speed").addEventListener("change", (e) => {
    audio.playbackRate = parseFloat(e.target.value || "1");
  });

  $("#saveBtn").addEventListener("click", toggleSave);

  // Seek bar sync
  const seek = $("#seek");

  audio.addEventListener("timeupdate", () => {
    $("#tCur").textContent = fmtTime(audio.currentTime);

    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      const pct = (audio.currentTime / audio.duration) * 100;
      seek.value = String(Math.min(100, Math.max(0, pct)));
    }

    // persist progress
    if (currentId) localStorage.setItem(STORAGE_TIME(currentId), String(audio.currentTime));
  });

  seek.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const pct = parseFloat(seek.value || "0") / 100;
    audio.currentTime = pct * audio.duration;
  });

  audio.addEventListener("ended", () => {
    setPlayButton(false);
  });
}

function boot() {
  initYear();
  initMobileMenu();
  bindControls();

  // Decide what to load:
  const q = getParam("audio");
  const last = localStorage.getItem(STORAGE_LAST);
  const id = q || last || AUDIO[0].id;

  loadTrack(id, false);
}

boot();

const session = JSON.parse(localStorage.getItem("tafseer:session") || "null");
if (!session?.email) window.location.replace("login.html");
