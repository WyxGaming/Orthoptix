/**
 * Prépare rihanna.glb pour le cas Rihanna (modèle Sketchfab « Rihanna Head Model »).
 *
 * Lit public/models/rihanna_head_model/ (scene.gltf, scene.bin, textures/).
 * Génère des textures procédurales uniquement si des fichiers manquent.
 *
 * Usage : npm run prepare:rihanna-model
 */
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { deflateSync } from 'node:zlib';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const dossier = join(racine, 'public/models/rihanna_head_model');
const texturesDir = join(dossier, 'textures');

const TEXTURES_REQUISES = [
  't_head_baseColor.png',
  't_head_metallicRoughness.png',
  ['t_head_normal.jpeg', 't_head_normal.png'],
  't_cards_baseColor.png',
  't_cards_metallicRoughness.png',
  't_cards_normal.png',
  't_cards_specularf0.png',
];

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const rowLen = 1 + width * 4;
  const raw = Buffer.alloc(height * rowLen);
  for (let y = 0; y < height; y++) {
    const off = y * rowLen;
    raw[off] = 0;
    rgba.copy(raw, off + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 6 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function bruit(x, y, seed = 0) {
  const h = createHash('md5').update(`${seed}:${x}:${y}`).digest();
  return (h[0] / 255 - 0.5) * 2;
}

function remplir(w, h, peindre) {
  const rgba = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b, a = 255] = peindre(x, y, w, h);
      const i = (y * w + x) * 4;
      rgba[i] = r;
      rgba[i + 1] = g;
      rgba[i + 2] = b;
      rgba[i + 3] = a;
    }
  }
  return rgba;
}

function texturePeauBase(w, h) {
  return remplir(w, h, (x, y, tw, th) => {
    const u = x / tw;
    const v = y / th;
    const n = bruit(x, y, 11) * 0.035;
    const r = Math.min(255, Math.round((195 + n * 25) * (0.94 + v * 0.06)));
    const g = Math.min(255, Math.round((145 + n * 18) * (0.92 + u * 0.04)));
    const b = Math.min(255, Math.round((115 + n * 12) * 0.96));
    return [r, g, b, 255];
  });
}

function texturePeauNormal(w, h) {
  return remplir(w, h, () => [128, 128, 255, 255]);
}

function texturePeauMR(w, h) {
  return remplir(w, h, () => [0, 205, 12, 255]);
}

function textureCheveuxBase(w, h) {
  return remplir(w, h, (x, y, tw, th) => {
    const u = x / tw;
    const v = y / th;
    const n = bruit(x, y, 12) * 0.05;
    const alpha = v < 0.1 ? 0 : v > 0.9 ? Math.round(255 * (1 - (v - 0.9) / 0.1)) : 255;
    const r = Math.round((32 + n * 15) * (0.88 + u * 0.12));
    const g = Math.round((20 + n * 10) * (0.92 + v * 0.08));
    const b = Math.round(12 + n * 6);
    return [r, g, b, alpha];
  });
}

function textureCheveuxMR(w, h) {
  return remplir(w, h, (x, y, tw, th) => {
    const v = y / th;
    const alpha = v < 0.1 ? 0 : 255;
    return [0, 195, 8, alpha];
  });
}

function textureCheveuxNormal(w, h) {
  return remplir(w, h, () => [128, 128, 255, 255]);
}

function textureSpecular(w, h) {
  return remplir(w, h, () => [255, 255, 255, 255]);
}

function textureManquante(entree) {
  const noms = Array.isArray(entree) ? entree : [entree];
  return !noms.some((f) => existsSync(join(texturesDir, f)));
}

function genererTextures() {
  mkdirSync(texturesDir, { recursive: true });
  const w = 512;
  const h = 512;
  const map = {
    't_head_baseColor.png': texturePeauBase(w, h),
    't_head_metallicRoughness.png': texturePeauMR(w, h),
    't_head_normal.png': texturePeauNormal(w, h),
    't_cards_baseColor.png': textureCheveuxBase(w, h),
    't_cards_metallicRoughness.png': textureCheveuxMR(w, h),
    't_cards_normal.png': textureCheveuxNormal(w, h),
    't_cards_specularf0.png': textureSpecular(w, h),
  };
  for (const [nom, rgba] of Object.entries(map)) {
    if (!existsSync(join(texturesDir, nom))) {
      writeFileSync(join(texturesDir, nom), encodePng(w, h, rgba));
    }
  }
  console.log(`Textures procédurales générées (${w}×${h}) pour les fichiers manquants.`);
}

const gltfSource = join(dossier, 'scene.gltf');
if (!existsSync(gltfSource)) {
  console.error('scene.gltf manquant dans public/models/rihanna_head_model/');
  process.exit(1);
}
if (!existsSync(join(dossier, 'scene.bin'))) {
  console.error('scene.bin manquant dans public/models/rihanna_head_model/');
  process.exit(1);
}

const manquantes = TEXTURES_REQUISES.filter(textureManquante);
if (manquantes.length > 0) {
  console.warn(`Textures manquantes (${manquantes.length}/${TEXTURES_REQUISES.length}) — génération procédurale.`);
  genererTextures();
}

const gltf = JSON.parse(readFileSync(gltfSource, 'utf8'));
for (const mat of gltf.materials ?? []) {
  if (mat.name === 't_head') {
    mat.alphaMode = 'OPAQUE';
    delete mat.alphaCutoff;
  }
}
const gltfPatched = join(dossier, 'scene-patched.gltf');
writeFileSync(gltfPatched, `${JSON.stringify(gltf, null, 2)}\n`);

execSync(
  `npx --yes @gltf-transform/cli copy ${gltfPatched} public/models/rihanna_head_model/rihanna.glb`,
  { cwd: racine, stdio: 'inherit' },
);
unlinkSync(gltfPatched);

const taille = readFileSync(join(dossier, 'rihanna.glb')).length;
console.log(`rihanna.glb généré (${Math.round(taille / 1024)} Ko).`);
