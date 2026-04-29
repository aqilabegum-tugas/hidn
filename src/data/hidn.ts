// Static data lokal — sebagai fallback kalau backend belum jalan,
// & juga di-seed ke Postgres lewat backend/db/seed.sql
export type Personality =
  | "explorer"
  | "relaxer"
  | "culture"
  | "adventurer"
  | "foodie";

export const personalityMeta: Record<Personality, { label: string; tagline: string; description: string; color: string }> = {
  explorer:   { label: "The Explorer",   tagline: "Penjelajah Sejati",       description: "Kamu haus akan tempat baru, jalur tak terjamah, dan view yang belum viral.", color: "hsl(158 64% 22%)" },
  relaxer:    { label: "The Relaxer",    tagline: "Pencari Ketenangan",      description: "Liburan idealmu adalah suara ombak, kabut pagi, dan waktu untuk diri sendiri.", color: "hsl(195 50% 45%)" },
  culture:    { label: "The Culture Seeker", tagline: "Penyelam Budaya",      description: "Kamu jatuh cinta pada cerita, ritual, dan kearifan lokal yang otentik.", color: "hsl(28 75% 50%)" },
  adventurer: { label: "The Adventurer", tagline: "Pemberani Alam",          description: "Trekking, diving, gunung — adrenalinmu hidup di alam liar.", color: "hsl(15 70% 50%)" },
  foodie:     { label: "The Foodie",     tagline: "Pemburu Rasa",            description: "Setiap perjalanan adalah peta rasa: warung pinggir jalan sampai pasar tradisional.", color: "hsl(340 60% 50%)" },
};

export type Destination = {
  id: string;
  slug: string;
  name: string;
  region: string;
  province: string;
  category: "Pantai" | "Gunung" | "Budaya" | "Air Terjun" | "Danau" | "Desa" | "Kuliner";
  matches: Personality[];
  hiddenScore: number; // 1-10 — semakin tinggi semakin tersembunyi
  sentimentScore: number; // 0-100
  estCost: number; // estimasi biaya per orang per hari (IDR)
  duration: string;
  bestMonths: string;
  description: string;
  highlights: string[];
  image: string;
};

