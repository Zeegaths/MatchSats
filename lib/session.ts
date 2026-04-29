// lib/session.ts
// Shared session utilities — use this in any route or server component

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { SessionData } from "@/app/api/auth/callback/route";

export const SESSION_OPTIONS = {
  password: process.env.SESSION_SECRET ?? "changeme-at-least-32-chars-long!!",
  cookieName: "matchsats_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
  },
};

// Use in server components and API routes
export async function getSession() {
  return getIronSession<SessionData>(await cookies(), SESSION_OPTIONS);
}

// Use in API routes to require auth
export async function requireAuth(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.pubkey) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, error: null };
}

// GET /api/auth/me — check session from the frontend
export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ loggedIn: false });
  }
  return NextResponse.json({
    loggedIn: true,
    pubkey: session.pubkey,
    npub: session.npub,
  });
}