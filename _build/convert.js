// Conversor: fuentes del proyecto Claude Design → HTML standalone
// Modos:
//  - raw:  _dc-src/<X>.dc.html completo (extrae helmet+body, reemplaza x-import, remapea links)
//  - core: _dc-src/cores/<slug>.html (solo contenido único; se envuelve con nav/footer comunes)
// Además: style-hover="..." → clases :hover generadas.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, '_dc-src');
const { renderNav, LOGO_HTML } = require('./nav');
const { NOINDEX_META } = require('./site');   // palanca del noindex: _build/site.js

const LINKS = {
  'HomePit v2.dc.html': 'index.html',
  'Que es PIT.dc.html': 'que-es-pit.html',
  'Curso Intro PIT.dc.html': 'curso-intro.html',
  'Curso Modulo I.dc.html': 'curso-modulo-1.html',
  'Evidencia PIT.dc.html': 'evidencia.html',
  'FAQ PIT.dc.html': 'faq.html',
  'Foro PIT.dc.html': 'foro.html',
  'Contacto PIT.dc.html': 'contacto.html',
  'Sobre el Dr Frusso.dc.html': 'sobre-el-dr-frusso.html',
  'Privacidad PIT.dc.html': 'privacidad.html',
  'HomePit.dc.html': 'https://drricardofrusso.com/', // versión actual live
};

const PAGES = [
  { mode: 'raw', src: 'Que es PIT.dc.html', out: 'que-es-pit.html', active: 'que-es-pit',
    title: 'Qué es PIT · Neuroproloterapia — Dr. Ricardo D. Frusso',
    desc: 'PIT (Perineural Injection Treatment) explicado para pacientes y profesionales: cómo funciona, cómo es una sesión y qué patologías trata.' },
  { mode: 'raw', src: 'Curso Modulo I.dc.html', out: 'curso-modulo-1.html', active: 'curso',
    title: 'Curso PIT · Módulo I — Lumbalgia y Rodilla · Dr. Frusso',
    desc: 'Curso online de PIT con casos clínicos reales filmados en consultorio. Acceso permanente y certificado emitido por un instructor autorizado.' },
  { mode: 'core', src: 'cores/evidencia.html', out: 'evidencia.html', active: 'evidencia',
    title: 'Evidencia científica de PIT — Dr. Ricardo D. Frusso',
    desc: 'Ensayos, estudios comparativos y revisiones sobre PIT (neuroproloterapia), con la lectura clínica del Dr. Frusso.' },
  { mode: 'core', src: 'cores/faq.html', out: 'faq.html', active: null,
    title: 'Preguntas frecuentes sobre PIT — Dr. Ricardo D. Frusso',
    desc: 'Respuestas claras sobre PIT: dolor, cantidad de sesiones, seguridad, compatibilidad con otros tratamientos y formación profesional.' },
  { mode: 'core', src: 'cores/contacto.html', out: 'contacto.html', active: 'contacto',
    title: 'Contacto y turnos — Dr. Ricardo D. Frusso',
    desc: 'Consultorio en Belgrano, CABA (Amenabar 2446). Pedí una consulta con el Dr. Ricardo D. Frusso.' },
  { mode: 'core', src: 'cores/sobre-el-dr-frusso.html', out: 'sobre-el-dr-frusso.html', active: 'sobre',
    title: 'Sobre el Dr. Ricardo D. Frusso — 30+ años en dolor crónico',
    desc: 'Médico de Familia (UBA, 1992), 30+ años en el Hospital Italiano de Buenos Aires, instructor autorizado de PIT para América Latina desde 2015.' },
  { mode: 'core', src: 'cores/privacidad.html', out: 'privacidad.html', active: null,
    title: 'Privacidad y aviso médico — Dr. Ricardo D. Frusso',
    desc: 'Política de privacidad y aviso médico del sitio del Dr. Ricardo D. Frusso.' },
];

