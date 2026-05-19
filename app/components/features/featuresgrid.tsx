const categories = [
  {
    label: "Sourcing & Ranking",
    color: "text-blue-accent bg-blue-accent/8",
    features: [
      {
        title: "AI Match Engine",
        desc: "Evaluates 200+ data points per candidate to produce a precision match score against any job description.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        ),
      },
      {
        title: "Semantic CV Parsing",
        desc: "Goes beyond keywords — understands context, role progression, and implied competencies.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
          </svg>
        ),
      },
      {
        title: "Multi-source Ingestion",
        desc: "Pull candidates from LinkedIn, job boards, email, or CSV — all ranked in one unified pipeline.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
            <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Pipeline Management",
    color: "text-violet-600 bg-violet-50",
    features: [
      {
        title: "Smart Pipelines",
        desc: "Drag-free stage management — candidates advance automatically based on score thresholds you set.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
          </svg>
        ),
      },
      {
        title: "Collaborative Notes",
        desc: "Leave timestamped notes, tag teammates, and align on candidates without leaving the platform.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
      },
      {
        title: "One-click Scheduling",
        desc: "Send interview invites with calendar availability baked in — no back-and-forth needed.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Analytics & Compliance",
    color: "text-emerald-700 bg-emerald-50",
    features: [
      {
        title: "Hiring Analytics",
        desc: "Track time-to-hire, drop-off points, and source quality — all in a real-time dashboard.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
            <path d="M18 20V10M12 20V4M6 20v-6" />
          </svg>
        ),
      },
      {
        title: "Bias Audit",
        desc: "Real-time fairness monitoring with full audit logs — meet DEI goals and compliance requirements.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        ),
      },
      {
        title: "Custom Reports",
        desc: "Export board-ready hiring reports or schedule automated summaries to stakeholders.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        ),
      },
    ],
  },
];

export default function FeaturesGrid() {
  return (
    <section className="py-8 pb-24 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-14">
        {categories.map((cat, ci) => (
          <div key={ci}>
            {/* Category label */}
            <div className="flex items-center gap-3 mb-7">
              <span className={`text-[10px] font-bold tracking-[0.14em] uppercase px-2.5 py-1 rounded-full ${cat.color}`}>
                {cat.label}
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            {/* 3-col cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {cat.features.map((f, fi) => (
                <div
                  key={fi}
                  className="group border border-slate-100 rounded-2xl p-6 hover:shadow-md hover:border-slate-200 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#eff6ff] flex items-center justify-center text-blue-accent mb-4 group-hover:bg-blue-accent group-hover:text-white transition-all">
                    {f.icon}
                  </div>
                  <h3 className="text-[14px] font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}