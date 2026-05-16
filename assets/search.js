/* ============================================================
   Cosmo Di — site-wide search
   Loads assets/search-index.json once, searches the active
   language only, shows results in an overlay.
============================================================ */
(function () {
  'use strict';

  var INDEX_URL = 'assets/search-index.json';
  var idx = null;
  var idxLoading = false;
  var idxError = false;

  function getLang() {
    if (window.__cosmodiGetLang) return window.__cosmodiGetLang();
    var l = document.documentElement.getAttribute('lang');
    return l === 'en' ? 'en' : 'ru';
  }

  var T = {
    placeholder: { ru: '\u041f\u043e\u0438\u0441\u043a \u043f\u043e \u0440\u0443\u043a\u043e\u0432\u043e\u0434\u0441\u0442\u0432\u0443\u2026', en: 'Search the handbook\u2026' },
    hint:        { ru: '\u041d\u0430\u0447\u043d\u0438\u0442\u0435 \u0432\u0432\u043e\u0434\u0438\u0442\u044c \u2014 \u043f\u043e\u0438\u0441\u043a \u043f\u043e \u0432\u0441\u0435\u043c \u0440\u0430\u0437\u0434\u0435\u043b\u0430\u043c', en: 'Start typing \u2014 searches every section' },
    nothing:     { ru: '\u041d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e', en: 'Nothing found' },
    loading:     { ru: '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430\u2026', en: 'Loading\u2026' },
    error:       { ru: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0438\u043d\u0434\u0435\u043a\u0441 \u043f\u043e\u0438\u0441\u043a\u0430', en: 'Could not load the search index' },
    close:       { ru: '\u0417\u0430\u043a\u0440\u044b\u0442\u044c', en: 'Close' }
  };

  function tr(key) {
    var l = getLang();
    return (T[key] && T[key][l]) || (T[key] && T[key].ru) || '';
  }

  // ---- overlay construction -------------------------------------------
  var overlay, input, results, hintEl;

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'site-search-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML =
      '<div class="site-search-panel">' +
        '<div class="site-search-bar">' +
          '<svg class="site-search-bar-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">' +
            '<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/>' +
            '<line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
          '</svg>' +
          '<input type="text" class="site-search-input" autocomplete="off" spellcheck="false">' +
          '<button class="site-search-close" type="button"></button>' +
        '</div>' +
        '<div class="site-search-hint"></div>' +
        '<div class="site-search-results"></div>' +
      '</div>';

    document.body.appendChild(overlay);

    input = overlay.querySelector('.site-search-input');
    results = overlay.querySelector('.site-search-results');
    hintEl = overlay.querySelector('.site-search-hint');
    var closeBtn = overlay.querySelector('.site-search-close');

    closeBtn.addEventListener('click', closeSearch);
    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay) closeSearch();
    });
    input.addEventListener('input', function () {
      runQuery(input.value);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        closeSearch();
      }
    });
  }

  function refreshLangStrings() {
    if (!overlay) return;
    input.setAttribute('placeholder', tr('placeholder'));
    overlay.querySelector('.site-search-close').textContent = tr('close');
    if (!input.value.trim()) {
      hintEl.textContent = tr('hint');
      results.innerHTML = '';
    }
  }

  // ---- index loading --------------------------------------------------
  function loadIndex(cb) {
    if (idx) { cb(); return; }
    if (idxError) { cb(); return; }
    if (idxLoading) {
      var iv = setInterval(function () {
        if (idx || idxError) { clearInterval(iv); cb(); }
      }, 80);
      return;
    }
    idxLoading = true;
    fetch(INDEX_URL)
      .then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json();
      })
      .then(function (data) {
        idx = data;
        idxLoading = false;
        cb();
      })
      .catch(function () {
        idxError = true;
        idxLoading = false;
        cb();
      });
  }

  // ---- search ---------------------------------------------------------
  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function makeSnippet(text, terms) {
    var lower = text.toLowerCase();
    var pos = -1;
    for (var i = 0; i < terms.length; i++) {
      var p = lower.indexOf(terms[i]);
      if (p !== -1 && (pos === -1 || p < pos)) pos = p;
    }
    if (pos === -1) pos = 0;
    var start = Math.max(0, pos - 60);
    var end = Math.min(text.length, pos + 160);
    var snip = text.slice(start, end);
    if (start > 0) snip = '\u2026' + snip;
    if (end < text.length) snip = snip + '\u2026';
    snip = escapeHtml(snip);
    for (var j = 0; j < terms.length; j++) {
      if (!terms[j]) continue;
      var re = new RegExp('(' + escapeRe(terms[j]) + ')', 'gi');
      snip = snip.replace(re, '<mark>$1</mark>');
    }
    return snip;
  }

  function runQuery(raw) {
    var q = (raw || '').trim().toLowerCase();
    if (!q) {
      hintEl.textContent = tr('hint');
      results.innerHTML = '';
      return;
    }
    if (idxError) {
      hintEl.textContent = '';
      results.innerHTML = '<div class="site-search-empty">' + tr('error') + '</div>';
      return;
    }
    if (!idx) {
      hintEl.textContent = tr('loading');
      results.innerHTML = '';
      return;
    }

    var lang = getLang();
    var terms = q.split(/\s+/).filter(Boolean);
    var hits = [];

    for (var i = 0; i < idx.length; i++) {
      var entry = idx[i];
      var hay = (entry[lang] || '').toLowerCase();
      var score = 0;
      var matchedAll = true;
      for (var t = 0; t < terms.length; t++) {
        var c = hay.split(terms[t]).length - 1;
        if (c === 0) { matchedAll = false; break; }
        score += c;
      }
      if (matchedAll) {
        hits.push({ entry: entry, score: score });
      }
    }

    hits.sort(function (a, b) { return b.score - a.score; });

    hintEl.textContent = '';

    if (!hits.length) {
      results.innerHTML = '<div class="site-search-empty">' + tr('nothing') + '</div>';
      return;
    }

    var html = '';
    for (var h = 0; h < hits.length; h++) {
      var e = hits[h].entry;
      var labelParts = e.label.split(' / ');
      var label = lang === 'en' ? labelParts[0] : (labelParts[1] || labelParts[0]);
      var snippet = makeSnippet(e[lang] || '', terms);
      html +=
        '<a class="site-search-result" href="' + e.file + '">' +
          '<span class="site-search-result-label">' + escapeHtml(label) + '</span>' +
          '<span class="site-search-result-snippet">' + snippet + '</span>' +
        '</a>';
    }
    results.innerHTML = html;
  }

  // ---- open / close ---------------------------------------------------
  function openSearch() {
    if (!overlay) buildOverlay();
    refreshLangStrings();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    loadIndex(function () {
      if (input.value.trim()) runQuery(input.value);
    });
    setTimeout(function () { input.focus(); }, 30);
  }

  function closeSearch() {
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ---- wire up triggers ----------------------------------------------
  function bindTriggers() {
    var triggers = document.querySelectorAll('.site-search-trigger');
    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].__bound) continue;
      triggers[i].__bound = true;
      triggers[i].addEventListener('click', function (e) {
        e.preventDefault();
        openSearch();
      });
    }
  }

  // Triggers may be injected by partials.js after this script runs,
  // so bind on DOM ready and also retry shortly after.
  function init() {
    bindTriggers();
    setTimeout(bindTriggers, 300);
    setTimeout(bindTriggers, 1000);

    // Keyboard shortcut: "/" opens search
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && !/input|textarea/i.test((e.target.tagName || ''))) {
        e.preventDefault();
        openSearch();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for manual triggering / language refresh
  window.__cosmodiOpenSearch = openSearch;
  window.__cosmodiSearchRefreshLang = refreshLangStrings;
})();
