export const dynamic = "force-dynamic";
// app/api/transcribe/route.ts
// Receives audio blob → Whisper → GPT summary in English + Swahili

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import db from "@/lib/db";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth(request);
  if (error) return error;

  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI not configured" }, { status: 500 });
  }

  try {
    // 1. Parse the multipart form — audio file + match_id
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const matchId = formData.get("match_id") as string | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    console.log(`[transcribe] received audio: ${audioFile.size} bytes, type: ${audioFile.type}`);

    // 2. Send to Whisper
    const whisperForm = new FormData();
    whisperForm.append("file", audioFile, "meeting.webm");
    whisperForm.append("model", "whisper-1");
    whisperForm.append("language", "en"); // handles Swahili-English code switching
    whisperForm.append("response_format", "verbose_json"); // includes word timestamps

    const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` },
      body: whisperForm,
      signal: AbortSignal.timeout(60000), // 60 second timeout
    });

    if (!whisperRes.ok) {
      const err = await whisperRes.text();
      console.error("[transcribe] Whisper error:", err);
      return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
    }

    const whisperData = await whisperRes.json();
    const transcript = whisperData.text ?? "";
    console.log(`[transcribe] transcript length: ${transcript.length} chars`);

    // 3. Generate summaries in English + Swahili
    const summaryRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 800,
        messages: [
          {
            role: "system",
            content: `You are summarising a conference meeting between two professionals. 
Be concise, professional, and capture key outcomes, decisions, and next steps.
Return ONLY valid JSON, no markdown.`,
          },
          {
            role: "user",
            content: `Transcript of meeting:
"${transcript}"

Return a JSON object with exactly these fields:
{
  "summary_en": "2-3 sentence summary in English",
  "summary_sw": "2-3 sentence summary in Swahili (use natural Kenyan Swahili)",
  "key_points": ["point 1", "point 2", "point 3"],
  "next_steps": ["action 1", "action 2"],
  "sentiment": "positive" | "neutral" | "negative"
}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    let summaryData: any = {
      summary_en: "Meeting recorded successfully.",
      summary_sw: "Mkutano umerekodiwa.",
      key_points: [],
      next_steps: [],
      sentiment: "neutral",
    };

    if (summaryRes.ok) {
      const summaryJson = await summaryRes.json();
      const content = summaryJson.choices?.[0]?.message?.content ?? "{}";
      try {
        summaryData = JSON.parse(content.replace(/```json|```/g, "").trim());
      } catch {
        console.error("[transcribe] Failed to parse summary JSON");
      }
    }

    // 4. Save to DB if match_id provided and valid
    if (matchId) {
      try {
        db.prepare(`
          INSERT INTO reviews (match_id, reviewer, summary_en, summary_sw, transcript, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          parseInt(matchId),
          session!.pubkey,
          summaryData.summary_en,
          summaryData.summary_sw,
          transcript,
          Date.now(),
        );
      } catch (dbErr) {
        // Don't fail the whole request if save fails — match may not exist yet
        console.warn("[transcribe] DB save skipped:", (dbErr as any).message);
      }
    }

    return NextResponse.json({
      success: true,
      transcript,
      summary_en: summaryData.summary_en,
      summary_sw: summaryData.summary_sw,
      key_points: summaryData.key_points ?? [],
      next_steps: summaryData.next_steps ?? [],
      sentiment: summaryData.sentiment ?? "neutral",
    });

  } catch (err) {
    console.error("[transcribe] error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}