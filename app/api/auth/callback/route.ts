// app/api/auth/callback/route.ts
// Verifies the wallet's signature and creates a session

import { NextRequest, NextResponse } from "next/server";
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import db from "@/lib/db";

export interface SessionData {
  pubkey: string;        // hex pubkey — this IS the user's identity
  npub: string;          // bech32 npub for Nostr
  isLoggedIn: boolean;
}

const SESSION_OPTIONS = {
  password: process.env.SESSION_SECRET ?? "changeme-at-least-32-chars-long!!",
  cookieName: "matchsats_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function GET(request: NextRequest) {
console.log("[callback] hit:", request.url);
  const { searchParams } = new URL(request.url);
  const k1  = searchParams.get("k1");
  const sig  = searchParams.get("sig");
  const key  = searchParams.get("key"); // hex pubkey from wallet

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

  // 3. Verify the secp256k1 signature
 // 3. Verify the secp256k1 signature
try {
  const sigBytes = Uint8Array.from(Buffer.from(sig, "hex"));
  const msgBytes = Uint8Array.from(Buffer.from(k1, "hex"));
  const keyBytes = Uint8Array.from(Buffer.from(key, "hex"));
  const isValid = secp256k1.verify(sigBytes, msgBytes, keyBytes);
    if (!isValid) {
      return NextResponse.json({ status: "ERROR", reason: "Invalid signature" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ status: "ERROR", reason: "Signature verification failed" }, { status: 401 });
  }

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

  // 7. Set session cookie
  const session = await getIronSession<SessionData>(await cookies(), SESSION_OPTIONS);
  session.pubkey = key;
  session.npub = npub;
  session.isLoggedIn = true;
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