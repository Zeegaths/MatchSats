// app/api/auth/username/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function POST(request: NextRequest) {
  const { username } = await request.json();

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

  if (clean.length < 2 || clean.length > 20) {
    return NextResponse.json({ error: "Username must be 2 to 20 characters" }, { status: 400 });
  }

  const userId = clean;
  const now = Date.now();

  // Upsert user
  db.prepare(`
    INSERT INTO users (pubkey, created_at, last_seen)
    VALUES (?, ?, ?)
    ON CONFLICT(pubkey) DO UPDATE SET last_seen = excluded.last_seen
  `).run(userId, now, now);

  // Upsert profile
  db.prepare(`
    INSERT INTO profiles (pubkey, name, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(pubkey) DO UPDATE SET
      name = excluded.name,
      updated_at = excluded.updated_at
  `).run(userId, clean, now);

  // Set session
  const session = await getSession();
  session.isLoggedIn = true;
  session.userId = userId;
  session.username = clean;
  session.eventCode = "";
  await session.save();

  return NextResponse.json({ success: true, username: clean });
}