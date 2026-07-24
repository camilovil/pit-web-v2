// _build/build.js — corre todo el pipeline en orden.
const { execSync } = require('child_process');
const path = require('path');
for (const s of ['convert.js', 'foro.js', 'sync-nav.js']) {
  console.log(`\n▶ ${s}`);
  execSync(`node "${path.join(__dirname, s)}"`, { stdio: 'inherit' });
}
