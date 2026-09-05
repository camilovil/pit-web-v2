// _build/check-css.js — vigila que las DOS copias del CSS compartido no se
// separen en silencio.
//
// POR QUÉ EXISTE
// index.html no carga pit-v2.css: tiene su propio <style> inline. Los tokens y
// los componentes compartidos viven en dos copias que hay que mover juntas.
// pit-v2.css se tocó en 16 commits y en los 16 hubo que tocar index.html
// también: co-cambio del 100%. Cuando alguien toca una sola, el bug aparece
// ÚNICAMENTE en la home o ÚNICAMENTE en las subpáginas, que es lo más caro de
// diagnosticar — y ya pasó (el toggle ES/EN quedó de dos colores distintos en
// producción durante varios commits).
//
// Lo ideal sería una sola fuente, generando la copia de la home desde
// pit-v2.css. Se evaluó y NO se aplicó; el porqué está en el README
// ("Las dos copias del CSS"). Mientras siga habiendo dos, que al menos no se
// puedan separar sin que el build lo diga.
//
// QUÉ COMPARA
// Solo los selectores que existen en LAS DOS copias, y compara los valores YA
// RESUELTOS: cada `var(--token)` se reemplaza por el valor que ese token tiene
// en su contexto (la home usa su bloque inline; las otras 17, ds.css pisado por
// pit-v2.css). Esto es lo que evita el falso positivo obvio: la home escribe
// #BFBFBF donde pit-v2.css escribe var(--pit-ink-20), y son lo mismo. Si algún
// día dejan de serlo, salta.
//
// Lo que NO es error: un selector que existe en una sola de las dos. pit-v2.css
// tiene componentes que la home no usa (foro, formularios) y la home tiene
// secciones propias. No hay forma de distinguir eso de un olvido, así que se
// informa y no se falla.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Diferencias deliberadas: selector → por qué. Van acá y no en el código para
// que agregar una obligue a escribir el motivo.
const EXCEPCIONES = {
  'body': 'pit-v2.css declara padding-top: 84px para dejar lugar a la nav flotante. '
    + 'La home NO lo lleva a propósito: su hero arranca pegado arriba y la nav flota encima. '
    + 'Aplicárselo empuja el hero 84px y saca del pliegue la franja de respaldos (medido).',
};

// ---------- parser mínimo de CSS ----------
// Alcanza para estas dos hojas: no hay @supports anidados ni nada exótico.
function parse(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const reglas = new Map();   // "contexto | selector" → [declaraciones]

  function recorrer(txt, contexto) {
    let i = 0, buf = '';
    while (i < txt.length) {
      const c = txt[i];
      if (c !== '{') { buf += c; i++; continue; }
      const sel = buf.trim().replace(/\s+/g, ' ');
      buf = '';
      let d = 1, j = i + 1;
      while (j < txt.length && d > 0) {
        if (txt[j] === '{') d++;
        else if (txt[j] === '}') d--;
        j++;
      }
      const cuerpo = txt.slice(i + 1, j - 1);
      if (sel.startsWith('@')) {
        recorrer(cuerpo, contexto ? `${contexto} | ${sel}` : sel);
      } else {
        const clave = contexto ? `${contexto} | ${sel}` : sel;
        const decls = cuerpo.split(';').map(s => s.trim()).filter(Boolean);
        // Un selector puede aparecer partido en varias reglas dentro del mismo
        // contexto (pasa en index.html): se acumulan, no se pisan.
        reglas.set(clave, (reglas.get(clave) || []).concat(decls));
      }
      i = j;
    }
  }
  recorrer(css, '');
  return reglas;
}

function tokens(css) {
  const t = {};
  const re = /(--[\w-]+)\s*:\s*([^;}]+)/g;
  let m;
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  while ((m = re.exec(css))) t[m[1]] = m[2].trim();
  return t;
}

// ---------- normalización ----------
function resolverVars(valor, mapa, prof = 0) {
  if (prof > 10 || !valor.includes('var(')) return valor;
  const out = valor.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\)[^()]*)*))?\)/g,
    (full, tok, fallback) => {
      if (Object.prototype.hasOwnProperty.call(mapa, tok)) return mapa[tok];
      if (fallback !== undefined) return fallback.trim();
      return full;   // token que no define nadie: se deja para que la diferencia se vea
    });
  return out === valor ? out : resolverVars(out, mapa, prof + 1);
}

