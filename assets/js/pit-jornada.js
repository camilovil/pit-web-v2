// PIT — pop-up de la Jornada P.I.T. (sábado 14.11.2026)
//
// QUÉ HACE
// Al entrar a cualquier página del sitio muestra el flyer de la Jornada con un
// botón a /jornada-pit. Aparece una vez por día por visitante (localStorage),
// nunca en la propia /jornada-pit, y deja de existir solo después del evento:
// no hace falta acordarse de sacarlo el 15.11.
//
// POR QUÉ ES UN SCRIPT Y NO MARKUP
// El sitio tiene cuatro plantillas (convert.js, foro.js, index.html y
// curso-intro.html). Un solo archivo cargado en las cuatro evita copiar el
// mismo bloque en cada una. Los estilos van acá adentro por lo mismo: la home
// no carga pit-v2.css.
//
// PARA RETIRARLO ANTES: borrar las cuatro líneas <script src="…pit-jornada.js">
// (o poner FIN en una fecha pasada).
(function () {
  'use strict';
  var FIN = Date.UTC(2026, 10, 15, 3);           // 15.11.2026 00:00 en Buenos Aires
  var KEY = 'pit-jornada-popup';
  var CADA = 24 * 60 * 60 * 1000;                // vuelve a aparecer al día siguiente
  var DEMORA = 1200;

  if (Date.now() >= FIN) return;
  if (/\/jornada-pit(\.html)?\/?$/.test(location.pathname)) return;
  if (!window.HTMLDialogElement) return;

  function visto() { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } }
  function marcar() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} }
  if (Date.now() - visto() < CADA) return;

  var css = ''
    + '.pj-modal{border:0;padding:0;background:transparent;max-width:min(440px,calc(100vw - 32px));max-height:calc(100dvh - 24px);overflow:visible;color:#000B33;font-family:var(--pit-font-sans,"Space Grotesk",system-ui,sans-serif)}'
    + '.pj-modal::backdrop{background:rgba(0,11,51,.72);backdrop-filter:blur(4px)}'
    + '.pj-modal[open]{animation:pj-in .35s cubic-bezier(.22,1,.36,1)}'
    + '@keyframes pj-in{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:none}}'
    + '@media (prefers-reduced-motion:reduce){.pj-modal[open]{animation:none}}'
    + '.pj-card{position:relative;background:#FAFAF7;border-radius:20px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.45)}'
    + '.pj-flyer{display:block;line-height:0}'
    + '.pj-flyer img{display:block;width:100%;height:auto;max-height:calc(100dvh - 150px);object-fit:cover;object-position:top}'
    + '.pj-acc{display:flex;gap:10px;align-items:center;padding:14px 16px 16px}'
    + '.pj-cta{flex:1;display:inline-flex;align-items:center;justify-content:center;min-height:48px;border-radius:999px;background:#2563EB;color:#fff;font-weight:600;font-size:16px;text-decoration:none}'
    + '.pj-cta:hover{background:#1E4FC4;color:#fff}'
    + '.pj-no{min-height:48px;padding:0 16px;border:0;background:none;color:#4B5766;font:inherit;font-size:14px;cursor:pointer;border-radius:999px}'
    + '.pj-no:hover{color:#000B33;background:#EFF1F5}'
    + '.pj-x{position:absolute;top:10px;right:10px;width:40px;height:40px;border-radius:50%;border:0;background:rgba(10,10,10,.6);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center}'
    + '.pj-x:hover{background:#0A0A0A}'
    + '.pj-x:focus-visible,.pj-cta:focus-visible,.pj-no:focus-visible{outline:3px solid #5B8CFF;outline-offset:2px}'
    + '.pj-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}';

  function abrir() {
    // Si la persona tiene abierto el panel de privacidad, no se le pone otro
    // modal encima: se reintenta en un rato.
    var priv = document.querySelector('[data-privacy-dialog]');
    if (priv && priv.open) { setTimeout(abrir, 4000); return; }

    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    var d = document.createElement('dialog');
    d.className = 'pj-modal';
    d.setAttribute('aria-labelledby', 'pj-tit');
    d.innerHTML = ''
      + '<div class="pj-card">'
      + '<h2 class="pj-sr" id="pj-tit">Jornada P.I.T. · sábado 14 de noviembre</h2>'
      + '<a class="pj-flyer" href="/jornada-pit" data-pj-ir>'
      + '<img src="/img/jornada/flyer-sm.webp" width="640" height="800" alt="Jornada P.I.T., inauguración de la Escuela PIT, sede Palermo. Un día de práctica con pacientes reales junto al Dr. Ricardo D. Frusso. Sábado 14.11, 9:15 a 17:30 hs, presencial o virtual, para médicos de todos los niveles.">'
      + '</a>'
      + '<button type="button" class="pj-x" data-pj-cerrar aria-label="Cerrar"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'
      + '<div class="pj-acc">'
      + '<a class="pj-cta" href="/jornada-pit" data-pj-ir>Más info →</a>'
      + '<button type="button" class="pj-no" data-pj-cerrar>Ahora no</button>'
      + '</div>'
      + '</div>';
    document.body.appendChild(d);

    d.addEventListener('click', function (e) {
      if (e.target === d || e.target.closest('[data-pj-cerrar]')) d.close();
    });
    d.addEventListener('close', function () { marcar(); d.remove(); st.remove(); });
    d.querySelectorAll('[data-pj-ir]').forEach(function (a) { a.addEventListener('click', marcar); });

    d.showModal();
    // El foco va al botón principal y no a la X: es lo que la mayoría quiere hacer.
    var cta = d.querySelector('.pj-cta');
    if (cta) cta.focus({ preventScroll: true });
  }

  function programar() { setTimeout(abrir, DEMORA); }
  if (document.readyState === 'complete') programar();
  else window.addEventListener('load', programar);
})();
