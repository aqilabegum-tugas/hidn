import "dotenv/config";
import express from "express";
import cors from "cors";
import pkg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES = "7d";

const app = express();
app.use(cors());
app.use(express.json());

// === HELPERS ===
function authRequired(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden — role tidak diizinkan" });
    next();
  };
}
function isEmail(s) { return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }
function slugify(s) {
  return String(s).toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "")
    .trim().replace(/\s+/g, "-").slice(0, 140);
}
function bookingCode() {
  return "HIDN-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

// === HEALTH ===
app.get("/api/health", async (_req, res) => {
  try {
    const r = await pool.query("SELECT now() as time, version() as pg");
    res.json({ ok: true, db: "connected", time: r.rows[0].time, pg: r.rows[0].pg.split(" ")[1] });
  } catch (e) { res.status(500).json({ ok: false, error: String(e) }); }
});

// === AUTH ===
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, fullName, password, role, organization, phone } = req.body || {};
    const userRole = role === "government" ? "government" : "traveler";
    if (!isEmail(email)) return res.status(400).json({ error: "Email tidak valid" });
    if (!fullName || fullName.trim().length < 2) return res.status(400).json({ error: "Nama minimal 2 karakter" });
    if (!password || password.length < 6) return res.status(400).json({ error: "Password minimal 6 karakter" });
    if (userRole === "government" && (!organization || organization.trim().length < 3))
      return res.status(400).json({ error: "Nama instansi/dinas wajib diisi untuk akun government" });
    const exists = await pool.query("SELECT 1 FROM users WHERE email=$1", [email.toLowerCase()]);
    if (exists.rowCount) return res.status(409).json({ error: "Email sudah terdaftar" });
    const hash = await bcrypt.hash(password, 10);
    const r = await pool.query(
      `INSERT INTO users (email, full_name, password_hash, role, organization, phone)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, email, full_name, role, organization, phone, personality, created_at`,
      [email.toLowerCase(), fullName.trim(), hash, userRole, organization?.trim() || null, phone?.trim() || null]
    );
    const user = r.rows[0];
    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ token, user });
  } catch (e) { console.error(e); res.status(500).json({ error: "Server error" }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!isEmail(email) || !password) return res.status(400).json({ error: "Email & password wajib diisi" });
    const r = await pool.query("SELECT * FROM users WHERE email=$1", [email.toLowerCase()]);
    const u = r.rows[0];
    if (!u) return res.status(401).json({ error: "Email atau password salah" });
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: "Email atau password salah" });
    const token = jwt.sign({ sub: u.id, email: u.email, role: u.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({
      token,
      user: { id: u.id, email: u.email, full_name: u.full_name, role: u.role, organization: u.organization,
              phone: u.phone, personality: u.personality, created_at: u.created_at },
    });
  } catch (e) { console.error(e); res.status(500).json({ error: "Server error" }); }
});

app.get("/api/auth/me", authRequired, async (req, res) => {
  const r = await pool.query(
    "SELECT id, email, full_name, role, organization, phone, personality, created_at FROM users WHERE id=$1",
    [req.user.sub]);
  if (!r.rows[0]) return res.status(404).json({ error: "User not found" });
  res.json(r.rows[0]);
});

// === DESTINATIONS ===
app.get("/api/destinations", async (req, res) => {
  const { category, sort = "hidden" } = req.query;
  const allowedSort = { hidden: "hidden_score DESC", sentiment: "sentiment_score DESC", cost: "est_cost ASC" };
  const orderBy = allowedSort[sort] || "hidden_score DESC";
  const params = [];
  let where = "WHERE status = 'approved'";
  if (category && category !== "Semua") { params.push(category); where += ` AND category = $1`; }
  const r = await pool.query(`SELECT * FROM destinations ${where} ORDER BY ${orderBy}`, params);
  res.json(r.rows);
});

app.get("/api/destinations/:slug", async (req, res) => {
  const r = await pool.query("SELECT * FROM destinations WHERE slug = $1", [req.params.slug]);
  if (!r.rows[0]) return res.status(404).json({ error: "Not found" });
  res.json(r.rows[0]);
});

// Rekomendasi by personality — RULE BASED via tabel personality_categories
app.get("/api/destinations/recommend/:personality", async (req, res) => {
  const { personality } = req.params;
  const r = await pool.query(
    `SELECT d.*,
            COALESCE(pc.weight, 0) AS category_weight,
            ($1 = ANY(d.matches))::int AS direct_match
     FROM destinations d
     LEFT JOIN personality_categories pc
            ON pc.personality = $1::personality_type AND pc.category = d.category
     WHERE d.status = 'approved'
     ORDER BY direct_match DESC, category_weight DESC, d.hidden_score DESC, d.sentiment_score DESC
     LIMIT 9`,
    [personality]
  );
  res.json(r.rows);
});

