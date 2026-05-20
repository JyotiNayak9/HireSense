import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans mt-10">
      <div className="flex flex-col justify-between mt-2">
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-100 ">
            <h2 className="text-[1.7rem] font-bold text-navy mb-1 text-center">
              Create your account
            </h2>
            <form className="space-y-6 mt-6">
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-400 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-blue-accent focus:ring-2 focus:ring-blue-accent/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 border border-slate-400 rounded-lg text-[13px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-accent focus:ring-2 focus:ring-blue-accent/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 border border-slate-400 rounded-lg text-[13px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-accent focus:ring-2 focus:ring-blue-accent/10 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-navy text-white text-[13px] font-bold hover:bg-navy-mid transition-colors shadow-sm flex items-center justify-center gap-2 mt-1"
              >
                Create Account
                <HiArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-center text-[15px] text-slate-600 mt-5">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-navy font-semibold hover:opacity-70 transition-opacity"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
