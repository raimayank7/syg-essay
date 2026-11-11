/* essays: copy / listen / WhatsApp for each essay block; topic filter and recently read list on the home page */
(function () {
  'use strict';
  var d = document, SYG = window.SYG, speaking = null;
  function textOf(sec) {
    var box = sec.querySelector('.es-text'), parts = [];
    if (box.tagName === 'OL') box.querySelectorAll('li').forEach(function (li, i) { parts.push((i + 1) + '. ' + li.textContent.trim()); });
    else box.querySelectorAll('p').forEach(function (p) { parts.push(p.textContent.trim()); });
    return sec.querySelector('h2').textContent.trim() + '\n\n' + parts.join(box.tagName === 'OL' ? '\n' : '\n\n');
  }
  function stop() { if (window.speechSynthesis) speechSynthesis.cancel(); if (speaking) { speaking.textContent = 'Listen'; speaking = null; } }
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-es]'); if (!b) return;
    var sec = b.closest('.es'), act = b.getAttribute('data-es'), t = textOf(sec);
    if (act === 'copy') SYG.copy(t, 'Essay copied');
    else if (act === 'wa') window.open('https://wa.me/?text=' + encodeURIComponent(t + '\n\n' + location.href.split('#')[0]), '_blank', 'noopener');
    else if (act === 'say') {
      if (!window.speechSynthesis) { SYG.toast('Your browser cannot read aloud'); return; }
      if (speaking === b) { stop(); return; }
      stop();
      var lang = b.getAttribute('data-lang'), u = new SpeechSynthesisUtterance(t.replace(/_{3,}/g, ' blank '));
      u.lang = lang; u.rate = 0.9;
      var v = speechSynthesis.getVoices().filter(function (x) { return x.lang.replace('_', '-').toLowerCase().indexOf(lang.slice(0, 2)) === 0; });
      var best = v.filter(function (x) { return /IN/i.test(x.lang); })[0] || v[0];
      if (lang === 'hi-IN' && !best) { SYG.toast('No Hindi voice on this device'); return; }
      if (best) u.voice = best;
      u.onend = u.onerror = function () { if (speaking === b) { b.textContent = 'Listen'; speaking = null; } };
      speaking = b; b.textContent = 'Stop'; speechSynthesis.speak(u);
    }
  });
  window.addEventListener('pagehide', stop);
  if (window.speechSynthesis) speechSynthesis.getVoices();

  var q = d.querySelector('[data-filter]');
  if (q) {
    var items = d.querySelectorAll('[data-list] li'), none = d.querySelector('[data-none]');
    q.addEventListener('input', function () {
      var words = q.value.toLowerCase().split(/\s+/).filter(Boolean), shown = 0;
      items.forEach(function (li) { var s = li.getAttribute('data-q'), ok = words.every(function (w) { return s.indexOf(w) > -1; }); li.hidden = !ok; if (ok) shown++; });
      d.querySelectorAll('[data-list]').forEach(function (ul) { var any = ul.querySelector('li:not([hidden])'), h = ul.previousElementSibling; ul.hidden = !any; if (h && h.tagName === 'H2') h.hidden = !any; });
      if (none) none.hidden = shown > 0;
    });
  }
  var h1 = d.querySelector('.essay h1');
  if (h1) SYG.recent('essay-recent', { u: location.pathname, t: h1.textContent });
  var rec = d.querySelector('[data-recent]');
  if (rec) {
    var list = SYG.recent('essay-recent');
    if (list.length) { rec.querySelector('[data-recent-list]').innerHTML = list.map(function (x) { return '<li><a href="' + SYG.esc(x.u) + '">' + SYG.esc(x.t) + '</a></li>'; }).join(''); rec.hidden = false; }
  }
})();
