-- Rallyo — Volunteer Scheduling SaaS for Nonprofits
-- Dynamic events, days, slots — all admin-configurable

-- ─── Events ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  org_name TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  accent_color TEXT DEFAULT '#2B6CA3',
  start_date TEXT NOT NULL,       -- YYYY-MM-DD
  end_date TEXT NOT NULL,         -- YYYY-MM-DD
  admin_password TEXT NOT NULL,
  status TEXT DEFAULT 'draft',    -- draft, open, closed
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Days (per event) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS days (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  date TEXT NOT NULL,             -- YYYY-MM-DD
  label TEXT NOT NULL,            -- "Mar 3 mars"
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(event_id, date)
);
CREATE INDEX IF NOT EXISTS idx_days_event ON days(event_id);

-- ─── Slots (per day) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_id INTEGER NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  label TEXT NOT NULL,            -- "Matin", "Après-midi", "Soir"
  start_time TEXT NOT NULL,       -- "9h" or "9h30"
  end_time TEXT NOT NULL,         -- "13h"
  min_volunteers INTEGER NOT NULL DEFAULT 3,
  max_volunteers INTEGER NOT NULL DEFAULT 4,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_slots_day ON slots(day_id);

-- ─── Volunteers ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS volunteers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  token TEXT NOT NULL,            -- 8-char personal code
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_volunteers_event ON volunteers(event_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_volunteers_token ON volunteers(event_id, token);

-- ─── Registrations (volunteer × slot) ──────────────────────
CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  volunteer_id INTEGER NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  slot_id INTEGER NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(volunteer_id, slot_id)
);
CREATE INDEX IF NOT EXISTS idx_reg_volunteer ON registrations(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_reg_slot ON registrations(slot_id);
