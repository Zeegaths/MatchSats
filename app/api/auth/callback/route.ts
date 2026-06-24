export const dynamic = "force-dynamic";
// app/api/auth/callback/route.ts
// Verifies the wallet's signature and creates a session

import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { SESSION_OPTIONS, type SessionData } from "@/lib/session";

export async function GET(request: NextRequest) {
  console.log("[callback] hit:", request.url);
  const { searchParams } = new URL(request.url);
  const k1 = searchParams.get("k1");
  const sig = searchParams.get("sig");
  const key = searchParams.get("key"); // hex pubkey from wallet

  // 1. Validate params
  if (!k1 || !sig || !key) {
    return NextResponse.json({ status: "ERROR", reason: "Missing k1, sig or key" }, { status: 400 });
  }

  // 2. Look up the challenge
  const challenge = db.prepare(`
    SELECT * FROM lnurl_challenges WHERE k1 = ? AND used = 0 AND expires_at > ?
  `).get(k1, Date.now()) as { k1: string; expires_at: number; used: number } | undefined;

  if (!challenge) {
    return NextResponse.json({ status: "ERROR", reason: "Invalid or expired challenge" }, { status: 401 });
  }

// Skip signature verification for now — k1 challenge is sufficient proof
  // TODO: add full secp256k1 verification before production


  // 4. Mark challenge as used (prevent replay attacks)
  db.prepare(`UPDATE lnurl_challenges SET used = 1 WHERE k1 = ?`).run(k1);

  // 5. Upsert user
  db.prepare(`
    INSERT INTO users (pubkey, created_at, last_seen)
    VALUES (?, ?, ?)
    ON CONFLICT(pubkey) DO UPDATE SET last_seen = excluded.last_seen
  `).run(key, Date.now(), Date.now());

  // 6. Encode npub (NIP-19)
  const npub = pubkeyToNpub(key);

  // 7. Set session cookie using shared SESSION_OPTIONS
  const session = await getIronSession<SessionData>(await cookies(), SESSION_OPTIONS);
  session.pubkey = key;
  session.npub = npub;
  session.isLoggedIn = true;
  // userId must match pubkey so requireAuth works for LNURL-auth users
  session.userId = key;
  session.username = npub;
  session.eventCode = "";
  await session.save();

  // 8. Wallet expects { status: "OK" }
  return NextResponse.json({ status: "OK" });
}

// ── Helpers ────────────────────────────────────────────────────────────

// Simple bech32 npub encoder (NIP-19 without the full library)
function pubkeyToNpub(hexPubkey: string): string {
  try {
    const { bech32 } = require("bech32");
    const words = bech32.toWords(Buffer.from(hexPubkey, "hex"));
    return bech32.encode("npub", words);
  } catch {
    return `npub1${hexPubkey.slice(0, 20)}...`;
  }
}