"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/hiresense-logo.png";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-slate-100 ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src={logo} alt="HireSense Logo" width={30} height={30} />
          <span className="font-bold text-[15px] text-navy tracking-tight">
            HireSense
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            // { label: "Features", href: "/features" },
            { label: "About Us", href: "/features" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[15px] font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-[15px] font-medium text-slate-700 hover:text-slate-900 transition-colors px-3 py-1.5"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-[13px] font-semibold px-4 py-2 rounded-lg bg-navy text-white hover:bg-navy-mid transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-1.5 rounded-md hover:bg-slate-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-slate-700">
            {menuOpen ? (
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-3">
          {[
            { label: "Features", href: "/features" },
            { label: "About Us", href: "/about" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="text-sm font-medium text-slate-600 py-1" onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
          <hr className="border-slate-100 my-1" />
          <Link href="/login" className="text-sm text-slate-600">Log in</Link>
          <Link href="/register" className="text-sm font-semibold px-4 py-2.5 rounded-lg bg-navy text-white text-center">Get Started</Link>
        </div>
      )}
    </header>
  );
}