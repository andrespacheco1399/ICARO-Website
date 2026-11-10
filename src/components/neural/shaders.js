/* GPU shaders for the ICARO Neural Core. */

export const pointVertex = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  uniform float uEnergy;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uMouse;
  uniform float uAuto;
  uniform vec4 uSpots[4];
  attribute float aSeed;
  attribute float aScale;
  varying float vAlpha;
  varying float vHot;
  varying float vMix;

  void main() {
    vec3 p = position;
    float r = length(p);
    float front = uReveal * 2.6;
    float rev = clamp((front - r) / 0.35, 0.0, 1.0);
    // activation: particles converge from a wider cloud
    p *= mix(1.0 + aSeed * 0.9, 1.0, smoothstep(0.0, 1.0, rev));
    // neural breathing
    p += normalize(p + 0.0001) * sin(uTime * 1.3 + aSeed * 6.2831) * 0.01;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float md = distance(p, uMouse);
    float hot = smoothstep(0.6, 0.0, md) * uEnergy;
    float wave = exp(-pow((front - r) * 5.0, 2.0)) * step(uReveal, 0.999);
    float tw = 0.5 + 0.5 * sin(uTime * (0.6 + aSeed * 2.2) + aSeed * 40.0);
    // autonomous activity: drifting firing clusters + rare, irregular single-neuron sparks
    if (uAuto > 0.5) {
      float cl = 0.0;
      for (int i = 0; i < 4; i++) {
        cl += smoothstep(0.42, 0.0, distance(p, uSpots[i].xyz)) * uSpots[i].w;
      }
      float f1 = sin(uTime * (0.21 + fract(aSeed * 7.13) * 0.37) + aSeed * 91.0);
      float f2 = sin(uTime * (0.13 + fract(aSeed * 3.71) * 0.29) + aSeed * 57.0);
      float spark = smoothstep(0.82, 1.0, f1 * f2 + 0.12);
      hot += min(cl, 1.0) * 0.95 + spark * 0.8;
    }

    gl_PointSize = uSize * aScale * (1.0 + hot * 1.8 + wave * 1.5) * uPixelRatio * (1.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vAlpha = rev * (0.28 + 0.72 * tw);
    vHot = clamp(hot + wave, 0.0, 1.5);
    vMix = aSeed;
  }
`;

export const pointFragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uIntensity;
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
    gl_FragColor = vec4(col, a * vAlpha * uIntensity * (0.85 + vHot));
  }
`;

export const lineVertex = /* glsl */ `
  uniform float uFlow;
  uniform float uReveal;
  uniform float uEnergy;
  uniform vec3 uMouse;
  attribute float aT;
  attribute float aSeed;
  attribute float aSpeed;
  varying float vGlow;
  varying float vBase;
  varying float vRev;

  void main() {
    float head = fract(uFlow * aSpeed + aSeed);
    float d = aT - head;
    float tail = d < 0.0 ? exp(d * 9.0) : exp(-d * d * 900.0);
    float md = distance(position, uMouse);
    float hot = smoothstep(0.75, 0.0, md) * uEnergy;
    vGlow = tail * (0.55 + hot * 1.6 + uEnergy * 0.45);
    vBase = 0.05 + hot * 0.16;
    vRev = clamp((uReveal - 0.4) / 0.5, 0.0, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const lineFragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vGlow;
  varying float vBase;
  varying float vRev;

  void main() {
    vec3 col = mix(uColorA, uColorB, clamp(vGlow, 0.0, 1.0));
    gl_FragColor = vec4(col, (vBase + vGlow) * vRev);
  }
`;