function normalizar(decl, mapa) {
  const idx = decl.indexOf(':');
  if (idx === -1) return null;
  const prop = decl.slice(0, idx).trim().toLowerCase();
  let val = resolverVars(decl.slice(idx + 1).trim(), mapa);
  val = val
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',')
    .replace(/(^|[\s,(])\.(\d)/g, '$10.$2')          // .08em → 0.08em
    .replace(/#([0-9a-fA-F]{3,8})\b/g, (m, h) => '#' + h.toLowerCase())
    .trim();
  return `${prop}: ${val}`;
}

function mapaDecls(decls, mapa) {
  // Última declaración gana, como en el navegador.
  const m = new Map();
  for (const d of decls) {
    const n = normalizar(d, mapa);
    if (!n) continue;
    m.set(n.slice(0, n.indexOf(':')), n);
  }
  return m;
}

// ---------- main ----------
function main() {
  const v2Src = fs.readFileSync(path.join(ROOT, 'assets', 'css', 'pit-v2.css'), 'utf8');
  const dsSrc = fs.readFileSync(path.join(ROOT, 'assets', 'css', 'ds.css'), 'utf8');
  const idxSrc = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

  const ini = idxSrc.indexOf('<style>');
  const fin = idxSrc.indexOf('</style>', ini);
  if (ini === -1 || fin === -1) throw new Error('check-css: no se encontró el <style> inline de index.html');
  const inlineSrc = idxSrc.slice(ini + '<style>'.length, fin);

  // Contexto de las 17 subpáginas: ds.css, pisado por pit-v2.css.
  const mapa17 = { ...tokens(dsSrc), ...tokens(v2Src) };
  // Contexto de la home: solo su bloque inline.
  const mapaHome = tokens(inlineSrc);

  const rv2 = parse(v2Src);
  const rin = parse(inlineSrc);

  const compartidos = [...rv2.keys()].filter(k => rin.has(k)).sort();
  const errores = [];
  let saltados = 0;

  for (const clave of compartidos) {
    const sel = clave.includes(' | ') ? clave.slice(clave.lastIndexOf(' | ') + 3) : clave;
    if (Object.prototype.hasOwnProperty.call(EXCEPCIONES, sel)) { saltados++; continue; }

    const a = mapaDecls(rv2.get(clave), mapa17);
    const b = mapaDecls(rin.get(clave), mapaHome);

    const props = new Set([...a.keys(), ...b.keys()]);
    const dif = [];
    for (const p of props) {
      const va = a.get(p), vb = b.get(p);
      if (va !== vb) {
        dif.push(`      ${p}\n        pit-v2.css (subpáginas): ${va === undefined ? '— no la declara —' : va.slice(p.length + 2)}\n        index.html (home):       ${vb === undefined ? '— no la declara —' : vb.slice(p.length + 2)}`);
      }
    }
    if (dif.length) errores.push(`${clave}\n${dif.join('\n')}`);
  }

  const soloV2 = [...rv2.keys()].filter(k => !rin.has(k)).length;
  console.log(`    ${compartidos.length} selectores en las dos copias · ${errores.length} con diferencias · ${saltados} excepción(es) documentada(s)`);
  console.log(`    (${soloV2} selectores solo en pit-v2.css: componentes que la home no usa — no se comparan)`);

  if (errores.length) {
    console.error(`\n  ✗ check-css: las dos copias del CSS compartido se separaron.\n`);
    errores.forEach(e => console.error(`    · ${e}\n`));
    console.error(`  Los valores se comparan YA RESUELTOS: si dice que difieren, difieren de verdad
  en pantalla, aunque una copia use var(--token) y la otra el hex.
  Se arregla moviendo LAS DOS (ver HANDOFF → Arquitectura). Si la diferencia es
  deliberada, va a EXCEPCIONES en este archivo, con el motivo escrito.
`);
    process.exit(1);
  }
  console.log('    ✓ las dos copias del CSS coinciden');
}

main();
