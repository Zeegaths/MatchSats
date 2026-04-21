import { getDb } from "../lib/db"
import { randomUUID } from "crypto"

const profiles = [
  { pubkey: "pk_aisha",  name: "Aisha K.",  building: "M-Pesa integration SDK",     need: "Frontend dev for dashboard",   offer: "3 years Lightning + mobile payments" },
  { pubkey: "pk_brian",  name: "Brian M.",  building: "AI grants platform",          need: "Nostr integration help",        offer: "Full-stack, Next.js, Claude API"     },
  { pubkey: "pk_celine", name: "Celine D.", building: "Bitcoin circular economy app",need: "Introductions to merchants",    offer: "LNbits expert, hold invoice flows"   },
  { pubkey: "pk_david",  name: "David O.",  building: "Dev tools for Africa",        need: "Co-founder with ops background",offer: "Shipping fast, unconference veteran" },
]

const db = getDb()
for (const p of profiles) {
  db.prepare(`
    INSERT OR IGNORE INTO profiles (id, pubkey, name, building, need, offer)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(randomUUID(), p.pubkey, p.name, p.building, p.need, p.offer)
}

console.log(`Seeded ${profiles.length} profiles`)
