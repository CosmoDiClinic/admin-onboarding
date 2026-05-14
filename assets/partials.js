/* ============================================================
   Section page header & footer injection
============================================================ */

function injectHeader(num, titleEn, titleRu) {
  var header =
    '<header class="topbar">' +
      '<div class="topbar-inner">' +
        '<a class="brand" href="index.html">' +
          '<span class="brand-text">Cosmo Di</span>' +
          '<span class="brand-sub">' +
            '<span class="lang-en">Admin Onboarding</span>' +
            '<span class="lang-ru">Онбординг администратора</span>' +
          '</span>' +
        '</a>' +
        '<div class="topbar-right">' +
          '<a href="index.html" class="back-link">' +
            '<span class="lang-en">All sections</span>' +
            '<span class="lang-ru">Все разделы</span>' +
          '</a>' +
          '<a href="11-resources.html" class="resources-link">' +
            '<span class="lang-en">Resources</span>' +
            '<span class="lang-ru">Ресурсы</span>' +
          '</a>' +
          '<a href="10-cheatsheet.html" class="cheat-link">' +
            '<span class="lang-en">Cheat sheet</span>' +
            '<span class="lang-ru">Шпаргалка</span>' +
          '</a>' +
          '<div class="lang-switch">' +
            '<button class="lang-btn" data-lang="ru">RU</button>' +
            '<button class="lang-btn" data-lang="en">EN</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</header>';
  document.body.insertAdjacentHTML('afterbegin', header);

  // Re-apply lang state through the global helper from script.js
  var lang = window.__cosmodiGetLang ? window.__cosmodiGetLang() : 'ru';
  if (window.__cosmodiApplyLang) {
    window.__cosmodiApplyLang(lang);
  }

  var btns = document.querySelectorAll('.lang-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener('click', function() {
      var newLang = this.getAttribute('data-lang');
      if (window.__cosmodiSetLang) {
        window.__cosmodiSetLang(newLang);
      } else {
        try { localStorage.setItem('cosmodi-lang', newLang); } catch(e){}
        document.documentElement.setAttribute('lang', newLang);
      }
    });
  }
}

function injectFooterNav(prevHref, prevTitleEn, prevTitleRu, nextHref, nextTitleEn, nextTitleRu) {
  var main = document.querySelector('main');
  if (!main) return;

  var prev = '';
  if (prevHref) {
    prev =
      '<a class="section-nav-link prev" href="' + prevHref + '">' +
        '<div class="section-nav-label">' +
          '<span class="lang-en">Previous</span>' +
          '<span class="lang-ru">Предыдущий</span>' +
        '</div>' +
        '<div class="section-nav-title">' +
          '<span class="lang-en">' + prevTitleEn + '</span>' +
          '<span class="lang-ru">' + prevTitleRu + '</span>' +
        '</div>' +
      '</a>';
  } else {
    prev = '<div></div>';
  }

  var next = '';
  if (nextHref) {
    next =
      '<a class="section-nav-link next" href="' + nextHref + '">' +
        '<div class="section-nav-label">' +
          '<span class="lang-en">Next</span>' +
          '<span class="lang-ru">Следующий</span>' +
        '</div>' +
        '<div class="section-nav-title">' +
          '<span class="lang-en">' + nextTitleEn + '</span>' +
          '<span class="lang-ru">' + nextTitleRu + '</span>' +
        '</div>' +
      '</a>';
  }

  var html =
    '<nav class="section-nav">' + prev + next + '</nav>' +
    '<p class="footer-note">' +
      '<span class="lang-en">Cosmo Di Aesthetic Clinic · Dubai · DHA Licence No. 1281742</span>' +
      '<span class="lang-ru">Cosmo Di Aesthetic Clinic · Dubai · DHA License No. 1281742</span>' +
    '</p>';

  main.insertAdjacentHTML('afterend', html);

  // Apply lang state for newly inserted bilingual elements
  if (window.__cosmodiApplyLang && window.__cosmodiGetLang) {
    window.__cosmodiApplyLang(window.__cosmodiGetLang());
  }
}
