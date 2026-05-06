# 🌿 HIDN — Find Your Hidden Indonesia

Platform travel personal berbasis kuis kepribadian wisata. Temukan **hidden gems Indonesia** yang sesuai karaktermu.

> Project ini dibuat untuk **Karya Salemba Empat (KSE) Juara 2026** oleh tim **Mengejar Nilai Mutu A** — IPB University.

![HIDN](./src/assets/hero-beach.jpg)

---

## ✨ Fitur (B2G — Business to Government)

| Fitur | Status |
|---|---|
| 🔐 **Login & Register** dengan **2 role**: Traveler & Government | ✅ |
| 🧠 **Kuis Kepribadian** (7 pertanyaan, 5 tipe) — match by **kategori dataset, tanpa AI** | ✅ |
| 🗺 **Hidden Gem Discovery** (filter, sort, search) | ✅ |
| 📅 **Smart Itinerary** (per hari, per jam) + **Save** favorit | ✅ |
| 🧾 **Booking destinasi** lengkap (tanggal, jumlah orang, lama, total otomatis, kode booking) | ✅ |
| 📋 **Booking Saya** (riwayat + cancel) | ✅ |
| 🏛 **Government Dashboard** — kelola destinasi (CRUD) + lihat & approve booking + statistik | ✅ |

> 🔒 **Wajib login:** Quiz, Detail Destinasi, Booking, Itinerary, Saved, Booking Saya, Dashboard.
> 🌐 **Bebas:** Beranda & Hidden Gems.

---

## 👤 Akun Demo (otomatis dibuat)

| Role | Email | Password |
|---|---|---|
| Traveler  | `demo@hidn.id`  | `demo1234` |
| Government | `gov@ntt.go.id` | `demo1234` |
| Admin     | `admin@hidn.id` | `demo1234` |

Login dengan akun **government** → otomatis diarahkan ke **Dashboard** untuk menambah destinasi & approve booking.

---

## 📦 Tech Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express
- **Database:** PostgreSQL 16 (via Docker)
- **DB Tool:** DBeaver (manual setup)

---

## 🚀 Tutorial Setup (Step-by-Step)

> ⏱ Total waktu setup: **±10 menit** (kalau Docker & Node sudah terinstall).

### 📋 Prasyarat

Install dulu di laptopmu:

