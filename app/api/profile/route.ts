// app/api/profile/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getSession } from "@/lib/session";
import db from "@/lib/db";

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth(request);
  if (error) return error;

  const userId = session!.userId;
  const body = await request.json();
  const {
    name, core_vibe, role, building, needs, vibe,
    lightning_addr, invite_code, interests, personality,
    soulmate_interests,
  } = body;

  const now = Date.now();

  db.prepare(`
    INSERT INTO profiles (pubkey, name, core_vibe, role, building, needs, vibe, lightning_addr, invite_code, interests, personality, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(pubkey) DO UPDATE SET
      name = excluded.name,
      core_vibe = excluded.core_vibe,
      role = excluded.role,
      building = excluded.building,
      needs = excluded.needs,
      vibe = excluded.vibe,
      lightning_addr = excluded.lightning_addr,
      invite_code = excluded.invite_code,
      interests = excluded.interests,
      personality = excluded.personality,
      updated_at = excluded.updated_at
  `).run(
    userId,
    name ?? session!.username,
    core_vibe ?? null,
    role ?? null,
    building ?? null,
    needs ?? null,
    vibe ?? null,
    lightning_addr ?? null,
    invite_code ?? session!.eventCode ?? null,
    JSON.stringify(interests ?? []),
    JSON.stringify({ ...(personality ?? {}), soulmate_interests: soulmate_interests ?? [] }),
    now,
  );

  // Update session event code if provided
  if (invite_code) {
    session!.eventCode = invite_code.trim().toUpperCase();
    await session!.save();
  }

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth(request);
  if (error) return error;

  const userId = session!.userId;
  const profile = db.prepare(`SELECT * FROM profiles WHERE pubkey = ?`).get(userId) as any;

  if (!profile) {
    return NextResponse.json({ profile: null });
  }

  return NextResponse.json({
    profile: {
      ...profile,
      interests: (() => { try { return JSON.parse(profile.interests ?? "[]"); } catch { return []; } })(),
      personality: (() => { try { return JSON.parse(profile.personality ?? "{}"); } catch { return {}; } })(),
    }
  });
}