
export default function CtaSection() {
  return (
    <section className="relative py-10 bg-white overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] opacity-40 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="bg-[#18317a] rounded-3xl px-8 py-16 lg:px-16 lg:py-20 text-center relative overflow-hidden shadow-md border border-blue-900">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          
            
            <h2 className="font-black text-4xl sm:text-5xl text-white tracking-tight leading-[1.1]">
              Explore the System Modules
            </h2>
            
            <p className="text-slate-200 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Review how this platform splits processing architectures between applicant portals and deep recruitment screening tools.
            </p>
            
            {/* Navigates instantly to sections that are built on the homepage */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href="#recruiters"
                className="inline-flex items-center justify-center px-8 h-14 rounded-xl bg-white text-slate-950 text-sm font-bold uppercase tracking-wider hover:bg-slate-100 transition-all shadow-sm w-full sm:w-auto"
              >
                Recruiter Features
              </a>
              <a
                href="#candidates"
                className="inline-flex items-center justify-center px-8 h-14 rounded-xl border-2 border-white/30 text-white text-sm font-bold uppercase tracking-wider hover:bg-white/10 transition-all w-full sm:w-auto"
              >
                Applicant Features
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}