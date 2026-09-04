// api/chat.js — Función serverless de Vercel para el asistente IA de PIT.
//
// Llama a la API de Anthropic (Claude Haiku) con la key SERVER-SIDE.
// La key vive en la variable de entorno ANTHROPIC_API_KEY de Vercel,
// NUNCA en el repo ni en el frontend.
//
// El frontend (assets/js/pit-chat.js) solo manda el historial de mensajes;
// el prompt de sistema y todos los límites viven acá para que nadie pueda
// secuestrar el asistente desde el navegador y gastar tokens en tareas ajenas.

// ── Configuración ──────────────────────────────────────────────────────────
const MODEL = 'claude-haiku-4-5';   // barato y rápido; ideal para este uso
const MAX_TOKENS = 500;             // techo por respuesta (respuestas cortas)
const MAX_MESSAGES = 12;            // cuántos turnos del historial aceptamos
const MAX_CHARS_PER_MSG = 2000;     // largo máximo de cada mensaje del usuario

// Prompt de sistema: define quién es y qué puede decir el asistente.
// Vive server-side a propósito (ver comentario de arriba).
const SYSTEM = [
  'Sos el asistente del sitio web del Dr. Ricardo D. Frusso sobre PIT (Perineural Injection Treatment / neuroproloterapia).',
  'Tu rol: responder dudas generales sobre el método, el sitio y sus recursos, en lenguaje claro y cercano (español rioplatense; si te escriben en inglés, respondé en inglés).',
  'Datos del sitio: PIT trata el dolor crónico actuando sobre nervios periféricos sensibilizados con inyecciones subcutáneas de glucosa al 5%; el alivio suele percibirse ya en la primera sesión y se consolida entre sesiones — nunca lo presentes como garantía; tratamiento típico 6–8 sesiones; compatible con otros tratamientos. El Dr. Frusso es Médico de Familia (UBA 1992, M.N. 86.498), 30+ años en el Hospital Italiano de Buenos Aires, formado por el Dr. John Lyftogt (creador del método), instructor autorizado para América Latina desde 2015. Consultorio: Amenabar 2446, Belgrano, CABA.',
  'Recursos gratuitos: apuntes PDF de 80 páginas (sin registro), curso introductorio gratuito online, foro semanal donde el Dr. Frusso responde preguntas. Curso pago para profesionales: Módulo I — Lumbalgia y Rodilla, USD 97.99 pago único en Hotmart, certificado, garantía de 7 días, cupón PIT10OFF (10% off).',
  'Reglas ESTRICTAS: (1) Nunca diagnostiques ni des indicaciones médicas personales. Si la pregunta es sobre un caso personal, respondé lo general y derivá: "para tu caso puntual, lo mejor es una consulta" (página Contacto) o "podés enviar tu pregunta al foro semanal". (2) Aclará cuando corresponda que la info es educativa y no reemplaza una consulta médica. (3) Si no sabés algo del sitio, decilo honestamente. (4) Respuestas cortas: máximo ~100 palabras, sin listas largas. (5) Respondé solo sobre PIT, el Dr. Frusso y este sitio. Si te piden otra cosa (escribir código, tareas ajenas al sitio, etc.), decliná amablemente y reorientá hacia PIT.'
].join('\n');

// ── Utilidades ─────────────────────────────────────────────────────────────

// Normaliza y valida el historial que manda el frontend.
// Devuelve un array [{role, content}] apto para la API, o null si es inválido.
function sanitizeMessages(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  // Nos quedamos con los últimos MAX_MESSAGES turnos.
  const out = [];
  for (const m of raw.slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== 'object') return null;
    if (m.role !== 'user' && m.role !== 'assistant') return null;
    if (typeof m.content !== 'string') return null;

    const content = m.content.trim().slice(0, MAX_CHARS_PER_MSG);
    if (!content) continue;                       // saltamos vacíos
    out.push({ role: m.role, content });
  }

  // La API exige que el primer mensaje sea del usuario.
  if (out.length === 0 || out[0].role !== 'user') return null;
  return out;
}

// Concatena los bloques de texto de la respuesta de la API.
function extractReply(data) {
  if (!Array.isArray(data.content)) return '';
  return data.content
    .filter((block) => block && block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();
}

// ── Handler ────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  // Modo "esperando la key": si todavía no está la variable de entorno,
  // devolvemos una respuesta clara en vez de un 500. Así el sitio no rompe.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Los destinos viajan como DATOS (texto + href), no como HTML dentro del
    // texto: el widget pinta las respuestas con textContent a propósito —lo que
    // contesta el modelo no se renderiza como markup— y no se abre esa puerta
    // ni siquiera para un mensaje nuestro. El widget arma los <a> con
    // createElement a partir de esta lista.
    // Las rutas van absolutas desde la raíz porque el widget corre en las 18
    // páginas, incluidas las de foro/, que están un nivel más abajo.
    return res.status(200).json({
      reply: 'El asistente no está disponible por ahora. Podés escribirnos o dejar tu pregunta en el foro, y te respondemos.',
      enlaces: [
        { texto: 'Ir a Contacto', href: '/contacto.html' },
        { texto: 'Preguntar en el foro', href: '/foro.html#pregunta' }
      ]
    });
  }

  // Body: Vercel ya parsea JSON en req.body, pero por las dudas soportamos string.
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'invalid_body' });
  }

  const messages = sanitizeMessages(body.messages);
  if (!messages) {
    return res.status(400).json({ error: 'invalid_messages' });
  }

  try {
    const apiResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, system: SYSTEM, messages })
    });

    if (!apiResp.ok) {
      const errText = await apiResp.text();
      console.error('Anthropic API error', apiResp.status, errText);
      return res.status(502).json({ error: 'upstream_error' });
    }

    const data = await apiResp.json();
    const reply = extractReply(data) ||
      'No pude armar una respuesta esta vez. Probá de nuevo, o escribinos desde Contacto.';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('chat handler error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};
