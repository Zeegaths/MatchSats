// app/api/profile/me/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function GET() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ loggedIn: false, hasProfile: false });
  }

  const profile = db.prepare(`SELECT pubkey, name, invite_code FROM profiles WHERE pubkey = ?`).get(session.userId) as any;

  return NextResponse.json({
    loggedIn: true,
    userId: session.userId,
    username: session.username,
    eventCode: session.eventCode,
    hasProfile: !!profile,
    hasEventCode: !!(profile?.invite_code || session.eventCode),
  });
}