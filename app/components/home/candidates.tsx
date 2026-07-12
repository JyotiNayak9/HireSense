import OpenRegisterButton from "./OpenRegisterButton";

const candidateFeatures = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Skill-Based Matching",
    desc: "Our system analyzes your specific skills and project experience to connect you directly with relevant job openings.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: "Profile Builder",
    desc: "Get suggestions on how to organize your resume data so that key engineering concepts stand out to hiring systems.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    title: "Application Status Tracker",
    desc: "Monitor your applications step-by-step with real-time updates on whether your resume is under review or short-listed.",
  },
];

export default function CandidateSection() {
  return (
    <section className="relative py-10 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Academic Header Configuration Grid */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8 pb-8 border-b border-slate-200">
          <div className="space-y-4">
            
            <h2 className="text-4xl sm:text-5xl font-black text-slate-850 tracking-tight">
              Tools Built for Applicants
            </h2>
            <p className="text-slate-700 text-lg sm:text-xl font-medium max-w-2xl leading-relaxed">
              We provide tools to help students and professionals organize their credentials and discover positions matching their fields of study.
            </p>
          </div>
          
          <OpenRegisterButton
            label="Create Your Profile"
            className="inline-flex items-center justify-center gap-3 px-6 h-14 rounded-xl bg-[#18317a] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#12255c] transition-all shadow-md shrink-0 active:scale-[0.99]"
          />
        </div>

        {/* 3 Balanced Structured Feature Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {candidateFeatures.map((f, i) => (
            <div 
              key={i} 
              className="bg-slate-50 rounded-2xl p-8 border border-slate-300 flex flex-col justify-between items-start shadow-xs hover:border-slate-400 transition-colors duration-200"
            >
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white border border-slate-300 text-[#18317a] shadow-xs">
                  {f.icon}
                </div>
                <h3 className="text-xl font-black text-slate-950">{f.title}</h3>
                <p className="text-slate-700 text-sm font-medium leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}

