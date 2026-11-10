/* Procedural brain point cloud + neural fibers for the ICARO Neural Core. */

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randDir(rand) {
  const u = rand() * 2 - 1;
  const th = rand() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return [s * Math.cos(th), u, s * Math.sin(th)];
}

function cortexPoint(rand) {
  const [dx, dy, dz] = randDir(rand);
  const onShell = rand() < 0.78;
  const shell = onShell ? 0.93 + rand() * 0.07 : Math.cbrt(rand()) * 0.88;
  // gyri / sulci folds
  const folds = 1 + 0.075 * Math.sin(dx * 11 + Math.sin(dz * 6) * 2.2) * Math.sin(dy * 10 + dz * 4.5);
  const rr = shell * (onShell ? folds : 1);
  let x = dx * rr * 0.98;
  let y = dy * rr * 0.8;
  let z = dz * rr * 1.22;
  const side = x >= 0 ? 1 : -1;
  x = side * (Math.abs(x) * 0.9 + 0.065); // longitudinal fissure
  if (y < -0.32) y = -0.32 + (y + 0.32) * 0.45; // flatter base
  if (z > 0) x *= 1 - 0.16 * (z / 1.22); // narrower frontal lobe
  if (y < 0 && Math.abs(z) < 0.55) x *= 1.07; // temporal bulge
  return { p: [x, y + 0.08, z], shell: onShell };
}

function cerebellumPoint(rand) {
  const [dx, dy, dz] = randDir(rand);
  const rr = 0.82 + rand() * 0.18;
  const ridge = 1 + 0.05 * Math.sin(dy * 38);
  return [dx * 0.58 * rr * ridge, dy * 0.27 * rr - 0.46, dz * 0.38 * rr - 0.78];
}

function stemPoint(rand) {
  const t = rand();
  const a = rand() * Math.PI * 2;
  const r = 0.1 * Math.sqrt(rand()) * (1 - t * 0.3);
  return [Math.cos(a) * r, -0.42 - t * 0.62, -0.42 + Math.sin(a) * r - t * 0.12];
}

export function buildBrain({ count, nodeCount, neighbours = 3, crossRatio = 0.12, seed = 7 }) {
  const rand = mulberry32(seed);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const scales = new Float32Array(count);
  const shellIdx = [];

  for (let i = 0; i < count; i++) {
    const r = rand();
    let p;
    if (r < 0.84) {
      const c = cortexPoint(rand);
      p = c.p;
      if (c.shell) shellIdx.push(i);
    } else if (r < 0.96) p = cerebellumPoint(rand);
    else p = stemPoint(rand);
    positions.set(p, i * 3);
    seeds[i] = rand();
    scales[i] = 0.35 + Math.pow(rand(), 3) * 1.4;
  }

  // Nodes: evenly-ish sampled shell points
  const nodes = [];
  const step = Math.max(1, Math.floor(shellIdx.length / nodeCount));
  for (let k = 0; k < shellIdx.length && nodes.length < nodeCount; k += step) {
    const i = shellIdx[k];
    nodes.push([positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]]);
  }

  // Connections: nearest neighbours + long cross-hemisphere fibers
  const pairs = [];
  const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
  for (let i = 0; i < nodes.length; i++) {
    const cand = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const d = dist2(nodes[i], nodes[j]);
      if (d < 0.2) cand.push([d, j]);
    }
    cand.sort((a, b) => a[0] - b[0]);
    cand.slice(0, neighbours).forEach(([, j]) => { if (i < j) pairs.push([i, j, 1.12]); });
  }
  const left = nodes.map((n, i) => [n, i]).filter(([n]) => n[0] < -0.2);
  const right = nodes.map((n, i) => [n, i]).filter(([n]) => n[0] > 0.2);
  const crossCount = Math.min(left.length, right.length, Math.round(nodeCount * crossRatio));
  for (let c = 0; c < crossCount; c++) {
    const a = left[Math.floor(rand() * left.length)][1];
    const b = right[Math.floor(rand() * right.length)][1];
    pairs.push([a, b, 0.3]);
  }

  const SEG = 12;
  const lp = new Float32Array(pairs.length * SEG * 2 * 3);
  const lt = new Float32Array(pairs.length * SEG * 2);
  const ls = new Float32Array(pairs.length * SEG * 2);
  const lv = new Float32Array(pairs.length * SEG * 2);
  const fA = new Float32Array(pairs.length * 3);
  const fB = new Float32Array(pairs.length * 3);
  const fC = new Float32Array(pairs.length * 3);
  const fS = new Float32Array(pairs.length);
  const fV = new Float32Array(pairs.length);
  let v = 0;
  pairs.forEach(([a, b, bend], pi) => {
    const A = nodes[a], B = nodes[b];
    const C = [(A[0] + B[0]) * 0.5 * bend, (A[1] + B[1]) * 0.5 * bend, (A[2] + B[2]) * 0.5 * bend];
    const sd = rand(), sp = 0.08 + rand() * 0.22;
    fA.set(A, pi * 3); fB.set(B, pi * 3); fC.set(C, pi * 3); fS[pi] = sd; fV[pi] = sp;
    const q = (t) => {
      const u = 1 - t;
      return [u * u * A[0] + 2 * u * t * C[0] + t * t * B[0], u * u * A[1] + 2 * u * t * C[1] + t * t * B[1], u * u * A[2] + 2 * u * t * C[2] + t * t * B[2]];
    };
    for (let s = 0; s < SEG; s++) {
      [s / SEG, (s + 1) / SEG].forEach((t) => {
        lp.set(q(t), v * 3); lt[v] = t; ls[v] = sd; lv[v] = sp; v++;
      });
    }
  });

  const nodePos = new Float32Array(nodes.length * 3);
  const nodeSeed = new Float32Array(nodes.length);
  nodes.forEach((n, i) => { nodePos.set(n, i * 3); nodeSeed[i] = rand(); });

  return {
    points: { positions, seeds, scales },
    nodes: { positions: nodePos, seeds: nodeSeed },
    lines: { positions: lp, t: lt, seeds: ls, speeds: lv },
    fibers: { a: fA, b: fB, c: fC, seeds: fS, speeds: fV },
  };
}
