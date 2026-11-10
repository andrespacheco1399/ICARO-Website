import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { STEP_IDS, useSteps } from "@/lib/content";

const STEPS = STEP_IDS.map((n) => ({ n }));
import { Reveal } from "./Reveal";

const RING = 540; // desktop orbit diameter (px)
const ANGLES = [-90, 0, 90, 180]; // clockwise: top, right, bottom, left
const AUTO_MS = 5500;

function useJourney() {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (!inView || manual || reduce) return;
    const t = setInterval(() => setActive((a) => (a + 1) % STEPS.length), AUTO_MS);
    return () => clearInterval(t);
  }, [inView, manual, reduce]);

  const select = (i) => { setManual(true); setActive(i); };
  const next = () => select((active + 1) % STEPS.length);
  return { ref, active, select, next };
}

const NextButton = ({ index, onNext, active, tid }) => {
  const { t } = useTranslation();
  const last = index === STEPS.length - 1;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onNext(); }}
      tabIndex={active ? 0 : -1}
      className="inline-flex items-center gap-2 rounded-full border border-ic-cyan2/40 bg-ic-cyan/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ic-cyan2 transition-[background-color,box-shadow,color] duration-300 hover:bg-ic-cyan hover:text-ic-bg hover:shadow-[0_0_24px_-4px_rgba(0,207,255,0.8)]"
      aria-label={last ? t("journey.restartAria") : t("journey.goTo", { n: STEPS[index + 1].n })}
      data-testid={`${tid}-next-${STEPS[index].n}`}
    >
      {last ? <>{t("journey.restart")} <RotateCcw className="h-3.5 w-3.5" aria-hidden /></> : <>{t("journey.next")} <ArrowRight className="h-3.5 w-3.5" aria-hidden /></>}
    </button>
  );
};

