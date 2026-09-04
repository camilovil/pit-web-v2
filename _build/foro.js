// Generador del portal del foro: _content/foro/*.md → foro.html + foro/<slug>.html
// Uso: node _build/foro.js
// ESCALA TIPOGRÁFICA: las plantillas de acá usan los 6 pasos
// (--txt-2xs 11 / --txt-xs 13 / --txt-sm 15 / --txt-md 17 / --txt-lg 21 /
// --txt-xl 24) que definen index.html y assets/css/pit-v2.css. Sin fallback en
// px porque todas las páginas del foro SÍ cargan pit-v2.css.
// REGLA: no escribir un font-size suelto acá. Las únicas excepciones son los
// tres tamaños de titular (34/40/46px): son display, dependen del ancho de la
// pieza y no de la escala de texto.
// Frontmatter: titulo, slug, tipo (qa|caso|articulo), categoria (pyr|caso|evidencia|consejos|noticias),
//              audiencia (pacientes|profesionales|todos), semana, fecha, fechaLabel, lectura, tags, resumen, portada
// Cuerpo (markdown mínimo): párrafos, "## " títulos, **negrita**, [link](url),
//   ![alt](src "CAPTION") → figura, "> texto" → callout Idea clave,
//   [[placeholder: texto]] → caja punteada de contenido pendiente,
//   [[carrusel: /img/a.webp | /img/b.webp | …]] → galería deslizable de piezas
//     verticales (4:5), pensada para el carrusel de Instagram de un curso,
//   [[video: <url de YouTube> | Título]] → video embebido 16:9.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONTENT = path.join(ROOT, '_content', 'foro');
const OUTDIR = path.join(ROOT, 'foro');
const { renderNav } = require('./nav');
const { NOINDEX_META } = require('./site');   // palanca del noindex: _build/site.js

// Las tablas de etiquetas, el escape y el parser del frontmatter viven en
// _build/foro-posts.js: la home también los necesita para mostrar las últimas
// publicaciones, y una segunda copia era exactamente el problema que este repo
// ya paga con las dos copias del CSS. Un slug se convierte en nombre de archivo
// (foro/<slug>.html) y en URL, así que SLUG_RE lo acota a lo seguro en los dos
// lados: sin puntos, sin barras, sin mayúsculas, sin acentos.
const { CAT, CAT_SHORT, AUD, TIPO, SLUG_RE, EVENTO_REQ, EVENTO_OPC, esc, esCurso, parsePost, loadPosts } = require('./foro-posts');

// ---------- esquemas de URL permitidos ----------
// El sitio no tiene CSP (ver README): si un href sale con javascript:, el
// enlace es funcional y no hay segunda línea de defensa. Se permiten http,
// https, mailto, anclas y relativos — que es todo lo que un post necesita.
const ESQUEMAS_OK = ['http:', 'https:', 'mailto:'];
function urlSegura(url) {
  // Los navegadores ignoran espacios y caracteres de control DENTRO del
  // esquema: "java\tscript:alert(1)" se ejecuta. Se limpian antes de mirar.
  const limpia = String(url || '').split('').filter(function (c) { var n = c.charCodeAt(0); return n > 32 && n !== 127; }).join('');
  if (!limpia) return false;
  const m = limpia.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (!m) return true;                       // relativo o ancla (#, ./, /img/…)
  return ESQUEMAS_OK.includes(m[1].toLowerCase() + ':');
}

// ---------- validación ----------
// Antes, un campo mal tipeado no daba error: `categoria: pyrr` imprimía la
// palabra "undefined" en la página, una `audiencia` inválida idem, una `portada`
// que falta dejaba src="undefined" y un `slug` ausente escribía el archivo
// undefined.html. Todo eso llegaba al sitio publicado sin una sola advertencia.
// Ahora corta el build nombrando archivo y campo.
function validar(posts) {
  const errores = [];
  const err = (p, campo, msg) => errores.push(`${p.file} · ${campo}: ${msg}`);
  const vistos = new Map();

  for (const p of posts) {
    // --- slug: es nombre de archivo Y URL ---
    if (!p.slug) err(p, 'slug', 'falta (el archivo saldría como "undefined.html")');
    else if (!SLUG_RE.test(p.slug)) err(p, 'slug', `"${p.slug}" no es un slug válido (minúsculas, números y guiones: "mi-post")`);
    else if (vistos.has(p.slug)) err(p, 'slug', `"${p.slug}" ya lo usa ${vistos.get(p.slug)} — uno de los dos pisaría al otro sin aviso`);
    else vistos.set(p.slug, p.file);

    // --- campos de texto obligatorios ---
    for (const campo of ['titulo', 'resumen', 'semana', 'fechaLabel']) {
      if (!String(p[campo] || '').trim()) err(p, campo, 'falta');
    }

    // --- tablas ---
    if (!p.categoria) err(p, 'categoria', `falta (una de: ${Object.keys(CAT).join(', ')})`);
    else if (!(p.categoria in CAT)) err(p, 'categoria', `"${p.categoria}" no existe — usá una de: ${Object.keys(CAT).join(', ')}`);

    if (!p.audiencia) err(p, 'audiencia', `falta (una de: ${Object.keys(AUD).join(', ')})`);
    else if (!(p.audiencia in AUD)) err(p, 'audiencia', `"${p.audiencia}" no existe — usá una de: ${Object.keys(AUD).join(', ')}`);

    if (!p.tipo) err(p, 'tipo', `falta (una de: ${TIPO.join(', ')})`);
    else if (!TIPO.includes(p.tipo)) err(p, 'tipo', `"${p.tipo}" no existe — usá una de: ${TIPO.join(', ')}`);

    // --- fecha: ordena las publicaciones y decide cuál es la destacada ---
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(p.fecha || ''))) {
      err(p, 'fecha', `"${p.fecha}" no es AAAA-MM-DD (de acá sale el orden del archivo y cuál es la destacada)`);
    }

    if (!Number.isFinite(p.lectura) || p.lectura <= 0) err(p, 'lectura', `"${p.lectura}" no es un número de minutos válido`);

    // --- portada: cualquier post puede ser el destacado, así que la necesitan todos ---
    if (!p.portada) err(p, 'portada', 'falta (el destacado del índice saldría con src="undefined")');
    else if (!urlSegura(p.portada)) err(p, 'portada', `"${p.portada}" usa un esquema no permitido`);
    else if (p.portada.startsWith('/') && !fs.existsSync(path.join(ROOT, p.portada.slice(1)))) {
      err(p, 'portada', `"${p.portada}" no existe en el repo`);
    }

    // --- anuncio de curso: o están todos los campos, o no está ninguno ---
    // Estos posts alimentan el bloque de cursos de la home. Con un campo a
    // medias, la tarjeta saldría con un hueco o con "undefined" y el error
    // recién se vería en la home publicada.
    const eventoPresentes = [...EVENTO_REQ, ...EVENTO_OPC].filter(c => String(p[c] || '').trim());
    if (eventoPresentes.length) {
      const faltan = EVENTO_REQ.filter(c => !String(p[c] || '').trim());
      if (faltan.length) {
        err(p, 'evento', `trae ${eventoPresentes.join(', ')} pero le falta ${faltan.join(', ')} — o están todos los campos del curso, o ninguno`);
      }
      if (p.eventoFecha && !/^\d{4}-\d{2}-\d{2}$/.test(String(p.eventoFecha))) {
        err(p, 'eventoFecha', `"${p.eventoFecha}" no es AAAA-MM-DD (de acá sale el orden de los cursos en la home)`);
      }
      if (p.eventoAcento && !/^#[0-9a-fA-F]{6}$/.test(String(p.eventoAcento))) {
        err(p, 'eventoAcento', `"${p.eventoAcento}" no es un color #rrggbb (va a un atributo style de la home)`);
      }
    }

    // --- links e imágenes del cuerpo: esquema permitido ---
    let m;
    const links = /\[([^\]]+)\]\(([^)]+)\)/g;
    while ((m = links.exec(p.body))) {
      if (!urlSegura(m[2])) err(p, 'cuerpo', `el link "${m[1]}" apunta a "${m[2]}" — solo se permiten http, https, mailto, anclas y rutas relativas`);
    }
    const imgs = /!\[([^\]]*)\]\(([^)\s]+)/g;
    while ((m = imgs.exec(p.body))) {
      if (!urlSegura(m[2])) err(p, 'cuerpo', `la imagen "${m[1]}" apunta a "${m[2]}" — esquema no permitido`);
    }
  }
  return errores;
}

