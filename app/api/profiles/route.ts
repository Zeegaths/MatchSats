// app/api/profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import db from "@/lib/db";

// ── GET /api/profile — fetch own profile ─────────────────────────────
export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth(request);
  if (error) return error;

  const profile = db.prepare(`
    SELECT * FROM profiles WHERE pubkey = ?
  `).get(session!.pubkey) as any;

  if (!profile) {
    return NextResponse.json({ hasProfile: false });
  }

  return NextResponse.json({
    hasProfile: true,
    ...profile,
    interests: JSON.parse(profile.interests ?? "[]"),
    personality: JSON.parse(profile.personality ?? "{}"),
    nostr_relays: JSON.parse(profile.nostr_relays ?? "[]"),
  });
}

// ── POST /api/profile — save or update profile ───────────────────────
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth(request);
  if (error) return error;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    name,
    role,
    location,
    bio,
    lightning_addr,
    building,
    needs,
    vibe,
    core_vibe,
    interests,   // string[]
    personality, // { [axis: string]: number }
    nostr_relays,
    lat,
    lng,
  } = body;

  // Validate required fields
  if (!name || !core_vibe) {
    return NextResponse.json(
      { error: "name and core_vibe are required" },
      { status: 400 }
    );
  }

  db.prepare(`
    INSERT INTO profiles (
      pubkey, name, role, location, bio, lightning_addr,
      building, needs, vibe, core_vibe,
      interests, personality, nostr_relays,
      lat, lng, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?
    )
    ON CONFLICT(pubkey) DO UPDATE SET
      name          = excluded.name,
      role          = excluded.role,
      location      = excluded.location,
      bio           = excluded.bio,
      lightning_addr = excluded.lightning_addr,
      building      = excluded.building,
      needs         = excluded.needs,
      vibe          = excluded.vibe,
      core_vibe     = excluded.core_vibe,
      interests     = excluded.interests,
      personality   = excluded.personality,
      nostr_relays  = excluded.nostr_relays,
      lat           = excluded.lat,
      lng           = excluded.lng,
      updated_at    = excluded.updated_at
  `).run(
    session!.pubkey,
    name ?? null,
    role ?? null,
    location ?? null,
    bio ?? null,
    lightning_addr ?? null,
    building ?? null,
    needs ?? null,
    vibe ?? null,
    core_vibe,
    JSON.stringify(interests ?? []),
    JSON.stringify(personality ?? {}),
    JSON.stringify(nostr_relays ?? []),
    lat ?? null,
    lng ?? null,
    Date.now(),
  );

  return NextResponse.json({ success: true, pubkey: session!.pubkey });
}