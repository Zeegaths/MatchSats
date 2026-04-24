"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type EscrowState = "pending" | "confirmed" | "disputed" | "resolved";
type Tab = "summary" | "transcript" | "escrow";

const MEETING = {
  id: "mtg_001",
  with: { name: "Amara O.", initials: "A", role: "Fintech Founder", location: "Lagos, Nigeria" },
  slot: "Today · 3:00 PM – 3:45 PM",
  venue: "Hall B, Table 7",
  satsLocked: 2100,
  status: "pending" as EscrowState,
};

const SUMMARY_EN = `Amara and the user connected on the challenge of merchant onboarding in West Africa. Both agreed that the UX gap between Lightning wallets and POS systems is the primary blocker to adoption — not infrastructure. Amara shared early metrics from her pilot in Accra: 340 merchants onboarded, 60% retention after 30 days. The user offered to share M-Pesa API integration patterns from a previous project. Next step agreed: a follow-up technical call within 72 hours to review the merchant SDK architecture.`;

const SUMMARY_SW = `Amara na mtumiaji walijadili changamoto za kuandikisha wafanyabiashara Afrika Magharibi. Wote walikubaliana kuwa pengo la UX kati ya pochi za Lightning na mifumo ya POS ndiyo kikwazo kikuu — si miundombinu. Amara alishiriki takwimu za mapema kutoka jaribio lake Accra: wafanyabiashara 340 wameandikishwa, uhifadhi wa 60% baada ya siku 30. Mtumiaji alitoa msaada wa kushiriki mifumo ya M-Pesa API. Hatua inayofuata: simu ya kiufundi ndani ya masaa 72 kujadili usanifu wa SDK ya wafanyabiashara.`;

const ACTION_ITEMS = [
  { id: 1, text: "Share M-Pesa API integration docs", owner: "You", due: "48h" },
  { id: 2, text: "Review merchant SDK architecture together", owner: "Both", due: "72h" },
  { id: 3, text: "Intro to Nairobi Lightning meetup group", owner: "Amara", due: "1 week" },
];

const TRANSCRIPT_LINES = [
  { speaker: "You", time: "0:00", text: "Thanks for making time — I know the schedule here is packed." },
  { speaker: "Amara", time: "0:12", text: "Of course. I've been looking forward to this. Your M-Pesa background is exactly what we need right now." },
  { speaker: "You", time: "0:28", text: "Tell me about the merchant onboarding problem you're solving." },
  { speaker: "Amara", time: "0:35", text: "So the core issue isn't Lightning adoption — the rails exist. It's that the UX between a Lightning wallet and a market stall POS is still broken. Merchants don't understand the flow." },
  { speaker: "You", time: "1:10", text: "We saw the same thing with M-Pesa in 2019. The API was solid but the merchant journey had like 11 steps. We got it to 3." },
  { speaker: "Amara", time: "1:22", text: "Exactly that. We have 340 merchants in our Accra pilot. 60% retention after 30 days which is good but we know the drop-off is UX." },
  { speaker: "You", time: "1:48", text: "I can share those integration patterns. We documented everything. Would that help with the SDK you're building?" },
  { speaker: "Amara", time: "1:55", text: "That would be huge. Can we schedule a technical call this week? I want to walk our engineer through it." },
  { speaker: "You", time: "2:08", text: "Absolutely. Let's do it within 72 hours while it's still fresh." },
];

