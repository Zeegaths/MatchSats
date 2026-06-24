// lib/session.ts
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export interface SessionData {
  isLoggedIn: boolean;
  userId: string;
  username: string;
  eventCode: string;
  pubkey?: string;
  npub?: string;
}

export const SESSION_OPTIONS = {
  password: process.env.SESSION_SECRET ?? "changeme-at-least-32-chars-long!!",
  cookieName: "matchsats_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), SESSION_OPTIONS);
}

export async function requireAuth(request: NextRequest) {
  const session = await getSession();
  // Support both username sessions (userId) and LNURL sessions (pubkey)
  const id = session.userId || session.pubkey;
  if (!session.isLoggedIn || !id) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  // Ensure userId is always set so downstream routes work uniformly
  if (!session.userId && session.pubkey) {
    session.userId = session.pubkey;
    session.username = session.npub ?? session.pubkey;
    session.eventCode = session.eventCode ?? "";
    await session.save();
  }
  return { session, error: null };
}