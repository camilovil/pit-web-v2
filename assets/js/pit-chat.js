// PIT — Asistente del sitio (sin IA): preguntas y respuestas fijas.
//
// Las respuestas NO se escriben acá: salen de _content/bot.json y de las
// preguntas frecuentes publicadas (faq.html, jornada-pit.html), que
// _build/sync-bot.js junta en assets/js/pit-bot-data.js. Este archivo solo
// dibuja el widget, carga esa base la primera vez que alguien lo abre y busca
// la respuesta que mejor coincide con lo que se escribió. No hay servidor ni
// API: todo pasa en el navegador y no tiene costo.
(function () {
  if (window.__pitChat) return;
  window.__pitChat = true;

  var DATOS = '/assets/js/pit-bot-data.js?v=1';

  function tr(text) {
    return window.pitTranslate ? window.pitTranslate(text) : text;
  }

  var css = [
    // inset-inline-end/bottom van declarados dos veces a propósito: el valor de
    // siempre y después el mismo valor + el área segura del dispositivo
    // (indicador de gesto del iPhone, esquinas redondeadas). Sin esto el FAB —
    // que es el control flotante permanente del sitio — cae dentro de la zona
    // de swipe del sistema. Un navegador sin env() descarta la segunda
    // declaración y se queda con la primera; si dejáramos solo la versión con
    // env(), tiraría la declaración entera y el botón se iría al borde superior.
    // La propiedad es lógica (inset-inline-end) para que en un idioma RTL el
    // widget se espeje al lado contrario. env(safe-area-inset-right) sigue
    // siendo físico porque lo define el hardware, no la dirección del texto:
    // es el recorte de la pantalla y no se espeja.
    '.pitchat-fab { position: fixed; bottom: 28px; bottom: calc(28px + env(safe-area-inset-bottom, 0px)); inset-inline-end: 28px; inset-inline-end: calc(28px + env(safe-area-inset-right, 0px)); height: 56px; padding: 0 22px 0 18px; border-radius: 999px; background: #000B33; border: none; cursor: pointer; z-index: 950; display: flex; align-items: center; gap: 10px; box-shadow: 0 16px 40px rgba(0,11,51,0.35); transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease; font-family: var(--pit-font-sans, "Space Grotesk", sans-serif); }',
    '.pitchat-fab:hover { transform: translateY(-3px); box-shadow: 0 22px 52px rgba(0,11,51,0.45); }',
    '.pitchat-fab-dot { width: 8px; height: 8px; border-radius: 50%; background: #5B7FDE; box-shadow: 0 0 0 4px rgba(91,127,222,0.25); }',
    '.pitchat-fab-icon { display: none; width: 24px; height: 24px; color: #FFFFFF; }',
    '.pitchat-fab-label { color: #fff; font-weight: 600; font-size: var(--txt-sm, 15px); letter-spacing: -0.01em; }',
    // El max-height también resta el área segura: si el panel sube por el
    // inset pero conserva su alto, el borde de arriba se mete debajo del nav.
    '.pitchat-panel { position: fixed; bottom: 100px; bottom: calc(100px + env(safe-area-inset-bottom, 0px)); inset-inline-end: 28px; inset-inline-end: calc(28px + env(safe-area-inset-right, 0px)); width: 380px; max-width: calc(100vw - 32px); max-height: min(580px, calc(100vh - 140px)); max-height: min(580px, calc(100vh - 140px - env(safe-area-inset-bottom, 0px))); box-sizing: border-box; background: rgba(255,255,255,0.92); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.7); border-radius: 24px; box-shadow: 0 32px 80px rgba(0,11,51,0.22); z-index: 951; display: none; flex-direction: column; overflow: hidden; font-family: var(--pit-font-sans, "Space Grotesk", sans-serif); }',
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
    '.pitchat-enlaces { align-self: flex-start; display: flex; flex-wrap: wrap; gap: 8px; margin-top: -2px; }',
    '.pitchat-enlace { min-height: 44px; box-sizing: border-box; display: inline-flex; align-items: center; font-family: var(--pit-font-mono, ui-monospace, monospace); font-size: var(--txt-2xs, 11px); font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #000B33; background: #FFFFFF; border: 1px solid rgba(0,11,51,0.22); border-radius: 999px; padding: 9px 14px; text-decoration: none; transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease; }',
    '.pitchat-enlace:hover { background: #000B33; border-color: #000B33; color: #FFFFFF; }',
    '.pitchat-sugs { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 18px 14px; background: transparent; }',
    '.pitchat-sug { min-height: 44px; box-sizing: border-box; font-family: inherit; font-size: var(--txt-xs, 13px); font-weight: 500; color: #2563EB; background: #EFF4FE; border: 1px solid rgba(37,99,235,0.22); border-radius: 999px; padding: 8px 14px; cursor: pointer; transition: background 0.2s ease, transform 0.2s ease; }',
    '.pitchat-sug:hover { background: #FFFFFF; transform: translateY(-1px); }',
    '.pitchat-form { display: flex; gap: 8px; padding: 12px 14px; border-top: 1px solid rgba(0,11,51,0.06); background: rgba(255,255,255,0.7); }',
    // 16px en mobile: iOS Safari hace zoom a toda la pagina cuando el texto de
    // un input mide menos de 16px. Con el panel del chat abierto eso deja al
    // visitante con la pagina ampliada y el panel fuera de encuadre. Arriba de
    // 640px vuelve al tamano compacto.
    '.pitchat-input { flex: 1; border: 1px solid rgba(0,11,51,0.12); border-radius: 999px; outline: none; padding: 11px 18px; font-family: inherit; font-size: 16px; color: #000B33; min-width: 0; background: #FFFFFF; transition: border-color 0.2s ease; }',
    '@media (min-width: 640px) { .pitchat-input { font-size: var(--txt-sm, 15px); } }',
    '.pitchat-input:focus { border-color: #2563EB; }',
    '.pitchat-send { background: #2563EB; color: #fff; border: none; font-family: inherit; font-weight: 600; font-size: var(--txt-sm, 15px); width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0; cursor: pointer; transition: background 0.2s ease, transform 0.2s ease; }',
    '.pitchat-send:hover { background: #1E4FC4; transform: translateY(-1px); }',
    '.pitchat-send:disabled { background: #BFC7D6; cursor: default; transform: none; }',
    '.pitchat-note { font-size: var(--txt-2xs, 11px); color: #5F6C78; text-align: center; padding: 0 12px 10px; background: transparent; border-top: none; }',
    '@media (max-width: 480px) { .pitchat-panel { inset-inline-end: 16px; inset-inline-end: calc(16px + env(safe-area-inset-right, 0px)); bottom: 96px; bottom: calc(96px + env(safe-area-inset-bottom, 0px)); } .pitchat-fab { inset-inline-end: 20px; inset-inline-end: calc(20px + env(safe-area-inset-right, 0px)); bottom: 24px; bottom: calc(24px + env(safe-area-inset-bottom, 0px)); padding: 0; width: 56px; justify-content: center; } .pitchat-fab-label, .pitchat-fab-dot { display: none; } .pitchat-fab-icon { display: block; } .pitchat-close { width: 44px; height: 44px; flex: 0 0 44px; } }'
  ].join('\n');

  // ── Búsqueda ─────────────────────────────────────────────────────────────
  // Sin tildes, sin mayúsculas y sin signos: "¿Cuánto sale?" y "cuanto sale"
  // son lo mismo. Las claves matchean también el comienzo de una palabra
  // ("sesion" encuentra "sesiones").
  function norm(t) {
    return (' ' + String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ') + ' ').replace(/\s+/g, ' ');
  }
  var VACIAS = ' que de la el los las un una unos unas y o u en es son se me mi mis por para con como cual cuales cuanto cuanta cuantos a al del lo le les hay tiene tienen tengo puedo puede quiero queria saber sobre si no su sus te tu tus mas muy eso esto este esta estan ser hola buenas buen dia gracias favor pit ';
  function palabras(t) {
    return norm(t).trim().split(' ').filter(function (w) { return w.length > 2 && VACIAS.indexOf(' ' + w + ' ') === -1; });
  }
  function puntaje(e, q) {
    var qn = norm(q), s = 0;
    (e.claves || []).forEach(function (c) {
      var cn = norm(c).trim();
      if (cn && qn.indexOf(' ' + cn) !== -1) s += 2 + (cn.split(' ').length - 1) * 1.5;   // frase más larga, más peso
    });
    var pp = palabras(e.pregunta);
    palabras(q).forEach(function (w) {
      var raiz = w.slice(0, 5);
      if (pp.some(function (x) { return x.slice(0, 5) === raiz; })) s += 1;
    });
    return s;
  }
  function buscar(base, q) {
    return base.entradas
      .map(function (e) { return { e: e, s: puntaje(e, q) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s; });
  }

  function boot() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var fab = document.createElement('button');
    fab.className = 'pitchat-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', tr('Abrir asistente sobre PIT'));
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'pitchat-panel');
    fab.innerHTML = '<span class="pitchat-fab-dot" aria-hidden="true"></span><svg class="pitchat-fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg><span class="pitchat-fab-label">' + tr('Preguntale a PIT') + '</span>';

    var panel = document.createElement('div');
    panel.className = 'pitchat-panel';
    panel.id = 'pitchat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', tr('Asistente PIT'));
    panel.innerHTML =
      '<div class="pitchat-head">' +
        '<span class="pitchat-head-pipe" aria-hidden="true"></span>' +
        '<span class="pitchat-head-title">' + tr('Asistente PIT') + '<small>' + tr('Preguntas frecuentes del sitio') + '</small></span>' +
        '<button class="pitchat-close" type="button" aria-label="' + tr('Cerrar el asistente') + '"><span aria-hidden="true">×</span></button>' +
      '</div>' +
      // role="log" + aria-live="polite": las respuestas se agregan al DOM sin
      // ningún aviso. Sin región viva, quien usa lector de pantalla escribe la
      // pregunta y no se entera de que llegó la respuesta.
      '<div class="pitchat-msgs" role="log" aria-live="polite" aria-relevant="additions" aria-label="' + tr('Conversación con el asistente') + '"></div>' +
      '<div class="pitchat-sugs"></div>' +
      '<form class="pitchat-form">' +
        '<input class="pitchat-input" type="text" aria-label="' + tr('Escribí tu pregunta sobre PIT') + '" placeholder="' + tr('Preguntá sobre PIT…') + '" maxlength="200" enterkeyhint="send">' +
        '<button class="pitchat-send" type="submit" aria-label="' + tr('Enviar pregunta') + '">→</button>' +
      '</form>' +
      '<div class="pitchat-note">' + tr('No reemplaza una consulta médica') + '</div>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    var msgsEl = panel.querySelector('.pitchat-msgs');
    var sugsEl = panel.querySelector('.pitchat-sugs');
    var form = panel.querySelector('.pitchat-form');
    var input = panel.querySelector('.pitchat-input');
    var sendBtn = panel.querySelector('.pitchat-send');
    var base = null;
    var busy = false;

    function add(role, text) {
      var d = document.createElement('div');
      d.className = 'pitchat-msg ' + role;
      d.textContent = text;
      msgsEl.appendChild(d);
      msgsEl.scrollTop = msgsEl.scrollHeight;
      return d;
    }

    // Los enlaces salen de la base, que el build ya validó; igual se aceptan
    // solo rutas internas y cada <a> se arma con textContent.
    function addEnlaces(enlaces) {
      if (!enlaces || !enlaces.length) return;
      var box = document.createElement('div');
      box.className = 'pitchat-enlaces';
      enlaces.forEach(function (e) {
        if (!e || typeof e.href !== 'string' || e.href.charAt(0) !== '/' || e.href.charAt(1) === '/') return;
        var a = document.createElement('a');
        a.className = 'pitchat-enlace';
        a.href = e.href;
        a.textContent = tr(e.texto) + ' →';
        box.appendChild(a);
      });
      if (box.childNodes.length) { msgsEl.appendChild(box); msgsEl.scrollTop = msgsEl.scrollHeight; }
    }

    function porId(id) {
      for (var i = 0; i < base.entradas.length; i++) if (base.entradas[i].id === id) return base.entradas[i];
      return null;
    }

    // Botones de preguntas: cada uno tiene el texto que se muestra y la
    // entrada que responde, así tocarlo nunca depende de la búsqueda.
    function chips(lista) {
      sugsEl.innerHTML = '';
      lista.forEach(function (c) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'pitchat-sug';
        b.textContent = tr(c.texto);
        b.addEventListener('click', function () {
          if (c.id === '__temas') { temas(); return; }   // vuelve a mostrar los temas, sin responder nada
          responder(c.texto, porId(c.id));
        });
        sugsEl.appendChild(b);
      });
    }
    function temas() { chips(base.temas); }
    function relacionadas(e) {
      var lista = (e.relacionadas || []).map(porId).filter(Boolean).slice(0, 3)
        .map(function (r) { return { texto: r.pregunta, id: r.id }; });
      lista.push({ texto: 'Otros temas', id: '__temas' });
      chips(lista);
    }

    function responder(pregunta, entrada) {
      if (busy) return;
      var preguntaEl = add('user', pregunta);
      busy = true;
      sendBtn.disabled = true;
      sugsEl.innerHTML = '';
      var typing = add('bot typing', tr('Escribiendo…'));
      var resultados = entrada ? [] : buscar(base, pregunta);
      if (!entrada && resultados.length && resultados[0].s >= 2) entrada = resultados[0].e;
      // Una pausa corta para que la respuesta no aparezca de golpe.
      setTimeout(function () {
        typing.remove();
        if (entrada) {
          add('bot', entrada.respuesta);
          addEnlaces(entrada.enlaces);
          relacionadas(entrada);
        } else {
          add('bot', base.sin_respuesta);
          var parecidas = resultados.slice(0, 3).map(function (r) { return { texto: r.e.pregunta, id: r.e.id }; });
          if (parecidas.length) { parecidas.push({ texto: 'Otros temas', id: '__temas' }); chips(parecidas); }
          else temas();
          addEnlaces([{ texto: 'Escribinos', href: '/contacto' }, { texto: 'Preguntar en el foro', href: '/foro#pregunta' }]);
        }
        // Que se lea desde la pregunta: con una respuesta larga, quedarse
        // abajo de todo obligaba a subir para encontrar dónde empezaba.
        msgsEl.scrollTop += preguntaEl.getBoundingClientRect().top - msgsEl.getBoundingClientRect().top - 12;
        busy = false;
        sendBtn.disabled = false;
      }, 380);
    }

    function cargar(listo) {
      if (base) return listo();
      var typing = add('bot typing', tr('Escribiendo…'));
      var s = document.createElement('script');
      s.src = DATOS;
      s.onload = function () {
        typing.remove();
        base = window.PIT_BOT;
        if (base) listo();
        else add('bot', tr('No pude cargar las respuestas. Probá de nuevo en unos segundos, o escribinos desde Contacto.'));
      };
      s.onerror = function () {
        typing.remove();
        add('bot', tr('No pude cargar las respuestas. Probá de nuevo en unos segundos, o escribinos desde Contacto.'));
        s.remove();
      };
      document.head.appendChild(s);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v || busy) return;
      input.value = '';
      cargar(function () { responder(v, null); });
    });

    // El estado abierto/cerrado se refleja en aria-expanded del FAB: sin eso el
    // botón se anuncia igual esté el panel abierto o cerrado.
    function setOpen(open) {
      panel.classList.toggle('open', open);
      fab.setAttribute('aria-expanded', open ? 'true' : 'false');
      fab.setAttribute('aria-label', tr(open ? 'Cerrar asistente sobre PIT' : 'Abrir asistente sobre PIT'));
    }
    function close() {
      setOpen(false);
      fab.focus();   // al cerrar, el foco vuelve al botón que abrió el panel
    }

    fab.addEventListener('click', function () {
      var open = !panel.classList.contains('open');
      setOpen(open);
      if (open && !msgsEl.children.length) {
        cargar(function () { add('bot', base.saludo); temas(); });
      }
      // En el celular no se enfoca el campo al abrir: abriría el teclado y
      // taparía los botones de temas, que es por donde empieza casi todo el mundo.
      if (open && window.matchMedia && matchMedia('(hover: hover)').matches) input.focus();
    });
    panel.querySelector('.pitchat-close').addEventListener('click', close);
    // Escape cierra: es un panel flotante que tapa contenido.
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') { e.stopPropagation(); close(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
