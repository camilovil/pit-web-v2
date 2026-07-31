// PIT — Botón "volver arriba", apilado sobre el FAB del asistente IA.
// Aparece recién al bajar scroll; respeta prefers-reduced-motion.
(function () {
  if (window.__pitScrollTop) return;
  window.__pitScrollTop = true;

  var SHOW_AFTER_PX = 480; // aprox. una pantalla de scroll

  var css = [
    // Las dos declaraciones de inset-inline-end/bottom son a propósito: la
    // primera es el valor de siempre y la segunda le suma el área segura del
    // dispositivo (indicador de gesto del iPhone, esquinas redondeadas). Un
    // navegador sin env() descarta la segunda y se queda con la primera; si
    // dejáramos SOLO la versión con env(), ese navegador tiraría la declaración
    // entera y el botón se iría al borde superior.
    // La propiedad es lógica para que el botón se espeje en RTL;
    // env(safe-area-inset-right) sigue siendo físico a propósito: describe el
    // recorte del hardware, que no depende de la dirección del texto.
    '.pit-scrolltop { position: fixed; inset-inline-end: 28px; inset-inline-end: calc(28px + env(safe-area-inset-right, 0px)); bottom: 96px; bottom: calc(96px + env(safe-area-inset-bottom, 0px)); width: 48px; height: 48px; border-radius: 50%; background: #000B33; border: none; cursor: pointer; z-index: 949; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 32px rgba(0,11,51,0.3); opacity: 0; visibility: hidden; transform: translateY(8px); transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s, box-shadow 0.2s ease; }',
    '.pit-scrolltop.show { opacity: 1; visibility: visible; transform: none; }',
    '.pit-scrolltop:hover { box-shadow: 0 16px 40px rgba(0,11,51,0.4); }',
    '.pit-scrolltop svg { width: 18px; height: 18px; }',
    '@media (max-width: 480px) { .pit-scrolltop { inset-inline-end: 20px; inset-inline-end: calc(20px + env(safe-area-inset-right, 0px)); bottom: 92px; bottom: calc(92px + env(safe-area-inset-bottom, 0px)); width: 44px; height: 44px; } }'
  ].join('\n');

  function boot() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var btn = document.createElement('button');
    btn.className = 'pit-scrolltop';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Volver arriba');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(btn);

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    var ticking = false;
    function updateVisibility() {
      btn.classList.toggle('show', window.scrollY > SHOW_AFTER_PX);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateVisibility);
    }, { passive: true });
    updateVisibility();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
