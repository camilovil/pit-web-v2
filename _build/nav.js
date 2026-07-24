// _build/nav.js — ÚNICA fuente del NAV del sitio (header + drawer).
// Consumido por: _build/convert.js (core+raw), _build/foro.js, _build/sync-nav.js.
// Un cambio de nav se hace SOLO acá y se propaga corriendo el build.

const LOGO_HTML = '<span class="pit-logo"><span class="pit-logo-dr">Dr.</span><span class="pit-logo-pipe" aria-hidden="true"></span><span class="pit-logo-name"><span>Ricardo D.</span><span>Frusso</span></span></span>';

const CTA = { href: '/docs/Apuntes-PIT-Neuroproloterapia-Dr-Frusso.pdf', label: 'Apuntes gratis' };

// Toggle de idioma ES/EN. Markup ESTÁTICO a propósito (antes se inyectaba por JS
// con setInterval, causando un "pop-in" visible y layout shift en la barra —
// ver assets/js/pit-lang.js, que ya no inyecta nada, solo aplica el idioma).
const LANG_TOGGLE = (extraClass) => `<span class="v2-lang-toggle${extraClass ? ' ' + extraClass : ''}">
      <button class="lang-btn lang-active" data-lang="es" type="button">ES</button>
      <button class="lang-btn" data-lang="en" type="button">EN</button>
    </span>`;

// 7 items canónicos, en orden. href = URL final relativa (sin prefijo).
// El item 'contenido' usa ancla local (#contenido) cuando home === true.
const NAV_ITEMS = [
  { key: 'que-es-pit', href: 'que-es-pit.html',          label: 'Qué es PIT' },
  { key: 'evidencia',  href: 'evidencia.html',           label: 'Evidencia' },
  { key: 'sobre',      href: 'sobre-el-dr-frusso.html',  label: 'Sobre el Dr. Frusso' },
  { key: 'contenido',  href: 'index.html#contenido',     label: 'Contenido' },
  { key: 'foro',       href: 'foro.html',                label: 'Foro' },
  { key: 'curso',      href: 'curso-modulo-1.html',      label: 'Curso' },
  { key: 'contacto',   href: 'contacto.html',            label: 'Contacto' },
];

/**
 * Devuelve el HTML del header (.v2-nav) + drawer (.v2-drawer) completos.
 * @param {Object}  [opts]
 * @param {?string} [opts.active]  key del item activo (ej. 'foro') o null. Solo marca el HEADER.
 * @param {string}  [opts.prefix]  '' (raíz) o '../' (páginas en foro/). NO se aplica al CTA (ruta absoluta).
 * @param {boolean} [opts.home]    true solo en index.html → 'contenido' usa '#contenido' local.
 * @returns {string}
 */
function renderNav({ active = null, prefix = '', home = false } = {}) {
  const hrefOf = (item) =>
    (item.key === 'contenido' && home) ? '#contenido' : prefix + item.href;

  const headerLinks = NAV_ITEMS.map((i) =>
    `      <a href="${hrefOf(i)}"${i.key === active ? ' class="active"' : ''}>${i.label}</a>`
  ).join('\n');

  const drawerLinks = NAV_ITEMS.map((i) =>
    `    <a href="${hrefOf(i)}">${i.label}</a>`   // el drawer NO marca active (comportamiento actual)
  ).join('\n');

  return `  <header class="v2-nav">
    <a href="${prefix}index.html" style="text-transform: uppercase; color: inherit; display: flex;" aria-label="Dr. Ricardo D. Frusso — inicio">${LOGO_HTML}</a>
    <nav class="v2-nav-links">
${headerLinks}
    </nav>
    <a class="v2-btn v2-btn--navy v2-nav-cta" href="${CTA.href}" style="padding: 12px 22px; font-size: 14px;">${CTA.label}</a>
    ${LANG_TOGGLE('v2-nav-cta')}
    <button class="v2-burger" id="v2-burger" aria-label="Abrir menú" type="button"><span></span><span></span><span></span></button>
  </header>
  <nav class="v2-drawer" id="v2-drawer">
${drawerLinks}
    <a class="v2-btn v2-btn--navy" href="${CTA.href}" style="border-bottom: none;">${CTA.label}</a>
    ${LANG_TOGGLE('v2-lang-toggle--drawer')}
  </nav>`;
}

module.exports = { renderNav, NAV_ITEMS, CTA, LOGO_HTML };
