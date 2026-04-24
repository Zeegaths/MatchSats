"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MATCH_DATA: Record<string, {
  id: number; initials: string; name: string; role: string; location: string;
  sats: number | null; status: string; tags: string[]; matchScore: number;
  bio: string; rationale: string; sharedTags: string[];
  reputation: number; meetingsCompleted: number; noShow: number;
  lnAddress: string; nostrKey: string; availability: string[];
  depth: string;
}> = {
  "1": {
    id: 1, initials: "A", name: "Amara O.", role: "Fintech Founder", location: "Lagos, Nigeria",
    sats: 2100, status: "meet-now", matchScore: 94,
    bio: "Building the payments layer for the next 500 million Africans. Former M-Pesa product lead. Currently fundraising pre-seed for a Lightning-native merchant platform targeting West Africa.",
    tags: ["Lightning Network", "M-Pesa", "Fintech", "Fundraising", "West Africa", "Product"],
    sharedTags: ["Lightning Network", "M-Pesa", "Fintech"],
    rationale: "She's fundraising a fintech product. You have 3 years of M-Pesa integration experience. Perfect alignment on payment infra. Her fundraising timeline overlaps with your investor network connections — this intro has a real shot at moving capital.",
    reputation: 98, meetingsCompleted: 12, noShow: 0,
    lnAddress: "amara@getalby.com", nostrKey: "npub1am4r4...",
    availability: ["Today 3pm–5pm", "Tomorrow 10am–12pm", "Fri 2pm–4pm"],
    depth: "strategic",
  },
  "2": {
    id: 2, initials: "D", name: "Dev X", role: "Rust Developer", location: "Nairobi, Kenya",
    sats: 1500, status: "both-locked", matchScore: 88,
    bio: "Protocol engineer working on cross-chain bridge infrastructure. Open-source contributor to LDK and Core Lightning. Looking for co-builders who understand the Lightning internals.",
    tags: ["Rust", "Bitcoin", "Open Source", "LDK", "Core Lightning", "Bridges"],
    sharedTags: ["Bitcoin", "Open Source", "Lightning Network"],
    rationale: "Building cross-chain bridges. Your Lightning experience could accelerate their mainnet launch. Both based in Nairobi — high chance of ongoing collaboration beyond this conference.",
    reputation: 91, meetingsCompleted: 7, noShow: 1,
    lnAddress: "devx@walletofsatoshi.com", nostrKey: "npub1d3vx...",
    availability: ["Today 5pm–7pm", "Tomorrow 2pm–4pm"],
    depth: "deep",
  },
  "3": {
    id: 3, initials: "P", name: "Priya K.", role: "VC Associate", location: "Mumbai, India",
    sats: null, status: "new", matchScore: 81,
    bio: "VC Associate at a multi-stage fund actively deploying into African crypto infrastructure. Focus on Lightning payments, DeFi rails, and identity primitives. Previously angel invested in 3 African fintech exits.",
    tags: ["Venture Capital", "DeFi", "Africa", "Investments", "Fintech", "Identity"],
    sharedTags: ["DeFi", "Africa", "Fintech"],
    rationale: "Active in African crypto deals and funds exactly the stage you're at. Warm intro potential is high — she has flagged Lightning-native projects as a current thesis priority.",
    reputation: 95, meetingsCompleted: 19, noShow: 0,
    lnAddress: "priya@strike.me", nostrKey: "npub1priy4...",
    availability: ["Tomorrow 11am–1pm", "Fri 9am–11am", "Sat 3pm–5pm"],
    depth: "strategic",
  },
  "4": {
    id: 4, initials: "K", name: "Kwame A.", role: "Protocol Engineer", location: "Accra, Ghana",
    sats: null, status: "new", matchScore: 76,
    bio: "Working on Nostr relay infrastructure and identity primitives for the African developer ecosystem. Contributor to NIPs. Building a Swahili-first social layer on Nostr.",
    tags: ["Nostr", "Bitcoin", "Full-Stack", "Identity", "Swahili", "NIP"],
    sharedTags: ["Nostr", "Bitcoin", "Full-Stack"],
    rationale: "Your identity layer work is directly complementary to his Nostr relay stack. Both targeting African markets — potential to combine distribution and infrastructure.",
    reputation: 84, meetingsCompleted: 4, noShow: 0,
    lnAddress: "kwame@albyhub.com", nostrKey: "npub1kw4m3...",
    availability: ["Today 6pm–8pm", "Tomorrow 4pm–6pm"],
    depth: "deep",
  },
};

