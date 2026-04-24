"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0e0e0e]/60 backdrop-blur-[40px] shadow-[0_10px_40px_rgba(204,255,0,0.04)] px-6 md:px-10 py-4 md:py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span 
            className="text-2xl font-black tracking-tighter text-[#CCFF00] italic font-['Space_Grotesk:Bold',sans-serif] uppercase cursor-pointer"
            onClick={() => router.push("/")}
          >
            MatchSats
          </span>
        </div>

        <nav className="hidden md:flex gap-12 items-center">
          <a className="font-['Space_Grotesk:Bold',sans-serif] tracking-tighter uppercase font-bold text-[#777575] hover:text-white hover:scale-105 transition-all duration-300" href="#">
            Sync
          </a>
          <a className="font-['Space_Grotesk:Bold',sans-serif] tracking-tighter uppercase font-bold text-[#777575] hover:text-white hover:scale-105 transition-all duration-300" href="#">
            Network
          </a>
          <a className="font-['Space_Grotesk:Bold',sans-serif] tracking-tighter uppercase font-bold text-[#777575] hover:text-white hover:scale-105 transition-all duration-300" href="#">
            Vault
          </a>
        </nav>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-4 items-center">
            <span 
              className="material-symbols-outlined text-[#777575] hover:text-[#CCFF00] cursor-pointer transition-all text-2xl"
              onClick={() => router.push("/profile")}
            >sensors</span>
            <span 
              className="material-symbols-outlined text-[#777575] hover:text-[#CCFF00] cursor-pointer transition-all text-2xl"
              onClick={() => router.push("/profile")}
            >account_circle</span>
          </div>
          <button 
            className="hidden md:block bg-[#cafd00] text-[#3a4a00] font-['Space_Grotesk:Bold',sans-serif] font-bold uppercase text-sm tracking-tighter px-6 md:px-8 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(202,253,0,0.4)] transition-all"
            onClick={() => router.push("/matches")}
          >
            Enter the Grid
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-[#777575] hover:text-white p-2"
          >
            <span className="material-symbols-outlined text-3xl">
              {menuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#0e0e0e]/95 border-t border-[#494847] px-6 py-8 mt-4">
          <nav className="flex flex-col gap-6">
            <a className="font-['Space_Grotesk:Bold',sans-serif] tracking-tighter uppercase font-bold text-[#777575] hover:text-white transition-all text-lg py-2" href="#">
              Sync
            </a>
            <a className="font-['Space_Grotesk:Bold',sans-serif] tracking-tighter uppercase font-bold text-[#777575] hover:text-white transition-all text-lg py-2" href="#">
              Network
            </a>
            <a className="font-['Space_Grotesk:Bold',sans-serif] tracking-tighter uppercase font-bold text-[#777575] hover:text-white transition-all text-lg py-2" href="#">
              Vault
            </a>
            <button 
              className="bg-[#cafd00] text-[#3a4a00] font-['Space_Grotesk:Bold',sans-serif] font-bold uppercase text-sm tracking-tighter px-8 py-4 rounded-xl mt-4"
              onClick={() => router.push("/profile")}
            >
              Enter the Grid
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}