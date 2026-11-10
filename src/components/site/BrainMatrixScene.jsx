import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { NeuralCore } from "@/components/neural/NeuralCore";

const GOLD = "247, 212, 128"; // soft gold (slightly richer than the original pale gold)
const CYAN = "57, 228, 255";
const GAP = 26;
const rand = (a, b) => a + Math.random() * (b - a);

/** Pre-rendered soft glow sprite (cheaper than shadowBlur every frame). */
const makeGlow = (rgb, size = 64) => {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, `rgba(${rgb}, 0.9)`);
  grd.addColorStop(0.35, `rgba(${rgb}, 0.28)`);
  grd.addColorStop(1, `rgba(${rgb}, 0)`);
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return c;
};

const bez = (s, t) => {
  const u = 1 - t;
  return [
    u * u * u * s.sx + 3 * u * u * t * s.c1x + 3 * u * t * t * s.c2x + t * t * t * s.ex,
    u * u * u * s.sy + 3 * u * u * t * s.c1y + 3 * u * t * t * s.c2y + t * t * t * s.ey,
  ];
};

// smooth fade-in → hold → fade-out envelope (0..1)
const envelope = (e, now) => {
  const k = (now - e.start) / e.dur;
  if (k <= 0 || k >= 1) return 0;
  const rise = 0.3;
  return k < rise ? Math.sin((k / rise) * Math.PI * 0.5) ** 2 : Math.cos(((k - rise) / (1 - rise)) * Math.PI * 0.5) ** 2;
};

/**
 * Background scene for the consulting page: a neural brain (left) wired to a pale-gold
 * dot matrix (right). Fully autonomous — never reacts to the pointer.
 * Brain areas fire → a cyan pulse travels a filament → an organic group (≥10) of matrix dots lights up.
 * `burstRef.current()` triggers the stronger "submission" pulse on every filament.
 */