const SAT_AMOUNTS = [1000, 2100, 5000, 10000];

export default function MatchDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const match = MATCH_DATA[params.id] ?? MATCH_DATA["1"];

  const [lockStep, setLockStep] = useState<"idle" | "choose" | "confirm" | "locked">("idle");
  const [selectedSats, setSelectedSats] = useState(2100);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const isActive = match.status !== "new";

  return (
    <main style={{
      minHeight: "100vh", background: "#0e0e0e",
      color: "#fff", fontFamily: "'Space Grotesk', sans-serif",
    }}>
      {/* Sticky nav */}
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
            padding: "8px 18px", letterSpacing: 1,
            transition: "all 0.18s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#444"; e.currentTarget.style.color = "#aaa"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#222220"; e.currentTarget.style.color = "#666"; }}
        >
          ← BACK
        </button>
        <span style={{ color: "#cafd00", fontWeight: 700, fontSize: 15, letterSpacing: 2, marginLeft: "auto" }}>
          MATCHSATS
        </span>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 1.5rem 8rem" }}>

        {/* ── Profile hero ── */}
        <div style={{
          background: "#141412", border: "1px solid #222220",
          borderRadius: 24, padding: "2rem", marginBottom: 16,
        }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
              background: "#cafd0018", border: "2px solid #cafd0030",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#cafd00", fontWeight: 900, fontSize: 26,
            }}>
              {match.initials}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{match.name}</h1>
                {match.status === "meet-now" && (
                  <span style={{
                    background: "#cafd0015", border: "1px solid #cafd0040",
                    color: "#cafd00", fontSize: 10, fontWeight: 700,
                    padding: "3px 10px", borderRadius: 99, letterSpacing: 1.5,
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#cafd00",
                      boxShadow: "0 0 6px #cafd00", display: "inline-block" }} />
                    MEET NOW
                  </span>
                )}
                {match.status === "both-locked" && (
                  <span style={{
                    background: "#cafd0015", border: "1px solid #cafd0040",
                    color: "#cafd00", fontSize: 10, fontWeight: 700,
                    padding: "3px 10px", borderRadius: 99, letterSpacing: 1.5,
                  }}>
                    ⚡ BOTH LOCKED
                  </span>
                )}
              </div>
              <p style={{ color: "#cafd00", fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>
                {match.role}
              </p>
              <p style={{ color: "#555", fontSize: 13, margin: 0 }}>{match.location}</p>
            </div>

            {/* Match score */}
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                border: "2px solid #cafd0040", background: "#cafd0010",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "#cafd00", fontWeight: 900, fontSize: 18, lineHeight: 1 }}>{match.matchScore}</span>
                <span style={{ color: "#cafd0088", fontSize: 8, fontWeight: 700, letterSpacing: 1 }}>MATCH</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <p style={{ color: "#888", fontSize: 14, lineHeight: 1.7, margin: "20px 0 0" }}>
            {match.bio}
          </p>
        </div>

        {/* ── Reputation strip ── */}
        <div style={{
          display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap",
        }}>
          {[
            { label: "Reputation", value: `${match.reputation}%` },
            { label: "Meetings", value: match.meetingsCompleted },
            { label: "No-shows", value: match.noShow },
            { label: "Depth", value: match.depth },
          ].map(({ label, value }) => (
            <div key={label} style={{
              flex: "1 1 120px",
              padding: "14px 16px", borderRadius: 14,
              border: "1px solid #1e1e1c", background: "#111110",
              display: "flex", flexDirection: "column", gap: 4,
            }}>
              <span style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>
                {label.toUpperCase()}
              </span>
              <span style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* ── AI Rationale ── */}
        <div style={{
          background: "#141412", border: "1px solid #222220",
          borderRadius: 20, padding: "20px", marginBottom: 16,
        }}>
          <p style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 10px" }}>
            AI RATIONALE
          </p>
          <p style={{ color: "#aaa", fontSize: 15, lineHeight: 1.75, margin: 0 }}>
            {match.rationale}
          </p>
        </div>

        {/* ── Tags ── */}
        <div style={{
          background: "#141412", border: "1px solid #222220",
          borderRadius: 20, padding: "20px", marginBottom: 16,
        }}>
          <p style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 14px" }}>
            THEIR SIGNAL SPACE
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {match.tags.map((tag) => {
              const shared = match.sharedTags.includes(tag);
              return (
                <span key={tag} style={{
                  padding: "7px 14px", borderRadius: 99, fontSize: 12, fontWeight: shared ? 700 : 400,
                  border: shared ? "1px solid #cafd0050" : "1px solid #222220",
                  background: shared ? "#cafd0010" : "transparent",
                  color: shared ? "#cafd00" : "#555",
                  letterSpacing: 0.5,
                }}>
                  {tag}
                </span>
              );
            })}
          </div>
          {match.sharedTags.length > 0 && (
            <p style={{ color: "#444", fontSize: 11, margin: "12px 0 0" }}>
              ◈ {match.sharedTags.length} shared signals highlighted
            </p>
          )}
        </div>

        {/* ── Availability ── */}
        <div style={{
          background: "#141412", border: "1px solid #222220",
          borderRadius: 20, padding: "20px", marginBottom: 16,
        }}>
          <p style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 14px" }}>
            AVAILABILITY
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {match.availability.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                style={{
                  padding: "12px 16px", borderRadius: 12, textAlign: "left",
                  border: selectedSlot === slot ? "1px solid #cafd00" : "1px solid #1e1e1c",
                  background: selectedSlot === slot ? "#cafd0010" : "transparent",
                  color: selectedSlot === slot ? "#cafd00" : "#666",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: selectedSlot === slot ? 700 : 400,
                  fontSize: 14, cursor: "pointer",
                  transition: "all 0.18s ease",
                }}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* ── Escrow / Lock Sats panel ── */}
        {lockStep === "idle" && (
          <div style={{
            background: "#141412", border: "1px solid #222220",
            borderRadius: 20, padding: "20px", marginBottom: 16,
          }}>
            <p style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 6px" }}>
              ESCROW LAYER
            </p>
            <p style={{ color: "#777", fontSize: 13, lineHeight: 1.6, margin: "0 0 16px" }}>
              Lock sats to commit to this meeting. Both parties stake — no-shows are penalised automatically via Lightning hold invoices.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["Both attend", "Full refund ✓"],
                ["You attend, they don't", "Their sats → you"],
                ["Neither attends", "Full refund (timeout)"],
              ].map(([s, o]) => (
                <div key={s} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                  <span style={{ color: "#555", fontSize: 13 }}>{s}</span>
                  <span style={{ color: "#888", fontSize: 13, fontWeight: 600 }}>{o}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {lockStep === "choose" && (
          <div style={{
            background: "#141412", border: "1px solid #cafd0030",
            borderRadius: 20, padding: "20px", marginBottom: 16,
          }}>
            <p style={{ color: "#cafd00", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 14px" }}>
              CHOOSE STAKE AMOUNT
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {SAT_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setSelectedSats(amt)}
                  style={{
                    padding: "14px", borderRadius: 14,
                    border: selectedSats === amt ? "1px solid #cafd00" : "1px solid #1e1e1c",
                    background: selectedSats === amt ? "#cafd0012" : "transparent",
                    color: selectedSats === amt ? "#cafd00" : "#666",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 800, fontSize: 16, cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                >
                  {amt.toLocaleString()}
                  <span style={{ display: "block", fontSize: 11, fontWeight: 400, opacity: 0.6, marginTop: 2 }}>
                    sats
                  </span>
                </button>
              ))}
            </div>
            <p style={{ color: "#555", fontSize: 12, margin: "0 0 16px" }}>
              ≈ ${(selectedSats * 0.00043).toFixed(2)} USD at current rate
            </p>
            <button
              onClick={() => setLockStep("confirm")}
              style={{
                width: "100%", padding: "14px", borderRadius: 99,
                background: "#cafd00", border: "none",
                color: "#1a2200", fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800, fontSize: 14, cursor: "pointer",
                letterSpacing: 1.5, boxShadow: "0 0 24px rgba(202,253,0,0.25)",
              }}
            >
              CONTINUE →
            </button>
          </div>
        )}

        {lockStep === "confirm" && (
          <div style={{
            background: "#141412", border: "1px solid #cafd0030",
            borderRadius: 20, padding: "20px", marginBottom: 16,
          }}>
            <p style={{ color: "#cafd00", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 16px" }}>
              CONFIRM LOCK
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {[
                ["Meeting with", match.name],
                ["Time slot", selectedSlot ?? "No slot selected"],
                ["Your stake", `${selectedSats.toLocaleString()} sats`],
                ["Their stake", `${selectedSats.toLocaleString()} sats`],
                ["Escrow type", "Lightning Hold Invoice"],
              ].map(([k, v]) => (
                <div key={k as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#555", fontSize: 13 }}>{k}</span>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setLockStep("locked")}
              style={{
                width: "100%", padding: "16px", borderRadius: 99,
                background: "#cafd00", border: "none",
                color: "#1a2200", fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800, fontSize: 14, cursor: "pointer",
                letterSpacing: 1.5, boxShadow: "0 0 28px rgba(202,253,0,0.3)",
              }}
            >
              ⚡ LOCK {selectedSats.toLocaleString()} SATS
            </button>
          </div>
        )}

        {lockStep === "locked" && (
          <div style={{
            background: "#cafd0010", border: "1px solid #cafd0050",
            borderRadius: 20, padding: "24px", marginBottom: 16,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
            <h3 style={{ color: "#cafd00", fontWeight: 800, fontSize: 20, margin: "0 0 8px" }}>
              Sats Locked
            </h3>
            <p style={{ color: "#cafd0099", fontSize: 14, margin: "0 0 16px", lineHeight: 1.6 }}>
              {selectedSats.toLocaleString()} sats held in escrow. {match.name} will be notified. Both parties must confirm attendance after the meeting.
            </p>
            <div style={{
              background: "#0e0e0e", borderRadius: 12, padding: "12px 16px",
              display: "flex", justifyContent: "space-between",
            }}>
              <span style={{ color: "#555", fontSize: 13 }}>Slot</span>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{selectedSlot ?? "TBD"}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Floating CTA ── */}
      {lockStep !== "locked" && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          padding: "1rem 1.5rem 2rem",
          background: "linear-gradient(to top, #0e0e0e 60%, transparent)",
        }}>
          <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", gap: 10 }}>
            <button
              onClick={() => router.push(`/matches/${match.id}/dm`)}
              style={{
                flex: "0 0 auto", padding: "15px 22px", borderRadius: 99,
                background: "transparent", border: "1px solid #1e1e1c",
                color: "#666", fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: 12, cursor: "pointer",
                letterSpacing: 1, transition: "all 0.18s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#9d7bb860"; e.currentTarget.style.color = "#9d7bb8"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1c"; e.currentTarget.style.color = "#666"; }}
            >
              MESSAGE
            </button>
            <button
              onClick={() => setLockStep(lockStep === "idle" ? "choose" : lockStep === "choose" ? "confirm" : "locked")}
              style={{
                flex: 1, padding: "15px", borderRadius: 99,
                background: isActive ? "#cafd00" : "transparent",
                border: isActive ? "none" : "1px solid #cafd0050",
                color: isActive ? "#1a2200" : "#cafd00",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800, fontSize: 14, cursor: "pointer",
                letterSpacing: 1.5, textTransform: "uppercase",
                boxShadow: isActive ? "0 0 30px rgba(202,253,0,0.3)" : "none",
                transition: "opacity 0.18s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              {match.status === "meet-now"
                ? "Confirm Attendance"
                : match.status === "both-locked"
                ? "Confirm Attendance"
                : lockStep === "idle" ? "Lock Sats ⚡" : "Continue →"}
            </button>
          </div>
        </div>
      )}

      {/* After locked — message still accessible */}
      {lockStep === "locked" && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          padding: "1rem 1.5rem 2rem",
          background: "linear-gradient(to top, #0e0e0e 60%, transparent)",
        }}>
          <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", gap: 10 }}>
            <button
              onClick={() => router.push(`/matches/${match.id}/dm`)}
              style={{
                flex: 1, padding: "15px", borderRadius: 99,
                background: "transparent", border: "1px solid #9d7bb840",
                color: "#9d7bb8", fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: 14, cursor: "pointer",
                letterSpacing: 1, transition: "all 0.18s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#9d7bb810"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >MESSAGE ◈</button>
            <button
              onClick={() => router.push(`/matches/${match.id}/review`)}
              style={{
                flex: 1, padding: "15px", borderRadius: 99,
                background: "transparent", border: "1px solid #cafd0040",
                color: "#cafd00", fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: 14, cursor: "pointer",
                letterSpacing: 1, transition: "all 0.18s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#cafd0010"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >VIEW ESCROW ⚡</button>
          </div>
        </div>
      )}
    </main>
  );
}