export default function MeetingReviewPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("summary");
  const [escrowState, setEscrowState] = useState<EscrowState>("pending");
  const [lang, setLang] = useState<"en" | "sw">("en");
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "stopped" | "transcribing" | "done">("idle");
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [transcribeDone, setTranscribeDone] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleStartRecording = () => {
    setRecordingState("recording");
    setRecordSeconds(0);
    timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
  };

  const handleStopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRecordingState("stopped");
  };

  const handleProcessRecording = () => {
    setRecordingState("transcribing");
    setTimeout(() => {
      setRecordingState("done");
      setTranscribeDone(true);
    }, 3000);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleConfirm = () => setEscrowState("confirmed");
  const handleDispute = () => {
    setEscrowState("disputed");
    setShowDispute(false);
  };

  return (
    <main style={{
      minHeight: "100vh", background: "#0e0e0e",
      color: "#fff", fontFamily: "'Space Grotesk', sans-serif",
    }}>
      {/* Sticky header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "#0e0e0eee", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1a1a18",
        padding: "1.25rem 1.5rem",
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: "none", border: "1px solid #222220", borderRadius: 99,
            color: "#666", fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: 12, cursor: "pointer",
            padding: "8px 18px", letterSpacing: 1, transition: "all 0.18s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#444"; e.currentTarget.style.color = "#aaa"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#222220"; e.currentTarget.style.color = "#666"; }}
        >
          ← BACK
        </button>
        <div style={{ flex: 1 }}>
          <span style={{ color: "#555", fontSize: 11, letterSpacing: 2, fontWeight: 700 }}>MEETING REVIEW</span>
        </div>
        <span style={{ color: "#cafd00", fontWeight: 700, fontSize: 15, letterSpacing: 2 }}>MATCHSATS</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem 8rem" }}>

        {/* ── Meeting card ── */}
        <div style={{
          borderRadius: 24, border: "1px solid #222220",
          background: "linear-gradient(135deg, #141412 60%, #1a1428 100%)",
          padding: "24px", marginBottom: 16,
          position: "relative", overflow: "hidden",
        }}>
          {/* Purple glow blob */}
          <div style={{
            position: "absolute", top: -40, right: -40,
            width: 180, height: 180, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(157,123,184,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", position: "relative" }}>
            {/* Avatar */}
            <div style={{
              width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #9d7bb820, #cafd0018)",
              border: "2px solid #9d7bb840",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#c4a0e8", fontWeight: 900, fontSize: 22,
            }}>
              {MEETING.with.initials}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{MEETING.with.name}</h2>
                <EscrowBadge state={escrowState} />
              </div>
              <p style={{ color: "#9d7bb8", fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>
                {MEETING.with.role}
              </p>
              <p style={{ color: "#444", fontSize: 12, margin: 0 }}>{MEETING.with.location}</p>
            </div>
          </div>

          {/* Meeting meta */}
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            {[
              { icon: "◷", label: MEETING.slot },
              { icon: "◈", label: MEETING.venue },
              { icon: "⚡", label: `${MEETING.satsLocked.toLocaleString()} sats locked` },
            ].map(({ icon, label }) => (
              <div key={label} style={{
                padding: "8px 14px", borderRadius: 99,
                border: "1px solid #1e1e1c", background: "#111110",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ color: "#555", fontSize: 13 }}>{icon}</span>
                <span style={{ color: "#666", fontSize: 12, fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Record Meeting ── */}
        <div style={{
          borderRadius: 20, marginBottom: 16,
          border: `1px solid ${recordingState === "recording" ? "#9d7bb860" : "#222220"}`,
          background: recordingState === "recording"
            ? "linear-gradient(135deg, #111110 60%, #1a1228 100%)"
            : "#111110",
          padding: "20px",
          transition: "all 0.3s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <p style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 4px" }}>
                MEETING MEMORY
              </p>
              <p style={{ color: "#777", fontSize: 13, margin: 0 }}>
                Record → Whisper transcription → AI summary
              </p>
            </div>
            {/* Lang toggle */}
            <div style={{ display: "flex", borderRadius: 99, border: "1px solid #222220", overflow: "hidden" }}>
              {(["en", "sw"] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding: "6px 14px",
                  background: lang === l ? "#9d7bb8" : "transparent",
                  border: "none", color: lang === l ? "#fff" : "#444",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: 11, cursor: "pointer",
                  letterSpacing: 1, textTransform: "uppercase",
                  transition: "all 0.18s",
                }}>
                  {l === "en" ? "EN" : "SW"}
                </button>
              ))}
            </div>
          </div>

          {/* ── idle ── */}
          {recordingState === "idle" && (
            <button
              onClick={handleStartRecording}
              style={{
                width: "100%", padding: "28px 20px", borderRadius: 16,
                border: "1px dashed #2a2a28", background: "transparent",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#9d7bb860"; e.currentTarget.style.background = "#9d7bb806"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a28"; e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "#9d7bb820", border: "2px solid #9d7bb840",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#9d7bb8" }} />
              </div>
              <span style={{ color: "#666", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>
                TAP TO RECORD MEETING
              </span>
              <span style={{ color: "#333", fontSize: 11, fontFamily: "'Space Grotesk', sans-serif" }}>
                Swahili · English · Sheng — all supported
              </span>
            </button>
          )}

          {/* ── recording ── */}
          {recordingState === "recording" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              {/* Pulsing mic */}
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{
                  position: "absolute", width: 90, height: 90, borderRadius: "50%",
                  border: "1px solid #9d7bb840",
                  animation: "ping 1.2s ease-out infinite",
                }} />
                <div style={{
                  position: "absolute", width: 70, height: 70, borderRadius: "50%",
                  border: "1px solid #9d7bb860",
                  animation: "ping 1.2s ease-out infinite 0.3s",
                }} />
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "#9d7bb8", boxShadow: "0 0 30px rgba(157,123,184,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ width: 16, height: 20, borderRadius: 8, background: "#fff" }} />
                </div>
              </div>

              {/* Timer */}
              <div style={{ textAlign: "center" }}>
                <p style={{
                  color: "#9d7bb8", fontWeight: 800, fontSize: 36,
                  fontVariantNumeric: "tabular-nums", margin: "0 0 4px", letterSpacing: 2,
                }}>
                  {formatTime(recordSeconds)}
                </p>
                <p style={{ color: "#555", fontSize: 12, margin: 0, letterSpacing: 1 }}>RECORDING IN PROGRESS</p>
              </div>

              {/* Waveform bars */}
              <div style={{ display: "flex", gap: 4, alignItems: "center", height: 32 }}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} style={{
                    width: 3, borderRadius: 99,
                    background: "#9d7bb8",
                    height: `${20 + Math.sin(i * 0.8) * 12}px`,
                    opacity: 0.4 + (i % 3) * 0.2,
                    animation: `wave ${0.6 + (i % 4) * 0.2}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.05}s`,
                  }} />
                ))}
              </div>

              {/* Stop button */}
              <button
                onClick={handleStopRecording}
                style={{
                  padding: "13px 36px", borderRadius: 99,
                  background: "transparent", border: "1px solid #9d7bb860",
                  color: "#9d7bb8", fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                  letterSpacing: 1.5, transition: "all 0.18s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#9d7bb815"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                ■ STOP RECORDING
              </button>
            </div>
          )}

          {/* ── stopped ── */}
          {recordingState === "stopped" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{
                padding: "16px 20px", borderRadius: 14,
                border: "1px solid #9d7bb840", background: "#9d7bb808",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                  background: "#9d7bb820", border: "1px solid #9d7bb840",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ width: 12, height: 14, borderRadius: 4, background: "#9d7bb8" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#c4a0e8", fontWeight: 700, fontSize: 14, margin: 0 }}>
                    Recording saved · {formatTime(recordSeconds)}
                  </p>
                  <p style={{ color: "#555", fontSize: 12, margin: "2px 0 0" }}>
                    Ready to transcribe
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => { setRecordingState("idle"); setRecordSeconds(0); }}
                  style={{
                    flex: "0 0 auto", padding: "11px 20px", borderRadius: 99,
                    background: "transparent", border: "1px solid #222220",
                    color: "#555", fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 1,
                  }}
                >
                  RE-RECORD
                </button>
                <button
                  onClick={handleProcessRecording}
                  style={{
                    flex: 1, padding: "11px 20px", borderRadius: 99,
                    background: "#9d7bb8", border: "none",
                    color: "#fff", fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 1,
                    boxShadow: "0 0 20px rgba(157,123,184,0.3)",
                  }}
                >
                  TRANSCRIBE ⚡
                </button>
              </div>
            </div>
          )}

          {/* ── transcribing ── */}
          {recordingState === "transcribing" && (
            <div style={{
              padding: "20px", borderRadius: 14,
              border: "1px solid #9d7bb830", background: "#9d7bb808",
              display: "flex", flexDirection: "column", gap: 14,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  border: "2px solid #9d7bb8", borderTopColor: "transparent",
                  animation: "spin 0.8s linear infinite", flexShrink: 0,
                }} />
                <span style={{ color: "#9d7bb8", fontWeight: 700, fontSize: 14 }}>
                  Transcribing with Whisper...
                </span>
              </div>
              {[
                { label: "Audio decoded", done: true },
                { label: "Language detected: Swahili/English", done: true },
                { label: "Routing to AfroXLMR...", done: false },
              ].map(({ label, done }, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: done ? "#9d7bb8" : "#2a2a28" }} />
                  <span style={{ color: done ? "#9d7bb8" : "#333", fontSize: 12 }}>{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── done ── */}
          {recordingState === "done" && (
            <div style={{ padding: "12px 16px", borderRadius: 12,
              border: "1px solid #9d7bb840", background: "#9d7bb810",
              display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#9d7bb8", fontSize: 16 }}>✓</span>
              <span style={{ color: "#9d7bb8", fontWeight: 700, fontSize: 13 }}>
                Transcription complete · Summary ready
              </span>
            </div>
          )}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {(["summary", "transcript", "escrow"] as Tab[]).map((t) => {
            const active = tab === t;
            const labels: Record<Tab, string> = { summary: "AI Summary", transcript: "Transcript", escrow: "Escrow" };
            return (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "9px 20px", borderRadius: 99,
                border: active ? "none" : "1px solid #222220",
                background: active
                  ? t === "escrow" ? "#9d7bb8" : "#cafd00"
                  : "transparent",
                color: active
                  ? t === "escrow" ? "#fff" : "#1a2200"
                  : "#555",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
                letterSpacing: 0.5, transition: "all 0.18s",
                boxShadow: active && t !== "escrow" ? "0 0 16px rgba(202,253,0,0.2)" : "none",
              }}>
                {labels[t]}
              </button>
            );
          })}
        </div>

        {/* ── SUMMARY TAB ── */}
        {tab === "summary" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Summary text */}
            <div style={{
              borderRadius: 20, border: "1px solid #222220",
              background: "#141412", padding: "22px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <p style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: 0 }}>
                  {lang === "en" ? "SUMMARY · ENGLISH" : "MUHTASARI · KISWAHILI"}
                </p>
                <span style={{
                  background: "#9d7bb815", border: "1px solid #9d7bb830",
                  color: "#9d7bb8", fontSize: 10, fontWeight: 700,
                  padding: "3px 10px", borderRadius: 99, letterSpacing: 1,
                }}>
                  {lang === "en" ? "translation god" : "AfroXLMR + GPT-4o"}
                </span>
              </div>
              {transcribeDone ? (
                <p style={{ color: "#aaa", fontSize: 15, lineHeight: 1.8, margin: 0 }}>
                  {lang === "en" ? SUMMARY_EN : SUMMARY_SW}
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[80, 100, 65, 90].map((w, i) => (
                    <div key={i} style={{ height: 14, borderRadius: 99, background: "#1e1e1c", width: `${w}%` }} />
                  ))}
                  <p style={{ color: "#333", fontSize: 12, margin: "8px 0 0" }}>Upload audio to generate summary</p>
                </div>
              )}
            </div>

            {/* Action items */}
            <div style={{
              borderRadius: 20, border: "1px solid #222220",
              background: "#111110", padding: "20px",
            }}>
              <p style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 14px" }}>
                ACTION ITEMS
              </p>
              {transcribeDone ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {ACTION_ITEMS.map((item) => (
                    <div key={item.id} style={{
                      padding: "14px 16px", borderRadius: 14,
                      border: "1px solid #1e1e1c", background: "#141412",
                      display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%",
                        border: "1.5px solid #9d7bb860", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#9d7bb8" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: "#ccc", fontSize: 14, fontWeight: 600, margin: 0 }}>{item.text}</p>
                        <p style={{ color: "#444", fontSize: 11, margin: "2px 0 0" }}>
                          {item.owner} · due in {item.due}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#333", fontSize: 13 }}>Action items will appear after transcription.</p>
              )}
            </div>

            {/* ── Connection Rating ── */}
            <ConnectionRating />
          </div>
        )}

        {/* ── TRANSCRIPT TAB ── */}
        {tab === "transcript" && (
          <div style={{
            borderRadius: 20, border: "1px solid #222220",
            background: "#141412", padding: "20px",
          }}>
            <p style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 16px" }}>
              FULL TRANSCRIPT
            </p>
            {transcribeDone ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {TRANSCRIPT_LINES.map((line, i) => {
                  const isYou = line.speaker === "You";
                  return (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                        background: isYou ? "#cafd0015" : "#9d7bb815",
                        border: `1px solid ${isYou ? "#cafd0030" : "#9d7bb830"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: isYou ? "#cafd00" : "#9d7bb8",
                        fontWeight: 800, fontSize: 10,
                      }}>
                        {isYou ? "Y" : "A"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                          <span style={{ color: isYou ? "#cafd00" : "#9d7bb8", fontSize: 12, fontWeight: 700 }}>
                            {line.speaker}
                          </span>
                          <span style={{ color: "#333", fontSize: 11 }}>{line.time}</span>
                        </div>
                        <p style={{ color: "#888", fontSize: 14, lineHeight: 1.65, margin: 0 }}>{line.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: "#333", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
                Upload audio to generate transcript
              </p>
            )}
          </div>
        )}

        {/* ── ESCROW TAB ── */}
        {tab === "escrow" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* State display */}
            <div style={{
              borderRadius: 20, padding: "24px",
              border: `1px solid ${escrowState === "confirmed" ? "#cafd0040" : escrowState === "disputed" ? "#9d7bb840" : "#222220"}`,
              background: escrowState === "confirmed" ? "#cafd0008" : escrowState === "disputed" ? "#9d7bb808" : "#141412",
              textAlign: "center",
              transition: "all 0.3s ease",
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>
                {escrowState === "pending" ? "⚡" : escrowState === "confirmed" ? "✓" : escrowState === "disputed" ? "⚠" : "✓"}
              </div>
              <h3 style={{
                fontSize: 20, fontWeight: 800, margin: "0 0 8px",
                color: escrowState === "confirmed" ? "#cafd00" : escrowState === "disputed" ? "#9d7bb8" : "#fff",
              }}>
                {escrowState === "pending" && "Awaiting Confirmation"}
                {escrowState === "confirmed" && "Meeting Confirmed"}
                {escrowState === "disputed" && "Dispute Raised"}
                {escrowState === "resolved" && "Escrow Resolved"}
              </h3>
              <p style={{ color: "#555", fontSize: 14, margin: 0, lineHeight: 1.7 }}>
                {escrowState === "pending" && `${MEETING.satsLocked.toLocaleString()} sats held in escrow. Confirm attendance to trigger refund.`}
                {escrowState === "confirmed" && `Both parties confirmed. ${MEETING.satsLocked.toLocaleString()} sats will be refunded to both wallets within 60 seconds.`}
                {escrowState === "disputed" && "Dispute logged. Funds are frozen pending manual review. You'll hear back within 24 hours."}
                {escrowState === "resolved" && "Escrow resolved. Funds distributed per the outcome."}
              </p>
            </div>

            {/* State machine breakdown */}
            <div style={{
              borderRadius: 20, border: "1px solid #1e1e1c",
              background: "#111110", padding: "20px",
            }}>
              <p style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 14px" }}>
                ESCROW STATE MACHINE
              </p>
              {[
                { scenario: "Both confirm", outcome: "Full refund ✓", highlight: escrowState === "confirmed" },
                { scenario: "You confirm, they don't", outcome: "Their sats → you", highlight: false },
                { scenario: "Neither confirms", outcome: "Full refund (timeout)", highlight: false },
                { scenario: "Dispute raised", outcome: "Manual review", highlight: escrowState === "disputed" },
              ].map(({ scenario, outcome, highlight }) => (
                <div key={scenario} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "11px 14px", borderRadius: 10, marginBottom: 6,
                  background: highlight ? "#9d7bb810" : "transparent",
                  border: highlight ? "1px solid #9d7bb830" : "1px solid transparent",
                  transition: "all 0.2s",
                }}>
                  <span style={{ color: highlight ? "#c4a0e8" : "#555", fontSize: 13 }}>{scenario}</span>
                  <span style={{ color: highlight ? "#cafd00" : "#444", fontSize: 13, fontWeight: 700 }}>{outcome}</span>
                </div>
              ))}
            </div>

            {/* Dispute form */}
            {showDispute && (
              <div style={{
                borderRadius: 20, border: "1px solid #9d7bb840",
                background: "#9d7bb808", padding: "20px",
              }}>
                <p style={{ color: "#9d7bb8", fontSize: 11, fontWeight: 700, letterSpacing: 2, margin: "0 0 12px" }}>
                  DESCRIBE THE ISSUE
                </p>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Describe what happened — e.g. the other party didn't show up, or the meeting was cut short..."
                  style={{
                    width: "100%", background: "#111110",
                    border: "1px solid #2a2a28", borderRadius: 12,
                    color: "#fff", fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 14, padding: "14px 16px", resize: "vertical",
                    minHeight: 100, outline: "none", boxSizing: "border-box",
                    transition: "border-color 0.18s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#9d7bb8")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2a28")}
                />
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button onClick={() => setShowDispute(false)} style={{
                    flex: "0 0 auto", padding: "11px 20px", borderRadius: 99,
                    background: "transparent", border: "1px solid #2a2a28",
                    color: "#555", fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 1,
                  }}>
                    CANCEL
                  </button>
                  <button onClick={handleDispute} style={{
                    flex: 1, padding: "11px 20px", borderRadius: 99,
                    background: "#9d7bb8", border: "none",
                    color: "#fff", fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 1,
                  }}>
                    SUBMIT DISPUTE
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Floating action bar ── */}
      {escrowState === "pending" && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          padding: "1rem 1.5rem 2rem",
          background: "linear-gradient(to top, #0e0e0e 70%, transparent)",
        }}>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 10 }}>
            <button
              onClick={() => { setShowDispute(true); setTab("escrow"); }}
              style={{
                flex: "0 0 auto", padding: "15px 22px", borderRadius: 99,
                background: "transparent", border: "1px solid #9d7bb840",
                color: "#9d7bb8", fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: 12, cursor: "pointer",
                letterSpacing: 1, transition: "all 0.18s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#9d7bb810"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              DISPUTE
            </button>
            <button
              onClick={() => { handleConfirm(); setTab("escrow"); }}
              style={{
                flex: 1, padding: "15px", borderRadius: 99,
                background: "#cafd00", border: "none",
                color: "#1a2200", fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800, fontSize: 14, cursor: "pointer",
                letterSpacing: 1.5, textTransform: "uppercase",
                boxShadow: "0 0 30px rgba(202,253,0,0.3)",
                transition: "opacity 0.18s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              ✓ CONFIRM ATTENDANCE
            </button>
          </div>
        </div>
      )}

      {/* Confirmed state CTA */}
      {escrowState === "confirmed" && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          padding: "1rem 1.5rem 2rem",
          background: "linear-gradient(to top, #0e0e0e 70%, transparent)",
        }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <button
              onClick={() => router.push("/matches")}
              style={{
                width: "100%", padding: "15px", borderRadius: 99,
                background: "transparent", border: "1px solid #cafd0040",
                color: "#cafd00", fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: 14, cursor: "pointer",
                letterSpacing: 1.5, textTransform: "uppercase",
              }}
            >
              BACK TO MATCHES →
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ping { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(1.5); opacity: 0; } }
        @keyframes wave { from { transform: scaleY(0.5); } to { transform: scaleY(1.2); } }
      `}</style>
    </main>
  );
}

const SIGNAL_LABELS: Record<number, { label: string; sub: string; color: string }> = {
  0: { label: "—",            sub: "no rating yet",           color: "#333" },
  1: { label: "NOISE",        sub: "poor signal · no follow-up",  color: "#ff4444" },
  2: { label: "WEAK SIGNAL",  sub: "low alignment · surface sync", color: "#ff8c42" },
  3: { label: "SYNCED",       sub: "solid handshake · worth repeating", color: "#cafd00" },
  4: { label: "DEEP SYNC",    sub: "high alignment · follow-up locked", color: "#9d7bb8" },
  5: { label: "FULL NODE",    sub: "max signal · rare connection found", color: "#cafd00" },
};

const DIMENSION_LABELS = ["Relevance", "Depth", "Vibe", "Follow-up"];

function ConnectionRating() {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [dimensions, setDimensions] = useState<Record<string, number>>({
    Relevance: 0, Depth: 0, Vibe: 0, "Follow-up": 0,
  });
  const [submitted, setSubmitted] = useState(false);

  const display = hovered || stars;
  const cfg = SIGNAL_LABELS[display];

  const setDim = (dim: string, val: number) =>
    setDimensions((prev) => ({ ...prev, [dim]: val }));

  if (submitted) {
    return (
      <div style={{
        borderRadius: 20, border: "1px solid #cafd0030",
        background: "linear-gradient(135deg, #111110 60%, #1a1a10 100%)",
        padding: "24px", marginTop: 14,
      }}>
        <p style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 14px" }}>
          CONNECTION RATING
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "#cafd0015", border: "1px solid #cafd0030",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#cafd00", fontWeight: 900, fontSize: 22,
          }}>
            {stars}
          </div>
          <div>
            <p style={{ color: "#cafd00", fontWeight: 800, fontSize: 15, margin: 0 }}>
              {SIGNAL_LABELS[stars].label}
            </p>
            <p style={{ color: "#555", fontSize: 12, margin: "2px 0 0" }}>
              Rating submitted · stored on Nostr
            </p>
          </div>
          <span style={{
            marginLeft: "auto", fontSize: 10, fontWeight: 700,
            color: "#cafd00", letterSpacing: 1,
            background: "#cafd0010", border: "1px solid #cafd0020",
            padding: "4px 10px", borderRadius: 99,
          }}>
            SIGNED ✓
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      borderRadius: 20,
      border: `1px solid ${display > 0 ? `${cfg.color}30` : "#1e1e1c"}`,
      background: "linear-gradient(135deg, #111110 60%, #150e1a 100%)",
      padding: "22px", marginTop: 14,
      transition: "border-color 0.2s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <p style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: 0 }}>
          CONNECTION RATING
        </p>
        <span style={{ color: "#333", fontSize: 10, letterSpacing: 1 }}>SIGNED VIA NOSTR</span>
      </div>

      {/* Star row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = n <= (hovered || stars);
            const starColor = filled ? (SIGNAL_LABELS[hovered || stars]?.color ?? "#cafd00") : "#2a2a28";
            return (
              <button
                key={n}
                onClick={() => setStars(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                style={{
                  width: 36, height: 36, background: "none", border: "none",
                  cursor: "pointer", padding: 0, position: "relative",
                  transition: "transform 0.15s ease",
                  transform: hovered === n ? "scale(1.25)" : filled ? "scale(1.1)" : "scale(1)",
                }}
              >
                {/* Cyberpunk star — hexagonal shape */}
                <svg viewBox="0 0 36 36" width="36" height="36">
                  <polygon
                    points="18,2 22,13 34,13 24,20 28,32 18,25 8,32 12,20 2,13 14,13"
                    fill={filled ? starColor : "transparent"}
                    stroke={filled ? starColor : "#2a2a28"}
                    strokeWidth="1.5"
                    style={{ filter: filled ? `drop-shadow(0 0 6px ${starColor}88)` : "none", transition: "all 0.15s" }}
                  />
                  {/* Inner detail lines for cyberpunk feel */}
                  {filled && (
                    <polygon
                      points="18,8 20,15 27,15 22,19 24,26 18,22 12,26 14,19 9,15 16,15"
                      fill="none"
                      stroke={starColor === "#cafd00" ? "#1a2200" : "#ffffff"}
                      strokeWidth="0.8"
                      opacity="0.3"
                    />
                  )}
                </svg>
              </button>
            );
          })}
        </div>

        {/* Dynamic label */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {display > 0 ? (
            <div>
              <p style={{
                color: cfg.color, fontWeight: 800, fontSize: 14,
                margin: 0, letterSpacing: 1,
                textShadow: `0 0 20px ${cfg.color}66`,
                transition: "all 0.2s",
              }}>
                {cfg.label}
              </p>
              <p style={{ color: "#444", fontSize: 11, margin: "2px 0 0" }}>{cfg.sub}</p>
            </div>
          ) : (
            <p style={{ color: "#333", fontSize: 13, margin: 0 }}>tap to rate</p>
          )}
        </div>
      </div>

      {/* Signal strength bar */}
      {display > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "#333", fontSize: 10, letterSpacing: 1 }}>SIGNAL STRENGTH</span>
            <span style={{ color: cfg.color, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
              {display * 20}%
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: "#1a1a18", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99,
              background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})`,
              width: `${display * 20}%`,
              boxShadow: `0 0 10px ${cfg.color}66`,
              transition: "width 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            }} />
          </div>
          {/* Tick marks */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            {["NULL", "LOW", "MID", "HIGH", "MAX"].map((t) => (
              <span key={t} style={{ color: "#2a2a28", fontSize: 8, letterSpacing: 0.5, fontWeight: 700 }}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Dimension sliders — only show after star rating */}
      {stars > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
          <p style={{ color: "#333", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: 0 }}>
            SIGNAL BREAKDOWN
          </p>
          {DIMENSION_LABELS.map((dim) => (
            <div key={dim}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#555", fontSize: 12 }}>{dim}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      onClick={() => setDim(dim, v)}
                      style={{
                        width: 20, height: 20, borderRadius: 4, border: "none",
                        background: v <= dimensions[dim] ? "#9d7bb8" : "#1e1e1c",
                        cursor: "pointer", transition: "all 0.15s",
                        boxShadow: v <= dimensions[dim] ? "0 0 6px rgba(157,123,184,0.4)" : "none",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit */}
      {stars > 0 && (
        <button
          onClick={() => setSubmitted(true)}
          style={{
            width: "100%", padding: "13px", borderRadius: 99,
            background: `linear-gradient(90deg, #9d7bb8, ${cfg.color})`,
            border: "none", color: "#0e0e0e",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800, fontSize: 13, cursor: "pointer",
            letterSpacing: 1.5, textTransform: "uppercase",
            boxShadow: `0 0 24px ${cfg.color}33`,
            transition: "opacity 0.18s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          BROADCAST RATING ⚡
        </button>
      )}
    </div>
  );
}

function EscrowBadge({ state }: { state: EscrowState }) {
  const cfg = {
    pending: { label: "ESCROW ACTIVE", bg: "#cafd0015", border: "#cafd0030", color: "#cafd00" },
    confirmed: { label: "CONFIRMED", bg: "#cafd0020", border: "#cafd0050", color: "#cafd00" },
    disputed: { label: "DISPUTED", bg: "#9d7bb815", border: "#9d7bb840", color: "#9d7bb8" },
    resolved: { label: "RESOLVED", bg: "#1e1e1c", border: "#333", color: "#555" },
  }[state];

  return (
    <span style={{
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      color: cfg.color, fontSize: 10, fontWeight: 700,
      padding: "3px 10px", borderRadius: 99, letterSpacing: 1.5,
    }}>
      {cfg.label}
    </span>
  );
}