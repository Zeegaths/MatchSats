// app/api/auth/me/route.ts
// Called by the login page to check if the wallet has signed in yet

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.pubkey) {
    return NextResponse.json({ loggedIn: false });
  }
  return NextResponse.json({
    loggedIn: true,
    pubkey: session.pubkey,
    npub: session.npub,
  });
}