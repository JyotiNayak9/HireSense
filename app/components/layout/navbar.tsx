"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/hiresense-logo.png";
import { useAuthModal } from "@/app/context/AuthModalContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { openLogin, openRegister } = useAuthModal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm" 
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo Configuration */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/60 group-hover:border-[#203f99]/30 transition-all duration-200">
            <Image 
              src={logo} 
              alt="HireSense Logo" 
              width={30} 
              height={30} 
              className="object-contain group-hover:scale-105 transition-transform" 
            />
          </div>
          <span className=" font-bold text-lg text-navy tracking-tight group-hover:text-[#203f99] transition-colors">
            HireSense
          </span>
        </Link>

        {/* Desktop Central Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "About Us", href: "/features" },
            { label: "Contact Us", href: "/contact" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-bold text-slate-700 hover:text-[#203f99] transition-colors uppercase tracking-wider relative group"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop Call-to-Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={openLogin}
            className="text-sm font-bold text-slate-700 hover:text-[#203f99] transition-colors px-4 py-2 uppercase tracking-wider"
          >
            Log in
          </button>
          <button
            onClick={openRegister}
            className="text-sm font-bold px-4 h-11 inline-flex items-center justify-center rounded-xl hover:bg-[#203f99] text-white bg-[#18317a] transition-all shadow-sm active:scale-[0.99] uppercase tracking-wider"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Hamburger Trigger Toggle */}
        <button
          className="md:hidden p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-700 hover:bg-slate-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="2.5" strokeLinecap="round">
            {menuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Drawer Slideout Menu Panel */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-6 flex flex-col gap-4 shadow-xl animate-fade-in">
          {[
            { label: "About Us", href: "/features" },
            { label: "Contact Us", href: "/contact" },
          ].map((item) => (
            <Link 
              key={item.label} 
              href={item.href} 
              className="text-xs font-bold text-slate-600 py-2 uppercase tracking-wider hover:text-[#203f99] transition-colors" 
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <hr className="border-slate-100 my-1" />
          <div className="flex flex-col gap-2">
            <button
              onClick={() => { setMenuOpen(false); openLogin(); }}
              className="text-xs font-bold text-slate-600 py-3 text-center uppercase tracking-wider hover:bg-slate-50 rounded-xl transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => { setMenuOpen(false); openRegister(); }}
              className="text-xs font-bold px-4 py-3.5 rounded-xl bg-[#203f99] text-white text-center uppercase tracking-wider font-sans"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}