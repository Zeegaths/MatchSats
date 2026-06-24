export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function GET(request: NextRequest) {
  if (!ADMIN_SECRET) return NextResponse.json({ error: "No ADMIN_SECRET" }, { status: 500 });
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== ADMIN_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check env vars (masked)
  const env = {
    RESEND_API_KEY: process.env.RESEND_API_KEY ? `set (${process.env.RESEND_API_KEY.slice(0, 8)}...)` : "NOT SET",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "set" : "NOT SET",
    SESSION_SECRET: process.env.SESSION_SECRET ? "set" : "NOT SET",
    ADMIN_SECRET: process.env.ADMIN_SECRET ? "set" : "NOT SET",
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ?? "NOT SET",
    RENDER: process.env.RENDER ?? "not set (local)",
  };

  // Check tables
  const tables = (db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).all() as any[]).map(r => r.name);

  // Force create email_otps if missing
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

  // Also ensure email column on users
  try { db.exec(`ALTER TABLE users ADD COLUMN email TEXT`); } catch {}

  // Re-check tables after migration
  const tablesAfter = (db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).all() as any[]).map(r => r.name);

  // Check email_otps specifically
  let otpCount = 0;
  try { otpCount = (db.prepare(`SELECT COUNT(*) as n FROM email_otps`).get() as any).n; } catch {}

  return NextResponse.json({ env, tables, tablesAfter, otpCount });
}
