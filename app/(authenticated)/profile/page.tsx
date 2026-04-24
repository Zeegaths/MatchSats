"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const SKILL_OPTIONS = [
  "Bitcoin", "Lightning Network", "Nostr", "DeFi", "Smart Contracts",
  "Venture Capital", "Angel Investing", "Product Design", "Full-Stack Dev",
  "AI/ML", "Hardware", "Legal/Compliance", "Marketing", "Operations",
  "Community Building", "Open Source", "Swahili", "Yoruba", "Amharic",
];

const MEETING_HISTORY = [
  { id: 1, name: "Amara O.", role: "Fintech Founder", date: "Today", rating: 5, label: "FULL NODE", sats: 2100, confirmed: true },
  { id: 2, name: "Dev X", role: "Rust Developer", date: "Yesterday", rating: 4, label: "DEEP SYNC", sats: 1500, confirmed: true },
  { id: 3, name: "Priya K.", role: "VC Associate", date: "2 days ago", rating: 3, label: "SYNCED", sats: 2100, confirmed: false },
];

const RATING_COLORS: Record<number, string> = {
  1: "#ff4444", 2: "#ff8c42", 3: "#cafd00", 4: "#9d7bb8", 5: "#cafd00",
};
const RATING_LABELS: Record<number, string> = {
  1: "NOISE", 2: "WEAK SIGNAL", 3: "SYNCED", 4: "DEEP SYNC", 5: "FULL NODE",
};

function CyberpunkStar({ filled, color }: { filled: boolean; color: string }) {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14">
      <polygon
        points="10,1 12,7 19,7 13,11 15,18 10,14 5,18 7,11 1,7 8,7"
        fill={filled ? color : "transparent"}
        stroke={filled ? color : "#2a2a28"}
        strokeWidth="1"
        style={{ filter: filled ? `drop-shadow(0 0 3px ${color}88)` : "none" }}
      />
    </svg>
  );
}

