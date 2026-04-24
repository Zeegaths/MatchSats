"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const chars = "アイウエカキ01⚡₿BTC10";
    const cols = Math.floor(c.width / 18);
    const drops = Array(cols).fill(1);
    const draw = () => {
      ctx.fillStyle = "rgba(14,14,14,0.07)"; ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = "rgba(202,253,0,0.055)"; ctx.font = "12px Courier New";
      drops.forEach((y, i) => {
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 18, y * 18);
        if (y * 18 > c.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };
    const id = setInterval(draw, 70);
    return () => { clearInterval(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

function NeuralSun({ size = 300 }: { size?: number }) {
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <div style={{ position: "absolute", width: size, height: size, borderRadius: "50%", border: "1px dashed rgba(202,253,0,0.07)", animation: "nspin 40s linear infinite" }} />
      <div style={{ position: "absolute", width: size * 0.83, height: size * 0.83, borderRadius: "50%", border: "1.5px solid rgba(157,123,184,0.35)", animation: "nspin 25s linear infinite reverse", boxShadow: "0 0 20px rgba(157,123,184,0.15)" }} />
      <div style={{ position: "absolute", width: size * 0.78, height: size * 0.78, borderRadius: "50%", boxShadow: "0 0 0 3px #cafd00, 0 0 35px 10px rgba(202,253,0,0.55), 0 0 90px 25px rgba(202,253,0,0.12)", animation: "nglow 2.5s ease-in-out infinite" }} />
      <div style={{ width: size * 0.73, height: size * 0.73, borderRadius: "50%", background: "radial-gradient(circle at 38% 38%, #181808, #060606)", border: "1px solid rgba(202,253,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "repeating-conic-gradient(rgba(202,253,0,0.025) 0deg 2deg, transparent 2deg 7deg)" }} />
        <svg width={size * 0.22} height={size * 0.25} viewBox="0 0 44 50" fill="none" style={{ position: "relative", zIndex: 1 }}>
          <path d="M26 4L8 28H22L16 46L38 20H24L26 4Z" fill="#cafd00" style={{ filter: "drop-shadow(0 0 10px rgba(202,253,0,0.9))" }} />
        </svg>
        <div style={{ position: "absolute", bottom: "11%", left: "50%", transform: "translateX(-50%)", background: "rgba(10,10,10,0.9)", border: "1px solid rgba(202,253,0,0.3)", borderRadius: 99, padding: "2px 9px", whiteSpace: "nowrap" }}>
          <span style={{ color: "#cafd00", fontSize: 7, fontWeight: 700, letterSpacing: 1 }}>PULSE INTEGRITY: 99.98%</span>
        </div>
      </div>
      <div style={{ position: "absolute", width: size * 0.84, height: size * 0.84, borderRadius: "50%", border: "1px solid rgba(202,253,0,0.12)", animation: "nping 2.5s ease-out infinite" }} />
      <div style={{ position: "absolute", width: size * 0.72, height: size * 0.72, borderRadius: "50%", border: "1px solid rgba(202,253,0,0.08)", animation: "nping 2.5s ease-out infinite 0.7s" }} />
      <div style={{ position: "absolute", top: "2%", right: "-2%", background: "rgba(18,18,14,0.93)", backdropFilter: "blur(8px)", border: "1px solid rgba(73,72,71,0.4)", borderRadius: 20, padding: "6px 12px", display: "flex", alignItems: "center", gap: 7, zIndex: 3, whiteSpace: "nowrap" }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#cafd00", boxShadow: "0 0 6px #cafd00" }} />
        <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>LIVE FLOW: 2.4 BTC/S</span>
      </div>
      <div style={{ position: "absolute", bottom: "10%", left: "-4%", background: "rgba(157,123,184,0.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(157,123,184,0.5)", borderRadius: 20, padding: "6px 12px", display: "flex", alignItems: "center", gap: 7, zIndex: 3, whiteSpace: "nowrap" }}>
        <span style={{ color: "#c4a0e8", fontSize: 11 }}>◈</span>
        <span style={{ color: "#c4a0e8", fontSize: 10, fontWeight: 700 }}>ACTIVE NODES: 14,209</span>
      </div>
      <style>{`
        @keyframes nspin{to{transform:rotate(360deg)}}
        @keyframes nping{0%{transform:scale(1);opacity:0.4}100%{transform:scale(1.3);opacity:0}}
        @keyframes nglow{0%,100%{box-shadow:0 0 0 3px #cafd00,0 0 35px 10px rgba(202,253,0,0.55),0 0 90px 25px rgba(202,253,0,0.12)}50%{box-shadow:0 0 0 3px #cafd00,0 0 55px 16px rgba(202,253,0,0.75),0 0 110px 35px rgba(202,253,0,0.2)}}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes fu{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

function Header() {
  const router = useRouter();
  const mobile = useIsMobile();
  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(14,14,14,0.88)", backdropFilter: "blur(16px)", borderBottom: "1px solid #111110", padding: mobile ? "0.9rem 1.25rem" : "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ color: "#cafd00", fontWeight: 700, fontSize: 15, letterSpacing: 2 }}>MATCHSATS</span>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {!mobile && (
          <button onClick={() => router.push("/matches")} style={{ padding: "9px 20px", borderRadius: 99, background: "transparent", border: "1px solid #222", color: "#555", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 1, transition: "all 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.color = "#555"; }}
          >EXPLORE</button>
        )}
        <button onClick={() => router.push("/login")} style={{ padding: mobile ? "8px 16px" : "9px 22px", borderRadius: 99, background: "#cafd00", border: "none", color: "#1a2200", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 12, cursor: "pointer", letterSpacing: 1, boxShadow: "0 0 20px rgba(202,253,0,0.2)" }}>
          {mobile ? "JOIN" : "FIND YOUR PEOPLE"}
        </button>
      </div>
    </header>
  );
}

function Hero() {
  const router = useRouter();
  const mobile = useIsMobile();
  const orbSize = mobile ? 220 : 300;

  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: mobile ? "90px 20px 60px" : "100px 40px 60px", overflow: "hidden" }}>
      <MatrixRain />
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(202,253,0,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "50%", right: "10%", transform: "translateY(-50%)", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(157,123,184,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: mobile ? "column" : "row", gap: mobile ? 48 : 80, alignItems: "center", maxWidth: 1280, width: "100%" }}>
        <div style={{ flex: 1, textAlign: mobile ? "center" : "left", animation: "fu 0.6s ease both" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(157,123,184,0.12)", border: "1px solid rgba(157,123,184,0.4)", borderRadius: 99, padding: "5px 14px", marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#9d7bb8", boxShadow: "0 0 8px #9d7bb8" }} />
            <span style={{ color: "#c4a0e8", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>PROOF OF PRESENCE</span>
          </div>

          <h1 style={{ fontSize: mobile ? "clamp(40px, 12vw, 72px)" : "clamp(52px, 7vw, 96px)", fontWeight: 900, lineHeight: 1.05, margin: "0 0 16px" }}>
            The right room<br /><span style={{ color: "#cafd00" }}>changes everything.</span>
          </h1>

          <p style={{ color: "#aaa", fontSize: mobile ? 15 : 17, lineHeight: 1.8, margin: "0 0 36px", maxWidth: mobile ? "100%" : 440 }}>
            Meet the people who actually move things forward —
            designers, founders, storytellers, builders.<br />
            <span style={{ color: "#777" }}>AI matches you by what matters. Sats make sure everyone shows up.</span>
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: mobile ? "center" : "flex-start" }}>
            <button onClick={() => router.push("/login")} style={{ padding: "15px 30px", borderRadius: 99, background: "#cafd00", border: "none", color: "#1a2200", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer", letterSpacing: 2, boxShadow: "0 0 36px rgba(202,253,0,0.3)", textTransform: "uppercase", transition: "opacity 0.18s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >FIND YOUR PEOPLE</button>
            <button onClick={() => router.push("/matches")} style={{ padding: "15px 30px", borderRadius: 99, background: "transparent", border: "1px solid #2a2a28", color: "#666", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: 2, transition: "all 0.2s", textTransform: "uppercase" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a28"; e.currentTarget.style.color = "#666"; }}
            >EXPLORE</button>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", flexShrink: 0, animation: "fu 0.8s ease both 0.15s" }}>
          <NeuralSun size={orbSize} />
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const text = "THE GRID NEVER SLEEPS • SHOW UP, GET REFUNDED • REAL CONNECTIONS, REAL STAKES • INTENTIONAL NETWORKS • MEET YOUR PEOPLE • ";
  return (
    <div style={{ borderTop: "1px solid #111110", borderBottom: "1px solid #111110", overflow: "hidden", padding: "16px 0" }}>
      <div style={{ display: "flex", animation: "marquee 28s linear infinite", width: "max-content" }}>
        {[text, text, text].map((t, i) => (
          <span key={i} style={{ color: "rgba(255,255,255,0.045)", fontWeight: 900, fontSize: "clamp(56px,9vw,110px)", letterSpacing: -3, textTransform: "uppercase", whiteSpace: "nowrap" }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function BentoGrid() {
  const mobile = useIsMobile();
  return (
    <section style={{ padding: mobile ? "48px 20px" : "64px 40px", maxWidth: 1280, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: 14 }}>
        {/* Glass stat card */}
        <div style={{ borderRadius: 24, padding: "36px", minHeight: 180, background: "linear-gradient(135deg, #141412 60%, #1a1020 100%)", border: "1px solid rgba(157,123,184,0.15)", backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(157,123,184,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(202,253,0,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
            <svg width="28" height="28" viewBox="0 0 36 36"><path d="M18 2L34 11V25L18 34L2 25V11L18 2Z" fill="none" stroke="#9d7bb8" strokeWidth="1.5"/><path d="M21 10L13 20H19L15 30L27 18H20L21 10Z" fill="#cafd00"/></svg>
            <span style={{ color: "#9d7bb8", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>SHOW RATE</span>
          </div>
          <div style={{ position: "relative" }}>
            <p style={{ color: "#cafd00", fontWeight: 900, fontSize: mobile ? 52 : 64, margin: "0 0 4px", lineHeight: 1, textShadow: "0 0 30px rgba(202,253,0,0.3)" }}>99.9%</p>
            <p style={{ color: "#9d7bb8", fontSize: 11, margin: 0, letterSpacing: 1 }}>people actually show up · imagine that</p>
          </div>
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(157,123,184,0.3), transparent)" }} />
        </div>

        {/* No-shows solved */}
        <div style={{ borderRadius: 24, background: "#141412", border: "1px solid #1e1e1c", padding: "36px" }}>
          <h3 style={{ color: "#fff", fontWeight: 900, fontSize: 24, margin: "0 0 12px", lineHeight: 1.2 }}>No more<br />no-shows.</h3>
          <p style={{ color: "#bbb", fontSize: 14, lineHeight: 1.75, margin: "0 0 20px" }}>Both sides put skin in the game before the meeting. Show up and get fully refunded. Simple as that.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["SHOW UP ✓", "GET REFUNDED ✓"].map(t => (
              <span key={t} style={{ border: "1px solid #3a3a38", borderRadius: 99, padding: "5px 12px", color: "#888", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Ghost rate */}
        <div style={{ borderRadius: 24, background: "#0e0e0e", border: "1px solid #1a1a18", padding: "36px" }}>
          <p style={{ color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: 3, margin: "0 0 12px" }}>GHOST RATE</p>
          <p style={{ color: "#cafd00", fontWeight: 900, fontSize: mobile ? 52 : 60, margin: "0 0 8px", lineHeight: 1 }}>0%</p>
          <p style={{ color: "#bbb", fontSize: 13, margin: 0, lineHeight: 1.6 }}>turns out accountability is a great feature.</p>
        </div>

        {/* Matched by what matters */}
        <div style={{ borderRadius: 24, background: "#111110", border: "1px solid #1a1a18", padding: "36px", gridColumn: mobile ? "1" : "1 / span 3" } as React.CSSProperties}>
          <h3 style={{ color: "#cafd00", fontWeight: 900, fontSize: 26, margin: "0 0 12px" }}>Matched by what actually matters.</h3>
          <p style={{ color: "#bbb", fontSize: 14, lineHeight: 1.75, margin: "0 0 20px", maxWidth: 560 }}>Not job titles. Not badge colours. Our matching reads what you're building, what you need, and who's in the room — then gives you your top 3 with a real reason why.</p>
          <div style={{ maxWidth: 400, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ height: 6, background: "#1e1e1c", borderRadius: 99, overflow: "hidden" }}><div style={{ height: "100%", width: "75%", background: "#cafd00", borderRadius: 99, boxShadow: "0 0 8px rgba(202,253,0,0.35)" }} /></div>
            <div style={{ height: 6, background: "#1e1e1c", borderRadius: 99, overflow: "hidden" }}><div style={{ height: "100%", width: "50%", background: "#9d7bb8", borderRadius: 99 }} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

const PERSONALITIES = [
  {
    tag: "THE MAKER",
    headline: "You build things\npeople actually use.",
    sub: "Developer, designer, or somewhere in between — you make things real. We'll find the people who need exactly what you make.",
    bg: "#0e0e0a", headColor: "#fff", subColor: "#bbb", tagColor: "#cafd00", tagBg: "rgba(202,253,0,0.12)", border: "rgba(202,253,0,0.3)", glow: "#cafd00", glass: true,
  },
  {
    tag: "THE CONNECTOR",
    headline: "You know everyone\nworth knowing.",
    sub: "Your superpower is introductions. MatchSats makes sure those intros actually turn into something that lasts.",
    bg: "#0c0a10", headColor: "#fff", subColor: "#bbb", tagColor: "#9d7bb8", tagBg: "rgba(157,123,184,0.15)", border: "rgba(157,123,184,0.3)", glow: "#9d7bb8",
  },
  {
    tag: "THE CAPITAL",
    headline: "You back the things\nthat matter.",
    sub: "Whether you write cheques, open doors, or bring resources — you're looking for the 1% worth betting on. So are they.",
    bg: "#100808", headColor: "#fff", subColor: "#bbb", tagColor: "#ff8080", tagBg: "rgba(255,68,68,0.12)", border: "rgba(255,68,68,0.25)", glow: "#ff4444",
  },
  {
    tag: "THE CATALYST",
    headline: "You make rooms\ncome alive.",
    sub: "Community builder, marketer, storyteller — you're the reason people remember a conference. We need more of you in the room.",
    bg: "#0a0e06", headColor: "#fff", subColor: "#bbb", tagColor: "#cafd00", tagBg: "rgba(202,253,0,0.1)", border: "rgba(202,253,0,0.2)", glow: "#cafd00",
  },
];

function PersonalityGrid() {
  const router = useRouter();
  const mobile = useIsMobile();
  return (
    <section style={{ padding: mobile ? "48px 20px" : "64px 40px", maxWidth: 1280, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <p style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 4, margin: "0 0 14px" }}>EVERYONE'S WELCOME</p>
        <h2 style={{ fontSize: mobile ? "clamp(30px,8vw,48px)" : "clamp(36px,5vw,64px)", fontWeight: 900, lineHeight: 1.05, margin: 0, textTransform: "uppercase" }}>
          What kind of person<br /><span style={{ color: "#cafd00" }}>are you?</span>
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(2, 1fr)", gap: 14 }}>
        {PERSONALITIES.map((p, i) => (
          <div key={p.tag} onClick={() => router.push("/login")} style={{
            borderRadius: 24, background: p.bg,
            border: `1px solid ${p.border ?? "transparent"}`,
            padding: "32px 28px", position: "relative", overflow: "hidden", cursor: "pointer",
            animation: "fu 0.5s ease both", animationDelay: `${i * 0.08}s`,
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            boxShadow: `0 0 0 1px ${(p as any).glow ?? "#cafd00"}18, inset 0 0 60px rgba(0,0,0,0.4)`,
            backdropFilter: "blur(20px)",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px ${(p as any).glow ?? "#cafd00"}40, 0 0 30px ${(p as any).glow ?? "#cafd00"}15`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 0 0 1px ${(p as any).glow ?? "#cafd00"}18, inset 0 0 60px rgba(0,0,0,0.4)`; }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${(p as any).glow ?? "#cafd00"}, transparent)`, opacity: 0.6, pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: `radial-gradient(circle, ${(p as any).glow ?? "#cafd00"}20 0%, transparent 70%)`, pointerEvents: "none" }} />
            {(p as any).glass && (
              <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 10px)", pointerEvents: "none" }} />
            )}
            <div style={{ position: "absolute", top: 20, right: 20, width: 70, height: 70, borderRadius: "50%", border: `1px solid ${p.tagColor}25`, boxShadow: `0 0 20px ${p.tagColor}18`, background: `radial-gradient(circle, ${p.tagColor}06 0%, transparent 70%)` }} />
            <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: p.tagColor, background: p.tagBg, border: `1px solid ${p.tagColor}30`, padding: "4px 12px", borderRadius: 99, marginBottom: 18 }}>{p.tag}</span>
            <h3 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, color: p.headColor, margin: "0 0 12px", lineHeight: 1.2, whiteSpace: "pre-line" }}>{p.headline}</h3>
            <p style={{ color: p.subColor, fontSize: 15, lineHeight: 1.7, margin: "0 0 24px" }}>{p.sub}</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${p.tagColor}15`, border: `1px solid ${p.tagColor}30`, borderRadius: 99, padding: "8px 16px" }}>
              <span style={{ color: p.tagColor, fontWeight: 800, fontSize: 11, letterSpacing: 1 }}>FIND MY MATCH →</span>
            </div>
            <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: p.tagColor, boxShadow: `0 0 4px ${p.tagColor}` }} />
              <span style={{ color: p.tagColor, fontSize: 9, fontWeight: 700, letterSpacing: 1, opacity: 0.85 }}>ACTIVE · 1,421 PEOPLE IN THE NETWORK</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTASection() {
  const router = useRouter();
  const mobile = useIsMobile();
  const [ln, setLn] = useState("");
  return (
    <section style={{ padding: mobile ? "32px 20px 64px" : "40px 40px 80px", display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 660, width: "100%", background: "#111110", border: "1px solid #1a1a18", borderRadius: 28, padding: mobile ? "36px 24px" : "60px 48px", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", top: 1, left: "15%", right: "15%", height: 1, background: "linear-gradient(90deg, transparent, #cafd00, transparent)" }} />
        <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(202,253,0,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <h2 style={{ fontSize: mobile ? "clamp(26px,8vw,40px)" : "clamp(28px,5vw,50px)", fontWeight: 900, margin: "0 0 14px", lineHeight: 1.1 }}>
          Your next great<br />collaboration is waiting.
        </h2>
        <p style={{ color: "#bbb", fontSize: 15, margin: "0 0 32px", lineHeight: 1.75 }}>
          Scan in at your next conference.<br />
          Get matched, meet intentionally, build something real.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <input value={ln} onChange={e => setLn(e.target.value)} placeholder="your@lightning.address" style={{ background: "#1a1a18", border: "1px solid #2a2a28", borderRadius: 99, color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, padding: "13px 20px", outline: "none", width: mobile ? "100%" : 240, transition: "border-color 0.18s", boxSizing: "border-box" }}
            onFocus={e => (e.target.style.borderColor = "#cafd0060")}
            onBlur={e => (e.target.style.borderColor = "#2a2a28")}
          />
          <button onClick={() => router.push("/login")} style={{ padding: "13px 26px", borderRadius: 99, background: "#cafd00", border: "none", color: "#1a2200", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer", letterSpacing: 1.5, boxShadow: "0 0 28px rgba(202,253,0,0.25)", width: mobile ? "100%" : "auto" }}>
            LET'S GO →
          </button>
        </div>
        <p style={{ color: "#555", fontSize: 12, margin: "16px 0 0" }}>No account needed · Scan in with your Lightning wallet · Free to explore</p>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const mobile = useIsMobile();
  return (
    <div style={{ background: "#0e0e0e", minHeight: "100vh", color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
      <Header />
      <Hero />
      <Marquee />
      <BentoGrid />
      <PersonalityGrid />
      <CTASection />
      <footer style={{ borderTop: "1px solid #1a1a18", padding: mobile ? "24px 20px" : "28px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <span style={{ color: "#cafd00", fontWeight: 700, fontSize: 14, letterSpacing: 2 }}>MATCHSATS</span>
        <span style={{ color: "#aaa", fontSize: 12 }}>built in africa, for africa · powered by lightning ⚡</span>
        <span style={{ color: "#666", fontSize: 11, fontFamily: "monospace" }}>v0.1.0-alpha</span>
      </footer>
    </div>
  );
}