import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="bg-[#1e3a5f] rounded-3xl px-10 py-14 lg:px-16 lg:py-16 text-center relative overflow-hidden">
          {/* Subtle bg circles */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/4 pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/4 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="font-bold text-[1.8rem] lg:text-[2.2rem] text-white mb-3 leading-tight">
              Ready to elevate your hiring strategy?
            </h2>
            <p className="text-white/55 text-[14px] max-w-md mx-auto mb-8">
              Join HireSense AI to build your team .
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white text-[#1e3a5f] text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
              >
                Join Now
              </Link>
              {/* <Link
                href="#"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/8 transition-colors"
              >
                Contact Sales
              </Link> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}