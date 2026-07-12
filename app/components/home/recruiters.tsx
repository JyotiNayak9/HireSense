import Link from "next/link";

const recruiterFeatures = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Automated Ranking System",
    desc: "Our model evaluates, scores, and lists candidates based on multi-variable job parameters to surface high-priority technical talent.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Analytics Matrix",
    desc: "Uncover structural applicant strengths and mapping mismatches. HireSense provides a precise, clear technical audit of every resume.",
  },
];

export default function RecruiterSection() {
  return (
    <section className="relative py-10 bg-white overflow-hidden">
      {/* Structural Accent Frame Positioning */}
      <div className="absolute  left-0 w-80 h-80 bg-slate-50 border border-slate-200/60 rounded-full filter blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Core Subsection Label Tag */}
        
        <h2 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight mb-4">
          Find Top Candidates
        </h2>
        <p className="text-slate-700 text-lg sm:text-xl font-medium max-w-3xl leading-relaxed mb-16">
Identify the most suitable candidates quickly and accurately by matching their skills with the job requirements. Reduce the time spent reviewing unsuitable applications and focus on qualified candidates.        </p>

        <div className="grid lg:grid-cols-2 gap-10 items-stretch">
          
          {/* Left Block: Stacked Feature Vectors */}
          <div className="flex flex-col gap-6 justify-between">
            {recruiterFeatures.map((f, i) => (
              <div 
                key={i} 
                className="bg-slate-50 rounded-2xl p-8 border border-slate-300 shadow-xs flex gap-6 items-start"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white border border-slate-300 text-[#18317a] shrink-0 shadow-xs">
                  {f.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-950">{f.title}</h3>
                  <p className="text-slate-700 text-sm font-medium leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Block: Dark High-Contrast Panel Metric Display */}
          <div className="bg-slate-950 rounded-3xl p-8 flex flex-col justify-between min-h-[360px] border border-slate-800 shadow-sm relative overflow-hidden">
            
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#18317a] border border-blue-800 text-white shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <h3 className="text-white font-black text-2xl tracking-tight">Automated Shortlisting Infrastructure</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
Automatically analyze candidate information and track how well each applicant matches the job requirements.              </p>
            </div>

            {/* Micro Dashboard Analytics Visuals */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-end justify-between gap-6">
              
              {/* Data Bars */}
              <div className="flex items-end gap-1.5 h-16 flex-grow max-w-[200px]">
                {[35, 55, 45, 75, 50, 90, 65, 80].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm transition-all duration-300"
                    style={{
                      height: `${h}%`,
                      background: i === 5 ? "#18317a" : "#1e293b",
                    }}
                  />
                ))}
              </div>

              {/* Data Values Grid */}
              <div className="flex gap-6 shrink-0">
                <div>
                  <div className="text-3xl font-black text-white tracking-tight">70%</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Time Extracted</div>
                </div>
               
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}