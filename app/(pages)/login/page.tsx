"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Step = "boot" | "input" | "otp" | "done";
type Method = "email" | "username";

const BOOT_LINES = [
  { text: "well hello 👀",                                           delay: 0    },
  { text: "you actually showed up. we respect that.",               delay: 900  },
  { text: "there are people here you genuinely need to meet.",      delay: 1900, color: "#cafd00" },
  { text: "let's find them.",                                       delay: 2800, color: "#cafd00" },
];
const BOOT_DURATION = 3800;

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep]           = useState<Step>("boot");
  const [method, setMethod]       = useState<Method>("email");
  const [bootLines, setBootLines] = useState<typeof BOOT_LINES>([]);
  const [email, setEmail]         = useState("");
  const [otp, setOtp]             = useState(["", "", "", "", "", ""]);
  const [username, setUsername]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [sentTo, setSentTo]       = useState("");
  const bootedRef                 = useRef(false);
  const inputRef                  = useRef<HTMLInputElement>(null);
  const otpRefs                   = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if already logged in
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.loggedIn) router.replace("/matches");
    }).catch(() => {});
  }, []);

  // Boot animation
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    BOOT_LINES.forEach(line => {
      setTimeout(() => setBootLines(prev => [...prev, line]), line.delay);
    });
    setTimeout(() => {
      setStep("input");
      setTimeout(() => inputRef.current?.focus(), 100);
    }, BOOT_DURATION);
  }, []);

  // ── Send OTP ──────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    if (!email.includes("@")) { setError("enter a valid email"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) { setError(data.error ?? "couldn't send email — check your connection"); return; }
      setSentTo(email);
      setStep("otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("couldn't send email — try again");
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError("enter the full 6-digit code"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sentTo, code }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) { setError(data.error ?? "invalid code, try again"); return; }
      setStep("done");
      setTimeout(() => router.push(data.hasProfile ? "/matches" : "/profile"), 1200);
    } catch {
      setError("something went wrong, try again");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handling ────────────────────────────────────────────
  const handleOtpChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
    if (next.every(d => d !== "")) {
      // auto-submit when all filled
      setTimeout(() => {
        const code = next.join("");
        if (code.length === 6) handleVerifyOTPDirect(code);
      }, 80);
    }
  };

  const handleVerifyOTPDirect = async (code: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sentTo, code }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) { setError(data.error ?? "invalid code"); return; }
      setStep("done");
      setTimeout(() => router.push(data.hasProfile ? "/matches" : "/profile"), 1200);
    } catch {
      setError("something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "Enter") handleVerifyOTP();
  };

  // ── Username fallback ─────────────────────────────────────────────
  const handleUsernameSubmit = async () => {
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (clean.length < 2) { setError("needs to be at least 2 characters"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: clean }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "something went wrong"); return; }
    setStep("done");
    setTimeout(() => router.push("/profile"), 1200);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#111110", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        @keyframes dot    { 0%,80%,100%{opacity:0.2}40%{opacity:1} }
        @keyframes lp     { 0%,100%{transform:scale(1);opacity:0.06}50%{transform:scale(1.1);opacity:0.15} }
        @keyframes pulse  { 0%,100%{opacity:0.4}50%{opacity:1} }
        input::placeholder { color: #555; }
        input:focus { outline: none; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "1.25rem 1.5rem" }}>
        <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: -1 }}>
          <span style={{ color: "#cafd00" }}>1</span><span style={{ color: "#9d7bb8" }}>%</span>
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>

        {/* ── BOOT ── */}
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

        {/* ── INPUT (email or username) ── */}
        {step === "input" && (
          <div style={{ width: "100%", maxWidth: 420, animation: "fadeUp 0.5s ease" }}>

            {/* Icon */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#cafd0015", border: "2px solid #cafd00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 18px", boxShadow: "0 0 24px rgba(202,253,0,0.15)" }}>⚡</div>
              <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 8px", letterSpacing: -0.5 }}>
                {method === "email" ? "what's your email?" : "what should we call you?"}
              </h1>
              <p style={{ color: "#666", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                {method === "email"
                  ? "we'll send you a one-time code to sign in"
                  : "this is how people at the event will find you"}
              </p>
            </div>

            {/* Method tabs */}
            <div style={{ display: "flex", background: "#1a1a18", borderRadius: 12, padding: 4, marginBottom: 20 }}>
              {(["email", "username"] as Method[]).map(m => (
                <button key={m} onClick={() => { setMethod(m); setError(""); }} style={{
                  flex: 1, padding: "9px", borderRadius: 9,
                  background: method === m ? "#cafd00" : "transparent",
                  border: "none", color: method === m ? "#1a2200" : "#555",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: 12, cursor: "pointer",
                  letterSpacing: 1, textTransform: "uppercase", transition: "all 0.18s",
                }}>{m === "email" ? "✉ Email" : "@ Username"}</button>
              ))}
            </div>

            {/* Email input */}
            {method === "email" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: "#1a1a18", border: `1px solid ${error ? "#ff6666" : email.includes("@") ? "#cafd0050" : "#1e1e1c"}`, borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, transition: "border-color 0.18s" }}>
                  <span style={{ color: "#555", fontSize: 16 }}>✉</span>
                  <input
                    ref={inputRef}
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleSendOTP()}
                    placeholder="you@example.com"
                    style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600 }}
                  />
                  {email.includes("@") && <span style={{ color: "#cafd00" }}>✓</span>}
                </div>
                {error && <p style={{ color: "#ff6666", fontSize: 13, margin: "0 4px" }}>{error}</p>}
                <button
                  onClick={handleSendOTP}
                  disabled={loading || !email.includes("@")}
                  style={{ width: "100%", padding: "15px", borderRadius: 99, background: email.includes("@") ? "#cafd00" : "#141412", border: "none", color: email.includes("@") ? "#1a2200" : "#333", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 15, cursor: email.includes("@") ? "pointer" : "not-allowed", transition: "all 0.2s", boxShadow: email.includes("@") ? "0 0 24px rgba(202,253,0,0.18)" : "none" }}
                >
                  {loading ? "sending..." : "send code ⚡"}
                </button>
              </div>
            )}

            {/* Username input */}
            {method === "username" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: "#1a1a18", border: `1px solid ${error ? "#ff6666" : username.length >= 2 ? "#cafd0050" : "#1e1e1c"}`, borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, transition: "border-color 0.18s" }}>
                  <span style={{ color: "#aaa", fontSize: 18, fontWeight: 700 }}>@</span>
                  <input
                    ref={inputRef}
                    value={username}
                    onChange={e => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")); setError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleUsernameSubmit()}
                    placeholder="yourname"
                    maxLength={20}
                    style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700 }}
                  />
                  {username.length >= 2 && <span style={{ color: "#cafd00" }}>✓</span>}
                </div>
                <p style={{ color: "#555", fontSize: 12, margin: "0 4px" }}>letters, numbers, underscores only</p>
                {error && <p style={{ color: "#ff6666", fontSize: 13, margin: "0 4px" }}>{error}</p>}
                <button
                  onClick={handleUsernameSubmit}
                  disabled={loading || username.length < 2}
                  style={{ width: "100%", padding: "15px", borderRadius: 99, background: username.length >= 2 ? "#cafd00" : "#141412", border: "none", color: username.length >= 2 ? "#1a2200" : "#333", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 15, cursor: username.length >= 2 ? "pointer" : "not-allowed", transition: "all 0.2s" }}
                >
                  {loading ? "one sec..." : "let's go ⚡"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── OTP ENTRY ── */}
        {step === "otp" && (
          <div style={{ width: "100%", maxWidth: 420, animation: "fadeUp 0.4s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#9d7bb820", border: "2px solid #9d7bb8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 18px" }}>✉</div>
              <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 10px", letterSpacing: -0.5 }}>check your email</h1>
              <p style={{ color: "#666", fontSize: 14, margin: 0, lineHeight: 1.7 }}>
                we sent a 6-digit code to<br />
                <span style={{ color: "#fff", fontWeight: 700 }}>{sentTo}</span>
              </p>
            </div>

            {/* 6-digit OTP boxes */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  style={{
                    width: 48, height: 58, textAlign: "center",
                    background: digit ? "#cafd0015" : "#1a1a18",
                    border: `2px solid ${digit ? "#cafd00" : "#2a2a28"}`,
                    borderRadius: 12, color: "#cafd00",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 24, fontWeight: 900,
                    outline: "none", transition: "all 0.15s",
                    caretColor: "#cafd00",
                  }}
                />
              ))}
            </div>

            {error && <p style={{ color: "#ff6666", fontSize: 13, textAlign: "center", margin: "0 0 14px" }}>{error}</p>}

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.join("").length < 6}
              style={{ width: "100%", padding: "15px", borderRadius: 99, background: otp.join("").length === 6 ? "#cafd00" : "#141412", border: "none", color: otp.join("").length === 6 ? "#1a2200" : "#333", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 15, cursor: otp.join("").length === 6 ? "pointer" : "not-allowed", transition: "all 0.2s", marginBottom: 16 }}
            >
              {loading ? "verifying..." : "verify ⚡"}
            </button>

            {/* Resend + change email */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => { setOtp(["","","","","",""]); setStep("input"); setError(""); }} style={{ background: "none", border: "none", color: "#444", fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, cursor: "pointer", padding: 0 }}>
                ← change email
              </button>
              <button onClick={handleSendOTP} disabled={loading} style={{ background: "none", border: "none", color: "#555", fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, cursor: "pointer", padding: 0 }}>
                resend code
              </button>
            </div>
          </div>
        )}

        {/* ── DONE ── */}
        {step === "done" && (
          <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, animation: "fadeUp 0.5s ease" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#cafd0015", border: "2px solid #cafd00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: "0 0 40px rgba(202,253,0,0.2)" }}>⚡</div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px", letterSpacing: -0.5 }}>you're in 🎉</h2>
              <p style={{ color: "#bbb", fontSize: 14, margin: 0 }}>taking you there now...</p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
