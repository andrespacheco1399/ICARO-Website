import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDocTitle } from "@/hooks/useDocTitle";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { OrgDiagram } from "@/components/site/OrgDiagram";

export default function EcosystemPage() {
  const { t } = useTranslation();
  useDocTitle("meta.eco");
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <main id="main" className="relative overflow-hidden bg-ic-bg px-5 pb-24 pt-36 sm:px-8 sm:pt-44 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_18%,#0d2a4d_0%,#091B33_35%,#050D1B_75%)]" aria-hidden />
        <div className="ic-grid-bg absolute inset-0 opacity-50" aria-hidden />
        <div className="ic-anim-breathe absolute left-1/2 top-[22rem] h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-ic-cyan/10 blur-[120px]" aria-hidden />

        <div className="relative mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal blur><p className="ic-eyebrow">{t("eco.eyebrow")}</p></Reveal>
            <Reveal heading delay={0.08}>
              <h1 className="ic-text-glow mt-6 font-display text-[clamp(2.2rem,7vw,4.6rem)] font-semibold uppercase leading-[1] tracking-tight text-ic-white" data-testid="eco-page-title">
                {t("eco.titleA")} <span className="text-ic-cyan2">{t("eco.titleB")}</span>
              </h1>
            </Reveal>
            <Reveal blur delay={0.16}>
              <p className="mx-auto mt-6 max-w-2xl text-base lg:text-lg leading-relaxed text-ic-grey" data-testid="eco-page-subtitle">{t("eco.subtitle")}</p>
            </Reveal>
          </div>

          <div className="mt-16 sm:mt-20">
            <OrgDiagram />
          </div>

          <Reveal blur>
            <p className="mx-auto mt-16 max-w-2xl text-center font-mono text-[11px] uppercase leading-relaxed tracking-[0.16em] text-ic-grey/80" data-testid="eco-disclaimer">
              {t("eco.note")}
            </p>
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
