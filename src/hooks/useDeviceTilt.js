import { useEffect } from "react";

/* Device-orientation input for the neural brains on touch devices (replaces mouse illumination). */

let permission = null; // "granted" | "denied" | null (shared by every brain on the page)
let asking = null;

export const isTouchDevice = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: none) and (pointer: coarse)").matches;

const supported = () => typeof window !== "undefined" && "DeviceOrientationEvent" in window;
const needsPermission = () => supported() && typeof window.DeviceOrientationEvent.requestPermission === "function";

/** iOS: ask once, on the visitor's first tap anywhere. Other browsers: no prompt needed. */
function whenAllowed(cb) {
  if (!supported()) return () => {};
  if (!needsPermission() || permission) {
    if (permission !== "denied") cb();
    return () => {};
  }
  let done = false;
  const ask = () => {
    if (done) return;
    done = true;
    off();
    asking = asking || window.DeviceOrientationEvent.requestPermission()
      .then((r) => { permission = r; })
      .catch(() => { permission = "denied"; });
    asking.then(() => permission === "granted" && cb());
  };
  const off = () => {
    window.removeEventListener("touchend", ask);
    window.removeEventListener("click", ask);
  };
  window.addEventListener("touchend", ask, { passive: true });
  window.addEventListener("click", ask);
  return () => { done = true; off(); };
}

const clamp = (v) => Math.max(-1, Math.min(1, v));

/**
 * Feeds phone tilt into the shared `pointer` ref used by the brain shaders.
 * Only listens while `enabled` (touch device + brain visible); throttled to ~20 Hz,
 * low-pass filtered, with a slowly re-centring baseline so a held tilt fades out.
 */
export function useDeviceTilt(pointer, enabled) {
  useEffect(() => {
    if (!enabled) return undefined;
    let base = null, sx = 0, sy = 0, lastT = 0, listening = false, alive = true;
    const p = pointer.current;
    const onOri = (e) => {
      if (e.beta == null || e.gamma == null) return;
      const now = performance.now();
      if (now - lastT < 50) return;
      lastT = now;
      if (!base) base = { b: e.beta, g: e.gamma };
      base.b += (e.beta - base.b) * 0.01;
      base.g += (e.gamma - base.g) * 0.01;
      let x = (e.gamma - base.g) / 28, y = -(e.beta - base.b) / 28;
      const ang = (window.screen?.orientation?.angle ?? window.orientation ?? 0) % 360;
      if (ang === 90 || ang === -270) [x, y] = [-y, x];
      else if (ang === 270 || ang === -90) [x, y] = [y, -x];
      const px = sx, py = sy;
      sx += (clamp(x) - sx) * 0.25;
      sy += (clamp(y) - sy) * 0.25;
      p.x = sx; p.y = sy; p.inside = true;
      if (Math.abs(sx - px) + Math.abs(sy - py) > 0.012) p.lastMove = now / 1000;
    };
    const stopAsk = whenAllowed(() => {
      if (!alive) return;
      listening = true;
      window.addEventListener("deviceorientation", onOri, { passive: true });
    });
    return () => {
      alive = false;
      stopAsk();
      if (listening) window.removeEventListener("deviceorientation", onOri);
      p.inside = false;
    };
  }, [pointer, enabled]);
}
