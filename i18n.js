/* ============================================================
   i18n.js -- Dutch-only translation applier.
   Reads window.TRANSLATIONS.nl and applies to data-i18n attrs.
   Other languages and the language-switcher UI have been removed.
   ============================================================ */
(function () {
  'use strict';
  var LANG = 'nl';

  function getDict() { return (window.TRANSLATIONS && window.TRANSLATIONS[LANG]) || {}; }
  function t(key) {
    var d = getDict();
    return (d[key] != null) ? d[key] : key;
  }

  function apply() {
    var titleVal = t('_title');
    if (titleVal !== '_title') document.title = titleVal;
    document.documentElement.lang = LANG;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      el.setAttribute('alt', t(el.getAttribute('data-i18n-alt')));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    // PDF links — always Dutch booklets
    document.querySelectorAll('[data-pdf]').forEach(function (el) {
      var base = el.getAttribute('data-pdf');
      el.setAttribute('href', 'booklets/' + base + '-' + LANG + '.pdf');
    });
  }

  // Expose minimal API for backwards compatibility
  window.t = t;
  window.getLang = function () { return LANG; };
  window.setLang = function () { /* no-op — Dutch only */ };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
