import { NextRequest, NextResponse } from "next/server"
import { settleInvoice } from "@/lib/lnbits"
import { getDb } from "@/lib/db"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db  = getDb()
  const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as any
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await settleInvoice(job.initiator_hash)
  db.prepare("UPDATE jobs SET status = 'settled' WHERE id = ?").run(id)
  return NextResponse.json({ status: "settled" })
}
