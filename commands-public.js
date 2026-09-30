/* Wichtige Commands auf der Startseite, Quelle: Firebase commands */
(function () {
  if (window.__alpenCmdsPublic) return;
  window.__alpenCmdsPublic = true;
  var p = (location.pathname || '/').toLowerCase();
  if (p.indexOf('/team') !== -1 || p.indexOf('/regeln') !== -1) return;
  if (p !== '/' && p !== '/index.html' && p !== '') return;

  var FALLBACK = [
    { name: '/spawn', desc: 'Zurück zum Spawn.' },
    { name: '/sethome', desc: 'Speichert einen Punkt für Base, Farm oder Shop.' },
    { name: '/home', desc: 'Kehrt zu deinem gesetzten Home zurück.' },
    { name: '/homes', desc: 'Zeigt deine gespeicherten Homes.' },
    { name: '/tpa', desc: 'Teleport-Anfrage an einen Spieler. Nach Annahme seid ihr zusammen.' },
    { name: '/back', desc: 'Zurück zum letzten Todesort – praktisch für die Item-Recovery.' },
    { name: '/rtp', desc: 'Zufälliger Teleport in die Welt.' },
    { name: '/msg', desc: 'Private Nachricht an einen Spieler.' },
    { name: '/call admin', desc: 'Ruft das Team, wenn du im Spiel Hilfe brauchst.' }
  ];

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function normName(n) {
    n = String(n || '').trim();
    if (!n) return '';
    if (n.charAt(0) !== '/') n = '/' + n;
    return n;
  }

  if (!document.getElementById('alpenCmdCss')) {
    var st = document.createElement('style');
    st.id = 'alpenCmdCss';
    st.textContent =
      '#commands .cmd-list{margin-top:28px;border:1px solid var(--border);border-radius:16px;overflow:hidden;background:var(--glass)}' +
      '#commands .cmd-row{display:grid;grid-template-columns:minmax(140px,220px) 1fr auto;gap:12px;align-items:center;padding:16px 18px;border-bottom:1px solid var(--border)}' +
      '#commands .cmd-row:last-child{border-bottom:none}' +
      '#commands .cmd-name{font-family:var(--font);font-weight:700;color:var(--red2);white-space:nowrap}' +
      '#commands .cmd-desc{color:var(--text2);font-size:.94rem}' +
      '#commands .cmd-copy{background:rgba(199,62,62,.14);border:1px solid rgba(199,62,62,.32);color:var(--red2);border-radius:8px;padding:7px 12px;font-weight:600;cursor:pointer;font-size:.82rem}' +
      '#commands .cmd-copy:hover{background:rgba(199,62,62,.28)}' +
      '#commands .cmd-links{display:flex;gap:12px;flex-wrap:wrap;margin-top:22px}' +
      '#commands .cmd-note{margin-top:14px;color:var(--text2);font-size:.92rem;line-height:1.6;max-width:760px}' +
      '@media(max-width:700px){#commands .cmd-row{grid-template-columns:1fr;gap:8px}}';
    document.head.appendChild(st);
  }

  function ensureSection() {
    var sec = document.getElementById('commands');
    if (sec) return sec;
    sec = document.createElement('section');
    sec.id = 'commands';
    sec.innerHTML =
      '<div class="container">' +
      '<div class="reveal visible"><span class="slabel">Befehle</span>' +
      '<h2 class="stitle">Wichtige Commands</h2>' +
      '<p class="sdesc">Nur Befehle, die auf AlpenSMP bestätigt sind. Klick auf Kopieren, dann im Chat einfügen.</p></div>' +
      '<div class="cmd-list" id="alpenCmdList"></div>' +
      '<div class="cmd-links">' +
      '<a class="btn btn-primary" href="https://modrinth.com/plugin/simple-voice-chat" target="_blank" rel="noopener noreferrer">Simple Voice Chat auf Modrinth</a>' +
      '<a class="btn btn-secondary" href="https://modrinth.com/app" target="_blank" rel="noopener noreferrer">Modrinth App</a>' +
      '</div>' +
      '<p class="cmd-note">Joinen geht auch ohne Client-Mods. Voice Chat nur, wenn du den Mod installierst. Erlaubt sind ausserdem OptiFine, Sodium, Iris, Freecam, Xaero’s Minimap, Shulker-Tooltips, Inventory HUD sowie Performance- und Komfort-Mods. Cheats wie X-Ray, Fly oder KillAura sind verboten.</p>' +
      '</div>';
    var join = document.getElementById('join');
    var mods = document.getElementById('mods');
    var faq = document.getElementById('faq');
    var host = mods || join || faq;
    if (host && host.parentNode) host.parentNode.insertBefore(sec, host);
    else document.body.appendChild(sec);
    return sec;
  }

  function render(items) {
    ensureSection();
    var list = document.getElementById('alpenCmdList');
    if (!list) return;
    if (!items.length) items = FALLBACK.slice();
    list.innerHTML = items.map(function (c, i) {
      var name = normName(c.name || c.cmd || c.command);
      var desc = c.desc || c.description || c.text || '';
      return '<div class="cmd-row"><span class="cmd-name">' + esc(name) +
        '</span><span class="cmd-desc">' + esc(desc) +
        '</span><button type="button" class="cmd-copy" data-cmd="' + esc(name) + '">Kopieren</button></div>';
    }).join('');
    list.querySelectorAll('.cmd-copy').forEach(function (btn) {
      btn.onclick = function () {
        var t = btn.getAttribute('data-cmd') || '';
        if (typeof copyText === 'function') copyText(t, '✓ ' + t + ' kopiert');
        else if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(t).then(function () { btn.textContent = 'Kopiert'; setTimeout(function () { btn.textContent = 'Kopieren'; }, 1400); });
        }
      };
    });
  }

  function fromFb(val) {
    if (!val) return [];
    return Object.keys(val).map(function (k) {
      var x = val[k] || {};
      return { name: x.name || x.cmd || '', desc: x.desc || x.description || '', ts: x.ts || 0 };
    }).filter(function (x) { return x.name; }).sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });
  }

  render(FALLBACK);

  function listen() {
    try {
      if (typeof firebase === 'undefined') return;
      if (!window._fbDb && firebase.apps && !firebase.apps.length) {
        firebase.initializeApp({
          apiKey: 'AIzaSyBugFF4T6y_XEhCYde99bwpSyYZOuKbJHc',
          authDomain: 'alpensmp-ad844.firebaseapp.com',
          databaseURL: 'https://alpensmp-ad844-default-rtdb.europe-west1.firebasedatabase.app/',
          projectId: 'alpensmp-ad844'
        });
      }
      var db = window._fbDb || firebase.database();
      window._fbDb = db;
      db.ref('commands').on('value', function (snap) {
        var items = fromFb(snap.val());
        render(items.length ? items : FALLBACK);
      }, function () {});
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', listen);
  else listen();
})();
