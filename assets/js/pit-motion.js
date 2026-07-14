// PIT — reveal de secciones al hacer scroll (progresivo y a prueba de fallas)
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  function show(el) { el.classList.add('pit-in'); }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  var seen = [];
  // Mobile (sin hover): el subrayado se revela al entrar en pantalla.
  // Los spans .hover-underline vienen en el markup (como en el sitio oficial).
  var canHover = window.matchMedia && matchMedia('(hover: hover)').matches;
  var uio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('visible'); uio.unobserve(en.target); }
    });
  }, { threshold: 0.6 });
  var useen = [];
  function underlines() {
    if (canHover) return;
    var spans = document.querySelectorAll('.hover-underline');
    for (var i = 0; i < spans.length; i++) {
      if (useen.indexOf(spans[i]) !== -1) continue;
      useen.push(spans[i]);
      uio.observe(spans[i]);
    }
  }
  function scan() {
    var els = document.querySelectorAll('section');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (seen.indexOf(el) !== -1) continue;
      seen.push(el);
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        // ya visible: no ocultar nunca lo que está en pantalla
        continue;
      }
      el.classList.add('pit-reveal');
      io.observe(el);
    }
    underlines();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  } else { scan(); }
  var n = 0;
  var t = setInterval(function () { scan(); if (++n > 12) clearInterval(t); }, 400);

  // red de seguridad: si IO no dispara (print, embeds, throttling), mostrar todo
  setTimeout(function () {
    document.querySelectorAll('.pit-reveal:not(.pit-in)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) show(el);
    });
  }, 1200);
  setTimeout(function () {
    document.querySelectorAll('.pit-reveal:not(.pit-in)').forEach(show);
  }, 3500);
  window.addEventListener('beforeprint', function () {
    document.querySelectorAll('.pit-reveal:not(.pit-in)').forEach(show);
  });
})();
