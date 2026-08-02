import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const pages = fs.readdirSync(root).filter(file => file.endsWith('.html'));
const errors = [];
const warnings = [];

function localTarget(page, value) {
  if (!value || value.startsWith('#') || value.includes('${') || /^(?:https?:|mailto:|tel:|javascript:|data:)/i.test(value)) return null;
  return path.resolve(root, path.dirname(page), value.split(/[?#]/)[0]);
}

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map(match => match[1]);
  for (const id of new Set(ids)) {
    if (ids.filter(value => value === id).length > 1) errors.push(`${page}: identifiant dupliqué #${id}`);
  }
  for (const match of html.matchAll(/\s(?:src|href)=["']([^"']+)["']/g)) {
    const target = localTarget(page, match[1]);
    if (target && !fs.existsSync(target)) errors.push(`${page}: ressource introuvable ${match[1]}`);
  }
  if (html.includes('Chessboard(') || /id=["'][^"']+-board["']/.test(html)) {
    if (!html.includes('assets/js/board.js')) warnings.push(`${page}: échiquier sans utilitaires board.js`);
  }
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
for (const icon of manifest.icons || []) {
  if (!fs.existsSync(path.join(root, icon.src))) errors.push(`manifest: icône introuvable ${icon.src}`);
}

const worker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
for (const match of worker.matchAll(/^\s*['"]\.\/([^'"]+)['"],?$/gm)) {
  if (!fs.existsSync(path.join(root, match[1]))) errors.push(`service worker: ressource introuvable ${match[1]}`);
}

console.log(`${pages.length} pages contrôlées · ${warnings.length} avertissement(s) · ${errors.length} erreur(s)`);
warnings.forEach(message => console.warn(`AVERTISSEMENT: ${message}`));
errors.forEach(message => console.error(`ERREUR: ${message}`));
if (errors.length) process.exitCode = 1;
