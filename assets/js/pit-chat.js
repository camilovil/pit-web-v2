// PIT — Asistente IA flotante (window.claude.complete)
(function () {
  if (window.__pitChat) return;
  window.__pitChat = true;

  var SYSTEM = [
    'Sos el asistente del sitio web del Dr. Ricardo D. Frusso sobre PIT (Perineural Injection Treatment / neuroproloterapia).',
    'Tu rol: responder dudas generales sobre el método, el sitio y sus recursos, en lenguaje claro y cercano (español rioplatense; si te escriben en inglés, respondé en inglés).',
    'Datos del sitio: PIT trata el dolor crónico actuando sobre nervios periféricos sensibilizados con inyecciones subcutáneas de glucosa al 5%; alivio desde la primera sesión; tratamiento típico 4–8 sesiones; compatible con otros tratamientos. El Dr. Frusso es Médico de Familia (UBA 1992, M.N. 86.498), 30+ años en el Hospital Italiano de Buenos Aires, formado por el Dr. John Lyftogt (creador del método), instructor autorizado para América Latina desde 2015. Consultorio: Amenabar 2446, Belgrano, CABA.',
    'Recursos gratuitos: apuntes PDF de 80 páginas (sin registro), curso introductorio gratuito online, foro semanal donde Ricardo responde preguntas. Curso pago para profesionales: Módulo I — Lumbalgia y Rodilla, USD 97.99 pago único en Hotmart, certificado, garantía de 7 días, cupón PIT10OFF (10% off).',
    'Reglas ESTRICTAS: (1) Nunca diagnostiques ni des indicaciones médicas personales. Si la pregunta es sobre un caso personal, respondé lo general y derivá: "para tu caso puntual, lo mejor es una consulta" (página Contacto) o "podés enviar tu pregunta al foro semanal". (2) Aclarà cuando corresponda que la info es educativa y no reemplaza una consulta médica. (3) Si no sabés algo del sitio, decilo honestamente. (4) Respuestas cortas: máximo ~100 palabras, sin listas largas.'
  ].join('\n');

  var SUGERIDAS = ['¿Qué es PIT?', '¿Duelen las inyecciones?', '¿Cómo empiezo el curso gratis?'];

  var css = [
    '.pitchat-fab { position: fixed; bottom: 28px; right: 28px; height: 56px; padding: 0 22px 0 18px; border-radius: 999px; background: #000B33; border: none; cursor: pointer; z-index: 950; display: flex; align-items: center; gap: 10px; box-shadow: 0 16px 40px rgba(0,11,51,0.35); transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease; font-family: var(--pit-font-sans, "Space Grotesk", sans-serif); }',
    '.pitchat-fab:hover { transform: translateY(-3px); box-shadow: 0 22px 52px rgba(0,11,51,0.45); }',
    '.pitchat-fab-dot { width: 8px; height: 8px; border-radius: 50%; background: #5B7FDE; box-shadow: 0 0 0 4px rgba(91,127,222,0.25); }',
    '.pitchat-fab-label { color: #fff; font-weight: 600; font-size: 14px; letter-spacing: -0.01em; }',
    '.pitchat-panel { position: fixed; bottom: 100px; right: 28px; width: 380px; max-width: calc(100vw - 32px); max-height: min(580px, calc(100vh - 140px)); background: rgba(255,255,255,0.92); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.7); border-radius: 24px; box-shadow: 0 32px 80px rgba(0,11,51,0.22); z-index: 951; display: none; flex-direction: column; overflow: hidden; font-family: var(--pit-font-sans, "Space Grotesk", sans-serif); }',
    '.pitchat-panel.open { display: flex; }',
    '.pitchat-head { background: linear-gradient(140deg, #000B33 0%, #1A2E6B 70%, #2C4BA8 100%); padding: 18px 20px; display: flex; align-items: center; gap: 12px; }',
    '.pitchat-head-pipe { width: 8px; height: 8px; border-radius: 50%; background: #5B7FDE; box-shadow: 0 0 0 4px rgba(91,127,222,0.3); }',
    '.pitchat-head-title { color: #fff; font-weight: 600; font-size: 15px; letter-spacing: -0.01em; flex: 1; }',
    '.pitchat-head-title small { display: block; font-weight: 400; font-size: 11px; letter-spacing: 0; text-transform: none; color: rgba(255,255,255,0.65); margin-top: 2px; }',
    '.pitchat-close { background: rgba(255,255,255,0.12); border: none; color: #fff; font-size: 16px; line-height: 1; cursor: pointer; width: 36px; height: 36px; border-radius: 50%; transition: background 0.2s ease; }',
    '.pitchat-close:hover { background: rgba(255,255,255,0.25); color: #fff; }',
    '.pitchat-msgs { flex: 1; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 10px; background: transparent; }',
    '.pitchat-msg { max-width: 85%; padding: 11px 15px; border-radius: 18px; font-size: 14px; line-height: 1.55; white-space: pre-wrap; }',
    '.pitchat-msg.user { align-self: flex-end; background: #000B33; color: #fff; border-bottom-right-radius: 6px; }',
    '.pitchat-msg.bot { align-self: flex-start; background: #FFFFFF; border: 1px solid rgba(0,11,51,0.08); color: #000B33; border-bottom-left-radius: 6px; box-shadow: 0 4px 14px rgba(0,11,51,0.05); }',
    '.pitchat-msg.typing { color: #6F7C86; font-size: 12px; }',
    '.pitchat-sugs { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 18px 14px; background: transparent; }',
    '.pitchat-sug { font-family: inherit; font-size: 12.5px; font-weight: 500; color: #2563EB; background: #EFF4FE; border: 1px solid rgba(37,99,235,0.22); border-radius: 999px; padding: 8px 14px; cursor: pointer; transition: background 0.2s ease, transform 0.2s ease; }',
    '.pitchat-sug:hover { background: #FFFFFF; transform: translateY(-1px); }',
    '.pitchat-form { display: flex; gap: 8px; padding: 12px 14px; border-top: 1px solid rgba(0,11,51,0.06); background: rgba(255,255,255,0.7); }',
    '.pitchat-input { flex: 1; border: 1px solid rgba(0,11,51,0.12); border-radius: 999px; outline: none; padding: 11px 18px; font-family: inherit; font-size: 14px; color: #000B33; min-width: 0; background: #FFFFFF; transition: border-color 0.2s ease; }',
    '.pitchat-input:focus { border-color: #2563EB; }',
    '.pitchat-send { background: #2563EB; color: #fff; border: none; font-family: inherit; font-weight: 600; font-size: 15px; width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0; cursor: pointer; transition: background 0.2s ease, transform 0.2s ease; }',
    '.pitchat-send:hover { background: #1E4FC4; transform: translateY(-1px); }',
    '.pitchat-send:disabled { background: #BFC7D6; cursor: default; transform: none; }',
    '.pitchat-note { font-size: 10.5px; color: #8B96A0; text-align: center; padding: 0 12px 10px; background: transparent; border-top: none; }',
    '@media (max-width: 480px) { .pitchat-panel { right: 16px; bottom: 96px; } .pitchat-fab { right: 20px; bottom: 24px; } .pitchat-fab-label { display: none; } .pitchat-fab { padding: 0; width: 56px; justify-content: center; } }'
  ].join('\n');

  function boot() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var fab = document.createElement('button');
    fab.className = 'pitchat-fab';
    fab.setAttribute('aria-label', 'Abrir asistente sobre PIT');
    fab.innerHTML = '<span class="pitchat-fab-dot"></span><span class="pitchat-fab-label">Preguntale a PIT</span>';

    var panel = document.createElement('div');
    panel.className = 'pitchat-panel';
    panel.innerHTML =
      '<div class="pitchat-head">' +
        '<span class="pitchat-head-pipe"></span>' +
        '<span class="pitchat-head-title">Asistente PIT<small>IA · Respuestas educativas</small></span>' +
        '<button class="pitchat-close" aria-label="Cerrar">×</button>' +
      '</div>' +
      '<div class="pitchat-msgs"></div>' +
      '<div class="pitchat-sugs"></div>' +
      '<form class="pitchat-form">' +
        '<input class="pitchat-input" type="text" placeholder="Preguntá sobre PIT…" maxlength="400">' +
        '<button class="pitchat-send" type="submit">→</button>' +
      '</form>' +
      '<div class="pitchat-note">No reemplaza una consulta médica</div>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    var msgsEl = panel.querySelector('.pitchat-msgs');
    var sugsEl = panel.querySelector('.pitchat-sugs');
    var form = panel.querySelector('.pitchat-form');
    var input = panel.querySelector('.pitchat-input');
    var sendBtn = panel.querySelector('.pitchat-send');
    var history = [];
    var busy = false;

    function add(role, text) {
      var d = document.createElement('div');
      d.className = 'pitchat-msg ' + role;
      d.textContent = text;
      msgsEl.appendChild(d);
      msgsEl.scrollTop = msgsEl.scrollHeight;
      return d;
    }

    function renderSugs() {
      sugsEl.innerHTML = '';
      SUGERIDAS.forEach(function (q) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'pitchat-sug';
        b.textContent = q;
        b.addEventListener('click', function () { send(q); });
        sugsEl.appendChild(b);
      });
    }

    function send(text) {
      text = (text || '').trim();
      if (!text || busy) return;
      busy = true;
      sendBtn.disabled = true;
      sugsEl.innerHTML = '';
      add('user', text);
      history.push({ role: 'user', content: text });
      var typing = add('bot typing', 'Escribiendo…');

      var done = function (reply) {
        typing.remove();
        add('bot', reply);
        history.push({ role: 'assistant', content: reply });
        busy = false;
        sendBtn.disabled = false;
        input.focus();
      };

      if (!window.claude || !window.claude.complete) {
        setTimeout(function () {
          done('(Demo) Acá respondería la IA. En esta vista previa el asistente no está conectado.');
        }, 500);
        return;
      }

      window.claude.complete({
        system: SYSTEM,
        messages: history.slice(-12),
        max_tokens: 500
      }).then(done).catch(function () {
        typing.remove();
        add('bot', 'Uy, no pude responder en este momento. Probá de nuevo en unos segundos.');
        busy = false;
        sendBtn.disabled = false;
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value;
      input.value = '';
      send(v);
    });

    fab.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      if (open && !msgsEl.children.length) {
        add('bot', 'Hola 👋 Soy el asistente del sitio. Puedo contarte qué es PIT, cómo funciona y qué recursos gratuitos hay. ¿Qué querés saber?');
        renderSugs();
      }
      if (open) input.focus();
    });
    panel.querySelector('.pitchat-close').addEventListener('click', function () {
      panel.classList.remove('open');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
