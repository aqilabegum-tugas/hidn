-- HIDN Database Schema
-- PostgreSQL 16

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 5 tipe kepribadian wisata
CREATE TYPE personality_type AS ENUM ('explorer', 'relaxer', 'culture', 'adventurer', 'foodie');

-- Kategori destinasi
CREATE TYPE destination_category AS ENUM ('Pantai', 'Gunung', 'Budaya', 'Air Terjun', 'Danau', 'Desa', 'Kuliner');

-- =========================================
-- USERS
-- =========================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  personality   personality_type,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- DESTINATIONS (Hidden Gems)
-- =========================================
CREATE TABLE IF NOT EXISTS destinations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             VARCHAR(120) UNIQUE NOT NULL,
  name             VARCHAR(255) NOT NULL,
  region           VARCHAR(255) NOT NULL,
  province         VARCHAR(255) NOT NULL,
  category         destination_category NOT NULL,
  hidden_score     SMALLINT NOT NULL CHECK (hidden_score BETWEEN 1 AND 10),
  sentiment_score  SMALLINT NOT NULL CHECK (sentiment_score BETWEEN 0 AND 100),
  est_cost         INTEGER NOT NULL,                   -- IDR per orang per hari
  duration         VARCHAR(100) NOT NULL,
  best_months      VARCHAR(100) NOT NULL,
  description      TEXT NOT NULL,
  highlights       TEXT[] NOT NULL DEFAULT '{}',
  matches          personality_type[] NOT NULL DEFAULT '{}',
  image_url        VARCHAR(500),
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_hidden ON destinations(hidden_score DESC);

-- =========================================
-- QUIZ QUESTIONS
-- =========================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id          SERIAL PRIMARY KEY,
  question    TEXT NOT NULL,
  ordering    SMALLINT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS quiz_options (
  id            SERIAL PRIMARY KEY,
  question_id   INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text   TEXT NOT NULL,
  weights       JSONB NOT NULL  -- {"explorer": 3, "relaxer": 1}
);

-- =========================================
-- QUIZ RESULTS
-- =========================================
CREATE TABLE IF NOT EXISTS quiz_results (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  personality   personality_type NOT NULL,
  scores        JSONB NOT NULL,
  answers       INTEGER[] NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- SAVED DESTINATIONS
-- =========================================
CREATE TABLE IF NOT EXISTS saved_destinations (
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
  saved_at       TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, destination_id)
);

-- =========================================
-- ITINERARIES (Customizable Plan)
-- =========================================
CREATE TABLE IF NOT EXISTS itineraries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS itinerary_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id    UUID REFERENCES itineraries(id) ON DELETE CASCADE,
  destination_id  UUID REFERENCES destinations(id) ON DELETE SET NULL,
  day             SMALLINT NOT NULL,
  start_time      TIME NOT NULL,
  activity        VARCHAR(500) NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_itinerary_items_itinerary ON itinerary_items(itinerary_id, day, start_time);

-- =========================================
-- VIEWS
-- =========================================
CREATE OR REPLACE VIEW v_top_hidden_gems AS
SELECT id, name, region, province, category, hidden_score, sentiment_score, est_cost, image_url
FROM destinations
ORDER BY hidden_score DESC, sentiment_score DESC;
