import { SlidersHorizontal, Cpu, ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { PrimaryButton } from "./Buttons";
import { useSectionNav } from "@/hooks/useSectionNav";
import { useTranslation } from "react-i18next";

const PILLARS = [
  { id: "config", icon: SlidersHorizontal, href: "#/parla-con-un-esperto" },
  { id: "operative", icon: Cpu, href: "#/ecosistema" },
];

const Intro = ({ onCta }) => {
  const { t } = useTranslation();
  return (
  <div className="mx-auto max-w-6xl text-center">
    <Reveal blur><p className="ic-eyebrow">{t("about.eyebrow")}</p></Reveal>
    <Reveal heading>
      <h2 className="mt-8 font-display text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[1.05] tracking-tight text-ic-white" data-testid="about-intro-title">
        ICARO. <span className="font-light text-ic-white/90">{t("about.titleB")}</span>
      </h2>
    </Reveal>
    <Reveal blur>
      <p className="mx-auto mt-12 max-w-3xl text-lg sm:text-xl lg:text-2xl font-light leading-relaxed text-ic-grey" data-testid="about-intro-p1">
        {t("about.p1")}
      </p>
    </Reveal>
    <Reveal blur>
      <p className="mt-10 font-display text-xl sm:text-2xl lg:text-3xl text-ic-white">
        <span className="ic-text-glow text-ic-cyan2" data-testid="about-intro-highlight">{t("about.highlight")}</span>
      </p>
    </Reveal>
    <Reveal blur>
      <p className="mx-auto mt-10 max-w-3xl text-base sm:text-lg lg:text-xl leading-relaxed text-ic-grey" data-testid="about-intro-p2">
        {t("about.p2")}
      </p>
    </Reveal>
    <Reveal blur>
      <p className="mx-auto mt-16 sm:mt-20 lg:mt-24 max-w-4xl border-y border-ic-cyan2/15 py-10 font-display text-2xl sm:text-3xl lg:text-[2.6rem] font-semibold leading-[1.3] text-ic-white" data-testid="about-intro-statement">
        {t("about.statementA")} <span className="text-ic-cyan2 sm:mt-2 sm:block">{t("about.statementB")}</span>
      </p>
    </Reveal>
    <Reveal blur className="mt-14 flex justify-center">
      <PrimaryButton onClick={onCta} className="max-w-full whitespace-normal text-center" data-testid="about-intro-cta">{t("about.cta")}</PrimaryButton>
    </Reveal>
  </div>
  );
};

export const About = () => {
  const go = useSectionNav();
  const { t } = useTranslation();
  const flow = t("about.flow.items");
  return (
  <section id="cos-e-icaro" className="ic-section bg-ic-bg !pt-16 sm:!pt-20">
    <div className="ic-container">
      <Intro onCta={() => go("sempre-operativo")} />
      <div className="mx-auto mt-20 max-w-5xl">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {PILLARS.map((p, i) => {
            const body = (
              <>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ic-cyan2/25 bg-ic-cyan/10 text-ic-cyan2 transition-shadow duration-300 group-hover:shadow-[0_0_24px_-4px_rgba(0,207,255,0.6)]">
                  <p.icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-ic-white">{t(`about.pillars.${p.id}.title`)}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ic-grey">{t(`about.pillars.${p.id}.text`)}</p>
                </div>
                {p.href && <ArrowUpRight className="h-5 w-5 shrink-0 text-ic-cyan2 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />}
              </>
            );
            const cls = "group flex gap-5 rounded-2xl border border-transparent p-4 transition-[border-color,background-color] duration-300 hover:border-ic-cyan2/15 hover:bg-ic-night/40";
            return (
              <Reveal key={p.id} delay={0.1 + i * 0.08}>
                {p.href ? (
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className={`${cls} cursor-pointer`} aria-label={`${t(`about.pillars.${p.id}.title`)} — ${t(`about.pillars.${p.id}.label`)} (${t("common.newTab")})`} data-testid={`about-pillar-${i}`}>{body}</a>
                ) : (
                  <div className={cls} data-testid={`about-pillar-${i}`}>{body}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>

      <Reveal delay={0.15} className="mx-auto mt-16 max-w-3xl">
        <div className="ic-glass relative overflow-hidden rounded-3xl p-6 sm:p-8" data-testid="about-agent-flow">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-ic-cyan/10 blur-3xl" aria-hidden />
          <div className="flex items-center justify-between border-b border-ic-cyan2/10 pb-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-ic-cyan2">{t("about.flow.heading")}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ic-grey/70">{t("about.flow.example")}</span>
          </div>
          <ol className="relative mt-6 space-y-6">
            <span className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-ic-cyan/70 via-ic-cyan/20 to-transparent" aria-hidden />
            {flow.map((f, i) => (
              <li key={f.k} className="relative pl-9">
                <span className={`absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border border-ic-cyan2/60 ${i === 0 ? "bg-ic-cyan2 shadow-[0_0_16px_rgba(57,228,255,0.8)]" : "bg-ic-bg"}`} aria-hidden />
                <p className="font-mono text-[11px] tracking-[0.22em] text-ic-cyan">{String(i + 1).padStart(2, "0")} · {f.k}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ic-white/90">{f.v}</p>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </div>
  </section>
  );
};
