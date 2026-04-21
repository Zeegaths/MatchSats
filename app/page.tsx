"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-black to-black" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="text-2xl font-bold tracking-[0.3em] text-cyan-400">MATCHSATS</div>
        <nav className="hidden md:flex items-center gap-8 text-sm tracking-wider text-zinc-400">
          <span className="hover:text-cyan-400 cursor-pointer transition-colors">SYNC</span>
          <span className="hover:text-cyan-400 cursor-pointer transition-colors">NETWORK</span>
          <span className="hover:text-cyan-400 cursor-pointer transition-colors">VAULT</span>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h1 className="text-[12vw] leading-[0.8] font-bold tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-600 animate-pulse">
          ENTER<br />THE<br />GRID
        </h1>
        
        <p className="mt-8 text-2xl md:text-4xl font-light tracking-[0.2em] text-zinc-400">
          THE<br /><span className="text-cyan-400">SEMANTIC</span><br />PULSE.
        </p>

        <div className="mt-12 flex items-center gap-4 px-6 py-3 border border-cyan-500/30 rounded-full bg-cyan-950/20">
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
          <span className="text-sm tracking-widest text-cyan-300">LIVE NETWORK FLOW: 2.4 BTC/S</span>
        </div>

        <p className="mt-6 max-w-xl text-zinc-500 text-sm leading-relaxed">
          Real-time liquidity coordination driven by Deep Sync AI. Your capital, matched with sovereign precision.
        </p>

        <div className="mt-12 flex flex-col md:flex-row gap-4">
          <button className="px-8 py-4 bg-cyan-500 text-black font-bold tracking-widest hover:bg-cyan-400 transition-all hover:scale-105">
            INITIALIZE SYNC
          </button>
          <button className="px-8 py-4 border border-cyan-500/50 text-cyan-400 tracking-widest hover:bg-cyan-950/30 transition-all">
            VIEW NETWORK
          </button>
        </div>
      </section>

      {/* Neural Sun Section */}
      <section className="relative z-10 py-24 px-8 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-wider mb-8">
            BEHOLD THE <span className="text-cyan-400">NEURAL SUN</span>
          </h2>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
            Synchronize your frequency with the elite network. Real-time matching powered by biological intelligence.
          </p>
          <button className="px-8 py-4 border border-cyan-500 text-cyan-400 tracking-widest hover:bg-cyan-950/30 transition-all">
            ENTER THE GRID
          </button>

          <div className="mt-16 flex items-center justify-center gap-2">
            <span className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-cyan-400 tracking-widest">PULSE ACTIVE: 1,421 SYNCHRONIZED</span>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="relative z-10 py-16 px-8 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400">99.9%</div>
            <div className="mt-2 text-xs tracking-widest text-zinc-500">UPTIME VELOCITY</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400">IDENTITY</div>
            <div className="mt-2 text-xs tracking-widest text-zinc-500">(LNURL)</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400">VERIFIED</div>
            <div className="mt-2 text-xs tracking-widest text-zinc-500">NODE PROTOCOL</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400">SOVEREIGN</div>
            <div className="mt-2 text-xs tracking-widest text-zinc-500">ESCROW</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="p-8 border border-zinc-800 bg-zinc-900/20">
            <div className="w-12 h-12 border border-cyan-500 flex items-center justify-center mb-6">
              <span className="text-cyan-400">⚡</span>
            </div>
            <h3 className="text-xl font-bold tracking-wider mb-4">DEEP SYNC AI</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Our neural matching engine predicts liquidity bottlenecks before they happen, optimizing your yield automatically.
            </p>
          </div>

          <div className="p-8 border border-zinc-800 bg-zinc-900/20">
            <div className="w-12 h-12 border border-cyan-500 flex items-center justify-center mb-6">
              <span className="text-cyan-400">🔐</span>
            </div>
            <h3 className="text-xl font-bold tracking-wider mb-4">LIGHTNING ESCROW</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Multi-sig trustlessness baked into every transaction. You hold the keys, we provide the venue.
            </p>
          </div>

          <div className="p-8 border border-zinc-800 bg-zinc-900/20">
            <div className="w-12 h-12 border border-cyan-500 flex items-center justify-center mb-6">
              <span className="text-cyan-400">🧠</span>
            </div>
            <h3 className="text-xl font-bold tracking-wider mb-4">NEURAL AUTH</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Advanced AI monitors the exchange, acting as a silent, digital judge for all grid interactions.
            </p>
          </div>
        </div>
      </section>

      {/* Neural Resonance */}
      <section className="relative z-10 py-24 px-8 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-wider mb-8">
            <span className="text-cyan-400">NEURAL</span> RESONANCE
          </h2>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            THE GRID NEVER SLEEPS • Matches aren&apos;t found; they are resonant frequencies discovered by our core. We bypass superficial data to align your core logic with the grid&apos;s elite nodes.
          </p>
          <div className="inline-flex items-center gap-4 px-6 py-3 border border-cyan-500/30">
            <span className="text-sm tracking-widest">PATTERN ALPHA</span>
            <span className="text-cyan-400">•</span>
            <span className="text-sm tracking-widest">BIO-SYNC TECH</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-8 text-center">
        <h2 className="text-5xl md:text-7xl font-bold tracking-wider mb-4">READY TO SYNC?</h2>
        <p className="text-xl text-zinc-400 mb-12">Join the most advanced peer-to-peer liquidity network on the planet.</p>
        
        <div className="flex flex-col items-center gap-4 mb-12">
          <div className="flex items-center gap-2 text-cyan-400">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-sm tracking-widest">LATENCY ZERO</span>
          </div>
          <p className="text-zinc-500 text-sm">Instantaneous peer-to-peer connection via the Lightning Network infrastructure.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
          <input 
            type="text" 
            placeholder="Enter grid node address..."
            className="w-full max-w-md px-6 py-4 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
          />
          <button className="px-8 py-4 bg-cyan-500 text-black font-bold tracking-widest hover:bg-cyan-400 transition-all">
            CONNECT NODE
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
          <button className="text-3xl font-bold tracking-[0.2em] hover:text-cyan-400 transition-colors">SYMMETRY</button>
          <button className="text-3xl font-bold tracking-[0.2em] hover:text-cyan-400 transition-colors">INITIATE</button>
          <button className="text-3xl font-bold tracking-[0.2em] hover:text-cyan-400 transition-colors">HANDSHAKE</button>
        </div>
      </section>

      {/* Blood Pact */}
      <section className="relative z-10 py-16 px-8 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-cyan-400 tracking-widest mb-4">IMMUTABLE TRUST</h3>
            <p className="text-zinc-500 text-sm">
              Collateralized satoshis ensure every interaction is backed by skin in the game. No fakes. No ghosts.
            </p>
          </div>
          <div>
            <h3 className="text-cyan-400 tracking-widest mb-4">INSTANT SETTLEMENT</h3>
            <p className="text-zinc-500 text-sm">
              Transactions resolve at the speed of light. Your value is unlocked as soon as the pact is honored.
            </p>
          </div>
          <div>
            <h3 className="text-cyan-400 tracking-widest mb-4">WATCH RESONANCE</h3>
            <p className="text-zinc-500 text-sm">
              ARE YOU COMPATIBLE? Multi-sig trustlessness baked into every transaction.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-8 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-2xl font-bold tracking-[0.3em] text-cyan-400">MATCHSATS</div>
          
          <div className="flex items-center gap-8 text-sm tracking-wider text-zinc-500">
            <span className="hover:text-cyan-400 cursor-pointer">Terms</span>
            <span className="hover:text-cyan-400 cursor-pointer">Privacy</span>
            <span className="hover:text-cyan-400 cursor-pointer">Docs</span>
            <span className="hover:text-cyan-400 cursor-pointer">API</span>
          </div>

          <div className="text-zinc-600 text-sm">
            © 2024 MatchSats. Powering the Pulse.
          </div>
        </div>
      </footer>
    </div>
  );
}