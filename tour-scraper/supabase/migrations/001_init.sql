-- =============================================
-- Tour Scraper Schema (runs inside Jongtour's Supabase)
-- =============================================

-- ─── Tours ──────────────────────────────────
CREATE TABLE IF NOT EXISTS scraper_tours (
  id              BIGSERIAL PRIMARY KEY,
  site            TEXT NOT NULL,                     -- 'oneworldtour' | 'itravels'
  tour_code       TEXT NOT NULL,
  source_url      TEXT NOT NULL UNIQUE,
  title           TEXT,
  country         TEXT,
  duration        TEXT,                              -- "5 วัน 4 คืน"
  price_from      NUMERIC(12,2),
  airline         TEXT,
  description     TEXT,
  itinerary_html  TEXT,
  pdf_url         TEXT,
  cover_image_url TEXT,
  raw_hash        CHAR(64),                          -- SHA256 of HTML to detect changes
  first_seen_at   TIMESTAMPTZ DEFAULT NOW(),
  last_scraped_at TIMESTAMPTZ DEFAULT NOW(),
  is_active       BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_scraper_tours_site_code ON scraper_tours(site, tour_code);
CREATE INDEX IF NOT EXISTS idx_scraper_tours_country ON scraper_tours(country);

-- ─── Tour Periods (departure dates) ────────
CREATE TABLE IF NOT EXISTS scraper_tour_periods (
  id          BIGSERIAL PRIMARY KEY,
  tour_id     BIGINT REFERENCES scraper_tours(id) ON DELETE CASCADE,
  start_date  DATE,
  end_date    DATE,
  price       NUMERIC(12,2),
  seats_left  INT,
  status      TEXT DEFAULT 'open',                   -- open | full | closed
  raw_text    TEXT,
  UNIQUE(tour_id, start_date)
);

CREATE INDEX IF NOT EXISTS idx_scraper_periods_dates ON scraper_tour_periods(start_date);

-- ─── Tour Images ────────────────────────────
CREATE TABLE IF NOT EXISTS scraper_tour_images (
  id            BIGSERIAL PRIMARY KEY,
  tour_id       BIGINT REFERENCES scraper_tours(id) ON DELETE CASCADE,
  original_url  TEXT,
  storage_path  TEXT,                                -- path in Supabase Storage
  public_url    TEXT,
  file_hash     CHAR(64),                            -- SHA256 for dedup
  width         INT,
  height        INT,
  file_size     INT,
  sort_order    INT DEFAULT 0,
  UNIQUE(tour_id, file_hash)
);

-- ─── Scrape Run Logs ────────────────────────
CREATE TABLE IF NOT EXISTS scraper_runs (
  id            BIGSERIAL PRIMARY KEY,
  site          TEXT NOT NULL,
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  finished_at   TIMESTAMPTZ,
  status        TEXT DEFAULT 'running',              -- running | success | failed
  urls_found    INT DEFAULT 0,
  urls_scraped  INT DEFAULT 0,
  urls_failed   INT DEFAULT 0,
  images_saved  INT DEFAULT 0,
  error_log     TEXT
);

-- ─── Storage Bucket ─────────────────────────
-- Run in Supabase Dashboard: create bucket 'tour-images' with public access
-- Or via SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('tour-images', 'tour-images', true)
--   ON CONFLICT (id) DO NOTHING;
