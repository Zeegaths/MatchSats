"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INTERESTS = [
  { label: "#rustling", active: false },
  { label: "#bitcoin", active: true },
  { label: "#generative-art", active: false },
  { label: "#macro-economics", active: false },
  { label: "#cybersecurity", active: false },
  { label: "#smart-contracts", active: false },
  { label: "#gaming", active: true, purple: true },
  { label: "#solana", active: false },
  { label: "#ai-agents", active: false },
  { label: "#zero-knowledge", active: false },
  { label: "#defi", active: true },
  { label: "#nostr", active: false },
  { label: "#lightning", active: true },
  { label: "#open-source", active: false },
  { label: "#hardware", active: false },
];

const CORE_VIBES = [
  { label: "Hyper-Focused", icon: "◎" },
  { label: "High Leverage", icon: "⚡" },
  { label: "Deep Research", icon: "◈" },
  { label: "Ship Mode", icon: "🚀" },
];

const PERSONALITY_AXES = [
  { left: "I RECHARGE ALONE", right: "I RECHARGE WITH PEOPLE", default: 60 },
  { left: "I GO DEEP ON ONE THING", right: "I JUGGLE MANY THINGS", default: 35 },
  { left: "I FIGURE THINGS OUT", right: "I FIND WHAT ALREADY WORKS", default: 50 },
  { left: "I BET BIG, MOVE FAST", right: "I MEASURE, THEN MOVE", default: 45 },
  { left: "I PREFER MESSAGES", right: "I PREFER MEETINGS", default: 40 },
];

