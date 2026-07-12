import Image from "next/image";
import Link from "next/link";
import logo from "../../../public/hiresense-logo.png";

const footerCols = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ],
  Company: [
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Press", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-12 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 w-fit group">
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity" />
                <Image src={logo} alt="HireSense Logo" width={36} height={36} className="relative" />
              </div>
              <span className="font-bold text-[18px] text-white tracking-tight">HireSense</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-[280px] mb-6">
              HireSense AI — Precision intelligence for modern recruitment. Find the perfect candidates faster with our AI-powered platform.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              {[
                { icon: "𝕏", label: "Twitter" },
                { icon: "in", label: "LinkedIn" },
                { icon: "▶", label: "YouTube" },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors group"
                  title={social.label}
                >
                  <span className="text-white/70 group-hover:text-white transition-colors">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerCols).map(([col, links]) => (
            <div key={col}>
              <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-6">
                {col}
              </h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-white/50 hover:text-white transition-colors relative group"
                    >
                      {link.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            © 2026 HireSense AI. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service"].map((item) => (
              <Link 
                key={item} 
                href="#" 
                className="text-sm text-white/40 hover:text-white transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}