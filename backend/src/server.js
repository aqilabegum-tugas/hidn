import "dotenv/config";
import express from "express";
import cors from "cors";
import pkg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES = "7d";

const app = express();
app.use(cors());
app.use(express.json());

// === AUTH MIDDLEWARE ===
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
function isEmail(s) { return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }

// === AUTH ROUTES ===
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, fullName, password } = req.body || {};
    if (!isEmail(email)) return res.status(400).json({ error: "Email tidak valid" });
    if (!fullName || fullName.trim().length < 2) return res.status(400).json({ error: "Nama minimal 2 karakter" });
    if (!password || password.length < 6) return res.status(400).json({ error: "Password minimal 6 karakter" });
    const exists = await pool.query("SELECT 1 FROM users WHERE email=$1", [email.toLowerCase()]);
    if (exists.rowCount) return res.status(409).json({ error: "Email sudah terdaftar" });
    const hash = await bcrypt.hash(password, 10);
    const r = await pool.query(
      `INSERT INTO users (email, full_name, password_hash) VALUES ($1,$2,$3)
       RETURNING id, email, full_name, personality, created_at`,
      [email.toLowerCase(), fullName.trim(), hash]
    );
    const user = r.rows[0];
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
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
    const token = jwt.sign({ sub: u.id, email: u.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ token, user: { id: u.id, email: u.email, full_name: u.full_name, personality: u.personality, created_at: u.created_at } });
  } catch (e) { console.error(e); res.status(500).json({ error: "Server error" }); }
});

app.get("/api/auth/me", authRequired, async (req, res) => {
  const r = await pool.query("SELECT id, email, full_name, personality, created_at FROM users WHERE id=$1", [req.user.sub]);
  if (!r.rows[0]) return res.status(404).json({ error: "User not found" });
  res.json(r.rows[0]);
});
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    const r = await pool.query("SELECT now() as time, version() as pg");
    res.json({ ok: true, db: "connected", time: r.rows[0].time, pg: r.rows[0].pg.split(" ")[1] });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// === DESTINATIONS ===
app.get("/api/destinations", async (req, res) => {
  const { category, sort = "hidden_score" } = req.query;
  const allowedSort = { hidden: "hidden_score DESC", sentiment: "sentiment_score DESC", cost: "est_cost ASC" };
  const orderBy = allowedSort[sort] || "hidden_score DESC";
  const params = [];
  let where = "";
  if (category && category !== "Semua") { params.push(category); where = `WHERE category = $1`; }
  const r = await pool.query(`SELECT * FROM destinations ${where} ORDER BY ${orderBy}`, params);
  res.json(r.rows);
});

app.get("/api/destinations/:slug", async (req, res) => {
  const r = await pool.query("SELECT * FROM destinations WHERE slug = $1", [req.params.slug]);
  if (!r.rows[0]) return res.status(404).json({ error: "Not found" });
  res.json(r.rows[0]);
});

app.get("/api/destinations/recommend/:personality", async (req, res) => {
  const { personality } = req.params;
  const r = await pool.query(
    `SELECT * FROM destinations
     ORDER BY ($1 = ANY(matches)) DESC, hidden_score DESC, sentiment_score DESC
     LIMIT 6`,
    [personality]
  );
  res.json(r.rows);
});

// === QUIZ ===
app.get("/api/quiz", async (_req, res) => {
  const qs = await pool.query("SELECT * FROM quiz_questions ORDER BY ordering");
  const opts = await pool.query("SELECT * FROM quiz_options ORDER BY id");
  const result = qs.rows.map(q => ({
    ...q, options: opts.rows.filter(o => o.question_id === q.id)
  }));
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

// === SAVED (auth required) ===
app.get("/api/saved", authRequired, async (req, res) => {
  const r = await pool.query(
    `SELECT d.* FROM saved_destinations s JOIN destinations d ON d.id = s.destination_id WHERE s.user_id = $1`,
    [req.user.sub]
  );
  res.json(r.rows);
});

app.post("/api/saved", authRequired, async (req, res) => {
  const { destinationId } = req.body;
  await pool.query(
    `INSERT INTO saved_destinations (user_id, destination_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
    [req.user.sub, destinationId]
  );
  res.json({ ok: true });
});

app.delete("/api/saved", authRequired, async (req, res) => {
  const { destinationId } = req.body;
  await pool.query(`DELETE FROM saved_destinations WHERE user_id=$1 AND destination_id=$2`, [req.user.sub, destinationId]);
  res.json({ ok: true });
});

// === ITINERARIES (auth required) ===
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
    [req.params.id, destinationId, day, startTime, activity, notes]
  );
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✨ HIDN backend running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});
