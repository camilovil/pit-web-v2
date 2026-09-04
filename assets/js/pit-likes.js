(function () {
  'use strict';
  var box = document.querySelector('.foro-acciones');
  if (!box) return;
  var button = box.querySelector('[data-like]');
  var label = box.querySelector('[data-like-txt]');
  var count = box.querySelector('[data-like-count]');
  var status = document.querySelector('[data-like-status]');
  var slug = box.getAttribute('data-slug');
  var liked = false, ready = false, busy = false, pending = null;

  function english() { return document.documentElement.lang === 'en'; }
  function paint(data) {
    liked = data.liked;
    ready = true;
    button.setAttribute('aria-pressed', String(liked));
    label.textContent = english() ? (liked ? 'Liked' : 'Like') : (liked ? 'Te gusta' : 'Me gusta');
    count.textContent = String(data.count);
    count.hidden = false;
    status.textContent = '';
    status.hidden = true;
  }
  async function request(value) {
    var writing = typeof value === 'boolean';
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 8000);
    try {
      var response = await fetch('/api/likes' + (writing ? '' : '?slug=' + encodeURIComponent(slug)), {
        method: writing ? 'POST' : 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: writing ? { 'Content-Type': 'application/json' } : {},
        body: writing ? JSON.stringify({ slug: slug, liked: value }) : undefined,
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Likes unavailable');
      var data = await response.json();
      if (!Number.isSafeInteger(data.count) || data.count < 0 || typeof data.liked !== 'boolean') throw new Error('Invalid count');
      paint(data);
    } finally { clearTimeout(timer); }
  }
  async function update(change) {
    if (busy) return;
    busy = true;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    try {
      if (!ready || !change) await request();
      if (change) {
        if (pending === null) pending = !liked;
        await request(pending);
        pending = null;
      }
    } catch {
      // Retry the same desired state if a timed-out write already succeeded.
      ready = false;
      status.textContent = english()
        ? 'Could not connect. Try again.'
        : 'No se pudo conectar. Volvé a intentar.';
      status.hidden = false;
    } finally {
      busy = false;
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  }
  button.addEventListener('click', function () { update(true); });
  window.addEventListener('focus', function () { update(false); });
  update(false);
})();
