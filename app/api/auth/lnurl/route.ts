// app/api/auth/lnurl/route.ts
// Generates a fresh k1 challenge and returns it as a LNURL

import { NextResponse } from "next/server";
import { bech32 } from "bech32";
import { randomBytes } from "crypto";
import db from "@/lib/db";

// How long a k1 is valid for (5 minutes)
const K1_TTL_MS = 5 * 60 * 1000;

export async function GET() {
  try {
    // 1. Generate a random 32-byte challenge
    const k1 = randomBytes(32).toString("hex");

    // 2. Store it in the DB with an expiry
    db.prepare(`
      INSERT INTO lnurl_challenges (k1, expires_at)
      VALUES (?, ?)
    `).run(k1, Date.now() + K1_TTL_MS);

    // 3. Build the callback URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const callbackUrl = `${baseUrl}/api/auth/callback`;

    // 4. Build the LNURL-auth params
    const params = new URLSearchParams({
      tag: "login",
      k1,
      action: "login",
      callback: callbackUrl,
    });

    const lnurlParams = `${callbackUrl}?${params.toString()}`;

    // 5. Encode as bech32 LNURL
    const words = bech32.toWords(Buffer.from(lnurlParams, "utf8"));
    const lnurl = bech32.encode("lnurl", words, 1500);

    return NextResponse.json({
      tag: "login",
      k1,
      callback: callbackUrl,
      lnurl: lnurl.toUpperCase(), // wallets expect uppercase
      qr: lnurlParams, // raw URL for QR code generation
    });
  } catch (err) {
    console.error("[lnurl] error:", err);
    return NextResponse.json({ error: "Failed to generate challenge" }, { status: 500 });
  }
}