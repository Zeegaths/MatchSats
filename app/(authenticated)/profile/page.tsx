"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BITCOIN_INTERESTS = [
  { label: "#bitcoin", active: true },
  { label: "#lightning", active: false },
  { label: "#startups", active: false },
  { label: "#investing", active: false },
  { label: "#fintech", active: false },
  { label: "#payments", active: false },
  { label: "#open-source", active: false },
  { label: "#design", active: false },
  { label: "#web3", active: false },
  { label: "#ai", active: false },
  { label: "#privacy", active: false },
  { label: "#africa", active: false },
  { label: "#impact", active: false },
  { label: "#community", active: false },
  { label: "#content", active: false },
  { label: "#gaming", active: false },
  { label: "#music", active: false },
  { label: "#art", active: false },
];

const SOULMATE_INTERESTS = [
  { label: "#coffee-first", active: false },
  { label: "#night-owl", active: false },
  { label: "#early-riser", active: false },
  { label: "#dog-person", active: false },
  { label: "#cat-person", active: false },
  { label: "#foodie", active: false },
  { label: "#traveller", active: false },
  { label: "#homebody", active: false },
  { label: "#bookworm", active: false },
  { label: "#gym-rat", active: false },
  { label: "#creative", active: false },
  { label: "#adventurous", active: false },
  { label: "#ambitious", active: false },
  { label: "#laid-back", active: false },
  { label: "#hopeless-romantic", active: false },
  { label: "#plant-parent", active: false },
];

// keep INTERESTS as alias for bitcoin
const INTERESTS = BITCOIN_INTERESTS;

const CORE_VIBES = [
  { label: "Hyper-Focused", icon: "◎" },
  { label: "High Leverage", icon: "⚡" },
  { label: "Deep Research", icon: "◈" },
  { label: "Ship Mode", icon: "🚀" },
];

const ROLE_TAGS = [
  { label: "Builder",     icon: "⚡" },
  { label: "Community",   icon: "🌱" },
  { label: "Investor",    icon: "💰" },
  { label: "Researcher",  icon: "🔬" },
  { label: "Artist",      icon: "🎨" },
  { label: "Enthusiast",  icon: "🔥" },
  { label: "Operator",    icon: "⚙" },
  { label: "Journalist",  icon: "✍" },
];

const PERSONALITY_AXES = [
  { left: "Introvert", right: "Extrovert", key: "energy", default: 50 },
  { left: "Creating something", right: "Learning and connecting", key: "purpose", default: 50 },
  { left: "Technical depth", right: "Big picture and narrative", key: "thinking", default: 50 },
  { left: "Independent", right: "Collaborative", key: "working", default: 50 },
  { left: "Just getting started", right: "Been in this a long time", key: "journey", default: 50 },
];

