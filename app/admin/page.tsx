"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────
interface Stats {
  summary: {
    totalUsers: number;
    realUsers: number;
    totalProfiles: number;
    totalMatches: number;
    lockedMatches: number;
    confirmedMeetings: number;
    totalSatsLocked: number;
    totalReviews: number;
  };
  byEventCode: { invite_code: string; count: number }[];
  recentSignups: {
    pubkey: string;
    created_at: number;
    name: string | null;
    role: string | null;
    location: string | null;
    invite_code: string | null;
    core_vibe: string | null;
    building: string | null;
    needs: string | null;
  }[];
  recentMatches: {
    id: number;
    score: number;
    status: string;
    created_at: number;
    name_a: string | null;
    role_a: string | null;
    name_b: string | null;
    role_b: string | null;
  }[];
  escrow: { total: number; held: number };
}

const STATUS_COLOR: Record<string, string> = {
  new: "#555",
  locked_a: "#cafd0080",
  locked_b: "#cafd0080",
  both_locked: "#cafd00",
  confirmed: "#9d7bb8",
  disputed: "#ff6666",
};

function timeAgo(ms: number) {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function StatCard({ label, value, sub, color = "#cafd00" }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div style={{
      borderRadius: 16, border: "1px solid #1e1e1c", background: "#111110",
      padding: "18px 20px", display: "flex", flexDirection: "column", gap: 4,
    }}>
      <span style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>{label}</span>
      <span style={{ color, fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ color: "#444", fontSize: 11 }}>{sub}</span>}
    </div>
  );
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [input, setInput] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [tab, setTab] = useState<"signups" | "matches" | "escrow">("signups");

  const fetchStats = useCallback(async (s: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/stats?secret=${encodeURIComponent(s)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      setStats(data);
      setLastRefresh(new Date());
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 30 seconds once unlocked
  useEffect(() => {
    if (!secret) return;
    const id = setInterval(() => fetchStats(secret), 30000);
    return () => clearInterval(id);
  }, [secret, fetchStats]);

  if (!secret) {
    return (
      <main style={{
        minHeight: "100vh", background: "#0a0a0a", color: "#fff",
        fontFamily: "'Space Grotesk', sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ width: "100%", maxWidth: 380, padding: "0 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span style={{ fontSize: 32, fontWeight: 900 }}>
              <span style={{ color: "#cafd00" }}>1</span><span style={{ color: "#9d7bb8" }}>%</span>
            </span>
            <p style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 3, marginTop: 8 }}>ADMIN DASHBOARD</p>
          </div>
          <div style={{
            background: "#111110", border: "1px solid #1e1e1c",
            borderRadius: 20, padding: 24,
          }}>
            <p style={{ color: "#777", fontSize: 14, margin: "0 0 16px" }}>Enter your admin secret to continue.</p>
            <input
              type="password"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && input) { setSecret(input); fetchStats(input); } }}
              placeholder="admin secret"
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 10,
                background: "#0a0a0a", border: "1px solid #2a2a28",
                color: "#fff", fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 15, outline: "none", boxSizing: "border-box",
                marginBottom: 12,
              }}
            />
            {error && <p style={{ color: "#ff6666", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}
            <button
              onClick={() => { setSecret(input); fetchStats(input); }}
              disabled={!input}
              style={{
                width: "100%", padding: 13, borderRadius: 99,
                background: input ? "#cafd00" : "#1a1a18",
                border: "none", color: input ? "#1a2200" : "#333",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800, fontSize: 14, cursor: input ? "pointer" : "default",
              }}
            >
              {loading ? "Loading..." : "Unlock →"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (loading && !stats) {
    return (
      <main style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#cafd00", fontFamily: "'Space Grotesk', sans-serif", fontSize: 14 }}>Loading...</div>
      </main>
    );
  }

  if (!stats) return null;

  const { summary, byEventCode, recentSignups, recentMatches, escrow } = stats;

  return (
    <main style={{
      minHeight: "100vh", background: "#0a0a0a", color: "#fff",
      fontFamily: "'Space Grotesk', sans-serif", paddingBottom: 60,
    }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(10,10,10,0.95)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid #111110",
        padding: "14px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 900 }}>
            <span style={{ color: "#cafd00" }}>1</span><span style={{ color: "#9d7bb8" }}>%</span>
          </span>
          <span style={{ color: "#333", fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>ADMIN</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {lastRefresh && (
            <span style={{ color: "#333", fontSize: 11 }}>
              updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => fetchStats(secret)}
            style={{
              padding: "6px 14px", borderRadius: 99,
              background: "transparent", border: "1px solid #1e1e1c",
              color: "#555", fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: 11, cursor: "pointer", letterSpacing: 1,
            }}
          >↻ REFRESH</button>
          <button
            onClick={() => { setSecret(""); setStats(null); setInput(""); }}
            style={{
              padding: "6px 14px", borderRadius: 99,
              background: "transparent", border: "1px solid #1e1e1c",
              color: "#444", fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: 11, cursor: "pointer",
            }}
          >LOCK</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 24 }}>
          <StatCard label="REAL SIGNUPS" value={summary.realUsers} sub="excluding seed profiles" />
          <StatCard label="PROFILES FILLED" value={summary.totalProfiles} sub="incl. seed profiles" />
          <StatCard label="AI MATCHES MADE" value={summary.totalMatches} color="#9d7bb8" />
          <StatCard label="SATS LOCKED" value={summary.totalSatsLocked > 0 ? `${summary.totalSatsLocked.toLocaleString()} ⚡` : "0"} color="#cafd00" />
          <StatCard label="MEETINGS LOCKED" value={summary.lockedMatches} sub="both paid escrow" color="#cafd00" />
          <StatCard label="MEETINGS CONFIRMED" value={summary.confirmedMeetings} color="#9d7bb8" />
          <StatCard label="REVIEWS RECORDED" value={summary.totalReviews} color="#9d7bb8" />
        </div>

        {/* Event code breakdown */}
        {byEventCode.length > 0 && (
          <div style={{
            borderRadius: 16, border: "1px solid #1e1e1c", background: "#111110",
            padding: "18px 20px", marginBottom: 16,
          }}>
            <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 14px" }}>ATTENDEES BY EVENT CODE</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {byEventCode.map(ev => (
                <div key={ev.invite_code} style={{
                  padding: "8px 16px", borderRadius: 99,
                  background: ev.invite_code === "BNC2026" ? "#cafd0015" : "#1a1a18",
                  border: `1px solid ${ev.invite_code === "BNC2026" ? "#cafd0040" : "#2a2a28"}`,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ color: "#cafd00", fontWeight: 800, fontSize: 14 }}>{ev.count}</span>
                  <span style={{ color: "#777", fontSize: 12, fontWeight: 600 }}>{ev.invite_code}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {(["signups", "matches", "escrow"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "8px 18px", borderRadius: 99,
              background: tab === t ? "#cafd00" : "transparent",
              border: tab === t ? "none" : "1px solid #1e1e1c",
              color: tab === t ? "#1a2200" : "#555",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: 12, cursor: "pointer",
              letterSpacing: 1, textTransform: "uppercase",
            }}>{t}</button>
          ))}
        </div>

        {/* SIGNUPS TAB */}
        {tab === "signups" && (
          <div style={{ borderRadius: 16, border: "1px solid #1e1e1c", background: "#111110", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #1e1e1c", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: 0 }}>RECENT SIGNUPS</p>
              <span style={{ color: "#333", fontSize: 11 }}>{recentSignups.length} shown</span>
            </div>
            {recentSignups.length === 0 ? (
              <p style={{ color: "#444", fontSize: 14, padding: "24px 20px", margin: 0 }}>No real signups yet — waiting for attendees.</p>
            ) : (
              recentSignups.map((u, i) => (
                <div key={u.pubkey} style={{
                  padding: "14px 20px",
                  borderBottom: i < recentSignups.length - 1 ? "1px solid #0e0e0c" : "none",
                  display: "flex", gap: 14, alignItems: "flex-start",
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: "#cafd0015", border: "1px solid #cafd0030",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#cafd00", fontWeight: 800, fontSize: 14,
                  }}>
                    {(u.name ?? u.pubkey)[0].toUpperCase()}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                        {u.name ?? <span style={{ color: "#444" }}>No name yet</span>}
                      </span>
                      {u.role && (
                        <span style={{ color: "#9d7bb8", fontSize: 11, fontWeight: 600 }}>{u.role}</span>
                      )}
                      {u.invite_code && (
                        <span style={{
                          background: "#cafd0010", border: "1px solid #cafd0030",
                          color: "#cafd00", fontSize: 10, fontWeight: 700,
                          padding: "2px 8px", borderRadius: 99, letterSpacing: 1,
                        }}>{u.invite_code}</span>
                      )}
                    </div>
                    {u.location && <p style={{ color: "#555", fontSize: 12, margin: 0 }}>{u.location}</p>}
                    {u.building && (
                      <p style={{ color: "#444", fontSize: 12, margin: "4px 0 0", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 500 }}>
                        ⚡ {u.building}
                      </p>
                    )}
                  </div>
                  {/* Time */}
                  <span style={{ color: "#333", fontSize: 11, flexShrink: 0, marginTop: 2 }}>
                    {timeAgo(u.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* MATCHES TAB */}
        {tab === "matches" && (
          <div style={{ borderRadius: 16, border: "1px solid #1e1e1c", background: "#111110", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #1e1e1c" }}>
              <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: 0 }}>RECENT AI MATCHES</p>
            </div>
            {recentMatches.length === 0 ? (
              <p style={{ color: "#444", fontSize: 14, padding: "24px 20px", margin: 0 }}>No matches yet.</p>
            ) : (
              recentMatches.map((m, i) => (
                <div key={m.id} style={{
                  padding: "14px 20px",
                  borderBottom: i < recentMatches.length - 1 ? "1px solid #0e0e0c" : "none",
                  display: "flex", gap: 14, alignItems: "center",
                }}>
                  {/* Score */}
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                    background: "#1a1a18", border: "1px solid #2a2a28",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: m.score >= 85 ? "#cafd00" : "#9d7bb8",
                    fontWeight: 900, fontSize: 15,
                  }}>{m.score}</div>
                  {/* Names */}
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>
                      {m.name_a ?? "Unknown"} <span style={{ color: "#333" }}>↔</span> {m.name_b ?? "Unknown"}
                    </p>
                    <p style={{ color: "#555", fontSize: 12, margin: "2px 0 0" }}>
                      {m.role_a ?? "?"} · {m.role_b ?? "?"}
                    </p>
                  </div>
                  {/* Status */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span style={{
                      color: STATUS_COLOR[m.status] ?? "#555",
                      fontSize: 10, fontWeight: 700, letterSpacing: 1,
                    }}>{m.status.replace(/_/g, " ").toUpperCase()}</span>
                    <span style={{ color: "#333", fontSize: 11 }}>{timeAgo(m.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ESCROW TAB */}
        {tab === "escrow" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <StatCard label="INVOICES CREATED" value={escrow.total} />
              <StatCard label="INVOICES PAID (HELD)" value={escrow.held} color="#cafd00" />
            </div>
            <div style={{
              borderRadius: 16, border: "1px solid #cafd0020", background: "#cafd0006",
              padding: "20px 24px",
            }}>
              <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 8px" }}>TOTAL SATS IN ESCROW</p>
              <p style={{ color: "#cafd00", fontSize: 36, fontWeight: 900, margin: 0 }}>
                {summary.totalSatsLocked.toLocaleString()} <span style={{ fontSize: 18 }}>sats</span>
              </p>
              <p style={{ color: "#444", fontSize: 12, margin: "6px 0 0" }}>
                across {escrow.held} paid invoices · {summary.confirmedMeetings} meetings confirmed
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
