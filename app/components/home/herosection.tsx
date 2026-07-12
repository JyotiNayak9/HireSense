import OpenRegisterButton from "./OpenRegisterButton";

export default function HeroSection() {
  return (
    <section className="relative pt-20 pb-18 bg-white overflow-hidden border-b border-slate-200">
      {/* Structural Humanist Grid Graphic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_75%,transparent_100%)] pointer-events-none -z-10" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#18317a]/5 rounded-full filter blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid lg:grid-cols-[1.15fr_0.85fr] gap-20 items-center relative z-10">
        
        {/* Left Dossier Typography Section */}
        <div className="space-y-8 text-left">
          
          <h1 className="font-black text-5xl sm:text-6xl lg:text-[4rem] leading-[1.05] text-slate-800 tracking-tight">
            The Future of Precision<br />
            Hiring is Here.
          </h1>
          
          <p className="text-slate-700 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl">
HireSense automatically ranks applicants based on their relevance, making the hiring process faster and more organized.          </p>
        
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            <OpenRegisterButton
              label="Get Started"
              className="inline-flex items-center justify-center gap-3 px-8 h-14 rounded-xl bg-[#18317a] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#12255c] transition-all shadow-md active:scale-[0.99]"
            />
          </div>
        </div>

        {/* Right Dashboard Data Mockup Grid */}
        <div className="relative w-full flex justify-center mt-5 lg:justify-end">
          <div className="relative w-full max-w-[480px] bg-slate-50 border border-slate-300 rounded-3xl p-6 shadow-md">
            
            {/* Dark High-Contrast Analytical Chart Box */}
            <div className="bg-slate-950 rounded-2xl p-6 shadow-inner mb-5 border border-slate-800">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-slate-400 text-xs font-bold tracking-widest uppercase">System Overview</span>
                  <p className="text-white font-black text-2xl tracking-tight mt-1">247 Candidates</p>
                </div>
                <div className="flex gap-2">
                  {["Active", "Review"].map((t) => (
                    <span key={t} className="text-xs font-bold tracking-wide text-white bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">{t}</span>
                  ))}
                </div>
              </div>
              
              {/* Process Chart Display Container */}
              <div className="flex items-center justify-center py-6">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="10" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="#18317a" 
                      strokeWidth="10"
                      strokeDasharray="251.2" 
                      strokeDashoffset="65.3" 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-white font-black text-3xl tracking-tight">74%</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Avg Index</span>
                  </div>
                </div>
              </div>
              
              {/* Segment Legends */}
              <div className="flex justify-center gap-6 mt-2 border-t border-slate-800 pt-4">
                {[["#18317a", "Qualified Match"], ["#1e293b", "Unranked Pool"]].map(([c, l]) => (
                  <div key={l} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: c }} />
                    <span className="text-xs font-bold text-slate-300">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidates Data Rows with Bold Dark Text Typography */}
            <div className="space-y-3">
              {[
                { name: "Jyoti Nayak", role: "Senior Engineer", score: 94, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", avatar: "JN" },
                { name: "Prerana Kafle", role: "Product Designer", score: 88, color: "text-[#18317a]", bg: "bg-blue-50 border-blue-200", avatar: "PK" },
                { name: "Nitu Kushwaha", role: "Frontend Dev", score: 91, color: "text-violet-700", bg: "bg-violet-50 border-violet-200", avatar: "NK" },
              ].map((c) => (
                <div key={c.name} className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-300 shadow-sm">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-xl ${c.bg} border flex items-center justify-center ${c.color} text-sm font-black shrink-0`}>
                      {c.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-950 truncate">{c.name}</p>
                      <p className="text-xs font-bold text-slate-600 truncate">{c.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-right">
                    <span className={`text-sm font-black ${c.color}`}>{c.score}%</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Match</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}