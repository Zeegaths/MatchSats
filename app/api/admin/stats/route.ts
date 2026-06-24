export const dynamic = "force-dynamic";
// app/api/admin/stats/route.ts
// Returns all data needed for the admin dashboard.
// Protected by ADMIN_SECRET query param.

import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function GET(request: NextRequest) {
  if (!ADMIN_SECRET) {
    return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 500 });
  }
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Signups ──────────────────────────────────────────────────────────
  const totalUsers = (db.prepare(`SELECT COUNT(*) as n FROM users`).get() as any).n;
  const totalProfiles = (db.prepare(`SELECT COUNT(*) as n FROM profiles WHERE name IS NOT NULL`).get() as any).n;
  const realUsers = (db.prepare(
    `SELECT COUNT(*) as n FROM users WHERE pubkey NOT LIKE 'bnc_%' AND pubkey NOT LIKE 'seed_%'`
  ).get() as any).n;

  // Signups per event code
  const byEventCode = db.prepare(`
    SELECT invite_code, COUNT(*) as count
    FROM profiles
    WHERE invite_code IS NOT NULL
    GROUP BY invite_code
    ORDER BY count DESC
  `).all();

  // Recent signups (last 50, real users only)
  const recentSignups = db.prepare(`
    SELECT u.pubkey, u.created_at, p.name, p.role, p.location, p.invite_code, p.core_vibe,
           p.building, p.needs
    FROM users u
    LEFT JOIN profiles p ON u.pubkey = p.pubkey
    WHERE u.pubkey NOT LIKE 'bnc_%' AND u.pubkey NOT LIKE 'seed_%'
    ORDER BY u.created_at DESC
    LIMIT 50
  `).all();

  // ── Matches ──────────────────────────────────────────────────────────
  const totalMatches = (db.prepare(`SELECT COUNT(*) as n FROM matches`).get() as any).n;
  const lockedMatches = (db.prepare(
    `SELECT COUNT(*) as n FROM matches WHERE status IN ('both_locked','confirmed')`
  ).get() as any).n;
  const confirmedMeetings = (db.prepare(
    `SELECT COUNT(*) as n FROM matches WHERE status = 'confirmed'`
  ).get() as any).n;

  // Recent matches with names
  const recentMatches = db.prepare(`
    SELECT m.id, m.score, m.status, m.created_at,
           pa.name as name_a, pa.role as role_a,
           pb.name as name_b, pb.role as role_b
    FROM matches m
    LEFT JOIN profiles pa ON m.pubkey_a = pa.pubkey
    LEFT JOIN profiles pb ON m.pubkey_b = pb.pubkey
    ORDER BY m.created_at DESC
    LIMIT 30
  `).all();

  // ── Escrow ───────────────────────────────────────────────────────────
  const totalEscrow = (db.prepare(`SELECT COUNT(*) as n FROM escrow`).get() as any).n;
  const heldEscrow  = (db.prepare(`SELECT COUNT(*) as n FROM escrow WHERE status = 'held'`).get() as any).n;
  const totalSatsLocked = (db.prepare(
    `SELECT COALESCE(SUM(amount_sats),0) as total FROM escrow WHERE status = 'held'`
  ).get() as any).total;

  // ── Reviews ──────────────────────────────────────────────────────────
  const totalReviews = (db.prepare(`SELECT COUNT(*) as n FROM reviews`).get() as any).n;

  return NextResponse.json({
    summary: {
      totalUsers,
      realUsers,
      totalProfiles,
      totalMatches,
      lockedMatches,
      confirmedMeetings,
      totalSatsLocked,
      totalReviews,
    },
    byEventCode,
    recentSignups,
    recentMatches,
    escrow: { total: totalEscrow, held: heldEscrow },
  });
}
