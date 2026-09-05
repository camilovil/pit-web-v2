// _build/check-links.js — detect broken internal href/src references before deploy.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKIP = new Set(['certificado.html']);

function pages() {
  const rootPages = fs.readdirSync(ROOT)
    .filter(file => file.endsWith('.html') && !SKIP.has(file));
  const forumDir = path.join(ROOT, 'foro');
  const forumPages = fs.existsSync(forumDir)
    ? fs.readdirSync(forumDir).filter(file => file.endsWith('.html')).map(file => path.join('foro', file))
    : [];
  return [...rootPages, ...forumPages].sort();
}

function targetFile(from, raw) {
  if (!raw || /^(?:[a-z]+:|#|\/\/)/i.test(raw)) return null;
  const clean = raw.split('#')[0].split('?')[0];
  if (!clean || clean.startsWith('/_vercel/') || clean.startsWith('/api/')) return null;
  const relative = clean.startsWith('/')
    ? clean.slice(1)
    : path.join(path.dirname(from), clean);
  if (!relative) return 'index.html';
  const normalized = path.normalize(relative);
  if (path.extname(normalized)) return normalized;
  if (fs.existsSync(path.join(ROOT, normalized, 'index.html'))) return path.join(normalized, 'index.html');
  return normalized + '.html';
}

const broken = [];
let checked = 0;
for (const rel of pages()) {
  const html = fs.readFileSync(path.join(ROOT, rel), 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  const refs = [...html.matchAll(/\b(?:href|src)=(?:"([^"]*)"|'([^']*)')/gi)]
    .map(match => match[1] !== undefined ? match[1] : match[2]);
  for (const ref of refs) {
    const target = targetFile(rel, ref);
    if (!target) continue;
    checked++;
    if (!fs.existsSync(path.join(ROOT, target))) broken.push(`${rel} → ${ref} (${target})`);
  }
}

if (broken.length) {
  console.error(`\n✗ check-links: ${broken.length} referencia(s) interna(s) rota(s):`);
  broken.forEach(item => console.error(`  · ${item}`));
  process.exit(1);
}
console.log(`    ✓ ${checked} referencias internas verificadas`);
