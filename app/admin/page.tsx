"use client";

import { useState, useEffect, useCallback } from "react";

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
  seedProfiles: {
    pubkey: string;
    name: string | null;
    role: string | null;
    location: string | null;
    invite_code: string | null;
    building: string | null;
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
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function Avatar({ name, color = "#cafd00", bg = "#cafd0015", border = "#cafd0030" }: {
  name: string; color?: string; bg?: string; border?: string;
}) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
      background: bg, border: `1px solid ${border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color, fontWeight: 800, fontSize: 14,
    }}>
      {name[0].toUpperCase()}
    </div>
  );
}

function StatCard({ label, value, sub, color = "#cafd00" }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div style={{
      borderRadius: 14, border: "1px solid #1e1e1c", background: "#111110",
      padding: "14px 16px", display: "flex", flexDirection: "column", gap: 3,
    }}>
      <span style={{ color: "#555", fontSize: 9, fontWeight: 700, letterSpacing: 1.5 }}>{label}</span>
      <span style={{ color, fontSize: 26, fontWeight: 900, lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ color: "#333", fontSize: 10 }}>{sub}</span>}
    </div>
  );
}

export default function AdminPage() {
  const [secret, setSecret]       = useState("");
  const [input, setInput]         = useState("");
  const [stats, setStats]         = useState<Stats | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [tab, setTab]             = useState<"signups" | "matches" | "escrow" | "seed">("signups");
  const [seeding, setSeeding]     = useState(false);
  const [seedMsg, setSeedMsg]     = useState("");

  const fetchStats = useCallback(async (s: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/stats?secret=${encodeURIComponent(s)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      setStats(data);
      setLastRefresh(new Date());
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!secret) return;
    const id = setInterval(() => fetchStats(secret), 30000);
    return () => clearInterval(id);
  }, [secret, fetchStats]);

  const reSeed = async () => {
    setSeeding(true); setSeedMsg("");
    try {
      const res = await fetch(`/api/admin/seed?secret=${encodeURIComponent(secret)}`);
      const data = await res.json();
      if (data.success) { setSeedMsg(`✓ Seeded ${data.seeded} profiles under ${data.event_code}`); fetchStats(secret); }
      else setSeedMsg(`Error: ${data.error}`);
    } catch { setSeedMsg("Network error"); }
    finally { setSeeding(false); }
  };

  // ── Lock screen ───────────────────────────────────────────────────
  if (!secret) {
    return (
      <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <style>{`input::placeholder{color:#555} input:focus{outline:none}`}</style>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <span style={{ fontSize: 36, fontWeight: 900 }}>
              <span style={{ color: "#cafd00" }}>1</span><span style={{ color: "#9d7bb8" }}>%</span>
            </span>
            <p style={{ color: "#444", fontSize: 11, fontWeight: 700, letterSpacing: 3, margin: "6px 0 0" }}>ADMIN</p>
          </div>
          <div style={{ background: "#111110", border: "1px solid #1e1e1c", borderRadius: 20, padding: "24px 20px" }}>
            <input
              type="password"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && input) { setSecret(input); fetchStats(input); } }}
              placeholder="enter admin secret"
              autoFocus
              style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "#0a0a0a", border: "1px solid #2a2a28", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, boxSizing: "border-box", marginBottom: 12 }}
            />
            {error && <p style={{ color: "#ff6666", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}
            <button
              onClick={() => { setSecret(input); fetchStats(input); }}
              disabled={!input || loading}
              style={{ width: "100%", padding: 14, borderRadius: 99, background: input ? "#cafd00" : "#1a1a18", border: "none", color: input ? "#1a2200" : "#333", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 15, cursor: input ? "pointer" : "default" }}
            >{loading ? "loading..." : "unlock →"}</button>
          </div>
        </div>
      </main>
    );
  }

  if (loading && !stats) {
    return (
      <main style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#cafd00", fontFamily: "'Space Grotesk', sans-serif", fontSize: 13 }}>loading...</span>
      </main>
    );
  }

  if (!stats) return null;

  const { summary, byEventCode, recentSignups, recentMatches, escrow } = stats;

  const TABS = [
    { id: "signups",  label: "Signups",  count: summary.realUsers },
    { id: "matches",  label: "Matches",  count: summary.totalMatches },
    { id: "escrow",   label: "Escrow",   count: null },
    { id: "seed",     label: "🌱 Seed",  count: stats.seedProfiles.length },
  ] as const;

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", paddingBottom: 80 }}>
      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: #555; }
        input:focus { outline: none; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Sticky header ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(10,10,10,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid #111110", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 900 }}>
            <span style={{ color: "#cafd00" }}>1</span><span style={{ color: "#9d7bb8" }}>%</span>
          </span>
          <span style={{ color: "#2a2a28", fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>ADMIN</span>
          {/* Live dot */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#cafd0010", border: "1px solid #cafd0020", borderRadius: 99, padding: "2px 8px" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#cafd00" }} />
            <span style={{ color: "#cafd00", fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>LIVE</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {lastRefresh && <span style={{ color: "#2a2a28", fontSize: 10, display: "none" }} className="desktop-only">{lastRefresh.toLocaleTimeString()}</span>}
          <button onClick={() => fetchStats(secret)} style={{ padding: "6px 12px", borderRadius: 99, background: "transparent", border: "1px solid #1e1e1c", color: "#555", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>↻</button>
          <button onClick={() => { setSecret(""); setStats(null); setInput(""); }} style={{ padding: "6px 12px", borderRadius: 99, background: "transparent", border: "1px solid #1e1e1c", color: "#444", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>lock</button>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "16px 14px" }}>

        {/* ── Key stats — 2 cols on mobile, 4 on wide ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          <StatCard label="REAL SIGNUPS" value={summary.realUsers} sub="excl. seeds" />
          <StatCard label="AI MATCHES" value={summary.totalMatches} color="#9d7bb8" />
          <StatCard label="SATS LOCKED" value={summary.totalSatsLocked > 0 ? `${(summary.totalSatsLocked / 1000).toFixed(1)}k ⚡` : "0 ⚡"} />
          <StatCard label="CONFIRMED" value={summary.confirmedMeetings} sub="meetings" color="#9d7bb8" />
        </div>

        {/* ── Second row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          <StatCard label="PROFILES" value={summary.totalProfiles} color="#777" />
          <StatCard label="LOCKED" value={summary.lockedMatches} sub="meetings" color="#cafd0080" />
          <StatCard label="REVIEWS" value={summary.totalReviews} color="#777" />
        </div>

        {/* ── Event code pills ── */}
        {byEventCode.length > 0 && (
          <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: 1.5 }}>EVENT CODES</span>
            {byEventCode.map(ev => (
              <div key={ev.invite_code} style={{ padding: "5px 12px", borderRadius: 99, background: ev.invite_code === "NAI5" ? "#cafd0015" : "#1a1a18", border: `1px solid ${ev.invite_code === "NAI5" ? "#cafd0040" : "#2a2a28"}`, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#cafd00", fontWeight: 800, fontSize: 13 }}>{ev.count}</span>
                <span style={{ color: "#777", fontSize: 12, fontWeight: 600 }}>{ev.invite_code}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 2 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "8px 14px", borderRadius: 99, flexShrink: 0,
              background: tab === t.id ? "#cafd00" : "transparent",
              border: tab === t.id ? "none" : "1px solid #1e1e1c",
              color: tab === t.id ? "#1a2200" : "#555",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: 12, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {t.label}
              {t.count !== null && (
                <span style={{ background: tab === t.id ? "rgba(0,0,0,0.15)" : "#1e1e1c", color: tab === t.id ? "#1a2200" : "#777", borderRadius: 99, padding: "1px 7px", fontSize: 11, fontWeight: 800 }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── SIGNUPS TAB ── */}
        {tab === "signups" && (
          <div style={{ borderRadius: 16, border: "1px solid #1e1e1c", background: "#111110", overflow: "hidden", animation: "fadeUp 0.2s ease" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #0e0e0c" }}>
              <p style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: 0 }}>RECENT REAL SIGNUPS</p>
            </div>
            {recentSignups.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center" }}>
                <p style={{ color: "#333", fontSize: 14, margin: 0 }}>Waiting for attendees...</p>
                <p style={{ color: "#222", fontSize: 12, margin: "6px 0 0" }}>Share the event code NAI5 at the door</p>
              </div>
            ) : recentSignups.map((u, i) => (
              <div key={u.pubkey} style={{ padding: "12px 16px", borderBottom: i < recentSignups.length - 1 ? "1px solid #0e0e0c" : "none", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <Avatar name={u.name ?? u.pubkey} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{u.name ?? <span style={{ color: "#333" }}>no name</span>}</span>
                    {u.role && <span style={{ color: "#9d7bb8", fontSize: 11 }}>{u.role}</span>}
                    {u.invite_code && <span style={{ background: "#cafd0010", color: "#cafd00", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99 }}>{u.invite_code}</span>}
                  </div>
                  {u.location && <p style={{ color: "#555", fontSize: 12, margin: 0 }}>{u.location}</p>}
                  {u.building && <p style={{ color: "#333", fontSize: 11, margin: "3px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>⚡ {u.building}</p>}
                </div>
                <span style={{ color: "#333", fontSize: 11, flexShrink: 0 }}>{timeAgo(u.created_at)}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── MATCHES TAB ── */}
        {tab === "matches" && (
          <div style={{ borderRadius: 16, border: "1px solid #1e1e1c", background: "#111110", overflow: "hidden", animation: "fadeUp 0.2s ease" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #0e0e0c" }}>
              <p style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: 0 }}>AI MATCHES</p>
            </div>
            {recentMatches.length === 0 ? (
              <p style={{ color: "#333", fontSize: 14, padding: "32px 20px", margin: 0, textAlign: "center" }}>No matches yet</p>
            ) : recentMatches.map((m, i) => (
              <div key={m.id} style={{ padding: "12px 16px", borderBottom: i < recentMatches.length - 1 ? "1px solid #0e0e0c" : "none", display: "flex", gap: 12, alignItems: "center" }}>
                {/* Score bubble */}
                <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, background: "#1a1a18", border: "1px solid #2a2a28", display: "flex", alignItems: "center", justifyContent: "center", color: m.score >= 85 ? "#cafd00" : "#9d7bb8", fontWeight: 900, fontSize: 14 }}>
                  {m.score}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {m.name_a ?? "?"} ↔ {m.name_b ?? "?"}
                  </p>
                  <p style={{ color: "#555", fontSize: 11, margin: "2px 0 0" }}>{m.role_a ?? "?"} · {m.role_b ?? "?"}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ color: STATUS_COLOR[m.status] ?? "#555", fontSize: 9, fontWeight: 700, letterSpacing: 1, margin: 0 }}>{m.status.replace(/_/g, " ").toUpperCase()}</p>
                  <p style={{ color: "#333", fontSize: 10, margin: "2px 0 0" }}>{timeAgo(m.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ESCROW TAB ── */}
        {tab === "escrow" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "fadeUp 0.2s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <StatCard label="INVOICES CREATED" value={escrow.total} color="#777" />
              <StatCard label="INVOICES PAID" value={escrow.held} />
            </div>
            <div style={{ borderRadius: 14, border: "1px solid #cafd0020", background: "#cafd0006", padding: "20px" }}>
              <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 6px" }}>TOTAL SATS IN ESCROW</p>
              <p style={{ color: "#cafd00", fontSize: 40, fontWeight: 900, margin: 0, lineHeight: 1 }}>
                {summary.totalSatsLocked.toLocaleString()}
              </p>
              <p style={{ color: "#555", fontSize: 13, margin: "4px 0 0" }}>sats · {summary.confirmedMeetings} meetings confirmed</p>
            </div>
          </div>
        )}

        {/* ── SEED TAB ── */}
        {tab === "seed" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "fadeUp 0.2s ease" }}>
            <div style={{ borderRadius: 14, border: "1px solid #cafd0020", background: "#cafd0006", padding: "18px" }}>
              <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 6px" }}>SEED PROFILES</p>
              <p style={{ color: "#666", fontSize: 13, margin: "0 0 14px", lineHeight: 1.6 }}>
                50 BNC 2026 profiles under <span style={{ color: "#cafd00", fontWeight: 700 }}>NAI5</span>. Safe to re-run.
              </p>
              <button onClick={reSeed} disabled={seeding} style={{ width: "100%", padding: "13px", borderRadius: 99, background: seeding ? "transparent" : "#cafd00", border: seeding ? "1px solid #cafd0040" : "none", color: seeding ? "#cafd00" : "#1a2200", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 14, cursor: seeding ? "default" : "pointer" }}>
                {seeding ? "seeding..." : "🌱 Run Seed Now"}
              </button>
              {seedMsg && <p style={{ color: seedMsg.startsWith("✓") ? "#cafd00" : "#ff6666", fontSize: 13, margin: "10px 0 0", fontWeight: 600 }}>{seedMsg}</p>}
            </div>

            <div style={{ borderRadius: 14, border: "1px solid #1e1e1c", background: "#111110", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #0e0e0c", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: 0 }}>IN DATABASE</p>
                <span style={{ color: "#333", fontSize: 11 }}>{stats.seedProfiles.length} profiles</span>
              </div>
              {stats.seedProfiles.length === 0 ? (
                <p style={{ color: "#333", fontSize: 13, padding: "24px 16px", margin: 0 }}>No seed profiles yet — run seed above.</p>
              ) : stats.seedProfiles.map((p, i) => (
                <div key={p.pubkey} style={{ padding: "10px 16px", borderBottom: i < stats.seedProfiles.length - 1 ? "1px solid #0e0e0c" : "none", display: "flex", gap: 10, alignItems: "center" }}>
                  <Avatar name={p.name ?? "?"} color="#9d7bb8" bg="#9d7bb820" border="#9d7bb840" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{p.name}</span>
                      <span style={{ color: "#555", fontSize: 11 }}>{p.role}</span>
                      {p.invite_code && <span style={{ background: "#cafd0010", color: "#cafd00", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 99 }}>{p.invite_code}</span>}
                    </div>
                    <p style={{ color: "#333", fontSize: 11, margin: 0 }}>{p.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
