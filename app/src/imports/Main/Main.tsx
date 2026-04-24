"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const WALLET_OPTIONS = [
  { id: "phoenix", name: "Phoenix", icon: "🐦" },
  { id: "mutiny", name: "Mutiny", icon: "⚡" },
  { id: "alby", name: "Alby", icon: "🐝" },
  { id: "zeus", name: "Zeus", icon: "⚡" },
  { id: "bluewallet", name: "Blue Wallet", icon: "🔵" },
  { id: "breez", name: "Breez", icon: "🌬️" },
];

const BOOT_LINES = [
  { text: "scanning for humans worth talking to...", delay: 0 },
  { text: "detected 3 VCs nearby. deploying politeness shield 🛡️", delay: 500, color: "#ff8c42" },
  { text: "vibe check: BUILDER ✓  ghost probability: LOW ✓", delay: 1000, color: "#cafd00" },
  { text: "identity: UNVERIFIED (you look a little sus ngl)", delay: 1500, color: "#9d7bb8" },
  { text: "ok fine. prove you're real. scan your wallet 👇", delay: 1950, color: "#cafd00" },
];

type Step = "boot" | "scan" | "connecting" | "done";

function QRCode() {
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
      <rect x="10" y="10" width="50" height="50" rx="4" stroke="#cafd00" strokeWidth="3" fill="none"/>
      <rect x="20" y="20" width="30" height="30" rx="2" fill="#cafd00" fillOpacity="0.15"/>
      <rect x="26" y="26" width="18" height="18" rx="1" fill="#cafd00"/>
      <rect x="120" y="10" width="50" height="50" rx="4" stroke="#cafd00" strokeWidth="3" fill="none"/>
      <rect x="130" y="20" width="30" height="30" rx="2" fill="#cafd00" fillOpacity="0.15"/>
      <rect x="136" y="26" width="18" height="18" rx="1" fill="#cafd00"/>
      <rect x="10" y="120" width="50" height="50" rx="4" stroke="#cafd00" strokeWidth="3" fill="none"/>
      <rect x="20" y="130" width="30" height="30" rx="2" fill="#cafd00" fillOpacity="0.15"/>
      <rect x="26" y="136" width="18" height="18" rx="1" fill="#cafd00"/>
      {[[72,10],[82,10],[92,10],[102,10],[72,20],[92,20],[72,30],[82,30],[92,30],[102,30],[72,40],[102,40],[72,50],[82,50],[92,50],[10,72],[20,72],[30,72],[40,72],[50,72],[10,82],[30,82],[50,82],[10,92],[20,92],[30,92],[40,92],[50,92],[10,102],[40,102],[10,112],[20,112],[30,112],[50,112],[72,72],[82,72],[102,72],[112,72],[72,82],[92,82],[112,82],[82,92],[92,92],[102,92],[72,102],[82,102],[112,102],[72,112],[92,112],[102,112],[112,112],[120,72],[130,72],[150,72],[160,72],[120,82],[140,82],[160,82],[120,92],[130,92],[140,92],[150,92],[160,92],[130,102],[150,102],[120,112],[130,112],[140,112],[160,112],[72,130],[82,130],[102,130],[112,130],[72,140],[92,140],[102,140],[82,150],[92,150],[102,150],[112,150],[72,160],[82,160],[102,160],[120,130],[140,130],[150,130],[160,130],[120,140],[130,140],[150,140],[120,150],[130,150],[140,150],[160,150],[120,160],[140,160],[160,160]].map(([x,y],i) => (
        <rect key={i} x={x} y={y} width="8" height="8" rx="1" fill="#cafd00" fillOpacity="0.7"/>
      ))}
      <rect x="76" y="76" width="28" height="28" rx="6" fill="#0e0e0e" stroke="#cafd00" strokeWidth="1.5"/>
      <text x="90" y="95" textAnchor="middle" fill="#cafd00" fontSize="14" fontWeight="bold">⚡</text>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("boot");
  const [bootLines, setBootLines] = useState<typeof BOOT_LINES>([]);
  const [cursor, setCursor] = useState(true);
  const [showWallets, setShowWallets] = useState(false);
  const [progress, setProgress] = useState(0);
  const termRef = useRef<HTMLDivElement>(null);
  const bootedRef = useRef(false);

  useEffect(() => {
    if (step !== "boot" || bootedRef.current) return;
    bootedRef.current = true;
    const cursorId = setInterval(() => setCursor(c => !c), 530);
    BOOT_LINES.forEach(line => {
      setTimeout(() => {
        setBootLines(prev => [...prev, line]);
        if (termRef.current) termRef.current.scrollTop = 9999;
      }, line.delay);
    });
    setTimeout(() => { clearInterval(cursorId); setStep("scan"); }, 2600);
    return () => clearInterval(cursorId);
  }, []);

  useEffect(() => {
    if (step !== "connecting") return;
    const id = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(id); setTimeout(() => setStep("done"), 400); return 100; }
        return p + 5;
      });
    }, 80);
    return () => clearInterval(id);
  }, [step]);

  const connectWallet = () => { setShowWallets(false); setStep("connecting"); };

  return (
    <main style={{
      minHeight: "100vh", background: "#0e0e0e", color: "#fff",
      fontFamily: "'Space Grotesk', sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: "#cafd00", fontWeight: 700, fontSize: 15, letterSpacing: 2 }}>MATCHSATS</span>
        {step !== "boot" && (
          <button onClick={() => router.push("/matches")} style={{
            background: "none", border: "none", color: "#777",
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 13,
            cursor: "pointer", textDecoration: "underline", textDecorationColor: "#444",
          }}>explore first →</button>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>

        {/* BOOT */}
        {step === "boot" && (
          <div style={{ width: "100%", maxWidth: 500 }}>
            <div ref={termRef} style={{
              background: "#060606", border: "1px solid #1a1a18", borderRadius: 18,
              padding: "20px 24px", fontFamily: "'Courier New', monospace",
              fontSize: 13, lineHeight: 2, maxHeight: 260, overflowY: "auto", scrollbarWidth: "none",
            }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                {["#ff5f57","#ffbd2e","#28c840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                <span style={{ color: "#555", fontSize: 11, marginLeft: 8, letterSpacing: 1 }}>matchsats — social_sync</span>
              </div>
              {bootLines.map((line, i) => (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <span style={{ color: "#9d7bb8", flexShrink: 0 }}>›</span>
                  <span style={{ color: line.color ?? "#6a9a6a" }}>{line.text}</span>
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 2 }}>
                <span style={{ color: "#9d7bb8" }}>›</span>
                <span style={{ display: "inline-block", width: 8, height: 14, background: "#cafd00", opacity: cursor ? 1 : 0, transition: "opacity 0.1s" }} />
              </div>
            </div>
          </div>
        )}

        {/* SCAN */}
        {step === "scan" && (
          <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p style={{ color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: 3, margin: "0 0 22px" }}>LNURL — AUTH</p>
            <h1 style={{ fontSize: "clamp(28px, 8vw, 48px)", fontWeight: 900, textAlign: "center", lineHeight: 1.05, margin: "0 0 6px" }}>Welcome to</h1>
            <h1 style={{ fontSize: "clamp(28px, 8vw, 48px)", fontWeight: 900, textAlign: "center", color: "#cafd00", margin: "0 0 32px" }}>the Network.</h1>

            <div style={{
              background: "#141412", border: "1px solid #1e1e1c", borderRadius: 22,
              padding: "28px", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 20, width: "100%", marginBottom: 12,
              boxSizing: "border-box",
            }}>
              <QRCode />
              <p style={{ color: "#aaa", fontSize: 13, margin: 0, textAlign: "center" }}>Scan with your Lightning wallet</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                <div style={{ flex: 1, height: 1, background: "#2a2a28" }} />
                <span style={{ color: "#555", fontSize: 11, letterSpacing: 2 }}>OR</span>
                <div style={{ flex: 1, height: 1, background: "#2a2a28" }} />
              </div>

              {!showWallets ? (
                <button onClick={() => setShowWallets(true)} style={{
                  width: "100%", padding: "14px", borderRadius: 99, background: "#cafd00",
                  border: "none", color: "#1a2200", fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 800, fontSize: 14, cursor: "pointer", letterSpacing: 1.5,
                  boxShadow: "0 0 28px rgba(202,253,0,0.25)",
                }}>CONNECT WALLET ⚡</button>
              ) : (
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ color: "#888", fontSize: 11, fontWeight: 700, letterSpacing: 2, margin: "0 0 4px" }}>CHOOSE YOUR WEAPON</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {WALLET_OPTIONS.map(w => (
                      <button key={w.id} onClick={connectWallet} style={{
                        padding: "10px 14px", borderRadius: 12, border: "1px solid #2a2a28",
                        background: "#0e0e0e", color: "#aaa", fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600, fontSize: 13, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#cafd0060"; e.currentTarget.style.color = "#cafd00"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a28"; e.currentTarget.style.color = "#aaa"; }}
                      >
                        <span>{w.icon}</span><span>{w.name}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShowWallets(false)} style={{
                    background: "none", border: "none", color: "#666",
                    fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, cursor: "pointer", marginTop: 4,
                  }}>← back</button>
                </div>
              )}
            </div>
            <p style={{ color: "#555", fontSize: 11, textAlign: "center" }}>no email · no password · no nonsense</p>
          </div>
        )}

        {/* CONNECTING */}
        {step === "connecting" && (
          <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
            <div style={{ position: "relative", width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ position: "absolute", width: 28+i*16, height: 28+i*16, borderRadius: "50%", border: "1px solid #cafd00", opacity: 0.1/i, animation: `lp ${1+i*0.4}s ease-in-out infinite` }} />
              ))}
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#cafd0018", border: "2px solid #cafd00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 0 20px rgba(202,253,0,0.3)" }}>⚡</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Authenticating</h2>
              <p style={{ color: "#aaa", fontSize: 14, margin: 0 }}>
                {progress < 35 ? "shaking hands with your wallet..." : progress < 70 ? "verifying you're not a bot 🤖" : "almost there, hold tight ⚡"}
              </p>
            </div>
            <div style={{ width: "100%", background: "#1a1a18", borderRadius: 99, height: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 99, background: "#cafd00", width: `${progress}%`, transition: "width 0.08s linear", boxShadow: "0 0 10px rgba(202,253,0,0.5)" }} />
            </div>
            <style>{`@keyframes lp{0%,100%{transform:scale(1);opacity:0.06}50%{transform:scale(1.1);opacity:0.15}}`}</style>
          </div>
        )}

        {/* DONE */}
        {step === "done" && (
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#cafd0015", border: "2px solid #cafd00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 0 40px rgba(202,253,0,0.25)" }}>⚡</div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "clamp(26px, 7vw, 38px)", fontWeight: 900, margin: "0 0 8px" }}>you're in.</h2>
              <p style={{ color: "#cafd00", fontSize: 14, fontWeight: 700, margin: "0 0 6px" }}>identity verified</p>
              <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>don't ghost anyone. sats are watching. 👀</p>
            </div>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => router.push("/profile")} style={{
                width: "100%", padding: "15px", borderRadius: 99, background: "#cafd00",
                border: "none", color: "#1a2200", fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800, fontSize: 14, cursor: "pointer", letterSpacing: 1.5,
                boxShadow: "0 0 28px rgba(202,253,0,0.25)",
              }}>INITIALIZE SYNC →</button>
              <button onClick={() => router.push("/matches")} style={{
                width: "100%", padding: "14px", borderRadius: 99, background: "transparent",
                border: "1px solid #333", color: "#888", fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.18s",
              }}
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