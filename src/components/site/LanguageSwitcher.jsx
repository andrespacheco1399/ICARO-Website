import { useTranslation } from "react-i18next";
import { Check, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LANGS } from "@/i18n";

const Flag = ({ lng }) => (
  <svg viewBox="0 0 30 20" className="h-3 w-[18px] shrink-0 overflow-hidden rounded-[2px] ring-1 ring-ic-white/15" aria-hidden>
    {lng === "it" ? (
      <>
        <rect width="10" height="20" fill="#009246" />
        <rect x="10" width="10" height="20" fill="#F1F2F1" />
        <rect x="20" width="10" height="20" fill="#CE2B37" />
      </>
    ) : (
      <>
        <rect width="30" height="20" fill="#012169" />
        <path d="M0 0L30 20M30 0L0 20" stroke="#fff" strokeWidth="4" />
        <path d="M0 0L30 20M30 0L0 20" stroke="#C8102E" strokeWidth="1.6" />
        <path d="M15 0V20M0 10H30" stroke="#fff" strokeWidth="6" />
        <path d="M15 0V20M0 10H30" stroke="#C8102E" strokeWidth="3.4" />
      </>
    )}
  </svg>
);

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const cur = LANGS.includes(i18n.language) ? i18n.language : "it";
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-[42px] items-center gap-1.5 sm:gap-2 rounded-full border border-ic-cyan2/25 bg-ic-bg/40 px-2.5 sm:px-3.5 font-mono text-[11px] sm:text-xs tracking-[0.14em] text-ic-white transition-[border-color,box-shadow,background-color] duration-300 hover:border-ic-cyan2/70 hover:bg-ic-night/70 hover:shadow-[0_0_20px_-6px_rgba(0,207,255,0.7)] data-[state=open]:border-ic-cyan2/70"
          aria-label={t("lang.change", { lang: t(`lang.${cur}`) })}
          data-testid="lang-switcher-trigger"
        >
          <span className="hidden sm:inline-flex"><Flag lng={cur} /></span>
          <span className="text-ic-cyan2">{cur.toUpperCase()}</span>
          <ChevronDown className="hidden h-3.5 w-3.5 text-ic-grey min-[400px]:block" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="min-w-[180px] rounded-2xl border-ic-cyan2/20 bg-ic-night/95 p-1.5 text-ic-white backdrop-blur-xl">
        {LANGS.map((l) => (
          <DropdownMenuItem
            key={l}
            onSelect={() => i18n.changeLanguage(l)}
            className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 font-mono text-xs tracking-[0.12em] focus:bg-ic-cyan/10 focus:text-ic-white ${l === cur ? "text-ic-cyan2" : "text-ic-grey"}`}
            data-testid={`lang-option-${l}`}
          >
            <Flag lng={l} />
            <span>{l.toUpperCase()} — {t(`lang.${l}`)}</span>
            {l === cur && <Check className="ml-auto h-3.5 w-3.5" aria-hidden />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
