// PIT v2 — drawer mobile (delegación en document, sobrevive re-renders)
(function () {
  if (window.__pitV2Nav) return;
  window.__pitV2Nav = true;

  // El estado visual (clase .open) y el estado accesible (aria-expanded +
  // etiqueta) se mueven SIEMPRE juntos: si se separan, el lector de pantalla
  // anuncia "Abrir menú, contraído" con el menú abierto en pantalla.
  // Copia inline equivalente en index.html — mantener las dos iguales.
  function setOpen(drawer, burger, open) {
    drawer.classList.toggle('open', open);
    if (!burger) return;
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }

  document.addEventListener('click', function (e) {
    var burger = e.target.closest && e.target.closest('.v2-burger');
    var drawer = document.querySelector('.v2-drawer');
    if (burger && drawer) {
      setOpen(drawer, burger, !drawer.classList.contains('open'));
      return;
    }
    if (drawer && drawer.classList.contains('open') && e.target.closest('.v2-drawer a')) {
      setOpen(drawer, document.querySelector('.v2-burger'), false);
    }
  });

  // Escape cierra el menú y devuelve el foco al burger: el drawer ocupa la
  // pantalla entera y sin esto la única salida por teclado era tabular hasta
  // el final de la lista.
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' && e.key !== 'Esc') return;
    var drawer = document.querySelector('.v2-drawer');
    if (!drawer || !drawer.classList.contains('open')) return;
    var burger = document.querySelector('.v2-burger');
    setOpen(drawer, burger, false);
    if (burger) burger.focus();
  });
})();
