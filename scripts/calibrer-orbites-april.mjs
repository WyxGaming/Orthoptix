/**
 * Calibre les orbites April via les transforms glTF (sans Three.js).
 * Usage : node scripts/calibrer-orbites-april.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const gltf = JSON.parse(readFileSync(join(racine, 'public/models/april/scene-source.gltf'), 'utf8'));
const bin = readFileSync(join(racine, 'public/models/april/scene.bin'));

const CONFIG = { hauteurVisageCm: 22, decalageFin: [0, 0.6, 1.2] };

function lireMat4(bufferViewIdx, byteOffset = 0) {
  const bv = gltf.bufferViews[bufferViewIdx];
  const off = (bv.byteOffset ?? 0) + byteOffset;
  const f = new Float32Array(bin.buffer, bin.byteOffset + off, 16);
  return [...f];
}

function mulMat4(a, b) {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      o[c * 4 + r] =
        a[0 * 4 + r] * b[c * 4 + 0] +
        a[1 * 4 + r] * b[c * 4 + 1] +
        a[2 * 4 + r] * b[c * 4 + 2] +
        a[3 * 4 + r] * b[c * 4 + 3];
    }
  }
  return o;
}

function transformPoint(m, x, y, z) {
  const w = m[3] * x + m[7] * y + m[11] * z + m[15] || 1;
  return [
    (m[0] * x + m[4] * y + m[8] * z + m[12]) / w,
    (m[1] * x + m[5] * y + m[9] * z + m[13]) / w,
    (m[2] * x + m[6] * y + m[10] * z + m[14]) / w,
  ];
}

function matriceNoeud(node) {
  if (node.matrix) return node.matrix;
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

function mondeNoeud(idx, parent = null) {
  const node = gltf.nodes[idx];
  const local = matriceNoeud(node);
  const world = parent ? mulMat4(parent, local) : local;
  return { node, world };
}

function bboxMesh(meshIdx, world) {
  const mesh = gltf.meshes[meshIdx];
  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];
  for (const prim of mesh.primitives) {
    const acc = gltf.accessors[prim.attributes.POSITION];
    const bv = gltf.bufferViews[acc.bufferView];
    const off = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    const f = new Float32Array(bin.buffer, bin.byteOffset + off, acc.count * 3);
    for (let i = 0; i < acc.count; i++) {
      const p = transformPoint(world, f[i * 3], f[i * 3 + 1], f[i * 3 + 2]);
      for (let k = 0; k < 3; k++) {
        min[k] = Math.min(min[k], p[k]);
        max[k] = Math.max(max[k], p[k]);
      }
    }
  }
  const centre = min.map((v, i) => (v + max[i]) / 2);
  const taille = min.map((v, i) => max[i] - v);
  return { min, max, centre, taille };
}

function parcourir(idx, parentWorld, acc) {
  const { node, world } = mondeNoeud(idx, parentWorld);
  if (node.mesh !== undefined) {
    acc.push({ name: node.name, mesh: node.mesh, world, bbox: bboxMesh(node.mesh, world) });
  }
  for (const enfant of node.children ?? []) parcourir(enfant, world, acc);
}

const meshes = [];
const masquer = /^(Lamp|Sphere)/i;
for (const root of gltf.scenes[gltf.scene ?? 0].nodes) parcourir(root, null, meshes);

// Exclure lampes de la boite (comme TetePatient)
const meshesVisibles = meshes.filter((m) => !masquer.test(m.name));

let min = [Infinity, Infinity, Infinity];
let max = [-Infinity, -Infinity, -Infinity];
for (const m of meshesVisibles) {
  for (let k = 0; k < 3; k++) {
    min[k] = Math.min(min[k], m.bbox.min[k]);
    max[k] = Math.max(max[k], m.bbox.max[k]);
  }
}
const centreScene = min.map((v, i) => (v + max[i]) / 2);
const tailleScene = min.map((v, i) => max[i] - v);
const facteur = CONFIG.hauteurVisageCm / tailleScene[1];

function caler([x, y, z]) {
  return [
    (x - centreScene[0]) * facteur + CONFIG.decalageFin[0],
    (y - centreScene[1]) * facteur + CONFIG.decalageFin[1],
    (z - centreScene[2]) * facteur + CONFIG.decalageFin[2],
  ];
}

const sphere = meshes.find((m) => m.name === 'Sphere_0');
const visage = meshesVisibles.find((m) => m.name === 'Cube.002_0');

console.log('facteur échelle:', +facteur.toFixed(4));
console.log('taille scène brute (y):', +tailleScene[1].toFixed(4));

if (visage) {
  const c = caler(visage.bbox.centre);
  const h = visage.bbox.taille[1] * facteur;
  const zMax = caler(visage.bbox.max)[2];
  const yOeil = caler([visage.bbox.centre[0], visage.bbox.min[1] + visage.bbox.taille[1] * 0.58, visage.bbox.centre[2]])[1];
  const bande = h * 0.08;
  const seuilZ = zMax - visage.bbox.taille[2] * facteur * 0.25;

  const xs = [];
  const zs = [];
  const mesh = gltf.meshes[visage.mesh];
  const acc = gltf.accessors[mesh.primitives[0].attributes.POSITION];
  const bv = gltf.bufferViews[acc.bufferView];
  const off = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
  const f = new Float32Array(bin.buffer, bin.byteOffset + off, acc.count * 3);
  for (let i = 0; i < acc.count; i++) {
    const p = transformPoint(visage.world, f[i * 3], f[i * 3 + 1], f[i * 3 + 2]);
    const pc = caler(p);
    if (Math.abs(pc[1] - yOeil) <= bande && pc[2] >= seuilZ) {
      xs.push(pc[0]);
      zs.push(pc[2]);
    }
  }
  xs.sort((a, b) => a - b);
  const x05 = xs[Math.floor(xs.length * 0.08)] ?? xs[0];
  const x95 = xs[Math.floor(xs.length * 0.92)] ?? xs[xs.length - 1];
  const demi = (x95 - x05) / 4;
  const mid = (x05 + x95) / 2;
  const zMoy = zs.reduce((s, z) => s + z, 0) / zs.length;

  console.log('\nVisage calé — centre:', c.map((v) => +v.toFixed(3)));
  console.log('Visage calé — taille:', visage.bbox.taille.map((v) => +(v * facteur).toFixed(3)));
  console.log('yOeil:', +yOeil.toFixed(3), 'z seuil:', +seuilZ.toFixed(3), 'points:', xs.length);
  console.log('\n=== Orbites recommandées (mesh visage) ===');
  console.log('OD:', [+(mid - demi).toFixed(3), +yOeil.toFixed(3), +(zMoy - 0.08).toFixed(3)]);
  console.log('OG:', [+(mid + demi).toFixed(3), +yOeil.toFixed(3), +(zMoy - 0.08).toFixed(3)]);
  console.log('rayon:', +(Math.min(h * 0.055, 1.2)).toFixed(3));
  console.log('demi-écart:', +demi.toFixed(3));
}