const COMPONENTS = {
  Logo: () => LOGO_HTML,
  Eyebrow: (a, inner) => `<p class="pit-eyebrow${a.tone === 'ink' ? ' pit-eyebrow--ink' : ''}"${sty(a)}>${inner}</p>`,
  Display: (a, inner) => `<h1 class="pit-display"${sty(a)}>${inner}</h1>`,
  Title: (a, inner) => `<h1 class="pit-title"${sty(a)}>${inner}</h1>`,
  SectionTitle: (a, inner) => `<h2 class="pit-section-title"${sty(a)}>${inner}</h2>`,
  Lead: (a, inner) => `<p class="pit-lead"${sty(a)}>${inner}</p>`,
  Body: (a, inner) => `<p class="pit-body${a.large != null ? '-l' : ''}"${sty(a)}>${inner}</p>`,
  Kicker: (a, inner) => `<span class="pit-kicker"${sty(a)}>${inner}</span>`,
  Button: (a, inner) => {
    const cls = `pit-btn ${a.variant === 'white' ? 'pit-btn--white' : 'pit-btn--primary'}${a.size === 'sm' ? ' pit-btn--sm' : ''}`;
    if (a.href != null) return `<a class="${cls}" href="${a.href}"${a.target ? ` target="${a.target}"` : ''}${sty(a)}>${inner}</a>`;
    return `<button class="${cls}" type="${a.type || 'button'}"${sty(a)}>${inner}</button>`;
  },
  Chip: (a, inner) => {
    const v = a.variant;
    const cls = `pit-chip${v === 'filled' ? ' pit-chip--filled' : v === 'blue' ? ' pit-chip--blue' : v === 'ghost' ? ' pit-chip--ghost' : ''}`;
    return `<span class="${cls}"${sty(a)}>${inner}</span>`;
  },
  Ruler: (a) => `<div class="pit-ruler"${sty(a)}><span class="pit-ruler-seg pit-ruler-seg--blue"></span></div>`,
  Pipe: (a) => `<span class="pit-pipe ${a.color === 'ink' ? 'pit-pipe--ink' : 'pit-pipe--blue'}"${sty(a)}></span>`,
  Card: (a, inner) => `<div class="pit-card${a.lift != null ? ' pit-card--lift' : ''}"${sty(a)}>${inner}</div>`,
  Section: (a, inner) => `<section class="pit-section${a.tone === 'dark' ? ' pit-section--dark' : a.tone === 'blue' ? ' pit-section--blue' : ''}"${sty(a)}><div class="pit-section-inner">${inner}</div></section>`,
};

function sty(a) {
  let s = '';
  if (a.style) s += ` style="${a.style}"`;
  if (a.class) s += ` class="${a.class}"`;
  if (a.id) s += ` id="${a.id}"`;
  return s;
}

function parseAttrs(tag) {
  const attrs = {};
  const re = /([a-zA-Z-]+)(?:="([^"]*)")?/g;
  let m;
  while ((m = re.exec(tag))) {
    if (m[1] === 'x-import') continue;
    attrs[m[1]] = m[2] !== undefined ? m[2] : '';
  }
  return attrs;
}

function replaceImports(html, warnings) {
  return html.replace(/<x-import\b([^>]*)>([\s\S]*?)<\/x-import>/g, (full, rawAttrs, inner) => {
    const attrs = parseAttrs(rawAttrs);
    const scope = attrs['component-from-global-scope'] || '';
    const name = scope.replace(/^FrussoDS\./, '');
    const fn = COMPONENTS[name];
    if (!fn) { warnings.push(`x-import desconocido: ${scope}`); return full; }
    delete attrs['component-from-global-scope'];
    delete attrs['hint-size'];
    return fn(attrs, inner.trim());
  });
}

let shCounter = 0;
function replaceStyleHover(html) {
  const rules = [];
  html = html.replace(/\sstyle-hover="([^"]*)"/g, (full, css) => {
    shCounter++;
    const cls = `sh-${shCounter}`;
    rules.push(`.${cls}:hover { ${css} }`);
    return ` data-sh="${cls}"`;
  });
  html = html.replace(/<([a-zA-Z0-9]+)([^>]*)\sdata-sh="([^"]+)"([^>]*)>/g, (full, tag, pre, cls, post) => {
    const both = pre + post;
    if (/class="/.test(both)) return `<${tag}${both.replace(/class="/, `class="${cls} `)}>`;
    return `<${tag}${both} class="${cls}">`;
  });
  return { html, css: rules.join('\n') };
}

function remapLinks(html) {
  for (const [from, to] of Object.entries(LINKS)) {
    html = html.split(`href="${from}"`).join(`href="${to}"`);
    html = html.split(`href="${from}#`).join(`href="${to}#`);
  }
  return html;
}

