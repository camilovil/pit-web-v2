// _build/check-lang.js — audita el diccionario ES/EN contra el HTML construido.
//
// POR QUÉ EXISTE
// `assets/js/pit-lang.js` traduce por coincidencia EXACTA del texto recortado de
// cada nodo. Cambiar una coma en el copy no rompe nada visible: simplemente esa
// frase deja de traducirse y la clave queda huérfana, en silencio. El ritual
// manual era pegar un TreeWalker en la consola de cada página y comparar a ojo
// contra Object.keys(DICT) — 18 páginas, a mano, cada vez. Esto es ese ritual,
// automatizado y corriendo en el build.
//
// QUÉ MIRA
// Lo mismo que mira pit-lang.js al traducir, y nada más:
//   - nodos de texto de <body> (sin <script> ni <style>: eso no lo ve el visitante)
//   - atributos placeholder
//   - atributos aria-label
//
// LISTA BLANCA
// No se hardcodea: las cadenas que solo existen cuando el JS las escribe (widget
// del chat, "Cerrar menú", "Volver arriba", estado vacío del archivo del foro,
// errores de formulario) van marcadas en pit-lang.js con el comentario RUNTIME
// al final de su línea. Este script lee esas marcas del fuente. Si una cadena
// nueva es de runtime, se marca allá y acá se entera solo.
//
// TAMBIÉN CHEQUEA LAS DOS TRAMPAS DEL FORMATO (documentadas en pit-lang.js):
//   1. clave repetida → la última pisa a la anterior sin error
//   2. valor repetido → el diccionario inverso colapsa y volver a ES rompe
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LANG_FILE = path.join(ROOT, 'assets', 'js', 'pit-lang.js');
const FORO_DIR = path.join(ROOT, 'foro');

// certificado.html no es parte del sitio: es trabajo en curso, está en
// .gitignore y no se despliega. No entra en la cobertura del diccionario.
const SKIP = new Set(['certificado.html']);

// ---------- 1. leer el diccionario del fuente ----------
// No se puede requerir pit-lang.js: es un IIFE que necesita `document`. Se parsea
// el literal, que además es lo único que permite ver claves repetidas (un objeto
// ya evaluado se las comió) y los comentarios RUNTIME.
function readDict() {
  const src = fs.readFileSync(LANG_FILE, 'utf8').replace(/\r\n/g, '\n');
  const open = src.indexOf('var DICT = {');
  if (open === -1) throw new Error('check-lang: no se encontró "var DICT = {" en pit-lang.js');
  const close = src.indexOf('\n  };', open);
  if (close === -1) throw new Error('check-lang: no se encontró el cierre del literal DICT');

  const lines = src.slice(open, close).split('\n');
  const firstLine = src.slice(0, open).split('\n').length;   // nº de línea de "var DICT"
  const entries = [];
  lines.forEach((line, i) => {
    // Una entrada por línea: 'clave': 'valor',   // comentario opcional
    const m = line.match(/^\s*'((?:[^'\\]|\\.)*)'\s*:\s*'((?:[^'\\]|\\.)*)'\s*,?\s*(.*)$/);
    if (!m) return;
    entries.push({
      key: unescapeJs(m[1]),
      value: unescapeJs(m[2]),
      runtime: /\bRUNTIME\b/.test(m[3]),
      line: firstLine + i,
    });
  });
  if (!entries.length) throw new Error('check-lang: el literal DICT se parseó vacío (¿cambió el formato?)');
  return entries;
}

function unescapeJs(s) {
  return s.replace(/\\(.)/g, (_, c) => (c === 'n' ? '\n' : c === 't' ? '\t' : c));
}

// ---------- 2. leer el texto visible del HTML construido ----------
const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  hellip: '…', mdash: '—', ndash: '–', laquo: '«', raquo: '»',
  ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’',
  middot: '·', deg: '°', times: '×', larr: '←', rarr: '→',
};
function decode(s) {
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (full, body) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : full;
    }
    return Object.prototype.hasOwnProperty.call(ENTITIES, body) ? ENTITIES[body] : full;
  });
}

