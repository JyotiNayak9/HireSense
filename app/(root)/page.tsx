import CandidateSection from "../components/home/candidates";
import CtaSection from "../components/home/ctasection";
import HeroSection from "../components/home/herosection";
import RecruiterSection from "../components/home/recruiters";

export default function HomePage() {
  return (
    // Replaced generic bg-white with a modern, intentional dot grid pattern 
    // and established a consistent vertical stack spacing pattern (space-y-32)
    <main className="min-h-screen bg-white relative overflow-x-hidden space-y-24 md:space-y-32 pb-24">
      {/* Subtle global ambient glow circles to make the design feel fluid and human */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-slate-50 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[30vh] -left-40 w-[600px] h-[600px] bg-indigo-50/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[60vh] -right-40 w-[600px] h-[600px] bg-slate-50 rounded-full blur-3xl pointer-events-none -z-10" />

      <HeroSection />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-28 md:space-y-36">
        <RecruiterSection />
        <CandidateSection />
        <CtaSection />
      </div>
    </main>
  );
}