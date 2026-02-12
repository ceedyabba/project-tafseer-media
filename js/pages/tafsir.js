// js/pages/tafsir.js
// Tafsir Library page logic (no Location filter)

import { AUDIO } from "../data/audio.js";

// ===== Helpers =====
const $ = (sel) => document.querySelector(sel);

const fmtDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return iso || "";
  }
};

const STORAGE_LAST = "tafseer:last_played";
const STORAGE_FAV = "tafseer:favorites"; // store array of audio ids

const getFavs = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_FAV) || "[]"); }
  catch { return []; }
};
const setFavs = (arr) => localStorage.setItem(STORAGE_FAV, JSON.stringify(arr));

// ===== UI =====
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

function initResumeButtons() {
  const last = localStorage.getItem(STORAGE_LAST);
  const href = last ? `player.html?audio=${encodeURIComponent(last)}` : "player.html";

  const btn1 = $("#resumeBtn");
  const btn2 = $("#resumeBtnMobile");
  if (btn1) btn1.href = href;
  if (btn2) btn2.href = href;

  const statLast = $("#statLast");
  if (statLast) statLast.textContent = last ? last : "—";
}

function populateSelect(selectEl, values) {
  const unique = Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  for (const v of unique) {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    selectEl.appendChild(opt);
  }
}

function applyFilters(items) {
  const q = ($("#q").value || "").trim().toLowerCase();
  const surah = $("#surah").value;
  const onlyFav = $("#onlyFav").checked;
  const favs = new Set(getFavs());

  let out = items.filter((it) => {
    if (surah && it.surah !== surah) return false;
    if (onlyFav && !favs.has(it.id)) return false;

    if (!q) return true;
    const hay = `${it.surah} ${it.title} ${it.id}`.toLowerCase();
    return hay.includes(q);
  });

  const sort = $("#sort").value;
  out.sort((a, b) => {
    if (sort === "newest") return new Date(b.date) - new Date(a.date);
    if (sort === "oldest") return new Date(a.date) - new Date(b.date);
    if (sort === "surah") return a.surah.localeCompare(b.surah) || a.title.localeCompare(b.title);
    if (sort === "title") return a.title.localeCompare(b.title);
    return 0;
  });

  return out;
}

function render(items) {
  const grid = $("#grid");
  const empty = $("#empty");
  const hint = $("#resultsHint");
  const statTotal = $("#statTotal");
  const statFiltered = $("#statFiltered");

  const total = AUDIO.length;
  const filtered = items.length;

  if (statTotal) statTotal.textContent = String(total);
  if (statFiltered) statFiltered.textContent = String(filtered);

  if (hint) hint.textContent = filtered ? `${filtered} item(s) shown` : "No results";
  grid.innerHTML = "";

  if (!filtered) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  const favs = new Set(getFavs());

  for (const it of items) {
    const card = document.createElement("article");
    card.className = "card item";

    const top = document.createElement("div");
    top.className = "item-top";

    const meta = document.createElement("div");
    meta.className = "item-meta";
    meta.innerHTML = `
      <div class="item-surah">${it.surah}</div>
      <div class="item-title">${it.title}</div>
      <div class="item-sub muted">${it.location} • ${fmtDate(it.date)} • ${it.duration}</div>
    `;

    const actions = document.createElement("div");
    actions.className = "item-actions";

    const favBtn = document.createElement("button");
    favBtn.type = "button";
    favBtn.className = "btn btn-outline btn-sm";
    favBtn.textContent = favs.has(it.id) ? "★ Saved" : "☆ Save";
    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const list = getFavs();
      const idx = list.indexOf(it.id);
      if (idx >= 0) list.splice(idx, 1);
      else list.push(it.id);
      setFavs(list);
      render(applyFilters(AUDIO));
    });

    const play = document.createElement("a");
    play.className = "btn btn-primary btn-sm";
    play.href = `player.html?audio=${encodeURIComponent(it.id)}`;
    play.textContent = "Play";

    actions.appendChild(favBtn);
    actions.appendChild(play);

    top.appendChild(meta);
    top.appendChild(actions);

    card.appendChild(top);

    // click card to play
    card.addEventListener("click", () => {
      window.location.href = `player.html?audio=${encodeURIComponent(it.id)}`;
    });

    grid.appendChild(card);
  }
}

function initFilters() {
  const surahSel = $("#surah");
  populateSelect(surahSel, AUDIO.map((a) => a.surah));

  const rerender = () => render(applyFilters(AUDIO));

  ["q", "surah", "sort", "onlyFav"].forEach((id) => {
    const el = $(`#${id}`);
    if (!el) return;
    el.addEventListener(id === "q" ? "input" : "change", rerender);
  });

  const resetBtn = $("#resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      $("#q").value = "";
      $("#surah").value = "";
      $("#sort").value = "newest";
      $("#onlyFav").checked = false;
      rerender();
    });
  }

  rerender();
}

// ===== Boot =====
initYear();
initMobileMenu();
initResumeButtons();
initFilters();
const session = JSON.parse(localStorage.getItem("tafseer:session") || "null");
if (!session?.email) window.location.replace("login.html");
