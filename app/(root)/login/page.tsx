import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-sans">
      {/* ── LEFT PANEL ── */}
      <div className="relative hidden lg:flex flex-col justify-between bg-navy overflow-hidden p-10">
        {/* Layered radial glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_30%,rgba(45,71,214,0.55)_0%,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(61,90,255,0.25)_0%,transparent_60%)]" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <svg viewBox="0 0 26 26" className="w-6 h-6" fill="none">
              <rect width="26" height="26" rx="6" fill="#2563eb" />
              <circle cx="13" cy="13" r="5" stroke="white" strokeWidth="1.8" />
              <circle cx="13" cy="13" r="1.5" fill="white" />
            </svg>
            <span className="font-bold text-[15px] text-white tracking-tight">HireSense</span>
          </Link>
        </div>

        {/* Center quote */}
        <div className="relative z-10 max-w-xs">
          {/* Large quotation mark */}
          <div className="text-[80px] leading-none text-white/20 font-serif mb-2 -ml-2">"</div>
          <blockquote className="text-white text-[1.5rem] font-bold leading-snug mb-6">
            HireSense has transformed our talent pipeline.
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
              JA
            </div>
            <div>
              <p className="text-white/80 text-[13px] font-semibold">— J.A. Director, TechNizer</p>
            </div>
          </div>

          {/* Stat pills */}
          <div className="flex gap-2 mt-8 flex-wrap">
            {[
              { label: "AI Matchmaking" },
              { label: "Precision Hiring" },
              { label: "Placements" },
            ].map((pill) => (
              <span
                key={pill.label}
                className="text-[11px] font-medium text-white/70 bg-white/10 border border-white/15 px-3 py-1.5 rounded-full"
              >
                {pill.label}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/30 text-[11px]">
            HireSense AI · © 2024 HireSense AI. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex flex-col bg-white">
        {/* Top nav */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 lg:invisible">
            <svg viewBox="0 0 26 26" className="w-5 h-5" fill="none">
              <rect width="26" height="26" rx="6" fill="#1e3a5f" />
              <circle cx="13" cy="13" r="5" stroke="white" strokeWidth="1.8" />
              <circle cx="13" cy="13" r="1.5" fill="white" />
            </svg>
            <span className="font-bold text-[14px] text-slate-900">HireSense</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/solutions" className="text-[13px] text-slate-500 hover:text-slate-800 transition-colors">Solutions</Link>
            <Link href="#" className="text-[13px] text-slate-500 hover:text-slate-800 transition-colors">Enterprise</Link>
            <Link href="#" className="text-[13px] font-semibold text-navy hover:opacity-70 transition-opacity">Sign in</Link>
          </nav>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-100">
            {/* Brand mark */}
            <div className="flex items-center gap-2 mb-6">
              <svg viewBox="0 0 26 26" className="w-6 h-6" fill="none">
                <rect width="26" height="26" rx="6" fill="#1e3a5f" />
                <circle cx="13" cy="13" r="5" stroke="white" strokeWidth="1.8" />
                <circle cx="13" cy="13" r="1.5" fill="white" />
              </svg>
              <span className="font-bold text-[14px] text-slate-800">HireSense</span>
            </div>

            <h1 className="text-[2rem] font-bold text-slate-900 mb-1">Welcome Back</h1>
            <p className="text-[13px] text-slate-400 mb-7">
              Enter your credentials to access your dashboard.
            </p>

            {/* Role toggle */}
            <div className="grid grid-cols-2 gap-2 mb-7">
              {["Recruiter", "Candidate"].map((role, i) => (
                <button
                  key={role}
                  className={`py-2.5 rounded-lg text-[13px] font-semibold border transition-all ${
                    i === 0
                      ? "bg-navy text-white border-navy shadow-sm"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Form */}
            <form className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-slate-400">
                      <path d="M2.5 6.667 10 11.25l7.5-4.583" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <rect x="2.5" y="4.167" width="15" height="11.667" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-accent focus:ring-2 focus:ring-blue-accent/10 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[12px] font-semibold text-slate-600">Password</label>
                  <Link href="#" className="text-[12px] text-blue-accent hover:opacity-70 transition-opacity">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-slate-400">
                      <rect x="3.333" y="9.167" width="13.333" height="8.333" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M6.667 9.167V6.25a3.333 3.333 0 0 1 6.667 0v2.917" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-accent focus:ring-2 focus:ring-blue-accent/10 transition-all"
                  />
                </div>
              </div>

              {/* Keep logged in */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-3.5 h-3.5 accent-blue-accent cursor-pointer"
                />
                <label htmlFor="remember" className="text-[12px] text-slate-500 cursor-pointer">
                  Keep me logged in
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-navy text-white text-[13px] font-bold hover:bg-navy-mid transition-colors shadow-sm mt-1 flex items-center justify-center gap-2"
              >
                Login to Dashboard
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[11px] text-slate-400 font-medium">Or continue with</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Social logins */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Google",
                  icon: (
                    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none">
                      <path d="M18.172 8.364H10.2v3.454h4.564c-.2 1.073-.8 1.982-1.709 2.582v2.145h2.764c1.618-1.49 2.553-3.69 2.553-6.3 0-.618-.055-1.209-.2-1.881z" fill="#4285F4" />
                      <path d="M10.2 18.182c2.29 0 4.218-.76 5.619-2.055l-2.764-2.145c-.764.51-1.745.818-2.855.818-2.2 0-4.063-1.49-4.727-3.49H2.6v2.218c1.4 2.764 4.254 4.654 7.6 4.654z" fill="#34A853" />
                      <path d="M5.473 11.31A5.377 5.377 0 0 1 5.19 9.64c0-.582.1-1.146.282-1.673V5.75H2.6A9.11 9.11 0 0 0 1.636 9.64c0 1.472.354 2.854.964 4.09l2.873-2.42z" fill="#FBBC05" />
                      <path d="M10.2 4.473c1.236 0 2.345.427 3.218 1.264l2.418-2.418C14.41 1.982 12.491 1.09 10.2 1.09c-3.345 0-6.2 1.89-7.6 4.654l2.873 2.22C6.136 5.963 8 4.473 10.2 4.473z" fill="#EA4335" />
                    </svg>
                  ),
                },
                {
                  label: "LinkedIn",
                  icon: (
                    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="#0A66C2">
                      <path d="M17.5 1.667H2.5A.833.833 0 0 0 1.667 2.5v15a.833.833 0 0 0 .833.833h15a.833.833 0 0 0 .833-.833V2.5a.833.833 0 0 0-.833-.833zM6.667 14.583H4.167V7.917h2.5v6.666zM5.417 6.833a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm9.166 7.75h-2.5v-3.25c0-.933-.017-2.133-1.3-2.133-1.3 0-1.5 1.017-1.5 2.066v3.317h-2.5V7.917h2.4v.9h.033c.334-.633 1.15-1.3 2.367-1.3 2.533 0 3 1.667 3 3.833v3.233z" />
                    </svg>
                  ),
                },
              ].map((provider) => (
                <button
                  key={provider.label}
                  className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  {provider.icon}
                  {provider.label}
                </button>
              ))}
            </div>

            {/* Sign up link */}
            <p className="text-center text-[12px] text-slate-400 mt-6">
              Don't have an account?{" "}
              <Link href="#" className="text-blue-accent font-semibold hover:opacity-70 transition-opacity">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="px-8 py-4 border-t border-slate-100 flex flex-wrap gap-4 justify-end">
          {["Privacy Policy", "Terms of Service", "Security", "Help Center"].map((item) => (
            <Link key={item} href="#" className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors">
              {item}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}