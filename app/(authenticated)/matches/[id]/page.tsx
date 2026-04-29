"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────
interface MatchData {
  id: number;
  name: string;
  role: string;
  location: string;
  initials: string;
  score: number;
  rationale: string;
  status: string;
  core_vibe: string;
  interests: string[];
  building: string | null;
  needs: string | null;
  lightning_addr: string | null;
  escrow: {
    mine: string | null;
    theirs: string | null;
    both_locked: boolean;
  };
}

// ── QR Code for invoice ───────────────────────────────────────────────
function InvoiceQR({ paymentRequest }: { paymentRequest: string }) {
  const size = 200;
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(paymentRequest)}&bgcolor=141412&color=cafd00&qzone=2`;
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #cafd0040" }}>
      <img src={url} width={size} height={size} alt="Lightning invoice" style={{ display: "block" }} />
    </div>
  );
}

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);

  const [match, setMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lockStep, setLockStep] = useState<"idle" | "creating" | "invoice" | "locked">("idle");
  const [paymentRequest, setPaymentRequest] = useState("");
  const [paymentHash, setPaymentHash] = useState("");
  const [lockError, setLockError] = useState("");
  const [checking, setChecking] = useState(false);

  // Fetch real match data
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/match/${id}`);
        if (!res.ok) { router.push("/matches"); return; }
        const data = await res.json();
        setMatch(data);
        // If already locked, show locked state
        if (data.escrow.mine === "held") setLockStep("locked");
      } catch {
        router.push("/matches");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Poll for payment after invoice shown
  useEffect(() => {
    if (lockStep !== "invoice" || !paymentHash) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/escrow?match_id=${match?.id}`);
        const data = await res.json();
        const mine = data.escrows?.find((e: any) => e.status === "held");
        if (mine) {
          clearInterval(id);
          setLockStep("locked");
          setMatch(prev => prev ? { ...prev, escrow: { ...prev.escrow, mine: "held", both_locked: data.both_locked } } : prev);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(id);
  }, [lockStep, paymentHash]);

  const handleLockSats = async () => {
    if (!match) return;
    setLockStep("creating");
    setLockError("");
    try {
      const res = await fetch("/api/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: match.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.payment_request) {
        throw new Error(data.error ?? "Failed to create invoice");
      }
      setPaymentRequest(data.payment_request);
      setPaymentHash(data.payment_hash);
      setLockStep("invoice");
    } catch (err: any) {
      setLockError(err.message);
      setLockStep("idle");
    }
  };

  const scoreColor = !match ? "#555" : match.score >= 90 ? "#cafd00" : match.score >= 80 ? "#9d7bb8" : "#777";
  const isActive = match?.status === "both_locked" || match?.status === "confirmed";
  const isLocked = match?.escrow.mine === "held";

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#cafd00", boxShadow: "0 0 12px #cafd00", animation: "pulse 1s ease-in-out infinite" }} />
      <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
    </main>
  );

  if (!match) return null;

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", paddingBottom: 120 }}>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(10,10,10,0.95)", backdropFilter: "blur(14px)", borderBottom: "1px solid #111110", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "1px solid #1e1e1c", borderRadius: 99, color: "#666", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, cursor: "pointer", padding: "6px 14px", letterSpacing: 1, transition: "all 0.18s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#aaa"; e.currentTarget.style.borderColor = "#333"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = "#1e1e1c"; }}
        >← BACK</button>
        <span style={{ color: "#cafd00", fontWeight: 700, fontSize: 13, letterSpacing: 2 }}>MATCHSATS</span>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "1.5rem 1.25rem" }}>

        {/* Profile hero */}
        <div style={{ borderRadius: 20, border: `1px solid ${isLocked ? "#cafd0040" : "#1e1e1c"}`, background: "#111110", padding: "24px", marginBottom: 12, animation: "slideUp 0.3s ease" }}>
          {isActive && <div style={{ height: 2, background: "linear-gradient(90deg, #cafd00, #cafd0020)", borderRadius: 99, marginBottom: 20 }} />}

          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#cafd0018", border: "2px solid #cafd0050", display: "flex", alignItems: "center", justifyContent: "center", color: "#cafd00", fontWeight: 900, fontSize: 22, boxShadow: "0 0 20px rgba(202,253,0,0.15)", flexShrink: 0 }}>
              {match.initials}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>{match.name}</h1>
              <p style={{ color: "#bbb", fontSize: 14, margin: "0 0 4px" }}>{match.role}</p>
              <p style={{ color: "#555", fontSize: 12, margin: 0 }}>{match.location}</p>
            </div>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ color: scoreColor, fontWeight: 900, fontSize: 28, lineHeight: 1, textShadow: `0 0 16px ${scoreColor}60` }}>{match.score}</div>
              <div style={{ color: "#555", fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>MATCH</div>
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 16 }}>
            {match.interests.slice(0, 5).map(tag => (
              <span key={tag} style={{ background: "#1a1a18", border: "1px solid #2a2a28", color: "#bbb", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 99 }}>{tag}</span>
            ))}
            <span style={{ background: "#9d7bb815", border: "1px solid #9d7bb840", color: "#9d7bb8", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 99 }}>{match.core_vibe}</span>
          </div>

          {/* Why you match */}
          <div style={{ background: "#0e0e0c", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#cafd00", boxShadow: "0 0 6px #cafd00" }} />
              <p style={{ color: "#bbb", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: 0 }}>WHY YOU MATCH</p>
            </div>
            <p style={{ color: "#ddd", fontSize: 14, margin: 0, lineHeight: 1.7 }}>{match.rationale}</p>
          </div>
        </div>

        {/* Building + Needs */}
        {(match.building || match.needs) && (
          <div style={{ display: "grid", gridTemplateColumns: match.building && match.needs ? "1fr 1fr" : "1fr", gap: 10, marginBottom: 12 }}>
            {match.building && (
              <div style={{ borderRadius: 16, border: "1px solid #1e1e1c", background: "#111110", padding: "16px" }}>
                <p style={{ color: "#cafd00", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 8px" }}>⚡ BUILDING</p>
                <p style={{ color: "#bbb", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{match.building}</p>
              </div>
            )}
            {match.needs && (
              <div style={{ borderRadius: 16, border: "1px solid #1e1e1c", background: "#111110", padding: "16px" }}>
                <p style={{ color: "#9d7bb8", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 8px" }}>◈ NEEDS</p>
                <p style={{ color: "#bbb", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{match.needs}</p>
              </div>
            )}
          </div>
        )}

        {/* Escrow status */}
        {(match.escrow.mine || match.escrow.theirs) && (
          <div style={{ borderRadius: 16, border: "1px solid #cafd0030", background: "#cafd0008", padding: "14px 18px", marginBottom: 12, display: "flex", gap: 12, alignItems: "center" }}>
            <div>
              <p style={{ color: "#cafd00", fontSize: 11, fontWeight: 700, margin: "0 0 4px" }}>ESCROW STATUS</p>
              <p style={{ color: "#888", fontSize: 12, margin: 0 }}>
                You: <span style={{ color: match.escrow.mine === "held" ? "#cafd00" : "#555" }}>{match.escrow.mine === "held" ? "✓ Locked" : "Pending"}</span>
                {"  ·  "}
                Them: <span style={{ color: match.escrow.theirs === "held" ? "#cafd00" : "#555" }}>{match.escrow.theirs === "held" ? "✓ Locked" : "Pending"}</span>
              </p>
            </div>
            {match.escrow.both_locked && (
              <span style={{ marginLeft: "auto", background: "#cafd0020", border: "1px solid #cafd0040", color: "#cafd00", fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 99 }}>BOTH LOCKED</span>
            )}
          </div>
        )}

        {/* Invoice QR */}
        {lockStep === "invoice" && (
          <div style={{ borderRadius: 20, border: "1px solid #cafd0030", background: "#111110", padding: "24px", marginBottom: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, animation: "slideUp 0.3s ease" }}>
            <p style={{ color: "#cafd00", fontSize: 11, fontWeight: 700, letterSpacing: 2, margin: 0 }}>SCAN TO LOCK 2,100 SATS</p>
            <InvoiceQR paymentRequest={paymentRequest} />
            {/* Pay with Alby if available */}
            {typeof window !== "undefined" && (window as any).webln && (
              <button onClick={async () => {
                try {
                  const webln = (window as any).webln;
                  await webln.enable();
                  await webln.sendPayment(paymentRequest);
                } catch (err: any) {
                  setLockError(err.message ?? "Payment failed");
                }
              }} style={{
                width: "100%", padding: "13px", borderRadius: 99,
                background: "#cafd00", border: "none",
                color: "#1a2200", fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800, fontSize: 13, cursor: "pointer",
                letterSpacing: 1.5, boxShadow: "0 0 20px rgba(202,253,0,0.3)",
              }}>
                PAY WITH ALBY ⚡
              </button>
            )}
            <p style={{ color: "#777", fontSize: 12, textAlign: "center", margin: 0 }}>or scan with your Lightning wallet</p>
            <div style={{ background: "#0e0e0c", borderRadius: 10, padding: "10px 14px", width: "100%", boxSizing: "border-box" }}>
              <p style={{ color: "#555", fontSize: 9, fontWeight: 700, letterSpacing: 1, margin: "0 0 4px" }}>INVOICE</p>
              <p style={{ color: "#444", fontSize: 10, fontFamily: "monospace", margin: 0, wordBreak: "break-all", lineHeight: 1.4 }}>{paymentRequest.slice(0, 60)}...</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#9d7bb8", animation: "pulse 1.2s ease-in-out infinite", boxShadow: "0 0 6px #9d7bb8" }} />
              <span style={{ color: "#9d7bb8", fontSize: 11, fontWeight: 600 }}>Waiting for payment...</span>
            </div>
          </div>
        )}

        {/* Locked confirmation */}
        {lockStep === "locked" && (
          <div style={{ borderRadius: 20, border: "1px solid #cafd0040", background: "#cafd0008", padding: "20px", marginBottom: 12, textAlign: "center", animation: "slideUp 0.3s ease" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
            <p style={{ color: "#cafd00", fontWeight: 800, fontSize: 16, margin: "0 0 4px" }}>Sats locked!</p>
            <p style={{ color: "#888", fontSize: 13, margin: 0 }}>
              {match.escrow.both_locked ? "Both sides locked — you're committed. Go meet!" : "Waiting for them to lock their sats..."}
            </p>
          </div>
        )}

        {lockError && (
          <p style={{ color: "#ff6666", fontSize: 13, margin: "0 0 12px", textAlign: "center" }}>{lockError}</p>
        )}
      </div>

      {/* Floating CTA */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "1rem 1.25rem 2rem", background: "linear-gradient(to top, #0a0a0a 60%, transparent)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", gap: 10 }}>
          <button onClick={() => router.push(`/matches/${id}/dm`)} style={{ flex: "0 0 auto", padding: "14px 20px", borderRadius: 99, background: "transparent", border: "1px solid #1e1e1c", color: "#777", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 1, transition: "all 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#9d7bb860"; e.currentTarget.style.color = "#9d7bb8"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1c"; e.currentTarget.style.color = "#777"; }}
          >MESSAGE ◈</button>

          {lockStep === "idle" && !isLocked && (
            <button onClick={handleLockSats} style={{ flex: 1, padding: "14px", borderRadius: 99, background: "#cafd00", border: "none", color: "#1a2200", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer", letterSpacing: 1.5, boxShadow: "0 0 28px rgba(202,253,0,0.3)", transition: "opacity 0.18s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >LOCK SATS ⚡</button>
          )}

          {lockStep === "creating" && (
            <button disabled style={{ flex: 1, padding: "14px", borderRadius: 99, background: "transparent", border: "1px solid #cafd0040", color: "#cafd00", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, cursor: "default", opacity: 0.6, letterSpacing: 1 }}>
              CREATING INVOICE...
            </button>
          )}

          {lockStep === "invoice" && (
            <button disabled style={{ flex: 1, padding: "14px", borderRadius: 99, background: "transparent", border: "1px solid #9d7bb840", color: "#9d7bb8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, cursor: "default", letterSpacing: 1 }}>
              WAITING FOR PAYMENT...
            </button>
          )}

          {(lockStep === "locked" || isLocked) && (
            <button onClick={() => router.push(`/matches/${id}/review`)} style={{ flex: 1, padding: "14px", borderRadius: 99, background: "#cafd00", border: "none", color: "#1a2200", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer", letterSpacing: 1.5, boxShadow: "0 0 28px rgba(202,253,0,0.3)" }}>
              GO TO REVIEW →
            </button>
          )}
        </div>
      </div>
    </main>
  );
}