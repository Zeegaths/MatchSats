"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Step = "boot" | "username" | "done";

const BOOT_LINES = [
  { text: "well hello 👀",                                              delay: 0              },
  { text: "you actually showed up. we respect that.",                   delay: 1000           },
  { text: "there are people here you genuinely need to meet.",          delay: 2100, color: "#cafd00" },
  { text: "let's find them.",                                           delay: 3100, color: "#cafd00" },
];

const BOOT_DURATION = 4200;

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("boot");
  const [bootLines, setBootLines] = useState<typeof BOOT_LINES>([]);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [loading, setLoading] = useState(false);
  const bootedRef = useRef(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetch("/api/auth/me").then(r=>r.json()).then(d=>{ if(d.loggedIn) router.replace("/matches"); }).catch(()=>{}); }, []);
  // Auto-redirect if already logged in
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.loggedIn) router.replace("/matches");
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    BOOT_LINES.forEach(line => {
      setTimeout(() => setBootLines(prev => [...prev, line]), line.delay);
    });
    setTimeout(() => {
      setStep("username");
      setTimeout(() => usernameRef.current?.focus(), 100);
    }, BOOT_DURATION);
  }, []);

  const handleUsernameSubmit = async () => {
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (clean.length < 2) { setUsernameError("needs to be at least 2 characters"); return; }
    if (clean.length > 20) { setUsernameError("max 20 characters"); return; }
    setLoading(true);
    setUsernameError("");
    const res = await fetch("/api/auth/username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: clean }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setUsernameError(data.error ?? "something went wrong, try again");
      return;
    }
    setStep("done");
    setTimeout(() => router.push("/profile"), 1400);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#111110", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        @keyframes dot    { 0%,80%,100%{opacity:0.2}40%{opacity:1} }
        @keyframes lp     { 0%,100%{transform:scale(1);opacity:0.06}50%{transform:scale(1.1);opacity:0.15} }
        input::placeholder { color: #888; }
        input:focus { outline: none; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "1.25rem 1.5rem" }}>
        <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: -1 }}>
          <span style={{ color: "#cafd00" }}>1</span><span style={{ color: "#9d7bb8" }}>%</span>
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>

        {/* BOOT */}
        {step === "boot" && (
          <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: 52 }}>
            <div style={{ position: "relative", width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ position: "absolute", width: 28+i*16, height: 28+i*16, borderRadius: "50%", border: "1px solid #cafd00", opacity: 0.08/i, animation: `lp ${1+i*0.5}s ease-in-out infinite` }} />
              ))}
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#cafd0018", border: "2px solid #cafd00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 0 24px rgba(202,253,0,0.3)" }}>⚡</div>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 20, minHeight: 160 }}>
              {bootLines.map((line, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, animation: "fadeUp 0.5s ease both" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: line.color ?? "#555", flexShrink: 0, marginTop: 8, boxShadow: line.color ? `0 0 6px ${line.color}` : "none" }} />
                  <p style={{ color: line.color ?? "#fff", fontSize: 17, fontWeight: 500, margin: 0, lineHeight: 1.55 }}>{line.text}</p>
                </div>
              ))}
              {bootLines.length < BOOT_LINES.length && (
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#222", flexShrink: 0 }} />
                  <div style={{ display: "flex", gap: 6 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#333", animation: `dot 1.4s ease-in-out ${i*0.25}s infinite` }} />)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* USERNAME */}
        {step === "username" && (
          <div style={{ width: "100%", maxWidth: 420, animation: "fadeUp 0.5s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#cafd0015", border: "2px solid #cafd00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 20px", boxShadow: "0 0 20px rgba(202,253,0,0.15)" }}>⚡</div>
              <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 10px", letterSpacing: -0.5 }}>what should we call you?</h1>
              <p style={{ color: "#bbb", fontSize: 15, margin: 0, lineHeight: 1.6 }}>this is how people at the event will find you.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "#1a1a18", border: `1px solid ${usernameError ? "#ff6666" : username ? "#cafd0050" : "#1e1e1c"}`, borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, transition: "border-color 0.18s" }}>
                <span style={{ color: "#aaa", fontSize: 18, fontWeight: 700 }}>@</span>
                <input
                  ref={usernameRef}
                  value={username}
                  onChange={e => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")); setUsernameError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleUsernameSubmit()}
                  placeholder="yourname"
                  maxLength={20}
                  style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700 }}
                />
                {username.length >= 2 && <span style={{ color: "#cafd00", fontSize: 16 }}>✓</span>}
              </div>

              {usernameError && (
                <p style={{ color: "#ff6666", fontSize: 13, margin: "0 4px", animation: "fadeUp 0.2s ease" }}>{usernameError}</p>
              )}

              <p style={{ color: "#999", fontSize: 13, margin: "0 4px" }}>letters, numbers, underscores. keep it simple.</p>

              <button
                onClick={handleUsernameSubmit}
                disabled={loading || username.length < 2}
                style={{ width: "100%", padding: "16px", borderRadius: 99, background: username.length >= 2 ? "#cafd00" : "#141412", border: "none", color: username.length >= 2 ? "#1a2200" : "#333", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 15, cursor: username.length >= 2 ? "pointer" : "not-allowed", transition: "all 0.2s", boxShadow: username.length >= 2 ? "0 0 24px rgba(202,253,0,0.18)" : "none" }}
              >
                {loading ? "one sec..." : "let's go ⚡"}
              </button>
            </div>
          </div>
        )}

        {/* DONE */}
        {step === "done" && (
          <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, animation: "fadeUp 0.5s ease" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#cafd0015", border: "2px solid #cafd00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: "0 0 40px rgba(202,253,0,0.2)" }}>⚡</div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: 30, fontWeight: 900, margin: "0 0 10px", letterSpacing: -0.5 }}>you're in 🎉</h2>
              <p style={{ color: "#cafd00", fontSize: 15, fontWeight: 700, margin: "0 0 6px" }}>@{username}</p>
              <p style={{ color: "#bbb", fontSize: 14, margin: 0 }}>setting up your space...</p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

