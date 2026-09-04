// _build/sync-foro-home.js — escribe las últimas publicaciones del foro en la
// home, entre <!-- PIT-FORO-HOME:START/END -->.
//
// POR QUÉ SE GENERA Y NO SE ESCRIBE A MANO
// El foro publica todas las semanas. Un bloque escrito a mano en index.html
// queda viejo el primer lunes y nadie se entera: la home seguiría anunciando
// "cada semana, una respuesta" mostrando algo de hace tres meses. Acá sale de
// _content/foro/*.md, así que publicar un post nuevo ya lo pone en la home.
//
// Corre DESPUÉS de foro.js en el pipeline, a propósito: foro.js valida el
// frontmatter y corta el build si un post está mal escrito. Cuando llega este
// paso, los datos ya están validados.
//
// Las filas repiten las columnas del archivo de foro.html (fecha · categoría ·
// título · leer) y las mismas cadenas exactas — "S27 · 3 jul", "CASO CLÍNICO ·
// PACIENTES", el título del post. Eso no es casualidad: el diccionario ES/EN
// (assets/js/pit-lang.js) traduce por coincidencia exacta de texto, así que al
// reusar las cadenas que ya existen en el foro, la home queda traducida sin
// agregar una sola clave nueva por post. Si alguna vez se cambia el formato de
// estas filas, hay que mirar check-lang.js.
const fs = require('fs');
const path = require('path');
const { CAT_SHORT, AUD, esc, esCurso, loadPosts } = require('./foro-posts');

const ROOT = path.join(__dirname, '..');
const START = '<!-- PIT-FORO-HOME:START';   // se matchea por prefijo (el comentario lleva texto extra)
const END = '<!-- PIT-FORO-HOME:END -->';
const ARCHIVO = 'index.html';

// Cuántas publicaciones mostrar. Tres entra en una pantalla sin empujar la
// sección de patologías fuera de la vista, y alcanza para que se lea como un
// flujo y no como una novedad suelta.
const CUANTAS = 3;

function fila(p) {
  // fechaLabel viene como "3 jul 2026"; el año se cae porque las tres filas son
  // del mismo año y repetirlo tres veces no aporta nada.
  const fecha = esc(`${p.semana} · ${p.fechaLabel.replace(/ \d{4}$/, '')}`);
  const cat = `${CAT_SHORT[p.categoria]} · ${AUD[p.audiencia]}`;
  return `          <a class="v2-foro-row" href="foro/${esc(p.slug)}.html">
            <span class="v2-foro-fecha">${fecha}</span>
            <span class="v2-foro-cat">${cat}</span>
            <span class="v2-foro-tit">${esc(p.titulo)}</span>
            <span class="v2-foro-leer">Leer →</span>
          </a>`;
}

function bloque(posts) {
  const filas = posts.slice(0, CUANTAS).map(fila).join('\n');
  return `        <div class="v2-foro-ultimo v2-reveal" style="margin-top: 30px; padding-top: 24px; border-top: 1px solid rgba(0,11,51,0.10);">
          <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 10px;">
            <span class="v2-eyebrow" style="color: var(--v2-blue);">Lo último del foro</span>
            <a href="foro.html" style="font-family: var(--pit-font-mono); font-size: var(--txt-2xs); letter-spacing: 0.1em; text-transform: uppercase; color: var(--v2-slate);">Ver todo el foro →</a>
          </div>
${filas}
        </div>`;
}

const file = path.join(ROOT, ARCHIVO);
let html = fs.readFileSync(file, 'utf8');

const s = html.indexOf(START);
const e = html.indexOf(END);
if (s === -1 || e === -1) {
  console.error(`FAIL ${ARCHIVO}: faltan los marcadores PIT-FORO-HOME`);
  process.exit(1);
}
if (html.indexOf(START) !== html.lastIndexOf(START) || html.indexOf(END) !== html.lastIndexOf(END)) {
  console.error(`FAIL ${ARCHIVO}: marcadores PIT-FORO-HOME duplicados`);
  process.exit(1);
}

// Los anuncios de curso salen de este listado: tienen su propio bloque en la
// home (sync-cursos-home.js) y, si no se filtraran, las tres tarjetas de
// "lo último del foro" quedarían mostrando exactamente lo mismo que el bloque
// de arriba. En foro.html sí aparecen: ahí son publicaciones como cualquier otra.
const posts = loadPosts().filter(p => !esCurso(p));
if (!posts.length) {
  console.error('FAIL sync-foro-home: no hay publicaciones en _content/foro/');
  process.exit(1);
}

// Se preserva el texto del comentario START tal cual está escrito.
const startComment = html.slice(s, html.indexOf('\n', s));
const nuevo = `${startComment}\n${bloque(posts)}\n        ${END}`;
const next = html.slice(0, s) + nuevo + html.slice(e + END.length);

if (next !== html) {
  fs.writeFileSync(file, next);
  console.log(`SYNC ${ARCHIVO}  (${Math.min(CUANTAS, posts.length)} publicaciones, la última: ${posts[0].slug})`);
} else {
  console.log(`OK   ${ARCHIVO} (sin cambios)`);
}
