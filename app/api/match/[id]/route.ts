// app/api/match/[id]/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import db from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth(request);
  if (error) return error;

  const { id } = await params;
  const userId = session!.userId;

  const match = db.prepare(`
    SELECT
      m.id, m.score, m.rationale, m.status, m.created_at,
      p.pubkey, p.name, p.role, p.location, p.core_vibe,
      p.interests, p.building, p.needs, p.lightning_addr
    FROM matches m
    JOIN profiles p ON (
      CASE WHEN m.pubkey_a = ? THEN m.pubkey_b ELSE m.pubkey_a END = p.pubkey
    )
    WHERE m.id = ? AND (m.pubkey_a = ? OR m.pubkey_b = ?)
  `).get(userId, id, userId, userId) as any;

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  // Parse interests
  let interests: string[] = [];
  try { interests = JSON.parse(match.interests ?? "[]"); } catch {}

  // Get initials
  const initials = (match.name ?? "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return NextResponse.json({
    ...match,
    interests,
    initials,
    escrow: { mine: null, theirs: null, both_locked: false },
  });
}