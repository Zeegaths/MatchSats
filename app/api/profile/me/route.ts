import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.pubkey) {
    return NextResponse.json({ hasProfile: false, loggedIn: false });
  }
  const profile = db.prepare(`SELECT pubkey FROM profiles WHERE pubkey = ?`).get(session.pubkey);
  return NextResponse.json({ loggedIn: true, hasProfile: !!profile, pubkey: session.pubkey });
}