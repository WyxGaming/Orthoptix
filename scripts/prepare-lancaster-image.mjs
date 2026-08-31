#!/usr/bin/env node
/**
 * Optimise la photo du test de Lancaster pour l'examen Jessica.
 *
 * Usage :
 *   node scripts/prepare-lancaster-image.mjs [fichier-source]
 *
 * Par défaut : public/examens/IMG_6153.jpeg
 */
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const racine = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaut = resolve(racine, 'public/examens/IMG_6153.jpeg');
const source = resolve(process.argv[2] ?? defaut);
const destination = resolve(racine, 'public/examens/rihanna-lancaster.jpg');

if (!existsSync(source)) {
  console.error(`Fichier source introuvable : ${source}`);
  console.error('Placez la photo sous public/examens/IMG_6153.jpeg');
  process.exit(1);
}

await sharp(source)
  .rotate()
  .resize({ width: 1600, withoutEnlargement: true })
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile(destination);

console.log(`Lancaster exporté : ${destination}`);
