/**
 * Prépare maxime.glb pour le cas Maxime (modèle Sketchfab « April »).
 *
 * Génère automatiquement des textures procédurales — aucun upload manuel requis.
 * Nécessite scene-source.gltf et scene.bin dans public/models/april/.
 *
 * Usage : npm run prepare:april-model
 */
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { deflateSync } from 'node:zlib';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const dossier = join(racine, 'public/models/april');
const texturesDir = join(dossier, 'textures');

const TEXTURES = [
  'hair_baseColor.png',
  'hair_metallicRoughness.png',
  'hair_normal.png',
  'Material.004_baseColor.png',
  'Material.004_metallicRoughness.png',
  'Material.004_normal.png',
  'Material.002_baseColor.png',
];

// ── Encodeur PNG minimal (RGBA, 8 bits) ──────────────────────────────────────

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
  return remplir(w, h, (x, y) => {
    const u = x / w;
    const v = y / h;
    const n = bruit(x, y, 1) * 0.04;
    const r = Math.min(255, Math.round((220 + n * 30) * (0.92 + v * 0.08)));
    const g = Math.min(255, Math.round((175 + n * 20) * (0.9 + u * 0.05)));
    const b = Math.min(255, Math.round((145 + n * 15) * 0.95));
    return [r, g, b, 255];
  });
}

function texturePeauNormal(w, h) {
  return remplir(w, h, () => [128, 128, 255, 255]);
}

function texturePeauMR(w, h) {
  return remplir(w, h, () => [0, 210, 10, 255]);
}

function textureCheveuxBase(w, h) {
  return remplir(w, h, (x, y) => {
    const u = x / w;
    const v = y / h;
    const n = bruit(x, y, 2) * 0.06;
    const alpha = v < 0.12 ? 0 : v > 0.92 ? Math.round(255 * (1 - (v - 0.92) / 0.08)) : 255;
    const r = Math.round((38 + n * 20) * (0.85 + u * 0.15));
    const g = Math.round((24 + n * 12) * (0.9 + v * 0.1));
    const b = Math.round((16 + n * 8));
    return [r, g, b, alpha];
  });
}

function textureCheveuxMR(w, h) {
  return remplir(w, h, (x, y, tw, th) => {
    const v = y / th;
    const alpha = v < 0.12 ? 0 : 255;
    return [0, 200, 5, alpha];
  });
}

function textureCheveuxNormal(w, h) {
  return remplir(w, h, () => [128, 128, 255, 255]);
}

function textureOeil(w, h) {
  return remplir(w, h, (x, y, tw, th) => {
    const cx = tw * 0.5;
    const cy = th * 0.48;
    const dx = (x - cx) / (tw * 0.22);
    const dy = (y - cy) / (th * 0.18);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.35) {
      const iris = dist / 0.35;
      return [
        Math.round(90 + iris * 40),
        Math.round(55 + iris * 30),
        Math.round(30 + iris * 20),
        255,
      ];
    }
    if (dist < 0.55) return [240, 238, 235, 255];
    return [250, 248, 245, 255];
  });
}

function texturesCompletes() {
  return TEXTURES.every((f) => existsSync(join(texturesDir, f)));
}

/** Récupère les PNG déposés via l'upload GitHub (public/models/*.png.png). */
function importerDepuisUpload() {
  const uploadDir = join(racine, 'public/models');
  if (!existsSync(uploadDir)) return 0;

  mkdirSync(texturesDir, { recursive: true });
  let copies = 0;

  for (const nom of TEXTURES) {
    const cible = join(texturesDir, nom);
    const base = nom.replace(/\.png$/, '');
    const candidats = [
      join(uploadDir, `${base}.png.png`),
      join(uploadDir, `${nom}.png`),
      join(uploadDir, nom),
    ];

    const src = candidats.find((p) => existsSync(p));
    if (!src) continue;
    copyFileSync(src, cible);
    copies++;
    console.log(`Importé : ${src.replace(racine, '.')} → textures/${nom}`);
  }

  return copies;
}

function genererTextures() {
  mkdirSync(texturesDir, { recursive: true });
  const w = 256;
  const h = 256;
  const map = {
    'Material.004_baseColor.png': texturePeauBase(w, h),
    'Material.004_metallicRoughness.png': texturePeauMR(w, h),
    'Material.004_normal.png': texturePeauNormal(w, h),
    'Material.002_baseColor.png': textureOeil(w, h),
    hair_baseColor: textureCheveuxBase(w, h),
    hair_metallicRoughness: textureCheveuxMR(w, h),
    hair_normal: textureCheveuxNormal(w, h),
  };

  for (const [nom, rgba] of Object.entries(map)) {
    const fichier = nom.endsWith('.png') ? nom : `${nom}.png`;
    const chemin = join(texturesDir, fichier);
    if (existsSync(chemin)) continue;
    writeFileSync(chemin, encodePng(w, h, rgba));
  }
  console.log(`Textures procédurales complétées (${w}×${h}) pour les fichiers manquants.`);
}

// ── Pipeline GLB ─────────────────────────────────────────────────────────────

const source = join(dossier, 'scene-source.gltf');
if (!existsSync(source)) {
  console.error('scene-source.gltf manquant dans public/models/april/');
  process.exit(1);
}
if (!existsSync(join(dossier, 'scene.bin'))) {
  console.error('scene.bin manquant dans public/models/april/');
  process.exit(1);
}

importerDepuisUpload();

if (texturesCompletes()) {
  console.log('Textures Sketchfab trouvées — pas de génération procédurale.');
} else {
  const manquantes = TEXTURES.filter((f) => !existsSync(join(texturesDir, f)));
  console.warn(`Textures manquantes (${manquantes.length}/7) — complément procédural.`);
  genererTextures();
}

const gltf = JSON.parse(readFileSync(source, 'utf8'));
writeFileSync(join(dossier, 'scene.gltf'), `${JSON.stringify(gltf, null, 2)}\n`);

execSync(
  'npx --yes @gltf-transform/cli copy public/models/april/scene.gltf public/models/april/maxime.glb',
  { cwd: racine, stdio: 'inherit' },
);

const taille = readFileSync(join(dossier, 'maxime.glb')).length;
console.log(`maxime.glb régénéré (${Math.round(taille / 1024)} Ko, textures embarquées).`);
