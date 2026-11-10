import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { sparkVertex, sparkFragment, haloVertex, haloFragment, glowVertex, glowFragment } from "./advancedShaders";

const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };

function buildHalo(count) {
  const pos = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 1.0 + Math.pow(Math.random(), 1.5) * 0.42;
    pos.set([Math.cos(a) * r, (Math.random() - 0.5) * 0.7, Math.sin(a) * r * 1.1], i * 3);
    seeds[i] = Math.random();
  }
  return { pos, seeds };
}

/** Energy sparks travelling along fibers + particles orbiting the structure. */
export const AdvancedLayers = ({ data, shared }) => {
  const { gl, size } = useThree();
  const pr = gl.getPixelRatio();

  const sparkGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const f = data.fibers;
    g.setAttribute("position", new THREE.BufferAttribute(f.a.slice(), 3));
    g.setAttribute("aA", new THREE.BufferAttribute(f.a, 3));
    g.setAttribute("aB", new THREE.BufferAttribute(f.b, 3));
    g.setAttribute("aC", new THREE.BufferAttribute(f.c, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(f.seeds, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(f.speeds, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 3);
    return g;
  }, [data]);

  const haloGeo = useMemo(() => {
    const { pos, seeds } = buildHalo(data.points.seeds.length > 6000 ? 1400 : 700);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return g;
  }, [data]);

  const sparkMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: sparkVertex, fragmentShader: sparkFragment, ...additive,
    uniforms: { uFlow: shared.uFlow, uReveal: shared.uReveal, uSize: { value: 60 }, uPixelRatio: { value: pr } },
  }), [shared, pr]);

  const haloMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: haloVertex, fragmentShader: haloFragment, ...additive,
    uniforms: { uTime: shared.uTime, uReveal: shared.uReveal, uSize: { value: 22 }, uPixelRatio: { value: pr } },
  }), [shared, pr]);

  useFrame(() => {
    const k = (size.height / 700) * 2.6;
    sparkMat.uniforms.uSize.value = 60 * k;
    haloMat.uniforms.uSize.value = 22 * k;
  });

  return (
    <>
      <points geometry={sparkGeo} material={sparkMat} frustumCulled={false} />
      <points geometry={haloGeo} material={haloMat} frustumCulled={false} />
    </>
  );
};

/** Soft volumetric glow behind the brain (camera-facing, outside the rotating group). */
export const VolumetricGlow = ({ shared }) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: glowVertex, fragmentShader: glowFragment, ...additive,
    uniforms: { uTime: shared.uTime, uReveal: shared.uReveal, uEnergy: shared.uEnergy },
  }), [shared]);
  return (
    <mesh position={[0, 0, -0.8]} material={mat}>
      <planeGeometry args={[4.6, 4.6]} />
    </mesh>
  );
};
