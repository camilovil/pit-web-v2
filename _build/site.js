// _build/site.js — banderas del sitio. UNA fuente para todo el pipeline.
//
// ══ LA PALANCA DEL LANZAMIENTO ══════════════════════════════════════════════
// Poner STAGING en false y correr `node _build/build.js`. Eso es todo.
//
// El `noindex` vivía en CINCO lugares (los <head> de las 15 páginas generadas
// por convert.js y foro.js, los de las dos páginas manuales, y el header
// X-Robots-Tag de vercel.json) y el día del lanzamiento había que acordarse de
// los cinco. Olvidarse de uno no rompe nada visible: simplemente esa parte del
// sitio sigue invisible para Google, y no hay forma de notarlo desde la página.
//
// Ahora los cinco salen de acá:
//   - convert.js y foro.js  → piden NOINDEX_META al armar el <head>
//   - index.html y curso-intro.html → los inyecta _build/sync-staging.js entre
//     los marcadores <!-- PIT-NOINDEX:START/END --> (mismo mecanismo que el nav)
//   - vercel.json → la regla X-Robots-Tag la pone/saca _build/sync-staging.js
//
// Al apagarlo, verificar con: curl -sI https://drricardofrusso.com | grep -i robots
// (no tiene que aparecer nada) y buscar "noindex" en el HTML servido.

// true  = staging: el sitio pide a los buscadores que no lo indexen.
// false = producción: se quitan el meta y el header en las 18 páginas.
const STAGING = true;

// Línea completa del <head>, con salto de línea, o cadena vacía. Se interpola
// tal cual en las plantillas: en producción la línea desaparece, no queda un
// hueco ni un meta vacío.
const NOINDEX_META = STAGING
  ? '  <meta name="robots" content="noindex, nofollow"><!-- staging: se apaga con STAGING en _build/site.js -->\n'
  : '';

// Regla de vercel.json. El header cubre lo que el meta no: PDFs, imágenes y
// cualquier archivo que no sea HTML.
const NOINDEX_HEADER = {
  source: '/(.*)',
  headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
};

module.exports = { STAGING, NOINDEX_META, NOINDEX_HEADER };
