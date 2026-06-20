// app/api/auth/me/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ loggedIn: false });
  }
  return NextResponse.json({
    loggedIn: true,
    userId: session.userId,
    username: session.username,
    eventCode: session.eventCode,
    pubkey: session.pubkey ?? null,
    hasWallet: !!session.pubkey,
  });
}