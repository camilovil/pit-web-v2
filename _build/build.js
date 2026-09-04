// _build/build.js — corre todo el pipeline en orden.
// Los generadores primero; los verificadores después, porque miran el HTML ya
// construido. Si un verificador falla, el build falla: el HTML queda escrito
// (para poder inspeccionarlo) pero el error no pasa desapercibido.
const { execSync } = require('child_process');
const path = require('path');

const STEPS = [
  { file: 'convert.js', label: 'convert.js' },
  { file: 'foro.js', label: 'foro.js' },
  { file: 'sync-nav.js', label: 'sync-nav.js' },
  // Va DESPUÉS de foro.js: ese paso valida el frontmatter y corta el build
  // si un post está mal escrito, así que acá los datos ya están validados.
  { file: 'sync-foro-home.js', label: 'sync-foro-home.js  (últimas del foro en la home)' },
  { file: 'sync-cursos-home.js', label: 'sync-cursos-home.js  (próximos cursos en la home)' },
  { file: 'sync-staging.js', label: 'sync-staging.js  (bandera noindex)' },
  { file: 'check-lang.js', label: 'check-lang.js  (diccionario ES/EN)' },
  { file: 'check-css.js', label: 'check-css.js   (las dos copias del CSS)' },
];

let failed = false;
for (const s of STEPS) {
  console.log(`\n▶ ${s.label}`);
  try {
    execSync(`node "${path.join(__dirname, s.file)}"`, { stdio: 'inherit' });
  } catch (e) {
    failed = true;
    break;
  }
}
process.exit(failed ? 1 : 0);
