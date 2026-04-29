// app/api/match/route.ts
// Reads profiles from SQLite, sends to OpenAI, returns top 3 matches

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import db from "@/lib/db";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ── Types ─────────────────────────────────────────────────────────────
interface Profile {
  pubkey: string;
  name: string;
  role: string | null;
  location: string | null;
  building: string | null;
  needs: string | null;
  vibe: string | null;
  core_vibe: string;
  interests: string[];
  personality: Record<string, number>;
}

interface MatchResult {
  pubkey: string;
  name: string;
  role: string | null;
  score: number;
  rationale: string;
  tags: string[];
}

// ── GET — fetch existing matches for current user ─────────────────────
export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth(request);
  if (error) return error;

  const matches = db.prepare(`
    SELECT
      m.id, m.score, m.rationale, m.status, m.created_at,
      CASE WHEN m.pubkey_a = ? THEN m.pubkey_b ELSE m.pubkey_a END as match_pubkey,
      p.name, p.role, p.location, p.core_vibe, p.interests, p.building
    FROM matches m
    LEFT JOIN profiles p ON p.pubkey = CASE WHEN m.pubkey_a = ? THEN m.pubkey_b ELSE m.pubkey_a END
    WHERE m.pubkey_a = ? OR m.pubkey_b = ?
    ORDER BY m.score DESC
  `).all(session!.pubkey, session!.pubkey, session!.pubkey, session!.pubkey) as any[];

  return NextResponse.json({
    matches: matches.map(m => ({
      ...m,
      interests: JSON.parse(m.interests ?? "[]"),
    }))
  });
}

// ── POST — run AI matching ────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth(request);
  if (error) return error;

  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI not configured" }, { status: 500 });
  }

  // 1. Get current user's profile
  const myProfile = db.prepare(`
    SELECT * FROM profiles WHERE pubkey = ?
  `).get(session!.pubkey) as any;

  if (!myProfile) {
    return NextResponse.json({ error: "Complete your profile first" }, { status: 400 });
  }

  // 2. Get all other profiles (exclude self, already matched)
  const alreadyMatched = db.prepare(`
    SELECT CASE WHEN pubkey_a = ? THEN pubkey_b ELSE pubkey_a END as other
    FROM matches WHERE pubkey_a = ? OR pubkey_b = ?
  `).all(session!.pubkey, session!.pubkey, session!.pubkey).map((r: any) => r.other);

  const excludeList = [session!.pubkey, ...alreadyMatched];
  const placeholders = excludeList.map(() => "?").join(",");

  const candidates = db.prepare(`
    SELECT pubkey, name, role, location, building, needs, vibe, core_vibe, interests, personality
    FROM profiles
    WHERE pubkey NOT IN (${placeholders})
    LIMIT 20
  `).all(...excludeList) as any[];

  if (candidates.length === 0) {
    return NextResponse.json({ matches: [], message: "No new profiles to match against yet" });
  }

  // 3. Parse JSON fields
  const myParsed: Profile = {
    ...myProfile,
    interests: JSON.parse(myProfile.interests ?? "[]"),
    personality: JSON.parse(myProfile.personality ?? "{}"),
  };

  const candidatesParsed: Profile[] = candidates.map(c => ({
    ...c,
    interests: JSON.parse(c.interests ?? "[]"),
    personality: JSON.parse(c.personality ?? "{}"),
  }));

  // 4. Build the prompt
  const prompt = buildMatchingPrompt(myParsed, candidatesParsed);

  // 5. Call OpenAI
  let aiResponse: MatchResult[];
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1000,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: `You are an expert conference matchmaker. You analyze professional profiles and identify the most valuable connections. You respond ONLY with valid JSON — no markdown, no explanation, just the JSON array.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "[]";
    aiResponse = JSON.parse(content.replace(/```json|```/g, "").trim());
  } catch (err) {
    console.error("[match] OpenAI error:", err);
    return NextResponse.json({ error: "AI matching failed" }, { status: 500 });
  }

  // 6. Save matches to DB
  const saved: MatchResult[] = [];
  for (const match of aiResponse.slice(0, 3)) {
    try {
      db.prepare(`
        INSERT OR IGNORE INTO matches (pubkey_a, pubkey_b, score, rationale, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'new', ?, ?)
      `).run(session!.pubkey, match.pubkey, match.score, match.rationale, Date.now(), Date.now());
      saved.push(match);
    } catch (err) {
      console.error("[match] DB insert error:", err);
    }
  }

  return NextResponse.json({ matches: saved });
}

// ── Prompt builder ────────────────────────────────────────────────────
function buildMatchingPrompt(me: Profile, candidates: Profile[]): string {
  return `
You are matching conference attendees. Find the top 3 most valuable connections for this person.

MY PROFILE:
Name: ${me.name}
Role: ${me.role ?? "Not specified"}
Building: ${me.building ?? "Not specified"}
Needs: ${me.needs ?? "Not specified"}
Vibe: ${me.vibe ?? "Not specified"}
Core vibe: ${me.core_vibe}
Interests: ${me.interests.join(", ")}

CANDIDATES:
${candidates.map((c, i) => `
[${i + 1}] pubkey: ${c.pubkey}
Name: ${c.name}
Role: ${c.role ?? "Not specified"}
Building: ${c.building ?? "Not specified"}
Needs: ${c.needs ?? "Not specified"}
Core vibe: ${c.core_vibe}
Interests: ${c.interests.join(", ")}
`).join("\n")}

Return a JSON array of the top 3 matches. Each object must have:
- pubkey: string (exact pubkey from candidates)
- name: string
- role: string or null
- score: number (0-100, how valuable this connection is)
- rationale: string (2 sentences max — why this specific match is valuable, be concrete)
- tags: string[] (3 tags describing the match, e.g. ["Lightning", "Fintech", "Africa"])

Return ONLY the JSON array. No markdown. No explanation.
`;
}