1. **[Node.js 20+](https://nodejs.org/)** → cek dengan `node -v`
2. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** → cek dengan `docker -v`
3. **[Git](https://git-scm.com/downloads)** → cek dengan `git --version`
4. **[DBeaver Community](https://dbeaver.io/download/)** (gratis)

---

### 1️⃣ Clone repository dari GitHub

```bash
git clone https://github.com/USERNAME-KAMU/hidn.git
cd hidn
```

> Ganti `USERNAME-KAMU` dengan username GitHub-mu setelah project di-push.

---

### 2️⃣ Jalankan database PostgreSQL via Docker

Dari folder root project:

```bash
docker compose up -d
```

Yang terjadi:
- Container `hidn-postgres` jalan di **port 5432**
- Schema otomatis dibuat (file `backend/db/schema.sql`)
- Seed data otomatis di-insert (file `backend/db/seed.sql`) → 8 destinasi, 7 pertanyaan kuis, 1 user demo

Cek status:
```bash
docker compose ps
```

Harus muncul `hidn-postgres` dengan status `Up (healthy)`.

> 💡 Untuk **stop**: `docker compose down`
> Untuk **reset DB & ulangi seed**: `docker compose down -v` lalu `docker compose up -d`

---

### 3️⃣ Connect ke database via DBeaver

1. Buka **DBeaver**
2. Klik **Database → New Database Connection** → pilih **PostgreSQL**
3. Isi koneksi:

   | Field | Value |
   |---|---|
   | Host | `localhost` |
   | Port | `5432` |
   | Database | `hidn_db` |
   | Username | `hidn` |
   | Password | `hidn123` |

4. Klik **Test Connection** → kalau muncul "Connected", klik **Finish**.
5. Di kiri, expand **hidn_db → Schemas → public → Tables**. Kamu akan lihat:
   - `users` _(berisi password_hash bcrypt — JANGAN edit langsung)_
   - `destinations`
   - `quiz_questions`
   - `quiz_options`
   - `quiz_results`
   - `saved_destinations`
   - `itineraries`
   - `itinerary_items`

6. Coba query SQL:
   ```sql
   -- Lihat user yang terdaftar
   SELECT id, email, full_name, personality, created_at FROM users;

   -- Top hidden gems
   SELECT name, region, hidden_score, sentiment_score
   FROM destinations
   ORDER BY hidden_score DESC;

   -- Lihat hasil kuis user
   SELECT u.email, qr.personality, qr.scores, qr.created_at
   FROM quiz_results qr JOIN users u ON u.id = qr.user_id
   ORDER BY qr.created_at DESC;
   ```

---

### 4️⃣ Jalankan backend (Express API)

Buka terminal **baru**, dari folder root project:

```bash
cd backend
npm install
npm run dev
```

Output:
```
✨ HIDN backend running at http://localhost:4000
   Health check: http://localhost:4000/api/health
```

Test di browser → buka [http://localhost:4000/api/health](http://localhost:4000/api/health) → harus muncul `{"ok": true, "db": "connected", ...}`

**Daftar endpoint API yang tersedia:**

| Method | Endpoint | Auth | Fungsi |
|---|---|---|---|
| GET | `/api/health` | — | Cek koneksi DB |
| POST | `/api/auth/register` | — | Daftar akun baru |
| POST | `/api/auth/login` | — | Login → dapat JWT token |
| GET | `/api/auth/me` | 🔒 | Profil user yang sedang login |
| GET | `/api/destinations` | — | Semua destinasi |
| GET | `/api/destinations/:slug` | — | Detail 1 destinasi |
| GET | `/api/destinations/recommend/:personality` | — | Rekomendasi per tipe |
| GET | `/api/quiz` | — | Pertanyaan + opsi kuis |
| POST | `/api/quiz/submit` | 🔒 | Submit jawaban kuis |
| GET | `/api/saved` | 🔒 | Destinasi tersimpan user |
| POST | `/api/saved` | 🔒 | Tambah ke saved |
| DELETE | `/api/saved` | 🔒 | Hapus dari saved |
| GET | `/api/itineraries` | 🔒 | Itinerary user |
| POST | `/api/itineraries` | 🔒 | Buat itinerary baru |
| POST | `/api/itineraries/:id/items` | 🔒 | Tambah aktivitas |
| DELETE | `/api/itineraries/:id` | 🔒 | Hapus itinerary |
| DELETE | `/api/itineraries/items/:itemId` | 🔒 | Hapus aktivitas |

> 🔒 = wajib kirim header `Authorization: Bearer <token>` (didapat dari `/api/auth/login`).

> ⚠️ **Set `JWT_SECRET`:** copy `backend/.env.example` → `backend/.env`, ganti `JWT_SECRET` ke string random panjang. Default fallback: `dev-secret-change-me` (cukup untuk dev).

---

### 5️⃣ Jalankan frontend (React app)

Buka terminal **baru lagi** (jadi total 2 terminal jalan: backend + frontend), dari folder **root**:

```bash
npm install
npm run dev
```

Output:
```
  VITE ready in 800 ms
  ➜  Local:   http://localhost:8080/
```

Buka [http://localhost:8080](http://localhost:8080) di browser.

🎉 **Aplikasi HIDN sudah jalan!**

---

### 6️⃣ Coba alur login → kuis → itinerary

1. Klik **Daftar** di pojok kanan Navbar → bikin akun baru, **atau** klik **Masuk** dan pakai akun demo:
   - Email: `demo@hidn.id`
   - Password: `demo1234`
2. Setelah login, kerjakan **Kuis Kepribadian** (7 pertanyaan) → hasil tipe traveler tersimpan otomatis di tabel `quiz_results` & kolom `users.personality`.
3. Buka **Hidden Gems** → klik salah satu kartu → Save ❤️ → cek menu **Saved**.
4. Buka **Itinerary** → buat trip baru → tambah aktivitas per hari/jam.
5. Verifikasi di DBeaver: query `SELECT * FROM saved_destinations;` dan `SELECT * FROM itineraries;` — datanya muncul terkait `user_id`-mu.

---

## 🗂 Struktur Project

```
hidn/
├── backend/                    # Express API + PostgreSQL
│   ├── db/
│   │   ├── schema.sql          # Definisi tabel (termasuk users.password_hash)
│   │   └── seed.sql            # Data awal (8 destinasi, 7 kuis, demo user)
│   ├── src/
│   │   └── server.js           # Express + auth (bcrypt + JWT) + semua endpoint
│   ├── .env.example            # Template DATABASE_URL, PORT, JWT_SECRET
│   └── package.json
├── src/                        # Frontend React
│   ├── assets/                 # Logo & gambar destinasi
│   ├── components/
│   │   ├── Navbar.tsx          # Tombol Masuk/Daftar/Keluar
│   │   ├── ProtectedRoute.tsx  # Guard untuk halaman wajib login
│   │   └── ...
│   ├── data/hidn.ts            # Data lokal (mirror dari DB) + helper
│   ├── lib/api.ts              # Fetch wrapper + token storage
│   ├── pages/                  # Index, Login, Register, Quiz, Discover, ...
│   └── store/
│       ├── authStore.ts        # Auth state (JWT di localStorage)
│       └── hidnStore.ts        # State saved/itinerary
├── public/images/dest/         # Gambar destinasi (jpg)
├── docker-compose.yml          # Postgres container
├── package.json                # Frontend deps
└── README.md                   # Dokumen ini
```

---

## 🐙 Cara Push ke GitHub-mu Sendiri

Project ini sudah siap. Tinggal:

```bash
# 1. Bikin repo kosong di github.com (jangan centang README)
# 2. Di folder project ini:
git init
git add .
git commit -m "Initial commit: HIDN Find Your Hidden Indonesia"
git branch -M main
git remote add origin https://github.com/USERNAME-KAMU/hidn.git
git push -u origin main
```

---

## 🛠 Troubleshooting

| Masalah | Solusi |
|---|---|
| `port 5432 already in use` | Stop Postgres lokal: `brew services stop postgresql` (Mac) atau matikan service Postgres di Windows. |
| `docker: command not found` | Install Docker Desktop & jalankan dulu sebelum `docker compose up`. |
| DBeaver "Connection refused" | Cek `docker compose ps` — harus `Up`. Cek juga port 5432 tidak diblok firewall. |
| Backend "ECONNREFUSED" | Pastikan Postgres jalan dulu (`docker compose up -d`) sebelum `npm run dev` di backend. |
| Frontend tidak load gambar | Pastikan folder `public/images/dest/` ada dan berisi 5 file `.jpg`. |
| Login error "Failed to fetch" | Backend belum jalan atau di port lain. Cek `http://localhost:4000/api/health`. Kalau backend di port lain, set `VITE_API_URL=http://localhost:PORT` di file `.env` di root frontend. |
| "Email atau password salah" pakai akun demo | Database belum di-seed ulang. Reset: `docker compose down -v && docker compose up -d`. |
| Reset semua data (termasuk user) | `docker compose down -v && docker compose up -d` |

---

## 📐 Mockup Figma

File mockup design system + semua halaman tersedia di:
**`mockups/HIDN-Figma-Mockup.pdf`**

**Cara import ke Figma:**
1. Buka [figma.com](https://figma.com) → **New design file**
2. Drag & drop file PDF ke canvas → otomatis jadi frame per halaman
3. Edit, ungroup, atau extract komponen seperti file Figma biasa

---

## 👥 Tim Pengembang

**Mengejar Nilai Mutu A** — IPB University 2026

- **Aqila Begum Fahm Ara** — Ketua
- **Saskia Ananda Putri** — Anggota
- **Syalwa Syaidah** — Anggota

📧 aqilabegum@apps.ipb.ac.id · ☎ +62 813 1453 9216

---

## 📜 License

MIT — bebas digunakan untuk tujuan akademik & pengembangan.