function inline(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // El href pasa por la whitelist de esquemas. Si no la pasa, se cae el
    // enlace y queda el texto: nunca se emite un href que no sabemos que es
    // seguro. La validación ya cortó el build antes de llegar acá — esto es la
    // segunda vuelta de llave, para que ningún camino nuevo la esquive.
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (full, txt, url) =>
      urlSegura(url) ? `<a href="${esc(url)}">${txt}</a>` : txt);
}

function mdToHtml(body) {
  const blocks = body.split(/\n\n+/);
  return blocks.map(b => {
    b = b.trim();
    if (!b) return '';
    if (b.startsWith('## ')) {
      return `<h2 style="font-size: var(--txt-xl); font-weight: 600; margin: 0 0 12px;"><span class="hover-underline">${inline(b.slice(3))}</span></h2>`;
    }
    // [[video: url | título]] — un video de YouTube embebido.
    // Se embebe desde youtube-nocookie.com: el sitio tiene pagina de privacidad
    // y no hay motivo para que YouTube ponga cookies de seguimiento a quien
    // solo abrio un articulo. El ID se valida contra una lista de caracteres
    // antes de entrar a la URL — es lo unico del bloque que termina siendo una
    // direccion, y una barra o un ? ahi cambiarian el destino del iframe.
    const vid = b.match(/^\[\[video:\s*([\s\S]+?)\]\]$/);
    if (vid) {
      const partes = vid[1].split('|').map(x => x.trim());
      const url = partes[0] || '';
      const titulo = partes[1] || 'Video';
      const m = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/)([A-Za-z0-9_-]{6,20})/);
      if (!m) return '';
      return `<figure style="margin: 0 0 28px;">
          <div style="position: relative; aspect-ratio: 16 / 9; border-radius: var(--pit-radius); overflow: hidden; background: var(--pit-ink-05);">
            <iframe src="https://www.youtube-nocookie.com/embed/${m[1]}" title="${esc(titulo)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; encrypted-media; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
          </div>
          <figcaption style="font-family: var(--pit-font-mono); font-size: var(--txt-2xs); letter-spacing: 0.06em; text-transform: uppercase; color: var(--pit-ink-40); margin-top: 10px;">${esc(titulo)}</figcaption>
        </figure>`;
    }

    // [[carrusel: src | src | …]] — galería deslizable de piezas 4:5.
    // Las piezas del carrusel llevan su texto QUEMADO en la imagen, así que el
    // artículo NUNCA depende de ellas para decir algo: lo que cuentan ya está
    // escrito arriba en texto de verdad. Por eso van con alt="" y con un
    // rótulo que aclara qué son. Es una galería, no una fuente de información.
    const car = b.match(/^\[\[carrusel:\s*([\s\S]+?)\]\]$/);
    if (car) {
      const srcs = car[1].split('|').map(x => x.trim()).filter(Boolean).filter(urlSegura);
      if (!srcs.length) return '';
      // El ancho de cada pieza va en % del track, NUNCA en vw: con vw, si algo
      // desborda, el ancho del viewport crece, las piezas crecen con el y
      // desbordan mas. El min-width: 0 y el max-width: 100% del track son los
      // que evitan que empuje el ancho de la pagina en vez de scrollear adentro.
      const slides = srcs.map((src) => `<img src="${esc(src)}" alt="" loading="lazy" decoding="async" width="1080" height="1350" style="scroll-snap-align: center; width: 300px; max-width: 76%; height: auto; aspect-ratio: 4 / 5; object-fit: cover; border-radius: var(--pit-radius); flex: 0 0 auto; background: var(--pit-ink-05);">`).join('\n            ');
      return `<figure class="foro-carrusel" style="margin: 0 0 28px; max-width: 100%; min-width: 0;">
          <div class="foro-carrusel-track" style="display: flex; gap: 14px; overflow-x: auto; max-width: 100%; min-width: 0; scroll-snap-type: x mandatory; overscroll-behavior-x: contain; padding: 2px 0 6px;">
            ${slides}
          </div>
          <figcaption style="font-family: var(--pit-font-mono); font-size: var(--txt-2xs); letter-spacing: 0.06em; text-transform: uppercase; color: var(--pit-ink-40); margin-top: 10px;">${srcs.length} piezas · deslizá para verlas</figcaption>
        </figure>`;
    }

    const ph = b.match(/^\[\[placeholder:\s*([\s\S]+?)\]\]$/);
    if (ph) {
      return `<div style="margin: 0 0 28px;"><div class="ph" style="min-height: 110px;"><span>Placeholder · ${esc(ph[1])}</span></div></div>`;
    }
    const img = b.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
    if (img) {
      // src pasa por la whitelist igual que los links; alt y caption van a un
      // atributo y a texto: escapados los dos.
      const src = urlSegura(img[2]) ? esc(img[2]) : '';
      return `<figure style="margin: 0 0 28px;">
          <img src="${src}" alt="${esc(img[1])}" style="width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: var(--pit-radius); display: block;">
          ${img[3] ? `<figcaption style="font-family: var(--pit-font-mono); font-size: var(--txt-2xs); letter-spacing: 0.06em; text-transform: uppercase; color: var(--pit-ink-40); margin-top: 10px;">${esc(img[3])}</figcaption>` : ''}
        </figure>`;
    }
    if (b.startsWith('> ')) {
      const quote = b.split('\n').map(l => l.replace(/^>\s?/, '')).join(' ');
      return `<div style="background: var(--pit-blue-tint); border-left: 3px solid var(--pit-blue); border-radius: var(--pit-radius); padding: 20px 24px; margin: 0 0 28px;">
          <span style="font-family: var(--pit-font-mono); font-size: var(--txt-2xs); letter-spacing: 0.1em; text-transform: uppercase; color: var(--pit-blue);">Idea clave</span>
          <p style="font-size: var(--txt-md); line-height: 1.6; font-weight: 500; margin: 8px 0 0;">${inline(quote)}</p>
        </div>`;
    }
    return `<p style="font-size: var(--txt-md); line-height: 1.7; color: var(--pit-ink-60); margin: 0 0 16px;">${inline(b.replace(/\n/g, ' '))}</p>`;
  }).filter(Boolean).join('\n\n        ');
}

