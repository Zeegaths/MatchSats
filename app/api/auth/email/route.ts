export const dynamic = "force-dynamic";
// app/api/auth/email/route.ts
// Sends a 6-digit OTP via Gmail using nodemailer

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import db from "@/lib/db";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    if (!GMAIL_USER || !GMAIL_PASS) {
      return NextResponse.json({ error: "Email not configured on server" }, { status: 500 });
    }

    const clean = email.trim().toLowerCase();
    const code = generateOTP();
    const now = Date.now();

    // Ensure table exists
    try {
      db.exec(`CREATE TABLE IF NOT EXISTS email_otps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        used INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
      )`);
    } catch {}

    // Store OTP — invalidate previous ones for this email
    db.prepare(`DELETE FROM email_otps WHERE email = ?`).run(clean);
    db.prepare(`INSERT INTO email_otps (email, code, expires_at, used, created_at) VALUES (?, ?, ?, 0, ?)`)
      .run(clean, code, now + OTP_TTL_MS, now);

    // Send via Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"1% MatchSats" <${GMAIL_USER}>`,
      to: clean,
      subject: `Your login code: ${code}`,
      html: `
        <div style="font-family:sans-serif;background:#0a0a0a;color:#fff;padding:40px;max-width:480px;margin:0 auto;border-radius:16px;">
          <p style="font-size:28px;font-weight:900;margin:0 0 8px;">
            <span style="color:#cafd00;">1</span><span style="color:#9d7bb8;">%</span>
          </p>
          <p style="color:#777;font-size:14px;margin:0 0 32px;">Bitcoin Nairobi Conference 2026</p>
          <p style="color:#aaa;font-size:16px;margin:0 0 24px;">Your login code is:</p>
          <div style="background:#111110;border:1px solid rgba(202,253,0,0.25);border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
            <span style="color:#cafd00;font-size:48px;font-weight:900;letter-spacing:12px;">${code}</span>
          </div>
          <p style="color:#555;font-size:13px;margin:0;">Expires in 10 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
      text: `Your MatchSats login code is: ${code}\n\nExpires in 10 minutes.`,
    });

    console.log(`[email-otp] sent code to ${clean}`);
    return NextResponse.json({ success: true, email: clean });

  } catch (err: any) {
    console.error("[email-otp] error:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Failed to send email" }, { status: 500 });
  }
}
