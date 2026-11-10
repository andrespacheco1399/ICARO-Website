import { useTranslation } from "react-i18next";
import { useDocTitle } from "@/hooks/useDocTitle";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { AlwaysOn } from "@/components/site/AlwaysOn";
import { Corporate } from "@/components/site/Corporate";
import { HowItWorks } from "@/components/site/HowItWorks";
import { ContactSection } from "@/components/site/ContactSection";
import { Footer } from "@/components/site/Footer";
import { useHashScroll } from "@/hooks/useSectionNav";

export default function Home() {
  useHashScroll();
  useDocTitle("meta.title");
  const { t } = useTranslation();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ic-cyan focus:px-4 focus:py-2 focus:text-ic-bg">{t("common.skip")}</a>
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <AlwaysOn />
        <Corporate />
        <HowItWorks />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