// === GOVERNMENT: CRUD destinasi sendiri ===
app.get("/api/gov/destinations", authRequired, requireRole("government", "admin"), async (req, res) => {
  const params = req.user.role === "admin" ? [] : [req.user.sub];
  const where = req.user.role === "admin" ? "" : "WHERE created_by = $1";
  const r = await pool.query(`SELECT * FROM destinations ${where} ORDER BY created_at DESC`, params);
  res.json(r.rows);
});

app.post("/api/gov/destinations", authRequired, requireRole("government", "admin"), async (req, res) => {
  try {
    const b = req.body || {};
    const required = ["name","region","province","category","description","duration","best_months"];
    for (const k of required) if (!b[k]) return res.status(400).json({ error: `Field "${k}" wajib diisi` });
    const slug = (b.slug && slugify(b.slug)) || slugify(b.name + "-" + b.region);
    const r = await pool.query(
      `INSERT INTO destinations
       (slug, name, region, province, category, hidden_score, sentiment_score, est_cost, duration, best_months,
        description, highlights, matches, image_url, created_by, status, capacity_per_day)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING *`,
      [
        slug, b.name, b.region, b.province, b.category,
        Math.max(1, Math.min(10, +b.hidden_score || 5)),
        Math.max(0, Math.min(100, +b.sentiment_score || 80)),
        +b.est_cost || 300000, b.duration, b.best_months,
        b.description,
        Array.isArray(b.highlights) ? b.highlights : (b.highlights ? String(b.highlights).split("\n").map(s=>s.trim()).filter(Boolean) : []),
        Array.isArray(b.matches) ? b.matches : [],
        b.image_url || "/images/dest/dest-village.jpg",
        req.user.sub,
        req.user.role === "admin" ? (b.status || "approved") : "approved",
        +b.capacity_per_day || 50,
      ]
    );
    res.json(r.rows[0]);
  } catch (e) {
    if (String(e).includes("duplicate")) return res.status(409).json({ error: "Slug sudah dipakai destinasi lain" });
    console.error(e); res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/gov/destinations/:id", authRequired, requireRole("government", "admin"), async (req, res) => {
  const b = req.body || {};
  const own = await pool.query("SELECT created_by FROM destinations WHERE id=$1", [req.params.id]);
  if (!own.rowCount) return res.status(404).json({ error: "Tidak ditemukan" });
  if (req.user.role !== "admin" && own.rows[0].created_by !== req.user.sub)
    return res.status(403).json({ error: "Bukan milikmu" });
  const r = await pool.query(
    `UPDATE destinations SET
       name=COALESCE($1,name), region=COALESCE($2,region), province=COALESCE($3,province),
       category=COALESCE($4,category), hidden_score=COALESCE($5,hidden_score),
       sentiment_score=COALESCE($6,sentiment_score), est_cost=COALESCE($7,est_cost),
       duration=COALESCE($8,duration), best_months=COALESCE($9,best_months),
       description=COALESCE($10,description), highlights=COALESCE($11,highlights),
       matches=COALESCE($12,matches), image_url=COALESCE($13,image_url),
       capacity_per_day=COALESCE($14,capacity_per_day), updated_at=now()
     WHERE id=$15 RETURNING *`,
    [b.name, b.region, b.province, b.category, b.hidden_score, b.sentiment_score, b.est_cost,
     b.duration, b.best_months, b.description,
     Array.isArray(b.highlights) ? b.highlights : null,
     Array.isArray(b.matches) ? b.matches : null,
     b.image_url, b.capacity_per_day, req.params.id]
  );
  res.json(r.rows[0]);
});

app.delete("/api/gov/destinations/:id", authRequired, requireRole("government", "admin"), async (req, res) => {
  const own = await pool.query("SELECT created_by FROM destinations WHERE id=$1", [req.params.id]);
  if (!own.rowCount) return res.status(404).json({ error: "Tidak ditemukan" });
  if (req.user.role !== "admin" && own.rows[0].created_by !== req.user.sub)
    return res.status(403).json({ error: "Bukan milikmu" });
  await pool.query("DELETE FROM destinations WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

// Bookings yang masuk untuk destinasi milik government
app.get("/api/gov/bookings", authRequired, requireRole("government", "admin"), async (req, res) => {
  const params = req.user.role === "admin" ? [] : [req.user.sub];
  const where = req.user.role === "admin" ? "" : "WHERE d.created_by = $1";
  const r = await pool.query(
    `SELECT b.*, d.name AS destination_name, d.region AS destination_region, d.slug AS destination_slug,
            u.full_name AS user_name, u.email AS user_email
     FROM bookings b
     JOIN destinations d ON d.id = b.destination_id
     LEFT JOIN users u ON u.id = b.user_id
     ${where}
     ORDER BY b.created_at DESC`,
    params
  );
  res.json(r.rows);
});

app.patch("/api/gov/bookings/:id/status", authRequired, requireRole("government", "admin"), async (req, res) => {
  const { status } = req.body;
  if (!["pending","confirmed","cancelled","completed"].includes(status))
    return res.status(400).json({ error: "Status tidak valid" });
  // pastikan booking untuk destinasi miliknya
  const params = req.user.role === "admin" ? [req.params.id] : [req.params.id, req.user.sub];
  const where = req.user.role === "admin"
    ? "b.id = $1"
    : "b.id = $1 AND d.created_by = $2";
  const r = await pool.query(
    `UPDATE bookings b SET status=$${params.length+1}, updated_at=now()
     FROM destinations d
     WHERE b.destination_id = d.id AND ${where}
     RETURNING b.*`,
    [...params, status]
  );
  if (!r.rowCount) return res.status(404).json({ error: "Booking tidak ditemukan / bukan milikmu" });
  res.json(r.rows[0]);
});

// Statistik dashboard government
app.get("/api/gov/stats", authRequired, requireRole("government", "admin"), async (req, res) => {
  const isAdmin = req.user.role === "admin";
  const params = isAdmin ? [] : [req.user.sub];
  const where = isAdmin ? "" : "WHERE d.created_by = $1";
  const stats = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM destinations d ${where}) AS total_destinations,
       (SELECT COUNT(*)::int FROM bookings b JOIN destinations d ON d.id=b.destination_id ${where}) AS total_bookings,
       (SELECT COUNT(*)::int FROM bookings b JOIN destinations d ON d.id=b.destination_id ${where ? where + " AND " : "WHERE "}b.status='pending') AS pending_bookings,
       (SELECT COALESCE(SUM(b.total_price),0)::bigint FROM bookings b JOIN destinations d ON d.id=b.destination_id ${where ? where + " AND " : "WHERE "}b.status IN ('confirmed','completed')) AS revenue
    `, params);
  res.json(stats.rows[0]);
});

// === QUIZ ===
app.get("/api/quiz", async (_req, res) => {
  const qs = await pool.query("SELECT * FROM quiz_questions ORDER BY ordering");
  const opts = await pool.query("SELECT * FROM quiz_options ORDER BY id");
  const result = qs.rows.map(q => ({ ...q, options: opts.rows.filter(o => o.question_id === q.id) }));
  res.json(result);
});

app.post("/api/quiz/submit", authRequired, async (req, res) => {
  const userId = req.user.sub;
  const { answers } = req.body;
  if (!Array.isArray(answers)) return res.status(400).json({ error: "answers required" });
  const opts = await pool.query("SELECT * FROM quiz_options ORDER BY id");
  const qs = await pool.query("SELECT id FROM quiz_questions ORDER BY ordering");
  const scores = { explorer: 0, relaxer: 0, culture: 0, adventurer: 0, foodie: 0 };
  qs.rows.forEach((q, idx) => {
    const optsForQ = opts.rows.filter(o => o.question_id === q.id);
    const chosen = optsForQ[answers[idx]];
    if (!chosen) return;
    Object.entries(chosen.weights).forEach(([k, v]) => { scores[k] = (scores[k] || 0) + v; });
  });
  const personality = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  await pool.query(
    `INSERT INTO quiz_results (user_id, personality, scores, answers) VALUES ($1, $2, $3, $4)`,
    [userId, personality, scores, answers]
  );
  await pool.query(`UPDATE users SET personality = $1, updated_at = now() WHERE id = $2`, [personality, userId]);
  res.json({ personality, scores });
});

// === SAVED ===
app.get("/api/saved", authRequired, async (req, res) => {
  const r = await pool.query(
    `SELECT d.* FROM saved_destinations s JOIN destinations d ON d.id = s.destination_id WHERE s.user_id = $1`,
    [req.user.sub]);
  res.json(r.rows);
});
app.post("/api/saved", authRequired, async (req, res) => {
  const { destinationId } = req.body;
  await pool.query(`INSERT INTO saved_destinations (user_id, destination_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
    [req.user.sub, destinationId]);
  res.json({ ok: true });
});
app.delete("/api/saved", authRequired, async (req, res) => {
  const { destinationId } = req.body;
  await pool.query(`DELETE FROM saved_destinations WHERE user_id=$1 AND destination_id=$2`, [req.user.sub, destinationId]);
  res.json({ ok: true });
});

// === ITINERARIES ===
app.get("/api/itineraries", authRequired, async (req, res) => {
  const its = await pool.query("SELECT * FROM itineraries WHERE user_id=$1 ORDER BY created_at DESC", [req.user.sub]);
  const ids = its.rows.map(x => x.id);
  const items = ids.length ? await pool.query(`
    SELECT i.*, d.name AS destination_name FROM itinerary_items i
    LEFT JOIN destinations d ON d.id = i.destination_id
    WHERE i.itinerary_id = ANY($1::uuid[])
    ORDER BY i.day, i.start_time
  `, [ids]) : { rows: [] };
  res.json(its.rows.map(it => ({ ...it, items: items.rows.filter(i => i.itinerary_id === it.id) })));
});
app.post("/api/itineraries", authRequired, async (req, res) => {
  const { title } = req.body;
  const r = await pool.query(`INSERT INTO itineraries (user_id, title) VALUES ($1,$2) RETURNING *`, [req.user.sub, title]);
  res.json(r.rows[0]);
});
app.post("/api/itineraries/:id/items", authRequired, async (req, res) => {
  const { destinationId, day, startTime, activity, notes } = req.body;
  const own = await pool.query("SELECT 1 FROM itineraries WHERE id=$1 AND user_id=$2", [req.params.id, req.user.sub]);
  if (!own.rowCount) return res.status(403).json({ error: "Forbidden" });
  const r = await pool.query(
    `INSERT INTO itinerary_items (itinerary_id, destination_id, day, start_time, activity, notes)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.params.id, destinationId, day, startTime, activity, notes]);
  res.json(r.rows[0]);
});
app.delete("/api/itineraries/:id", authRequired, async (req, res) => {
  await pool.query(`DELETE FROM itineraries WHERE id=$1 AND user_id=$2`, [req.params.id, req.user.sub]);
  res.json({ ok: true });
});
app.delete("/api/itineraries/items/:itemId", authRequired, async (req, res) => {
  await pool.query(`
    DELETE FROM itinerary_items i USING itineraries it
    WHERE i.id=$1 AND i.itinerary_id=it.id AND it.user_id=$2
  `, [req.params.itemId, req.user.sub]);
  res.json({ ok: true });
});

// === BOOKINGS (traveler) ===
app.post("/api/bookings", authRequired, async (req, res) => {
  try {
    const b = req.body || {};
    const required = ["destinationId","fullName","email","phone","visitDate","numPeople"];
    for (const k of required) if (!b[k]) return res.status(400).json({ error: `Field "${k}" wajib diisi` });
    const dest = await pool.query("SELECT id, est_cost, name FROM destinations WHERE id=$1 AND status='approved'", [b.destinationId]);
    if (!dest.rowCount) return res.status(404).json({ error: "Destinasi tidak ditemukan" });
    const numDays = Math.max(1, +b.numDays || 1);
    const numPeople = Math.max(1, +b.numPeople);
    const total = dest.rows[0].est_cost * numPeople * numDays;
    const r = await pool.query(
      `INSERT INTO bookings (code, user_id, destination_id, full_name, email, phone, visit_date, num_people, num_days, total_price, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [bookingCode(), req.user.sub, b.destinationId, b.fullName.trim(), b.email.toLowerCase(), b.phone.trim(),
       b.visitDate, numPeople, numDays, total, b.notes || null]);
    res.json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: "Server error" }); }
});

app.get("/api/bookings", authRequired, async (req, res) => {
  const r = await pool.query(
    `SELECT b.*, d.name AS destination_name, d.slug AS destination_slug, d.region AS destination_region,
            d.image_url AS destination_image
     FROM bookings b JOIN destinations d ON d.id = b.destination_id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`, [req.user.sub]);
  res.json(r.rows);
});

app.delete("/api/bookings/:id", authRequired, async (req, res) => {
  const r = await pool.query(
    `UPDATE bookings SET status='cancelled', updated_at=now() WHERE id=$1 AND user_id=$2 RETURNING *`,
    [req.params.id, req.user.sub]);
  if (!r.rowCount) return res.status(404).json({ error: "Tidak ditemukan" });
  res.json(r.rows[0]);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✨ HIDN backend running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});
