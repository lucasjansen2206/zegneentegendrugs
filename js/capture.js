(function () {
  var KEY = 'zntd_captured';
  var EMAIL_KEY = 'zntd_email';
  var ONE_YEAR = 365 * 24 * 60 * 60 * 1000;

  function setCookie(name, value, ms) {
    var d = new Date();
    d.setTime(d.getTime() + ms);
    document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }
  function getCookie(name) {
    var prefix = name + '=';
    var parts = document.cookie.split(';');
    for (var i = 0; i < parts.length; i++) {
      var c = parts[i].trim();
      if (c.indexOf(prefix) === 0) return decodeURIComponent(c.substring(prefix.length));
    }
    return '';
  }

  function has() {
    if (getCookie(KEY) === '1') return true;
    try { if (localStorage.getItem(KEY) === '1') return true; } catch (e) {}
    try { if (sessionStorage.getItem(KEY) === '1') return true; } catch (e) {}
    return false;
  }
  function set(email) {
    setCookie(KEY, '1', ONE_YEAR);
    if (email) setCookie(EMAIL_KEY, email, ONE_YEAR);
    try { localStorage.setItem(KEY, '1'); if (email) localStorage.setItem(EMAIL_KEY, email); } catch (e) {}
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
  }
  function getEmail() {
    var v = getCookie(EMAIL_KEY);
    if (v) return v;
    try { return localStorage.getItem(EMAIL_KEY) || ''; } catch (e) { return ''; }
  }
  function clear() {
    setCookie(KEY, '', -1);
    setCookie(EMAIL_KEY, '', -1);
    try { localStorage.removeItem(KEY); localStorage.removeItem(EMAIL_KEY); } catch (e) {}
    try { sessionStorage.removeItem(KEY); } catch (e) {}
  }

  window.zntdCapture = { has: has, set: set, getEmail: getEmail, clear: clear };
})();
