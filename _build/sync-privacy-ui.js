const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const rootPages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && f !== 'certificado.html');
const forumPages = fs.existsSync(path.join(ROOT, 'foro'))
  ? fs.readdirSync(path.join(ROOT, 'foro')).filter(f => f.endsWith('.html')).map(f => path.join('foro', f)) : [];

function ui(pre, standalone) { return `<!-- PIT-PRIVACY-UI:START -->
${standalone ? '<button type="button" class="pit-privacy-standalone" data-privacy-open>Privacidad</button>' : ''}
<aside class="pit-privacy-banner" data-privacy-banner hidden aria-label="Aviso de privacidad">
  <p>Usamos almacenamiento necesario para recordar tus preferencias y likes. Google Maps y YouTube solo se cargan si permitís contenido externo. <a href="${pre}privacidad.html#cookies">Ver detalles</a>.</p>
  <div class="pit-privacy-actions"><button type="button" class="pit-privacy-btn" data-privacy-choice="necessary">Solo necesario</button><button type="button" class="pit-privacy-btn pit-privacy-btn--primary" data-privacy-choice="external">Permitir contenido externo</button></div>
</aside>
<dialog class="pit-privacy-dialog" data-privacy-dialog aria-labelledby="pit-privacy-title"><div class="pit-privacy-dialog-inner">
  <h2 id="pit-privacy-title">Preferencias de privacidad</h2><p>Elegí si querés cargar servicios externos dentro de las páginas. Podés cambiar esta decisión cuando quieras.</p>
  <div class="pit-privacy-choice"><strong>Funciones necesarias</strong><span>Idioma, avance del curso, seguridad, likes y tu elección de privacidad. Siempre activas.</span></div>
  <div class="pit-privacy-choice"><strong>Contenido externo</strong><span>Mapas de Google y videos de YouTube. Al cargarlos, esos proveedores reciben datos técnicos.</span></div>
  <div class="pit-privacy-actions"><button type="button" class="pit-privacy-btn" data-privacy-choice="necessary">Usar solo lo necesario</button><button type="button" class="pit-privacy-btn pit-privacy-btn--primary" data-privacy-choice="external">Permitir contenido externo</button></div>
</div></dialog>
<script src="${pre}assets/js/pit-privacy.js?v=2"></script>
<!-- PIT-PRIVACY-UI:END -->`; }

const legal = pre => `<div class="v2-footer-legal">
      <span>© 2026 Dr. Ricardo D. Frusso · M.N. 86.498</span>
      <a href="${pre}privacidad.html#aviso-legal">Aviso legal</a><a href="${pre}privacidad.html#privacidad">Privacidad</a><a href="${pre}privacidad.html#cookies">Cookies</a><a href="${pre}privacidad.html#terminos">Términos</a>
      <button type="button" class="v2-footer-privacy" data-privacy-open>Preferencias de privacidad</button>
    </div>`;

let failed = false;
for (const rel of [...rootPages, ...forumPages]) {
  const file = path.join(ROOT, rel);
  const pre = rel.startsWith('foro' + path.sep) ? '../' : '';
  let html = fs.readFileSync(file, 'utf8').replace(/<!-- PIT-PRIVACY-UI:START -->[\s\S]*?<!-- PIT-PRIVACY-UI:END -->\s*/g, '');
  const footer = /<div class="v2-footer-legal">[\s\S]*?<\/div>(?=\s*<\/footer>)/;
  const hasFooter = footer.test(html);
  if (hasFooter) html = html.replace(footer, legal(pre));
  if (!html.includes('assets/css/pit-privacy.css')) html = html.replace('</head>', `  <link rel="stylesheet" href="${pre}assets/css/pit-privacy.css?v=2">\n</head>`);
  const langScript = /<script src="[^"]*assets\/js\/pit-lang\.js[^\"]*"><\/script>/;
  if (!langScript.test(html)) { console.error(`FAIL ${rel}: falta pit-lang.js`); failed = true; continue; }
  // La UI debe existir antes de que pit-lang.js recorra el documento; de otro
  // modo el aviso aparece en español aunque la preferencia guardada sea inglés.
  html = html.replace(langScript, ui(pre, !hasFooter) + '\n$&');
  fs.writeFileSync(file, html);
  console.log(`SYNC ${rel} (privacidad)`);
}
process.exit(failed ? 1 : 0);
