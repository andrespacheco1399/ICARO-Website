import { Link } from "react-router-dom";
import { Wordmark } from "./Navbar";
import { useSectionNav } from "@/hooks/useSectionNav";
import { useTranslation } from "react-i18next";
import { useNavLinks } from "@/lib/content";

export const Footer = () => {
  const go = useSectionNav();
  const { t } = useTranslation();
  const links = useNavLinks().filter((l) => l.id !== "come-funziona");
  const linkCls = "text-sm text-ic-grey hover:text-ic-cyan2 transition-colors duration-300";
  return (
    <footer className="relative border-t border-ic-cyan2/10 bg-ic-bg px-5 pb-10 pt-20 sm:px-8 lg:px-12" data-testid="site-footer">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ic-cyan2/40 to-transparent" aria-hidden />
      <div className="ic-container">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Wordmark className="text-3xl" />
            <p className="mt-4 font-display text-lg font-light text-ic-grey">{t("footer.tagline")}</p>
          </div>
          <nav className="md:col-span-3" aria-label={t("footer.siteAria")}>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-ic-cyan">{t("footer.site")}</p>
            <ul className="mt-5 space-y-3">
              {links.map((l) => (
                <li key={l.id}><button onClick={() => go(l.id)} className={linkCls} data-testid={`footer-link-${l.id}`}>{l.label}</button></li>
              ))}
            </ul>
          </nav>
          <nav className="md:col-span-4" aria-label={t("footer.legalAria")}>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-ic-cyan">{t("footer.legal")}</p>
            <ul className="mt-5 space-y-3">
              <li><Link to="/privacy" className={linkCls} data-testid="footer-link-privacy">{t("footer.privacy")}</Link></li>
              <li><Link to="/cookie" className={linkCls} data-testid="footer-link-cookie">{t("footer.cookie")}</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-ic-cyan2/10 pt-8 text-xs text-ic-grey/60 md:flex-row md:items-center md:justify-between">
          <p data-testid="footer-legal-placeholder">{t("footer.placeholder")}</p>
          <p>© {new Date().getFullYear()} ICARO. {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
};
