// _build/sync-staging.js — propaga la bandera STAGING de _build/site.js a los
// dos lugares que no son plantillas de JS:
//   - las páginas MANUALES (index.html, curso-intro.html): el <meta robots>
//     entre los marcadores <!-- PIT-NOINDEX:START/END -->, igual que sync-nav.js
//   - vercel.json: la regla del header X-Robots-Tag
// Las 16 páginas generadas no pasan por acá: convert.js y foro.js piden
// NOINDEX_META directamente al armar el <head>.
//
// Idempotente: solo escribe si el contenido cambia.
const fs = require('fs');
const path = require('path');
const { STAGING, NOINDEX_META, NOINDEX_HEADER } = require('./site');

const ROOT = path.join(__dirname, '..');
const START = '<!-- PIT-NOINDEX:START';   // se matchea por prefijo (el comentario lleva texto extra)
const END = '<!-- PIT-NOINDEX:END -->';

const MANUAL = ['index.html', 'curso-intro.html'];

let failed = false;

// ---------- páginas manuales ----------
for (const file of MANUAL) {
  const p = path.join(ROOT, file);
  const html = fs.readFileSync(p, 'utf8');

  const s = html.indexOf(START);
  const e = html.indexOf(END);
  if (s === -1 || e === -1) { console.error(`FAIL ${file}: faltan marcadores PIT-NOINDEX`); failed = true; continue; }
  if (html.indexOf(START) !== html.lastIndexOf(START) || html.indexOf(END) !== html.lastIndexOf(END)) {
    console.error(`FAIL ${file}: marcadores PIT-NOINDEX duplicados`); failed = true; continue;
  }
  const startLineEnd = html.indexOf('\n', s);
  const startComment = html.slice(s, startLineEnd);

  // NOINDEX_META ya trae su indentación y su salto de línea, o es cadena vacía.
  const block = `${startComment}\n${NOINDEX_META}  ${END}`;
  const next = html.slice(0, s) + block + html.slice(e + END.length);

  if (next !== html) { fs.writeFileSync(p, next); console.log(`SYNC ${file}  (noindex: ${STAGING ? 'sí' : 'no'})`); }
  else console.log(`OK   ${file} (sin cambios)`);
}

// ---------- vercel.json ----------
// Se parsea y se vuelve a escribir con un formateador propio que reproduce el
// estilo del archivo (una regla por línea). ANTES de tocar nada se comprueba
// que el formateador reproduzca el archivo actual byte a byte: si el formato
// se movió a algo que este script no sabe escribir, aborta en vez de
// reformatear el archivo entero en silencio.
function fmtRule(r) {
  const keys = Object.keys(r);
  const conocido = keys.length === 2 && keys.includes('source') && keys.includes('headers')
    && r.headers.every(h => Object.keys(h).length === 2 && 'key' in h && 'value' in h);
  if (!conocido) return JSON.stringify(r);
  const hs = r.headers.map(h => `{ "key": ${JSON.stringify(h.key)}, "value": ${JSON.stringify(h.value)} }`).join(', ');
  return `{ "source": ${JSON.stringify(r.source)}, "headers": [${hs}] }`;
}

function fmtConfig(cfg) {
  const body = Object.entries(cfg).map(([k, v]) => {
    if (k === 'headers' && Array.isArray(v)) {
      return `  "headers": [\n${v.map(r => '    ' + fmtRule(r)).join(',\n')}\n  ]`;
    }
    return `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`;
  }).join(',\n');
  return `{\n${body}\n}\n`;
}

const vp = path.join(ROOT, 'vercel.json');
const rawVercel = fs.readFileSync(vp, 'utf8');
try {
  const cfg = JSON.parse(rawVercel);

  if (fmtConfig(cfg) !== rawVercel.replace(/\r\n/g, '\n')) {
    console.error('FAIL vercel.json: el formato del archivo no coincide con el que sabe escribir sync-staging.js.');
    console.error('     No se tocó nada. Revisá el archivo (¿se agregó una clave nueva, o una regla con "has"/"destination"?)');
    console.error('     y actualizá fmtRule/fmtConfig antes de volver a correr el build.');
    failed = true;
  } else {
    cfg.headers = (cfg.headers || []).filter(r => !(r.headers || []).some(h => h.key === 'X-Robots-Tag'));
    if (STAGING) cfg.headers.push(NOINDEX_HEADER);

    const next = fmtConfig(cfg);
    if (next !== rawVercel) { fs.writeFileSync(vp, next); console.log(`SYNC vercel.json  (X-Robots-Tag: ${STAGING ? 'sí' : 'no'})`); }
    else console.log('OK   vercel.json (sin cambios)');
  }
} catch (e) {
  console.error(`FAIL vercel.json: ${e.message}`);
  failed = true;
}

process.exit(failed ? 1 : 0);
