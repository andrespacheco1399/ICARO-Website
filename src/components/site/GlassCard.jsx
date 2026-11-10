import { Reveal } from "./Reveal";

const onSpot = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};

/** Futuristic glass card (icon, number, title, text) — shared visual style. */
export const GlassCard = ({ n, icon: Icon, title, text, delay = 0, testId }) => (
  <Reveal delay={delay} className="h-full">
    <article
      onMouseMove={onSpot}
      className="ic-glass group relative h-full overflow-hidden rounded-3xl p-7 sm:p-8 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1.5 hover:border-ic-cyan2/45 hover:shadow-[0_0_50px_-18px_rgba(0,207,255,0.6)]"
      data-testid={testId}
    >
      <div className="ic-spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
      <div className="relative flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-ic-cyan2/25 bg-gradient-to-br from-ic-cyan/20 to-ic-tech/20 text-ic-cyan2 shadow-[0_0_30px_-10px_rgba(0,207,255,0.7)] transition-transform duration-500 group-hover:scale-105">
          <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden />
        </div>
        <span className="font-mono text-sm text-ic-grey/50 transition-colors duration-300 group-hover:text-ic-cyan">{n}</span>
      </div>
      <h3 className="relative mt-10 font-display text-xl font-semibold leading-snug text-ic-white">{title}</h3>
      <p className="relative mt-3 text-[15px] leading-relaxed text-ic-grey">{text}</p>
      <span className="absolute bottom-0 left-8 right-8 h-px origin-left scale-x-0 bg-gradient-to-r from-ic-cyan via-ic-cyan2 to-transparent transition-transform duration-700 group-hover:scale-x-100" aria-hidden />
    </article>
  </Reveal>
);
