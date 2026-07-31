// PIT — Asistente IA flotante (consume /api/chat, función serverless de Vercel)
(function () {
  if (window.__pitChat) return;
  window.__pitChat = true;

  // El prompt de sistema del asistente vive en la función serverless
  // (api/chat.js), no acá — así no se puede manipular desde el navegador.

  var SUGERIDAS = ['¿Qué es PIT?', '¿Duelen las inyecciones?', '¿Cómo empiezo el curso gratis?'];

  var css = [
    // right/bottom van declarados dos veces a propósito: el valor de siempre y
    // después el mismo valor + el área segura del dispositivo (indicador de
    // gesto del iPhone, esquinas redondeadas). Sin esto el FAB — que es el
    // control flotante permanente del sitio — cae dentro de la zona de swipe
    // del sistema. Un navegador sin env() descarta la segunda declaración y se
    // queda con la primera; si dejáramos solo la versión con env(), tiraría la
    // declaración entera y el botón se iría al borde superior.
    '.pitchat-fab { position: fixed; bottom: 28px; bottom: calc(28px + env(safe-area-inset-bottom, 0px)); right: 28px; right: calc(28px + env(safe-area-inset-right, 0px)); height: 56px; padding: 0 22px 0 18px; border-radius: 999px; background: #000B33; border: none; cursor: pointer; z-index: 950; display: flex; align-items: center; gap: 10px; box-shadow: 0 16px 40px rgba(0,11,51,0.35); transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease; font-family: var(--pit-font-sans, "Space Grotesk", sans-serif); }',
    '.pitchat-fab:hover { transform: translateY(-3px); box-shadow: 0 22px 52px rgba(0,11,51,0.45); }',
    '.pitchat-fab-dot { width: 8px; height: 8px; border-radius: 50%; background: #5B7FDE; box-shadow: 0 0 0 4px rgba(91,127,222,0.25); }',
    '.pitchat-fab-label { color: #fff; font-weight: 600; font-size: var(--txt-sm, 15px); letter-spacing: -0.01em; }',
    // El max-height también resta el área segura: si el panel sube por el
    // inset pero conserva su alto, el borde de arriba se mete debajo del nav.
    '.pitchat-panel { position: fixed; bottom: 100px; bottom: calc(100px + env(safe-area-inset-bottom, 0px)); right: 28px; right: calc(28px + env(safe-area-inset-right, 0px)); width: 380px; max-width: calc(100vw - 32px); max-height: min(580px, calc(100vh - 140px)); max-height: min(580px, calc(100vh - 140px - env(safe-area-inset-bottom, 0px))); background: rgba(255,255,255,0.92); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.7); border-radius: 24px; box-shadow: 0 32px 80px rgba(0,11,51,0.22); z-index: 951; display: none; flex-direction: column; overflow: hidden; font-family: var(--pit-font-sans, "Space Grotesk", sans-serif); }',
    '.pitchat-panel.open { display: flex; }',
    '.pitchat-head { background: linear-gradient(140deg, #000B33 0%, #1A2E6B 70%, #2C4BA8 100%); padding: 18px 20px; display: flex; align-items: center; gap: 12px; }',
    '.pitchat-head-pipe { width: 8px; height: 8px; border-radius: 50%; background: #5B7FDE; box-shadow: 0 0 0 4px rgba(91,127,222,0.3); }',
    '.pitchat-head-title { color: #fff; font-weight: 600; font-size: var(--txt-sm, 15px); letter-spacing: -0.01em; flex: 1; }',
    '.pitchat-head-title small { display: block; font-weight: 400; font-size: var(--txt-2xs, 11px); letter-spacing: 0; text-transform: none; color: rgba(255,255,255,0.65); margin-top: 2px; }',
    '.pitchat-close { background: rgba(255,255,255,0.12); border: none; color: #fff; font-size: var(--txt-md, 17px); line-height: 1; cursor: pointer; width: 36px; height: 36px; border-radius: 50%; transition: background 0.2s ease; }',
    '.pitchat-close:hover { background: rgba(255,255,255,0.25); color: #fff; }',
    '.pitchat-msgs { flex: 1; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 10px; background: transparent; }',
    '.pitchat-msg { max-width: 85%; padding: 11px 15px; border-radius: 18px; font-size: var(--txt-sm, 15px); line-height: 1.55; white-space: pre-wrap; }',
    '.pitchat-msg.user { align-self: flex-end; background: #000B33; color: #fff; border-bottom-right-radius: 6px; }',
    '.pitchat-msg.bot { align-self: flex-start; background: #FFFFFF; border: 1px solid rgba(0,11,51,0.08); color: #000B33; border-bottom-left-radius: 6px; box-shadow: 0 4px 14px rgba(0,11,51,0.05); }',
    '.pitchat-msg.typing { color: #6F7C86; font-size: var(--txt-xs, 13px); }',
    '.pitchat-sugs { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 18px 14px; background: transparent; }',
    '.pitchat-sug { font-family: inherit; font-size: var(--txt-xs, 13px); font-weight: 500; color: #2563EB; background: #EFF4FE; border: 1px solid rgba(37,99,235,0.22); border-radius: 999px; padding: 8px 14px; cursor: pointer; transition: background 0.2s ease, transform 0.2s ease; }',
    '.pitchat-sug:hover { background: #FFFFFF; transform: translateY(-1px); }',
    '.pitchat-form { display: flex; gap: 8px; padding: 12px 14px; border-top: 1px solid rgba(0,11,51,0.06); background: rgba(255,255,255,0.7); }',
    // 16px en mobile: iOS Safari hace zoom a toda la pagina cuando el texto de
    // un input mide menos de 16px. Con el panel del chat abierto eso deja al
    // visitante con la pagina ampliada y el panel fuera de encuadre. Arriba de
    // 640px vuelve al tamano compacto.
    '.pitchat-input { flex: 1; border: 1px solid rgba(0,11,51,0.12); border-radius: 999px; outline: none; padding: 11px 18px; font-family: inherit; font-size: 16px; color: #000B33; min-width: 0; background: #FFFFFF; transition: border-color 0.2s ease; }',
    '@media (min-width: 640px) { .pitchat-input { font-size: var(--txt-sm, 15px); } }',
    '.pitchat-input:focus { border-color: #2563EB; }',
    '.pitchat-send { background: #2563EB; color: #fff; border: none; font-family: inherit; font-weight: 600; font-size: var(--txt-sm, 15px); width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0; cursor: pointer; transition: background 0.2s ease, transform 0.2s ease; }',
    '.pitchat-send:hover { background: #1E4FC4; transform: translateY(-1px); }',
    '.pitchat-send:disabled { background: #BFC7D6; cursor: default; transform: none; }',
    '.pitchat-note { font-size: var(--txt-2xs, 11px); color: #8B96A0; text-align: center; padding: 0 12px 10px; background: transparent; border-top: none; }',
    '@media (max-width: 480px) { .pitchat-panel { right: 16px; right: calc(16px + env(safe-area-inset-right, 0px)); bottom: 96px; bottom: calc(96px + env(safe-area-inset-bottom, 0px)); } .pitchat-fab { right: 20px; right: calc(20px + env(safe-area-inset-right, 0px)); bottom: 24px; bottom: calc(24px + env(safe-area-inset-bottom, 0px)); } .pitchat-fab-label { display: none; } .pitchat-fab { padding: 0; width: 56px; justify-content: center; } }'
  ].join('\n');

  function boot() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var fab = document.createElement('button');
    fab.className = 'pitchat-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Abrir asistente sobre PIT');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'pitchat-panel');
    fab.innerHTML = '<span class="pitchat-fab-dot" aria-hidden="true"></span><span class="pitchat-fab-label">Preguntale a PIT</span>';

    var panel = document.createElement('div');
    panel.className = 'pitchat-panel';
    panel.id = 'pitchat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Asistente PIT');
    panel.innerHTML =
      '<div class="pitchat-head">' +
        '<span class="pitchat-head-pipe" aria-hidden="true"></span>' +
        '<span class="pitchat-head-title">Asistente PIT<small>IA · Respuestas educativas</small></span>' +
        '<button class="pitchat-close" type="button" aria-label="Cerrar el asistente"><span aria-hidden="true">×</span></button>' +
      '</div>' +
      // role="log" + aria-live="polite": las respuestas del bot se agregan al
      // DOM sin ningún aviso. Sin región viva, quien usa lector de pantalla
      // escribe la pregunta y no se entera nunca de que llegó la respuesta.
      // aria-relevant="additions" para que solo se anuncie lo nuevo (el
      // "Escribiendo…" se borra al llegar la respuesta y no debe releerse).
      '<div class="pitchat-msgs" role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversación con el asistente"></div>' +
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

      // Llama a la función serverless (/api/chat), que a su vez llama a la API
      // de Anthropic con la key server-side. El prompt de sistema y los límites
      // viven en el servidor; acá solo mandamos el historial de la charla.
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-12) })
      }).then(function (r) {
        return r.json().then(function (data) {
          return { ok: r.ok, data: data };
        });
      }).then(function (res) {
        if (!res.ok || !res.data || !res.data.reply) {
          throw new Error('bad_response');
        }
        done(res.data.reply);
      }).catch(function () {
        typing.remove();
        add('bot', 'Uy, no pude responder en este momento. Probá de nuevo en unos segundos.');
        history.pop(); // quitamos el turno del usuario que no llegó a responderse
        busy = false;
        sendBtn.disabled = false;
        input.focus();
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value;
      input.value = '';
      send(v);
    });

    // El estado abierto/cerrado se refleja en aria-expanded del FAB: sin eso el
    // botón se anuncia igual esté el panel abierto o cerrado.
    function setOpen(open) {
      panel.classList.toggle('open', open);
      fab.setAttribute('aria-expanded', open ? 'true' : 'false');
      fab.setAttribute('aria-label', open ? 'Cerrar asistente sobre PIT' : 'Abrir asistente sobre PIT');
    }
    function close() {
      setOpen(false);
      fab.focus();   // al cerrar, el foco vuelve al botón que abrió el panel
    }

    fab.addEventListener('click', function () {
      var open = !panel.classList.contains('open');
      setOpen(open);
      if (open && !msgsEl.children.length) {
        add('bot', 'Hola 👋 Soy el asistente del sitio. Puedo contarte qué es PIT, cómo funciona y qué recursos gratuitos hay. ¿Qué querés saber?');
        renderSugs();
      }
      if (open) input.focus();
    });
    panel.querySelector('.pitchat-close').addEventListener('click', close);
    // Escape cierra: es un panel flotante que tapa contenido y hasta ahora la
    // única forma de salir era encontrar la × con el mouse o con Tab.
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') { e.stopPropagation(); close(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
