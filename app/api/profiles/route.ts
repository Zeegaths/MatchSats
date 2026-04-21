import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { randomUUID } from "crypto"

export async function GET() {
  const db       = getDb()
  const profiles = db.prepare("SELECT * FROM profiles ORDER BY created_at DESC").all()
  return NextResponse.json(profiles)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { pubkey, name, building, need, offer } = body

  const db = getDb()
  const id = randomUUID()

  db.prepare(`
    INSERT INTO profiles (id, pubkey, name, building, need, offer)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(pubkey) DO UPDATE SET
      name     = excluded.name,
      building = excluded.building,
      need     = excluded.need,
      offer    = excluded.offer
  `).run(id, pubkey, name, building, need, offer)

  return NextResponse.json({ id, pubkey })
}
