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
  (`pit-chat.js`, requiere backend: hoy responde en modo demo), toggle ES/EN (`pit-lang.js`).
- `_dc-src/` — fuentes originales del proyecto de diseño (`.dc.html` completos y
  `cores/` con el contenido único por página).
- `_build/convert.js` — conversor determinístico `.dc.html` → HTML standalone
  (`node _build/convert.js`). `index.html` y `curso-intro.html` son manuales
  (el aula del curso intro es una app vanilla JS portada del diseño reactivo).

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

## Pendientes de contenido (placeholders en el diseño)
- Testimonios reales (home y curso) — "A validar con Ricardo".
- Videos del curso intro (posters listos, falta conectar Vimeo/YouTube).
- Citas de evidencia científica + PDF de referencias.
- WhatsApp y horarios en Contacto; mapa embed.
- Backend de formularios (foro y contacto): hoy foro es front-only y contacto abre mailto.

## Deploy
Vercel (proyecto separado del sitio live). Cuando esté aprobado: mover el dominio
`drricardofrusso.com` a este proyecto desde el dashboard de Vercel y quitar el noindex.
