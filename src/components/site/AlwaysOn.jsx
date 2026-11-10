import { Reveal } from "./Reveal";
import { IcaroText } from "./IcaroText";
import { PrimaryButton } from "./Buttons";
import { useSectionNav } from "@/hooks/useSectionNav";
import { useTranslation } from "react-i18next";

const wave = (amp, freq, phase) => {
  let d = "M0 100";
  for (let x = 0; x <= 2400; x += 20) d += ` L${x} ${100 + Math.sin((x / 1200) * Math.PI * 2 * freq + phase) * amp}`;
  return d;
};
const WAVES = [
  { d: wave(34, 2, 0), o: 0.55, w: 1.4 },
  { d: wave(22, 3, 1.2), o: 0.35, w: 1 },
  { d: wave(48, 1, 2.4), o: 0.25, w: 1 },
  { d: wave(14, 4, 0.6), o: 0.3, w: 0.8 },
];

const SignalWaves = () => (
  <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[260px] overflow-hidden opacity-80" aria-hidden>
    {WAVES.map((w, i) => (
      <svg key={i} className="ic-anim-wave absolute left-0 top-0 h-full w-[200%]" style={{ animationDuration: `${16 + i * 6}s` }} viewBox="0 0 2400 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`wg-${i}`} x1="0" x2="1">
            <stop offset="0" stopColor="#00CFFF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#39E4FF" stopOpacity="1" />
            <stop offset="1" stopColor="#00CFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={w.d} fill="none" stroke={`url(#wg-${i})`} strokeWidth={w.w} opacity={w.o} vectorEffect="non-scaling-stroke" />
      </svg>
    ))}
  </div>
);

const ActiveIndicator = () => {
  const { t } = useTranslation();
  return (
  <div className="ic-glass inline-flex flex-col gap-3 rounded-2xl px-6 py-4" data-testid="always-on-indicator">
    <div className="flex items-center gap-4">
      <span className="ic-anim-pulse-dot h-2.5 w-2.5 rounded-full bg-ic-cyan2" aria-hidden />
      <span className="font-mono text-xs sm:text-sm tracking-[0.24em] text-ic-white"><IcaroText mono /> SYSTEM — ACTIVE</span>
      <span className="flex h-4 items-end gap-[3px]" aria-hidden>
        {[0, 1, 2, 3, 4].map((b) => (
          <span key={b} className="w-[3px] h-full origin-bottom rounded-sm bg-ic-cyan" style={{ animation: `ic-bars ${0.9 + b * 0.17}s ease-in-out ${b * 0.12}s infinite` }} />
        ))}
      </span>
    </div>
    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ic-grey/60">{t("always.note")}</span>
  </div>
  );
};

export const AlwaysOn = () => {
  const go = useSectionNav();
  const { t } = useTranslation();
  return (
    <section id="sempre-operativo" className="relative overflow-hidden bg-ic-bg px-5 py-32 sm:px-8 sm:py-44 lg:px-12" aria-labelledby="always-on-title">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,#0d2a4d_0%,#091B33_40%,#050D1B_80%)]" aria-hidden />
      <div className="ic-anim-breathe absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ic-cyan/10 blur-[120px]" aria-hidden />
      <SignalWaves />
      <div className="relative ic-container text-center">
        <Reveal blur><p className="ic-eyebrow">{t("always.eyebrow")}</p></Reveal>
        <Reveal heading delay={0.1}>
          <h2 id="always-on-title" className="mx-auto mt-8 max-w-5xl font-display text-[clamp(2.3rem,6.2vw,5.6rem)] font-semibold uppercase leading-[0.98] tracking-tight text-ic-white">
            {t("always.titleA")} <span className="ic-text-glow text-ic-cyan2">{t("always.titleB")}</span>
          </h2>
        </Reveal>
        <Reveal blur delay={0.2}>
          <p className="mt-10 font-mono text-lg sm:text-2xl tracking-[0.3em] text-ic-cyan" data-testid="always-on-247">{t("always.sub")}</p>
        </Reveal>
        <Reveal blur delay={0.3}>
          <p className="mx-auto mt-8 max-w-2xl text-base lg:text-lg leading-relaxed text-ic-grey">
            {t("always.desc")}
          </p>
        </Reveal>
        <Reveal delay={0.4} className="mt-12 flex flex-col items-center gap-10">
          <ActiveIndicator />
          <PrimaryButton onClick={() => go("contatti", { focusForm: true })} data-testid="always-on-cta">{t("always.cta")}</PrimaryButton>
        </Reveal>
      </div>
    </section>
  );
};
