export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth(request);
  if (error) return error;
  const userId = session!.userId;

  // Sync eventCode into session from profile if missing
  if (!session!.eventCode) {
    const saved = db.prepare(`SELECT invite_code FROM profiles WHERE pubkey = ?`).get(userId) as any;
    if (saved?.invite_code) {
      session!.eventCode = saved.invite_code;
      await session!.save();
    }
  }
  const rows = db.prepare(`
    SELECT m.id, m.score, m.rationale, m.status, m.created_at,
      p.pubkey, p.name, p.role, p.location, p.core_vibe,
      p.interests, p.building, p.needs, p.lightning_addr,
      CASE WHEN m.pubkey_a = ? THEN 'a' ELSE 'b' END as my_side
    FROM matches m
    JOIN profiles p ON (
      CASE WHEN m.pubkey_a = ? THEN m.pubkey_b ELSE m.pubkey_a END = p.pubkey
    )
    WHERE m.pubkey_a = ? OR m.pubkey_b = ?
    ORDER BY m.score DESC
  `).all(userId, userId, userId, userId) as any[];
  return NextResponse.json({
    matches: rows.map(r => ({
      ...r,
      interests: (() => { try { return JSON.parse(r.interests ?? "[]"); } catch { return []; } })(),
    }))
  });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth(request);
  if (error) return error;
  const userId = session!.userId;

  // If session has no eventCode, load it from the saved profile
  let eventCode = session!.eventCode;
  if (!eventCode) {
    const saved = db.prepare(`SELECT invite_code FROM profiles WHERE pubkey = ?`).get(userId) as any;
    if (saved?.invite_code) {
      eventCode = saved.invite_code;
      session!.eventCode = eventCode;
      await session!.save();
    }
  }
  const myProfile = db.prepare(`SELECT * FROM profiles WHERE pubkey = ?`).get(userId) as any;
  if (!myProfile) {
    return NextResponse.json({ error: "Complete your profile first" }, { status: 400 });
  }
  const alreadyMatched = db.prepare(`
    SELECT CASE WHEN pubkey_a = ? THEN pubkey_b ELSE pubkey_a END as other
    FROM matches WHERE pubkey_a = ? OR pubkey_b = ?
  `).all(userId, userId, userId).map((r: any) => r.other);
  const excludeList = [userId, ...alreadyMatched];
  const placeholders = excludeList.map(() => "?").join(",");
  const candidates = eventCode
    ? db.prepare(`SELECT * FROM profiles WHERE pubkey NOT IN (${placeholders}) AND invite_code = ? LIMIT 20`).all(...excludeList, eventCode) as any[]
    : db.prepare(`SELECT * FROM profiles WHERE pubkey NOT IN (${placeholders}) LIMIT 20`).all(...excludeList) as any[];
  if (candidates.length === 0) {
    return NextResponse.json({ matches: [], message: "No other profiles found yet. Share the event code!" });
  }
  const parseProfile = (p: any) => ({
    ...p,
    interests: (() => { try { return JSON.parse(p.interests ?? "[]"); } catch { return []; } })(),
    personality: (() => { try { return JSON.parse(p.personality ?? "{}"); } catch { return {}; } })(),
  });
  const me = parseProfile(myProfile);
  const parsedCandidates = candidates.map(parseProfile);
  const prompt = `You are an expert conference matchmaker. Given this person's profile and candidates, return the top 3 most valuable connections as JSON.

MY PROFILE:
Name: ${me.name}, Role: ${me.role ?? "Unknown"}, Building: ${me.building ?? "Not specified"}, Needs: ${me.needs ?? "Not specified"}, Interests: ${me.interests.join(", ")}

CANDIDATES:
${parsedCandidates.map((c: any, i: number) => `${i+1}. ID: ${c.pubkey}, Name: ${c.name}, Role: ${c.role ?? "Unknown"}, Building: ${c.building ?? "Not specified"}, Needs: ${c.needs ?? "Not specified"}, Interests: ${c.interests.join(", ")}`).join("\n")}

Return ONLY valid JSON: {"matches":[{"pubkey":"id","name":"name","role":"role","score":87,"rationale":"Two sentence explanation.","tags":["tag1","tag2","tag3"]}]}`;

  const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], temperature: 0.7, max_tokens: 1000 }),
    signal: AbortSignal.timeout(30000),
  });
  if (!aiRes.ok) return NextResponse.json({ error: "AI matching failed" }, { status: 500 });
  const aiData = await aiRes.json();
  const raw = aiData.choices?.[0]?.message?.content ?? "";
  let results: any[] = [];
  try { results = JSON.parse(raw.replace(/```json|```/g, "").trim()).matches ?? []; } catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }
  const now = Date.now();
  for (const match of results.slice(0, 3)) {
    try {
      db.prepare(`INSERT OR IGNORE INTO matches (pubkey_a, pubkey_b, score, rationale, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'new', ?, ?)`).run(userId, match.pubkey, match.score, match.rationale, now, now);
    } catch {}
  }
  return NextResponse.json({ matches: results.slice(0, 3), count: results.length });
}