// ---------- chrome compartido ----------
const FOOTER = (pre) => `  <footer class="v2-footer">
    <div class="v2-footer-top">
      <nav class="v2-footer-links">
        <a href="${pre}que-es-pit.html">Qué es PIT</a>
        <a href="${pre}curso-intro.html">Curso gratis</a>
        <a href="${pre}evidencia.html">Evidencia científica</a>
        <a href="${pre}curso-modulo-1.html">Curso Módulo I</a>
        <a href="${pre}foro.html">Foro semanal</a>
        <a href="/docs/Apuntes-PIT-Neuroproloterapia-Dr-Frusso.pdf">Apuntes de PIT</a>
        <a href="${pre}sobre-el-dr-frusso.html">Sobre el Dr. Frusso</a>
        <a href="${pre}faq.html">Preguntas frecuentes</a>
      </nav>
      <div class="v2-footer-claim">
        <h3>Tratamiento del dolor crónico: de la inyección subcutánea al resultado profundo</h3>
        <div class="v2-footer-avatars">
          <img src="/img/DSC_0016.webp" alt="Dr. Frusso">
          <img src="/img/DSC_0086.webp" alt="Consultorio">
          <img src="/img/DSC_knee01.webp" alt="Sesión de PIT">
        </div>
      </div>
    </div>
    <div class="v2-footer-bottom">
      <div class="v2-footer-brand"><span class="pipe"></span>Dr. Frusso</div>
      <div class="v2-footer-contact">
        <a href="mailto:ricardo.frusso@hospitalitaliano.org.ar">ricardo.frusso@hospitalitaliano.org.ar</a>
        <span style="color: #FFFFFF;">Consultorio: Amenabar 2446, Belgrano, CABA</span>
        <a href="https://www.instagram.com/drfrussoricardo">Instagram del Dr. Frusso · @drfrussoricardo</a>
        <a href="https://www.instagram.com/escueladepit/">Instagram de la Escuela de PIT · @escueladepit</a>
      </div>
    </div>
    <div class="v2-footer-legal">
      <span>© 2026 Dr. Ricardo D. Frusso · M.N. 86.498</span>
      <a href="${pre}privacidad.html">Privacidad y aviso médico</a>
    </div>
  </footer>`;

