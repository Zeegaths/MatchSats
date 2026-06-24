export const dynamic = "force-dynamic";
// app/api/auth/email/verify/route.ts
// Verifies the OTP and creates a session

import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code required" }, { status: 400 });
    }

    const clean = email.trim().toLowerCase();

    // Ensure table exists
    try {
      db.exec(`CREATE TABLE IF NOT EXISTS email_otps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        used INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
      )`);
    } catch {}

    // Look up valid OTP
    const otp = db.prepare(`
      SELECT * FROM email_otps
      WHERE email = ? AND code = ? AND used = 0 AND expires_at > ?
    `).get(clean, String(code).trim(), Date.now()) as any;

    if (!otp) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
    }

    // Mark used
    db.prepare(`UPDATE email_otps SET used = 1 WHERE id = ?`).run(otp.id);

    // Derive a stable userId from email (strip non-alphanumeric)
    const userId = clean.replace(/[^a-z0-9]/g, "").slice(0, 20) || "user";
    const now = Date.now();

    // Ensure email column exists on users (safe migration)
    try { db.exec(`ALTER TABLE users ADD COLUMN email TEXT`); } catch {}

    // Upsert user FIRST — profiles has FK constraint to users
    db.prepare(`
      INSERT INTO users (pubkey, email, created_at, last_seen)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(pubkey) DO UPDATE SET
        email = excluded.email,
        last_seen = excluded.last_seen
    `).run(userId, clean, now, now);

    // Now upsert profile safely
    db.prepare(`
      INSERT INTO profiles (pubkey, name, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(pubkey) DO UPDATE SET
        updated_at = excluded.updated_at
    `).run(userId, userId, now);

    // Set session
    const session = await getSession();
    session.isLoggedIn = true;
    session.userId = userId;
    session.username = userId;
    session.eventCode = "";
    await session.save();

    const profile = db.prepare(`SELECT name, invite_code FROM profiles WHERE pubkey = ?`).get(userId) as any;
    const hasProfile = !!(profile?.invite_code);

    return NextResponse.json({ success: true, userId, hasProfile });

  } catch (err: any) {
    console.error("[email-verify] error:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
