import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ScrollingBanner from "@/components/ScrollingBanner";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Platforms from "@/components/Platforms";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <ScrollingBanner />
      <Features />
      <HowItWorks />
      <Platforms />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
