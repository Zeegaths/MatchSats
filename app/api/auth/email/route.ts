export const dynamic = "force-dynamic";
// app/api/auth/email/route.ts
// Sends a 6-digit OTP to the provided email via Resend

import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: "Email not configured" }, { status: 500 });
  }

  const clean = email.trim().toLowerCase();
  const code = generateOTP();
  const now = Date.now();

  // Store OTP — invalidate any previous ones for this email
  db.prepare(`DELETE FROM email_otps WHERE email = ?`).run(clean);
  db.prepare(`
    INSERT INTO email_otps (email, code, expires_at, used, created_at)
    VALUES (?, ?, ?, 0, ?)
  `).run(clean, code, now + OTP_TTL_MS, now);

  // Send via Resend
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "1% MatchSats <onboarding@resend.dev>",
        to: [clean],
        subject: `Your login code: ${code}`,
        html: `
          <div style="font-family: 'Space Grotesk', sans-serif; background: #0a0a0a; color: #fff; padding: 40px; max-width: 480px; margin: 0 auto; border-radius: 16px;">
            <p style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">
              <span style="color: #cafd00;">1</span><span style="color: #9d7bb8;">%</span>
            </p>
            <p style="color: #777; font-size: 14px; margin: 0 0 32px;">Bitcoin Nairobi Conference 2026</p>

            <p style="color: #aaa; font-size: 16px; margin: 0 0 24px;">Your login code is:</p>

            <div style="background: #111110; border: 1px solid #cafd0040; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <span style="color: #cafd00; font-size: 42px; font-weight: 900; letter-spacing: 10px;">${code}</span>
            </div>

            <p style="color: #555; font-size: 13px; margin: 0;">
              This code expires in 10 minutes. If you didn't request this, ignore this email.
            </p>
          </div>
        `,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[email-otp] Resend error:", err);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
  } catch (err) {
    console.error("[email-otp] error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ success: true, email: clean });
}
