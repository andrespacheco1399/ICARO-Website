import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDocTitle } from "@/hooks/useDocTitle";
import { ScanSearch, Network, ShieldCheck, Plug } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { IcaroText } from "@/components/site/IcaroText";
import { Reveal, SectionHeader } from "@/components/site/Reveal";
import { PrimaryButton } from "@/components/site/Buttons";
import { CorporateDiagram } from "@/components/site/CorporateDiagram";
import { UseCaseGrid } from "@/components/site/Corporate";
import { HowItWorks } from "@/components/site/HowItWorks";
import { ContactSection } from "@/components/site/ContactSection";
import { scrollToSection } from "@/hooks/useSectionNav";

const PRINCIPLE_ICONS = [ScanSearch, Network, ShieldCheck, Plug];

export default function CorporatePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { t } = useTranslation();
  useDocTitle("meta.corporate");
  const principles = t("corpPage.principles");
  const toForm = () => scrollToSection("consulenza-aziendale", { focusForm: true });

  return (
    <>
      <Navbar />
      <main id="main">
        <section className="relative overflow-hidden bg-ic-bg px-5 pb-24 pt-36 sm:px-8 sm:pt-44 lg:px-12" aria-label="ICARO x CORPORATE">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_70%_40%,#0d2a4d_0%,#091B33_35%,#050D1B_75%)]" aria-hidden />
          <div className="ic-grid-bg absolute inset-0 opacity-50" aria-hidden />
          <div className="relative ic-container grid items-center gap-16 lg:grid-cols-2">
            <div>
              <Reveal blur><p className="ic-eyebrow">{t("corpPage.eyebrow")}</p></Reveal>
              <Reveal heading delay={0.08}>
                <h1 className="mt-6 font-display text-[clamp(2.8rem,7vw,5.6rem)] font-light leading-[0.98] tracking-tight text-ic-white" data-testid="corporate-page-title">
                  <IcaroText /> <span className="font-mono text-[0.5em] align-middle text-ic-cyan2">x</span> <span className="font-semibold">CORPORATE</span>
                </h1>
              </Reveal>
              <Reveal blur delay={0.16}><p className="mt-6 font-display text-xl sm:text-2xl font-light text-ic-cyan2">{t("corporate.subtitle")}</p></Reveal>
              <Reveal blur delay={0.24}>
                <p className="mt-6 max-w-xl text-base lg:text-lg leading-relaxed text-ic-grey">
                  {t("corporate.desc")}
                </p>
              </Reveal>
              <Reveal delay={0.32} className="mt-10">
                <PrimaryButton onClick={toForm} data-testid="corporate-page-cta-consulenza">{t("corpPage.cta")}</PrimaryButton>
              </Reveal>
            </div>
            <Reveal delay={0.1}><CorporateDiagram /></Reveal>
          </div>
        </section>

        <section className="ic-section bg-ic-bg">
          <div className="ic-container">
            <SectionHeader eyebrow={t("corpPage.approachEyebrow")} title={<>{t("corpPage.approachA")} <span className="text-ic-cyan2">{t("corpPage.approachB")}</span></>} />
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {principles.map((p, i) => { const Icon = PRINCIPLE_ICONS[i]; return (
                <Reveal key={i} delay={i * 0.08} className="h-full">
                  <div className="ic-glass h-full rounded-3xl p-7 transition-[transform,border-color] duration-500 hover:-translate-y-1 hover:border-ic-cyan2/40" data-testid={`corporate-principle-${i}`}>
                    <Icon className="h-6 w-6 text-ic-cyan2" strokeWidth={1.6} aria-hidden />
                    <h3 className="mt-8 font-display text-lg font-semibold text-ic-white">{p.t}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-ic-grey">{p.d}</p>
                  </div>
                </Reveal>
              ); })}
            </div>
          </div>
        </section>

        <section className="ic-section bg-gradient-to-b from-ic-bg via-ic-night/50 to-ic-bg">
          <div className="ic-container">
            <SectionHeader eyebrow={t("corpPage.useCasesEyebrow")} title={t("corpPage.useCasesTitle")} className="mb-14" />
            <UseCaseGrid />
          </div>
        </section>

        <HowItWorks />

        <ContactSection
          id="consulenza-aziendale"
          eyebrow={t("corpPage.contactEyebrow")}
          title={<>{t("corpPage.contactA")} <span className="text-ic-cyan2">{t("corpPage.contactB")}</span></>}
          subtitle={t("corpPage.contactSub")}
          origine="corporate"
          defaultTipologia="aziendale"
          idPrefix="corporate-contact"
        />
      </main>
      <Footer />
    </>
  );
}
