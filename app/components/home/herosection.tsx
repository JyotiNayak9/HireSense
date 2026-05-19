import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="pt-14 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-0 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left text */}
        <div>
          <h1 className="font-bold text-[2.6rem] lg:text-[3.2rem] leading-[1.12] text-slate-900 tracking-tight mb-5">
            The Future of Precision<br />
            Hiring is{" "}
            <span className="text-[#2563eb]">Here.</span>
          </h1>
          <p className="text-slate-700 text-[18px] leading-relaxed max-w-sm mb-8">
            HireSense uses advanced AI to rank candidates with frightening accuracy, helping you find superior talent in minutes, not days.
          </p>
        
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1e3a5f] text-white text-sm font-semibold hover:bg-[#162d4a] transition-colors shadow-sm"
            >
              Get Started 
            </Link>

        </div>

        {/* Right: Dashboard mockup */}
        <div className="relative flex justify-center lg:justify-end">
          {/* Outer rounded card with blue-tint bg */}
          <div className="relative w-full max-w-[460px] bg-[#eef3ff] rounded-3xl p-5 shadow-sm">
            {/* Mini dashboard */}
            <div className="bg-[#1e3a5f] rounded-2xl p-5 shadow-lg mb-3">
              {/* Fake chart header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1"> Overview</p>
                  <p className="text-white font-bold text-lg">247 Candidates</p>
                </div>
                <div className="flex gap-1">
                  {["Active", "Review"].map((t) => (
                    <span key={t} className="text-[10px] text-white/60 bg-white/10 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
              {/* Fake donut / circle graphic */}
              <div className="flex items-center justify-center py-4">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#60a5fa" strokeWidth="14"
                      strokeDasharray="239" strokeDashoffset="60" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#a5b4fc" strokeWidth="14"
                      strokeDasharray="239" strokeDashoffset="180" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-white font-bold text-xl">74%</span>
                    <span className="text-white/50 text-[9px]">matched</span>
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div className="flex justify-center gap-5 mt-1">
                {[["#60a5fa", "Qualified"], ["#a5b4fc", "Review"], ["rgba(255,255,255,0.15)", "Pending"]].map(([c, l]) => (
                  <div key={l} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: c }} />
                    <span className="text-[10px] text-white/50">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom candidate cards */}
            <div className="space-y-2">
              {[
                { name: "Jyoti Nayak", role: "Senior Engineer", score: 94, color: "#22c55e" },
                { name: "Prerana Kafle", role: "Product Designer", score: 88, color: "#3b82f6" },
              ].map((c) => (
                <div key={c.name} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ background: c.color + "33", color: c.color }}
                    >
                      {c.name[0]}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-slate-800">{c.name}</p>
                      <p className="text-[10px] text-slate-400">{c.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="text-[11px] font-bold" style={{ color: c.color }}>{c.score}%</div>
                    <div className="text-[10px] text-slate-400">match</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating tag */}
            {/* <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-md px-3.5 py-2.5 flex items-center gap-2 border border-slate-100">
              <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-green-600">
                  <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-800">Auto Shortlist</p>
                <p className="text-[10px] text-slate-400">12 candidates ready</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Soft bottom separator */}
      <div className="h-16" />
    </section>
  );
}