import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {/* ── TOP NAV ── */}
      <header className="flex items-center justify-between px-6 lg:px-10 h-14 border-b border-slate-100 bg-white">
        <Link href="/" className="flex items-center gap-2">
          <svg viewBox="0 0 26 26" className="w-6 h-6" fill="none">
            <rect width="26" height="26" rx="6" fill="#1e3a5f" />
            <circle cx="13" cy="13" r="5" stroke="white" strokeWidth="1.8" />
            <circle cx="13" cy="13" r="1.5" fill="white" />
          </svg>
          <span className="font-bold text-[15px] text-slate-900 tracking-tight">HireSense</span>
        </Link>
        <nav className="flex items-center gap-7">
          <Link href="/solutions" className="text-[13px] text-slate-500 hover:text-slate-800 transition-colors">Solutions</Link>
          <Link href="#" className="text-[13px] text-slate-500 hover:text-slate-800 transition-colors">Enterprise</Link>
          <Link href="#" className="text-[13px] text-slate-500 hover:text-slate-800 transition-colors">Pricing</Link>
        </nav>
      </header>

      {/* ── BODY ── */}
      <div className="flex-1 grid lg:grid-cols-2">

        {/* LEFT — navy panel */}
        <div className="relative hidden lg:flex flex-col justify-end bg-[#1a2e6e] overflow-hidden p-10 pb-12">
          {/* Radial glows */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_15%_25%,rgba(45,71,214,0.6)_0%,transparent_65%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(61,90,255,0.25)_0%,transparent_60%)]" />
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />

          <div className="relative z-10">
            <h1 className="font-bold text-[2rem] lg:text-[2.3rem] leading-snug text-white mb-8 max-w-xs">
              Elevate Your Hiring Strategy
            </h1>

            {/* Feature bullets */}
            <div className="space-y-5 mb-8">
              {[
                {
                  title: "Data Interpretation",
                  desc: "Turn raw candidate data into actionable insights with our proprietary analytical engine.",
                },
                {
                  title: "Quality Shortlisting",
                  desc: "Reduce screening time by 70% using precision-weighted skill gap analysis.",
                },
              ].map((f) => (
                <div key={f.title} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                      <path d="M2 6l2.5 2.5L10 3.5" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-[13px] font-semibold mb-0.5">{f.title}</p>
                    <p className="text-white/55 text-[12px] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial card */}
            <div className="bg-white/8 border border-white/12 rounded-2xl p-5 backdrop-blur-sm max-w-sm">
              <blockquote className="text-white/80 text-[13px] italic leading-relaxed mb-4">
                "HireSense transformed our recruitment pipeline.{" "}
                <span className="text-white font-medium">
                  The match scores are frighteningly accurate, allowing us to focus only on top-tier talent.
                </span>"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                  MT
                </div>
                <div>
                  <p className="text-white text-[12px] font-semibold">Marcus Thorne</p>
                  <p className="text-white/45 text-[10px] uppercase tracking-wide">Director of Talent, Innovate Corp</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — form panel */}
        <div className="flex flex-col justify-between">
          <div className="flex-1 flex items-center justify-center px-8 py-12">
            <div className="w-full max-w-[400px]">
              <h2 className="text-[1.7rem] font-bold text-slate-900 mb-1">Create your account</h2>
              <p className="text-[13px] text-slate-400 mb-7">Join the next generation of precision hiring.</p>

              {/* Role toggle */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {[
                  {
                    label: "I am a Recruiter",
                    icon: (
                      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.6">
                        <rect x="2" y="6" width="16" height="12" rx="1.5" />
                        <path d="M13 6V4.5a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 7 4.5V6" />
                        <line x1="10" y1="10" x2="10" y2="14" />
                        <line x1="8" y1="12" x2="12" y2="12" />
                      </svg>
                    ),
                    active: true,
                  },
                  {
                    label: "I am a Candidate",
                    icon: (
                      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.6">
                        <path d="M16 17v-1.5A3.5 3.5 0 0 0 12.5 12h-5A3.5 3.5 0 0 0 4 15.5V17" />
                        <circle cx="10" cy="7" r="3" />
                      </svg>
                    ),
                    active: false,
                  },
                ].map((role) => (
                  <button
                    key={role.label}
                    className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border text-[12px] font-medium transition-all ${
                      role.active
                        ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <span className={role.active ? "text-[#2563eb]" : "text-slate-400"}>
                      {role.icon}
                    </span>
                    {role.label}
                  </button>
                ))}
              </div>

              {/* Form fields */}
              <form className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@company.com"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 transition-all"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Must be at least 8 characters with one special character.
                  </p>
                </div>

                {/* Terms checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    className="w-3.5 h-3.5 accent-[#2563eb] cursor-pointer mt-0.5 flex-shrink-0"
                  />
                  <label htmlFor="terms" className="text-[12px] text-slate-500 cursor-pointer leading-snug">
                    I agree to the{" "}
                    <Link href="#" className="text-[#2563eb] font-semibold hover:opacity-70 transition-opacity">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-[#2563eb] font-semibold hover:opacity-70 transition-opacity">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-[#1e3a5f] text-white text-[13px] font-bold hover:bg-[#162d4a] transition-colors shadow-sm flex items-center justify-center gap-2 mt-1"
                >
                  Create Account
                  <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>

              {/* Login link */}
              <p className="text-center text-[12px] text-slate-400 mt-5">
                Already have an account?{" "}
                <Link href="/login" className="text-[#2563eb] font-semibold hover:opacity-70 transition-opacity">
                  Log in
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom footer */}
          <div className="px-8 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">HireSense AI</span>
            <div className="flex gap-5">
              {["Privacy Policy", "Terms of Service", "Security", "Help Center"].map((item) => (
                <Link key={item} href="#" className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors">
                  {item}
                </Link>
              ))}
            </div>
            <span className="text-[11px] text-slate-400">© 2024 HireSense AI. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
}