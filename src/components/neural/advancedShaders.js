/* GPU shaders for the advanced (corporate) ICARO Neural Core. */

const SWEEP = /* glsl */ `
  // dynamic illumination travelling across brain regions + asynchronous firing
  float regionLight(vec3 p, float t, float seed) {
    vec3 d1 = normalize(vec3(sin(t * 0.35), cos(t * 0.27), sin(t * 0.21 + 1.3)));
    vec3 d2 = normalize(vec3(cos(t * 0.19 + 2.0), sin(t * 0.31), cos(t * 0.23)));
    float a = pow(0.5 + 0.5 * sin(dot(p, d1) * 4.0 - t * 1.8), 8.0);
    float b = pow(0.5 + 0.5 * sin(dot(p, d2) * 3.0 + t * 1.1), 10.0) * 0.8;
    float n = fract(sin(floor(t * 2.5 + seed * 50.0) * 12.9898 + seed * 78.233) * 43758.5453);
    return max(a, b) + step(0.982, n) * 1.3;
  }
`;

export const advPointVertex = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  uniform float uEnergy;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uMouse;
  attribute float aSeed;
  attribute float aScale;
  varying float vAlpha;
  varying float vHot;
  varying float vMix;
  ${SWEEP}

  void main() {
    vec3 p = position;
    float r = length(p);
    float front = uReveal * 2.6;
    float rev = clamp((front - r) / 0.35, 0.0, 1.0);
    p *= mix(1.0 + aSeed * 0.9, 1.0, smoothstep(0.0, 1.0, rev));
    // organic micro-motion
    p += normalize(p + 0.0001) * sin(uTime * 1.6 + aSeed * 6.2831) * 0.014;
    p.x += sin(uTime * 0.9 + p.y * 6.0 + aSeed * 3.0) * 0.006;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float light = regionLight(position, uTime, aSeed);
    float md = distance(p, uMouse);
    float hot = smoothstep(0.6, 0.0, md) * uEnergy;
    float tw = 0.5 + 0.5 * sin(uTime * (0.8 + aSeed * 2.6) + aSeed * 40.0);
    float depth = smoothstep(-5.6, -2.4, mv.z) * 0.75 + 0.25;

    gl_PointSize = uSize * aScale * (0.8 + hot * 1.6 + light * 0.6) * uPixelRatio * (1.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vAlpha = rev * depth * (0.07 + 0.24 * tw + light * 0.32);
    vHot = clamp(hot * 0.8 + light * 0.3, 0.0, 1.0);
    vMix = aSeed;
  }
`;

export const advPointFragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uIntensity;
  uniform float uTime;
  varying float vAlpha;
  varying float vHot;
  varying float vMix;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d);
    a = a * a;
    vec3 col = mix(uColorA, uColorB, vMix);
    col = mix(col, vec3(0.92, 0.99, 1.0), clamp(vHot * 0.65, 0.0, 1.0));
    // holographic scanlines + faint chromatic shift
    float scan = 0.5 + 0.5 * sin(gl_FragCoord.y * 1.15 - uTime * 6.0);
    col += vec3(-0.05, 0.03, 0.08) * scan;
    gl_FragColor = vec4(col, a * vAlpha * uIntensity * (0.85 + vHot) * (1.0 - 0.22 * scan));
  }
`;

export const advLineVertex = /* glsl */ `
  uniform float uFlow;
  uniform float uTime;
  uniform float uReveal;
  uniform float uEnergy;
  uniform vec3 uMouse;
  attribute float aT;
  attribute float aSeed;
  attribute float aSpeed;
  varying float vGlow;
  varying float vBase;
  varying float vRev;
  ${SWEEP}

  float pulse(float t, float head) {
    float d = t - head;
    return d < 0.0 ? exp(d * 10.0) : exp(-d * d * 900.0);
  }

  void main() {
    float g = pulse(aT, fract(uFlow * aSpeed + aSeed));
    g = max(g, pulse(aT, fract(uFlow * aSpeed * 1.7 + aSeed + 0.5)) * 0.8);
    float light = regionLight(position, uTime, aSeed);
    float md = distance(position, uMouse);
    float hot = smoothstep(0.75, 0.0, md) * uEnergy;
    vGlow = g * (0.42 + hot * 1.0 + uEnergy * 0.3 + light * 0.3);
    vBase = 0.045 + hot * 0.1 + light * 0.08;
    vRev = clamp((uReveal - 0.4) / 0.5, 0.0, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const sparkVertex = /* glsl */ `
  uniform float uFlow;
  uniform float uReveal;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute vec3 aA;
  attribute vec3 aB;
  attribute vec3 aC;
  attribute float aSeed;
  attribute float aSpeed;
  varying float vA;

  void main() {
    float t = fract(uFlow * aSpeed * 1.3 + aSeed * 1.7);
    float u = 1.0 - t;
    vec3 p = u * u * aA + 2.0 * u * t * aC + t * t * aB;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float life = sin(t * 3.14159);
    gl_PointSize = uSize * uPixelRatio * (0.5 + 0.5 * life) / -mv.z;
    gl_Position = projectionMatrix * mv;
    vA = life * clamp((uReveal - 0.4) / 0.5, 0.0, 1.0);
  }
`;

export const sparkFragment = /* glsl */ `
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    vec3 col = mix(vec3(0.0, 0.81, 1.0), vec3(0.95, 1.0, 1.0), core * core);
    gl_FragColor = vec4(col, pow(core, 1.8) * vA * 0.6);
  }
`;

export const haloVertex = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vA;

  void main() {
    float dir = aSeed > 0.5 ? 1.0 : -1.0;
    float ang = uTime * (0.12 + aSeed * 0.22) * dir;
    float c = cos(ang), s = sin(ang);
    vec3 p = vec3(position.x * c - position.z * s, position.y, position.x * s + position.z * c);
    p.y += sin(uTime * 0.8 + aSeed * 20.0) * 0.05;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (0.4 + aSeed) * uPixelRatio / -mv.z;
    gl_Position = projectionMatrix * mv;
    vA = uReveal * (0.14 + 0.2 * (0.5 + 0.5 * sin(uTime * 2.0 + aSeed * 30.0)));
  }
`;

export const haloFragment = /* glsl */ `
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(0.22, 0.89, 1.0, a * a * vA);
  }
`;

export const glowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const glowFragment = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  uniform float uEnergy;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float g = pow(clamp(1.0 - d, 0.0, 1.0), 2.6);
    float breathe = 0.8 + 0.2 * sin(uTime * 1.3);
    vec3 col = mix(vec3(0.07, 0.23, 0.41), vec3(0.0, 0.81, 1.0), g);
    gl_FragColor = vec4(col, g * 0.1 * breathe * uReveal * (1.0 + uEnergy * 0.4));
  }
`;
