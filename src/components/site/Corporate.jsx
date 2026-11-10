import { useNavigate } from "react-router-dom";
import { useUseCases } from "@/lib/content";
import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";
import { PrimaryButton } from "./Buttons";
import { CorporateDiagram } from "./CorporateDiagram";
import { GlassCard } from "./GlassCard";
import { IcaroText } from "./IcaroText";

const TEXTURE = "https://images.unsplash.com/photo-1633259584604-afdc243122ea?crop=entropy&cs=srgb&fm=jpg&q=70&w=1800";

export const UseCaseGrid = () => {
  const useCases = useUseCases();
  return (
  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    {useCases.map((u, i) => (
      <GlassCard key={u.title} n={String(i + 1).padStart(2, "0")} icon={u.icon} title={u.title} text={u.text} delay={(i % 3) * 0.08} testId={`use-case-${i}`} />
    ))}
  </div>
  );
};

export const Corporate = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <section id="corporate" className="ic-section overflow-hidden bg-ic-night/40" aria-labelledby="corporate-title">
      <img src={TEXTURE} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.08] mix-blend-screen" loading="lazy" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-ic-bg via-ic-bg/70 to-ic-bg" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ic-cyan2/40 to-transparent" aria-hidden />

      <div className="relative ic-container">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-3 rounded-full border border-ic-cyan2/25 bg-ic-bg/60 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-ic-cyan2" aria-hidden />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-ic-cyan2">{t("corporate.badge")}</span>
              </div>
            </Reveal>
            <Reveal heading delay={0.08}>
              <h2 id="corporate-title" className="mt-8 font-display text-[clamp(2.6rem,6vw,4.8rem)] font-light leading-[1] tracking-tight text-ic-white">
                <IcaroText /> <span className="font-mono text-[0.55em] align-middle text-ic-cyan2">x</span> <span className="font-semibold">CORPORATE</span>
              </h2>
            </Reveal>
            <Reveal blur delay={0.16}>
              <p className="mt-6 font-display text-xl sm:text-2xl font-light text-ic-cyan2">{t("corporate.subtitle")}</p>
            </Reveal>
            <Reveal blur delay={0.24}>
              <p className="mt-6 max-w-xl text-base lg:text-lg leading-relaxed text-ic-grey">
                {t("corporate.desc")}
              </p>
            </Reveal>
            <Reveal delay={0.32} className="mt-10">
              <PrimaryButton onClick={() => navigate("/corporate")} data-testid="corporate-cta-scopri">{t("corporate.cta")}</PrimaryButton>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <CorporateDiagram />
            <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-ic-grey/60">{t("corporate.demoNote")}</p>
          </Reveal>
        </div>

        <div className="mt-24">
          <Reveal heading>
            <div className="mb-8 flex items-end justify-between gap-6">
              <h3 className="font-display text-2xl sm:text-3xl font-semibold text-ic-white">{t("corporate.useCasesTitle")}</h3>
              <span className="hidden sm:block font-mono text-[11px] uppercase tracking-[0.24em] text-ic-grey/60">{t("corporate.count")}</span>
            </div>
          </Reveal>
          <UseCaseGrid />
        </div>
      </div>
    </section>
  );
};
