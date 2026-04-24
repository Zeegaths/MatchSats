"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────
interface Message {
  id: string;
  content: string;
  pubkey: string;
  created_at: number;
  pending?: boolean;
  failed?: boolean;
}

const MATCH_DATA: Record<string, { name: string; initials: string; role: string; nostrKey: string }> = {
  "1": { name: "Amara O.", initials: "A", role: "Fintech Founder", nostrKey: "npub1am4r4..." },
  "2": { name: "Dev X", initials: "D", role: "Rust Developer", nostrKey: "npub1d3vx..." },
  "3": { name: "Priya K.", initials: "P", role: "VC Associate", nostrKey: "npub1priy4..." },
  "4": { name: "Kwame A.", initials: "K", role: "Protocol Engineer", nostrKey: "npub1kw4m3..." },
};

// Mock messages for UI demo — replace with real NDK subscription
const MOCK_MESSAGES: Message[] = [
  { id: "1", content: "Hey! Just saw your profile — your M-Pesa integration work is exactly what we need.", pubkey: "them", created_at: Date.now() - 1000 * 60 * 12 },
  { id: "2", content: "Thanks! I saw your pitch deck on Lightning merchant onboarding. Super aligned with what I've been building.", pubkey: "me", created_at: Date.now() - 1000 * 60 * 10 },
  { id: "3", content: "Would love to lock in 30 mins today. I have 3pm–5pm free.", pubkey: "them", created_at: Date.now() - 1000 * 60 * 8 },
  { id: "4", content: "3pm works. Let's do Hall B, Table 7. I'll lock sats on my end now.", pubkey: "me", created_at: Date.now() - 1000 * 60 * 5 },
];

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return d.toLocaleDateString();
}

