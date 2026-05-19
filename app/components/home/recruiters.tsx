import Link from "next/link";

const recruiterFeatures = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-[#2563eb]">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "AI-Powered Ranking",
    desc: "Our model evaluates, scores, and ranks candidates based on real-world job requirements to surface the best-fit talent in seconds.",
  
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-[#2563eb]">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Deep Talent Insights",
    desc: "Uncover hidden strengths and potential skill gaps. HireSense provides a comprehensive technical audit of every resume.",
  
  },
];

export default function RecruiterSection() {
  return (
    <section className="py-20 bg-[#f0f4ff]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Label */}
        <p className="text-[20px] font-semibold text-[#1e3a5f] tracking-[0.14em] uppercase mb-3">
          FOR RECRUITERS
        </p>
       

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Left: text feature cards stacked */}
          <div className="flex flex-col gap-5">
            {recruiterFeatures.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-7 border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-xl bg-[#eff6ff] flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-[15px] font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed mb-4">{f.desc}</p>
                
              </div>
            ))}
          </div>

          {/* Right: dark featured card */}
          <div className="bg-[#1e3a5f] rounded-2xl p-7 flex flex-col justify-between min-h-[270px] relative overflow-hidden">
            {/* Subtle bg circles */}
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

            <div className="relative z-10">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="w-5 h-5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-[18px] mb-3">Automated Shortlisting</h3>
              <p className="text-white/55 text-[13px] leading-relaxed">
                Reduce screening time by 70%. Please only the candidates that match your talent with software.
              </p>
            </div>

            {/* Fake mini bar chart */}
            <div className="relative z-10 mt-8">
              <div className="flex items-end gap-1.5 h-16">
                {[40, 65, 50, 80, 55, 90, 70, 85, 60, 95].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      background: i === 9 ? "#60a5fa" : "rgba(255,255,255,0.15)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}