export const BrainMatrixScene = ({ burstRef }) => {
  const wrap = useRef(null);
  const canvas = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    const ctx = cv.getContext("2d");
    const glowGold = makeGlow(GOLD);
    const glowCyan = makeGlow(CYAN);
    const layer = document.createElement("canvas"); // static filaments + base dots
    const st = { w: 0, h: 0, dots: [], strands: [], pulses: [], sparks: [], nextPulse: 0, nextGroup: 0.6, visible: true, raf: 0, last: 0, now: 0 };

    const lightDot = (d, delay, strength, long = false) => {
      const peak = rand(0.5, 0.95) * strength;
      if (d.ev && st.now < d.ev.start + d.ev.dur && d.ev.peak > peak) return; // keep a brighter ongoing activation
      d.ev = { start: st.now + delay, dur: rand(1.4, 3.2) * (long ? 1.7 : 1), peak };
    };

    // organic group of at least 10 dots: nearest dots to a centre, weighted by a random wobbly outline
    const lightGroup = (cx, cy, { n = 10 + Math.floor(Math.random() * 9), strength = 1, sync = false, long = false } = {}) => {
      if (!st.dots.length) return;
      const k = 2 + Math.floor(Math.random() * 3), p1 = rand(0, 6.28), p2 = rand(0, 6.28);
      const scored = st.dots.map((d) => {
        const dx = d.x - cx, dy = d.y - cy, a = Math.atan2(dy, dx), r = Math.hypot(dx, dy);
        return { d, r, sc: r / (1 + 0.45 * Math.sin(k * a + p1) + 0.2 * Math.sin((k + 2) * a + p2)) };
      });
      scored.sort((a, b) => a.sc - b.sc);
      scored.slice(0, Math.max(10, n)).forEach(({ d, r }) => {
        const delay = sync ? rand(0, 0.08) : (r / GAP) * 0.08 + rand(0, 0.3);
        lightDot(d, delay, strength * rand(0.7, 1.05), long);
      });
    };

    const paintLayer = (dpr) => {
      layer.width = cv.width; layer.height = cv.height;
      const l = layer.getContext("2d");
      l.setTransform(dpr, 0, 0, dpr, 0, 0);
      l.lineWidth = 1;
      l.strokeStyle = `rgba(${CYAN}, 0.11)`;
      l.shadowColor = `rgba(${CYAN}, 0.4)`;
      l.shadowBlur = 4;
      st.strands.forEach((s) => {
        l.beginPath();
        l.moveTo(s.sx, s.sy);
        l.bezierCurveTo(s.c1x, s.c1y, s.c2x, s.c2y, s.ex, s.ey);
        l.stroke();
      });
    };

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = el.getBoundingClientRect();
      if (Math.round(r.width) === Math.round(st.w) && Math.round(r.height) === Math.round(st.h)) return;
      st.w = r.width; st.h = r.height;
      cv.width = r.width * dpr; cv.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const mobile = r.width < 768;
      const x0 = r.width * (mobile ? 0.62 : 0.6);
      const x1 = r.width - (mobile ? 16 : 48);
      const y0 = r.height * 0.18, y1 = r.height * 0.86;
      st.dots = [];
      for (let x = x0; x <= x1; x += GAP) for (let y = y0; y <= y1; y += GAP) st.dots.push({ x, y, s: Math.random(), ev: null });
      const bx = r.width * (mobile ? 0.28 : 0.24), by = r.height * 0.5;
      const edge = st.dots.filter((d) => d.x < x0 + GAP * 0.5);
      const n = mobile ? 6 : 10;
      st.strands = edge.length ? Array.from({ length: n }, (_, i) => {
        const d = edge[Math.floor(((i + 0.5) / n) * edge.length)];
        const sx = bx + (Math.random() - 0.3) * 60, sy = by + (Math.random() - 0.5) * 120;
        return { sx, sy, ex: d.x, ey: d.y, c1x: sx + (d.x - sx) * 0.35, c1y: sy, c2x: sx + (d.x - sx) * 0.65, c2y: d.y };
      }) : [];
      st.mobile = mobile;
      st.bx = bx; st.by = by;
      // keep in-flight pulses (e.g. the submission burst while the form swaps to its success state)
      st.pulses = st.strands.length ? st.pulses.map((p) => ({ ...p, s: st.strands[p.i % st.strands.length] })) : [];
      paintLayer(dpr);
      if (reduce) {
        // curated static frame: a few softly lit dots, no motion
        st.now = 1;
        st.dots.forEach((d) => { if (Math.random() < 0.06) d.ev = { start: 0, dur: 2, peak: rand(0.4, 0.8) }; });
        render();
      }
    };

    // brain-side firing: a small cluster of neurons swells around the filament origin
    const fireOrigin = (s, strong = false) => {
      const count = (strong ? 6 : 3) + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        st.sparks.push({ x: s.sx + rand(-22, 22), y: s.sy + rand(-22, 22), start: st.now + rand(0, 0.35), dur: rand(0.9, 1.6), peak: rand(0.4, 0.9) * (strong ? 1.3 : 1), r: rand(10, 20) * (strong ? 1.4 : 1) });
      }
    };

    const spawnPulse = (i, strong = false, delay = 0) => {
      const s = st.strands[i];
      fireOrigin(s, strong);
      st.pulses.push({ i, s, strong, start: st.now + 0.35 + delay, dur: strong ? rand(1.4, 1.8) : rand(1.7, 2.6), done: false });
    };

    const arrive = (p) => {
      if (p.strong) lightGroup(p.s.ex + GAP * rand(1, 3), p.s.ey, { n: 26 + Math.floor(Math.random() * 10), strength: 1.35, sync: true, long: true });
      else lightGroup(p.s.ex + GAP * rand(0, 2), p.s.ey, { n: 10 + Math.floor(Math.random() * 5) });
    };

    // confirmed form submission: brain flash + a bright pulse on every filament → large simultaneous matrix bloom
    const submitBurst = () => {
      if (reduce || !st.strands.length) return;
      st.sparks.push({ x: st.bx, y: st.by, start: st.now, dur: 1.8, peak: 0.55, r: Math.min(st.w, st.h) * 0.22 });
      st.strands.forEach((_, i) => spawnPulse(i, true, rand(0, 0.3)));
    };
    if (burstRef) burstRef.current = submitBurst;

    const randomMatrix = () => {
      if (st.now < st.nextGroup || !st.dots.length) return;
      st.nextGroup = st.now + (st.mobile ? rand(1.4, 2.8) : rand(0.9, 2.2)); // moderate, asynchronous areas
      const d = st.dots[Math.floor(Math.random() * st.dots.length)];
      lightGroup(d.x, d.y);
    };

    const render = () => {
      const now = st.now;
      ctx.clearRect(0, 0, st.w, st.h);
      ctx.drawImage(layer, 0, 0, st.w, st.h);
      // brain-side neuron sparks
      st.sparks = st.sparks.filter((p) => now < p.start + p.dur);
      st.sparks.forEach((p) => {
        const a = envelope(p, now) * p.peak;
        if (a <= 0) return;
        ctx.globalAlpha = a * 0.7;
        ctx.drawImage(glowCyan, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      });
      // travelling pulses with fading tail
      st.pulses = st.pulses.filter((p) => !p.done);
      st.pulses.forEach((p) => {
        const k = (now - p.start) / p.dur;
        if (k < 0) return;
        if (k >= 1) { p.done = true; arrive(p); return; }
        const head = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2; // ease in-out
        const fade = Math.min(1, k * 6) * Math.min(1, (1 - k) * 8 + 0.4);
        for (let i = 9; i >= 0; i--) {
          const t = head - i * 0.018;
          if (t < 0) continue;
          const [x, y] = bez(p.s, t);
          const a = (1 - i / 10) ** 2 * fade;
          ctx.globalAlpha = Math.min(1, a * (p.strong ? 0.95 : 0.55));
          const r = (p.strong ? 13 : 9) - i * 0.5;
          ctx.drawImage(glowCyan, x - r, y - r, r * 2, r * 2);
        }
        const [hx, hy] = bez(p.s, head);
        ctx.globalAlpha = 0.85 * fade;
        ctx.fillStyle = `rgb(${CYAN})`;
        ctx.beginPath(); ctx.arc(hx, hy, 1.6, 0, Math.PI * 2); ctx.fill();
      });
      // pale-gold matrix
      const t = now;
      ctx.fillStyle = `rgb(${GOLD})`;
      st.dots.forEach((d) => {
        let e = 0;
        if (d.ev) { e = envelope(d.ev, now) * d.ev.peak; if (now > d.ev.start + d.ev.dur) d.ev = null; }
        const tw = 0.5 + 0.5 * Math.sin(t * (0.3 + d.s * 0.7) + d.s * 30);
        ctx.globalAlpha = Math.min(1, 0.17 + tw * 0.12 + e * 0.6);
        ctx.beginPath(); ctx.arc(d.x, d.y, 1.2 + e * 0.9, 0, Math.PI * 2); ctx.fill();
        if (e > 0.05) {
          const r = 7 + e * 7;
          ctx.globalAlpha = e * 0.45;
          ctx.drawImage(glowGold, d.x - r, d.y - r, r * 2, r * 2);
        }
      });
      ctx.globalAlpha = 1;
    };

    const tick = (time) => {
      const dt = Math.min((time - (st.last || time)) / 1000, 0.05);
      st.last = time;
      st.now += dt;
      if (st.now >= st.nextPulse && st.strands.length && st.pulses.filter((p) => !p.strong).length < (st.mobile ? 2 : 3)) {
        spawnPulse(Math.floor(Math.random() * st.strands.length));
        st.nextPulse = st.now + rand(0.9, 2.3);
      }
      randomMatrix();
      render();
      if (st.visible) st.raf = requestAnimationFrame(tick);
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      st.visible = e.isIntersecting;
      cancelAnimationFrame(st.raf);
      st.last = 0;
      if (st.visible && !reduce) st.raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      ro.disconnect(); io.disconnect();
      cancelAnimationFrame(st.raf);
      if (burstRef) burstRef.current = null;
    };
  }, [reduce, burstRef]);

  return (
    <div ref={wrap} className="pointer-events-none absolute inset-0" aria-hidden data-testid="consult-background-scene">
      <div className="absolute inset-y-0 left-[-12%] w-[80%] opacity-55 sm:left-[-8%] sm:w-[64%] lg:left-0 lg:w-[48%]">
        <NeuralCore autonomous />
      </div>
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" data-testid="consult-matrix-canvas" />
    </div>
  );
};