export default function DMPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const match = MATCH_DATA[params.id] ?? MATCH_DATA["1"];
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [relayStatus, setRelayStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Simulate NDK relay connection
  useEffect(() => {
    const t = setTimeout(() => {
      setRelayStatus("connected");
      setConnected(true);
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !connected) return;

    const pending: Message = {
      id: Date.now().toString(),
      content: text,
      pubkey: "me",
      created_at: Date.now(),
      pending: true,
    };

    setMessages(prev => [...prev, pending]);
    setInput("");
    inputRef.current?.focus();

    // Simulate NDK publish — replace with real:
    // const event = new NDKEvent(ndk);
    // event.kind = 4; // NIP-04 DM
    // event.content = await ndk.signer.encrypt(recipientPubkey, text);
    // event.tags = [["p", recipientPubkey]];
    // await event.publish();

    setTimeout(() => {
      setMessages(prev =>
        prev.map(m => m.id === pending.id ? { ...m, pending: false } : m)
      );
    }, 800);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main style={{
      minHeight: "100vh", background: "#0a0a0a", color: "#fff",
      fontFamily: "'Space Grotesk', sans-serif",
      display: "flex", flexDirection: "column",
    }}>

      {/* ── Header ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(10,10,10,0.95)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid #111110",
        padding: "1rem 1.25rem",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <button onClick={() => router.back()} style={{
          background: "none", border: "1px solid #1e1e1c", borderRadius: 99,
          color: "#666", fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700, fontSize: 12, cursor: "pointer",
          padding: "7px 16px", letterSpacing: 1, transition: "all 0.18s", flexShrink: 0,
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#aaa"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1c"; e.currentTarget.style.color = "#666"; }}
        >← BACK</button>

        {/* Avatar */}
        <div style={{
          width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
          background: "#9d7bb820", border: "1.5px solid #9d7bb840",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#9d7bb8", fontWeight: 800, fontSize: 15,
        }}>{match.initials}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>{match.name}</p>
          <p style={{ color: "#555", fontSize: 11, margin: 0 }}>{match.role}</p>
        </div>

        {/* Relay status */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: relayStatus === "connected" ? "#cafd00" : relayStatus === "error" ? "#ff4444" : "#9d7bb8",
            boxShadow: relayStatus === "connected" ? "0 0 6px #cafd00" : relayStatus === "error" ? "0 0 6px #ff4444" : "0 0 6px #9d7bb8",
            animation: relayStatus === "connecting" ? "pulse 1s ease-in-out infinite" : "none",
          }} />
          <span style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
            {relayStatus === "connected" ? "NOSTR" : relayStatus === "error" ? "OFFLINE" : "CONNECTING"}
          </span>
        </div>

        {/* Nostr key */}
        <div style={{
          background: "#9d7bb810", border: "1px solid #9d7bb830",
          borderRadius: 8, padding: "4px 10px", flexShrink: 0,
        }}>
          <span style={{ color: "#9d7bb8", fontSize: 9, fontFamily: "monospace", letterSpacing: 0.5 }}>
            {match.nostrKey}
          </span>
        </div>
      </div>

      {/* ── Encryption notice ── */}
      <div style={{
        padding: "10px 16px", background: "#9d7bb808",
        borderBottom: "1px solid #9d7bb815",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        <span style={{ color: "#9d7bb8", fontSize: 11 }}>◈</span>
        <span style={{ color: "#9d7bb8", fontSize: 11, fontWeight: 600 }}>
          End-to-end encrypted via NIP-04 · Messages stored on Nostr relay
        </span>
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "20px 16px",
        display: "flex", flexDirection: "column", gap: 12,
        maxWidth: 680, margin: "0 auto", width: "100%",
      }}>

        {/* Date separator */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#1a1a18" }} />
          <span style={{ color: "#333", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>TODAY</span>
          <div style={{ flex: 1, height: 1, background: "#1a1a18" }} />
        </div>

        {messages.map((msg, i) => {
          const isMe = msg.pubkey === "me";
          const showAvatar = !isMe && (i === 0 || messages[i - 1].pubkey !== msg.pubkey);

          return (
            <div key={msg.id} style={{
              display: "flex", flexDirection: isMe ? "row-reverse" : "row",
              gap: 10, alignItems: "flex-end",
            }}>
              {/* Their avatar */}
              {!isMe && (
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: showAvatar ? "#9d7bb820" : "transparent",
                  border: showAvatar ? "1px solid #9d7bb840" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#9d7bb8", fontWeight: 800, fontSize: 11,
                }}>
                  {showAvatar ? match.initials : ""}
                </div>
              )}

              {/* Bubble */}
              <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", gap: 4 }}>
                <div style={{
                  padding: "11px 16px", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: isMe ? "#cafd0015" : "#1a1a18",
                  border: isMe ? "1px solid #cafd0030" : "1px solid #222220",
                  opacity: msg.pending ? 0.6 : 1,
                  transition: "opacity 0.3s",
                }}>
                  <p style={{ color: "#fff", fontSize: 14, margin: 0, lineHeight: 1.6 }}>{msg.content}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "#333", fontSize: 10 }}>{formatTime(msg.created_at)}</span>
                  {isMe && (
                    <span style={{ color: msg.pending ? "#555" : "#cafd00", fontSize: 10 }}>
                      {msg.pending ? "○" : "✓"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Connecting placeholder */}
        {!connected && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#9d7bb810", border: "1px solid #9d7bb820", borderRadius: 99, padding: "8px 16px" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#9d7bb8", animation: "pulse 1s ease-in-out infinite" }} />
              <span style={{ color: "#9d7bb8", fontSize: 12, fontWeight: 600 }}>Connecting to Nostr relay...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Suggested quick replies ── */}
      <div style={{
        padding: "8px 16px 0", maxWidth: 680, margin: "0 auto", width: "100%",
        display: "flex", gap: 8, flexWrap: "wrap",
      }}>
        {["Lock sats for 3pm?", "Where are you sitting?", "Let's connect on Nostr"].map(s => (
          <button key={s} onClick={() => setInput(s)} style={{
            padding: "6px 14px", borderRadius: 99, fontSize: 12,
            border: "1px solid #1e1e1c", background: "transparent",
            color: "#666", fontFamily: "'Space Grotesk', sans-serif",
            cursor: "pointer", transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#9d7bb860"; e.currentTarget.style.color = "#9d7bb8"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1c"; e.currentTarget.style.color = "#666"; }}
          >{s}</button>
        ))}
      </div>

      {/* ── Input ── */}
      <div style={{
        padding: "12px 16px 24px", maxWidth: 680, margin: "0 auto", width: "100%",
        boxSizing: "border-box",
      }}>
        <div style={{
          display: "flex", gap: 10, alignItems: "flex-end",
          background: "#111110", border: "1px solid #1e1e1c",
          borderRadius: 20, padding: "10px 14px",
          transition: "border-color 0.18s",
        }}
          onFocusCapture={e => (e.currentTarget.style.borderColor = "#9d7bb860")}
          onBlurCapture={e => (e.currentTarget.style.borderColor = "#1e1e1c")}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={connected ? "Message via Nostr..." : "Connecting to relay..."}
            disabled={!connected}
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "#fff", fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14, resize: "none", lineHeight: 1.5,
              maxHeight: 120, overflowY: "auto",
              opacity: connected ? 1 : 0.5,
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !connected}
            style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: input.trim() && connected ? "#cafd00" : "#1e1e1c",
              border: "none", cursor: input.trim() && connected ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.18s",
              boxShadow: input.trim() && connected ? "0 0 12px rgba(202,253,0,0.3)" : "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke={input.trim() && connected ? "#1a2200" : "#444"} strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={input.trim() && connected ? "#1a2200" : "#444"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p style={{ color: "#333", fontSize: 10, textAlign: "center", margin: "8px 0 0", letterSpacing: 0.5 }}>
          Enter to send · Shift+Enter for new line · NIP-04 encrypted
        </p>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.4}50%{opacity:1} }
      `}</style>
    </main>
  );
}