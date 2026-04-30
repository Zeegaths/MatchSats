"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────
type PinType = "match" | "venue" | "meetspot" | "me";
type MatchStatus = "meet-now" | "both-locked" | "new";

interface MapPin {
  id: string;
  type: PinType;
  name: string;
  role?: string;
  initials?: string;
  lat: number;
  lng: number;
  status?: MatchStatus;
  matchScore?: number;
  description?: string;
  capacity?: number;
  available?: boolean;
  color: string;
}

// ── Data — replace lat/lng with real Nostr profile locations ──────────
const CONFERENCE_CENTER = { lat: -1.2850, lng: 36.8155 };

const MAP_PINS: MapPin[] = [
  // Matches
  { id: "1",  type: "match", name: "Amara O.",  role: "Fintech Founder",     initials: "A", lat: -1.2838, lng: 36.8148, status: "meet-now",    matchScore: 94, color: "#cafd00" },
  { id: "2",  type: "match", name: "Dev X",     role: "Rust Developer",      initials: "D", lat: -1.2872, lng: 36.8221, status: "both-locked",  matchScore: 88, color: "#9d7bb8" },
  { id: "3",  type: "match", name: "Priya K.",  role: "VC Associate",        initials: "P", lat: -1.2815, lng: 36.8188, status: "new",          matchScore: 81, color: "#666" },
  { id: "4",  type: "match", name: "Kwame A.", role: "Protocol Engineer",    initials: "K", lat: -1.2863, lng: 36.8108, status: "new",          matchScore: 76, color: "#666" },
  // Venues
  { id: "v1", type: "venue", name: "Main Stage",       description: "Keynotes · Opening · Closing",          lat: -1.2850, lng: 36.8155, color: "#cafd00" },
  { id: "v2", type: "venue", name: "Builder's Den",    description: "Workshops · Hackathon space",           lat: -1.2832, lng: 36.8172, color: "#cafd00" },
  { id: "v3", type: "venue", name: "Lightning Lounge", description: "Lightning talks · Demo station",        lat: -1.2861, lng: 36.8140, color: "#cafd00" },
  { id: "v4", type: "venue", name: "Investor Corner",  description: "Closed sessions · Invite only",        lat: -1.2842, lng: 36.8200, color: "#cafd00" },
  // Meet spots
  { id: "s1", type: "meetspot", name: "Coffee Corner",      description: "Quiet · 4 seats · Great acoustics", lat: -1.2845, lng: 36.8138, color: "#9d7bb8", capacity: 4,  available: true },
  { id: "s2", type: "meetspot", name: "Outdoor Terrace",    description: "Open air · 8 seats · Shaded",       lat: -1.2870, lng: 36.8162, color: "#9d7bb8", capacity: 8,  available: true },
  { id: "s3", type: "meetspot", name: "Networking Hub",     description: "High-tops · Standing · Busy",       lat: -1.2825, lng: 36.8195, color: "#9d7bb8", capacity: 12, available: false },
  { id: "s4", type: "meetspot", name: "Quiet Room B",       description: "Private · Bookable · Soundproof",   lat: -1.2855, lng: 36.8178, color: "#9d7bb8", capacity: 2,  available: true },
];

const STATUS_CONFIG: Record<MatchStatus, { label: string; color: string; glow: boolean }> = {
  "meet-now":    { label: "MEET NOW",    color: "#cafd00", glow: true },
  "both-locked": { label: "BOTH LOCKED", color: "#9d7bb8", glow: true },
  "new":         { label: "NEW MATCH",   color: "#555",    glow: false },
};

const SCORE_COLOR = (s?: number) =>
  !s ? "#555" : s >= 90 ? "#cafd00" : s >= 80 ? "#9d7bb8" : "#666";

