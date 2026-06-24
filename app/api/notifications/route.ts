export const dynamic = "force-dynamic";
// app/api/notifications/route.ts
// Returns unread messages and match status changes since last_seen

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth(request);
  if (error) return error;

  const userId = session!.userId;
  const since = parseInt(request.nextUrl.searchParams.get("since") ?? "0");

  // New messages in any of my matches since timestamp
  const newMessages = db.prepare(`
    SELECT m.id, m.content, m.created_at, m.sender_id,
           p.name as sender_name,
           m.match_id
    FROM messages m
    JOIN matches mt ON m.match_id = mt.id
    LEFT JOIN profiles p ON m.sender_id = p.pubkey
    WHERE (mt.pubkey_a = ? OR mt.pubkey_b = ?)
      AND m.sender_id != ?
      AND m.created_at > ?
    ORDER BY m.created_at DESC
    LIMIT 10
  `).all(userId, userId, userId, since) as any[];

  // Match status changes since timestamp (someone locked sats, confirmed, etc.)
  const matchUpdates = db.prepare(`
    SELECT id, status, updated_at,
           pubkey_a, pubkey_b,
           CASE WHEN pubkey_a = ? THEN pubkey_b ELSE pubkey_a END as other_pubkey
    FROM matches
    WHERE (pubkey_a = ? OR pubkey_b = ?)
      AND updated_at > ?
      AND status != 'new'
    ORDER BY updated_at DESC
    LIMIT 5
  `).all(userId, userId, userId, since) as any[];

  // Get names for match updates
  const enrichedUpdates = matchUpdates.map((m: any) => {
    const profile = db.prepare(`SELECT name FROM profiles WHERE pubkey = ?`).get(m.other_pubkey) as any;
    return { ...m, other_name: profile?.name ?? "Someone" };
  });

  return NextResponse.json({
    newMessages,
    matchUpdates: enrichedUpdates,
    timestamp: Date.now(),
  });
}
