// app/api/match/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import db from "@/lib/db";

interface Profile {
  pubkey: string;
  name: string;
  role: string | null;
  building: string | null;
  needs: string | null;
  vibe: string | null;
  core_vibe: string;
  interests: string[];
  personality: Record<string, number>;
  invite_code: string | null;
}

interface MatchResult {
  pubkey: string;
  name: string;
  role: string | null;
  score: number;
  rationale: string;
  tags: string[];
}

function buildMatchingPrompt(me: Profile, candidates: Profile[]): string {
  const myStr = `
Name: ${me.name}
Role: ${me.role ?? "Unknown"}
Building: ${me.building ?? "Not specified"}
Needs: ${me.needs ?? "Not specified"}
Vibe: ${me.vibe ?? "Not specified"}
Core vibe: ${me.core_vibe}
Interests: ${me.interests.join(", ")}
`.trim();

  const candidateStr = candidates.map((c, i) => `
Candidate ${i + 1} (id: ${c.pubkey}):
Name: ${c.name}
Role: ${c.role ?? "Unknown"}
Building: ${c.building ?? "Not specified"}
Needs: ${c.needs ?? "Not specified"}
Vibe: ${c.vibe ?? "Not specified"}
Core vibe: ${c.core_vibe}
Interests: ${c.interests.join(", ")}
`).join("\n---\n");

  return `You are an expert conference matchmaker. Given this person's profile and a list of candidates, return the top 3 most valuable connections as JSON.

MY PROFILE:
${myStr}

CANDIDATES:
${candidateStr}

Return ONLY valid JSON in this exact format:
{
  "matches": [
    {
      "pubkey": "candidate_id_here",
      "name": "their name",
      "role": "their role",
      "score": 87,
      "rationale": "Two sentence explanation of why this is a valuable connection.",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ]
}

Score 0-100. Pick the top 3. Be specific in rationale about WHY they should meet.`;
}

// GET — fetch existing matches
export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth(request);
  if (error) return error;

  const userId = session!.userId;

  const rows = db.prepare(`
    SELECT 
      m.id, m.score, m.rationale, m.status, m.created_at,
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

// POST — run AI matching
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth(request);
  if (error) return error;

  const userId = session!.userId;
  const eventCode = session!.eventCode;

  // Load my profile
  const myProfile = db.prepare(`SELECT * FROM profiles WHERE pubkey = ?`).get(userId) as any;
  if (!myProfile) {
    return NextResponse.json({ error: "Complete your profile first" }, { status: 400 });
  }

  // Find candidates — same event code, not already matched, not self
  const alreadyMatched = db.prepare(`
    SELECT CASE WHEN pubkey_a = ? THEN pubkey_b ELSE pubkey_a END as other
    FROM matches WHERE pubkey_a = ? OR pubkey_b = ?
  `).all(userId, userId, userId).map((r: any) => r.other);

  const excludeList = [userId, ...alreadyMatched];
  const placeholders = excludeList.map(() => "?").join(",");

  let candidates: any[];
  if (eventCode) {
    candidates = db.prepare(`
      SELECT * FROM profiles
      WHERE pubkey NOT IN (${placeholders})
      AND invite_code = ?
      LIMIT 20
    `).all(...excludeList, eventCode) as any[];
  } else {
    candidates = db.prepare(`
      SELECT * FROM profiles
      WHERE pubkey NOT IN (${placeholders})
      LIMIT 20
    `).all(...excludeList) as any[];
  }

  if (candidates.length === 0) {
    return NextResponse.json({ matches: [], message: "No other profiles found yet. Share the event code with others!" });
  }

  // Parse interests from JSON
  const parseProfile = (p: any): Profile => ({
    ...p,
    interests: (() => { try { return JSON.parse(p.interests ?? "[]"); } catch { return []; } })(),
    personality: (() => { try { return JSON.parse(p.personality ?? "{}"); } catch { return {}; } })(),
  });

  const me = parseProfile(myProfile);
  const parsedCandidates = candidates.map(parseProfile);

  // Call OpenAI
  const prompt = buildMatchingPrompt(me, parsedCandidates);
  const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!aiRes.ok) {
    return NextResponse.json({ error: "AI matching failed" }, { status: 500 });
  }

  const aiData = await aiRes.json();
  const raw = aiData.choices?.[0]?.message?.content ?? "";

  let results: MatchResult[] = [];
  try {
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    results = parsed.matches ?? [];
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  // Save matches to DB
  const now = Date.now();
  const saved = [];
  for (const match of results.slice(0, 3)) {
    try {
      db.prepare(`
        INSERT OR IGNORE INTO matches (pubkey_a, pubkey_b, score, rationale, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'new', ?, ?)
      `).run(userId, match.pubkey, match.score, match.rationale, now, now);
      saved.push(match);
    } catch (e) {
      console.error("Failed to save match:", e);
    }
  }

  return NextResponse.json({ matches: saved, count: saved.length });
}