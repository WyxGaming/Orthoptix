/**
 * Prépare maxime.glb pour le cas Maxime (modèle Sketchfab « April »).
 *
 * 1. Place scene-source.gltf et scene.bin dans public/models/april/
 * 2. Place les 7 PNG dans public/models/april/textures/ (voir textures/README.md)
 * 3. npm run prepare:april-model
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const dossier = join(racine, 'public/models/april');
const texturesDir = join(dossier, 'textures');

const TEXTURES_REQUISES = [
  'hair_baseColor.png',
  'hair_metallicRoughness.png',
  'hair_normal.png',
  'Material.004_baseColor.png',
  'Material.004_metallicRoughness.png',
  'Material.004_normal.png',
  'Material.002_baseColor.png',
];

function texturesCompletes() {
  return TEXTURES_REQUISES.every((f) => existsSync(join(texturesDir, f)));
}

function patcherSansTextures(gltf) {
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

  return gltf;
}

const source = join(dossier, 'scene-source.gltf');
if (!existsSync(source)) {
  console.error('scene-source.gltf manquant dans public/models/april/');
  process.exit(1);
}

const gltf = JSON.parse(readFileSync(source, 'utf8'));

if (texturesCompletes()) {
  writeFileSync(join(dossier, 'scene.gltf'), `${JSON.stringify(gltf, null, 2)}\n`);
  console.log('Textures trouvées — scene.gltf conservé avec les UV Sketchfab.');
} else {
  const manquantes = TEXTURES_REQUISES.filter((f) => !existsSync(join(texturesDir, f)));
  console.warn(`Textures manquantes (${manquantes.length}/7) — fallback teintes unies.`);
  writeFileSync(join(dossier, 'scene.gltf'), `${JSON.stringify(patcherSansTextures(gltf), null, 2)}\n`);
}

if (!existsSync(join(dossier, 'scene.bin'))) {
  console.error('scene.bin manquant dans public/models/april/');
  process.exit(1);
}

execSync(
  'npx --yes @gltf-transform/cli copy public/models/april/scene.gltf public/models/april/maxime.glb',
  { cwd: racine, stdio: 'inherit' },
);
console.log('maxime.glb régénéré.');
