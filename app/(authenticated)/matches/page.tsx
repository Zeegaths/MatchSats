"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const FILTERS = ["All Matches", "Nearby", "Investors", "Builders", "Founders"];

const MATCHES = [
  {
    id: 1, initials: "A", name: "Amara O.",
    role: "Fintech Founder", location: "Lagos, Nigeria",
    sats: 2100, status: "meet-now",
    tags: ["Lightning", "M-Pesa", "Fintech"],
    rationale: "She's fundraising a fintech product. You have 3 years of M-Pesa integration experience. Perfect alignment on payment infra.",
    matchScore: 94, timer: "23:42",
  },
  {
    id: 2, initials: "D", name: "Dev X",
    role: "Rust Developer", location: "Nairobi, Kenya",
    sats: 1500, status: "both-locked",
    tags: ["Rust", "Bitcoin", "Open Source"],
    rationale: "Building cross-chain bridges. Your Lightning experience could accelerate their mainnet launch significantly.",
    matchScore: 88, timer: "58:12",
  },
  {
    id: 3, initials: "P", name: "Priya K.",
    role: "VC Associate", location: "Mumbai, India",
    sats: null, status: "new",
    tags: ["Venture Capital", "DeFi", "Africa"],
    rationale: "Active in African crypto deals. She funds exactly the stage you're at — warm intro potential.",
    matchScore: 81, timer: null,
  },
  {
    id: 4, initials: "K", name: "Kwame A.",
    role: "Protocol Engineer", location: "Accra, Ghana",
    sats: null, status: "new",
    tags: ["Nostr", "Bitcoin", "Full-Stack"],
    rationale: "Working on Nostr relay infrastructure. Your identity layer work is directly complementary to his stack.",
    matchScore: 76, timer: null,
  },
];

const STATUS_CONFIG = {
  "meet-now":    { label: "MEET NOW",    color: "#cafd00", dot: "#cafd00", bg: "#cafd0008", border: "#cafd0040" },
  "both-locked": { label: "BOTH LOCKED", color: "#9d7bb8", dot: "#9d7bb8", bg: "#9d7bb808", border: "#9d7bb840" },
  "new":         { label: "NEW MATCH",   color: "#555",    dot: "#333",    bg: "transparent", border: "#222220" },
};

function useCountdown(initial: string | null) {
  const [time, setTime] = useState(initial);
  useEffect(() => {
    if (!initial) return;
    const [m, s] = initial.split(":").map(Number);
    let total = m * 60 + s;
    const id = setInterval(() => {
      total--;
      if (total < 0) { clearInterval(id); return; }
      setTime(`${String(Math.floor(total/60)).padStart(2,"0")}:${String(total%60).padStart(2,"0")}`);
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function ActiveMeetingRow({ match }: { match: typeof MATCHES[0] }) {
  const router = useRouter();
  const timer = useCountdown(match.timer);
  const cfg = STATUS_CONFIG[match.status as keyof typeof STATUS_CONFIG];
  const isMeetNow = match.status === "meet-now";
  const isLocked = match.status === "both-locked";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 14px", borderRadius: 14,
      border: `1px solid ${cfg.border}`,
      background: cfg.bg, transition: "all 0.2s ease",
    }}>
      {/* Status dot only (label removed on mobile) */}
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, flexShrink: 0,
        boxShadow: isMeetNow ? "0 0 8px #cafd00" : isLocked ? "0 0 8px #9d7bb8" : "none" }} />

      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        background: isMeetNow ? "#cafd0020" : "#9d7bb820",
        border: `1px solid ${isMeetNow ? "#cafd0040" : "#9d7bb840"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: isMeetNow ? "#cafd00" : "#9d7bb8", fontWeight: 800, fontSize: 12,
      }}>{match.initials}</div>

      {/* Name + status label */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{match.name}</p>
        <p style={{ color: cfg.color, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, margin: 0 }}>{cfg.label}</p>
      </div>

      {/* Timer */}
      {timer && (
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ color: cfg.color, fontWeight: 700, fontSize: 13, fontVariantNumeric: "tabular-nums", margin: 0 }}>{timer}</p>
          <p style={{ color: "#666", fontSize: 8, letterSpacing: 1, margin: 0, fontWeight: 700 }}>LEFT</p>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => router.push(`/matches/${match.id}/review`)}
        style={{
          padding: "8px 14px", borderRadius: 99, flexShrink: 0,
          background: isMeetNow ? "#cafd00" : "transparent",
          border: isMeetNow ? "none" : `1px solid #9d7bb860`,
          color: isMeetNow ? "#1a2200" : "#9d7bb8",
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 800, fontSize: 11, cursor: "pointer",
          letterSpacing: 1, textTransform: "uppercase",
          boxShadow: isMeetNow ? "0 0 14px rgba(202,253,0,0.3)" : "none",
          transition: "opacity 0.18s", whiteSpace: "nowrap",
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        {isMeetNow ? "Confirm" : "Review"}
      </button>
    </div>
  );
}

