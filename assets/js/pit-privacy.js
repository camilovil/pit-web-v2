(function () {
  'use strict';
  var KEY = 'pit-privacy-choice';
  var banner = document.querySelector('[data-privacy-banner]');
  var dialog = document.querySelector('[data-privacy-dialog]');
  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(value) { try { localStorage.setItem(KEY, value); } catch (e) {} }
  function activate(block) {
    var template = block.querySelector('template[data-external-template]');
    if (!template) return;
    block.classList.add('is-loaded');
    block.replaceChildren(template.content.cloneNode(true));
  }
  function activateAll() { document.querySelectorAll('.pit-external').forEach(activate); }
  function choose(value) {
    var wasExternal = getChoice() === 'external';
    setChoice(value);
    if (banner) banner.hidden = true;
    if (dialog && dialog.open) dialog.close();
    if (value === 'external') activateAll();
    else if (wasExternal) location.reload();
  }
  document.addEventListener('click', function (event) {
    var open = event.target.closest('[data-privacy-open]');
    if (open) { if (dialog && dialog.showModal) dialog.showModal(); return; }
    var choice = event.target.closest('[data-privacy-choice]');
    if (choice) { choose(choice.getAttribute('data-privacy-choice')); return; }
    var load = event.target.closest('[data-external-load]');
    if (load) { choose('external'); activateAll(); }
  });
  if (getChoice() === 'external') activateAll();
  if (banner) banner.hidden = !!getChoice();
})();
