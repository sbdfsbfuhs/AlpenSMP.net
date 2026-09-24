/* Öffentliche Website sperren, Team-Login bleibt unten */
(function () {
  if (window.__alpenLockdown) return;
  window.__alpenLockdown = true;
  var p = (location.pathname || '/').toLowerCase();
  if (p.indexOf('/team') !== -1) return;

  function fb() {
    try {
      if (typeof firebase === 'undefined') return null;
      if (window._fbDb) return window._fbDb;
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp({
          apiKey: 'AIzaSyBugFF4T6y_XEhCYde99bwpSyYZOuKbJHc',
          authDomain: 'alpensmp-ad844.firebaseapp.com',
          databaseURL: 'https://alpensmp-ad844-default-rtdb.europe-west1.firebasedatabase.app/',
          projectId: 'alpensmp-ad844'
        });
      }
      window._fbDb = firebase.database();
      return window._fbDb;
    } catch (e) { return window._fbDb || null; }
  }

  function hide() {
    var el = document.getElementById('alpenLockdown');
    if (el) el.style.display = 'none';
    document.documentElement.style.overflow = '';
  }

  function show(data) {
    var el = document.getElementById('alpenLockdown');
    if (!el) {
      el = document.createElement('div');
      el.id = 'alpenLockdown';
      el.innerHTML =
        '<div class="alpen-ld-box">' +
        '<img src="/logo.png" alt="">' +
        '<h1 id="alpenLdTitle"></h1>' +
        '<p id="alpenLdMsg"></p>' +
        '<a class="alpen-ld-discord" href="https://discord.gg/FfR56Ddtj8" target="_blank" rel="noopener noreferrer">Discord</a>' +
        '</div>' +
        '<a class="alpen-ld-team" href="https://alpensmp.net/team/">Team anmelden</a>';
      var st = document.createElement('style');
      st.textContent =
        '#alpenLockdown{position:fixed;inset:0;z-index:20000;background:#080a0e;color:#f2f4f7;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 24px 72px;text-align:center;font-family:Inter,system-ui,sans-serif}' +
        '.alpen-ld-box{max-width:420px}' +
        '.alpen-ld-box img{width:72px;height:72px;margin:0 auto 16px;display:block}' +
        '.alpen-ld-box h1{font-size:1.6rem;margin:0 0 10px}' +
        '.alpen-ld-box p{color:#9aa3b2;line-height:1.55;margin:0 0 22px}' +
        '.alpen-ld-discord{display:inline-block;background:#c73e3e;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600}' +
        '.alpen-ld-team{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);color:#6b7280;font-size:13px;text-decoration:none;opacity:.7}' +
        '.alpen-ld-team:hover{color:#e05c5c;opacity:1}';
      document.head.appendChild(st);
      document.body.appendChild(el);
    }
    var title = (data && data.title) || 'Website gerade nicht erreichbar';
    var msg = (data && data.message) || 'Wir arbeiten daran. Bitte später nochmal vorbeischauen.';
    var t = document.getElementById('alpenLdTitle');
    var m = document.getElementById('alpenLdMsg');
    if (t) t.textContent = title;
    if (m) m.textContent = msg;
    el.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';
  }

  function apply(data) {
    if (!data) return hide();
    var expired = data.expires_at && Number(data.expires_at) > 0 && Date.now() > Number(data.expires_at);
    var on = !expired && (data.lockdown === true || data.lockdown === '1' || data.type === 'lockdown');
    if (on) show(data); else hide();
  }

  function listen() {
    var db = fb();
    if (!db) { setTimeout(listen, 600); return; }
    db.ref('site_status/active').on('value', function (snap) { apply(snap.val()); }, function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', listen);
  else listen();
})();
