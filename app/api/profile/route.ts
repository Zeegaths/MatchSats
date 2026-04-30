export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth(request);
  if (error) return error;
  const profile = db.prepare(`SELECT * FROM profiles WHERE pubkey = ?`).get(session!.pubkey) as any;
  if (!profile) return NextResponse.json({ hasProfile: false });
  return NextResponse.json({
    hasProfile: true, ...profile,
    interests: JSON.parse(profile.interests ?? "[]"),
    personality: JSON.parse(profile.personality ?? "{}"),
  });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth(request);
  if (error) return error;
  const body = await request.json();
  const { name, core_vibe, building, needs, vibe, lightning_addr, interests, personality } = body;
  if (!name || !core_vibe) return NextResponse.json({ error: "name and core_vibe are required" }, { status: 400 });
  db.prepare(`
    INSERT INTO profiles (pubkey, name, core_vibe, building, needs, vibe, lightning_addr, interests, personality, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(pubkey) DO UPDATE SET
      name=excluded.name, core_vibe=excluded.core_vibe, building=excluded.building,
      needs=excluded.needs, vibe=excluded.vibe, lightning_addr=excluded.lightning_addr,
      interests=excluded.interests, personality=excluded.personality, updated_at=excluded.updated_at
  `).run(
    session!.pubkey, name, core_vibe,
    building ?? null, needs ?? null, vibe ?? null, lightning_addr ?? null,
    JSON.stringify(interests ?? []), JSON.stringify(personality ?? {}), Date.now()
  );
  return NextResponse.json({ success: true });
}