# PIT Web v2 — drricardofrusso.com (rediseño)

Sitio estático del Dr. Ricardo D. Frusso (PIT · Neuroproloterapia), implementado desde el
proyecto de Claude Design "PIT" (`HomePit v2` + subpáginas, estética "Docshield").

**Estado: staging.** Todas las páginas llevan `noindex` (meta + header en `vercel.json`).
Quitar ambos al conectar el dominio.

## Estructura
- `index.html` + 10 subpáginas — HTML standalone, sin framework ni build para servir.
- `assets/css/` — `fonts.css` (Space Grotesk + JetBrains Mono self-hosted), `ds.css`
  (tokens + componentes del design system `pit-design-system`), `pit-v2.css` (piel v2:
  nav pill, footer gradiente), `pit-mobile.css`, `pit-motion.css`.
- `assets/js/` — drawer (`pit-v2.js`), reveals (`pit-motion.js`), asistente IA
  (`pit-chat.js`, backend listo en `api/chat.js`, esperando `ANTHROPIC_API_KEY` —
  ver HANDOFF.md), toggle ES/EN (`pit-lang.js`, markup estático desde `_build/nav.js`),
  botón volver arriba (`pit-scrolltop.js`).
- `_dc-src/` — fuentes originales del proyecto de diseño (`.dc.html` completos y
  `cores/` con el contenido único por página).
- `_build/convert.js` — conversor determinístico `.dc.html` → HTML standalone.
  `index.html` y `curso-intro.html` son manuales (el aula del curso intro es una
  app vanilla JS portada del diseño reactivo).
- `_build/nav.js` — **fuente ÚNICA del nav del sitio** (header + drawer). Para
  cambiar el menú se edita SOLO este archivo; `convert.js`, `foro.js` y `sync-nav.js`
  lo consumen. (Las fuentes `.dc.html` conservan un bloque de nav que el build
  reemplaza automáticamente — no editar el nav ahí, no tiene efecto.)
- `_build/sync-nav.js` — inyecta el nav en las páginas manuales (`index.html`) entre
  los marcadores `<!-- PIT-NAV:START/END -->`, sin tocar su CSS inline.
- **Build completo: `node _build/build.js`** (corre convert.js → foro.js → sync-nav.js
  en orden; es idempotente). También se pueden correr sueltos si hace falta.

## Foro (portal de contenido)

El foro es un portal generado desde archivos markdown — **no se edita el HTML a mano**:

- `_content/foro/*.md` — una publicación por archivo, con frontmatter (`titulo`, `slug`,
  `tipo: qa|caso|articulo`, `categoria: pyr|caso|evidencia|consejos|noticias`,
  `audiencia: pacientes|profesionales|todos`, `semana`, `fecha`, `fechaLabel`, `lectura`,
  `tags`, `resumen`, `portada`) y cuerpo en markdown mínimo (`##` títulos, `**negrita**`,
  `![img](url "CAPTION")`, `> idea clave`, `[[placeholder: pendiente]]`).
- `node _build/foro.js` regenera todo: `foro.html` (índice con destacado automático =
  la publicación más nueva, archivo completo, filtros funcionales por categoría y
  audiencia) y `foro/<slug>.html` (una página por publicación, con "Seguí leyendo" y
  link a la anterior generados solos).

**Publicar algo nuevo** = crear el `.md`, correr `node _build/foro.js`, commit y push
(el deploy sale automático). Convención de nombre: `AAAA-MM-DD-titulo-corto.md`.

## Formularios (Formspree)
Foro y contacto envían vía `assets/js/pit-forms.js` → Formspree (AJAX, sin recargar,
manteniendo el estado de éxito en la página). El endpoint está en el objeto `ENDPOINTS`
de ese archivo — hoy apunta al form del sitio actual (`f/xykvrdad`), compartido por
foro y contacto; se distinguen por el `_subject` y el campo `tipo` de cada envío.
Si el endpoint contiene `REEMPLAZAR`, los forms andan en **modo demo** (muestran éxito
sin enviar) — útil para staging. Para separarlos, crear un segundo form en Formspree y
cambiar una línea. El newsletter hoy es el checkbox del form del foro (llega como campo
`newsletter: sí/no`); si más adelante se quiere lista propia, migrar a Brevo/Mailchimp.

**Seguridad pendiente para cuando escale:** `_build/foro.js` genera HTML desde markdown
sin sanitizar (`inline()`/`mdToHtml`). Hoy es seguro porque el contenido lo escribe el
autor del sitio; si el foro llegara a aceptar contenido de terceros, escapar antes de insertar.

## Pendientes de contenido (placeholders en el diseño)
- Testimonios reales (home y curso) — "A validar con Ricardo".
- Videos del curso intro (posters listos, falta conectar Vimeo/YouTube).
- Citas de evidencia científica (el PDF de referencias ya está enlazado).
- WhatsApp y horarios en Contacto; mapa embed.
- Asistente IA: código listo (`api/chat.js` + `pit-chat.js`), solo falta cargar
  `ANTHROPIC_API_KEY` en Vercel — ver HANDOFF.md → Pendiente.

## Deploy
Vercel (proyecto separado del sitio live). Cuando esté aprobado: mover el dominio
`drricardofrusso.com` a este proyecto desde el dashboard de Vercel y quitar el noindex.
