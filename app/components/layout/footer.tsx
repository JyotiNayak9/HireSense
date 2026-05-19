import Image from "next/image";
import Link from "next/link";
import logo from "../../../public/hiresense-logo.png";

const footerCols = {
  Product: ["Features","About Us", "Contact Us"],
  // Company: ["About Us", "Careers", "Blog", "Press"],
  // Legal: ["Privacy Policy", "Terms of Service"],
};

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-14 pb-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 w-fit">
              <Image src={logo} alt="HireSense Logo" width={32} height={32} />
              <span className="font-bold text-[15px] text-white tracking-tight">HireSense</span>
            </Link>
            <p className="text-white/40 text-[12px] leading-relaxed max-w-[220px]">
              HireSense AI — Precision intelligence for modern recruitment.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerCols).map(([col, links]) => (
            <div key={col}>
              <h4 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-4">
                {col}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-[13px] text-white/50 hover:text-white transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-white/30">
            © 2026 HireSense AI. All rights reserved.
          </p>
          {/* <div className="flex gap-5">
            {["Privacy Policy", "Terms of Service"].map((item) => (
              <Link key={item} href="#" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">
                {item}
              </Link>
            ))}
          </div> */}
        </div>
      </div>
    </footer>
  );
}