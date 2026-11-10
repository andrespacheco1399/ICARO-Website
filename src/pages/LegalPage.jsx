import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export default function LegalPage({ kind }) {
  const { t } = useTranslation();
  const c = { title: t(`legal.${kind}.title`), doc: t(`legal.${kind}.doc`) };
  useEffect(() => { document.title = `${c.title} | ICARO`; window.scrollTo(0, 0); }, [c.title]);
  return (
    <>
      <Navbar />
      <main id="main" className="min-h-[80vh] bg-ic-bg px-5 pb-24 pt-40 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-ic-cyan2 hover:text-ic-white" data-testid="legal-back-link">
            <ArrowLeft className="h-4 w-4" aria-hidden /> {t("legal.back")}
          </Link>
          <h1 className="mt-8 font-display text-4xl sm:text-5xl font-semibold text-ic-white" data-testid="legal-title">{c.title}</h1>
          <div className="ic-glass mt-10 rounded-3xl p-8" data-testid="legal-placeholder">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ic-cyan">{t("legal.inPrep")}</p>
            <p className="mt-4 leading-relaxed text-ic-grey">
              {t("legal.text", { doc: c.doc })}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
