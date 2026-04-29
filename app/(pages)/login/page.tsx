"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────
type Step = "boot" | "choose" | "scan" | "alby" | "connecting" | "done";
type AuthMethod = "alby" | "qr" | "guest";

const WALLET_OPTIONS = [
  { id: "phoenix",    name: "Phoenix",     icon: "🐦", popular: true  },
  { id: "alby-app",  name: "Alby",        icon: "🐝", popular: true  },
  { id: "zeus",      name: "Zeus",        icon: "⚡", popular: false },
  { id: "bluewallet",name: "Blue Wallet", icon: "🔵", popular: false },
  { id: "mutiny",    name: "Mutiny",      icon: "⚡", popular: false },
  { id: "breez",     name: "Breez",       icon: "🌬️", popular: false },
];

const BOOT_LINES = [
  { text: "detected 3 VCs nearby. deploying politeness shield 🛡️", delay: 0,    color: "#ff8c42" },
  { text: "scanning for people who actually ship things...",         delay: 600               },
  { text: "ghost probability: LOW ✓  vibe check: PASSED ✓",        delay: 1100, color: "#cafd00" },
  { text: "warning: free coffee detected 40m away. stay focused.",  delay: 1600, color: "#ff8c42" },
  { text: "you're one of the good ones. how do you want to sign in?", delay: 2050, color: "#cafd00" },
];