function replaceNavBlock(html, navHtml) {
  const re = /<header class="v2-nav">[\s\S]*?<\/header>\s*<nav class="v2-drawer">[\s\S]*?<\/nav>/;
  if (!re.test(html)) throw new Error('replaceNavBlock: bloque nav v2 (header+drawer) no encontrado en fuente raw');
  return html.replace(re, () => navHtml.trim());   // función replacer: evita interpretar $ en navHtml
}

// Envuelve el contenido de una página raw en <main id="pit-main">: es el
// destino del link "Saltar al contenido" que emite _build/nav.js, y tiene que
// existir en LAS 18 páginas. En raw el contenido va entre el bloque de nav y
// el <footer class="v2-footer">, así que se abre después de uno y se cierra
// antes del otro. tabindex="-1" es necesario: sin él, saltar al ancla mueve el
// scroll pero no el foco, y la próxima tabulada vuelve al principio del nav.
function wrapMain(html) {
  const footIdx = html.indexOf('<footer class="v2-footer">');
  if (footIdx === -1) throw new Error('wrapMain: no se encontró <footer class="v2-footer"> en fuente raw');
  const navEnd = html.indexOf('</nav>', html.indexOf('<nav class="v2-drawer"'));
  if (navEnd === -1) throw new Error('wrapMain: no se encontró el cierre del drawer en fuente raw');
  const after = navEnd + '</nav>'.length;
  return html.slice(0, after)
    + '\n\n  <main id="pit-main" tabindex="-1">\n'
    + html.slice(after, footIdx).replace(/\s+$/, '')
    + '\n  </main>\n\n  '
    + html.slice(footIdx);
}

const BASE_PAGE_CSS = `    body { margin: 0; background: #FFFFFF; }
    a { color: #2563EB; text-decoration: none; }
    a:hover { color: #1E3A8A; }`;

const FOOTER = `  <footer class="v2-footer">
    <div class="v2-footer-top">
      <nav class="v2-footer-links">
        <a href="que-es-pit.html">Qué es PIT</a>
        <a href="curso-intro.html">Curso gratis</a>
        <a href="evidencia.html">Evidencia científica</a>
        <a href="curso-modulo-1.html">Curso Módulo I</a>
        <a href="foro.html">Foro semanal</a>
        <a href="/docs/Apuntes-PIT-Neuroproloterapia-Dr-Frusso.pdf">Apuntes de PIT</a>
        <a href="sobre-el-dr-frusso.html">Sobre el Dr. Frusso</a>
        <a href="faq.html">Preguntas frecuentes</a>
      </nav>
      <div class="v2-footer-claim">
        <h3>Tratamiento del dolor crónico, desde el nervio, en cada etapa</h3>
        <div class="v2-footer-avatars">
          <img src="/img/DSC_0016.jpg" alt="Dr. Frusso">
          <img src="/img/DSC_0086.jpg" alt="Consultorio">
          <img src="/img/DSC_knee01.jpg" alt="Sesión de PIT">
        </div>
      </div>
    </div>
    <div class="v2-footer-bottom">
      <div class="v2-footer-brand"><span class="pipe"></span>Dr. Frusso</div>
      <div class="v2-footer-contact">
        <a href="mailto:ricardo.frusso@hospitalitaliano.org.ar">ricardo.frusso@hospitalitaliano.org.ar</a>
        <a href="https://www.instagram.com/drfrussoricardo">Instagram del Dr. Frusso · @drfrussoricardo</a>
        <a href="https://www.instagram.com/escueladepit/">Instagram de la Escuela de PIT · @escueladepit</a>
        <span style="color: #FFFFFF;">Amenabar 2446, Belgrano, CABA</span>
      </div>
    </div>
    <div class="v2-footer-legal">
      <span>© 2026 Dr. Ricardo D. Frusso · M.N. 86.498</span>
      <a href="privacidad.html">Privacidad y aviso médico</a>
    </div>
  </footer>`;

