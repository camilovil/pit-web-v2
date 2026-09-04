// _build/sync-cursos-home.js — escribe el carrusel de próximos cursos en la
// home, entre <!-- PIT-CURSOS-HOME:START/END -->.
//
// DE DÓNDE SALEN LOS CURSOS
// De los mismos posts del foro: los que traen los campos `evento*` en el
// frontmatter son anuncios de curso. Así el bloque de la home y el artículo que
// se abre al tocarlo son UNA sola fuente — no hay forma de que la fecha de la
// tarjeta y la del artículo se contradigan, que es lo que pasaría con dos
// archivos separados. `foro.js` valida que estén todos los campos del evento (o
// ninguno) y corta el build si falta alguno; este paso corre después.
//
// ORDEN Y RETIRO
// Se ordenan por `eventoFecha` ASCENDENTE: primero el que está más cerca. NO se
// filtra por la fecha de hoy a propósito — el HTML se commitea, así que un
// filtro por `new Date()` haría que el sitio cambiara solo según el día en que
// alguien corriera el build, con diffs que aparecen sin que nadie toque nada.
// Para retirar un curso que ya pasó se le sacan los campos `evento*` al post
// (el artículo queda publicado en el foro) o se borra el post.
const fs = require('fs');
const path = require('path');
const { esc, esCurso, loadPosts } = require('./foro-posts');

const ROOT = path.join(__dirname, '..');
const START = '<!-- PIT-CURSOS-HOME:START';   // se matchea por prefijo (el comentario lleva texto extra)
const END = '<!-- PIT-CURSOS-HOME:END -->';
const ARCHIVO = 'index.html';

// Cuántos cursos mostrar en el carrusel.
const CUANTOS = 3;

function tarjeta(p) {
  // El contacto es el WhatsApp; el mail va abajo solo cuando el curso lo tiene
  // (hoy únicamente el de Salta).
  const contacto = p.eventoEmail
    ? `${esc(p.eventoWhatsapp)}<br>${esc(p.eventoEmail)}`
    : esc(p.eventoWhatsapp);
  // La foto es la `portada` del propio post: ya es obligatoria para todos y ya
  // corresponde a la región que trata el curso (rodilla, lumbar, cuello), así
  // que un curso nuevo trae su imagen sin campos extra.
  // alt="" a propósito: es decorativa. Está dentro de un enlace que ya dice
  // ciudad, tema, título, fecha, lugar y modalidad — repetirlo en el alt solo
  // le haría escuchar todo dos veces a quien usa lector de pantalla.
  return `            <a class="v2-curso" href="foro/${esc(p.slug)}.html" style="--acento: ${esc(p.eventoAcento)};">
              <span class="v2-curso-foto"><img src="${esc(p.portada)}" alt="" loading="lazy" decoding="async"></span>
              <span class="v2-curso-cuerpo">
                <span class="v2-curso-top">
                  <span class="v2-curso-zona">${esc(p.eventoZona)}</span>
                  <span class="v2-curso-tema">${esc(p.eventoTema)}</span>
                </span>
                <h3 class="v2-curso-tit">${esc(p.titulo)}</h3>
                <span class="v2-curso-datos">
                  <span><small>Fecha y hora</small><b>${esc(p.eventoFechaLabel)}</b></span>
                  <span><small>Lugar</small><b>${esc(p.eventoLugar)}</b></span>
                  <span><small>Modalidad</small><b>${esc(p.eventoModalidad)}</b></span>
                  <span><small>Inscripción por WhatsApp</small><b>${contacto}</b></span>
                </span>
                <span class="v2-curso-cta">Ver el curso →</span>
              </span>
            </a>`;
}

function bloque(cursos) {
  const tarjetas = cursos.map(tarjeta).join('\n');
  // Los puntitos son botones de verdad, no divs: se llega con el tabulador y
  // se activan con Enter. aria-current marca cuál está a la vista.
  const dots = cursos.map((p, i) =>
    `            <button type="button" class="v2-cursos-dot" data-curso-dot="${i}" aria-current="${i === 0}" aria-label="Ir al curso de ${esc(p.eventoZona)}"></button>`
  ).join('\n');

  return `  <section class="v2-section" id="cursos-presenciales">
    <div class="v2-wrap">
      <div class="v2-reveal">
        <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-bottom: 26px;">
          <div>
            <span class="v2-eyebrow" style="color: var(--v2-blue);">Próximos cursos</span>
            <h2 class="v2-title" style="margin-top: 14px;">Formación presencial, con práctica sobre pacientes reales</h2>
          </div>
          <a href="foro.html" style="font-family: var(--pit-font-mono); font-size: var(--txt-2xs); letter-spacing: 0.1em; text-transform: uppercase; color: var(--v2-slate);">Ver todo el foro →</a>
        </div>

        <div class="v2-cursos-track" id="v2-cursos-track" role="region" aria-label="Próximos cursos" tabindex="0">
${tarjetas}
        </div>

        <div class="v2-cursos-nav">
          <button type="button" class="v2-cursos-btn" data-curso-prev aria-label="Curso anterior">←</button>
          <button type="button" class="v2-cursos-btn" data-curso-next aria-label="Curso siguiente">→</button>
          <div class="v2-cursos-dots">
${dots}
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

const file = path.join(ROOT, ARCHIVO);
let html = fs.readFileSync(file, 'utf8');

const s = html.indexOf(START);
const e = html.indexOf(END);
if (s === -1 || e === -1) {
  console.error(`FAIL ${ARCHIVO}: faltan los marcadores PIT-CURSOS-HOME`);
  process.exit(1);
}
if (html.indexOf(START) !== html.lastIndexOf(START) || html.indexOf(END) !== html.lastIndexOf(END)) {
  console.error(`FAIL ${ARCHIVO}: marcadores PIT-CURSOS-HOME duplicados`);
  process.exit(1);
}

const cursos = loadPosts()
  .filter(esCurso)
  .sort((a, b) => a.eventoFecha.localeCompare(b.eventoFecha))   // el más próximo primero
  .slice(0, CUANTOS);

const startComment = html.slice(s, html.indexOf('\n', s));
// Sin cursos cargados no se deja una sección vacía en la home: se borra el
// bloque entero y quedan solo los marcadores, listos para el próximo.
const cuerpo = cursos.length ? `\n${bloque(cursos)}\n  ` : '\n  ';
const nuevo = `${startComment}${cuerpo}${END}`;
const next = html.slice(0, s) + nuevo + html.slice(e + END.length);

if (next !== html) {
  fs.writeFileSync(file, next);
  console.log(`SYNC ${ARCHIVO}  (${cursos.length} curso(s): ${cursos.map(c => c.eventoZona).join(', ') || '—'})`);
} else {
  console.log(`OK   ${ARCHIVO} (sin cambios)`);
}
