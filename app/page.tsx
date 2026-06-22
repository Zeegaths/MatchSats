"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// ── Matrix rain background ────────────────────────────────────────────
function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const chars = "01⚡₿10アイウカキ";
    const cols = Math.floor(c.width / 18);
    const drops = Array(cols).fill(1);
    const draw = () => {
      ctx.fillStyle = "rgba(10,10,10,0.08)"; ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = "rgba(202,253,0,0.04)"; ctx.font = "12px Courier New";
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

// ── Pulsing orb ───────────────────────────────────────────────────────
function Orb({ size = 280 }: { size?: number }) {
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <div style={{ position: "absolute", width: size, height: size, borderRadius: "50%", border: "1px dashed rgba(202,253,0,0.06)", animation: "spin 40s linear infinite" }} />
      <div style={{ position: "absolute", width: size * 0.83, height: size * 0.83, borderRadius: "50%", border: "1.5px solid rgba(157,123,184,0.3)", animation: "spin 25s linear infinite reverse", boxShadow: "0 0 20px rgba(157,123,184,0.12)" }} />
      <div style={{ position: "absolute", width: size * 0.78, height: size * 0.78, borderRadius: "50%", boxShadow: "0 0 0 3px #cafd00, 0 0 35px 10px rgba(202,253,0,0.5), 0 0 90px 25px rgba(202,253,0,0.1)", animation: "glow 2.5s ease-in-out infinite" }} />
      <div style={{ width: size * 0.72, height: size * 0.72, borderRadius: "50%", background: "radial-gradient(circle at 38% 38%, #181808, #060606)", border: "1px solid rgba(202,253,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2 }}>
        <span style={{ fontWeight: 900, fontSize: size * 0.32, letterSpacing: -4, lineHeight: 1, userSelect: "none" as const }}>
          <span style={{ color: "#cafd00", textShadow: "0 0 20px rgba(202,253,0,0.8)" }}>1</span><span style={{ color: "#9d7bb8", textShadow: "0 0 20px rgba(157,123,184,0.8)" }}>%</span>
        </span>
      </div>
      <div style={{ position: "absolute", width: size * 0.84, height: size * 0.84, borderRadius: "50%", border: "1px solid rgba(202,253,0,0.1)", animation: "ping 2.5s ease-out infinite" }} />
      <div style={{ position: "absolute", width: size * 0.72, height: size * 0.72, borderRadius: "50%", border: "1px solid rgba(202,253,0,0.06)", animation: "ping 2.5s ease-out infinite 0.7s" }} />
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes ping{0%{transform:scale(1);opacity:0.4}100%{transform:scale(1.3);opacity:0}}
        @keyframes glow{0%,100%{box-shadow:0 0 0 3px #cafd00,0 0 35px 10px rgba(202,253,0,0.5),0 0 90px 25px rgba(202,253,0,0.1)}50%{box-shadow:0 0 0 3px #cafd00,0 0 55px 16px rgba(202,253,0,0.7),0 0 110px 35px rgba(202,253,0,0.18)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse2{0%,100%{opacity:0.5;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
        @keyframes drop{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      `}</style>
    </div>
  );
}

// ── Mobile hook ───────────────────────────────────────────────────────
function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => { const c = () => setM(window.innerWidth < 768); c(); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  return m;
}

// ── Events data (real only) ───────────────────────────────────────────
const EVENTS = [
  { name: "Nairobi Bitcoin Conference", location: "ASK Dome, Nairobi", date: "June 24-26, 2025", spots: 48 },
];

// ── Nav ───────────────────────────────────────────────────────────────
function Nav() {
  const router = useRouter();
  const mobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 40); window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn); }, []);

  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: mobile ? "0 20px" : "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(10,10,10,0.96)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? "1px solid #1a1a18" : "none", transition: "all 0.3s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => window.scrollTo(0,0)}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#cafd0015", border: "1.5px solid #cafd00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>⚡</div>
      </div>

      {!mobile && (
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <a href="#how" style={{ color: "#777", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.18s", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.color="#fff"} onMouseLeave={e => e.currentTarget.style.color="#777"}>How It Works</a>
          <a href="#for-you" style={{ color: "#777", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.18s", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.color="#fff"} onMouseLeave={e => e.currentTarget.style.color="#777"}>For Everyone</a>
          <a href="#organizers" style={{ color: "#777", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.18s", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.color="#fff"} onMouseLeave={e => e.currentTarget.style.color="#777"}>Organizers</a>

          {/* Events dropdown */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowEvents(v => !v)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 99, border: `1px solid ${showEvents ? "#cafd0040" : "#2a2a28"}`, background: showEvents ? "#cafd0010" : "transparent", color: showEvents ? "#cafd00" : "#777", fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.18s" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#cafd00", animation: "pulse2 2s ease-in-out infinite" }} />
              Events
              <span style={{ fontSize: 9, opacity: 0.5 }}>{showEvents ? "▲" : "▼"}</span>
            </button>
            {showEvents && (
              <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, background: "#111110", border: "1px solid #1e1e1c", borderRadius: 16, padding: 8, minWidth: 320, boxShadow: "0 20px 60px rgba(0,0,0,0.8)", animation: "drop 0.2s ease", zIndex: 100 }}>
                {EVENTS.map((ev, i) => (
                  <div key={i} onClick={() => { setShowEvents(false); router.push("/login"); }} style={{ padding: "14px 16px", borderRadius: 10, cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(202,253,0,0.05)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: "#fff", margin: 0 }}>{ev.name}</p>
                      <span style={{ color: "#cafd00", fontSize: 11, fontWeight: 700 }}>{ev.spots} spots</span>
                    </div>
                    <p style={{ color: "#555", fontSize: 12, margin: 0 }}>{ev.location} · {ev.date}</p>
                  </div>
                ))}
                <div style={{ padding: "10px 16px 4px", borderTop: "1px solid #1a1a18", marginTop: 4 }}>
                  <p style={{ color: "#444", fontSize: 12, margin: 0 }}>Organising an event? <span style={{ color: "#9d7bb8", cursor: "pointer" }} onClick={() => { setShowEvents(false); router.push("/login"); }}>Set one up here.</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {!mobile && <button onClick={() => router.push("/login")} style={{ background: "none", border: "none", color: "#777", fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: "8px 16px", transition: "color 0.18s" }} onMouseEnter={e => e.currentTarget.style.color="#fff"} onMouseLeave={e => e.currentTarget.style.color="#777"}>Log in</button>}
        <button onClick={() => router.push("/login")} style={{ background: "#cafd00", border: "none", color: "#1a2200", fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 800, cursor: "pointer", padding: mobile ? "9px 16px" : "10px 20px", borderRadius: 99, transition: "all 0.18s", boxShadow: "0 0 20px rgba(202,253,0,0.15)" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 0 28px rgba(202,253,0,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(202,253,0,0.15)"; }}
        >{mobile ? "Join" : "Join an Event"}</button>
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────
function Hero() {
  const router = useRouter();
  const mobile = useIsMobile();
  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: mobile ? "90px 20px 60px" : "100px 40px 60px", overflow: "hidden" }}>
      <MatrixRain />
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(202,253,0,0.03) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: mobile ? "column" : "row", gap: mobile ? 40 : 80, alignItems: "center", maxWidth: 1200, width: "100%" }}>

        {/* Left */}
        <div style={{ flex: 1, textAlign: mobile ? "center" : "left", animation: "fadeUp 0.6s ease both" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(202,253,0,0.08)", border: "1px solid rgba(202,253,0,0.25)", borderRadius: 99, padding: "5px 14px", marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#cafd00", animation: "pulse2 2s ease-in-out infinite" }} />
            <span style={{ color: "#cafd00", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>NAIROBI BITCOIN CONFERENCE · JUNE 24-26</span>
          </div>

          <h1 style={{ fontSize: mobile ? "clamp(42px,12vw,72px)" : "clamp(52px,7vw,88px)", fontWeight: 900, lineHeight: 1.0, margin: "0 0 20px", letterSpacing: -2 }}>
            Find your<br /><span style={{ color: "#cafd00" }}>people.</span>
          </h1>

          <p style={{ color: "#999", fontSize: mobile ? 15 : 17, lineHeight: 1.8, margin: "0 0 32px", maxWidth: 420 }}>
            At every event, 1% of the room will change your life. The hard part is finding them in a crowd of hundreds. We do that for you.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: mobile ? "center" : "flex-start", marginBottom: 36 }}>
            <button onClick={() => router.push("/login")} style={{ padding: "14px 28px", borderRadius: 99, background: "#cafd00", border: "none", color: "#1a2200", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 0 28px rgba(202,253,0,0.25)", transition: "all 0.18s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >Join the Conference</button>
            <button onClick={() => router.push("/login")} style={{ padding: "14px 28px", borderRadius: 99, background: "transparent", border: "1px solid #2a2a28", color: "#aaa", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, cursor: "pointer", transition: "all 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a28"; e.currentTarget.style.color = "#aaa"; }}
            >Create an Event</button>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: mobile ? "center" : "flex-start" }}>
            {["Founders", "Investors", "Builders", "Designers", "Artists", "Everyone"].map(t => (
              <span key={t} style={{ padding: "5px 12px", borderRadius: 99, border: "1px solid #1e1e1c", background: "rgba(255,255,255,0.03)", color: "#666", fontSize: 13 }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Right — Orb + Event card */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, flexShrink: 0, animation: "fadeUp 0.8s ease both 0.15s" }}>
          <Orb size={mobile ? 200 : 260} />

          {/* Event card */}
          <div style={{ background: "rgba(14,14,12,0.9)", backdropFilter: "blur(20px)", border: "1px solid #1e1e1c", borderRadius: 20, padding: "20px 22px", width: mobile ? "100%" : 280, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <p style={{ color: "#444", fontSize: 9, fontWeight: 700, letterSpacing: 2, margin: "0 0 3px" }}>NEXT EVENT</p>
                <p style={{ color: "#fff", fontSize: 14, fontWeight: 700, margin: 0 }}>Nairobi Bitcoin Conf.</p>
              </div>
              <div style={{ background: "#cafd0012", border: "1px solid #cafd0030", borderRadius: 99, padding: "3px 10px" }}>
                <p style={{ color: "#cafd00", fontSize: 10, fontWeight: 700, margin: 0 }}>48 spots</p>
              </div>
            </div>
            <div style={{ height: 1, background: "#181816", marginBottom: 14 }} />
            <p style={{ color: "#555", fontSize: 12, margin: "0 0 8px" }}>ASK Dome · June 24-26, 2025</p>
            <button onClick={() => router.push("/login")} style={{ width: "100%", padding: "10px", borderRadius: 99, background: "#cafd00", border: "none", color: "#1a2200", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
              Register to join
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Scrolling marquee ─────────────────────────────────────────────────
function Marquee() {
  const text = "FIND YOUR PEOPLE • SHOW UP • BUILD SOMETHING REAL • INTENTIONAL NETWORKING • 1% OF THE ROOM • ";
  return (
    <div style={{ borderTop: "1px solid #111110", borderBottom: "1px solid #111110", overflow: "hidden", padding: "14px 0" }}>
      <div style={{ display: "flex", animation: "marquee 30s linear infinite", width: "max-content" }}>
        {[text, text, text].map((t, i) => (
          <span key={i} style={{ color: "rgba(255,255,255,0.04)", fontWeight: 900, fontSize: "clamp(48px,8vw,96px)", letterSpacing: -2, textTransform: "uppercase", whiteSpace: "nowrap" }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ── How it works ──────────────────────────────────────────────────────
function HowItWorks() {
  const mobile = useIsMobile();
  return (
    <section id="how" style={{ padding: mobile ? "64px 20px" : "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <p style={{ color: "#9d7bb8", fontSize: 10, fontWeight: 700, letterSpacing: 3, marginBottom: 14 }}>HOW IT WORKS</p>
        <h2 style={{ fontSize: mobile ? "clamp(28px,8vw,44px)" : "clamp(32px,4vw,52px)", fontWeight: 900, letterSpacing: -1.5, lineHeight: 1.1, margin: 0 }}>Three steps to a real connection.</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3,1fr)", gap: 14 }}>
        {[
          { icon: "🧠", color: "#cafd00", title: "We find your match", desc: "Tell us what you care about and what you are looking for. We read every profile at your event and find the three people you should actually meet." },
          { icon: "💬", color: "#9d7bb8", title: "You start a conversation", desc: "Chat with your match before you meet in person. Suggest a time, find a spot, or just see if the energy is right." },
          { icon: "🤝", color: "#9d7bb8", title: "You both show up", desc: "Both of you confirm the meeting happened. No ghosting, no forgotten cards, no connection request that goes nowhere." },
        ].map((f, i) => (
          <div key={i} style={{ borderRadius: 20, padding: "28px", border: "1px solid #1a1a18", background: "#0e0e0c", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#2a2a28"; e.currentTarget.style.transform = "translateY(-3px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a18"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${f.color}12`, border: `1px solid ${f.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 20 }}>{f.icon}</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, letterSpacing: -0.3 }}>{f.title}</h3>
            <p style={{ color: "#777", fontSize: 15, lineHeight: 1.75, margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── For everyone ──────────────────────────────────────────────────────
function ForEveryone() {
  const mobile = useIsMobile();
  return (
    <section id="for-you" style={{ padding: mobile ? "0 20px 64px" : "0 40px 80px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <p style={{ color: "#9d7bb8", fontSize: 10, fontWeight: 700, letterSpacing: 3, marginBottom: 14 }}>FOR EVERYONE</p>
        <h2 style={{ fontSize: mobile ? "clamp(28px,8vw,44px)" : "clamp(32px,4vw,52px)", fontWeight: 900, letterSpacing: -1.5, lineHeight: 1.1, margin: 0 }}>Every type of person.<br />One room.</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(3,1fr)", gap: 10 }}>
        {[
          { icon: "⚡", role: "Founders", desc: "Find your co-founder, first hire, or next investor", color: "#cafd00" },
          { icon: "💰", role: "Investors", desc: "Meet the founders worth backing before anyone else", color: "#9d7bb8" },
          { icon: "🎨", role: "Designers", desc: "Connect with builders who need your craft", color: "#9d7bb8" },
          { icon: "🔬", role: "Researchers", desc: "Find people turning ideas into something real", color: "#cafd00" },
          { icon: "🌱", role: "Community", desc: "Build real relationships, not just a follower count", color: "#9d7bb8" },
          { icon: "🔥", role: "Enthusiasts", desc: "Stop watching from the outside. Get in the room.", color: "#cafd00" },
        ].map((p, i) => (
          <div key={i} style={{ padding: mobile ? "18px 14px" : "22px 18px", borderRadius: 16, border: "1px solid #1a1a18", background: "#0e0e0c", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = p.color + "30"; e.currentTarget.style.background = p.color + "06"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a18"; e.currentTarget.style.background = "#0e0e0c"; }}
          >
            <span style={{ fontSize: mobile ? 20 : 24, display: "block", marginBottom: 10 }}>{p.icon}</span>
            <p style={{ fontWeight: 800, fontSize: mobile ? 14 : 15, marginBottom: 6, color: "#fff" }}>{p.role}</p>
            <p style={{ color: "#555", fontSize: mobile ? 12 : 13, lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Organizer section ─────────────────────────────────────────────────
function Organizers() {
  const router = useRouter();
  const mobile = useIsMobile();
  return (
    <section id="organizers" style={{ padding: mobile ? "0 20px 64px" : "0 40px 80px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 48, alignItems: "center" }}>
        <div>
          <p style={{ color: "#9d7bb8", fontSize: 10, fontWeight: 700, letterSpacing: 3, marginBottom: 16 }}>FOR ORGANIZERS</p>
          <h2 style={{ fontSize: mobile ? "clamp(26px,7vw,40px)" : "clamp(28px,3.5vw,44px)", fontWeight: 900, letterSpacing: -1, lineHeight: 1.15, marginBottom: 20 }}>
            Give your attendees a reason to come back.
          </h2>
          <p style={{ color: "#666", fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
            Create an event code in 30 seconds. Share it with your attendees. We handle the matching. You get the analytics.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
            {[
              { icon: "🎟", text: "Event code ready in under a minute" },
              { icon: "📊", text: "See who is meeting and how it went" },
              { icon: "🏷", text: "Set the interest tags for your audience" },
              { icon: "📱", text: "No app download needed" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ color: "#999", fontSize: 15 }}>{item.text}</span>
              </div>
            ))}
          </div>
          <button onClick={() => router.push("/login")} style={{ padding: "13px 24px", borderRadius: 99, background: "#9d7bb8", border: "none", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "opacity 0.18s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >Create your event</button>
        </div>

        <div style={{ background: "#0e0e0c", border: "1px solid #1e1e1c", borderRadius: 20, padding: 28 }}>
          <p style={{ color: "#333", fontSize: 9, fontWeight: 700, letterSpacing: 2, marginBottom: 18 }}>EVENT OVERVIEW</p>
          {[
            { label: "Event", value: "Nairobi Bitcoin Conference 2025", color: "#fff" },
            { label: "People joined", value: "248", color: "#cafd00" },
            { label: "Matches made", value: "744", color: "#9d7bb8" },
            { label: "Meetings confirmed", value: "186", color: "#9d7bb8" },
            { label: "No shows", value: "Zero", color: "#cafd00" },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: i < 4 ? "1px solid #141412" : "none" }}>
              <span style={{ color: "#555", fontSize: 14 }}>{row.label}</span>
              <span style={{ color: row.color, fontWeight: 700, fontSize: 15 }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────
function CTA() {
  const router = useRouter();
  const mobile = useIsMobile();
  return (
    <section style={{ padding: mobile ? "0 20px 80px" : "0 40px 100px", textAlign: "center" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <p style={{ fontSize: mobile ? "80px" : "120px", fontWeight: 900, lineHeight: 0.85, letterSpacing: -6, marginBottom: 28, userSelect: "none" as const }}>
          <span style={{ color: "#cafd00" }}>1</span><span style={{ color: "#9d7bb8" }}>%</span>
        </p>
        <h2 style={{ fontSize: mobile ? "clamp(24px,7vw,38px)" : "clamp(26px,3.5vw,42px)", fontWeight: 900, letterSpacing: -1, lineHeight: 1.15, marginBottom: 18 }}>
          Your people are already in the room.
        </h2>
        <p style={{ color: "#666", fontSize: 16, lineHeight: 1.75, marginBottom: 36 }}>
          Stop collecting business cards. Start making the connections that actually matter.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => router.push("/login")} style={{ padding: "15px 30px", borderRadius: 99, background: "#cafd00", border: "none", color: "#1a2200", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 0 32px rgba(202,253,0,0.25)", transition: "all 0.18s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >Join an Event ⚡</button>
          <button onClick={() => router.push("/login")} style={{ padding: "15px 30px", borderRadius: 99, background: "transparent", border: "1px solid #2a2a28", color: "#aaa", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, cursor: "pointer", transition: "all 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a28"; e.currentTarget.style.color = "#aaa"; }}
          >Create an Event</button>
        </div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  const mobile = useIsMobile();
  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
      <Nav />
      <Hero />
      <Marquee />
      <HowItWorks />
      <ForEveryone />
      <Organizers />
      <CTA />
      <footer style={{ borderTop: "1px solid #1a1a18", padding: mobile ? "24px 20px" : "28px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: -1 }}><span style={{ color: "#cafd00" }}>1</span><span style={{ color: "#9d7bb8" }}>%</span></span>
        <p style={{ color: "#333", fontSize: 13, margin: 0 }}>Built in Nairobi, for the world.</p>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "GitHub"].map(l => (
            <span key={l} style={{ color: "#444", fontSize: 13, cursor: "pointer", transition: "color 0.18s" }} onMouseEnter={e => e.currentTarget.style.color="#888"} onMouseLeave={e => e.currentTarget.style.color="#444"}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}