export const destinations: Destination[] = [
  {
    id: "1", slug: "pulau-kanawa",
    name: "Pulau Kanawa", region: "Labuan Bajo", province: "Nusa Tenggara Timur",
    category: "Pantai", matches: ["relaxer", "explorer"],
    hiddenScore: 8, sentimentScore: 92, estCost: 450000,
    duration: "2-3 hari", bestMonths: "Apr - Okt",
    description: "Pulau kecil di gugusan Komodo dengan air kristal jernih dan koral hidup dekat bibir pantai. Sunset di sini terasa seperti milik pribadi.",
    highlights: ["Snorkeling reef <5m", "Sunset viewpoint bukit", "Bungalow di tepi pantai", "Tanpa sinyal — full disconnect"],
    image: "/images/dest/hero-beach.jpg",
  },
  {
    id: "2", slug: "desa-wae-rebo",
    name: "Desa Wae Rebo", region: "Manggarai", province: "Nusa Tenggara Timur",
    category: "Desa", matches: ["culture", "explorer"],
    hiddenScore: 9, sentimentScore: 95, estCost: 600000,
    duration: "2 hari 1 malam", bestMonths: "Apr - Sep",
    description: "Desa adat di ketinggian 1.100 mdpl dengan 7 rumah Mbaru Niang berbentuk kerucut. Ditempuh trekking 3-4 jam dari Denge.",
    highlights: ["Menginap di rumah adat", "Upacara penyambutan", "Kopi Manggarai langsung dari kebun", "Trekking hutan tropis"],
    image: "/images/dest/dest-village.jpg",
  },
  {
    id: "3", slug: "air-terjun-tumpak-sewu",
    name: "Air Terjun Tumpak Sewu", region: "Lumajang", province: "Jawa Timur",
    category: "Air Terjun", matches: ["adventurer", "explorer"],
    hiddenScore: 6, sentimentScore: 90, estCost: 250000,
    duration: "1 hari", bestMonths: "Mei - Sep",
    description: "Tirai air raksasa berbentuk setengah lingkaran. Turun ke dasar lewat tali dan sungai — bukan untuk yang takut basah.",
    highlights: ["Trek ke dasar (challenging)", "Panorama view dari atas", "Gua Tetes nearby", "Foto golden hour"],
    image: "/images/dest/dest-waterfall.jpg",
  },
  {
    id: "4", slug: "danau-kelimutu",
    name: "Danau Tiga Warna Kelimutu", region: "Ende", province: "Nusa Tenggara Timur",
    category: "Danau", matches: ["explorer", "culture"],
    hiddenScore: 7, sentimentScore: 94, estCost: 500000,
    duration: "2 hari", bestMonths: "Jun - Sep",
    description: "Tiga danau kawah dengan warna berbeda dan terus berubah. Sunrise dari puncak adalah pengalaman spiritual yang dipercaya warga lokal.",
    highlights: ["Sunrise tour 04:00", "3 danau warna berbeda", "Kampung Moni di kaki gunung", "Tenun ikat lokal"],
    image: "/images/dest/dest-crater.jpg",
  },
  {
    id: "5", slug: "sawah-jatiluwih",
    name: "Sawah Terasering Jatiluwih", region: "Tabanan", province: "Bali",
    category: "Budaya", matches: ["relaxer", "culture", "foodie"],
    hiddenScore: 5, sentimentScore: 88, estCost: 350000,
    duration: "1-2 hari", bestMonths: "Sepanjang tahun",
    description: "Warisan UNESCO. Sistem subak ratusan tahun dengan view sawah hijau berlapis dan kabut pagi yang sinematik.",
    highlights: ["Trekking sawah 1-3 jam", "Warung lokal dengan view", "Pure Luhur Petali", "Kopi & teh organik"],
    image: "/images/dest/dest-rice.jpg",
  },
  {
    id: "6", slug: "pulau-rote",
    name: "Pulau Rote — Nemberala", region: "Rote Ndao", province: "Nusa Tenggara Timur",
    category: "Pantai", matches: ["adventurer", "relaxer"],
    hiddenScore: 8, sentimentScore: 91, estCost: 550000,
    duration: "3-5 hari", bestMonths: "Jun - Sep",
    description: "Pulau paling selatan Indonesia. Ombak kelas dunia, pantai sepi, dan budaya Sasando yang khas.",
    highlights: ["Surfing T-Land break", "Pantai Bo'a", "Musik Sasando", "Sopi — minuman tradisional"],
    image: "/images/dest/hero-beach.jpg",
  },
  {
    id: "7", slug: "ranu-kumbolo",
    name: "Ranu Kumbolo", region: "Lumajang", province: "Jawa Timur",
    category: "Gunung", matches: ["adventurer", "explorer"],
    hiddenScore: 6, sentimentScore: 93, estCost: 400000,
    duration: "2-3 hari", bestMonths: "Apr - Okt",
    description: "Danau di ketinggian 2.400 mdpl di jalur pendakian Semeru. Refleksi bukit dan langit yang sempurna saat sunrise.",
    highlights: ["Camping tepi danau", "Sunrise di Tanjakan Cinta", "Bukit Oro-oro Ombo", "Sumber air langsung minum"],
    image: "/images/dest/dest-crater.jpg",
  },
  {
    id: "8", slug: "kampung-naga",
    name: "Kampung Naga", region: "Tasikmalaya", province: "Jawa Barat",
    category: "Desa", matches: ["culture", "foodie"],
    hiddenScore: 7, sentimentScore: 89, estCost: 300000,
    duration: "1 hari", bestMonths: "Sepanjang tahun",
    description: "Kampung adat Sunda yang menolak listrik & teknologi modern. Hidup dalam harmoni dengan tradisi dan alam.",
    highlights: ["Rumah panggung tradisional", "Anyaman bambu", "Nasi liwet otentik", "Sungai Ciwulan"],
    image: "/images/dest/dest-village.jpg",
  },
];

// --- KUIS KEPRIBADIAN WISATA ---
export type QuizOption = { text: string; weights: Partial<Record<Personality, number>> };
export type QuizQuestion = { id: number; question: string; options: QuizOption[] };

