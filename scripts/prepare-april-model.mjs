/**
 * Produit scene.gltf sans textures externes (April / Sketchfab).
 * Puis : npx @gltf-transform/cli copy public/models/april/scene.gltf public/models/april/maxime.glb
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const dossier = join(racine, 'public/models/april');

const gltf = JSON.parse(readFileSync(join(dossier, 'scene-source.gltf'), 'utf8'));

gltf.images = [];
gltf.textures = [];
gltf.samplers = [];

const teintes = {
  hair: [0.22, 0.14, 0.1, 0.75],
  'Material.004': [0.93, 0.78, 0.67, 1],
  'Material.002': [0.88, 0.72, 0.62, 1],
};

for (const mat of gltf.materials ?? []) {
  delete mat.normalTexture;
  mat.pbrMetallicRoughness ??= {};
  delete mat.pbrMetallicRoughness.baseColorTexture;
  delete mat.pbrMetallicRoughness.metallicRoughnessTexture;
  mat.pbrMetallicRoughness.baseColorFactor = teintes[mat.name] ?? [0.9, 0.75, 0.65, 1];
  mat.pbrMetallicRoughness.metallicFactor = 0.02;
  mat.pbrMetallicRoughness.roughnessFactor = 0.85;
}

writeFileSync(join(dossier, 'scene.gltf'), `${JSON.stringify(gltf, null, 2)}\n`);
console.log('scene.gltf patché (sans textures externes)');
