import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { isTouchDevice, useDeviceTilt } from "@/hooks/useDeviceTilt";

const NeuralCoreScene = lazy(() => import("./NeuralCoreScene"));

function detectTier(compact) {
  const nav = typeof navigator !== "undefined" ? navigator : {};
  const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  const lowPower = (nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory || 8) <= 4;
  let tier;
  if (lowPower) tier = { count: 4000, nodeCount: 130, dpr: [1, 1.25] };
  else if (mobile) tier = { count: 6500, nodeCount: 170, dpr: [1, 1.5] };
  else tier = { count: 14000, nodeCount: 280, dpr: [1, 1.75] };
  if (compact) tier = { count: Math.round(tier.count * 0.55), nodeCount: Math.round(tier.nodeCount * 0.75), neighbours: 4, crossRatio: 0.22, dpr: [1, 1.5] };
  return { ...tier, mobile };
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Static fallback: CSS glow core for devices without WebGL. */
export const CoreFallback = () => (
  <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
    <div className="ic-anim-breathe h-[46%] aspect-square rounded-full bg-[radial-gradient(circle,rgba(57,228,255,0.45),rgba(0,207,255,0.12)_40%,transparent_70%)] blur-md" />
  </div>
);

export const NeuralCore = ({ compact = false, autonomous = false, className = "" }) => {
  const wrap = useRef(null);
  const pointer = useRef({ x: 0, y: 0, inside: false, lastMove: -99, burst: 0 });
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [webgl] = useState(() => hasWebGL());
  const tier = useMemo(() => detectTier(compact), [compact]);
  const [touch] = useState(() => isTouchDevice());
  // phones/tablets: tilt replaces the mouse (never on autonomous backgrounds)
  useDeviceTilt(pointer, touch && !autonomous && visible && !reduced);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    if (autonomous || touch) return () => io.disconnect();
    // compact core reacts while the pointer is over its surrounding diagram
    const zone = compact ? el.closest("[data-pointer-zone]") || el : el;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const z = zone.getBoundingClientRect();
      const inside = e.clientY >= z.top && e.clientY <= z.bottom && (!compact || (e.clientX >= z.left && e.clientX <= z.right));
      const clamp = (v) => (compact ? Math.max(-1.5, Math.min(1.5, v)) : v);
      pointer.current.x = clamp(((e.clientX - r.left) / r.width) * 2 - 1);
      pointer.current.y = clamp(-(((e.clientY - r.top) / r.height) * 2 - 1));
      pointer.current.inside = inside;
      if (inside) pointer.current.lastMove = performance.now() / 1000;
    };
    const onDown = () => { if (pointer.current.inside) pointer.current.burst = 0.6; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [compact, autonomous, touch]);

  return (
    <div ref={wrap} className={`absolute inset-0 ${className}`} data-testid={compact ? "corporate-neural-core" : "hero-neural-core"}>
      {webgl ? (
        <Suspense fallback={<CoreFallback />}>
          <NeuralCoreScene tier={tier} pointer={pointer} reduced={!!reduced} compact={compact} active={visible} autonomous={autonomous} />
        </Suspense>
      ) : (
        <CoreFallback />
      )}
    </div>
  );
};
