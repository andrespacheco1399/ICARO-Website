import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDocTitle } from "@/hooks/useDocTitle";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { CallbackForm } from "@/components/site/CallbackForm";
import { BrainMatrixScene } from "@/components/site/BrainMatrixScene";

export default function ExpertPage() {
  const { t } = useTranslation();
  useDocTitle("meta.expert");
  const burst = useRef(null);
  useEffect(() => {

    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <main id="main" className="relative overflow-hidden bg-ic-bg px-5 pb-24 pt-36 sm:px-8 sm:pt-44 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_20%,#0d2a4d_0%,#091B33_35%,#050D1B_75%)]" aria-hidden />
        <div className="ic-grid-bg absolute inset-0 opacity-50" aria-hidden />
        <div className="ic-anim-breathe absolute left-1/2 top-40 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-ic-cyan/10 blur-[120px]" aria-hidden />
        <BrainMatrixScene burstRef={burst} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_50%_45%,rgba(5,13,27,0.55),transparent_75%)]" aria-hidden />

        <div className="relative mx-auto max-w-3xl">
          <div className="text-center">
            <Reveal blur><p className="ic-eyebrow">{t("expert.eyebrow")}</p></Reveal>
            <Reveal heading delay={0.08}>
              <h1 className="ic-text-glow mt-6 font-display text-[clamp(2.2rem,7vw,4.6rem)] font-semibold uppercase leading-[1] tracking-tight text-ic-white" data-testid="expert-page-title">
                {t("expert.titleA")} <span className="text-ic-cyan2">{t("expert.titleB")}</span>
              </h1>
            </Reveal>
            <Reveal blur delay={0.16}>
              <p className="mx-auto mt-6 max-w-2xl text-base lg:text-lg leading-relaxed text-ic-grey" data-testid="expert-page-subtitle">
                {t("expert.subtitle")}
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.24}>
            <div className="ic-glass relative mt-14 rounded-3xl p-6 sm:p-10">
              <span className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-ic-cyan2/60 to-transparent" aria-hidden />
              <CallbackForm onSuccess={() => burst.current?.()} />
            </div>
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
