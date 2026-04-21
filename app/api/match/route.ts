import { NextRequest, NextResponse } from "next/server"
import { runMatching } from "@/lib/claude"
import { getDb } from "@/lib/db"

export async function POST(req: NextRequest) {
  const { pubkey } = await req.json()
  const db = getDb()

  const me = db.prepare("SELECT * FROM profiles WHERE pubkey = ?").get(pubkey) as any
  if (!me) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  const others = db
    .prepare("SELECT * FROM profiles WHERE pubkey != ?")
    .all(pubkey) as any[]

  const matches = await runMatching(me, others)
  return NextResponse.json({ matches })
}
