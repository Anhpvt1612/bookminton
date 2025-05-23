import HeroSection from "@/components/home/hero-section";
import FeaturedCourts from "@/components/home/featured-courts";
import HowItWorks from "@/components/home/how-it-works";
import FindPlayer from "@/components/home/find-player";
import BecomeCourtOwner from "@/components/home/become-court-owner";
import Testimonials from "@/components/home/testimonials";
import FAQ from "@/components/home/faq";
import CTASection from "@/components/home/cta-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedCourts />
      <HowItWorks />
      <FindPlayer />
      <BecomeCourtOwner />
      <Testimonials />
      <FAQ />
      <CTASection />
    </>
  );
}
