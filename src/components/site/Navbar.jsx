import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useNavLinks } from "@/lib/content";
import { useSectionNav } from "@/hooks/useSectionNav";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { IcaroText } from "./IcaroText";

export const Wordmark = ({ className = "", tracking = "tracking-[0.42em]" }) => (
  <span className={`font-display font-light text-ic-white ${tracking} ${className}`}>
    <IcaroText oClass="text-ic-cyan2" />
  </span>
);

export const Navbar = () => {
  const go = useSectionNav();
  const { t } = useTranslation();
  const links = useNavLinks();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = (id) => { setOpen(false); go(id, { focusForm: id === "contatti" }); };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 border-b ${
        scrolled ? "bg-ic-bg/70 backdrop-blur-xl border-ic-cyan2/10" : "bg-ic-bg/30 backdrop-blur-md border-transparent"
      }`}
      data-testid="site-navbar"
    >
      <nav className="relative mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-4 sm:px-8" aria-label={t("nav.main")}>
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex min-w-0 items-baseline gap-2 sm:gap-3" data-testid="nav-logo" aria-label={t("nav.homeAria")}>
          <Wordmark className="text-[17px] sm:text-[22px]" tracking="tracking-[0.3em] sm:tracking-[0.42em]" />
          <span className="whitespace-nowrap font-display text-[13px] sm:text-[17px] font-light uppercase tracking-[0.12em] sm:tracking-[0.2em] text-ic-white/85" data-testid="nav-brand-by-shortcut">
            <span className="ic-text-glow font-mono normal-case text-ic-cyan2">by</span> SHORTCUT
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <LanguageSwitcher />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="rounded-full border border-ic-cyan2/25 p-2.5 text-ic-white" aria-label={t("nav.openMenu")} data-testid="nav-mobile-toggle">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" closeLabel={t("common.close")} className="w-[86vw] max-w-sm border-l border-ic-cyan2/15 bg-ic-bg/95 backdrop-blur-xl text-ic-white">
              <SheetTitle className="mb-10 text-left"><Wordmark /></SheetTitle>
              <ul className="flex flex-col gap-2">
                {links.map((l, i) => (
                  <li key={l.id}>
                    <button onClick={() => nav(l.id)} className="flex w-full items-baseline gap-4 border-b border-ic-cyan2/10 py-4 text-left font-display text-xl" data-testid={`mobile-nav-link-${l.id}`}>
                      <span className="font-mono text-xs text-ic-cyan">0{i + 1}</span>{l.label}
                    </button>
                  </li>
                ))}
              </ul>
              <button onClick={() => nav("contatti")} className="mt-10 w-full rounded-full bg-ic-cyan py-3.5 font-display text-xs font-semibold uppercase tracking-[0.16em] text-ic-bg" data-testid="mobile-nav-cta">
                {t("nav.cta")}
              </button>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};
