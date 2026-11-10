import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildBrain } from "./brainGeometry";
import { pointVertex, pointFragment, lineVertex, lineFragment } from "./shaders";
import { advPointVertex, advPointFragment, advLineVertex } from "./advancedShaders";
import { AdvancedLayers, VolumetricGlow } from "./AdvancedLayers";

const CYAN = new THREE.Color("#00CFFF");
const CYAN_2 = new THREE.Color("#39E4FF");
const DEEP = new THREE.Color("#123B68");

function Brain({ tier, pointer, reduced, compact, autonomous }) {
  const group = useRef();
  const tilt = useRef();
  const { camera, gl, size } = useThree();
  const data = useMemo(() => buildBrain(tier), [tier]);
  const tmp = useMemo(() => ({
    ray: new THREE.Raycaster(), plane: new THREE.Plane(), hit: new THREE.Vector3(),
    ndc: new THREE.Vector2(), normal: new THREE.Vector3(), local: new THREE.Vector3(99, 99, 99),
  }), []);

  const shared = useMemo(() => ({
    uTime: { value: 0 }, uFlow: { value: 0 }, uReveal: { value: reduced ? 1 : 0 },
    uEnergy: { value: 0 }, uMouse: { value: new THREE.Vector3(99, 99, 99) },
    uAuto: { value: autonomous ? 1 : 0 },
    uSpots: { value: [0, 1, 2, 3].map(() => new THREE.Vector4(99, 99, 99, 0)) },
  }), [reduced, autonomous]);
  // autonomous firing clusters: each spawns at a random node, swells, fades, rests
  const spots = useMemo(() => [0, 1, 2, 3].map((i) => ({ life: 0, dur: 1, wait: 0.3 + i * 0.7 })), []);

  // the compact (corporate) core uses the advanced shader set
  const pv = compact ? advPointVertex : pointVertex;
  const pf = compact ? advPointFragment : pointFragment;

  const pointMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: pv, fragmentShader: pf,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { ...shared, uSize: { value: 30 }, uPixelRatio: { value: gl.getPixelRatio() },
      uColorA: { value: CYAN }, uColorB: { value: CYAN_2 }, uIntensity: { value: compact ? 0.45 : 0.9 } },
  }), [shared, gl, pv, pf]);

  const nodeMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: pv, fragmentShader: pf,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { ...shared, uSize: { value: 85 }, uPixelRatio: { value: gl.getPixelRatio() },
      uColorA: { value: CYAN_2 }, uColorB: { value: new THREE.Color("#F6FAFF") }, uIntensity: { value: compact ? 0.55 : 1.1 } },
  }), [shared, gl, pv, pf]);

  const lineMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: compact ? advLineVertex : lineVertex, fragmentShader: lineFragment,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { ...shared, uColorA: { value: DEEP.clone().lerp(CYAN, 0.6) }, uColorB: { value: CYAN_2 } },
  }), [shared, compact]);

  const pointGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.points.positions, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(data.points.seeds, 1));
    g.setAttribute("aScale", new THREE.BufferAttribute(data.points.scales, 1));
    return g;
  }, [data]);

  const nodeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.nodes.positions, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(data.nodes.seeds, 1));
    g.setAttribute("aScale", new THREE.BufferAttribute(new Float32Array(data.nodes.seeds.length).fill(1), 1));
    return g;
  }, [data]);

  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.lines.positions, 3));
    g.setAttribute("aT", new THREE.BufferAttribute(data.lines.t, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(data.lines.seeds, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(data.lines.speeds, 1));
    return g;
  }, [data]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const u = shared;
    const pt = pointer.current;
    u.uTime.value += dt;
    // keep sprite size proportional to the canvas for the compact core
    const k = compact ? (size.height / 700) * 2.6 : 1;
    pointMat.uniforms.uSize.value = 30 * k;
    nodeMat.uniforms.uSize.value = 85 * k;
    if (u.uReveal.value < 1) u.uReveal.value = Math.min(1, u.uReveal.value + dt / 2.8);

    // energy rises with interaction, decays slowly
    const since = performance.now() / 1000 - (pt.lastMove || -99);
    const target = pt.burst > 0 ? 1.6 : since < 0.25 ? 1 : 0;
    pt.burst = Math.max(0, (pt.burst || 0) - dt);
    u.uEnergy.value += (target - u.uEnergy.value) * (target > u.uEnergy.value ? 0.12 : 0.025);
    u.uFlow.value += dt * (1 + u.uEnergy.value * 1.4);

    if (autonomous && !reduced) {
      const np = data.nodes.positions;
      spots.forEach((s, i) => {
        const v = u.uSpots.value[i];
        if (s.wait > 0) { s.wait -= dt; v.w = 0; return; }
        if (s.life === 0) {
          const k = Math.floor(Math.random() * (np.length / 3)) * 3;
          v.set(np[k], np[k + 1], np[k + 2], 0);
          s.dur = 1.3 + Math.random() * 1.6;
        }
        s.life += dt / s.dur;
        v.w = Math.pow(Math.sin(Math.min(s.life, 1) * Math.PI), 1.6) * (0.55 + (i % 2) * 0.3);
        if (s.life >= 1) { s.life = 0; s.wait = 0.4 + Math.random() * 2.4; }
      });
    }

    if (!reduced && group.current) {
      group.current.rotation.y += dt * (compact ? 0.18 : 0.09);
      tilt.current.rotation.x += ((pt.inside ? -pt.y * 0.22 : 0) - tilt.current.rotation.x) * 0.04;
      tilt.current.rotation.z += ((pt.inside ? pt.x * 0.08 : 0) - tilt.current.rotation.z) * 0.04;
      tilt.current.position.x += ((pt.inside ? pt.x * 0.12 : 0) - tilt.current.position.x) * 0.04;
    }

    // project pointer into brain-local space
    if (pt.inside) {
      tmp.ndc.set(pt.x, pt.y);
      tmp.ray.setFromCamera(tmp.ndc, camera);
      camera.getWorldDirection(tmp.normal);
      tmp.plane.setFromNormalAndCoplanarPoint(tmp.normal, new THREE.Vector3(0, 0, 0.4));
      if (tmp.ray.ray.intersectPlane(tmp.plane, tmp.hit)) {
        group.current.worldToLocal(tmp.local.copy(tmp.hit));
        u.uMouse.value.lerp(tmp.local, 0.2);
      }
    }
  });

  return (
    <group ref={tilt}>
      {compact && <VolumetricGlow shared={shared} />}
      <group ref={group} rotation={[0.12, -0.6, 0]} scale={compact ? 1.1 : 1.55}>
        <lineSegments geometry={lineGeo} material={lineMat} />
        <points geometry={pointGeo} material={pointMat} />
        <points geometry={nodeGeo} material={nodeMat} />
        {compact && <AdvancedLayers data={data} shared={shared} />}
      </group>
    </group>
  );
}

export default function NeuralCoreScene({ tier, pointer, reduced, compact, active, autonomous = false }) {
  return (
    <Canvas
      dpr={tier.dpr}
      frameloop={reduced ? "demand" : active ? "always" : "never"}
      camera={{ position: [0, 0, compact ? 3.9 : tier.mobile ? 6.2 : 5.2], fov: 42 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      <Brain tier={tier} pointer={pointer} reduced={reduced} compact={compact} autonomous={autonomous} />
    </Canvas>
  );
}
