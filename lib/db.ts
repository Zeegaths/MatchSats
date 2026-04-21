import Database from "better-sqlite3"
import path from "path"

const DB_PATH = process.env.DB_PATH || "./data/matchsats.db"

let db: Database.Database

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(path.resolve(DB_PATH))
    db.pragma("journal_mode = WAL")
    initSchema(db)
  }
  return db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id          TEXT PRIMARY KEY,
      pubkey      TEXT UNIQUE,
      name        TEXT,
      building    TEXT,
      need        TEXT,
      offer       TEXT,
      nostr_event TEXT,
      created_at  INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id              TEXT PRIMARY KEY,
      initiator_pubkey TEXT,
      match_pubkey    TEXT,
      initiator_hash  TEXT,
      match_hash      TEXT,
      amount_sats     INTEGER DEFAULT 2100,
      status          TEXT DEFAULT 'pending',
      scheduled_at    INTEGER,
      confirmed_at    INTEGER,
      created_at      INTEGER DEFAULT (unixepoch())
    );
  `)
}