// Tokenizador chico pero con conciencia de comillas: un `>` dentro de un valor de
// atributo NO cierra la etiqueta. Un split ingenuo por /<[^>]*>/ parte el texto en
// esos casos y produce huérfanas fantasma.
function scan(html) {
  const texts = new Set();   // nodos de texto (recortados)
  const attrs = new Set();   // placeholder + aria-label
  const bodyStart = html.indexOf('<body');
  const from = bodyStart === -1 ? 0 : html.indexOf('>', bodyStart) + 1;
  const bodyEnd = html.indexOf('</body>');
  const src = html.slice(from, bodyEnd === -1 ? undefined : bodyEnd);

  let i = 0;
  let buf = '';
  const flush = () => {
    const t = decode(buf).trim();
    if (t) texts.add(t);
    buf = '';
  };

  while (i < src.length) {
    const c = src[i];
    if (c !== '<') { buf += c; i++; continue; }

    // comentario
    if (src.startsWith('<!--', i)) {
      flush();
      const end = src.indexOf('-->', i);
      i = end === -1 ? src.length : end + 3;
      continue;
    }

    // etiqueta: avanzar hasta el '>' que no esté entre comillas
    let j = i + 1;
    let quote = null;
    while (j < src.length) {
      const d = src[j];
      if (quote) { if (d === quote) quote = null; }
      else if (d === '"' || d === "'") quote = d;
      else if (d === '>') break;
      j++;
    }
    const tag = src.slice(i, j + 1);
    flush();
    i = j + 1;

    const name = (tag.match(/^<\/?\s*([a-zA-Z0-9-]+)/) || [])[1];
    const lower = name ? name.toLowerCase() : '';

    // placeholder / aria-label del propio tag
    const attrRe = /\b(placeholder|aria-label)\s*=\s*("([^"]*)"|'([^']*)')/g;
    let am;
    while ((am = attrRe.exec(tag))) {
      const v = decode(am[3] !== undefined ? am[3] : am[4]).trim();
      if (v) attrs.add(v);
    }

    // <script> y <style>: su contenido NO es texto que el visitante lea.
    // Incluirlo taparía huérfanas reales (p. ej. las cadenas que el script
    // inline del foro escribe recién en runtime).
    if ((lower === 'script' || lower === 'style') && tag[1] !== '/') {
      const closeRe = new RegExp(`</\\s*${lower}\\s*>`, 'i');
      const rest = src.slice(i);
      const cm = rest.match(closeRe);
      i += cm ? cm.index + cm[0].length : rest.length;
    }
  }
  flush();
  return { texts, attrs };
}

function pages() {
  const out = [];
  for (const f of fs.readdirSync(ROOT)) {
    if (f.endsWith('.html') && !SKIP.has(f)) out.push(f);
  }
  if (fs.existsSync(FORO_DIR)) {
    for (const f of fs.readdirSync(FORO_DIR)) {
      if (f.endsWith('.html')) out.push(path.join('foro', f));
    }
  }
  return out.sort();
}

// ---------- 3. auditar ----------
function main() {
  const entries = readDict();
  const files = pages();
  if (!files.length) throw new Error('check-lang: no hay HTML construido para auditar (¿corriste el build?)');

  const seen = new Set();
  files.forEach(rel => {
    const { texts, attrs } = scan(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
    texts.forEach(t => seen.add(t));
    attrs.forEach(t => seen.add(t));
  });

  const errors = [];
  const warnings = [];

  // 3a. claves repetidas — la última pisa a la anterior en silencio
  const byKey = new Map();
  for (const e of entries) {
    if (byKey.has(e.key)) {
      errors.push(`clave repetida (la última pisa a la anterior)\n      líneas ${byKey.get(e.key).line} y ${e.line}: "${e.key}"`);
    } else byKey.set(e.key, e);
  }

  // 3b. valores repetidos — el diccionario inverso colapsa y EN→ES rompe
  const byValue = new Map();
  for (const e of entries) {
    if (byValue.has(e.value)) {
      const prev = byValue.get(e.value);
      errors.push(`traducción repetida (volver a ES rompe una de las dos)\n      línea ${prev.line}: "${prev.key}"\n      línea ${e.line}: "${e.key}"\n      ambas → "${e.value}"`);
    } else byValue.set(e.value, e);
  }

  // 3c. huérfanas — la clave ya no coincide con ningún texto del sitio
  const orphans = [];
  const staleRuntime = [];
  for (const e of byKey.values()) {
    const present = seen.has(e.key);
    if (!present && !e.runtime) orphans.push(e);
    if (present && e.runtime) staleRuntime.push(e);
  }
  for (const e of orphans) {
    errors.push(`clave huérfana: no aparece en ninguna página\n      línea ${e.line}: "${e.key}"`);
  }
  for (const e of staleRuntime) {
    warnings.push(`marca RUNTIME de más (la cadena sí está en el HTML) — línea ${e.line}: "${e.key}"`);
  }

  const runtimeCount = entries.filter(e => e.runtime).length;
  console.log(`    ${files.length} páginas · ${byKey.size} claves · ${runtimeCount} RUNTIME en lista blanca · ${seen.size} cadenas visibles`);
  warnings.forEach(w => console.log(`    ⚠ ${w}`));

  if (errors.length) {
    console.error(`\n  ✗ check-lang: ${errors.length} problema(s) en assets/js/pit-lang.js\n`);
    errors.forEach(m => console.error(`    · ${m}`));
    console.error(`
  Cómo se arregla una huérfana: buscá la frase en el HTML construido. Si el copy
  cambió, actualizá la clave; si la frase se borró, borrá la entrada; si la
  escribe el JS en runtime, sumale el comentario RUNTIME al final de su línea.
`);
    process.exit(1);
  }
  console.log('    ✓ diccionario ES/EN al día');
}

main();
