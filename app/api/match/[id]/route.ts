export const dynamic = "force-dynamic";
// app/api/match/[id]/route.ts
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

  const match = db.prepare(`
    SELECT
      m.id, m.score, m.rationale, m.status, m.created_at,
      CASE WHEN m.pubkey_a = ? THEN m.pubkey_b ELSE m.pubkey_a END as match_pubkey,
      p.name, p.role, p.location, p.core_vibe,
      p.interests, p.building, p.needs, p.vibe,
      p.lightning_addr
    FROM matches m
    LEFT JOIN profiles p ON p.pubkey = CASE
      WHEN m.pubkey_a = ? THEN m.pubkey_b
      ELSE m.pubkey_a
    END
    WHERE m.id = ? AND (m.pubkey_a = ? OR m.pubkey_b = ?)
  `).get(
    session!.pubkey, session!.pubkey,
    parseInt(id),
    session!.pubkey, session!.pubkey
  ) as any;

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  // Get escrow status
  const escrows = db.prepare(`
    SELECT pubkey, status, amount_sats FROM escrow WHERE match_id = ?
  `).all(parseInt(id)) as any[];

  const myEscrow = escrows.find((e: any) => e.pubkey === session!.pubkey);
  const theirEscrow = escrows.find((e: any) => e.pubkey !== session!.pubkey);

  return NextResponse.json({
    id: match.id,
    score: match.score,
    rationale: match.rationale,
    status: match.status,
    match_pubkey: match.match_pubkey,
    name: match.name ?? "Anonymous",
    role: match.role ?? "Conference Attendee",
    location: match.location ?? "Here",
    core_vibe: match.core_vibe,
    interests: JSON.parse(match.interests ?? "[]"),
    building: match.building,
    needs: match.needs,
    lightning_addr: match.lightning_addr,
    initials: (match.name ?? "A")[0].toUpperCase(),
    escrow: {
      mine: myEscrow?.status ?? null,
      theirs: theirEscrow?.status ?? null,
      both_locked: myEscrow?.status === "held" && theirEscrow?.status === "held",
    },
  });
}