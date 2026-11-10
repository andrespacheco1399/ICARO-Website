import { motion, useReducedMotion } from "framer-motion";
import { NeuralCore } from "@/components/neural/NeuralCore";
import { PrimaryButton } from "./Buttons";
import { IcaroText } from "./IcaroText";
import { useSectionNav } from "@/hooks/useSectionNav";
import { useTranslation } from "react-i18next";

export const Hero = () => {
  const go = useSectionNav();
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  return (
    <section id="home" className="relative h-[100svh] min-h-[680px] w-full overflow-hidden bg-ic-bg" aria-labelledby="hero-title">
      {/* depth layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_45%,#0b2443_0%,#091B33_35%,#050D1B_75%)]" aria-hidden />
      <div className="ic-grid-bg absolute inset-0 opacity-60" aria-hidden />
      <NeuralCore className="translate-y-[2%]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ic-bg" aria-hidden />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-5 pt-16 text-center"
      >
        <h1
          id="hero-title"
          className="ic-text-glow font-display font-extralight text-ic-white leading-none tracking-[0.32em] pl-[0.32em] text-[clamp(4rem,15vw,11.5rem)]"
          data-testid="hero-title"
        >
          <IcaroText />
        </h1>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.1, delay: 2.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 bottom-[12%] z-10 flex justify-center px-5"
      >
        <PrimaryButton onClick={() => go("cos-e-icaro")} data-testid="hero-cta-scopri-icaro">{t("hero.cta")}</PrimaryButton>
      </motion.div>
    </section>
  );
};
