"use client";

import { useRouter } from "next/navigation";

export default function HeroButtons() {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-center sm:items-start pt-4 w-full">
      <button 
        className="w-full sm:w-auto bg-[#cafd00] flex items-center justify-center py-3 px-3 sm:py-4 sm:px-5 rounded-3xl sm:rounded-[48px] shadow-[0px_0px_30px_0px_rgba(202,253,0,0.3)] cursor-pointer"
        onClick={() => router.push("/login")}
      >
        <span className="font-['Space_Grotesk:Bold',sans-serif] font-bold text-[#3a4a00] text-sm sm:text-base text-center tracking-wider uppercase">
          INITIALIZE SYNC
        </span>
      </button>
      <button 
        className="w-full sm:w-auto flex items-center justify-center py-3 px-6 sm:py-4 sm:px-8 rounded-3xl sm:rounded-[48px] cursor-pointer bg-transparent border border-[#494847]"
        onClick={() => router.push("/matches")}
      >
        <span className="font-['Space_Grotesk:Bold',sans-serif] font-bold text-sm sm:text-base text-center text-white tracking-wider uppercase">
          VIEW NETWORK
        </span>
      </button>
    </div>
  );
}