function AvatarUpload({ avatarUrl, onUpload }: { avatarUrl: string | null; onUpload: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [hovering, setHovering] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUpload(url);
  };

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      <div
        onClick={() => fileRef.current?.click()}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        style={{
          width: 88, height: 88, borderRadius: "50%", cursor: "pointer",
          background: avatarUrl
            ? `url(${avatarUrl}) center/cover`
            : "linear-gradient(135deg, #9d7bb820, #cafd0018)",
          border: `2px solid ${hovering ? "#cafd00" : "#9d7bb840"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
          transition: "border-color 0.2s ease",
          boxShadow: hovering ? "0 0 20px rgba(202,253,0,0.2)" : "none",
        }}
      >
        {!avatarUrl && (
          <span style={{ color: "#9d7bb8", fontSize: 28, fontWeight: 900 }}>S</span>
        )}
        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: hovering ? 1 : 0, transition: "opacity 0.2s ease",
          borderRadius: "50%",
        }}>
          <span style={{ color: "#cafd00", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>UPLOAD</span>
        </div>
      </div>
      {/* Online indicator */}
      <div style={{
        position: "absolute", bottom: 4, right: 4,
        width: 14, height: 14, borderRadius: "50%",
        background: "#cafd00", border: "2px solid #0e0e0e",
        boxShadow: "0 0 8px #cafd00",
      }} />
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("Satoshi N.");
  const [handle, setHandle] = useState("@satoshi");
  const [bio, setBio] = useState("Building the identity layer for African Lightning payments. Nostr contributor. Based in Nairobi.");
  const [country, setCountry] = useState("Nairobi, Kenya");
  const [lnAddress, setLnAddress] = useState("satoshi@getalby.com");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["Bitcoin", "Lightning Network", "Nostr", "Full-Stack Dev", "Swahili"]);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "settings">("overview");
  const [settings, setSettings] = useState({
    "Push Notifications": true,
    "Auto-lock Sats": true,
    "Nostr Broadcast": false,
    "Swahili Mode": false,
    "Ghost Mode": false,
  });
  const toggleSetting = (key: string) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));

  const toggleSkill = (s: string) =>
    setSelectedSkills((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const reputation = 98;
  const totalMeetings = 12;
  const satsLocked = 4200;
  const noShows = 0;

  return (
    <main style={{
      minHeight: "100vh", background: "#0e0e0e",
      color: "#fff", fontFamily: "'Space Grotesk', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "#0e0e0eee", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1a1a18",
        padding: "1.25rem 1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button
          onClick={() => router.push("/matches")}
          style={{
            background: "none", border: "1px solid #222220", borderRadius: 99,
            color: "#666", fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: 12, cursor: "pointer",
            padding: "8px 18px", letterSpacing: 1, transition: "all 0.18s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#444"; e.currentTarget.style.color = "#aaa"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#222220"; e.currentTarget.style.color = "#666"; }}
        >
          ← MATCHES
        </button>
        <span style={{ color: "#cafd00", fontWeight: 700, fontSize: 15, letterSpacing: 2 }}>MATCHSATS</span>
        <button
          onClick={() => setEditing(!editing)}
          style={{
            background: editing ? "#cafd00" : "transparent",
            border: editing ? "none" : "1px solid #222220",
            borderRadius: 99, color: editing ? "#1a2200" : "#666",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: 12, cursor: "pointer",
            padding: "8px 18px", letterSpacing: 1, transition: "all 0.18s",
            boxShadow: editing ? "0 0 16px rgba(202,253,0,0.25)" : "none",
          }}
        >
          {editing ? "SAVE" : "EDIT"}
        </button>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem 6rem" }}>

        {/* ── Profile hero ── */}
        <div style={{
          borderRadius: 24, marginBottom: 16,
          background: "linear-gradient(135deg, #141412 50%, #180f22 100%)",
          border: "1px solid #222220", padding: "28px",
          position: "relative", overflow: "hidden",
        }}>
          {/* Purple glow */}
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 240, height: 240, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(157,123,184,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          {/* Green glow */}
          <div style={{
            position: "absolute", bottom: -40, left: -40,
            width: 180, height: 180, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(202,253,0,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", position: "relative" }}>
            <AvatarUpload avatarUrl={avatarUrl} onUpload={setAvatarUrl} />

            <div style={{ flex: 1, minWidth: 0 }}>
              {editing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input value={name} onChange={(e) => setName(e.target.value)}
                    style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                  <input value={handle} onChange={(e) => setHandle(e.target.value)}
                    style={{ ...inputStyle, fontSize: 13, color: "#9d7bb8" }}
                    onFocus={focusStyle} onBlur={blurStyle} />
                  <input value={country} onChange={(e) => setCountry(e.target.value)}
                    style={{ ...inputStyle, fontSize: 12, color: "#555" }}
                    onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              ) : (
                <>
                  <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>{name}</h1>
                  <p style={{ color: "#9d7bb8", fontSize: 14, fontWeight: 600, margin: "0 0 2px" }}>{handle}</p>
                  <p style={{ color: "#444", fontSize: 13, margin: 0 }}>{country}</p>
                </>
              )}
            </div>

            {/* Node status */}
            <div style={{
              flexShrink: 0, textAlign: "center",
              background: "#cafd0010", border: "1px solid #cafd0020",
              borderRadius: 14, padding: "10px 14px",
            }}>
              <p style={{ color: "#cafd00", fontWeight: 900, fontSize: 20, margin: 0 }}>{reputation}%</p>
              <p style={{ color: "#444", fontSize: 9, letterSpacing: 1.5, fontWeight: 700, margin: "2px 0 0" }}>REPUTATION</p>
            </div>
          </div>

          {/* Bio */}
          <div style={{ marginTop: 20, position: "relative" }}>
            {editing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{
                  width: "100%", background: "#0e0e0e",
                  border: "1px solid #2a2a28", borderRadius: 12,
                  color: "#fff", fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 14, padding: "12px 14px", resize: "vertical",
                  minHeight: 80, outline: "none", boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#cafd00")}
                onBlur={(e) => (e.target.style.borderColor = "#2a2a28")}
              />
            ) : (
              <p style={{ color: "#888", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{bio}</p>
            )}
          </div>

          {/* LN address */}
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#cafd00", fontSize: 14 }}>⚡</span>
            {editing ? (
              <input value={lnAddress} onChange={(e) => setLnAddress(e.target.value)}
                style={{ ...inputStyle, flex: 1, fontSize: 13 }}
                onFocus={focusStyle} onBlur={blurStyle} />
            ) : (
              <span style={{ color: "#555", fontSize: 13, fontFamily: "monospace" }}>{lnAddress}</span>
            )}
          </div>
        </div>

        {/* ── Stat row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
          {[
            { label: "MEETINGS", value: totalMeetings, color: "#cafd00" },
            { label: "SATS", value: satsLocked.toLocaleString(), color: "#cafd00" },
            { label: "NO-SHOWS", value: noShows, color: noShows > 0 ? "#ff4444" : "#cafd00" },
            { label: "SIGNALS", value: selectedSkills.length, color: "#9d7bb8" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              borderRadius: 16, border: "1px solid #1e1e1c",
              background: "#111110", padding: "16px 12px",
              display: "flex", flexDirection: "column", gap: 4,
              alignItems: "center", textAlign: "center",
            }}>
              <span style={{ color, fontWeight: 900, fontSize: 22 }}>{value}</span>
              <span style={{ color: "#333", fontSize: 9, letterSpacing: 2, fontWeight: 700 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {(["overview", "history", "settings"] as const).map((t) => {
            const active = activeTab === t;
            const labels = { overview: "Signal Space", history: "Meeting Log", settings: "Node Config" };
            return (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                padding: "9px 20px", borderRadius: 99,
                border: active ? "none" : "1px solid #222220",
                background: active ? "#cafd00" : "transparent",
                color: active ? "#1a2200" : "#555",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
                letterSpacing: 0.5, transition: "all 0.18s",
                boxShadow: active ? "0 0 16px rgba(202,253,0,0.2)" : "none",
              }}>
                {labels[t]}
              </button>
            );
          })}
        </div>

        {/* ── OVERVIEW: Signal Space ── */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Tags */}
            <div style={{
              borderRadius: 20, border: "1px solid #1e1e1c",
              background: "#111110", padding: "20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <p style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: 0 }}>
                  YOUR SIGNAL SPACE
                </p>
                <span style={{ color: "#9d7bb8", fontSize: 11, fontWeight: 700 }}>
                  {selectedSkills.length} active
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SKILL_OPTIONS.map((skill) => {
                  const active = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => editing && toggleSkill(skill)}
                      style={{
                        padding: "8px 16px", borderRadius: 99, fontSize: 12, fontWeight: active ? 700 : 400,
                        border: active ? "1px solid #cafd0050" : "1px solid #1e1e1c",
                        background: active ? "#cafd0010" : "transparent",
                        color: active ? "#cafd00" : "#333",
                        fontFamily: "'Space Grotesk', sans-serif",
                        cursor: editing ? "pointer" : "default",
                        transition: "all 0.18s ease",
                        letterSpacing: 0.5,
                        boxShadow: active ? "0 0 10px rgba(202,253,0,0.1)" : "none",
                      }}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
              {editing && (
                <p style={{ color: "#333", fontSize: 11, margin: "12px 0 0" }}>
                  Tap to toggle signals
                </p>
              )}
            </div>

            {/* Match depth */}
            <div style={{
              borderRadius: 20, border: "1px solid #1e1e1c",
              background: "#111110", padding: "20px",
            }}>
              <p style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 14px" }}>
                MATCH DEPTH
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {["Surface", "Deep", "Strategic"].map((d) => {
                  const active = d === "Deep";
                  return (
                    <div key={d} style={{
                      flex: 1, padding: "12px", borderRadius: 12, textAlign: "center",
                      border: active ? "1px solid #9d7bb860" : "1px solid #1e1e1c",
                      background: active ? "#9d7bb810" : "transparent",
                    }}>
                      <p style={{ color: active ? "#9d7bb8" : "#333", fontWeight: 700, fontSize: 13, margin: 0 }}>{d}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nostr key */}
            <div style={{
              borderRadius: 20, border: "1px solid #1e1e1c",
              background: "#111110", padding: "20px",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: "#9d7bb815", border: "1px solid #9d7bb830",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#9d7bb8", fontSize: 16,
              }}>◈</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 4px" }}>NOSTR IDENTITY</p>
                <p style={{ color: "#555", fontSize: 12, fontFamily: "monospace", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  npub1sat0shi...nakam0to
                </p>
              </div>
              <span style={{
                background: "#9d7bb815", border: "1px solid #9d7bb830",
                color: "#9d7bb8", fontSize: 10, fontWeight: 700,
                padding: "4px 10px", borderRadius: 99, letterSpacing: 1, flexShrink: 0,
              }}>VERIFIED</span>
            </div>
          </div>
        )}

        {/* ── HISTORY: Meeting Log ── */}
        {activeTab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ color: "#333", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 4px" }}>
              RECENT CONNECTIONS
            </p>
            {MEETING_HISTORY.map((m) => {
              const rColor = RATING_COLORS[m.rating];
              return (
                <div
                  key={m.id}
                  onClick={() => router.push(`/matches/${m.id}/review`)}
                  style={{
                    borderRadius: 18, border: "1px solid #1e1e1c",
                    background: "#111110", padding: "18px 20px",
                    cursor: "pointer", transition: "all 0.18s ease",
                    display: "flex", alignItems: "center", gap: 14,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2a2a28"; e.currentTarget.style.background = "#141412"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1e1e1c"; e.currentTarget.style.background = "#111110"; }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                    background: `${rColor}15`,
                    border: `1px solid ${rColor}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: rColor, fontWeight: 900, fontSize: 16,
                  }}>
                    {m.name[0]}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{m.name}</span>
                      <span style={{
                        background: `${rColor}15`, border: `1px solid ${rColor}30`,
                        color: rColor, fontSize: 9, fontWeight: 700,
                        padding: "2px 8px", borderRadius: 99, letterSpacing: 1,
                      }}>
                        {m.label}
                      </span>
                    </div>
                    <p style={{ color: "#555", fontSize: 12, margin: "0 0 6px" }}>
                      {m.role} · {m.date}
                    </p>
                    {/* Stars */}
                    <div style={{ display: "flex", gap: 3 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <CyberpunkStar key={n} filled={n <= m.rating} color={rColor} />
                      ))}
                    </div>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                    <p style={{ color: "#cafd00", fontWeight: 700, fontSize: 13, margin: 0 }}>
                      ⚡ {m.sats.toLocaleString()}
                    </p>
                    <p style={{ fontSize: 10, fontWeight: 700, margin: 0, letterSpacing: 1, color: m.confirmed ? "#cafd00" : "#555" }}>
                      {m.confirmed ? "CONFIRMED" : "PENDING"}
                    </p>
                    <button
                      onClick={e => { e.stopPropagation(); router.push(`/matches/${m.id}/dm`); }}
                      style={{
                        padding: "5px 12px", borderRadius: 99, fontSize: 10,
                        border: "1px solid #9d7bb840", background: "transparent",
                        color: "#9d7bb8", fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 700, cursor: "pointer", letterSpacing: 1,
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#9d7bb815"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >MSG ◈</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── SETTINGS: Node Config ── */}
        {activeTab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Push Notifications", sub: "Match alerts and meeting reminders" },
              { label: "Auto-lock Sats", sub: "Require escrow for all meetings" },
              { label: "Nostr Broadcast", sub: "Publish ratings to public relay" },
              { label: "Swahili Mode", sub: "AI summaries default to Kiswahili" },
              { label: "Ghost Mode", sub: "Hide profile from network browse" },
            ].map(({ label, sub }) => {
              const on = settings[label as keyof typeof settings];
              return (
                <div key={label} style={{
                  borderRadius: 16, border: "1px solid #1e1e1c",
                  background: "#111110", padding: "16px 20px",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#ccc", fontSize: 14, fontWeight: 600, margin: 0 }}>{label}</p>
                    <p style={{ color: "#444", fontSize: 12, margin: "2px 0 0" }}>{sub}</p>
                  </div>
                  <button
                    onClick={() => toggleSetting(label)}
                    style={{
                      width: 44, height: 24, borderRadius: 99, border: "none",
                      background: on ? "#cafd00" : "#1e1e1c",
                      cursor: "pointer", position: "relative",
                      transition: "background 0.2s ease",
                      flexShrink: 0,
                      boxShadow: on ? "0 0 12px rgba(202,253,0,0.3)" : "none",
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: on ? "#1a2200" : "#444",
                      position: "absolute", top: 3,
                      left: on ? 23 : 3,
                      transition: "left 0.2s ease",
                    }} />
                  </button>
                </div>
              );
            })}

            {/* Danger zone */}
            <div style={{ marginTop: 8 }}>
              <p style={{ color: "#333", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 10px" }}>
                DANGER ZONE
              </p>
              <button style={{
                width: "100%", padding: "14px", borderRadius: 14,
                background: "transparent", border: "1px solid #ff444430",
                color: "#ff4444", fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
                letterSpacing: 1, transition: "all 0.18s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#ff444410"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                DISCONNECT NODE
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  background: "#0e0e0e", border: "1px solid #2a2a28",
  borderRadius: 10, color: "#fff",
  fontFamily: "'Space Grotesk', sans-serif",
  fontSize: 18, fontWeight: 900,
  padding: "8px 12px", outline: "none",
  width: "100%", boxSizing: "border-box",
  transition: "border-color 0.18s ease",
};

const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor = "#cafd00";
};
const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor = "#2a2a28";
};