import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";
import { ContactForm } from "./ContactForm";

export const ContactSection = ({
  id = "contatti",
  eyebrow,
  title,
  subtitle,
  origine = "home",
  defaultTipologia = "",
  idPrefix = "contact",
}) => {
  const { t } = useTranslation();
  const next = t("contact.next");
  return (
  <section id={id} className="ic-section overflow-hidden bg-ic-bg" aria-labelledby={`${id}-title`}>
    <div className="absolute left-[-10%] top-1/3 h-[480px] w-[480px] rounded-full bg-ic-cyan/[0.07] blur-[120px]" aria-hidden />
    <div className="relative ic-container grid gap-16 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <Reveal blur><p className="ic-eyebrow mb-5">{eyebrow || t("contact.eyebrow")}</p></Reveal>
        <Reveal heading delay={0.08}>
          <h2 id={`${id}-title`} className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold uppercase leading-[1.05] tracking-tight text-ic-white">
            {title || <>{t("contact.titleA")} <span className="text-ic-cyan2">{t("contact.titleB")}</span></>}
          </h2>
        </Reveal>
        <Reveal blur delay={0.16}><p className="mt-6 text-base lg:text-lg leading-relaxed text-ic-grey">{subtitle || t("contact.subtitle")}</p></Reveal>
        <Reveal delay={0.24}>
          <ul className="mt-12 space-y-6 border-l border-ic-cyan2/15 pl-6">
            {next.map((s, i) => (
              <li key={i}>
                <p className="font-mono text-[11px] tracking-[0.22em] text-ic-cyan">{`0${i + 1}`}</p>
                <p className="mt-1 font-display font-semibold text-ic-white">{s.t}</p>
                <p className="mt-1 text-sm text-ic-grey">{s.d}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
      <Reveal delay={0.1} className="lg:col-span-7">
        <div className="ic-glass relative rounded-3xl p-6 sm:p-10">
          <span className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-ic-cyan2/60 to-transparent" aria-hidden />
          <ContactForm origine={origine} defaultTipologia={defaultTipologia} idPrefix={idPrefix} />
        </div>
      </Reveal>
    </div>
  </section>
  );
};
