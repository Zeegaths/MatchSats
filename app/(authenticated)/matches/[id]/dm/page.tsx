"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Message {
  id: number;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: number;
}

export default function DMPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [myId, setMyId] = useState("");
  const [matchName, setMatchName] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get my session
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.userId) setMyId(d.userId);
    });
  }, []);

  // Get match name
  useEffect(() => {
    fetch(`/api/match/${id}`).then(r => r.json()).then(d => {
      if (d.name) setMatchName(d.name);
    }).catch(() => {});
  }, [id]);

  // Poll messages every 2s
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages/${id}`);
        const data = await res.json();
        if (data.messages) setMessages(data.messages);
      } catch {}
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");

    // Optimistic update
    const optimistic: Message = {
      id: Date.now(),
      sender_id: myId,
      sender_name: "You",
      content,
      created_at: Date.now(),
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      await fetch(`/api/messages/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
    } catch {}
    setSending(false);
    inputRef.current?.focus();
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const QUICK_REPLIES = [
    "Where are you sitting? 📍",
    "Let's meet in 10 mins?",
    "Coffee after the next talk?",
    "Loved your profile — let's connect",
  ];

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a18", display: "flex", alignItems: "center", gap: 12, background: "rgba(10,10,10,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1 }}>←</button>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#9d7bb820", border: "1px solid #9d7bb840", display: "flex", alignItems: "center", justifyContent: "center", color: "#9d7bb8", fontWeight: 800, fontSize: 14 }}>
          {matchName ? matchName[0].toUpperCase() : "?"}
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>{matchName || "Loading..."}</p>
          <p style={{ color: "#555", fontSize: 11, margin: 0 }}>End-to-end encrypted · on 1%</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>💬</p>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: "0 0 8px" }}>Start the conversation</p>
            <p style={{ color: "#555", fontSize: 14, margin: 0 }}>You matched — now say something.</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_id === myId;
            return (
              <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "75%" }}>
                  {!isMe && (
                    <p style={{ color: "#666", fontSize: 11, margin: "0 0 4px 12px", fontWeight: 600 }}>{msg.sender_name}</p>
                  )}
                  <div style={{
                    padding: "10px 14px", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: isMe ? "#cafd00" : "#1a1a18",
                    color: isMe ? "#1a2200" : "#fff",
                    fontSize: 14, lineHeight: 1.5,
                  }}>
                    {msg.content}
                  </div>
                  <p style={{ color: "#444", fontSize: 10, margin: "4px 8px 0", textAlign: isMe ? "right" : "left" }}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      {messages.length === 0 && (
        <div style={{ padding: "0 16px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {QUICK_REPLIES.map(r => (
            <button key={r} onClick={() => setInput(r)} style={{
              padding: "8px 14px", borderRadius: 99, border: "1px solid #1e1e1c",
              background: "transparent", color: "#aaa", fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 12, cursor: "pointer", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#cafd0040"; e.currentTarget.style.color = "#cafd00"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1c"; e.currentTarget.style.color = "#aaa"; }}
            >{r}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #1a1a18", background: "rgba(10,10,10,0.95)", backdropFilter: "blur(12px)", display: "flex", gap: 10, alignItems: "center" }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Type a message..."
          style={{
            flex: 1, background: "#111110", border: "1px solid #1e1e1c", borderRadius: 99,
            color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontSize: 14,
            padding: "12px 16px", outline: "none",
          }}
          onFocus={e => e.currentTarget.style.borderColor = "#cafd0040"}
          onBlur={e => e.currentTarget.style.borderColor = "#1e1e1c"}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          style={{
            width: 44, height: 44, borderRadius: "50%", border: "none",
            background: input.trim() ? "#cafd00" : "#1a1a18",
            color: input.trim() ? "#1a2200" : "#444",
            fontSize: 18, cursor: input.trim() ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.18s", flexShrink: 0,
          }}
        >→</button>
      </div>
    </main>
  );
}