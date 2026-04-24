export default function Footer() {
  return (
    <footer className="w-full py-12 md:py-16 px-6 md:px-10 bg-[#0e0e0e] border-t border-[#494847]/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 font-['Plus_Jakarta_Sans'] text-sm tracking-wide">
        <div className="text-[#CCFF00] font-black tracking-widest uppercase text-lg">
          MatchSats
        </div>
        <div className="flex gap-6 md:gap-10">
          <a className="text-[#777575] hover:text-[#CCFF00] transition-colors" href="#">
            Terms
          </a>
          <a className="text-[#777575] hover:text-[#CCFF00] transition-colors" href="#">
            Privacy
          </a>
          <a className="text-[#777575] hover:text-[#CCFF00] transition-colors" href="#">
            Docs
          </a>
          <a className="text-[#777575] hover:text-[#CCFF00] transition-colors" href="#">
            API
          </a>
        </div>
        <div className="text-[#777575] opacity-80 hover:opacity-100 transition-opacity">
          &copy; 2025 MatchSats. Powering the Pulse.
        </div>
      </div>
    </footer>
  );
}