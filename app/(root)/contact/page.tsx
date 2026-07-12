"use client";

import { useState } from "react";
import Navbar from "@/app/components/layout/navbar";
import Footer from "@/app/components/layout/footer";
import Image from "next/image";
import logo from "../../../public/hiresense-logo.png";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    // Simulate system message ingestion delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="relative pt-40 pb-24 overflow-hidden">
        {/* Background Grid Accent Line Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_75%,transparent_100%)] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="max-w-5xl mx-auto space-y-16">
            
            {/* Structural Main Header Grouping */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              
              <h1 className="font-black text-5xl sm:text-6xl text-slate-800 tracking-tight leading-[1.05]">
                Contact Inquiries
              </h1>
              <p className="text-slate-700 text-lg font-medium leading-relaxed">
                Submit your questions, feedback, or support requests through this form. Our team will review your message and respond promptly to ensure your concerns are addressed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
              {/* Left Column: Platform Profile Info Card */}
              <div className="md:col-span-5 space-y-6">
                <div className="bg-slate-50 border border-slate-300 rounded-2xl p-8 shadow-xs space-y-6">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">System Info</h2>
                  
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-[#18317a] shadow-xs flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-950 text-sm uppercase tracking-wider">Project Mailbox</h3>
                        <p className="text-slate-700 font-medium text-base">support@hiresense.com</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-[#18317a] shadow-xs flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-950 text-sm uppercase tracking-wider">Queue Response Time</h3>
                        <p className="text-slate-700 font-medium text-base">Within 24 Processing Hours</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub Brand Showcase Plate */}
                <div className="bg-[#18317a] rounded-2xl p-8 text-white shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-1.5 rounded-lg">
                      <Image src={logo} alt="HireSense Logo" width={28} height={28} />
                    </div>
                    <span className="font-black text-xl tracking-tight">HireSense</span>
                  </div>
                  <p className="text-slate-200 text-sm font-medium leading-relaxed">
                    HireSense is a precision hiring platform that streamlines applicant processing and recruitment screening. Our system is designed to enhance the efficiency of hiring workflows, providing clear metrics and organized pipelines for both recruiters and applicants.
                  </p>
                  <div className="flex gap-3 pt-2">
                    
                  </div>
                </div>
              </div>

              {/* Right Column: Interaction Input Terminal */}
              <div className="md:col-span-7 bg-white border border-slate-300 rounded-2xl p-8 shadow-xs">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Identity Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-950 font-medium placeholder-slate-400 focus:outline-hidden focus:border-slate-500 focus:ring-1 focus:ring-slate-500 bg-slate-50 transition-all text-sm"
                        
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-950 font-medium placeholder-slate-400 focus:outline-hidden focus:border-slate-500 focus:ring-1 focus:ring-slate-500 bg-slate-50 transition-all text-sm"
                        
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Inquiry Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-950 font-medium placeholder-slate-400 focus:outline-hidden focus:border-slate-500 focus:ring-1 focus:ring-slate-500 bg-slate-50 transition-all text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Message Content Block
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-950 font-medium placeholder-slate-400 focus:outline-hidden focus:border-slate-500 focus:ring-1 focus:ring-slate-500 bg-slate-50 transition-all resize-none text-sm leading-relaxed"
                    />
                  </div>

                  {submitStatus === "success" && (
                    <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 font-medium text-sm">
                      Transmission log recorded successfully. Your message has been saved into the support registry.
                    </div>
                  )}

                  {submitStatus === "error" && (
                    <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 font-medium text-sm">
                      Something went wrong. Please try again.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3.5 rounded-xl bg-[#18317a] text-white font-bold text-sm tracking-wider uppercase shadow-xs hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Transmitting..." : "Send Data Message"}
                  </button>
                </form>
              </div>
            </div>
            
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}