import Hero from "@/components/sections/Hero";
import Trust from "@/components/sections/Trust";
import ServicesOverview from "@/components/sections/ServicesOverview";
import WhyUs from "@/components/sections/WhyUs";
import Process from "@/components/sections/Process";
import Faq from "@/components/sections/Faq";
import CtaBand from "@/components/sections/CtaBand";
import JsonLd from "@/components/JsonLd";
import { faqJsonLd } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqJsonLd()} />
      <Hero />
      <Trust />
      <ServicesOverview />
      <WhyUs />
      <Process />
      <Faq />
      <CtaBand />
    </>
  );
}
