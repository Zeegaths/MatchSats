// app/api/messages/[matchId]/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import db from "@/lib/db";

// Ensure messages table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id    INTEGER NOT NULL,
    sender_id   TEXT NOT NULL,
    content     TEXT NOT NULL,
    created_at  INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );
  CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id, created_at);
`);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { session, error } = await requireAuth(request);
  if (error) return error;

  const { matchId } = await params;
  const userId = session!.userId;

  // Verify user is part of this match
  const match = db.prepare(`
    SELECT id FROM matches WHERE id = ? AND (pubkey_a = ? OR pubkey_b = ?)
  `).get(matchId, userId, userId);

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  // Get messages with sender name
  const messages = db.prepare(`
    SELECT m.id, m.sender_id, m.content, m.created_at,
           p.name as sender_name
    FROM messages m
    LEFT JOIN profiles p ON m.sender_id = p.pubkey
    WHERE m.match_id = ?
    ORDER BY m.created_at ASC
  `).all(matchId) as any[];

  return NextResponse.json({ messages });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { session, error } = await requireAuth(request);
  if (error) return error;

  const { matchId } = await params;
  const userId = session!.userId;
  const { content } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  // Verify user is part of this match
  const match = db.prepare(`
    SELECT id FROM matches WHERE id = ? AND (pubkey_a = ? OR pubkey_b = ?)
  `).get(matchId, userId, userId);

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const now = Date.now();
  const result = db.prepare(`
    INSERT INTO messages (match_id, sender_id, content, created_at)
    VALUES (?, ?, ?, ?)
  `).run(matchId, userId, content.trim(), now);

  return NextResponse.json({
    success: true,
    message: {
      id: result.lastInsertRowid,
      match_id: matchId,
      sender_id: userId,
      sender_name: session!.username,
      content: content.trim(),
      created_at: now,
    }
  });
}