function MatrixSlider({ left, right, defaultVal, onChange }: { left: string; right: string; defaultVal: number; onChange?: (v: number) => void }) {
  const [val, setVal] = useState(defaultVal);
  const isLeft = val < 40;
  const isRight = val > 60;
  const isMiddle = !isLeft && !isRight;

  const handleChange = (v: number) => {
    setVal(v);
    onChange?.(v);
  };

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ color: isLeft ? "#cafd00" : "#444", fontSize: 13, fontWeight: isLeft ? 700 : 500, lineHeight: 1.3, maxWidth: "40%", transition: "all 0.2s" }}>{left}</span>
        {isMiddle && <span style={{ color: "#777", fontSize: 11, fontWeight: 600, textAlign: "center", flexShrink: 0 }}>both, honestly</span>}
        <span style={{ color: isRight ? "#cafd00" : "#444", fontSize: 13, fontWeight: isRight ? 700 : 500, lineHeight: 1.3, textAlign: "right", maxWidth: "40%", transition: "all 0.2s" }}>{right}</span>
      </div>
      <div style={{ position: "relative", height: 4, background: "#1e1e1c", borderRadius: 99 }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${val}%`, background: isMiddle ? "linear-gradient(90deg, #9d7bb8, #cafd00)" : "linear-gradient(90deg, #9d7bb840, #cafd00)", borderRadius: 99, transition: "width 0.05s" }} />
        <input type="range" min={0} max={100} value={val} onChange={e => handleChange(Number(e.target.value))}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", margin: 0 }} />
        <div style={{ position: "absolute", top: "50%", left: `${val}%`, transform: "translate(-50%, -50%)", width: 16, height: 16, borderRadius: "50%", background: "#cafd00", border: "2px solid #0a0a0a", boxShadow: "0 0 12px rgba(202,253,0,0.7)", pointerEvents: "none", transition: "left 0.05s" }} />
      </div>
    </div>
  );
}

function InterestTag({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{
      padding: "8px 16px", borderRadius: 99, cursor: "pointer",
      fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif",
      transition: "all 0.18s",
      border: active ? "1px solid #cafd00" : "1px solid rgba(255,255,255,0.08)",
      background: active ? "#cafd0018" : "rgba(255,255,255,0.04)",
      color: active ? "#cafd00" : "#ccc",
      backdropFilter: "blur(8px)",
      boxShadow: active ? "0 0 12px rgba(202,253,0,0.15), inset 0 1px 0 rgba(202,253,0,0.1)" : "inset 0 1px 0 rgba(255,255,255,0.05)",
    }}>{label}</button>
  );
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const [interests, setInterests] = useState(BITCOIN_INTERESTS);
  const [soulmateInterests, setSoulmateInterests] = useState(SOULMATE_INTERESTS);
  const [interestTab, setInterestTab] = useState<"bitcoin" | "soulmate">("bitcoin");
  const [selectedVibe, setSelectedVibe] = useState("Hyper-Focused");
  const [selectedRole, setSelectedRole] = useState("");
  const [personalityVals, setPersonalityVals] = useState<Record<string, number>>({});
  const [currentBuild, setCurrentBuild] = useState("");
  const [needs, setNeeds] = useState("");
  const [vibeNote, setVibeNote] = useState("");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Load existing profile on mount
  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(data => {
      const p = data.profile;
      if (!p) return;
      if (p.name) setName(p.name);
      if (p.core_vibe) setSelectedVibe(p.core_vibe);
      if (p.role) setSelectedRole(p.role);
      if (p.building) setCurrentBuild(p.building);
      if (p.needs) setNeeds(p.needs);
      if (p.vibe) setVibeNote(p.vibe);
      if (p.invite_code) setInviteCode(p.invite_code);
      if (p.interests?.length) {
        setInterests(prev => prev.map(t => ({
          ...t, active: p.interests.includes(t.label)
        })));
      }
      if (p.personality?.role) setSelectedRole(p.personality.role);
    }).catch(() => {});
  }, []);

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
          name: name || "Anonymous Node",
          core_vibe: selectedVibe,
          role: selectedRole,
          building: currentBuild,
          needs,
          vibe: vibeNote,
          invite_code: inviteCode.trim().toUpperCase(),
          interests: interests.filter(t => t.active).map(t => t.label),
          soulmate_interests: soulmateInterests.filter(t => t.active).map(t => t.label),
          personality: { ...personalityVals, role: selectedRole },
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
          <span style={{ color: "#cafd00", fontWeight: 700, fontSize: 13, letterSpacing: 2 }}>1%</span>
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

        {/* Name */}
        {card(<>
          {sectionLabel("YOUR NAME")}
          <div style={{ background: "#0e0e0c", border: "1px solid #2a2a28", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#cafd00" }}>◈</span>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="What do people call you?"
              style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, outline: "none" }}
            />
          </div>
        </>)}

        {/* Personality Matrix */}
        {card(<>
          {sectionLabel("YOUR VIBE")}
          <p style={{ color: "#666", fontSize: 13, margin: "0 0 20px", lineHeight: 1.6 }}>Drag each one to where you actually sit. Middle is fine.</p>
          {PERSONALITY_AXES.map((axis, i) => (
            <MatrixSlider
              key={i}
              left={axis.left}
              right={axis.right}
              defaultVal={axis.default}
              onChange={v => setPersonalityVals(prev => ({ ...prev, [axis.key]: v }))}
            />
          ))}
        </>)}

        {/* Role tag */}
        {card(<>
          {sectionLabel("I AM PRIMARILY A...")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {ROLE_TAGS.map(r => {
              const active = selectedRole === r.label;
              return (
                <button key={r.label} onClick={() => setSelectedRole(r.label)} style={{
                  padding: "12px 8px", borderRadius: 14, cursor: "pointer",
                  border: active ? "1px solid #cafd0060" : "1px solid #1e1e1c",
                  background: active ? "#cafd0010" : "#0e0e0e",
                  color: active ? "#cafd00" : "#666",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: 11, textAlign: "center",
                  transition: "all 0.18s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                }}>
                  <span style={{ fontSize: 20 }}>{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
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
          {/* Tab header */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button onClick={() => setInterestTab("bitcoin")} style={{
              padding: "7px 16px", borderRadius: 99, border: "none", cursor: "pointer",
              background: interestTab === "bitcoin" ? "#cafd00" : "transparent",
              color: interestTab === "bitcoin" ? "#1a2200" : "#555",
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12,
              letterSpacing: 1, transition: "all 0.18s",
            }}>⚡ BITCOIN</button>
            <button onClick={() => setInterestTab("soulmate")} style={{
              padding: "7px 16px", borderRadius: 99, border: interestTab === "soulmate" ? "none" : "1px solid #2a2a28", cursor: "pointer",
              background: interestTab === "soulmate" ? "#9d7bb8" : "transparent",
              color: interestTab === "soulmate" ? "#fff" : "#555",
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12,
              letterSpacing: 1, transition: "all 0.18s",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              💜 SOULMATE
              <span style={{ background: "#ff6b9d", color: "#fff", fontSize: 8, fontWeight: 800, padding: "2px 6px", borderRadius: 99, letterSpacing: 1 }}>NEW</span>
            </button>
          </div>

          {interestTab === "bitcoin" ? (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {interests.map((tag, i) => (
                  <InterestTag key={tag.label} label={tag.label} active={tag.active}
                    onToggle={() => setInterests(prev => prev.map((t, idx) => idx === i ? { ...t, active: !t.active } : t))} />
                ))}
              </div>
              <p style={{ color: "#555", fontSize: 11, margin: "14px 0 0" }}>
                {interests.filter(t => t.active).length} signals active
              </p>
            </>
          ) : (
            <>
              <p style={{ color: "#9d7bb8", fontSize: 12, margin: "0 0 12px", fontStyle: "italic" }}>
                Who are you beyond the tech? Help us find your people.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {soulmateInterests.map((tag, i) => (
                  <button key={tag.label} onClick={() => setSoulmateInterests(prev => prev.map((t, idx) => idx === i ? { ...t, active: !t.active } : t))}
                    style={{
                      padding: "8px 16px", borderRadius: 99, cursor: "pointer", fontSize: 13, fontWeight: 600,
                      fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.18s",
                      border: tag.active ? "1px solid #9d7bb8" : "1px solid rgba(255,255,255,0.08)",
                      background: tag.active ? "rgba(157,123,184,0.15)" : "rgba(255,255,255,0.04)",
                      color: tag.active ? "#c4a0e8" : "#ccc",
                      backdropFilter: "blur(8px)",
                      boxShadow: tag.active ? "0 0 12px rgba(157,123,184,0.2), inset 0 1px 0 rgba(157,123,184,0.15)" : "inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                  >{tag.label}</button>
                ))}
              </div>
              <p style={{ color: "#555", fontSize: 11, margin: "14px 0 0" }}>
                {soulmateInterests.filter(t => t.active).length} vibes selected
              </p>
            </>
          )}
        </>)}

        {/* Building / Needs / Vibe Check — changes based on active tab */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 12 }}>
          {(interestTab === "bitcoin" ? [
            { icon: "⚡", label: "BUILDING", color: "#cafd00", value: currentBuild, set: setCurrentBuild, placeholder: "What are you building right now?", italic: false },
            { icon: "◈", label: "NEEDS", color: "#9d7bb8", value: needs, set: setNeeds, placeholder: "What kind of person are you looking for?", italic: false },
            { icon: "👁️", label: "VIBE CHECK", color: "#fff", value: vibeNote, set: setVibeNote, placeholder: "Who do you love working with? Describe the energy.", italic: true },
          ] : [
            { icon: "✨", label: "ABOUT ME", color: "#c4a0e8", value: currentBuild, set: setCurrentBuild, placeholder: "What should someone know about you before saying hi?", italic: false },
            { icon: "💜", label: "LOOKING FOR", color: "#9d7bb8", value: needs, set: setNeeds, placeholder: "Describe your ideal person in three words.", italic: false },
            { icon: "🌙", label: "FIRST CONVERSATION", color: "#c4a0e8", value: vibeNote, set: setVibeNote, placeholder: "What does a great first conversation feel like to you?", italic: true },
          ]).map(({ icon, label, color, value, set, placeholder, italic }) => (
            <div key={label} style={{ borderRadius: 20, border: `1px solid ${interestTab === "soulmate" ? "#9d7bb830" : "#2a2a28"}`, background: interestTab === "soulmate" ? "rgba(157,123,184,0.05)" : "#141412", padding: "20px" }}>
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
              <style>{`textarea::placeholder { color: #888; font-style: normal; }`}</style>
            </div>
          ))}
        </div>

        {/* Conference invite code */}
        <div style={{ borderRadius: 20, border: `1px solid ${inviteCode.length > 0 ? "#cafd0050" : "#cafd0020"}`, background: inviteCode.length > 0 ? "#cafd0008" : "#0e0e0c", padding: "20px", marginBottom: 12, transition: "all 0.2s" }}>
          {sectionLabel("EVENT CODE")}
          <p style={{ color: "#777", fontSize: 13, margin: "0 0 12px", lineHeight: 1.6 }}>
            This scopes your matches to people at the same event. Ask your organizer if you don't have one.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#080808", border: `1px solid ${inviteCode.length > 0 ? "#cafd0040" : "#1e1e1c"}`, borderRadius: 10, padding: "12px 16px", transition: "all 0.2s" }}>
            <span style={{ color: "#cafd00", fontSize: 16 }}>🎟</span>
            <input
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. NAI5"
              maxLength={20}
              style={{ flex: 1, background: "transparent", border: "none", color: "#cafd00", fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 800, outline: "none", letterSpacing: 3 }} />
            {inviteCode.length > 0 && (
              <span style={{ color: "#cafd00", fontSize: 16 }}>✓</span>
            )}
          </div>
          {inviteCode.length === 0 && (
            <p style={{ color: "#555", fontSize: 11, margin: "8px 0 0" }}>
              No code? You can still build your profile — add it later before matching.
            </p>
          )}
        </div>

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