function MatrixSlider({ left, right, defaultVal }: { left: string; right: string; defaultVal: number }) {
  const [val, setVal] = useState(defaultVal);
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
        <span style={{ color: val < 50 ? "#cafd00" : "#444", fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", lineHeight: 1.4, maxWidth: "44%", transition: "color 0.2s" }}>{left}</span>
        <span style={{ color: val >= 50 ? "#cafd00" : "#444", fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", lineHeight: 1.4, textAlign: "right", maxWidth: "44%", transition: "color 0.2s" }}>{right}</span>
      </div>
      <div style={{ position: "relative", height: 4, background: "#1e1e1c", borderRadius: 99 }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${val}%`, background: "linear-gradient(90deg, #9d7bb840, #cafd00)", borderRadius: 99, transition: "width 0.05s" }} />
        <input type="range" min={0} max={100} value={val} onChange={e => setVal(Number(e.target.value))}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", margin: 0 }} />
        <div style={{ position: "absolute", top: "50%", left: `${val}%`, transform: "translate(-50%, -50%)", width: 16, height: 16, borderRadius: "50%", background: "#cafd00", border: "2px solid #0a0a0a", boxShadow: "0 0 12px rgba(202,253,0,0.7)", pointerEvents: "none", transition: "left 0.05s" }} />
      </div>
    </div>
  );
}

function InterestTag({ label, active, purple, onToggle }: { label: string; active: boolean; purple?: boolean; onToggle: () => void }) {
  const color = purple ? "#9d7bb8" : "#cafd00";
  return (
    <button onClick={onToggle} style={{
      padding: "7px 14px", borderRadius: 99, cursor: "pointer",
      border: active ? `1px solid ${color}` : "1px solid #2a2a28",
      background: active ? `${color}18` : "transparent",
      color: active ? color : "#777",
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: active ? 700 : 400, fontSize: 12,
      transition: "all 0.15s ease",
    }}>
      {label}
    </button>
  );
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const [interests, setInterests] = useState(INTERESTS);
  const [selectedVibe, setSelectedVibe] = useState("Hyper-Focused");
  const [currentBuild, setCurrentBuild] = useState("");
  const [needs, setNeeds] = useState("");
  const [vibeNote, setVibeNote] = useState("");
  const [lightningAddr, setLightningAddr] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const toggleInterest = (i: number) =>
    setInterests(prev => prev.map((t, idx) => idx === i ? { ...t, active: !t.active } : t));

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Anonymous Node",      // will add name field shortly
          core_vibe: selectedVibe,
          building: currentBuild,
          needs,
          vibe: vibeNote,
          lightning_addr: lightningAddr,
          interests: interests.filter(t => t.active).map(t => t.label),
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/matches");
      } else {
        setSaveError(data.error ?? "Something went wrong");
      }
    } catch (err) {
      setSaveError("Could not save profile. Are you logged in?");
    } finally {
      setSaving(false);
    }
  };

  const sectionLabel = (text: string) => (
    <p style={{ color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 3, margin: "0 0 16px" }}>{text}</p>
  );

  const card = (children: React.ReactNode) => (
    <div style={{ borderRadius: 20, border: "1px solid #1e1e1c", background: "#111110", padding: "22px", marginBottom: 12 }}>
      {children}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Top nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", borderBottom: "1px solid #111110", position: "sticky", top: 0, zIndex: 20, background: "rgba(10,10,10,0.92)", backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => router.push("/login")} style={{ background: "none", border: "1px solid #1e1e1c", borderRadius: 99, color: "#666", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, cursor: "pointer", padding: "5px 12px", letterSpacing: 1, transition: "all 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#444"; e.currentTarget.style.color = "#aaa"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1c"; e.currentTarget.style.color = "#666"; }}
          >← SWITCH WALLET</button>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#cafd0020", border: "1px solid #cafd0040", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="14" viewBox="0 0 44 50" fill="none"><path d="M26 4L8 28H22L16 46L38 20H24L26 4Z" fill="#cafd00"/></svg>
          </div>
          <span style={{ color: "#cafd00", fontWeight: 700, fontSize: 13, letterSpacing: 2 }}>MATCHSATS</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#cafd00", boxShadow: "0 0 6px #cafd00" }} />
          <span style={{ color: "#cafd00", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>CONNECTED</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, maxWidth: 760, margin: "0 auto", width: "100%", padding: "2rem 1.25rem 8rem", boxSizing: "border-box" }}>

        {/* Hero */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 3, margin: "0 0 10px" }}>PROFILE SETUP · ACTIVE SESSION</p>
          <h1 style={{ fontSize: "clamp(30px, 7vw, 52px)", fontWeight: 900, lineHeight: 1.05, margin: 0 }}>Define Your</h1>
          <h1 style={{ fontSize: "clamp(30px, 7vw, 52px)", fontWeight: 900, lineHeight: 1.05, margin: 0 }}>
            Digital <span style={{ color: "#9d7bb8", textShadow: "0 0 30px rgba(157,123,184,0.4)" }}>Aura</span>
          </h1>
          <p style={{ color: "#aaa", fontSize: 14, margin: "12px 0 0", lineHeight: 1.7 }}>
            The engine is calibrating. Feed your essence into the node to optimize high-value peer connectivity.
          </p>
        </div>

        {/* Personality Matrix */}
        {card(<>
          {sectionLabel("PERSONALITY MATRIX")}
          {PERSONALITY_AXES.map((axis, i) => (
            <MatrixSlider key={i} left={axis.left} right={axis.right} defaultVal={axis.default} />
          ))}
        </>)}

        {/* Core Vibe */}
        {card(<>
          {sectionLabel("CORE VIBE")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {CORE_VIBES.map(v => {
              const active = selectedVibe === v.label;
              return (
                <button key={v.label} onClick={() => setSelectedVibe(v.label)} style={{
                  padding: "14px", borderRadius: 14, cursor: "pointer",
                  border: active ? "1px solid #cafd0060" : "1px solid #1e1e1c",
                  background: active ? "#cafd0010" : "#0e0e0e",
                  color: active ? "#cafd00" : "#777",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: 13, textAlign: "left",
                  transition: "all 0.18s",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: 18 }}>{v.icon}</span>
                  <span>{v.label}</span>
                </button>
              );
            })}
          </div>
        </>)}

        {/* Interests Mesh */}
        {card(<>
          {sectionLabel("INTERESTS MESH")}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {interests.map((tag, i) => (
              <InterestTag key={tag.label} label={tag.label} active={tag.active} purple={tag.purple} onToggle={() => toggleInterest(i)} />
            ))}
          </div>
          <p style={{ color: "#555", fontSize: 11, margin: "14px 0 0" }}>
            {interests.filter(t => t.active).length} signals active
          </p>
        </>)}

        {/* Building / Needs / Vibe Check */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 12 }}>
          {[
            { icon: "⚡", label: "BUILDING", color: "#cafd00", value: currentBuild, set: setCurrentBuild, placeholder: "What are you building right now?", italic: false },
            { icon: "◈", label: "NEEDS", color: "#9d7bb8", value: needs, set: setNeeds, placeholder: "What kind of person are you looking for?", italic: false },
            { icon: "👁️", label: "VIBE CHECK", color: "#fff", value: vibeNote, set: setVibeNote, placeholder: "Who do you love working with? Describe the energy.", italic: true },
          ].map(({ icon, label, color, value, set, placeholder, italic }) => (
            <div key={label} style={{ borderRadius: 20, border: "1px solid #2a2a28", background: "#141412", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                <p style={{ color, fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: 0 }}>{label}</p>
              </div>
              <textarea value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                style={{
                  width: "100%",
                  background: "#0e0e0c",
                  border: "1px solid #2a2a28",
                  borderRadius: 10,
                  color: "#fff",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 14,
                  resize: "none",
                  minHeight: 90,
                  outline: "none",
                  lineHeight: 1.7,
                  boxSizing: "border-box",
                  fontStyle: italic ? "italic" : "normal",
                  padding: "10px 14px",
                }}
                onFocus={e => e.currentTarget.style.borderColor = color + "60"}
                onBlur={e => e.currentTarget.style.borderColor = "#2a2a28"}
              />
              <style>{`textarea::placeholder { color: #666; }`}</style>
              {label !== "VIBE CHECK" ? (
                <button style={{ marginTop: 8, width: "100%", padding: "7px", borderRadius: 8, border: "1px solid #2a2a28", background: "transparent", color: "#666", fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, cursor: "pointer", letterSpacing: 1 }}>+ ADD MORE</button>
              ) : (
                <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
                  {["#cafd00", "#9d7bb8", "#ff4444"].map((c, i) => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Lightning node */}
        <div style={{ borderRadius: 20, border: "1px solid #2a2a28", background: "#141412", padding: "20px", marginBottom: 12 }}>
          {sectionLabel("LIGHTNING NODE")}
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#0e0e0c", border: "1px solid #2a2a28", borderRadius: 10, padding: "10px 14px" }}>
            <span style={{ color: "#cafd00", fontSize: 16 }}>⚡</span>
            <input
              value={lightningAddr}
              onChange={e => setLightningAddr(e.target.value)}
              placeholder="your@lightning.address"
              style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, outline: "none" }} />
          </div>
        </div>

        {/* Broadcast notice */}
        <p style={{ color: "#444", fontSize: 12, textAlign: "center", margin: "0 0 20px" }}>
          ◈ Changes will be broadcast to the Neon-Node instantly upon synchronization.
        </p>
      </div>

      {/* Floating bottom bar */}
      <div style={{
        position: "fixed" as const, bottom: 0, left: 0, right: 0,
        background: "rgba(10,10,10,0.96)", backdropFilter: "blur(16px)",
        borderTop: "1px solid #1a1a18",
        padding: "0.9rem 1.25rem",
        display: "flex", gap: 10,
        boxSizing: "border-box" as const,
      }}>
        <button onClick={() => router.push("/matches")} style={{
          flex: "0 0 auto", padding: "11px 20px", borderRadius: 99,
          background: "transparent", border: "1px solid #2a2a28",
          color: "#666", fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 1,
          transition: "all 0.18s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#444"; e.currentTarget.style.color = "#aaa"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a28"; e.currentTarget.style.color = "#666"; }}
        >DISCARD</button>

        {saveError && (
          <p style={{ color: "#ff6666", fontSize: 12, margin: "0 8px" }}>{saveError}</p>
        )}

        <button onClick={handleSave} disabled={saving} style={{
          flex: 1, padding: "11px", borderRadius: 99,
          background: "transparent",
          border: "1px solid #cafd0060",
          color: saving ? "#666" : "#cafd00",
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700, fontSize: 13, cursor: saving ? "default" : "pointer",
          letterSpacing: 2, textTransform: "uppercase",
          transition: "all 0.2s",
          maxWidth: 480, margin: "0 auto",
          opacity: saving ? 0.6 : 1,
        }}
          onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = "#cafd0015"; e.currentTarget.style.borderColor = "#cafd00"; e.currentTarget.style.boxShadow = "0 0 20px rgba(202,253,0,0.15)"; }}}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#cafd0060"; e.currentTarget.style.boxShadow = "none"; }}
        >{saving ? "SAVING..." : "SYNC PROFILE"}</button>
      </div>
    </div>
  );
}