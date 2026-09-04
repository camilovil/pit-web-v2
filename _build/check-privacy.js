const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const pages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && f !== 'certificado.html')
  .concat(fs.readdirSync(path.join(ROOT, 'foro')).filter(f => f.endsWith('.html')).map(f => path.join('foro', f)));
const errors = [];
for (const rel of pages) {
  const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const count = needle => html.split(needle).length - 1;
  if (count('PIT-PRIVACY-UI:START') !== 1 || count('PIT-PRIVACY-UI:END') !== 1) errors.push(`${rel}: UI de privacidad ausente o duplicada`);
  if (count('assets/css/pit-privacy.css') !== 1 || count('assets/js/pit-privacy.js') !== 1) errors.push(`${rel}: assets de privacidad ausentes o duplicados`);
  if (html.includes('<footer class="v2-footer">')) {
    for (const anchor of ['#aviso-legal', '#privacidad', '#cookies', '#terminos']) if (!html.includes(`privacidad.html${anchor}`)) errors.push(`${rel}: falta enlace ${anchor}`);
  }
  const active = html.replace(/<template\b[\s\S]*?<\/template>/gi, '');
  if (/<iframe\b[^>]+(?:google\.com\/maps|youtube(?:-nocookie)?\.com)/i.test(active)) errors.push(`${rel}: proveedor externo activo antes del consentimiento`);
}
const legal = fs.readFileSync(path.join(ROOT, 'privacidad.html'), 'utf8');
for (const id of ['aviso-legal', 'privacidad', 'cookies', 'terminos']) if (!legal.includes(`id="${id}"`)) errors.push(`privacidad.html: falta sección ${id}`);
if (errors.length) { console.error(errors.map(e => `FAIL ${e}`).join('\n')); process.exit(1); }
console.log(`    ✓ ${pages.length} páginas con controles legales; embeds externos inertes`);
