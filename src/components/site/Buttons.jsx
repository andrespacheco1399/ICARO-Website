import { ArrowRight } from "lucide-react";

const base =
  "group relative inline-flex items-center justify-center gap-2.5 rounded-full font-display text-[13px] font-semibold uppercase tracking-[0.14em] px-7 py-3.5 transition-[transform,box-shadow,background-color,border-color,color] duration-300 active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none";

export const PrimaryButton = ({ children, className = "", icon = true, ...props }) => (
  <button
    className={`${base} bg-ic-cyan text-ic-bg shadow-[0_0_0_1px_rgba(57,228,255,0.6),0_10px_40px_-10px_rgba(0,207,255,0.7)] hover:bg-ic-cyan2 hover:shadow-[0_0_0_1px_rgba(57,228,255,0.9),0_14px_50px_-8px_rgba(0,207,255,0.9)] hover:-translate-y-0.5 ${className}`}
    {...props}
  >
    {children}
    {icon && <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />}
  </button>
);

export const GhostButton = ({ children, className = "", ...props }) => (
  <button
    className={`${base} border border-ic-cyan2/30 bg-ic-night/40 text-ic-white backdrop-blur-md hover:border-ic-cyan2/80 hover:bg-ic-night/70 hover:shadow-[0_0_30px_-6px_rgba(0,207,255,0.55)] hover:-translate-y-0.5 ${className}`}
    {...props}
  >
    {children}
  </button>
);
