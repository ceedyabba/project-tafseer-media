// js/pages/index.js
const $ = (sel) => document.querySelector(sel);

const els = {
  year: $("#year"),
  searchInput: $("#searchInput"),
  surahSelect: $("#surahSelect"),
  locationSelect: $("#locationSelect"),
  searchBtn: $("#searchBtn"),
  clearBtn: $("#clearBtn"),
  retryBtn: $("#retryBtn"),

  resultsMeta: $("#resultsMeta"),
  skeletonGrid: $("#skeletonGrid"),
  tafsirGrid: $("#tafsirGrid"),
  emptyState: $("#emptyState"),
  errorState: $("#errorState"),
  errorText: $("#errorText"),

  pager: $("#pager"),
  prevBtn: $("#prevBtn"),
  nextBtn: $("#nextBtn"),
  pageInfo: $("#pageInfo"),

  downloadAppBtn: $("#downloadAppBtn"),
  learnMoreBtn: $("#learnMoreBtn"),
};

els.year.textContent = new Date().getFullYear();

// Temporary sample data (replace with API later)
const SAMPLE = [
  { id: "101", title: "Tafsir of Surah Al-Baqarah", surah: "Al-Baqarah", location: "Kano", date: "2025-03-12", count: 24 },
  { id: "102", title: "Tafsir of Surah Yasin", surah: "Yasin", location: "Kaduna", date: "2025-04-01", count: 10 },
  { id: "103", title: "Ramadan Tafsir Series", surah: "Multiple", location: "Bauchi", date: "2025-03-01", count: 30 },
  { id: "104", title: "Tafsir of Surah Al-Kahf", surah: "Al-Kahf", location: "Abuja", date: "2025-05-09", count: 8 },
];

function showState(state, metaText = "—") {
  els.resultsMeta.textContent = metaText;

  const isLoading = state === "loading";
  const isReady = state === "ready";
  const isEmpty = state === "empty";
  const isError = state === "error";

  els.skeletonGrid.hidden = !isLoading;
  els.tafsirGrid.hidden = !isReady;
  els.emptyState.hidden = !isEmpty;
  els.errorState.hidden = !isError;

  els.pager.hidden = true;
}

function cardHTML(item) {
  return `
    <article class="card">
      <h3 class="card-title">${escapeHTML(item.title)}</h3>
      <div class="card-meta">
        <span class="badge">Surah: ${escapeHTML(item.surah)}</span>
        <span class="badge">Location: ${escapeHTML(item.location)}</span>
        <span class="badge">${escapeHTML(item.date)}</span>
        <span class="badge">${item.count} audios</span>
      </div>
      <div class="card-actions">
        <a class="btn btn-primary" href="tafsir.html?id=${encodeURIComponent(item.id)}">Open</a>
        <a class="btn btn-outline" href="tafsir.html?id=${encodeURIComponent(item.id)}#audios">Audios</a>
      </div>
    </article>
  `;
}

function renderList(items) {
  if (!items.length) {
    showState("empty", "0 results");
    return;
  }

  els.tafsirGrid.innerHTML = items.map(cardHTML).join("");
  showState("ready", `${items.length} results`);
}

function loadInitial() {
  showState("loading");
  // simulate load
  setTimeout(() => {
    try {
      // Populate filter options from sample
      fillSelect(els.surahSelect, unique(SAMPLE.map(x => x.surah)));
      fillSelect(els.locationSelect, unique(SAMPLE.map(x => x.location)));
      renderList(SAMPLE);
    } catch (e) {
      els.errorText.textContent = "Unable to load content.";
      showState("error");
    }
  }, 450);
}

function applyFilters() {
  const q = els.searchInput.value.trim().toLowerCase();
  const surah = els.surahSelect.value;
  const loc = els.locationSelect.value;

  const filtered = SAMPLE.filter(item => {
    const hay = `${item.title} ${item.surah} ${item.location}`.toLowerCase();
    const matchQ = !q || hay.includes(q);
    const matchS = !surah || item.surah === surah;
    const matchL = !loc || item.location === loc;
    return matchQ && matchS && matchL;
  });

  renderList(filtered);
}

function clearFilters() {
  els.searchInput.value = "";
  els.surahSelect.value = "";
  els.locationSelect.value = "";
  renderList(SAMPLE);
}

// Offline CTA (placeholder links)
function wireOfflineCTA() {
  const ANDROID_APP_URL = "#";
  const IOS_APP_URL = "#";

  els.downloadAppBtn.addEventListener("click", (e) => {
    e.preventDefault();
    // If you have only one link now, point it there.
    window.open(ANDROID_APP_URL, "_blank", "noopener,noreferrer");
  });

  els.learnMoreBtn.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Offline listening is available on the mobile app. Download it from the store.");
  });
}

// Helpers
function fillSelect(selectEl, options) {
  const base = selectEl.innerHTML; // keeps "All"
  selectEl.innerHTML = base + options.map(v => `<option value="${escapeAttr(v)}">${escapeHTML(v)}</option>`).join("");
}
function unique(arr) {
  return Array.from(new Set(arr)).filter(Boolean).sort((a,b) => a.localeCompare(b));
}
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, s => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[s]));
}
function escapeAttr(str) {
  return escapeHTML(str).replace(/"/g, "&quot;");
}

// Events
els.searchBtn.addEventListener("click", applyFilters);
els.clearBtn.addEventListener("click", clearFilters);
els.retryBtn?.addEventListener("click", loadInitial);

els.searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") applyFilters();
});

wireOfflineCTA();
loadInitial();
