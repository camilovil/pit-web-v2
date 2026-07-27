// PIT — reveal de secciones al hacer scroll (progresivo y a prueba de fallas)
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) {
    // Sin IntersectionObserver no podemos revelar al scroll. Los hijos de
    // .pit-stagger arrancan invisibles por CSS (el markup ya trae la clase),
    // así que hay que mostrarlos a mano o el contenido no se ve nunca.
    var showAll = function () {
      var els = document.querySelectorAll('.pit-stagger');
      for (var i = 0; i < els.length; i++) els[i].classList.add('pit-in');
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showAll);
    else showAll();
    return;
  }

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
  // Stagger (.pit-stagger): se maneja aparte de las secciones a propósito.
  // Los hijos arrancan en opacity:0 vía CSS, así que si dependiéramos del
  // .pit-in de la sección padre quedarían invisibles para siempre cuando la
  // sección ya está en pantalla al cargar (ese caso hace `continue` abajo).
  var sio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('pit-in'); sio.unobserve(en.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  var sseen = [];
  function staggers() {
    var els = document.querySelectorAll('.pit-stagger');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (sseen.indexOf(el) !== -1) continue;
      sseen.push(el);
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.classList.add('pit-in'); // ya visible: mostrar sin esperar al observer
        continue;
      }
      sio.observe(el);
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
    staggers();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  } else { scan(); }
  var n = 0;
  var t = setInterval(function () { scan(); if (++n > 12) clearInterval(t); }, 400);

  // red de seguridad: si IO no dispara (print, embeds, throttling), mostrar todo.
  // Incluye .pit-stagger: sus hijos arrancan invisibles, así que nunca pueden
  // quedar sin .pit-in.
  var HIDDEN = '.pit-reveal:not(.pit-in), .pit-stagger:not(.pit-in)';
  setTimeout(function () {
    document.querySelectorAll(HIDDEN).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) show(el);
    });
  }, 1200);
  setTimeout(function () {
    document.querySelectorAll(HIDDEN).forEach(show);
  }, 3500);
  window.addEventListener('beforeprint', function () {
    document.querySelectorAll(HIDDEN).forEach(show);
  });
})();