const StepCard = ({ s, i, active, onSelect, onNext, tid = "timeline", className = "", style, focusable = true }) => (
  <motion.div
    role="button"
    tabIndex={focusable ? 0 : -1}
    onClick={() => onSelect(i)}
    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect(i))}
    animate={{ opacity: active ? 1 : 0.5, scale: active ? 1.04 : 0.96, filter: active ? "blur(0px)" : "blur(0.6px)" }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    className={`ic-glass cursor-pointer rounded-3xl p-6 text-left outline-none transition-[border-color,box-shadow] duration-500 ${
      active
        ? "border-ic-cyan2/70 shadow-[0_0_0_1px_rgba(57,228,255,0.35),0_0_46px_-8px_rgba(0,207,255,0.65),inset_0_0_30px_-12px_rgba(0,207,255,0.5)]"
        : "border-ic-cyan2/20 shadow-[0_0_24px_-14px_rgba(0,207,255,0.5)] hover:border-ic-cyan2/45"
    } ${className}`}
    style={style}
    aria-current={active ? "step" : undefined}
    data-testid={`${tid}-step-${s.n}`}
  >
    <div className="flex items-center justify-between">
      <span className={`font-mono text-sm tracking-[0.2em] ${active ? "text-ic-cyan2" : "text-ic-grey/70"}`}>{s.n}</span>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "ic-anim-pulse-dot bg-ic-cyan2" : "bg-ic-cyan2/30"}`} aria-hidden />
    </div>
    <h3 className={`mt-4 font-display text-lg font-semibold leading-snug ${i === 3 ? "text-ic-cyan2" : "text-ic-white"}`}>{s.title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-ic-grey">{s.text}</p>
    <div className="mt-5"><NextButton index={i} onNext={onNext} active={active} tid={tid} /></div>
  </motion.div>
);

const Orbit = ({ active }) => {
  const { t } = useTranslation();
  const r = RING / 2 - 1;
  const c = 2 * Math.PI * r;
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: RING, height: RING }} aria-hidden>
      <div className="ic-anim-spin absolute -inset-6 rounded-full border border-dashed border-ic-cyan2/10" />
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox={`0 0 ${RING} ${RING}`}>
        <circle cx={RING / 2} cy={RING / 2} r={r} fill="none" stroke="#39E4FF" strokeOpacity="0.14" strokeWidth="1" />
        <motion.circle
          cx={RING / 2} cy={RING / 2} r={r} fill="none" stroke="#39E4FF" strokeWidth="1.6" strokeLinecap="round"
          strokeDasharray={c}
          animate={{ strokeDashoffset: c - (c * (active + 1)) / 4 + 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: "drop-shadow(0 0 4px #00CFFF)" }}
        />
      </svg>
      {/* travelling light on the orbit */}
      <motion.div className="absolute inset-0" animate={{ rotate: active * 90 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
        <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ic-cyan2 shadow-[0_0_18px_4px_rgba(0,207,255,0.8)]" />
      </motion.div>
      {/* core */}
      <div className="absolute left-1/2 top-1/2 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-ic-cyan2/25 bg-[radial-gradient(circle,#0d2a4d,#050D1B_72%)] shadow-[0_0_70px_-16px_rgba(0,207,255,0.6)]">
        <span className="ic-anim-breathe absolute inset-4 rounded-full border border-ic-cyan2/15" />
        {/* all numbers stay mounted and cross-fade, so fast clicks can never leave the core empty */}
        <span className="relative grid place-items-center">
          {STEPS.map((s, i) => (
            <motion.span
              key={s.n}
              initial={false}
              animate={{ opacity: i === active ? 1 : 0, y: i === active ? 0 : 8, filter: i === active ? "blur(0px)" : "blur(6px)" }}
              transition={{ duration: 0.45 }}
              className="col-start-1 row-start-1 font-display text-5xl font-light text-ic-white"
            >
              {s.n}
            </motion.span>
          ))}
        </span>
        <span className="mt-1 font-mono text-[10px] tracking-[0.3em] text-ic-cyan">{t("journey.phases")}</span>
      </div>
    </div>
  );
};

const DesktopWheel = ({ active, select, next }) => {
  const steps = useSteps();
  return (
  <div className="relative mx-auto hidden h-[780px] w-full max-w-[1180px] lg:block" data-testid="timeline-wheel">
    <Orbit active={active} />
    {steps.map((s, i) => {
      const a = (ANGLES[i] * Math.PI) / 180;
      const x = Math.cos(a) * (RING / 2 + (i % 2 ? 120 : 0));
      const y = Math.sin(a) * (RING / 2 - 10);
      return (
        <div key={s.n} className="absolute left-1/2 top-1/2 w-[300px] -translate-x-1/2 -translate-y-1/2" style={{ marginLeft: x, marginTop: y }}>
          <StepCard s={s} i={i} active={i === active} onSelect={select} onNext={next} />
        </div>
      );
    })}
  </div>
  );
};

const MobileSwiper = ({ active, select, next }) => {
  const { t } = useTranslation();
  const steps = useSteps();
  return (
  <div className="lg:hidden" data-testid="timeline-swiper">
    <div className="relative mx-auto mb-8 flex max-w-md items-center justify-between px-2">
      <span className="absolute left-6 right-6 top-1/2 h-px bg-ic-cyan2/15" aria-hidden />
      <motion.span className="absolute left-6 top-1/2 h-px origin-left bg-ic-cyan2 shadow-[0_0_10px_rgba(0,207,255,0.8)]" style={{ right: 24 }} animate={{ scaleX: active / 3 }} transition={{ duration: 0.6 }} aria-hidden />
      {STEPS.map((s, i) => (
        <button
          key={s.n}
          onClick={() => select(i)}
          className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border bg-ic-bg font-mono text-[11px] transition-[border-color,box-shadow,color] duration-300 ${i === active ? "border-ic-cyan2 text-ic-cyan2 shadow-[0_0_20px_-2px_rgba(0,207,255,0.8)]" : i < active ? "border-ic-cyan2/50 text-ic-cyan2/80" : "border-ic-cyan2/20 text-ic-grey"}`}
          aria-label={t("journey.phase", { n: s.n })}
          data-testid={`timeline-dot-${s.n}`}
        >
          {s.n}
        </button>
      ))}
    </div>
    <div className="relative mx-auto max-w-md">
      {/* every card stays mounted in one grid cell: no remounts, stable height, the active card is always opaque */}
      <motion.div
        onPanEnd={(_, info) => {
          if (Math.abs(info.offset.x) < Math.abs(info.offset.y)) return;
          if (info.offset.x < -50) next();
          else if (info.offset.x > 50) select((active + STEPS.length - 1) % STEPS.length);
        }}
        className="grid touch-pan-y"
        data-testid="timeline-mobile-track"
      >
        {steps.map((s, i) => {
          const on = i === active;
          return (
            <motion.div
              key={s.n}
              initial={false}
              animate={{ opacity: on ? 1 : 0, x: on ? 0 : i < active ? -32 : 32 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="col-start-1 row-start-1"
              style={{ pointerEvents: on ? "auto" : "none", zIndex: on ? 1 : 0 }}
              aria-hidden={!on}
            >
              <StepCard s={s} i={i} active={on} onSelect={() => {}} onNext={next} tid="timeline-mobile" focusable={on} />
            </motion.div>
          );
        })}
      </motion.div>
      <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-ic-grey/60">{t("journey.hint")}</p>
    </div>
  </div>
  );
};

export const HowItWorks = () => {
  const { t } = useTranslation();
  const { ref, active, select, next } = useJourney();
  return (
    <section id="come-funziona" className="ic-section overflow-hidden bg-ic-bg" aria-labelledby="journey-title">
      <div className="ic-container" ref={ref}>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal heading>
            <h2 id="journey-title" className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold uppercase leading-[1.08] tracking-tight text-ic-white">
              ICARO <span className="text-ic-cyan2">{t("journey.titleB")}</span>
            </h2>
          </Reveal>
          <Reveal blur delay={0.1}>
            <p className="mt-6 text-base lg:text-lg leading-relaxed text-ic-grey">
              {t("journey.sub")}
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.15} className="mt-14 lg:mt-6">
          <DesktopWheel active={active} select={select} next={next} />
          <MobileSwiper active={active} select={select} next={next} />
        </Reveal>
      </div>
    </section>
  );
};
