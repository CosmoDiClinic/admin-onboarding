/* ============================================================
   Language switcher
   - Sets html[lang] immediately at script load (before DOMContentLoaded)
   - Persists choice in localStorage across pages
============================================================ */

(function() {
  var KEY = 'cosmodi-lang';
  var DEFAULT = 'ru';

  function getStored() {
    try { return localStorage.getItem(KEY) || DEFAULT; }
    catch (e) { return DEFAULT; }
  }

  function setStored(lang) {
    try { localStorage.setItem(KEY, lang); }
    catch (e) {}
  }

  function applyLang(lang) {
    document.documentElement.setAttribute('lang', lang);

    var btns = document.querySelectorAll('.lang-btn');
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }

    // Update title if it has bilingual data
    var titleEl = document.querySelector('title');
    if (titleEl) {
      var enT = titleEl.getAttribute('data-title-en');
      var ruT = titleEl.getAttribute('data-title-ru');
      if (enT && ruT) {
        titleEl.textContent = (lang === 'en') ? enT : ruT;
      }
    }
  }

  // Apply immediately on script load, before DOM ready
  applyLang(getStored());

  // Wire up buttons when DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    applyLang(getStored()); // re-apply for newly-injected buttons

    var btns = document.querySelectorAll('.lang-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function() {
        var lang = this.getAttribute('data-lang');
        setStored(lang);
        applyLang(lang);
      });
    }
  });

  // Also expose so partials.js can re-bind
  window.__cosmodiApplyLang = applyLang;
  window.__cosmodiGetLang = getStored;
  window.__cosmodiSetLang = function(lang) {
    setStored(lang);
    applyLang(lang);
  };
})();
