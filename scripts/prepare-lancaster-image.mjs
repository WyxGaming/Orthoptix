#!/usr/bin/env node
/**
 * Tourne la photo du test de Lancaster de 90° (horaire) et produit
 * public/examens/rihanna-lancaster.png pour la synthèse Rihanna.
 *
 * Usage :
 *   node scripts/prepare-lancaster-image.mjs [fichier-source]
 *
 * Par défaut : public/examens/rihanna-lancaster-source.jpg
 */
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const racine = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaut = resolve(racine, 'public/examens/rihanna-lancaster-source.jpg');
const source = resolve(process.argv[2] ?? defaut);
const destination = resolve(racine, 'public/examens/rihanna-lancaster.png');

if (!existsSync(source)) {
  console.error(`Fichier source introuvable : ${source}`);
  console.error('Placez la photo sous public/examens/rihanna-lancaster-source.jpg');
  process.exit(1);
}

await sharp(source)
  .rotate(90)
  .png({ compressionLevel: 9 })
  .toFile(destination);

console.log(`Lancaster exporté : ${destination}`);
