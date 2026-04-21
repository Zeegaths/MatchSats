import { NextRequest, NextResponse } from "next/server"
import { createHoldInvoice } from "@/lib/lnbits"
import { getDb } from "@/lib/db"
import { randomUUID } from "crypto"

export async function POST(req: NextRequest) {
  const { initiatorPubkey, matchPubkey, amountSats = 2100 } = await req.json()

  // Create hold invoice for initiator
  const inv = await createHoldInvoice(amountSats, `MatchSats escrow`)

  const db    = getDb()
  const jobId = randomUUID()

  db.prepare(`
    INSERT INTO jobs (id, initiator_pubkey, match_pubkey, initiator_hash, amount_sats, status)
    VALUES (?, ?, ?, ?, ?, 'pending_payment')
  `).run(jobId, initiatorPubkey, matchPubkey, inv.payment_hash, amountSats)

  return NextResponse.json({
    jobId,
    paymentRequest: inv.payment_request,
    paymentHash:    inv.payment_hash,
  })
}
