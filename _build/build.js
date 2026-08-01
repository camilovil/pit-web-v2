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
  { file: 'check-lang.js', label: 'check-lang.js  (diccionario ES/EN)' },
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
