// PIT — envío de formularios vía Formspree (AJAX, mantiene el estado de éxito en la página).
//
// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  CÓMO ACTIVARLO (una sola vez)                                             ║
// ║  1. Crear cuenta gratis en https://formspree.io                            ║
// ║  2. Crear DOS forms (New Form): uno "Foro PIT", otro "Contacto PIT".       ║
// ║     Poner como email de destino: ricardo.frusso@hospitalitaliano.org.ar    ║
// ║  3. Cada form da un endpoint tipo  https://formspree.io/f/abcdwxyz         ║
// ║     Pegar esos dos abajo, reemplazando el texto REEMPLAZAR-*.              ║
// ║                                                                            ║
// ║  Mientras digan REEMPLAZAR, los formularios andan en MODO DEMO:            ║
// ║  muestran el mensaje de éxito pero NO envían nada (ideal para staging).    ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
(function () {
  // Endpoint reutilizado del sitio actual (drricardofrusso.com). Foro y contacto
  // comparten form: se distinguen por el _subject y el campo `tipo` de cada envío.
  var ENDPOINTS = {
    foro:     'https://formspree.io/f/xykvrdad',
    contacto: 'https://formspree.io/f/xykvrdad'
  };

  function configured(url) {
    return typeof url === 'string' && url.indexOf('REEMPLAZAR') === -1;
  }

  // ¿El endpoint de este form ya está configurado? (por si el UI quiere avisarlo)
  window.pitFormsReady = function (kind) { return configured(ENDPOINTS[kind]); };

  // Envía `data` (objeto plano) al endpoint de `kind`. Devuelve Promise<{ok, demo}>.
  // En modo demo resuelve ok:true sin tocar la red.
  window.pitSubmit = function (kind, data) {
    var url = ENDPOINTS[kind];
    if (!configured(url)) {
      return new Promise(function (resolve) {
        setTimeout(function () { resolve({ ok: true, demo: true }); }, 400);
      });
    }
    return fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (body) {
        return { ok: r.ok, demo: false, body: body };
      });
    }).catch(function () {
      return { ok: false, demo: false };
    });
  };
})();
