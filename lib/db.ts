// lib/db.ts
// Single SQLite connection — imported by all API routes

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "matchsats.db");

const db = new Database(DB_PATH);

// Performance settings
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── Schema ─────────────────────────────────────────────────────────────

db.exec(`
  -- LNURL-auth challenges
  CREATE TABLE IF NOT EXISTS lnurl_challenges (
    k1          TEXT PRIMARY KEY,
    expires_at  INTEGER NOT NULL,
    used        INTEGER NOT NULL DEFAULT 0,
    created_at  INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );

  -- Users — pubkey is the identity
  CREATE TABLE IF NOT EXISTS users (
    pubkey      TEXT PRIMARY KEY,
    npub        TEXT,
    created_at  INTEGER NOT NULL,
    last_seen   INTEGER NOT NULL
  );

  -- Profiles — one per user
  CREATE TABLE IF NOT EXISTS profiles (
    pubkey          TEXT PRIMARY KEY REFERENCES users(pubkey),
    name            TEXT,
    role            TEXT,
    location        TEXT,
    bio             TEXT,
    lightning_addr  TEXT,
    building        TEXT,
    needs           TEXT,
    vibe            TEXT,
    core_vibe       TEXT,
    interests       TEXT,   -- JSON array of strings
    personality     TEXT,   -- JSON object of slider values
    nostr_relays    TEXT,   -- JSON array of relay URLs
    lat             REAL,
    lng             REAL,
    updated_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );

  -- Matches — AI-generated match pairs
  CREATE TABLE IF NOT EXISTS matches (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    pubkey_a      TEXT NOT NULL REFERENCES users(pubkey),
    pubkey_b      TEXT NOT NULL REFERENCES users(pubkey),
    score         INTEGER NOT NULL,
    rationale     TEXT,
    status        TEXT NOT NULL DEFAULT 'new',  -- new | locked_a | locked_b | both_locked | confirmed | disputed
    created_at    INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at    INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    UNIQUE(pubkey_a, pubkey_b)
  );

  -- Escrow — one per match, tracks hold invoices
  CREATE TABLE IF NOT EXISTS escrow (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id        INTEGER NOT NULL REFERENCES matches(id),
    pubkey          TEXT NOT NULL REFERENCES users(pubkey),
    payment_hash    TEXT UNIQUE,
    payment_request TEXT,
    amount_sats     INTEGER NOT NULL DEFAULT 2100,
    status          TEXT NOT NULL DEFAULT 'pending',  -- pending | held | settled | cancelled
    confirmed_at    INTEGER,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );

  -- Meeting reviews
  CREATE TABLE IF NOT EXISTS reviews (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id      INTEGER NOT NULL REFERENCES matches(id),
    reviewer      TEXT NOT NULL REFERENCES users(pubkey),
    rating        INTEGER,                -- 1-5
    summary_en    TEXT,
    summary_sw    TEXT,
    transcript    TEXT,
    created_at    INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );

  -- Cleanup expired challenges automatically
  CREATE INDEX IF NOT EXISTS idx_challenges_expires ON lnurl_challenges(expires_at);
  CREATE INDEX IF NOT EXISTS idx_matches_pubkey_a ON matches(pubkey_a);
  CREATE INDEX IF NOT EXISTS idx_matches_pubkey_b ON matches(pubkey_b);
`);

// Clean up expired challenges on startup
db.prepare(`DELETE FROM lnurl_challenges WHERE expires_at < ?`).run(Date.now());

export default db;