#!/usr/bin/env node
/**
 * Sync Orthoptix/glossaire/ → WyxGaming/glossaire-orthoptie (standalone Vercel deploy).
 * Requires GLOSSAIRE_SYNC_TOKEN with contents:write on glossaire-orthoptie.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'glossaire');
const token = process.env.GLOSSAIRE_SYNC_TOKEN;

if (!token) {
  console.error('Missing GLOSSAIRE_SYNC_TOKEN');
  process.exit(1);
}

const workDir = join(root, '.sync-glossaire-orthoptie');
const target = join(workDir, 'repo');

rmSync(workDir, { recursive: true, force: true });
mkdirSync(target, { recursive: true });

execSync(
  `git clone --depth 1 https://x-access-token:${token}@github.com/WyxGaming/glossaire-orthoptie.git "${target}"`,
  { stdio: 'inherit' },
);

const entries = [
  '.env.example',
  '.gitignore',
  'README.md',
  'eslint.config.js',
  'index.html',
  'package.json',
  'package-lock.json',
  'postcss.config.js',
  'scripts',
  'src',
  'supabase',
  'tailwind.config.js',
  'tsconfig.app.json',
  'tsconfig.json',
  'tsconfig.node.json',
  'vercel.json',
  'vite.config.ts',
];

for (const name of entries) {
  const from = join(source, name);
  const to = join(target, name);
  if (!existsSync(from)) continue;
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
}

const viteConfigPath = join(target, 'vite.config.ts');
const viteConfig = readFileSync(viteConfigPath, 'utf8');
writeFileSync(
  viteConfigPath,
  viteConfig.replace(/\s*base:\s*['"][^'"]+['"],?\n/, '\n'),
);

execSync('git add -A', { cwd: target, stdio: 'inherit' });
const status = execSync('git status --porcelain', { cwd: target, encoding: 'utf8' });
if (!status.trim()) {
  console.log('glossaire-orthoptie is already up to date.');
  process.exit(0);
}

execSync('git -c user.name="cursor[bot]" -c user.email="cursor[bot]@users.noreply.github.com" commit -m "Synchroniser depuis Orthoptix/glossaire"', {
  cwd: target,
  stdio: 'inherit',
});
execSync('git push origin main', { cwd: target, stdio: 'inherit' });
console.log('glossaire-orthoptie updated successfully.');
