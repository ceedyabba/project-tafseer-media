// js/data/audio.js
// Single source of truth for audio metadata used by:
// - Tafsir Library (tafsir.js)
// - Player (player.js)
// - Profile (profile.js)

const SURAH_NAMES = [
  "Al-Fatiha","Al-Baqara","Al-Imran","An-Nisa","Al-Ma'idah","Al-An'am","Al-A'raf","Al-Anfal","At-Tawbah",
  "Yunus","Hud","Yusuf","Ar-Ra'd","Ibrahim","Al-Hijr","An-Nahl","Al-Isra","Al-Kahf","Maryam","Ta-Ha",
  "Al-Anbiya","Al-Hajj","Al-Mu'minun","An-Nur","Al-Furqan","Ash-Shu'ara","An-Naml","Al-Qasas","Al-Ankabut",
  "Ar-Rum","Luqman","As-Sajdah","Al-Ahzab","Saba","Fatir","Ya-Sin","As-Saffat","Sad","Az-Zumar","Ghafir",
  "Fussilat","Ash-Shura","Az-Zukhruf","Ad-Dukhan","Al-Jathiyah","Al-Ahqaf","Muhammad","Al-Fath","Al-Hujurat",
  "Qaf","Adh-Dhariyat","At-Tur","An-Najm","Al-Qamar","Ar-Rahman","Al-Waqi'ah","Al-Hadid","Al-Mujadila",
  "Al-Hashr","Al-Mumtahanah","As-Saff","Al-Jumu'ah","Al-Munafiqun","At-Taghabun","At-Talaq","At-Tahrim",
  "Al-Mulk","Al-Qalam","Al-Haqqah","Al-Ma'arij","Nuh","Al-Jinn","Al-Muzzammil","Al-Muddaththir","Al-Qiyamah",
  "Al-Insan","Al-Mursalat","An-Naba","An-Nazi'at","Abasa","At-Takwir","Al-Infitar","Al-Mutaffifin","Al-Inshiqaq",
  "Al-Buruj","At-Tariq","Al-A'la","Al-Ghashiyah","Al-Fajr","Al-Balad","Ash-Shams","Al-Layl","Ad-Duha","Ash-Sharh",
  "At-Tin","Al-Alaq","Al-Qadr","Al-Bayyinah","Az-Zalzalah","Al-Adiyat","Al-Qari'ah","At-Takathur","Al-Asr",
  "Al-Humazah","Al-Fil","Quraysh","Al-Ma'un","Al-Kawthar","Al-Kafirun","An-Nasr","Al-Masad","Al-Ikhlas","Al-Falaq","An-Nas",
];

const BASE_AUDIO = [
  {
    id: "a001",
    surah: "Al-Fatiha",
    title: "Al-Fatiha (Session 1)",
    location: "Bauchi",
    duration: "42:10",
    src: "assets/audio/demo1.mp3",
  },
  {
    id: "a002",
    surah: "Al-Baqara",
    title: "Al-Baqara (Session 1)",
    location: "Kaduna",
    duration: "55:03",
    src: "assets/audio/demo2.mp3",
  },
  {
    id: "a003",
    surah: "Al-Baqara",
    title: "Al-Baqara (Session 2)",
    location: "Kaduna",
    duration: "57:41",
    src: "assets/audio/demo3.mp3",
  },
  {
    id: "a004",
    surah: "Al-Imran",
    title: "Al-Imran (Session 1)",
    location: "Kano",
    duration: "49:25",
    src: "assets/audio/demo4.mp3",
  },
];

const existing = new Set(BASE_AUDIO.map((x) => x.surah));

const GENERATED_AUDIO = SURAH_NAMES
  .filter((name) => !existing.has(name))
  .map((surah, i) => ({
    id: `a${String(BASE_AUDIO.length + i + 1).padStart(3, "0")}`,
    surah,
    title: `${surah} (Session 1)`,
    location: "—",
    duration: "",
    src: "assets/audio/demo1.mp3", // placeholder; change to real file path
  }));

export const AUDIO = [...BASE_AUDIO, ...GENERATED_AUDIO];