import CandidateSection from "../components/home/candidates";
import CtaSection from "../components/home/ctasection";
import Footer from "../components/layout/footer";
import HeroSection from "../components/home/herosection";
import RecruiterSection from "../components/home/recruiters";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      
      <HeroSection/>
     <RecruiterSection/>
     <CandidateSection/>
     <CtaSection/>
    </main>
  );
}