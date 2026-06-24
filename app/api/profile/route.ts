export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getSession } from "@/lib/session";
import db from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireAuth(request);
    if (error) return error;
    const userId = session!.userId;
    const body = await request.json();
    const { name, core_vibe, role, building, needs, vibe, invite_code, interests, personality, soulmate_interests } = body;
    const now = Date.now();

    // Ensure user row exists before profile save (FK safety)
    db.prepare(`
      INSERT INTO users (pubkey, created_at, last_seen)
      VALUES (?, ?, ?)
      ON CONFLICT(pubkey) DO UPDATE SET last_seen = excluded.last_seen
    `).run(userId, now, now);

    db.prepare(`
      INSERT INTO profiles (pubkey, name, core_vibe, role, building, needs, vibe, invite_code, interests, personality, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(pubkey) DO UPDATE SET
        name=excluded.name, core_vibe=excluded.core_vibe, role=excluded.role,
        building=excluded.building, needs=excluded.needs, vibe=excluded.vibe,
        invite_code=excluded.invite_code, interests=excluded.interests,
        personality=excluded.personality, updated_at=excluded.updated_at
    `).run(userId, name ?? session!.username, core_vibe ?? null, role ?? null, building ?? null, needs ?? null, vibe ?? null, invite_code ?? session!.eventCode ?? null, JSON.stringify(interests ?? []), JSON.stringify({ ...(personality ?? {}), soulmate_interests: soulmate_interests ?? [] }), now);
    if (invite_code) { session!.eventCode = invite_code.trim().toUpperCase(); await session!.save(); }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[profile POST] error:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Server error saving profile" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth(request);
  if (error) return error;
  const profile = db.prepare(`SELECT * FROM profiles WHERE pubkey = ?`).get(session!.userId) as any;
  if (!profile) return NextResponse.json({ profile: null });
  return NextResponse.json({ profile: { ...profile, interests: (() => { try { return JSON.parse(profile.interests ?? "[]"); } catch { return []; } })(), personality: (() => { try { return JSON.parse(profile.personality ?? "{}"); } catch { return {}; } })() } });
}