// ── Mapbox loader ─────────────────────────────────────────────────────
function useMapbox(containerRef: React.MutableRefObject<HTMLDivElement>, onLoad: (map: any, mbgl: any) => void) {
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    let map: any;

    const cssId = "mapbox-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId; link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css";
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.src = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js";
    script.onload = () => {
      const mbgl = (window as any).mapboxgl;
      mbgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
      if (!mbgl.accessToken) return; // show fallback

      map = new mbgl.Map({
        container: containerRef.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [CONFERENCE_CENTER.lng, CONFERENCE_CENTER.lat],
        zoom: 16, pitch: 45, bearing: -10,
        antialias: true,
      });

      // Custom dark overlay
      map.on("style.load", () => {
        map.setPaintProperty("background", "background-color", "#0a0a0a");
      });

      map.on("load", () => onLoad(map, mbgl));
    };
    document.head.appendChild(script);

    return () => { map?.remove(); };
  }, []);
}

export default function MapPage() {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLDivElement>;
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  const [mapReady, setMapReady] = useState(false);
  const [noToken, setNoToken] = useState(false);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [activeLayers, setActiveLayers] = useState<Set<PinType>>(new Set(["match", "venue", "meetspot"]));
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "granted" | "denied">("idle");
  const [view, setView] = useState<"map" | "list">("map");
  const [pulse, setPulse] = useState(true);

  // Pulse for live dots
  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 1200);
    return () => clearInterval(id);
  }, []);

  const handleMapLoad = useCallback((map: any, mbgl: any) => {
    mapInstance.current = map;
    setMapReady(true);
    renderMarkers(map, mbgl, activeLayers, setSelectedPin);
  }, []);

  useMapbox(mapRef, (map, mbgl) => {
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) { setNoToken(true); return; }
    handleMapLoad(map, mbgl);
  });

  // Re-render when layers change
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return;
    const mbgl = (window as any).mapboxgl;
    if (!mbgl) return;
    // Remove old
    markersRef.current.forEach(m => m.remove());
    markersRef.current.clear();
    renderMarkers(mapInstance.current, mbgl, activeLayers, setSelectedPin, markersRef);
  }, [activeLayers, mapReady]);

  function renderMarkers(
    map: any, mbgl: any,
    layers: Set<PinType>,
    onSelect: (p: MapPin) => void,
    ref?: React.MutableRefObject<Map<string, any>>,
  ) {
    MAP_PINS.forEach(pin => {
      if (!layers.has(pin.type)) return;
      const el = makePinEl(pin);
      el.addEventListener("click", () => onSelect(pin));
      const marker = new mbgl.Marker({ element: el })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map);
      ref?.current.set(pin.id, marker);
    });
  }

  function makePinEl(pin: MapPin): HTMLElement {
    const el = document.createElement("div");
    const size = pin.type === "match" ? 44 : pin.type === "venue" ? 36 : 32;
    const glow = pin.status === "meet-now" || pin.status === "both-locked";
    el.style.cssText = `
      width:${size}px; height:${size}px; border-radius:50%;
      background:${pin.color}20; border:2px solid ${pin.color}${glow ? "cc" : "60"};
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; font-family:'Space Grotesk',sans-serif;
      font-weight:800; font-size:${pin.type === "match" ? 15 : 17}px; color:${pin.color};
      box-shadow:0 0 ${glow ? 20 : 8}px ${pin.color}${glow ? "70" : "30"};
      transition:transform 0.15s,box-shadow 0.15s; position:relative;
    `;
    el.innerHTML = pin.type === "match" ? (pin.initials ?? "?")
      : pin.type === "venue" ? "◈" : "◉";
    if (pin.status === "meet-now") {
      const ring = document.createElement("div");
      ring.style.cssText = `position:absolute;inset:-6px;border-radius:50%;border:1.5px solid ${pin.color}40;animation:ping 2s ease-out infinite;`;
      el.appendChild(ring);
    }
    el.onmouseenter = () => { el.style.transform = "scale(1.2)"; el.style.boxShadow = `0 0 28px ${pin.color}80`; };
    el.onmouseleave = () => { el.style.transform = "scale(1)"; el.style.boxShadow = `0 0 ${glow ? 20 : 8}px ${pin.color}${glow ? "70" : "30"}`; };
    return el;
  }

  const flyTo = (pin: MapPin) => {
    mapInstance.current?.flyTo({ center: [pin.lng, pin.lat], zoom: 17.5, duration: 900, pitch: 50 });
    setSelectedPin(pin);
    setView("map");
  };

  const toggleLayer = (type: PinType) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const requestLocation = () => {
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocationStatus("granted");
        mapInstance.current?.flyTo({ center: [lng, lat], zoom: 17, duration: 1000 });
        // Add "me" marker
        const mbgl = (window as any).mapboxgl;
        if (mbgl && mapInstance.current) {
          const el = document.createElement("div");
          el.style.cssText = `width:16px;height:16px;border-radius:50%;background:#cafd00;border:3px solid #0a0a0a;box-shadow:0 0 20px rgba(202,253,0,0.8);`;
          new mbgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(mapInstance.current);
        }
      },
      () => setLocationStatus("denied"),
    );
  };

  const matches = MAP_PINS.filter(p => p.type === "match");
  const meetspots = MAP_PINS.filter(p => p.type === "meetspot");
  const venues = MAP_PINS.filter(p => p.type === "venue");

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes ping { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.8);opacity:0} }
        @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      `}</style>

      {/* ── Header ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(10,10,10,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid #111110", padding: "0.8rem 1rem", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "1px solid #1e1e1c", borderRadius: 99, color: "#666", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, cursor: "pointer", padding: "6px 14px", letterSpacing: 1, transition: "all 0.18s", flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#aaa"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1c"; e.currentTarget.style.color = "#666"; }}
        >←</button>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ color: "#cafd00", fontWeight: 700, fontSize: 13, letterSpacing: 2 }}>MATCHSATS</span>
            <span style={{ color: "#222", fontSize: 12 }}>·</span>
            <span style={{ color: "#888", fontSize: 12 }}>Bitcoin Unconference · Nairobi</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#cafd00", opacity: pulse ? 1 : 0.3, transition: "opacity 0.4s", boxShadow: pulse ? "0 0 5px #cafd00" : "none" }} />
            <span style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>{matches.length} MATCHES NEARBY</span>
          </div>
        </div>

        {/* Map / List toggle */}
        <div style={{ display: "flex", background: "#111110", borderRadius: 99, border: "1px solid #1e1e1c", padding: 3, gap: 2 }}>
          {(["map", "list"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "5px 14px", borderRadius: 99, border: "none",
              background: view === v ? "#cafd00" : "transparent",
              color: view === v ? "#1a2200" : "#555",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: 11, cursor: "pointer",
              letterSpacing: 1, transition: "all 0.18s",
            }}>{v.toUpperCase()}</button>
          ))}
        </div>

        {/* My location */}
        <button onClick={requestLocation} style={{
          display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
          background: "transparent", border: `1px solid ${locationStatus === "granted" ? "#cafd0040" : "#1e1e1c"}`,
          borderRadius: 99, color: locationStatus === "granted" ? "#cafd00" : "#555",
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 10,
          cursor: "pointer", padding: "6px 12px", letterSpacing: 1, transition: "all 0.18s",
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: locationStatus === "granted" ? "#cafd00" : locationStatus === "loading" ? "#ff8c42" : "#333", boxShadow: locationStatus === "granted" ? "0 0 6px #cafd00" : "none" }} />
          {locationStatus === "loading" ? "..." : locationStatus === "granted" ? "LIVE" : "LOCATE"}
        </button>
      </div>

      {/* ── Layer toggles ── */}
      <div style={{ display: "flex", gap: 6, padding: "10px 12px", background: "#0a0a0a", borderBottom: "1px solid #111110", overflowX: "auto", scrollbarWidth: "none" }}>
        {([
          { type: "match" as PinType, label: `People (${matches.length})`, color: "#cafd00" },
          { type: "venue" as PinType, label: `Venue (${venues.length})`, color: "#cafd00" },
          { type: "meetspot" as PinType, label: `Meet Spots (${meetspots.length})`, color: "#9d7bb8" },
        ]).map(({ type, label, color }) => {
          const active = activeLayers.has(type);
          return (
            <button key={type} onClick={() => toggleLayer(type)} style={{
              padding: "6px 14px", borderRadius: 99, fontSize: 11, flexShrink: 0,
              border: `1px solid ${active ? color + "50" : "#1e1e1c"}`,
              background: active ? color + "12" : "transparent",
              color: active ? color : "#444",
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
              cursor: "pointer", letterSpacing: 0.5, transition: "all 0.18s",
            }}>{label}</button>
          );
        })}
      </div>

      {/* ── Map view ── */}
      {view === "map" && (
        <div style={{ flex: 1, position: "relative" }}>
          <div ref={mapRef} style={{ width: "100%", height: "calc(100vh - 200px)", minHeight: 400 }} />

          {/* No token fallback */}
          {noToken && (
            <div style={{ position: "absolute", inset: 0, background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 24, animation: "fadeIn 0.4s ease" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#cafd0012", border: "2px solid #cafd0030", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🗺️</div>
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 18, margin: "0 0 8px" }}>Add your Mapbox token</p>
                <p style={{ color: "#666", fontSize: 13, margin: "0 0 16px", lineHeight: 1.6 }}>
                  Create a free account at mapbox.com then add to your <span style={{ color: "#cafd00", fontFamily: "monospace" }}>.env.local</span>
                </p>
                <div style={{ background: "#111110", border: "1px solid #1e1e1c", borderRadius: 12, padding: "12px 20px", fontFamily: "monospace", fontSize: 12, color: "#cafd00", textAlign: "left" }}>
                  NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token
                </div>
              </div>
              {/* Show pin list as fallback */}
              <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 8 }}>
                {matches.map(p => (
                  <div key={p.id} onClick={() => setSelectedPin(p)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 14, border: `1px solid ${p.color}30`, background: "#111110", cursor: "pointer", transition: "all 0.18s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = p.color + "60"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = p.color + "30"}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: p.color + "20", border: `1.5px solid ${p.color}50`, display: "flex", alignItems: "center", justifyContent: "center", color: p.color, fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{p.initials}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: 0 }}>{p.name}</p>
                      <p style={{ color: "#555", fontSize: 11, margin: 0 }}>{p.role}</p>
                    </div>
                    {p.status && <span style={{ fontSize: 9, fontWeight: 700, color: STATUS_CONFIG[p.status].color, letterSpacing: 1 }}>{STATUS_CONFIG[p.status].label}</span>}
                    <span style={{ color: SCORE_COLOR(p.matchScore), fontWeight: 900, fontSize: 18 }}>{p.matchScore}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected pin drawer */}
          {selectedPin && (
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20, background: "rgba(10,10,10,0.98)", backdropFilter: "blur(24px)", borderTop: `1px solid ${selectedPin.color}30`, borderRadius: "24px 24px 0 0", padding: "20px 20px 36px", animation: "slideUp 0.25s ease" }}>
              {/* Handle */}
              <div style={{ width: 36, height: 3, background: "#333", borderRadius: 99, margin: "0 auto 20px" }} />

              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: selectedPin.color + "20", border: `2px solid ${selectedPin.color}60`, display: "flex", alignItems: "center", justifyContent: "center", color: selectedPin.color, fontWeight: 800, fontSize: 20, flexShrink: 0, boxShadow: `0 0 20px ${selectedPin.color}30` }}>
                  {selectedPin.type === "match" ? selectedPin.initials : selectedPin.type === "venue" ? "◈" : "◉"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: 18, margin: 0 }}>{selectedPin.name}</p>
                    {selectedPin.matchScore && (
                      <span style={{ color: SCORE_COLOR(selectedPin.matchScore), fontWeight: 900, fontSize: 18 }}>{selectedPin.matchScore}</span>
                    )}
                    {selectedPin.status && (
                      <span style={{ background: STATUS_CONFIG[selectedPin.status].color + "15", border: `1px solid ${STATUS_CONFIG[selectedPin.status].color}40`, color: STATUS_CONFIG[selectedPin.status].color, fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 99, letterSpacing: 1 }}>
                        {STATUS_CONFIG[selectedPin.status].label}
                      </span>
                    )}
                  </div>
                  <p style={{ color: "#666", fontSize: 13, margin: 0 }}>{selectedPin.role ?? selectedPin.description}</p>
                  {selectedPin.type === "meetspot" && selectedPin.capacity && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <span style={{ color: selectedPin.available ? "#cafd00" : "#ff6666", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
                        {selectedPin.available ? "● AVAILABLE" : "● OCCUPIED"}
                      </span>
                      <span style={{ color: "#444", fontSize: 10 }}>· {selectedPin.capacity} seats</span>
                    </div>
                  )}
                </div>
                <button onClick={() => setSelectedPin(null)} style={{ background: "none", border: "1px solid #1e1e1c", borderRadius: "50%", color: "#555", width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>✕</button>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                {selectedPin.type === "match" && (<>
                  <button onClick={() => router.push(`/matches/${selectedPin.id}/dm`)} style={{ flex: 1, padding: "13px", borderRadius: 99, background: "transparent", border: "1px solid #9d7bb840", color: "#9d7bb8", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 1, transition: "all 0.18s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#9d7bb815"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >MESSAGE ◈</button>
                  <button onClick={() => router.push(`/matches/${selectedPin.id}`)} style={{ flex: 1, padding: "13px", borderRadius: 99, background: "#cafd00", border: "none", color: "#1a2200", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 12, cursor: "pointer", letterSpacing: 1, boxShadow: "0 0 20px rgba(202,253,0,0.25)" }}>VIEW PROFILE</button>
                </>)}
                {selectedPin.type === "meetspot" && (
                  <button style={{ flex: 1, padding: "13px", borderRadius: 99, background: selectedPin.available ? "#9d7bb820" : "#1a1a18", border: `1px solid ${selectedPin.available ? "#9d7bb840" : "#2a2a28"}`, color: selectedPin.available ? "#9d7bb8" : "#444", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, cursor: selectedPin.available ? "pointer" : "default", letterSpacing: 1 }}>
                    {selectedPin.available ? "SUGGEST AS MEETING SPOT" : "CURRENTLY OCCUPIED"}
                  </button>
                )}
                {selectedPin.type === "venue" && (
                  <button style={{ flex: 1, padding: "13px", borderRadius: 99, background: "#cafd0010", border: "1px solid #cafd0030", color: "#cafd00", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 1 }}>
                    VIEW SESSIONS HERE
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── List view ── */}
      {view === "list" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 20, animation: "fadeIn 0.2s ease" }}>

          {/* Matches */}
          {activeLayers.has("match") && (
            <div>
              <p style={{ color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 10px" }}>NEARBY MATCHES</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {matches.map(p => (
                  <div key={p.id} onClick={() => flyTo(p)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, border: `1px solid ${p.color}25`, background: "#111110", cursor: "pointer", transition: "all 0.18s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = p.color + "50"; e.currentTarget.style.background = "#141412"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = p.color + "25"; e.currentTarget.style.background = "#111110"; }}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: p.color + "20", border: `2px solid ${p.color}50`, display: "flex", alignItems: "center", justifyContent: "center", color: p.color, fontWeight: 800, fontSize: 16, flexShrink: 0, boxShadow: p.status !== "new" ? `0 0 12px ${p.color}40` : "none" }}>{p.initials}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: "#fff", fontWeight: 600, fontSize: 15, margin: "0 0 2px" }}>{p.name}</p>
                      <p style={{ color: "#555", fontSize: 12, margin: 0 }}>{p.role}</p>
                    </div>
                    {p.status && <span style={{ color: STATUS_CONFIG[p.status].color, fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>{STATUS_CONFIG[p.status].label}</span>}
                    <span style={{ color: SCORE_COLOR(p.matchScore), fontWeight: 900, fontSize: 20, minWidth: 28, textAlign: "right" }}>{p.matchScore}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meet spots */}
          {activeLayers.has("meetspot") && (
            <div>
              <p style={{ color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 10px" }}>MEET SPOTS</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {meetspots.map(p => (
                  <div key={p.id} onClick={() => flyTo(p)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, border: "1px solid #1e1e1c", background: "#111110", cursor: "pointer", transition: "all 0.18s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#9d7bb840"; e.currentTarget.style.background = "#141412"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1c"; e.currentTarget.style.background = "#111110"; }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#9d7bb820", border: "1.5px solid #9d7bb840", display: "flex", alignItems: "center", justifyContent: "center", color: "#9d7bb8", fontSize: 16, flexShrink: 0 }}>◉</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: "0 0 2px" }}>{p.name}</p>
                      <p style={{ color: "#555", fontSize: 12, margin: 0 }}>{p.description}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ color: p.available ? "#cafd00" : "#ff6666", fontSize: 10, fontWeight: 700, margin: 0 }}>{p.available ? "FREE" : "BUSY"}</p>
                      <p style={{ color: "#444", fontSize: 10, margin: 0 }}>{p.capacity} seats</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Venues */}
          {activeLayers.has("venue") && (
            <div>
              <p style={{ color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 10px" }}>VENUE ROOMS</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {venues.map(p => (
                  <div key={p.id} onClick={() => flyTo(p)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, border: "1px solid #1e1e1c", background: "#111110", cursor: "pointer", transition: "all 0.18s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#cafd0030"; e.currentTarget.style.background = "#141412"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1c"; e.currentTarget.style.background = "#111110"; }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#cafd0015", border: "1.5px solid #cafd0030", display: "flex", alignItems: "center", justifyContent: "center", color: "#cafd00", fontSize: 16, flexShrink: 0 }}>◈</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: "0 0 2px" }}>{p.name}</p>
                      <p style={{ color: "#555", fontSize: 12, margin: 0 }}>{p.description}</p>
                    </div>
                    <span style={{ color: "#cafd00", fontSize: 14 }}>→</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Bottom people strip (map view only) ── */}
      {view === "map" && !selectedPin && (
        <div style={{ borderTop: "1px solid #111110", padding: "12px 14px", background: "rgba(10,10,10,0.97)", backdropFilter: "blur(12px)" }}>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", scrollbarWidth: "none" }}>
            {matches.map(p => (
              <div key={p.id} onClick={() => flyTo(p)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer", flexShrink: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: p.color + "20", border: `2px solid ${p.color}${p.status !== "new" ? "80" : "40"}`, display: "flex", alignItems: "center", justifyContent: "center", color: p.color, fontWeight: 800, fontSize: 15, transition: "all 0.18s", boxShadow: p.status === "meet-now" ? `0 0 14px ${p.color}60` : "none" }}>{p.initials}</div>
                <p style={{ color: "#555", fontSize: 9, fontWeight: 700, margin: 0, maxWidth: 48, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name.split(" ")[0]}</p>
                {p.status !== "new" && <div style={{ width: 4, height: 4, borderRadius: "50%", background: STATUS_CONFIG[p.status!].color, boxShadow: `0 0 4px ${STATUS_CONFIG[p.status!].color}` }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}