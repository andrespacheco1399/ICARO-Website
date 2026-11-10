import { NeuralCore } from "@/components/neural/NeuralCore";
import { CORE_MODULES } from "@/lib/content";
import { useTranslation } from "react-i18next";
import { IcaroText } from "./IcaroText";

const R = 40; // radius in % of the square
const CYCLE = 4.8; // seconds for a full round of pulses

const nodesPos = CORE_MODULES.map((label, i) => {
  const a = (-90 + i * 60) * (Math.PI / 180);
  return { label, x: 50 + Math.cos(a) * R, y: 50 + Math.sin(a) * R, delay: i * (CYCLE / CORE_MODULES.length) };
});

export const CorporateDiagram = () => {
  const { t } = useTranslation();
  return (
  <div className="relative mx-auto aspect-square w-full max-w-[560px]" data-pointer-zone role="img" aria-label={t("corporate.diagramAria")} data-testid="corporate-diagram">
    {/* orbits */}
    <div className="absolute inset-[10%] rounded-full border border-ic-cyan2/10" aria-hidden />
    <div className="ic-anim-spin absolute inset-[4%] rounded-full border border-dashed border-ic-cyan2/15" aria-hidden />
    <div className="absolute inset-[28%] rounded-full border border-ic-cyan2/10" aria-hidden />

    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden>
      <defs>
        <linearGradient id="pulse-grad" x1="0" x2="1">
          <stop offset="0" stopColor="#39E4FF" stopOpacity="0" />
          <stop offset="1" stopColor="#39E4FF" stopOpacity="1" />
        </linearGradient>
      </defs>
      {nodesPos.map((n) => (
        <g key={n.label}>
          <line x1="50" y1="50" x2={n.x} y2={n.y} stroke="#39E4FF" strokeOpacity="0.14" strokeWidth="0.3" />
          <line
            x1="50" y1="50" x2={n.x} y2={n.y}
            stroke="#39E4FF" strokeWidth="0.55" strokeLinecap="round"
            pathLength="460" strokeDasharray="60 460"
            style={{ animation: `ic-dash ${CYCLE}s cubic-bezier(.5,0,.3,1) ${n.delay}s infinite`, filter: "drop-shadow(0 0 1.2px #00CFFF)" }}
          />
        </g>
      ))}
    </svg>

    {/* central neural core */}
    <div className="absolute left-1/2 top-1/2 h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border border-ic-cyan2/30 bg-[radial-gradient(circle,#0d2a4d,#050D1B_70%)] shadow-[0_0_50px_-14px_rgba(0,207,255,0.3)]">
      <NeuralCore compact />
      <span className="absolute inset-x-0 bottom-[14%] text-center font-mono text-[9px] tracking-[0.3em] text-ic-cyan2/90"><IcaroText mono /></span>
    </div>

    {nodesPos.map((n) => (
      <div
        key={n.label}
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-ic-night/80 px-3 py-2 sm:px-4 sm:py-2.5 backdrop-blur-md"
        style={{ left: `${n.x}%`, top: `${n.y}%`, animation: `ic-node ${CYCLE}s ease-out ${n.delay}s infinite` }}
        data-testid={`corporate-node-${n.label.toLowerCase()}`}
      >
        <span className="font-mono text-[9px] sm:text-[11px] tracking-[0.2em] text-ic-white">{n.label}</span>
      </div>
    ))}
  </div>
  );
};