function MatchCard({ match, focused }: { match: typeof MATCHES[0]; focused: boolean }) {
  const router = useRouter();
  const isActive = match.status !== "new";
  const isLocked = match.status === "both-locked";
  const scoreColor = match.matchScore >= 90 ? "#cafd00" : match.matchScore >= 80 ? "#9d7bb8" : "#555";

  return (
    <div style={{
      borderRadius: 20, border: focused ? "1px solid #cafd0050" : "1px solid #1a1a18",
      background: "#111110", overflow: "hidden",
      boxShadow: focused ? "0 0 0 3px rgba(202,253,0,0.06)" : "none",
      transition: "all 0.18s ease",
    }}
      onMouseEnter={e => { if (!focused) e.currentTarget.style.borderColor = "#222220"; }}
      onMouseLeave={e => { if (!focused) e.currentTarget.style.borderColor = "#1a1a18"; }}
    >
      {/* Top stripe for active */}
      {isActive && (
        <div style={{ height: 2, background: isLocked ? "linear-gradient(90deg, #9d7bb8, #9d7bb840)" : "linear-gradient(90deg, #cafd00, #cafd0040)" }} />
      )}

      <div style={{ padding: "18px 18px 14px", display: "flex", gap: 14, alignItems: "flex-start" }}>
        {/* Avatar */}
        <div style={{
          width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
          background: isLocked ? "#9d7bb820" : "#cafd0015",
          border: `1.5px solid ${isLocked ? "#9d7bb840" : "#cafd0030"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: isLocked ? "#9d7bb8" : "#cafd00", fontWeight: 800, fontSize: 17,
        }}>{match.initials}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{match.name}</span>
            {match.sats && (
              <span style={{
                background: "#cafd0012", border: "1px solid #cafd0030",
                color: "#cafd00", fontSize: 10, fontWeight: 700,
                padding: "2px 9px", borderRadius: 99, letterSpacing: 1,
              }}>⚡ {match.sats.toLocaleString()}</span>
            )}
            {isLocked && (
              <span style={{
                background: "#9d7bb815", border: "1px solid #9d7bb840",
                color: "#9d7bb8", fontSize: 9, fontWeight: 700,
                padding: "2px 9px", borderRadius: 99, letterSpacing: 1,
              }}>LOCKED</span>
            )}
          </div>
          <p style={{ color: "#888", fontSize: 12, margin: 0 }}>{match.role} · {match.location}</p>
        </div>

        {/* Score */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ color: scoreColor, fontWeight: 900, fontSize: 24, lineHeight: 1, textShadow: match.matchScore >= 90 ? "0 0 12px rgba(202,253,0,0.4)" : match.matchScore >= 80 ? "0 0 12px rgba(157,123,184,0.4)" : "none" }}>
            {match.matchScore}
          </div>
          <div style={{ color: "#666", fontSize: 9, letterSpacing: 1, fontWeight: 700 }}>MATCH</div>
        </div>
      </div>

      {/* Tags */}
      <div style={{ padding: "0 18px 14px", display: "flex", gap: 7, flexWrap: "wrap" }}>
        {match.tags.map(tag => (
          <span key={tag} style={{
            background: "transparent", border: "1px solid #1e1e1c",
            color: "#888", fontSize: 11, fontWeight: 500,
            padding: "4px 11px", borderRadius: 99,
          }}>{tag}</span>
        ))}
      </div>

      {/* AI Rationale */}
      <div style={{ padding: "12px 18px", borderTop: "1px solid #161614" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: isLocked ? "#9d7bb8" : "#cafd00" }} />
          <p style={{ color: "#666", fontSize: 9, fontWeight: 700, letterSpacing: 2, margin: 0 }}>AI RATIONALE</p>
        </div>
        <p style={{ color: "#777", fontSize: 13, margin: 0, lineHeight: 1.65 }}>{match.rationale}</p>
      </div>

      {/* Actions */}
      <div style={{ padding: "12px 18px", display: "flex", gap: 8, borderTop: "1px solid #161614" }}>
        <button
          onClick={() => router.push(`/matches/${match.id}`)}
          style={{
            flex: "0 0 auto", padding: "10px 20px", borderRadius: 99,
            background: "transparent", border: "1px solid #1e1e1c",
            color: "#555", fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: 11, cursor: "pointer",
            letterSpacing: 1, textTransform: "uppercase", transition: "all 0.18s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#aaa"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1c"; e.currentTarget.style.color = "#555"; }}
        >View Profile</button>

        <button
          onClick={() => router.push(isActive ? `/matches/${match.id}/review` : `/matches/${match.id}`)}
          style={{
            flex: 1, padding: "10px", borderRadius: 99,
            background: isActive ? (isLocked ? "#9d7bb8" : "#cafd00") : "transparent",
            border: isActive ? "none" : "1px solid #cafd0040",
            color: isActive ? (isLocked ? "#fff" : "#1a2200") : "#cafd00",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800, fontSize: 11, cursor: "pointer",
            letterSpacing: 1.5, textTransform: "uppercase",
            boxShadow: isActive ? (isLocked ? "0 0 20px rgba(157,123,184,0.25)" : "0 0 20px rgba(202,253,0,0.2)") : "none",
            transition: "opacity 0.18s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          {match.status === "meet-now" ? "✓ Confirm Meeting" : match.status === "both-locked" ? "Review Session" : "Lock Sats ⚡"}
        </button>
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All Matches");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showHotkeys, setShowHotkeys] = useState(false);
  const [livePulse, setLivePulse] = useState(true);
  const activeMeetings = MATCHES.filter(m => m.status !== "new");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (["INPUT","TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;
      switch (e.key) {
        case "j": case "ArrowDown": e.preventDefault(); setFocusedIndex(i => Math.min(i+1, MATCHES.length-1)); break;
        case "k": case "ArrowUp":  e.preventDefault(); setFocusedIndex(i => Math.max(i-1, 0)); break;
        case "Enter": if (focusedIndex >= 0) router.push(`/matches/${MATCHES[focusedIndex].id}`); break;
        case "c": if (focusedIndex >= 0 && MATCHES[focusedIndex].status !== "new") router.push(`/matches/${MATCHES[focusedIndex].id}/review`); break;
        case "?": setShowHotkeys(h => !h); break;
        case "Escape": setShowHotkeys(false); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [focusedIndex]);

  useEffect(() => {
    const id = setInterval(() => setLivePulse(p => !p), 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* Hotkey modal */}
      {showHotkeys && (
        <div onClick={() => setShowHotkeys(false)} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#111110", border: "1px solid #222", borderRadius: 20, padding: "28px 32px", minWidth: 300, fontFamily: "monospace" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#9d7bb8" }} />
              <p style={{ color: "#9d7bb8", fontSize: 11, fontWeight: 700, letterSpacing: 2, margin: 0 }}>KEYBOARD SHORTCUTS</p>
            </div>
            {[["j / ↓","next match"],["k / ↑","previous match"],["enter","open profile"],["c","confirm meeting"],["?","toggle shortcuts"],["esc","close"]].map(([key, desc]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <kbd style={{ background: "#1a1a18", border: "1px solid #2a2a28", borderRadius: 6, padding: "3px 10px", color: "#cafd00", fontSize: 12 }}>{key}</kbd>
                <span style={{ color: "#aaa", fontSize: 13 }}>{desc}</span>
              </div>
            ))}
            <p style={{ color: "#555", fontSize: 11, margin: "16px 0 0", textAlign: "center" }}>click anywhere to close</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ borderBottom: "1px solid #111110", padding: "0.9rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(10,10,10,0.92)", backdropFilter: "blur(14px)", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#cafd00", fontWeight: 700, fontSize: 13, letterSpacing: 2 }}>MATCHSATS</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#cafd0010", border: "1px solid #cafd0018", borderRadius: 99, padding: "2px 8px" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#cafd00", opacity: livePulse ? 1 : 0.2, transition: "opacity 0.4s", boxShadow: livePulse ? "0 0 5px #cafd00" : "none" }} />
            <span style={{ color: "#cafd00", fontSize: 8, fontWeight: 700, letterSpacing: 1.5 }}>LIVE</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => setShowHotkeys(true)} style={{ background: "none", border: "1px solid #1a1a18", borderRadius: 7, color: "#666", fontFamily: "monospace", fontSize: 12, padding: "3px 9px", cursor: "pointer", transition: "all 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#9d7bb860"; e.currentTarget.style.color = "#9d7bb8"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a18"; e.currentTarget.style.color = "#666"; }}
          >?</button>
          <div onClick={() => router.push("/profile")} style={{ width: 30, height: 30, borderRadius: "50%", background: "#9d7bb820", border: "1px solid #9d7bb840", display: "flex", alignItems: "center", justifyContent: "center", color: "#9d7bb8", fontWeight: 800, fontSize: 12, cursor: "pointer", transition: "all 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#9d7bb830"; e.currentTarget.style.boxShadow = "0 0 10px rgba(157,123,184,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#9d7bb820"; e.currentTarget.style.boxShadow = "none"; }}
          >S</div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "1.5rem 1rem 6rem", boxSizing: "border-box" }}>

        {/* Hero */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "clamp(26px,8vw,48px)", fontWeight: 900, lineHeight: 1.05, margin: "0 0 2px" }}>Ready to</h1>
          <h1 style={{ fontSize: "clamp(26px,8vw,48px)", fontWeight: 900, lineHeight: 1.05, color: "#cafd00", margin: "0 0 8px" }}>Sync.</h1>
          <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>Lock sats. Show up. Build together.</p>
        </div>

        {/* Stat pills — 2x2 grid on mobile */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "1.5rem" }}>
          {[
            { label: "Meetups", value: "7", color: "#cafd00" },
            { label: "Zaps sent", value: "21 ⚡", color: "#cafd00" },
            { label: "Reputation", value: "98%", color: "#9d7bb8" },
            { label: "Sats locked", value: "4,200", color: "#cafd00" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ padding: "10px 14px", borderRadius: 14, border: "1px solid #1a1a18", background: "#111110", display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ color: "#666", fontSize: 10, fontWeight: 600, letterSpacing: 0.5 }}>{label}</span>
              <span style={{ color, fontSize: 15, fontWeight: 800 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Active meetings */}
        {activeMeetings.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 2, margin: 0 }}>ACTIVE MEETINGS</h2>
              </div>
              <span style={{ background: "#cafd0012", border: "1px solid #cafd0030", color: "#cafd00", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, letterSpacing: 1 }}>
                {activeMeetings.length} ACTIVE
              </span>
            </div>
            {/* Hint */}
            <p style={{ color: "#888", fontSize: 11, margin: "0 0 10px" }}>⚡ Sats locked — confirm attendance after you meet to release escrow</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activeMeetings.map(m => <ActiveMeetingRow key={m.id} match={m} />)}
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 0 20px" }}>
          <div style={{ flex: 1, height: 1, background: "#111110" }} />
          <span style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>YOUR MATCHES</span>
          <div style={{ flex: 1, height: 1, background: "#111110" }} />
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: "1.25rem" }}>
          {FILTERS.map(f => {
            const active = activeFilter === f;
            return (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: "8px 18px", borderRadius: 99,
                border: active ? "none" : "1px solid #1a1a18",
                background: active ? "#cafd00" : "transparent",
                color: active ? "#1a2200" : "#888",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: 12, cursor: "pointer",
                transition: "all 0.18s",
                boxShadow: active ? "0 0 18px rgba(202,253,0,0.2)" : "none",
              }}>
                {f}
              </button>
            );
          })}
        </div>

        {/* Match cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {MATCHES.map((m, i) => (
            <MatchCard key={m.id} match={m} focused={focusedIndex === i} />
          ))}
        </div>

        {/* Keyboard hint */}
        <p style={{ color: "#444", fontSize: 11, textAlign: "center", marginTop: 24, fontFamily: "monospace" }}>
          press <span style={{ color: "#666" }}>?</span> for keyboard shortcuts
        </p>
      </div>
    </main>
  );
}