// ── QR Code ───────────────────────────────────────────────────────────
function LNURLQRCode({ lnurl }: { lnurl: string }) {
  const size = 180;
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(lnurl)}&bgcolor=141412&color=cafd00&qzone=2`;
  return (
    <div style={{ width: size, height: size, borderRadius: 12, overflow: "hidden", border: "1px solid #cafd0040" }}>
      <img src={url} width={size} height={size} alt="LNURL-auth QR" style={{ display: "block" }} />
    </div>
  );
}

function QRPlaceholder() {
  return (
    <div style={{ width: 180, height: 180, borderRadius: 12, background: "#111110", border: "1px solid #1e1e1c", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#cafd00", boxShadow: "0 0 12px #cafd00", animation: "pulse 1s ease-in-out infinite" }} />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [step, setStep]           = useState<Step>("boot");
  const [bootLines, setBootLines] = useState<typeof BOOT_LINES>([]);
  const [progress, setProgress]   = useState(0);
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const [lnurl, setLnurl]         = useState("");
  const [k1, setK1]               = useState("");
  const [polling, setPolling]     = useState(false);
  const [albyStatus, setAlbyStatus] = useState<"idle" | "signing" | "done" | "error">("idle");
  const [showAllWallets, setShowAllWallets] = useState(false);
  const [albyDetected, setAlbyDetected] = useState(false);
  const bootedRef = useRef(false);

  // ── Detect Alby extension ─────────────────────────────────────────
  useEffect(() => {
    // window.alby or window.webln indicates the extension is installed
    const check = () => setAlbyDetected(!!(window as any).webln || !!(window as any).alby);
    check();
    window.addEventListener("load", check);
    return () => window.removeEventListener("load", check);
  }, []);

  // ── Boot sequence ─────────────────────────────────────────────────
  useEffect(() => {
    if (step !== "boot" || bootedRef.current) return;
    bootedRef.current = true;
    BOOT_LINES.forEach(line => {
      setTimeout(() => setBootLines(prev => [...prev, line]), line.delay);
    });
    setTimeout(() => setStep("choose"), 2800);
  }, []);

  // ── Fetch LNURL challenge ─────────────────────────────────────────
  async function fetchLNURL() {
    try {
      const res = await fetch("/api/auth/lnurl");
      const data = await res.json();
      setLnurl(data.lnurl);
      setK1(data.k1);
      setPolling(true);
    } catch (err) {
      console.error("LNURL fetch failed:", err);
    }
  }

  // ── Alby WebLN sign-in ────────────────────────────────────────────
  async function signWithAlby() {
    setAlbyStatus("signing");
    try {
      const webln = (window as any).webln;
      if (!webln) throw new Error("WebLN not available");
      await webln.enable();

      const res = await fetch("/api/auth/lnurl");
      const data = await res.json();

      // Must pass the bech32 encoded LNURL, not the raw URL
      await webln.lnurl(data.lnurl);

      // Signed — redirect directly to profile setup
      setAlbyStatus("done");
      setTimeout(() => router.push("/profile"), 1000);

    } catch (err: any) {
      console.error("[alby]", err);
      setAlbyStatus("error");
    }
  }

  // ── Poll for session (QR flow + Alby flow) ──────────────────────────
  useEffect(() => {
    if (!polling) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.loggedIn) {
          clearInterval(id);
          setPolling(false);
          router.push("/profile");
        }
      } catch {}
    }, 1500);
    const timeout = setTimeout(() => clearInterval(id), 5 * 60 * 1000);
    return () => { clearInterval(id); clearTimeout(timeout); };
  }, [polling, k1]);

  // ── Progress bar + auto redirect ─────────────────────────────────
  useEffect(() => {
    if (step !== "connecting") return;
    const id = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(id);
          setTimeout(() => router.push("/profile"), 400);
          return 100;
        }
        return p + 5;
      });
    }, 80);
    return () => clearInterval(id);
  }, [step]);

  // ── Wallet deep links ─────────────────────────────────────────────
  const handleWalletDeeplink = (walletId: string) => {
    if (!lnurl) return;
    const deeplinks: Record<string, string> = {
      phoenix:    `phoenix://lnurlauth?tag=login&lnurl=${lnurl}`,
      "alby-app": `alby:lnurlauth/${lnurl}`,
      zeus:       `zeusln://lnurlauth?tag=login&lnurl=${lnurl}`,
      bluewallet: `bluewallet:lightning?lnurlAuth=${lnurl}`,
      mutiny:     `mutinynet://lnurlauth?lnurl=${lnurl}`,
      breez:      `breez://lnurlauth?lnurl=${lnurl}`,
    };
    if (deeplinks[walletId]) window.location.href = deeplinks[walletId];
  };

  // ── Guest mode ────────────────────────────────────────────────────
  const continueAsGuest = () => {
    // Store guest flag — they can browse but can't lock sats
    sessionStorage.setItem("matchsats_guest", "true");
    router.push("/matches");
  };

  const btn = (label: string, onClick: () => void, style?: React.CSSProperties) => (
    <button onClick={onClick} style={{
      width: "100%", padding: "14px", borderRadius: 99,
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 800, fontSize: 14, cursor: "pointer",
      letterSpacing: 1.5, transition: "all 0.18s", border: "none",
      ...style,
    }}>{label}</button>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#0e0e0e", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes pulse    { 0%,100%{opacity:0.4}50%{opacity:1} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        @keyframes dot      { 0%,80%,100%{opacity:0.2}40%{opacity:1} }
        @keyframes lp       { 0%,100%{transform:scale(1);opacity:0.06}50%{transform:scale(1.1);opacity:0.15} }
        @keyframes slideIn  { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <div style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: "#cafd00", fontWeight: 700, fontSize: 15, letterSpacing: 2 }}>MATCHSATS</span>
        <button onClick={continueAsGuest} style={{ background: "none", border: "none", color: "#555", fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, cursor: "pointer", letterSpacing: 0.5 }}>
          browse as guest →
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>

        {/* ── BOOT ── */}
        {step === "boot" && (
          <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", alignItems: "center", gap: 48 }}>
            <div style={{ position: "relative", width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ position: "absolute", width: 28+i*16, height: 28+i*16, borderRadius: "50%", border: "1px solid #cafd00", opacity: 0.08/i, animation: `lp ${1+i*0.5}s ease-in-out infinite` }} />
              ))}
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#cafd0018", border: "2px solid #cafd00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 0 24px rgba(202,253,0,0.35)" }}>⚡</div>
            </div>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16, minHeight: 160 }}>
              {bootLines.map((line, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, animation: "fadeUp 0.4s ease both" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: line.color ?? "#cafd00", flexShrink: 0, marginTop: 6, boxShadow: `0 0 6px ${line.color ?? "#cafd00"}` }} />
                  <p style={{ color: line.color ?? "#aaa", fontSize: 15, fontWeight: 500, margin: 0, lineHeight: 1.5 }}>{line.text}</p>
                </div>
              ))}
              {bootLines.length < 5 && (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#333", flexShrink: 0 }} />
                  <div style={{ display: "flex", gap: 5 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#333", animation: `dot 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CHOOSE METHOD ── */}
        {step === "choose" && (
          <div style={{ width: "100%", maxWidth: 400, animation: "slideIn 0.4s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h1 style={{ fontSize: "clamp(28px, 8vw, 42px)", fontWeight: 900, margin: "0 0 8px" }}>Sign in to</h1>
              <h1 style={{ fontSize: "clamp(28px, 8vw, 42px)", fontWeight: 900, color: "#cafd00", margin: "0 0 12px" }}>MatchSats.</h1>
              <p style={{ color: "#777", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                Use your Lightning wallet for a secure, passwordless login.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              {/* Option 1 — Alby extension (show first if detected) */}
              <button
                onClick={() => { setAuthMethod("alby"); setStep("alby"); signWithAlby(); }}
                style={{
                  width: "100%", padding: "16px 20px", borderRadius: 16,
                  background: albyDetected ? "#cafd0015" : "#111110",
                  border: `1px solid ${albyDetected ? "#cafd0050" : "#1e1e1c"}`,
                  color: "#fff", fontFamily: "'Space Grotesk', sans-serif",
                  cursor: "pointer", transition: "all 0.18s",
                  display: "flex", alignItems: "center", gap: 14, textAlign: "left",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#cafd0060"; e.currentTarget.style.background = "#cafd0018"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = albyDetected ? "#cafd0050" : "#1e1e1c"; e.currentTarget.style.background = albyDetected ? "#cafd0015" : "#111110"; }}
              >
                <span style={{ fontSize: 28, flexShrink: 0 }}>🐝</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Alby Browser Extension</p>
                    {albyDetected && <span style={{ background: "#cafd0020", border: "1px solid #cafd0040", color: "#cafd00", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99, letterSpacing: 1 }}>DETECTED</span>}
                  </div>
                  <p style={{ color: "#666", fontSize: 12, margin: "2px 0 0" }}>One click — no scanning needed</p>
                </div>
                <span style={{ color: "#555", fontSize: 18 }}>→</span>
              </button>

              {/* Option 2 — Scan QR */}
              <button
                onClick={() => { setAuthMethod("qr"); setStep("scan"); fetchLNURL(); }}
                style={{
                  width: "100%", padding: "16px 20px", borderRadius: 16,
                  background: "#111110", border: "1px solid #1e1e1c",
                  color: "#fff", fontFamily: "'Space Grotesk', sans-serif",
                  cursor: "pointer", transition: "all 0.18s",
                  display: "flex", alignItems: "center", gap: 14, textAlign: "left",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#cafd0040"; e.currentTarget.style.background = "#141412"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1c"; e.currentTarget.style.background = "#111110"; }}
              >
                <span style={{ fontSize: 28, flexShrink: 0 }}>📱</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Scan with Lightning Wallet</p>
                  <p style={{ color: "#666", fontSize: 12, margin: "2px 0 0" }}>Phoenix · Zeus · Breez · Blue Wallet</p>
                </div>
                <span style={{ color: "#555", fontSize: 18 }}>→</span>
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
                <div style={{ flex: 1, height: 1, background: "#1a1a18" }} />
                <span style={{ color: "#444", fontSize: 11, letterSpacing: 1 }}>NO WALLET?</span>
                <div style={{ flex: 1, height: 1, background: "#1a1a18" }} />
              </div>

              {/* Option 3 — Guest mode */}
              <button
                onClick={continueAsGuest}
                style={{
                  width: "100%", padding: "16px 20px", borderRadius: 16,
                  background: "transparent", border: "1px solid #1a1a18",
                  color: "#fff", fontFamily: "'Space Grotesk', sans-serif",
                  cursor: "pointer", transition: "all 0.18s",
                  display: "flex", alignItems: "center", gap: 14, textAlign: "left",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.background = "#111110"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a18"; e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 28, flexShrink: 0 }}>👀</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Browse as Guest</p>
                  <p style={{ color: "#555", fontSize: 12, margin: "2px 0 0" }}>Explore matches · Message later · Get a wallet when you're ready</p>
                </div>
                <span style={{ color: "#444", fontSize: 18 }}>→</span>
              </button>

              {/* Get a wallet CTA */}
              <div style={{ background: "#0e0e0c", border: "1px solid #1a1a18", borderRadius: 14, padding: "14px 16px" }}>
                <p style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 1, margin: "0 0 8px" }}>NEW TO LIGHTNING?</p>
                <p style={{ color: "#888", fontSize: 13, margin: "0 0 10px", lineHeight: 1.5 }}>
                  Get Phoenix Wallet — takes about 30 seconds. Then come back and scan.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <a href="https://phoenix.acinq.co" target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "9px", borderRadius: 99, background: "#1a1a18", border: "1px solid #2a2a28", color: "#aaa", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, cursor: "pointer", letterSpacing: 1, textAlign: "center", textDecoration: "none", transition: "all 0.18s", display: "block" }}>
                    🐦 iOS / Android
                  </a>
                  <a href="https://getalby.com" target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "9px", borderRadius: 99, background: "#1a1a18", border: "1px solid #2a2a28", color: "#aaa", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, cursor: "pointer", letterSpacing: 1, textAlign: "center", textDecoration: "none", transition: "all 0.18s", display: "block" }}>
                    🐝 Browser Extension
                  </a>
                </div>
              </div>
            </div>

            <p style={{ color: "#333", fontSize: 11, textAlign: "center", marginTop: 20 }}>
              no email · no password · no tracking
            </p>
          </div>
        )}

        {/* ── ALBY SIGNING ── */}
        {step === "alby" && (
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", gap: 28, animation: "slideIn 0.3s ease" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: albyStatus === "error" ? "#ff444415" : "#cafd0015", border: `2px solid ${albyStatus === "error" ? "#ff4444" : "#cafd00"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, boxShadow: `0 0 30px ${albyStatus === "error" ? "rgba(255,68,68,0.2)" : "rgba(202,253,0,0.2)"}` }}>
              {albyStatus === "error" ? "⚠️" : albyStatus === "done" ? "✓" : "🐝"}
            </div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>
                {albyStatus === "signing" ? "Check your Alby..." : albyStatus === "done" ? "Signed!" : albyStatus === "error" ? "Something went wrong" : "Opening Alby"}
              </h2>
              <p style={{ color: "#aaa", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                {albyStatus === "signing" ? "A signature request just popped up in your browser extension." : albyStatus === "done" ? "Identity verified. Loading your matches..." : albyStatus === "error" ? "Couldn't connect to Alby. Try scanning the QR instead." : ""}
              </p>
            </div>
            {albyStatus === "error" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                <button onClick={() => { setStep("scan"); fetchLNURL(); }} style={{ width: "100%", padding: "13px", borderRadius: 99, background: "#cafd00", border: "none", color: "#1a2200", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer", letterSpacing: 1 }}>
                  TRY QR SCAN INSTEAD
                </button>
                <button onClick={() => setStep("choose")} style={{ width: "100%", padding: "12px", borderRadius: 99, background: "transparent", border: "1px solid #333", color: "#777", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  ← back
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── SCAN QR ── */}
        {step === "scan" && (
          <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", alignItems: "center", animation: "slideIn 0.3s ease" }}>
            <button onClick={() => setStep("choose")} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#555", fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>← back</button>

            <p style={{ color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: 3, margin: "0 0 16px" }}>SCAN TO SIGN IN</p>
            <h1 style={{ fontSize: "clamp(24px, 7vw, 40px)", fontWeight: 900, textAlign: "center", lineHeight: 1.05, margin: "0 0 6px" }}>Open your wallet</h1>
            <h1 style={{ fontSize: "clamp(24px, 7vw, 40px)", fontWeight: 900, textAlign: "center", color: "#cafd00", margin: "0 0 28px" }}>and scan this.</h1>

            <div style={{ background: "#141412", border: "1px solid #1e1e1c", borderRadius: 22, padding: "28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: "100%", marginBottom: 12, boxSizing: "border-box" }}>
              {lnurl ? <LNURLQRCode lnurl={lnurl} /> : <QRPlaceholder />}
              <p style={{ color: "#aaa", fontSize: 13, margin: 0, textAlign: "center" }}>Works with any LNURL-auth compatible wallet</p>

              <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                <div style={{ flex: 1, height: 1, background: "#2a2a28" }} />
                <span style={{ color: "#555", fontSize: 11 }}>OR OPEN IN APP</span>
                <div style={{ flex: 1, height: 1, background: "#2a2a28" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" }}>
                {WALLET_OPTIONS.filter(w => w.popular).map(w => (
                  <button key={w.id} onClick={() => handleWalletDeeplink(w.id)} style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #2a2a28", background: "#0e0e0e", color: "#aaa", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#cafd0060"; e.currentTarget.style.color = "#cafd00"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a28"; e.currentTarget.style.color = "#aaa"; }}
                  ><span>{w.icon}</span><span>{w.name}</span></button>
                ))}
              </div>

              {!showAllWallets ? (
                <button onClick={() => setShowAllWallets(true)} style={{ background: "none", border: "none", color: "#555", fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, cursor: "pointer" }}>show more wallets</button>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" }}>
                  {WALLET_OPTIONS.filter(w => !w.popular).map(w => (
                    <button key={w.id} onClick={() => handleWalletDeeplink(w.id)} style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #2a2a28", background: "#0e0e0e", color: "#aaa", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#cafd0060"; e.currentTarget.style.color = "#cafd00"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a28"; e.currentTarget.style.color = "#aaa"; }}
                    ><span>{w.icon}</span><span>{w.name}</span></button>
                  ))}
                </div>
              )}
            </div>

            {polling && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, margin: "4px 0 8px" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#9d7bb8", animation: "pulse 1.2s ease-in-out infinite", boxShadow: "0 0 6px #9d7bb8" }} />
                <span style={{ color: "#9d7bb8", fontSize: 11, fontWeight: 600 }}>Waiting for wallet confirmation...</span>
              </div>
            )}
            <p style={{ color: "#444", fontSize: 11, textAlign: "center" }}>no email · no password · just your wallet</p>
          </div>
        )}

        {/* ── CONNECTING ── */}
        {step === "connecting" && (
          <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", alignItems: "center", gap: 28, animation: "slideIn 0.3s ease" }}>
            <div style={{ position: "relative", width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ position: "absolute", width: 28+i*16, height: 28+i*16, borderRadius: "50%", border: "1px solid #cafd00", opacity: 0.1/i, animation: `lp ${1+i*0.4}s ease-in-out infinite` }} />
              ))}
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#cafd0018", border: "2px solid #cafd00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 0 20px rgba(202,253,0,0.3)" }}>⚡</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>You're in!</h2>
              <p style={{ color: "#aaa", fontSize: 14, margin: 0 }}>
                {progress < 40 ? "setting up your space..." : progress < 75 ? "finding people nearby..." : "almost ready ⚡"}
              </p>
            </div>
            <div style={{ width: "100%", background: "#1a1a18", borderRadius: 99, height: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 99, background: "#cafd00", width: `${progress}%`, transition: "width 0.08s linear", boxShadow: "0 0 10px rgba(202,253,0,0.5)" }} />
            </div>
          </div>
        )}

        {/* ── DONE ── */}
        {step === "done" && (
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, animation: "slideIn 0.3s ease" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#cafd0015", border: "2px solid #cafd00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: "0 0 40px rgba(202,253,0,0.25)" }}>⚡</div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "clamp(26px, 7vw, 40px)", fontWeight: 900, margin: "0 0 8px" }}>you're in.</h2>
              <p style={{ color: "#cafd00", fontSize: 14, fontWeight: 700, margin: "0 0 6px" }}>identity verified</p>
              <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>don't ghost anyone. sats are watching. 👀</p>
            </div>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => router.push("/profile")} style={{ width: "100%", padding: "15px", borderRadius: 99, background: "#cafd00", border: "none", color: "#1a2200", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer", letterSpacing: 1.5, boxShadow: "0 0 28px rgba(202,253,0,0.25)" }}>
                SET UP MY PROFILE →
              </button>
              <button onClick={() => router.push("/matches")} style={{ width: "100%", padding: "14px", borderRadius: 99, background: "transparent", border: "1px solid #333", color: "#888", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#ccc"; e.currentTarget.style.borderColor = "#555"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "#333"; }}
              >just let me in already</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}