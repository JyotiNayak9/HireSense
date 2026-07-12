import React from 'react'

export default function FeaturesHero() {
  return (
    <section className="relative pt-40 pb-20 bg-white overflow-hidden border-b border-slate-200">
      {/* Structural Minimalist Grid Graphic Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_75%,transparent_100%)] pointer-events-none -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative z-10 space-y-6">
        {/* Core System Label */}
        <div className="inline-flex items-center gap-2.5 rounded-xl bg-slate-100 border border-slate-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#18317a]">
          Platform Framework Modules
        </div>
        
        {/* Typography Scaling for Visual Hierarchy */}
        <h1 className="font-black text-5xl sm:text-6xl lg:text-[4rem] leading-[1.05] text-slate-800 tracking-tight max-w-4xl mx-auto">
          Core Features & Functional Components
        </h1>
        
        {/* Clear, Simplified Project Purpose */}
        <p className="text-slate-700 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
          Every component in the HireSense system is designed to organize application pipelines, filter unstructured text data, and provide clear candidate matching metrics.
        </p>
      </div>
    </section>
  )
}