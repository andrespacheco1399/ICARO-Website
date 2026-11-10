import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];
const MASK = "linear-gradient(90deg, #000 var(--rv), transparent calc(var(--rv) + 18%))";

/**
 * Headings: progressively "generated" from left to right through a soft moving mask edge.
 * The in-view observer sits on the unmasked outer wrapper; the mask is removed once done.
 */
const HeadingReveal = ({ children, delay, className, ...rest }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [done, setDone] = useState(false);
  return (
    <div ref={ref} className={className} {...rest}>
      <motion.div
        initial={{ "--rv": "-18%", x: -10 }}
        animate={inView ? { "--rv": "100%", x: 0 } : undefined}
        transition={{ duration: 1.3, delay, ease: EASE }}
        onAnimationComplete={() => inView && setDone(true)}
        style={done ? undefined : { WebkitMaskImage: MASK, maskImage: MASK }}
      >
        {children}
      </motion.div>
    </div>
  );
};

/** Text blocks: fade-in + slight rise (+ optional blur-to-sharp). `heading` switches to the left→right reveal. */
export const Reveal = ({ children, delay = 0, y = 28, blur = false, heading = false, className = "", as = "div", ...rest }) => {
  const reduce = useReducedMotion();
  if (heading && !reduce) return <HeadingReveal delay={delay} className={className} {...rest}>{children}</HeadingReveal>;
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y, ...(blur && { filter: "blur(8px)" }) }}
      whileInView={{ opacity: 1, y: 0, ...(blur && { filter: "blur(0px)" }) }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: blur ? 1.1 : 0.8, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Comp>
  );
};

export const SectionHeader = ({ eyebrow, title, children, className = "", titleClass = "" }) => (
  <div className={`max-w-3xl ${className}`}>
    <Reveal blur>
      <p className="ic-eyebrow mb-5">{eyebrow}</p>
    </Reveal>
    <Reveal heading delay={0.08}>
      <h2 className={`font-display font-semibold tracking-tight text-ic-white text-3xl sm:text-4xl lg:text-5xl leading-[1.08] ${titleClass}`}>
        {title}
      </h2>
    </Reveal>
    {children && (
      <Reveal blur delay={0.16}>
        <div className="mt-6 text-base lg:text-lg leading-relaxed text-ic-grey">{children}</div>
      </Reveal>
    )}
  </div>
);
