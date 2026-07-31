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

  // El salto de navegación tiene que ser el PRIMER elemento enfocable de la
  // página: con 7 links + CTA + toggle de idioma delante, quien navega con
  // teclado repetía 10 tabuladas en cada página antes de llegar al contenido.
  // Destino: <main id="pit-main" tabindex="-1">, que agregan convert.js,
  // foro.js y las dos páginas manuales (index.html, curso-intro.html).
  // Visible solo al recibir foco (ver .v2-skip en pit-v2.css / index.html).
  return `  <a class="v2-skip" href="#pit-main">Saltar al contenido</a>
  <header class="v2-nav">
    <a href="${prefix}index.html" style="text-transform: uppercase; color: inherit; display: flex;" aria-label="Dr. Ricardo D. Frusso — inicio">${LOGO_HTML}</a>
    <nav class="v2-nav-links">
${headerLinks}
    </nav>
    <!-- El fallback del token es necesario: curso-intro.html no carga
         pit-v2.css, así que ahí --txt-sm no estaría definido. -->
    <a class="v2-btn v2-btn--navy v2-nav-cta" href="${CTA.href}" style="padding: 12px 22px; font-size: var(--txt-sm, 15px);">${CTA.label}</a>
    ${LANG_TOGGLE('v2-nav-cta')}
    <!-- aria-controls + aria-expanded: el burger abre y cierra #v2-drawer, pero
         se anunciaba siempre igual ("Abrir menú") estuviera abierto o cerrado.
         El JS que alterna la clase .open alterna también estos dos atributos
         y la etiqueta — está en assets/js/pit-v2.js Y, duplicado, inline en
         index.html (la home no carga pit-v2.js). Si tocás uno, tocá el otro. -->
    <button class="v2-burger" id="v2-burger" aria-label="Abrir menú" aria-controls="v2-drawer" aria-expanded="false" type="button"><span></span><span></span><span></span></button>
  </header>
  <nav class="v2-drawer" id="v2-drawer">
${drawerLinks}
    <a class="v2-btn v2-btn--navy" href="${CTA.href}" style="border-bottom: none;">${CTA.label}</a>
    ${LANG_TOGGLE('v2-lang-toggle--drawer')}
  </nav>`;
}

module.exports = { renderNav, NAV_ITEMS, CTA, LOGO_HTML };