export const quizQuestions: QuizQuestion[] = [
  { id: 1, question: "Liburan ideal kamu dimulai dengan…",
    options: [
      { text: "Bangun dengan suara ombak, baca buku di hammock", weights: { relaxer: 3, foodie: 1 } },
      { text: "Trekking subuh menuju view sunrise", weights: { adventurer: 3, explorer: 2 } },
      { text: "Ngopi di warung lokal sambil ngobrol sama warga", weights: { culture: 3, foodie: 2 } },
      { text: "Cek peta — cari spot yang belum ada di Instagram", weights: { explorer: 3 } },
    ] },
  { id: 2, question: "Foto liburan favoritmu pasti tentang…",
    options: [
      { text: "Lanskap luas, alam liar yang dramatis", weights: { explorer: 2, adventurer: 2 } },
      { text: "Detail makanan lokal & meja makan", weights: { foodie: 3 } },
      { text: "Senyum warga, ritual, kerajinan tangan", weights: { culture: 3 } },
      { text: "Diri sendiri yang relaks, view pantai sunset", weights: { relaxer: 3 } },
    ] },
  { id: 3, question: "Untuk transportasi, kamu lebih pilih…",
    options: [
      { text: "Sewa motor, jelajah jalan kecil", weights: { explorer: 3, adventurer: 1 } },
      { text: "Mobil nyaman dengan AC dan playlist", weights: { relaxer: 3 } },
      { text: "Angkot / ojek lokal — sambil ngobrol", weights: { culture: 3, foodie: 1 } },
      { text: "Trekking & jalan kaki", weights: { adventurer: 3 } },
    ] },
  { id: 4, question: "Budget per hari yang nyaman buat kamu?",
    options: [
      { text: "< Rp 300rb — backpacker mode", weights: { adventurer: 2, explorer: 2 } },
      { text: "Rp 300-500rb — mid range nyaman", weights: { culture: 1, foodie: 1, relaxer: 1, explorer: 1 } },
      { text: "Rp 500rb-1jt — comfort matters", weights: { relaxer: 3, foodie: 2 } },
      { text: "Fleksibel — yang penting pengalamannya", weights: { culture: 2, explorer: 1, foodie: 1 } },
    ] },
  { id: 5, question: "Souvenir yang pasti kamu bawa pulang?",
    options: [
      { text: "Kerajinan tangan / kain tenun", weights: { culture: 3 } },
      { text: "Bumbu & makanan khas", weights: { foodie: 3 } },
      { text: "Foto & video — kenangan visual", weights: { explorer: 2, relaxer: 2 } },
      { text: "Bekas luka / cerita ekstrem 😅", weights: { adventurer: 3 } },
    ] },
  { id: 6, question: "Pilih satu kalimat yang paling kamu setuju:",
    options: [
      { text: "Tujuan terbaik adalah yang belum punya nama di Google", weights: { explorer: 3 } },
      { text: "Kenyamanan adalah hak, bukan pemborosan", weights: { relaxer: 3 } },
      { text: "Setiap tempat punya cerita, tugas kita mendengarkan", weights: { culture: 3 } },
      { text: "Hidup terlalu singkat untuk tidak basah, capek, dan terbakar matahari", weights: { adventurer: 3 } },
      { text: "Kamu belum benar-benar di sebuah tempat sampai mencicipi makanannya", weights: { foodie: 3 } },
    ] },
  { id: 7, question: "Kamu lebih suka menginap di…",
    options: [
      { text: "Boutique resort dengan spa", weights: { relaxer: 3 } },
      { text: "Homestay warga lokal", weights: { culture: 3, foodie: 1 } },
      { text: "Tenda / camping di alam", weights: { adventurer: 3, explorer: 1 } },
      { text: "Bungalow tepi pantai terpencil", weights: { explorer: 2, relaxer: 2 } },
    ] },
];

export function calculatePersonality(answers: number[]): Personality {
  const scores: Record<Personality, number> = {
    explorer: 0, relaxer: 0, culture: 0, adventurer: 0, foodie: 0,
  };
  answers.forEach((optIdx, qIdx) => {
    const q = quizQuestions[qIdx];
    if (!q) return;
    const opt = q.options[optIdx];
    if (!opt) return;
    Object.entries(opt.weights).forEach(([k, v]) => {
      scores[k as Personality] += v ?? 0;
    });
  });
  return (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]) as Personality;
}

export function getRecommendations(p: Personality): Destination[] {
  return [...destinations]
    .map((d) => ({ d, score: (d.matches.includes(p) ? 100 : 30) + d.hiddenScore * 3 + d.sentimentScore * 0.3 }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.d);
}