function extract(dc) {
  const helmet = dc.match(/<helmet>([\s\S]*?)<\/helmet>/);
  if (!helmet) throw new Error('sin <helmet>');
  const styles = [...helmet[1].matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const afterHelmet = dc.slice(dc.indexOf('</helmet>') + '</helmet>'.length);
  const endIdx = afterHelmet.indexOf('</x-dc>');
  let body = afterHelmet.slice(0, endIdx === -1 ? undefined : endIdx).trim();
  body = body.replace(/\sdata-screen-label="[^"]*"/g, '');
  return { styles, body };
}

const HEAD = (p, extraCss) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${p.desc}">
${NOINDEX_META}  <meta name="author" content="Dr. Ricardo D. Frusso">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${p.title}">
  <meta property="og:description" content="${p.desc}">
  <meta property="og:image" content="https://drricardofrusso.com/img/og-image.png">
  <meta property="og:locale" content="es_AR">
  <meta property="og:site_name" content="PIT · Dr. Frusso">
  <meta name="twitter:card" content="summary_large_image">
  <title>${p.title}</title>
  <link rel="icon" href="favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <meta name="theme-color" content="#000B33">
  <script>window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };</script>
  <script defer src="/_vercel/insights/script.js"></script>
  <script>window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };</script>
  <script defer src="/_vercel/speed-insights/script.js"></script>
  <link rel="stylesheet" href="assets/css/fonts.css?v=2">
  <link rel="stylesheet" href="assets/css/ds.css?v=2">
  <link rel="stylesheet" href="assets/css/pit-mobile.css?v=2">
  <link rel="stylesheet" href="assets/css/pit-motion.css?v=2">
  <link rel="stylesheet" href="assets/css/pit-v2.css?v=2">
  <style>
${extraCss}
  </style>
</head>
<body>
`;

const FOOT = `
<script src="assets/js/pit-forms.js?v=2"></script>
<script src="assets/js/pit-v2.js?v=2"></script>
<script src="assets/js/pit-motion.js?v=2"></script>
<script src="assets/js/pit-chat.js?v=2"></script>
<script src="assets/js/pit-scrolltop.js?v=2"></script>
<script src="assets/js/pit-lang.js?v=2"></script>
</body>
</html>
`;

let failed = false;
for (const p of PAGES) {
  const srcPath = path.join(SRC, p.src);
  if (!fs.existsSync(srcPath)) { console.log(`SKIP (falta fuente): ${p.src}`); continue; }
  try {
    const raw = fs.readFileSync(srcPath, 'utf8');
    const warnings = [];
    let body, styles;

    if (p.mode === 'raw') {
      const ex = extract(raw);
      styles = ex.styles;
      body = wrapMain(replaceNavBlock(ex.body, renderNav({ active: p.active })));
    } else {
      // core: extraer <style data-page> opcional y envolver con chrome común
      let core = raw;
      const pageStyle = core.match(/<style data-page>([\s\S]*?)<\/style>/);
      styles = BASE_PAGE_CSS + (pageStyle ? '\n' + pageStyle[1] : '');
      if (pageStyle) core = core.replace(pageStyle[0], '');
      // <main id="pit-main">: destino del link "Saltar al contenido" de nav.js.
      // tabindex="-1" para que el salto mueva el foco y no solo el scroll.
      body = `<div style="font-family: var(--pit-font-sans); color: var(--pit-ink); background: var(--pit-paper);">\n\n${renderNav({ active: p.active })}\n\n  <main id="pit-main" tabindex="-1">\n  ${core.trim()}\n  </main>\n\n${FOOTER}\n\n</div>`;
    }

    body = replaceImports(body, warnings);
    const sh = replaceStyleHover(body);
    body = sh.html;
    const extraCss = styles + (sh.css ? '\n/* hover generados */\n' + sh.css : '');
    body = remapLinks(body);

    const out = HEAD(p, extraCss) + body + FOOT;
    fs.writeFileSync(path.join(ROOT, p.out), out);
    console.log(`OK  ${p.out}  (${(out.length / 1024).toFixed(1)} KB)${warnings.length ? '  ⚠ ' + warnings.join('; ') : ''}`);
    if (/<x-import/.test(out)) { console.log(`   ⚠ quedan x-import sin resolver en ${p.out}`); failed = true; }
  } catch (e) {
    console.error(`FAIL ${p.src}: ${e.message}`);
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
