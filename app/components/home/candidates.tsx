import Link from "next/link";

const candidateFeatures = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-[#2563eb]">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Personalized Job Matching",
    desc: "Skip applications. We match you to roles where you are objectively likely to succeed and stand out.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-[#2563eb]">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: "Profile Optimization",
    desc: "HireSense can rewrite your online profile to surface the strongest signals and best position your skills.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-[#2563eb]">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    title: "Application Tracking",
    desc: "Transparent tracking of your application status gives you live visibility on where you stand at every stage.",
  },
];

export default function CandidateSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-[20px] font-semibold text-[#1e3a5f] tracking-[0.14em] uppercase mb-3">
              FOR CANDIDATES
            </p>
            <h2 className="text-[2rem] lg:text-[2.4rem] font-bold text-slate-900 leading-tight">
              Land Your Dream Role
            </h2>
          </div>
          
        </div>

        {/* 3 feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {candidateFeatures.map((f, i) => (
            <div key={i} className="border border-slate-100 rounded-2xl p-6 hover:shadow-md hover:border-slate-200 transition-all">
              <div className="w-9 h-9 rounded-xl bg-[#eff6ff] flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-[14px] font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-[13px] text-slate-700 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}