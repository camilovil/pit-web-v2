// Fuente única de los posts del foro: lee y parsea `_content/foro/*.md`.
//
// POR QUÉ EXISTE ESTE ARCHIVO
// Hasta ahora el parser y las tablas de etiquetas vivían dentro de foro.js, que
// es un generador: requerirlo desde otro script vuelve a generar el foro
// entero. Cuando la home empezó a mostrar las últimas publicaciones hacía falta
// leer los mismos .md desde un segundo lugar, y la alternativa era copiar el
// parser — el mismo error que este repo ya paga caro con las dos copias del CSS
// (ver README → "Las dos copias del CSS"). Acá el parser es uno solo: foro.js y
// sync-foro-home.js leen exactamente los mismos campos con las mismas reglas.
//
// Este módulo NO valida: la validación (que corta el build nombrando archivo y
// campo) sigue en foro.js, que es quien manda. sync-foro-home.js corre DESPUÉS
// en el pipeline, así que cuando llega ya está todo validado.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONTENT = path.join(ROOT, '_content', 'foro');

const CAT = {
  pyr: 'Preguntas y respuestas',
  caso: 'Casos clínicos',
  evidencia: 'Evidencia',
  consejos: 'Consejos',
  noticias: 'Noticias',
};
const CAT_SHORT = { pyr: 'P. y R.', caso: 'Caso clínico', evidencia: 'Evidencia', consejos: 'Consejos', noticias: 'Noticias' };
const AUD = { pacientes: 'Pacientes', profesionales: 'Prof.', todos: 'Para todos' };
const TIPO = ['qa', 'caso', 'articulo'];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Todo lo que sale del frontmatter o del markdown y termina en HTML pasa por
// acá. El caso que rompe no es un ataque: es una comilla doble en `titulo` o en
// `resumen`, que van a <title>, a <meta content> y a alt="". Una sola cierra el
// atributo antes de tiempo y desarma el <head> de la página.
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parsePost(file) {
  const raw = fs.readFileSync(path.join(CONTENT, file), 'utf8').replace(/\r\n/g, '\n');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: sin frontmatter`);
  const meta = {};
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^(\w+):\s*(.*)$/);
    if (!mm) continue;
    let v = mm[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    meta[mm[1]] = v;
  }
  meta.lectura = parseInt(meta.lectura || '5', 10);
  meta.tags = (meta.tags || '').split(',').map(t => t.trim()).filter(Boolean);
  return { ...meta, body: m[2].trim(), file };
}

// Campos que convierten a un post en el anuncio de un curso. Si aparece
// cualquiera de ellos, foro.js exige el juego completo: un curso a medio
// describir en la home es peor que no anunciarlo.
const EVENTO_REQ = ['eventoFecha', 'eventoFechaLabel', 'eventoLugar', 'eventoZona',
                    'eventoModalidad', 'eventoWhatsapp', 'eventoTema', 'eventoAcento'];
// eventoImagen: la foto que va en la tarjeta del carrusel de la home. Si no
// está, se usa la `portada`. Existe porque la portada de estos posts es el
// flyer, que ya trae el título, la fecha y el teléfono quemados en la imagen —
// y la tarjeta de la home dice exactamente eso mismo en texto al lado.
const EVENTO_OPC = ['eventoEmail', 'eventoImagen'];

// Un post es "de curso" si trae la fecha del evento. Se mira ese campo y no
// otro porque es el que ordena los cursos en la home.
function esCurso(p) { return !!(p && p.eventoFecha); }

// Devuelve los posts ordenados por fecha descendente: el [0] es el último.
function loadPosts() {
  const files = fs.readdirSync(CONTENT).filter(f => f.endsWith('.md')).sort().reverse();
  const posts = files.map(parsePost);
  posts.sort((a, b) => b.fecha.localeCompare(a.fecha));
  return posts;
}

module.exports = { CONTENT, CAT, CAT_SHORT, AUD, TIPO, SLUG_RE, EVENTO_REQ, EVENTO_OPC, esc, esCurso, parsePost, loadPosts };