// title y desc vienen del frontmatter (titulo/resumen) y caen en tres atributos
// y en <title>. Se escapan ACÁ, en el único lugar por donde pasan los dos
// generadores de página: una comilla doble suelta cerraba el atributo y desde
// ahí el <head> quedaba desarmado.
const HEAD = (pre, rawTitle, rawDesc, extraCss = '', portada = '') => {
  const title = esc(rawTitle);
  const desc = esc(rawDesc);
  // og:image tiene que ser absoluta: las redes no resuelven rutas relativas.
  // `portada` viene del frontmatter y ya pasó por urlSegura() en validar().
  const ogImg = portada && portada.startsWith('/')
    ? `https://drricardofrusso.com${portada}`
    : (portada || 'https://drricardofrusso.com/img/og-image.png');
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${desc}">
${NOINDEX_META}  <meta name="author" content="Dr. Ricardo D. Frusso">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${esc(ogImg)}">
  <meta property="og:locale" content="es_AR">
  <meta property="og:site_name" content="PIT · Dr. Frusso">
  <meta name="twitter:card" content="summary_large_image">
  <title>${title}</title>
  <link rel="icon" href="${pre}favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="${pre}apple-touch-icon.png">
  <meta name="theme-color" content="#000B33">
  <script>window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };</script>
  <script defer src="/_vercel/insights/script.js"></script>
  <script>window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };</script>
  <script defer src="/_vercel/speed-insights/script.js"></script>
  <link rel="stylesheet" href="${pre}assets/css/fonts.css?v=2">
  <link rel="stylesheet" href="${pre}assets/css/ds.css?v=2">
  <link rel="stylesheet" href="${pre}assets/css/pit-mobile.css?v=2">
  <link rel="stylesheet" href="${pre}assets/css/pit-motion.css?v=2">
  <link rel="stylesheet" href="${pre}assets/css/pit-v2.css?v=2">
  <style>
    body { margin: 0; background: #FFFFFF; }
    a { color: #2563EB; text-decoration: none; }
    a:hover { color: #1E3A8A; }
    .ph { border: 1.5px dashed var(--pit-ink-20); border-radius: var(--pit-radius); background: var(--pit-ink-05); display: flex; flex-direction: column; gap: 6px; align-items: center; justify-content: center; text-align: center; padding: 24px; }
    .ph span { font-family: var(--pit-font-mono); font-size: var(--txt-2xs); letter-spacing: 0.08em; text-transform: uppercase; color: var(--pit-ink-40); }
${extraCss}
  </style>
</head>
<body>
`;
};

const FOOT = (pre) => `
<script src="${pre}assets/js/pit-forms.js?v=2"></script>
<script src="${pre}assets/js/pit-v2.js?v=2"></script>
<script src="${pre}assets/js/pit-motion.js?v=2"></script>
<script src="${pre}assets/js/pit-chat.js?v=2"></script>
<script src="${pre}assets/js/pit-scrolltop.js?v=2"></script>
<script src="${pre}assets/js/pit-lang.js?v=2"></script>
</body>
</html>
`;

// ---------- página de publicación ----------
function renderPost(post, posts, idx) {
  const pre = '../';
  const older = posts[idx + 1];
  const others = posts.filter(p => p !== post).slice(0, 3);
  const isQA = post.tipo === 'qa';
  const byline = isQA ? 'Responde el Dr. Ricardo D. Frusso' : 'Por el Dr. Ricardo D. Frusso';
  // CAT_SHORT/AUD/CAT salen de las tablas de este archivo (y validar() ya
  // garantizó que la clave existe): son seguros. Lo que viene del frontmatter
  // —semana, fechaLabel, titulo, tags, slug— va escapado.
  const catLine = `${esc(post.semana)} · ${esc(post.fechaLabel)} · ${CAT_SHORT[post.categoria]} · ${AUD[post.audiencia]}`;

  const chips = [
    `<span class="pit-chip pit-chip--blue">${isQA ? 'Pregunta de ' + (post.audiencia === 'profesionales' ? 'profesional' : 'paciente') : CAT[post.categoria]}</span>`,
    ...post.tags.map(t => `<span class="pit-chip">${esc(t)}</span>`),
  ].join('\n          ');

  // La galería solo necesita su CSS en los posts que la usan.
  const carruselCss = /\[\[carrusel:/.test(post.body)
    ? `    .foro-carrusel-track { scrollbar-width: none; -ms-overflow-style: none; }
    .foro-carrusel-track::-webkit-scrollbar { display: none; }
    @media (prefers-reduced-motion: no-preference) { .foro-carrusel-track { scroll-behavior: smooth; } }`
    : '';
  return HEAD(pre, `${post.titulo} — Foro PIT · Dr. Frusso`, post.resumen, carruselCss, post.portada) + `
<div style="font-family: var(--pit-font-sans); color: var(--pit-ink); background: var(--pit-paper);">

${renderNav({ active: 'foro', prefix: pre })}

  <!-- <main id="pit-main">: destino del link "Saltar al contenido" de nav.js,
       tiene que existir en las 18 páginas. tabindex="-1" para que el salto
       mueva el foco y no solo el scroll. -->
  <main id="pit-main" tabindex="-1">

  <!-- breadcrumb -->
  <div style="border-bottom: 1px solid var(--pit-ink-10); background: var(--pit-paper);">
    <div style="max-width: var(--pit-content-max); margin: 0 auto; display: flex; align-items: center; gap: 20px; padding: 12px 24px; flex-wrap: wrap;">
      <a href="${pre}foro.html" style="font-family: var(--pit-font-mono); font-size: var(--txt-xs); letter-spacing: 0.06em; text-transform: uppercase;">← Foro PIT</a>
      <span style="font-family: var(--pit-font-mono); font-size: var(--txt-xs); letter-spacing: 0.06em; text-transform: uppercase; color: var(--pit-ink-40);">${catLine}</span>
    </div>
  </div>

  <!-- encabezado -->
  <section style="padding: var(--pit-section-padding); background: var(--pit-paper);">
    <div style="max-width: var(--pit-content-max); margin: 0 auto;">
      <div class="pit-ruler"><span class="pit-ruler-seg pit-ruler-seg--blue"></span></div>
      <div style="padding-top: 40px; max-width: 62ch;">
        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
          ${chips}
        </div>
        <h1 class="m-title" style="font-size: 46px; font-weight: 600; line-height: 1.1; margin: 0 0 22px;">${esc(post.titulo)}</h1>
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="font-family: var(--pit-font-mono); font-size: var(--txt-xs); letter-spacing: 0.06em; text-transform: uppercase; color: var(--pit-ink-60);">${byline}</span>
          <span class="pit-pipe pit-pipe--blue" style="display: inline-block; width: 3px; height: 1em; background: var(--pit-blue); border-radius: 2px;"></span>
          <span style="font-family: var(--pit-font-mono); font-size: var(--txt-xs); letter-spacing: 0.06em; text-transform: uppercase; color: var(--pit-ink-40);">${esc(post.fechaLabel)} · ${post.lectura} min de lectura</span>
        </div>
      </div>
    </div>
  </section>

  <!-- cuerpo -->
  <section style="padding: var(--pit-section-padding); padding-top: 0; background: var(--pit-paper);">
    <div class="m-stack" style="max-width: var(--pit-content-max); margin: 0 auto; display: grid; grid-template-columns: 1.7fr 1fr; gap: 64px; align-items: start;">
      <!-- min-width: 0 porque este <article> es un item de grid (.m-stack).
           Con el min-width: auto que traen los items por defecto, un hijo
           ancho -una galeria, una tabla, un bloque de codigo- lo estira
           hasta su propio ancho y empuja el ancho de TODA la pagina en
           mobile, en vez de scrollear adentro de si mismo. -->
      <article style="max-width: 68ch; min-width: 0;">
        ${mdToHtml(post.body)}

        <div style="display: flex; align-items: center; gap: 14px; border-top: 2px solid var(--pit-ink); padding-top: 20px; margin-top: 28px;">
          <span style="display: inline-block; width: 3px; height: 34px; background: var(--pit-blue); border-radius: 2px;"></span>
          <div>
            <div style="font-weight: 600; font-size: var(--txt-sm);">Dr. Ricardo D. Frusso</div>
            <div style="font-family: var(--pit-font-mono); font-size: var(--txt-2xs); letter-spacing: 0.06em; text-transform: uppercase; color: var(--pit-ink-40);">M.N. 86.498 · Instructor autorizado PIT</div>
          </div>
        </div>
      </article>

      <aside style="display: grid; gap: 24px; position: sticky; top: 90px;">
        <div style="background: var(--pit-blue-tint); border: 1px solid var(--pit-blue); border-radius: var(--pit-radius); padding: 26px 28px;">
          <h3 style="font-size: var(--txt-lg); font-weight: 600; margin: 0 0 8px;">¿Tenés una pregunta?</h3>
          <p style="font-size: var(--txt-sm); line-height: 1.6; color: var(--pit-ink-60); margin: 0 0 18px;">Se modera y se publica sin datos personales. Si dejás tu email, te avisamos cuando salga la respuesta.</p>
          <a class="pit-btn pit-btn--primary" href="${pre}foro.html#pregunta">Enviar pregunta</a>
        </div>
        <div style="background: var(--pit-paper-pure); border: 1px solid var(--pit-ink-10); border-radius: var(--pit-radius); padding: 26px 28px;">
          <span style="font-family: var(--pit-font-mono); font-size: var(--txt-2xs); letter-spacing: 0.1em; text-transform: uppercase; color: var(--pit-blue);">Seguí leyendo</span>
          <div style="display: grid; margin-top: 8px;">
            ${others.map((o, i) => `<a href="${esc(o.slug)}.html" class="sh-post" style="font-size: var(--txt-sm); font-weight: 600; line-height: 1.4; color: var(--pit-ink); padding: 12px 0;${i < others.length - 1 ? ' border-bottom: 1px solid var(--pit-ink-10);' : ''}">${esc(o.titulo)}</a>`).join('\n            ')}
          </div>
        </div>
      </aside>
    </div>
  </section>

  <!-- anterior / archivo -->
  <section style="background: var(--pit-paper-pure); border-top: 1px solid var(--pit-ink-10); padding: 0 24px;">
    <div class="m-stack" style="max-width: var(--pit-content-max); margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 0;">
      ${older ? `<a href="${esc(older.slug)}.html" class="sh-post" style="padding-block: 28px; padding-inline: 0 24px; color: var(--pit-ink); border-inline-end: 1px solid var(--pit-ink-10);">
        <span style="font-family: var(--pit-font-mono); font-size: var(--txt-2xs); letter-spacing: 0.1em; text-transform: uppercase; color: var(--pit-ink-40);">← Anterior · ${esc(older.semana)}</span>
        <div style="font-size: var(--txt-md); font-weight: 600; margin-top: 6px;">${esc(older.titulo)}</div>
      </a>` : '<span style="border-inline-end: 1px solid var(--pit-ink-10);"></span>'}
      <a href="${pre}foro.html" class="sh-post" style="padding-block: 28px; padding-inline: 24px 0; text-align: end; color: var(--pit-ink);">
        <span style="font-family: var(--pit-font-mono); font-size: var(--txt-2xs); letter-spacing: 0.1em; text-transform: uppercase; color: var(--pit-ink-40);">Archivo completo →</span>
        <div style="font-size: var(--txt-md); font-weight: 600; margin-top: 6px;">Todas las publicaciones del foro</div>
      </a>
    </div>
  </section>
  <style>.sh-post, .sh-post div { transition: color 0.22s ease; }
    .sh-post:hover, .sh-post:hover div { color: var(--pit-blue); }</style>

  <!-- descargo -->
  <div style="background: var(--pit-ink-05); padding: 18px 24px;">
    <p style="max-width: var(--pit-content-max); margin: 0 auto; font-family: var(--pit-font-mono); font-size: var(--txt-2xs); letter-spacing: 0.06em; line-height: 1.8; text-transform: uppercase; color: var(--pit-ink-40);">Este contenido es informativo y no reemplaza una consulta médica. Cada caso requiere evaluación profesional individual.</p>
  </div>

  </main>

${FOOTER(pre)}

</div>
` + FOOT(pre);
}

// ---------- índice del foro ----------
function renderIndex(posts) {
  const pre = '';
  const featured = posts[0];
  const rest = posts.slice(1);
  // Total UNICO para el contador: las publicaciones del archivo (todas menos
  // la destacada de la semana, que se muestra aparte arriba).
  const ARCHIVO = rest.length;
  const isQA = featured.tipo === 'qa';

  const rows = rest.map(p => `        <a href="foro/${esc(p.slug)}.html" class="m-list foro-row" data-cat="${esc(p.categoria)}" data-aud="${esc(p.audiencia)}" style="display: grid; grid-template-columns: 170px 200px 1fr auto; gap: 24px; align-items: baseline; padding: 22px 8px; border-bottom: 1px solid var(--pit-ink-10); color: var(--pit-ink);">
          <span style="font-family: var(--pit-font-mono); font-size: var(--txt-xs); letter-spacing: 0.06em; color: var(--pit-ink-40);">${esc(p.semana)} · ${esc(p.fechaLabel.replace(' 2026', ''))}</span>
          <span style="font-family: var(--pit-font-mono); font-size: var(--txt-2xs); letter-spacing: 0.1em; text-transform: uppercase; color: var(--pit-blue);">${CAT_SHORT[p.categoria]} · ${AUD[p.audiencia]}</span>
          <span style="font-size: var(--txt-md); font-weight: 600;">${esc(p.titulo)}</span>
          <span style="font-family: var(--pit-font-mono); font-size: var(--txt-xs); color: var(--pit-blue);">Leer →</span>
        </a>`).join('\n');

  const catChips = [['todo', 'Todo'], ['pyr', 'Preguntas y respuestas'], ['caso', 'Casos clínicos'], ['evidencia', 'Evidencia'], ['consejos', 'Consejos'], ['noticias', 'Noticias']]
    .map(([k, label]) => `<button type="button" class="foro-filter${k === 'todo' ? ' on' : ''}" data-fcat="${k}" aria-pressed="${k === 'todo'}">${label}</button>`)
    .join('\n        ');
  const audChips = [['pacientes', 'Pacientes'], ['profesionales', 'Profesionales']]
    .map(([k, label]) => `<button type="button" class="foro-filter" data-faud="${k}" aria-pressed="false">${label}</button>`)
    .join('\n          ');

  const filterCss = `    .foro-filter { font-family: var(--pit-font-mono); font-size: var(--txt-2xs); letter-spacing: 0.08em; text-transform: uppercase; padding: 8px 16px; border-radius: 999px; border: 1px solid var(--pit-ink-20); background: var(--pit-paper-pure); color: var(--pit-ink-60); cursor: pointer; transition: all 0.2s ease; }
    .foro-filter:hover { border-color: var(--pit-blue); color: var(--pit-blue); }
    .foro-filter.on { background: var(--pit-ink); border-color: var(--pit-ink); color: #FFFFFF; }
    .foro-row:hover { color: var(--pit-ink); }
    .foro-row.hide { display: none !important; }
    /* El error del form del foro va sobre el navy de la sección: el rojo del
       token claro caería a ~2:1 ahí, así que usa la variante --pit-error-on-dark
       (8.4:1 sobre #000B33). El uppercase vive en el CSS y no en el texto: así
       el mensaje se escribe en caso natural y un lector de pantalla no lo
       deletrea letra por letra. */
    .foro-hint { font-family: var(--pit-font-mono); font-size: var(--txt-2xs); letter-spacing: 0.06em; line-height: 1.5; text-transform: uppercase; color: var(--pit-error-on-dark); }
    .foro-hint:empty { display: none; }
    #foro-q[aria-invalid="true"], #foro-email[aria-invalid="true"] { border-color: var(--pit-error-on-dark); }
    /* "Enviar otra pregunta" era un <span> con cursor:pointer: parecía control
       pero no recibía foco ni respondía a Enter. */
    .foro-linkbtn { font-family: var(--pit-font-mono); font-size: var(--txt-xs); letter-spacing: 0.06em; text-transform: uppercase; color: var(--pit-ink-20); background: none; border: none; border-bottom: 1px solid var(--pit-ink-20); padding: 0 0 2px; cursor: pointer; }
    .foro-linkbtn:hover { color: #FFFFFF; border-bottom-color: #FFFFFF; }
    /* Etiquetas y notas del form, que vive sobre el navy de la sección.
       Antes usaban --pit-ink-40 (#5F6C78), el gris pensado para fondo claro:
       sobre #000B33 daba 3.3:1, por debajo del mínimo. --pit-ink-20 da 10.4:1
       y es el mismo gris claro que ya usa el cuerpo de esa sección. */
    .foro-label { display: block; font-family: var(--pit-font-mono); font-size: var(--txt-2xs); letter-spacing: 0.08em; text-transform: uppercase; color: var(--pit-ink-20); margin-bottom: 8px; }
    .foro-nota { font-family: var(--pit-font-mono); font-size: var(--txt-2xs); letter-spacing: 0.04em; line-height: 1.7; color: var(--pit-ink-20); }
    /* nowrap solo desde 720px: abajo de eso el texto del contador no entra
       al lado del título y empujaba la página fuera de pantalla. */
    .foro-count { font-family: var(--pit-font-mono); font-size: var(--txt-xs); letter-spacing: 0.06em; text-transform: uppercase; color: var(--pit-ink-40); }
    @media (min-width: 720px) { .foro-count { white-space: nowrap; } }`;
  // Nota: el resto del hover de .foro-row (fondo, lift, sombra) vive en
  // assets/css/pit-motion.css — una sola fuente, y ahí respeta
  // prefers-reduced-motion. Acá solo queda el color del texto.

  return HEAD(pre, 'Foro PIT — noticias, casos y respuestas · Dr. Frusso',
    'Portal del foro PIT: preguntas respondidas, casos clínicos, evidencia y noticias del método, por el Dr. Ricardo D. Frusso.', filterCss) + `
<div style="font-family: var(--pit-font-sans); color: var(--pit-ink); background: var(--pit-paper);">

${renderNav({ active: 'foro', prefix: pre })}

  <!-- <main id="pit-main">: destino del link "Saltar al contenido" de nav.js. -->
  <main id="pit-main" tabindex="-1">

  <!-- ============ HERO ============ -->
  <section style="padding: var(--pit-section-padding); background: var(--pit-paper);">
    <div style="max-width: var(--pit-content-max); margin: 0 auto;">
      <div class="pit-ruler"><span class="pit-ruler-seg pit-ruler-seg--blue"></span></div>
      <div style="padding-top: 48px; max-width: 760px;">
        <p class="pit-eyebrow">Foro PIT · Noticias, casos y respuestas</p>
        <h1 class="pit-display" style="margin-top: 18px;">Cada semana, una respuesta.</h1>
        <p class="pit-lead" style="margin-top: 24px; max-width: 56ch;">El Dr. Frusso publica todas las semanas: responde preguntas de la comunidad, comenta casos clínicos, comparte evidencia nueva y novedades del método. Las preguntas se moderan antes de publicarse.</p>
      </div>
      <div style="display: flex; gap: 10px; margin-top: 36px; flex-wrap: wrap; align-items: center;">
        ${catChips}
        <span style="margin-inline-start: auto; display: flex; gap: 8px; align-items: center; font-family: var(--pit-font-mono); font-size: var(--txt-2xs); letter-spacing: 0.08em; text-transform: uppercase; color: var(--pit-ink-40);">
          <span>Audiencia</span>
          ${audChips}
        </span>
      </div>
    </div>
  </section>

  <!-- ============ PUBLICACION DE LA SEMANA ============ -->
  <section style="padding: var(--pit-section-padding); background: var(--pit-blue-tint);">
    <div style="max-width: var(--pit-content-max); margin: 0 auto;">
      <p class="pit-eyebrow">Esta semana</p>
      <article class="m-stack0" style="background: var(--pit-paper-pure); border: 1px solid var(--pit-blue); border-radius: var(--pit-radius); margin-top: 24px; display: grid; grid-template-columns: 1.5fr 1fr; overflow: hidden; gap: 0;">
        <div class="m-pad" style="padding: 40px 44px;">
          <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 18px; flex-wrap: wrap;">
            <span class="pit-chip pit-chip--blue">${CAT[featured.categoria]}</span>
            <span class="pit-chip">${AUD[featured.audiencia]}</span>
            <span style="font-family: var(--pit-font-mono); font-size: var(--txt-xs); letter-spacing: 0.06em; text-transform: uppercase; color: var(--pit-ink-40);">Semana ${esc(featured.semana.replace('S', ''))} · ${esc(featured.fechaLabel)}</span>
          </div>
          <h2 class="m-title" style="font-size: 34px; font-weight: 600; line-height: 1.15; margin: 0 0 14px;"><span class="hover-underline">${esc(featured.titulo)}</span></h2>
          <p style="font-size: var(--txt-md); line-height: 1.65; color: var(--pit-ink-60); margin: 0 0 24px; max-width: 58ch;">${esc(featured.resumen)}</p>
          <div style="display: flex; gap: 20px; align-items: center;">
            <a class="pit-btn pit-btn--primary" href="foro/${esc(featured.slug)}.html">Leer →</a>
            <span style="font-family: var(--pit-font-mono); font-size: var(--txt-xs); letter-spacing: 0.06em; text-transform: uppercase; color: var(--pit-ink-40);">${featured.lectura} min de lectura</span>
          </div>
        </div>
        <img class="m-first" src="${esc(featured.portada)}" alt="${esc(featured.titulo)}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
      </article>
    </div>
  </section>

  <!-- ============ ARCHIVO ============ -->
  <section style="padding: var(--pit-section-padding); background: var(--pit-paper-pure);">
    <div style="max-width: var(--pit-content-max); margin: 0 auto;">
      <!-- flex-wrap: el contador es texto variable ("7 publicaciones en el
           archivo", "1 de 7 publicaciones del archivo"): con nowrap y sin wrap
           desbordaba 73px a 375px. Ahora baja a su propia línea. -->
      <div style="display: flex; align-items: baseline; gap: 24px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 0;">
          <p class="pit-eyebrow">Publicaciones anteriores</p>
          <h2 class="pit-section-title" style="margin-top: 12px;"><span class="hover-underline">El archivo del foro.</span></h2>
        </div>
        <span id="foro-count" role="status" aria-live="polite" class="foro-count">${ARCHIVO} publicaciones en el archivo</span>
      </div>

      <div id="foro-archivo" class="pit-stagger" style="display: grid; margin-top: 36px; border-top: 2px solid var(--pit-ink);">
${rows}
      </div>
      <!-- El estado vacío nombra el filtro que no dio resultados y ofrece la
           salida: antes era un cartel sin acción y el visitante tenía que
           deducir que había que volver a apretar "Todo". -->
      <div id="foro-empty" role="status" style="display: none; padding: 28px 8px;">
        <p id="foro-empty-txt" style="font-family: var(--pit-font-mono); font-size: var(--txt-xs); letter-spacing: 0.06em; text-transform: uppercase; color: var(--pit-ink-40); margin: 0 0 16px;"></p>
        <button type="button" id="foro-reset-filtros" class="foro-filter">Ver todas las publicaciones</button>
      </div>
    </div>
  </section>

  <!-- ============ ENVIA TU PREGUNTA ============ -->
  <section id="pregunta" style="padding: var(--pit-section-padding); background: var(--pit-ink); color: var(--pit-paper);">
    <div class="m-stack" style="max-width: var(--pit-content-max); margin: 0 auto; display: grid; grid-template-columns: 1fr 1.2fr; gap: 64px; align-items: start;">
      <div>
        <p class="pit-eyebrow">Participá</p>
        <h2 class="m-title" style="font-size: 40px; font-weight: 600; line-height: 1.12; margin: 16px 0 14px; color: var(--pit-paper);"><span class="hover-underline">Enviá tu pregunta al foro.</span></h2>
        <p style="font-size: var(--txt-md); line-height: 1.65; color: var(--pit-ink-20); margin: 0; max-width: 48ch;">El Dr. Frusso selecciona y responde preguntas cada semana. Se publican sin nombre ni datos personales. Dejá tu email y te avisamos apenas esté la respuesta.</p>
        <div style="display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap;">
          <span class="pit-chip pit-chip--ghost">Sin registro</span>
          <span class="pit-chip pit-chip--ghost">Anónimas</span>
        </div>
      </div>
      <!-- min-width: 0 + box-sizing: border-box: sin eso este <form> es un item
           de grilla con min-width auto, su min-content (padding 32px en content-box
           + ancho intrinseco del textarea) mide mas que la columna, y a 375px
           empujaba la seccion entera 21px fuera de pantalla. -->
      <form id="foro-form" style="display: grid; gap: 14px; background: rgba(255,255,255,0.04); border: 1px solid var(--pit-ink-80); border-radius: var(--pit-radius); padding: 32px; box-sizing: border-box; min-width: 0;">
        <div style="display: flex; gap: 10px;">
          <label style="flex: 1; display: flex; align-items: center; gap: 8px; font-family: var(--pit-font-mono); font-size: var(--txt-xs); letter-spacing: 0.06em; text-transform: uppercase; color: var(--pit-ink-20); border: 1px solid var(--pit-ink-80); border-radius: var(--pit-radius); padding: 12px 14px; cursor: pointer;"><input type="radio" name="audiencia" value="paciente" checked style="accent-color: #2563EB;"> Soy paciente</label>
          <label style="flex: 1; display: flex; align-items: center; gap: 8px; font-family: var(--pit-font-mono); font-size: var(--txt-xs); letter-spacing: 0.06em; text-transform: uppercase; color: var(--pit-ink-20); border: 1px solid var(--pit-ink-80); border-radius: var(--pit-radius); padding: 12px 14px; cursor: pointer;"><input type="radio" name="audiencia" value="profesional" style="accent-color: #2563EB;"> Soy profesional</label>
        </div>
        <!-- El textarea tenia placeholder pero NO etiqueta: el placeholder no
             es nombre accesible y encima desaparece al empezar a escribir.
             SIN font-size inline: lo maneja la regla de pit-v2.css (16px en
             mobile para que iOS Safari no haga zoom, compacto arriba de 640px).
             Un tamaño inline le ganaría por especificidad a esa regla. -->
        <label for="foro-q" class="foro-label">Tu pregunta</label>
        <!-- UN SOLO atributo style. Había dos (min-width por un lado, el resto
             por otro) y el navegador se queda con el PRIMERO y descarta el
             segundo: el campo perdía borde, fondo, color y tipografía, y
             aparecía con el aspecto por defecto del navegador sobre el fondo
             navy. min-width: 0 es necesario acá: sin él, el item de grilla no
             baja de su min-content y desbordaba la página a 375px. -->
        <textarea id="foro-q" data-ph-paciente="Escribí tu pregunta acá. Cuanto más contexto (zona del dolor, tiempo de evolución, tratamientos previos), más completa podrá ser la respuesta." data-ph-profesional="Escribí tu pregunta acá. Sumá el contexto clínico que ayude (región, hallazgos, qué probaste)." placeholder="Escribí tu pregunta acá. Cuanto más contexto (zona del dolor, tiempo de evolución, tratamientos previos), más completa podrá ser la respuesta." rows="5" style="min-width: 0; font-family: var(--pit-font-sans); line-height: 1.6; padding: 14px 16px; border: 1px solid var(--pit-ink-80); border-radius: var(--pit-radius); background: rgba(255,255,255,0.04); color: var(--pit-paper); outline: none; resize: vertical;"></textarea>
        <div>
          <label for="foro-email" class="foro-label">Tu email — te avisamos cuando el Dr. Frusso responda</label>
          <input id="foro-email" type="email" placeholder="tu@email.com" style="width: 100%; box-sizing: border-box; font-family: var(--pit-font-mono); padding: 13px 16px; border: 1px solid var(--pit-ink-80); border-radius: var(--pit-radius); background: rgba(255,255,255,0.04); color: var(--pit-paper); outline: none;">
        </div>
        <label style="display: flex; align-items: flex-start; gap: 10px; font-size: var(--txt-xs); line-height: 1.55; color: var(--pit-ink-20); cursor: pointer;">
          <input id="foro-nl" type="checkbox" checked style="accent-color: #2563EB; margin-top: 2px;">
          <span>Sumarme también al newsletter: novedades del método y del foro, sin spam. Te podés dar de baja cuando quieras.</span>
        </label>
        <div style="display: flex; gap: 16px; align-items: center;">
          <button type="submit" class="pit-btn pit-btn--white">Enviar pregunta</button>
        </div>
        <!-- role="alert": el mensaje se anuncia al escribirse. Fuera de la fila
             del botón para poder ocupar el ancho completo sin empujarlo. -->
        <span id="foro-hint" class="foro-hint" role="alert"></span>
        <p class="foro-nota" style="margin: 4px 0 0;">Tu email no se publica ni se comparte: se usa solo para avisarte de la respuesta<span id="foro-nlnote"> y enviarte el newsletter</span>. Las respuestas del foro son informativas y no reemplazan una consulta médica.</p>
      </form>
      <!-- tabindex="-1": al enviarse, el form desaparece y el foco quedaría en
           el <body>. Se le pasa el foco a este panel. -->
      <div id="foro-ok" tabindex="-1" style="display: none; background: rgba(255,255,255,0.04); border: 1px solid var(--pit-blue); border-radius: var(--pit-radius); padding: 40px 36px; box-sizing: border-box; min-width: 0;">
        <span style="width: 44px; height: 44px; border-radius: 50%; background: var(--pit-blue); color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: var(--txt-lg);">✓</span>
        <h3 style="font-size: var(--txt-xl); font-weight: 600; margin: 18px 0 10px; color: var(--pit-paper);">Pregunta recibida.</h3>
        <p style="font-size: var(--txt-sm); line-height: 1.65; color: var(--pit-ink-20); margin: 0; max-width: 48ch;">Pasa a moderación y, si el Dr. Frusso la selecciona, se publica sin tus datos. Te va a llegar un aviso a <span id="foro-sent-email" style="font-family: var(--pit-font-mono); color: var(--pit-paper);"></span> cuando esté la respuesta.</p>
        <!-- Caso natural y no MAYUSCULAS literales: este cartel se anuncia dentro
             del panel de exito y un lector de pantalla deletrea las mayusculas
             escritas a mano. El uppercase lo pone text-transform. -->
        <p id="foro-sent-nl" style="display: none; font-family: var(--pit-font-mono); font-size: var(--txt-xs); letter-spacing: 0.04em; text-transform: uppercase; color: #8FAAF0; margin: 16px 0 0;">✓ Quedaste suscripto al newsletter</p>
        <button type="button" id="foro-reset" class="foro-linkbtn" style="margin-top: 22px;">Enviar otra pregunta →</button>
      </div>
    </div>
  </section>

  </main>

${FOOTER(pre)}

</div>

<script>
  // Filtros del archivo (categoría + audiencia)
  (function () {
    var cat = 'todo';
    var aud = null;
    function apply() {
      var rows = document.querySelectorAll('.foro-row');
      var visible = 0;
      rows.forEach(function (r) {
        var okCat = cat === 'todo' || r.getAttribute('data-cat') === cat;
        var rAud = r.getAttribute('data-aud');
        var okAud = !aud || rAud === aud || rAud === 'todos';
        var show = okCat && okAud;
        r.classList.toggle('hide', !show);
        if (show) visible++;
      });
      document.getElementById('foro-empty').style.display = visible ? 'none' : 'block';

      // Cadenas COMPLETAS por caso, no variables concatenadas: asi no sale
      // "1 publicaciones". Y el total es siempre el mismo (${ARCHIVO}, las del
      // archivo): antes pasaba de 8 a 7 al filtrar, porque la destacada no esta
      // en el archivo, sin que nada lo explicara.
      var count = document.getElementById('foro-count');
      if (cat === 'todo' && !aud) {
        count.textContent = '${ARCHIVO} publicaciones en el archivo';
      } else if (visible === 0) {
        count.textContent = 'Sin resultados en el archivo';
      } else if (visible === 1) {
        count.textContent = '1 de ${ARCHIVO} publicaciones del archivo';
      } else {
        count.textContent = visible + ' de ${ARCHIVO} publicaciones del archivo';
      }

      if (!visible) {
        var partes = [];
        if (cat !== 'todo') partes.push(CAT_LABEL[cat]);
        if (aud) partes.push(AUD_LABEL[aud]);
        document.getElementById('foro-empty-txt').textContent =
          'Todavía no hay publicaciones de ' + partes.join(' para ') + '.';
      }
    }

    var CAT_LABEL = ${JSON.stringify(CAT)};
    var AUD_LABEL = { pacientes: 'pacientes', profesionales: 'profesionales' };

    document.getElementById('foro-reset-filtros').addEventListener('click', function () {
      cat = 'todo'; aud = null;
      document.querySelectorAll('[data-fcat]').forEach(function (x) {
        var on = x.getAttribute('data-fcat') === 'todo';
        x.classList.toggle('on', on);
        x.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      document.querySelectorAll('[data-faud]').forEach(function (x) {
        x.classList.remove('on');
        x.setAttribute('aria-pressed', 'false');
      });
      apply();
      document.getElementById('foro-archivo').scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
    document.querySelectorAll('[data-fcat]').forEach(function (b) {
      b.addEventListener('click', function () {
        cat = b.getAttribute('data-fcat');
        document.querySelectorAll('[data-fcat]').forEach(function (x) {
          var on = x === b;
          x.classList.toggle('on', on);
          x.setAttribute('aria-pressed', on ? 'true' : 'false');   // la clase .on es la señal visual; aria-pressed, la accesible
        });
        apply();
      });
    });
    document.querySelectorAll('[data-faud]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-faud');
        aud = (aud === k) ? null : k;
        document.querySelectorAll('[data-faud]').forEach(function (x) {
          var on = x.getAttribute('data-faud') === aud;
          x.classList.toggle('on', on);
          x.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        apply();
      });
    });
  })();

  // Formulario del foro (envío vía pit-forms.js → Formspree; modo demo hasta configurar endpoint)
  (function () {
    var form = document.getElementById('foro-form');
    var ok = document.getElementById('foro-ok');
    if (!form || !ok) return;
    var q = document.getElementById('foro-q');
    var email = document.getElementById('foro-email');
    var nl = document.getElementById('foro-nl');
    var hint = document.getElementById('foro-hint');
    var nlnote = document.getElementById('foro-nlnote');
    var btn = form.querySelector('button[type="submit"]');
    var campos = [q, email];
    nl.addEventListener('change', function () { nlnote.style.display = nl.checked ? '' : 'none'; });

    // El placeholder pedia "zona del dolor, tiempo de evolucion, tratamientos
    // previos" incluso despues de marcar "Soy profesional": el formulario
    // ignoraba lo que el visitante acababa de decir de si mismo.
    form.querySelectorAll('input[name="audiencia"]').forEach(function (r) {
      r.addEventListener('change', function () {
        q.placeholder = q.getAttribute('data-ph-' + r.value) || q.placeholder;
      });
    });

    // Un solo hint para los dos campos: se apunta con aria-describedby SOLO al
    // que falló y se le mueve el foco. Antes se escribía el texto y nada más,
    // así que quien navega con teclado no sabía a qué campo volver.
    function limpiarError() {
      hint.textContent = '';
      campos.forEach(function (c) {
        c.removeAttribute('aria-invalid');
        c.removeAttribute('aria-describedby');
      });
    }
    function marcarError(campo, mensaje) {
      limpiarError();
      hint.textContent = mensaje;
      if (campo) {
        campo.setAttribute('aria-invalid', 'true');
        campo.setAttribute('aria-describedby', 'foro-hint');
        campo.focus();
      }
    }
    campos.forEach(function (c) {
      c.addEventListener('input', function () { if (c.getAttribute('aria-invalid')) limpiarError(); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var emailOk = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.value.trim());
      // Caso natural (el uppercase lo pone el CSS) y redactado como instrucción.
      if (!q.value.trim()) { marcarError(q, 'Escribí tu pregunta antes de enviar'); return; }
      if (!emailOk) { marcarError(email, 'Revisá el email: es adonde te avisamos la respuesta'); return; }
      limpiarError();
      var aud = form.querySelector('input[name="audiencia"]:checked');
      var payload = {
        _subject: 'Foro PIT — nueva pregunta',
        tipo: 'pregunta-foro',
        audiencia: aud ? aud.value : '',
        pregunta: q.value.trim(),
        email: email.value.trim(),
        newsletter: nl.checked ? 'sí' : 'no'
      };
      var wasNl = nl.checked, sentEmail = payload.email;
      btn.disabled = true; btn.textContent = 'Enviando…';
      // Si pit-forms.js no cargó, NO se envió nada: antes este camino resolvía
      // { ok: true } y la pantalla decía "Pregunta recibida".
      var send = window.pitSubmit ? window.pitSubmit('foro', payload) : Promise.resolve({ ok: false });
      send.then(function (r) {
        btn.disabled = false; btn.textContent = 'Enviar pregunta';
        if (!r.ok) { marcarError(null, 'No se pudo enviar. Probá de nuevo, o escribinos a ricardo.frusso@hospitalitaliano.org.ar'); btn.focus(); return; }
        document.getElementById('foro-sent-email').textContent = sentEmail;
        document.getElementById('foro-sent-nl').style.display = wasNl ? '' : 'none';
        form.style.display = 'none';
        ok.style.display = 'block';
        ok.focus();   // el form desaparece: el foco tiene que ir a algún lado
        form.reset(); nlnote.style.display = '';
      });
    });
    document.getElementById('foro-reset').addEventListener('click', function () {
      ok.style.display = 'none';
      form.style.display = 'grid';
      limpiarError();
      q.focus();
    });
  })();
</script>
` + FOOT(pre);
}

// ---------- main ----------
const posts = loadPosts();   // ya vienen ordenados por fecha descendente

// La validación va ANTES de borrar el directorio de salida: si un post está mal
// escrito, el foro publicado sigue en su lugar. Nada a medio generar.
const errores = validar(posts);
if (errores.length) {
  console.error(`\n✗ foro.js: ${errores.length} problema(s) en _content/foro/ — no se generó nada.\n`);
  errores.forEach(e => console.error(`  · ${e}`));
  console.error('');
  process.exit(1);
}

if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });
// limpiar html viejos del directorio de salida
for (const f of fs.readdirSync(OUTDIR)) if (f.endsWith('.html')) fs.unlinkSync(path.join(OUTDIR, f));

posts.forEach((p, i) => {
  const html = renderPost(p, posts, i);
  fs.writeFileSync(path.join(OUTDIR, `${p.slug}.html`), html);
  console.log(`OK  foro/${p.slug}.html  (${(html.length / 1024).toFixed(1)} KB)  [${p.semana} · ${CAT_SHORT[p.categoria]}]`);
});

const index = renderIndex(posts);
fs.writeFileSync(path.join(ROOT, 'foro.html'), index);
console.log(`OK  foro.html  (${(index.length / 1024).toFixed(1)} KB)  — destacado: ${posts[0].slug}, archivo: ${posts.length - 1}`);
