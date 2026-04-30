import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

function createDb() {
  const dataDir = process.env.RENDER ? "/data" : process.cwd();
  
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch {
    // Can't create dir at build time — use cwd as fallback
    const fallback = path.join(process.cwd(), "matchsats.db");
    return new Database(fallback);
  }

  const db = new Database(path.join(dataDir, "matchsats.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS lnurl_challenges (k1 TEXT PRIMARY KEY, expires_at INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000));
    CREATE TABLE IF NOT EXISTS users (pubkey TEXT PRIMARY KEY, npub TEXT, created_at INTEGER NOT NULL, last_seen INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS profiles (pubkey TEXT PRIMARY KEY REFERENCES users(pubkey), name TEXT, role TEXT, location TEXT, bio TEXT, lightning_addr TEXT, building TEXT, needs TEXT, vibe TEXT, core_vibe TEXT, interests TEXT, personality TEXT, nostr_relays TEXT, lat REAL, lng REAL, updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000));
    CREATE TABLE IF NOT EXISTS matches (id INTEGER PRIMARY KEY AUTOINCREMENT, pubkey_a TEXT NOT NULL REFERENCES users(pubkey), pubkey_b TEXT NOT NULL REFERENCES users(pubkey), score INTEGER NOT NULL, rationale TEXT, status TEXT NOT NULL DEFAULT 'new', created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000), updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000), UNIQUE(pubkey_a, pubkey_b));
    CREATE TABLE IF NOT EXISTS escrow (id INTEGER PRIMARY KEY AUTOINCREMENT, match_id INTEGER NOT NULL REFERENCES matches(id), pubkey TEXT NOT NULL REFERENCES users(pubkey), payment_hash TEXT UNIQUE, payment_request TEXT, amount_sats INTEGER NOT NULL DEFAULT 2100, status TEXT NOT NULL DEFAULT 'pending', confirmed_at INTEGER, created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000));
    CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, match_id INTEGER NOT NULL REFERENCES matches(id), reviewer TEXT NOT NULL REFERENCES users(pubkey), rating INTEGER, summary_en TEXT, summary_sw TEXT, transcript TEXT, created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000));
    CREATE INDEX IF NOT EXISTS idx_challenges_expires ON lnurl_challenges(expires_at);
    CREATE INDEX IF NOT EXISTS idx_matches_pubkey_a ON matches(pubkey_a);
    CREATE INDEX IF NOT EXISTS idx_matches_pubkey_b ON matches(pubkey_b);
  `);
  db.prepare(`DELETE FROM lnurl_challenges WHERE expires_at < ?`).run(Date.now());
  return db;
}

const db = createDb();
export default db;