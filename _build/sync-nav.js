// _build/sync-nav.js — inyecta el nav del módulo entre <!-- PIT-NAV:START/END --> en páginas MANUALES.
// Idempotente: reemplaza SIEMPRE la región completa entre marcadores (incluye el nav previo).
const fs = require('fs');
const path = require('path');
const { renderNav } = require('./nav');

const ROOT = path.join(__dirname, '..');
const START = '<!-- PIT-NAV:START';   // se matchea por prefijo (el comentario lleva texto extra)
const END = '<!-- PIT-NAV:END -->';

// index.html es la home: home:true (usa '#contenido'), sin active, sin prefix.
const TARGETS = [
  { file: 'index.html', opts: { home: true, active: null, prefix: '' } },
];

let failed = false;
for (const t of TARGETS) {
  const p = path.join(ROOT, t.file);
  let html = fs.readFileSync(p, 'utf8');

  const s = html.indexOf(START);
  const e = html.indexOf(END);
  if (s === -1 || e === -1) { console.error(`FAIL ${t.file}: faltan marcadores PIT-NAV`); failed = true; continue; }
  if (html.indexOf(START) !== html.lastIndexOf(START) || html.indexOf(END) !== html.lastIndexOf(END)) {
    console.error(`FAIL ${t.file}: marcadores PIT-NAV duplicados`); failed = true; continue;
  }
  const startLineEnd = html.indexOf('\n', s);   // preserva el texto del comentario START tal cual está
  const startComment = html.slice(s, startLineEnd);

  const block = `${startComment}\n${renderNav(t.opts)}\n  ${END}`;
  const next = html.slice(0, s) + block + html.slice(e + END.length);

  if (next !== html) { fs.writeFileSync(p, next); console.log(`SYNC ${t.file}`); }
  else console.log(`OK   ${t.file} (sin cambios)`);
}
process.exit(failed ? 1 : 0);
