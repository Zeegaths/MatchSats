"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

interface Toast {
  id: string;
  type: "message" | "locked" | "confirmed" | "both_locked";
  title: string;
  body: string;
  matchId?: number;
  createdAt: number;
}

const TYPE_CONFIG = {
  message:    { icon: "💬", color: "#9d7bb8", border: "#9d7bb840" },
  locked:     { icon: "⚡", color: "#cafd00", border: "#cafd0040" },
  both_locked:{ icon: "🔒", color: "#cafd00", border: "#cafd0040" },
  confirmed:  { icon: "✓",  color: "#9d7bb8", border: "#9d7bb840" },
};

export default function NotificationToast() {
  const router = useRouter();
  const pathname = usePathname();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastCheckRef = useRef<number>(Date.now());
  const seenRef = useRef<Set<string>>(new Set());

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `${toast.type}-${toast.createdAt}`;
    if (seenRef.current.has(id)) return;
    seenRef.current.add(id);
    setToasts(prev => [...prev.slice(-2), { ...toast, id }]); // max 3 at once
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const poll = useCallback(async () => {
    try {
      const since = lastCheckRef.current;
      const res = await fetch(`/api/notifications?since=${since}`);
      if (!res.ok) return;
      const data = await res.json();
      lastCheckRef.current = data.timestamp;

      // New messages
      for (const msg of data.newMessages ?? []) {
        // Don't notify if already on that DM page
        if (pathname === `/matches/${msg.match_id}/dm`) continue;
        addToast({
          type: "message",
          title: msg.sender_name ?? "New message",
          body: msg.content.length > 60 ? msg.content.slice(0, 60) + "..." : msg.content,
          matchId: msg.match_id,
          createdAt: msg.created_at,
        });
      }

      // Match status changes
      for (const update of data.matchUpdates ?? []) {
        // Don't notify if already on that match page
        if (pathname === `/matches/${update.id}`) continue;

        if (update.status === "locked_a" || update.status === "locked_b") {
          addToast({
            type: "locked",
            title: `${update.other_name} locked the match ⚡`,
            body: "Lock yours to confirm the meeting.",
            matchId: update.id,
            createdAt: update.updated_at,
          });
        } else if (update.status === "both_locked") {
          addToast({
            type: "both_locked",
            title: "Match locked by both 🔒",
            body: `You and ${update.other_name} are committed. Go meet!`,
            matchId: update.id,
            createdAt: update.updated_at,
          });
        } else if (update.status === "confirmed") {
          addToast({
            type: "confirmed",
            title: "Meeting confirmed ✓",
            body: `Your sats with ${update.other_name} are being released.`,
            matchId: update.id,
            createdAt: update.updated_at,
          });
        }
      }
    } catch {}
  }, [pathname, addToast]);

  // Poll every 10 seconds
  useEffect(() => {
    const id = setInterval(poll, 10000);
    return () => clearInterval(id);
  }, [poll]);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      top: 16,
      right: 16,
      left: 16,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      pointerEvents: "none",
      maxWidth: 400,
      margin: "0 auto",
    }}>
      {toasts.map(toast => {
        const cfg = TYPE_CONFIG[toast.type];
        return (
          <div
            key={toast.id}
            onClick={() => {
              dismiss(toast.id);
              if (toast.matchId) {
                router.push(toast.type === "message"
                  ? `/matches/${toast.matchId}/dm`
                  : `/matches/${toast.matchId}`
                );
              }
            }}
            style={{
              background: "#111110",
              border: `1px solid ${cfg.border}`,
              borderRadius: 16,
              padding: "14px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              cursor: toast.matchId ? "pointer" : "default",
              pointerEvents: "all",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              animation: "slideDown 0.3s ease",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Icon */}
            <div style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: `${cfg.color}15`,
              border: `1px solid ${cfg.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}>
              {cfg.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: cfg.color, fontWeight: 700, fontSize: 13, margin: "0 0 3px", fontFamily: "'Space Grotesk', sans-serif" }}>
                {toast.title}
              </p>
              <p style={{ color: "#777", fontSize: 12, margin: 0, lineHeight: 1.5, fontFamily: "'Space Grotesk', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {toast.body}
              </p>
            </div>

            {/* Dismiss */}
            <button
              onClick={e => { e.stopPropagation(); dismiss(toast.id); }}
              style={{
                background: "none", border: "none", color: "#444",
                fontSize: 16, cursor: "pointer", padding: 0,
                flexShrink: 0, lineHeight: 1,
              }}
            >✕</button>

            {/* Progress bar */}
            <div style={{
              position: "absolute",
              bottom: 0, left: 0,
              height: 2,
              background: cfg.color,
              borderRadius: "0 0 16px 16px",
              animation: "shrink 5s linear forwards",
              width: "100%",
            }} />
          </div>
        );
      })}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}
