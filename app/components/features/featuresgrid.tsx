import React from 'react';

const categories = [
  {
    label: "Resume Parsing & Ranking Engine",
    color: "text-[#18317a] bg-slate-100 border-slate-300",
    features: [
      {
        title: "Algorithmic Match Evaluation",
        desc: "Analyzes extracted candidate credentials against structured job properties to calculate an objective match index.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        ),
      },
      {
        title: "Structured CV Text Parsing",
        desc: "Extracts block text arrays from raw resume files and maps them into clear data objects like technical skills and projects.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
          </svg>
        ),
      },
      {
        title: "Data Batch Ingestion",
        desc: "Supports importing candidate datasets directly via structured comma-separated spreadsheets (CSV) or manual file uploads.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Evaluation Pipeline Modules",
    color: "text-[#18317a] bg-slate-100 border-slate-300",
    features: [
      {
        title: "Automated Stage Routing",
        desc: "Moves candidate record sets between internal evaluation pools dynamically based on custom threshold rules.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
          </svg>
        ),
      },
      {
        title: "Internal Review Logs",
        desc: "Provides clean evaluation notes and audit trails directly linked to the student profile layout for simple validation.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
      },
      {
        title: "Applicant Timeline Tracker",
        desc: "Displays direct progress timelines showing whether a submission is currently in screening, review, or shortlist stages.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Analytics & System Logs",
    color: "text-[#18317a] bg-slate-100 border-slate-300",
    features: [
      {
        title: "Processing Performance Charts",
        desc: "Tracks pipeline metric totals, time delays, and average applicant matches through clean dashboard visualization elements.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <path d="M18 20V10M12 20V4M6 20v-6" />
          </svg>
        ),
      },
      {
        title: "Data Verification Validation",
        desc: "Maintains log systems to track keyword frequency criteria, protecting parsing outcomes against text manipulation.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        ),
      },
      {
        title: "Data Matrix Exporting",
        desc: "Allows direct data schema conversion to export sorted candidate tables into standard review tables.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        ),
      },
    ],
  },
];

export default function FeaturesGrid() {
  return (
    <section className="py-12 pb-24 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-16">
        {categories.map((cat, ci) => (
          <div key={ci} className="space-y-6">
            
            {/* Category Header Separator */}
            <div className="flex items-center gap-4">
              <span className={`text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-xl border ${cat.color} shadow-xs`}>
                {cat.label}
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* 3-Column Responsive High-Contrast Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cat.features.map((f, fi) => (
                <div
                  key={fi}
                  className="bg-slate-50 border border-slate-300 rounded-2xl p-6 shadow-xs flex flex-col justify-between items-start hover:border-slate-400 transition-colors duration-200"
                >
                  <div className="space-y-4 w-full">
                    {/* Icon Container with Primary Brand Identification Mark */}
                    <div className="w-11 h-11 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-[#18317a] shadow-xs">
                      {f.icon}
                    </div>
                    
                    {/* Typography Scaling for Text Rigor */}
                    <h3 className="text-lg font-black text-slate-950 tracking-tight">
                      {f.title}
                    </h3>
                    
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        ))}
      </div>
    </section>
  );
}