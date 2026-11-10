import { useEffect, useState } from "react";
import { TrendingUp, Calculator, Settings2, Megaphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NeuralCore } from "@/components/neural/NeuralCore";
import { Reveal } from "./Reveal";
import { IcaroText } from "./IcaroText";

// Logos reproduced from the reference diagram supplied by the client. Accounting 1–2 are left unnamed on purpose.
const DEPTS = [
  { id: "sales", icon: TrendingUp, apps: [["hubspot", "HubSpot"], ["salesforce", "Salesforce"], ["whatsapp", "WhatsApp"], ["gmail", "Gmail"]] },
  { id: "accounting", icon: Calculator, apps: [["contabilita-1", null], ["contabilita-2", null], ["stripe", "Stripe"]] },
  { id: "operations", icon: Settings2, apps: [["sap", "SAP"], ["teams", "Microsoft Teams"], ["google-calendar", "Google Calendar"]] },
  { id: "marketing", icon: Megaphone, apps: [["shopify", "Shopify"], ["notion", "Notion"], ["google-drive", "Google Drive"]] },
];
const BUS_END = 1.05 + 1.05; // trunk + half bus (s)
const FAST = 0.56; // travel time of a short connector (s)

/** Vertical connector with a travelling cyan pulse. */
const VLine = ({ delay = 0, fast = false, className = "" }) => (
  <div className={`relative mx-auto w-[2px] overflow-hidden bg-ic-cyan2/20 shadow-[0_0_8px_rgba(0,207,255,0.3)] ${className}`} aria-hidden>
    <span className={`ic-run ${fast ? "ic-run-fast" : ""}`} style={{ animationDelay: `${delay}s` }} />
  </div>
);

const Brain = () => (
  <div className="relative mx-auto h-[150px] w-[150px] sm:h-[190px] sm:w-[190px]" data-pointer-zone data-testid="eco-brain">
    <div className="ic-anim-spin absolute -inset-5 rounded-full border border-dashed border-ic-cyan2/20" aria-hidden />
    <div className="ic-anim-breathe absolute -inset-2 rounded-full border border-ic-cyan2/25" aria-hidden />
    <div className="absolute inset-0 overflow-hidden rounded-full border border-ic-cyan2/40 bg-[radial-gradient(circle,#0d2a4d,#050D1B_70%)] shadow-[0_0_60px_-12px_rgba(0,207,255,0.55)]">
      <NeuralCore compact />
      <span className="absolute inset-x-0 bottom-[13%] text-center font-mono text-[9px] tracking-[0.3em] text-ic-cyan2/90"><IcaroText mono /></span>
    </div>
  </div>
);

const DeptBadge = ({ dept, delay }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center">
      <div
        className="ic-dept-glow flex h-16 w-16 items-center justify-center rounded-full border bg-[radial-gradient(circle,#0d2a4d,#050D1B_75%)] text-ic-cyan2 sm:h-20 sm:w-20"
        style={{ animationDelay: `${delay}s` }}
        data-testid={`eco-dept-${dept.id}`}
      >
        <dept.icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.5} aria-hidden />
      </div>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ic-white sm:text-xs">{t(`eco.depts.${dept.id}`)}</p>
    </div>
  );
};

const AppTile = ({ app, idx, delay, picked, onPick }) => {
  const { t } = useTranslation();
  const [file, name] = app;
  const label = name || t("eco.accountingApp", { n: idx + 1 });
  const on = picked === file;
  return (
    <button
      type="button"
      onClick={() => onPick(on ? null : file)}
      className={`ic-app-glow group relative flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl border bg-ic-night/60 backdrop-blur-md transition-[transform,background-color] duration-300 hover:-translate-y-1 hover:bg-ic-night/90 active:scale-95 sm:h-[68px] sm:w-[68px] ${on ? "-translate-y-1 bg-ic-night/90" : ""}`}
      style={{ animationDelay: `${delay}s` }}
      aria-label={label}
      title={label}
      data-testid={`eco-app-${file}`}
    >
      <span className="block h-[42px] w-[42px] overflow-hidden rounded-xl bg-white sm:h-12 sm:w-12">
        <img src={`/logos/${file}.png`} alt="" className="h-full w-full object-cover" loading="lazy" draggable={false} />
      </span>
      <span className={`pointer-events-none absolute left-1/2 top-full z-10 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-ic-cyan2/25 bg-ic-bg/95 px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] text-ic-white transition-opacity duration-300 ${on ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
        {label}
      </span>
    </button>
  );
};

/* ≥ md: four columns under a horizontal bus, as in the reference */
const WideDiagram = ({ picked, onPick }) => (
  <div data-testid="eco-diagram-wide">
    <Brain />
    <VLine className="mt-6 h-14" />
    <div className="relative mx-[12.5%] h-[2px]" aria-hidden>
      {[0, 1].map((side) => (
        <div key={side} className={`absolute top-0 h-[2px] w-1/2 overflow-hidden bg-ic-cyan2/20 ${side ? "left-1/2" : "left-0 -scale-x-100"}`}>
          <span className="ic-run ic-run-x" style={{ animationDelay: "1.05s" }} />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-4">
      {DEPTS.map((d, i) => {
        const stub = 1.05 + 1.05 * (i === 1 || i === 2 ? 0.34 : 1);
        const glow = stub + FAST;
        return (
          <Reveal key={d.id} delay={0.1 + i * 0.1} className="flex flex-col items-center">
            <VLine fast delay={stub} className="h-10" />
            <DeptBadge dept={d} delay={glow} />
            {d.apps.map((a, j) => {
              const c = glow + 0.2 + j * FAST;
              return (
                <div key={a[0]} className="flex flex-col items-center">
                  <VLine fast delay={c} className="h-7" />
                  <AppTile app={a} idx={j} delay={c + FAST - 0.1} picked={picked} onPick={onPick} />
                </div>
              );
            })}
          </Reveal>
        );
      })}
    </div>
  </div>
);

/* < md: departments stacked along one neural spine, apps in a row */
const StackDiagram = ({ picked, onPick }) => (
  <div data-testid="eco-diagram-stack">
    <Brain />
    {DEPTS.map((d, i) => {
      const c = i * 1.2;
      return (
        <Reveal key={d.id} delay={0.05} className="flex flex-col items-center">
          <VLine fast delay={c} className={i ? "h-8" : "mt-6 h-10"} />
          <div className="ic-glass w-full max-w-sm rounded-3xl px-4 pb-8 pt-5">
            <DeptBadge dept={d} delay={c + FAST - 0.1} />
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {d.apps.map((a, j) => (
                <AppTile key={a[0]} app={a} idx={j} delay={c + FAST + 0.4 + j * 0.15} picked={picked} onPick={onPick} />
              ))}
            </div>
          </div>
        </Reveal>
      );
    })}
  </div>
);

// render only one layout, so only one WebGL brain exists at a time
const WIDE_MQ = "(min-width: 768px)";
function useWide() {
  const [wide, setWide] = useState(() => window.matchMedia(WIDE_MQ).matches);
  useEffect(() => {
    const mq = window.matchMedia(WIDE_MQ);
    const on = () => setWide(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

export const OrgDiagram = () => {
  const { t } = useTranslation();
  const [picked, setPicked] = useState(null);
  const wide = useWide();
  return (
    <figure className="relative" aria-label={t("eco.diagramAria")} data-testid="eco-diagram">
      {wide ? <WideDiagram picked={picked} onPick={setPicked} /> : <StackDiagram picked={picked} onPick={setPicked} />}
    </figure>
  );
};
