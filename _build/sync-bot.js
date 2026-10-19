// _build/sync-bot.js — arma la base del asistente del sitio (sin IA).
//
// QUÉ HACE
// Junta las respuestas escritas a mano en _content/bot.json con las preguntas
// frecuentes que ya están publicadas en el sitio (los <details> de faq.html y
// de jornada-pit.html) y escribe assets/js/pit-bot-data.js, que el widget
// (assets/js/pit-chat.js) carga recién cuando alguien abre el asistente.
//
// POR QUÉ LAS FAQ SE LEEN DEL HTML
// Para que el bot no pueda decir algo distinto de lo que dice la página: si
// cambia una respuesta en faq.html o en la Jornada, el próximo build la toma
// tal cual. Corre DESPUÉS de convert.js, que es el que genera esas páginas.
//
// VALIDA ANTES DE ESCRIBIR (corta el build nombrando el problema):
// - cada enlace es una ruta interna que existe en el repo;
// - los ids de 'temas' y 'relacionadas' apuntan a una entrada o a una FAQ;
// - cada clave de 'claves_faq' corresponde a una pregunta publicada (si se
//   cambia el texto de una pregunta en la página, hay que moverla acá).
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FUENTE = path.join(ROOT, '_content', 'bot.json');
const SALIDA = path.join(ROOT, 'assets', 'js', 'pit-bot-data.js');

// De dónde salen las preguntas frecuentes, con el enlace que acompaña cada una.
const PAGINAS_FAQ = [
  { archivo: 'faq.html', tema: 'pit', enlace: { texto: 'Preguntas frecuentes', href: '/faq' } },
  { archivo: 'jornada-pit.html', tema: 'jornada', enlace: { texto: 'Ver la Jornada', href: '/jornada-pit' } },
];

const errores = [];
const err = (m) => errores.push(m);

const decode = (t) => t
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const texto = (html) => decode(html.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

// Una ruta interna existe si hay archivo: /x → x.html (cleanUrls), /x.pdf → x.pdf.
function existe(href) {
  if (typeof href !== 'string' || href.charAt(0) !== '/' || href.startsWith('//')) return false;
  let p = href.split('#')[0].split('?')[0].replace(/^\//, '');
  if (!p) return fs.existsSync(path.join(ROOT, 'index.html'));
  if (path.extname(p)) return fs.existsSync(path.join(ROOT, p));
  return fs.existsSync(path.join(ROOT, p + '.html'));
}

const base = JSON.parse(fs.readFileSync(FUENTE, 'utf8'));
const entradas = [];

// 1) las respuestas escritas a mano
for (const e of base.entradas || []) {
  if (!e.id || !e.pregunta || !e.respuesta) { err(`entrada sin id, pregunta o respuesta: ${JSON.stringify(e).slice(0, 80)}`); continue; }
  entradas.push({ id: e.id, tema: e.tema || '', pregunta: e.pregunta, claves: e.claves || [], respuesta: e.respuesta, enlaces: e.enlaces || [], relacionadas: e.relacionadas || [] });
}

// 2) las preguntas frecuentes publicadas
const clavesFaq = base.claves_faq || {};
const PROVISORIA = /placeholder|a definir con|\[\[/i;
const provisorias = [];
const preguntasFaq = new Set();
for (const pag of PAGINAS_FAQ) {
  // Sin los comentarios: una pregunta comentada en la página no está publicada
  // y tampoco tiene que aparecer en el bot.
  const html = fs.readFileSync(path.join(ROOT, pag.archivo), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const re = /<details>\s*<summary>([\s\S]*?)<\/summary>\s*<(div|p)>([\s\S]*?)<\/\2>\s*<\/details>/g;
  let m, n = 0;
  while ((m = re.exec(html))) {
    const pregunta = texto(m[1]);
    const respuesta = texto(m[3]);
    if (!pregunta || !respuesta) continue;
    n++;
    // Una respuesta todavía sin escribir ("Placeholder · Respuesta a definir…")
    // no se ofrece en el bot: para esa pregunta responde la entrada escrita a
    // mano en bot.json, si la hay, o el mensaje de "no encontré respuesta".
    if (PROVISORIA.test(respuesta)) { provisorias.push(pregunta); continue; }
    preguntasFaq.add(pregunta);
    const hermanas = []; // se completan abajo: las otras preguntas de la misma página
    entradas.push({ id: pregunta, tema: pag.tema, pregunta, claves: clavesFaq[pregunta] || [], respuesta, enlaces: [pag.enlace], relacionadas: hermanas, _pagina: pag.archivo });
  }
  if (!n) err(`${pag.archivo}: no se encontró ninguna pregunta (<details><summary>…)`);
}
// Relacionadas de las FAQ: las dos siguientes de la misma página.
for (const pag of PAGINAS_FAQ) {
  const delaPagina = entradas.filter((e) => e._pagina === pag.archivo);
  delaPagina.forEach((e, i) => {
    e.relacionadas.push(...[1, 2].map((d) => delaPagina[(i + d) % delaPagina.length].id).filter((id) => id !== e.id));
  });
}
for (const e of entradas) delete e._pagina;

// 3) validaciones
const ids = new Set();
for (const e of entradas) {
  if (ids.has(e.id)) err(`id repetido: "${e.id}"`);
  ids.add(e.id);
  for (const l of e.enlaces) if (!l || !l.texto || !existe(l.href)) err(`"${e.id}": enlace roto o externo ${JSON.stringify(l)}`);
}
for (const e of entradas) for (const r of e.relacionadas) if (!ids.has(r)) err(`"${e.id}": relacionada inexistente "${r}"`);
for (const t of base.temas || []) if (!ids.has(t.id)) err(`tema "${t.texto}": id inexistente "${t.id}"`);
for (const q of Object.keys(clavesFaq)) if (!preguntasFaq.has(q) && !provisorias.includes(q)) err(`claves_faq: "${q}" no es una pregunta publicada (¿cambió el texto en la página?)`);

if (errores.length) {
  console.error('FAIL _content/bot.json\n  · ' + errores.join('\n  · '));
  process.exit(1);
}

const datos = { saludo: base.saludo, sin_respuesta: base.sin_respuesta, temas: base.temas, entradas };
const salida = `// GENERADO por _build/sync-bot.js desde _content/bot.json + las FAQ del sitio.\n// No editar a mano: se regenera en cada build.\nwindow.PIT_BOT = ${JSON.stringify(datos, null, 1)};\n`;
const previo = fs.existsSync(SALIDA) ? fs.readFileSync(SALIDA, 'utf8') : '';
if (previo !== salida) {
  fs.writeFileSync(SALIDA, salida);
  console.log(`SYNC assets/js/pit-bot-data.js  (${entradas.length} respuestas, ${preguntasFaq.size} desde las FAQ del sitio)`);
  if (provisorias.length) console.log(`     sin responder en la página (no van al bot): ${provisorias.join(' · ')}`);
} else {
  console.log(`OK   assets/js/pit-bot-data.js (sin cambios, ${entradas.length} respuestas)`);
}
