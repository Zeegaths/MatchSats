// app/api/escrow/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import db from "@/lib/db";

const LNBITS_URL = process.env.LNBITS_URL;
const LNBITS_INVOICE_KEY = process.env.LNBITS_INVOICE_KEY;
const ESCROW_SATS = 2100;

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth(request);
  if (error) return error;
  if (!LNBITS_URL || !LNBITS_INVOICE_KEY) return NextResponse.json({ error: "LNbits not configured" }, { status: 500 });
  const { match_id } = await request.json();
  if (!match_id) return NextResponse.json({ error: "match_id required" }, { status: 400 });
  const match = db.prepare(`SELECT * FROM matches WHERE id = ? AND (pubkey_a = ? OR pubkey_b = ?)`).get(match_id, session!.pubkey, session!.pubkey) as any;
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  const existing = db.prepare(`SELECT * FROM escrow WHERE match_id = ? AND pubkey = ?`).get(match_id, session!.pubkey) as any;
  if (existing && existing.status !== "cancelled") return NextResponse.json({ success: true, payment_request: existing.payment_request, payment_hash: existing.payment_hash });
  try {
    const res = await fetch(`${LNBITS_URL}/api/v1/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Api-Key": LNBITS_INVOICE_KEY! },
      body: JSON.stringify({ out: false, amount: ESCROW_SATS, memo: `MatchSats escrow match #${match_id}`, webhook: `${process.env.NEXT_PUBLIC_BASE_URL}/api/escrow/webhook` }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) { const err = await res.text(); console.error("[escrow]", err); return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 }); }
    const invoice = await res.json();
    db.prepare(`INSERT INTO escrow (match_id, pubkey, payment_hash, payment_request, amount_sats, status, created_at) VALUES (?, ?, ?, ?, ?, 'pending', ?) ON CONFLICT DO NOTHING`).run(match_id, session!.pubkey, invoice.payment_hash, invoice.payment_request, ESCROW_SATS, Date.now());
    db.prepare(`UPDATE matches SET status = ?, updated_at = ? WHERE id = ?`).run(match.pubkey_a === session!.pubkey ? 'locked_a' : 'locked_b', Date.now(), match_id);
    return NextResponse.json({ success: true, payment_request: invoice.payment_request, payment_hash: invoice.payment_hash, amount_sats: ESCROW_SATS });
  } catch (err) { console.error("[escrow]", err); return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 }); }
}

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth(request);
  if (error) return error;
  const matchId = request.nextUrl.searchParams.get("match_id");
  if (!matchId) return NextResponse.json({ error: "match_id required" }, { status: 400 });
  const escrows = db.prepare(`SELECT * FROM escrow WHERE match_id = ? ORDER BY created_at ASC`).all(parseInt(matchId)) as any[];
  const match = db.prepare(`SELECT status FROM matches WHERE id = ?`).get(parseInt(matchId)) as any;
  return NextResponse.json({ escrows, match_status: match?.status ?? "unknown", both_locked: escrows.filter((e: any) => e.status === "held").length === 2 });
}
