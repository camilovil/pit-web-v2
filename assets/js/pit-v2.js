// PIT v2 — drawer mobile (delegación en document, sobrevive re-renders)
(function () {
  if (window.__pitV2Nav) return;
  window.__pitV2Nav = true;
  document.addEventListener('click', function (e) {
    var burger = e.target.closest && e.target.closest('.v2-burger');
    var drawer = document.querySelector('.v2-drawer');
    if (burger && drawer) {
      var open = drawer.classList.toggle('open');
      burger.classList.toggle('open', open);
      return;
    }
    if (drawer && drawer.classList.contains('open') && e.target.closest('.v2-drawer a')) {
      drawer.classList.remove('open');
      var b = document.querySelector('.v2-burger');
      if (b) b.classList.remove('open');
    }
  });
})();
