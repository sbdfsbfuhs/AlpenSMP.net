/* Spieler-Commands aus site_status/player_cmds */
(function () {
  if (window.__alpenCmdsPublic) return;
  window.__alpenCmdsPublic = true;
  var path = (location.pathname || '/').toLowerCase();
  if (path.indexOf('/team') !== -1) return;
  if (path !== '/' && path !== '/index.html' && path !== '') return;

  var FALLBACK = {
    java: [
      { name: '/tpa', desc: 'Teleport-Anfrage senden. Der andere klickt in Java auf die Chat-Nachricht.' },
      { name: '/rtp', desc: 'Zufälliger Teleport in die Welt.' },
      { name: '/sethome', desc: 'Home speichern (Base, Farm, Shop).' },
      { name: '/home 1', desc: 'Zum Home. Zahl = Home-Nummer.' },
      { name: '/sit', desc: 'Hinsetzen.' },
      { name: '/lay', desc: 'Hinlegen.' },
      { name: '/warp', desc: 'Warps: survival, strings, end, casino, shop, nether.' },
      { name: '/msg', desc: 'Private Nachricht.' },
      { name: '/voicechat invite', desc: 'Voice-Gruppe einladen (nur Java).' },
      { name: '/claim 5', desc: 'Claim mit Radius 5.' }
    ],
    bedrock: [
      { name: '/tpa', desc: 'Teleport-Anfrage senden. Annehmen nicht per Klick.' },
      { name: '/tpaccept', desc: 'TPA annehmen – auf Bedrock eintippen.' },
      { name: '/rtp', desc: 'Zufälliger Teleport, wie Java.' },
      { name: '/sethome', desc: 'Home speichern, wie Java.' },
      { name: '/home', desc: 'Zum Home, wie Java.' },
      { name: '/warp survival', desc: 'Warp Survival.' },
      { name: '/warp strings', desc: 'Warp Strings.' },
      { name: '/warp end', desc: 'Warp End.' },
      { name: '/warp casino', desc: 'Warp Casino.' },
      { name: '/warp shop', desc: 'Warp Shop.' },
      { name: '/warp nether', desc: 'Warp Nether.' }
    ]
  };

  var live = { java: [], bedrock: [] };
  var mode = 'java';

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function parse(val) {
    if (!val) return [];
    return Object.keys(val).map(function (k) {
      var x = val[k] || {};
      return { name: x.name || '', desc: x.desc || '', order: x.order || x.ts || 0 };
    }).filter(function (x) { return x.name; }).sort(function (a, b) { return a.order - b.order; });
  }

  if (!document.getElementById('alpenCmdCss')) {
    var st = document.createElement('style');
    st.id = 'alpenCmdCss';
    st.textContent =
      '#commands .cmd-switch{display:inline-flex;position:relative;margin:18px 0 8px;padding:4px;border-radius:999px;border:1px solid var(--border);background:rgba(8,10,14,.55)}' +
      '#commands .cmd-knob{position:absolute;top:4px;bottom:4px;width:calc(50% - 4px);left:4px;border-radius:999px;background:linear-gradient(180deg,#e05c5c,#c73e3e);transition:transform .28s cubic-bezier(.2,.8,.2,1);z-index:0}' +
      '#commands .cmd-switch.bedrock .cmd-knob{transform:translateX(100%)}' +
      '#commands .cmd-switch button{position:relative;z-index:1;border:0;background:transparent;color:#f2f4f7;font-weight:700;padding:10px 22px;min-width:120px;cursor:pointer}' +
      '#commands .cmd-hint{color:var(--text2);font-size:.92rem;margin:8px 0 16px;max-width:640px;min-height:2.4em}' +
      '#commands .cmd-list{border:1px solid var(--border);border-radius:16px;overflow:hidden;background:var(--glass)}' +
      '#commands .cmd-row{display:grid;grid-template-columns:minmax(150px,230px) 1fr auto;gap:12px;align-items:center;padding:15px 18px;border-bottom:1px solid var(--border)}' +
      '#commands .cmd-row:last-child{border-bottom:0}' +
      '#commands .cmd-name{font-weight:700;color:var(--red2)}' +
      '#commands .cmd-desc{color:var(--text2);font-size:.94rem}' +
      '#commands .cmd-copy{background:rgba(199,62,62,.14);border:1px solid rgba(199,62,62,.35);color:var(--red2);border-radius:8px;padding:7px 12px;font-weight:600;cursor:pointer;font-size:.82rem}' +
      '@media(max-width:700px){#commands .cmd-row{grid-template-columns:1fr}}';
    document.head.appendChild(st);
  }

  function ensure() {
    var sec = document.getElementById('commands');
    if (sec && sec.querySelector('#alpenCmdList')) return sec;
    if (sec && !sec.querySelector('#alpenCmdList')) sec.remove();
    sec = document.createElement('section');
    sec.id = 'commands';
    sec.innerHTML =
      '<div class="container">' +
      '<div class="reveal visible"><span class="slabel">Befehle</span>' +
      '<h2 class="stitle">Spieler-Commands</h2>' +
      '<p class="sdesc">Nur Spieler-Befehle. Java und Bedrock unterscheiden sich.</p></div>' +
      '<div class="cmd-switch" id="alpenCmdSwitch"><span class="cmd-knob"></span>' +
      '<button type="button" data-mode="java">Java</button>' +
      '<button type="button" data-mode="bedrock">Bedrock</button></div>' +
      '<p class="cmd-hint" id="alpenCmdHint"></p>' +
      '<div class="cmd-list" id="alpenCmdList"></div></div>';
    var host = document.getElementById('mods') || document.getElementById('join') || document.getElementById('faq');
    if (host && host.parentNode) host.parentNode.insertBefore(sec, host);
    else document.body.appendChild(sec);
    sec.querySelectorAll('#alpenCmdSwitch button').forEach(function (btn) {
      btn.onclick = function () { mode = btn.getAttribute('data-mode') === 'bedrock' ? 'bedrock' : 'java'; render(); };
    });
    return sec;
  }

  function render() {
    ensure();
    var sw = document.getElementById('alpenCmdSwitch');
    if (sw) sw.classList.toggle('bedrock', mode === 'bedrock');
    var hint = document.getElementById('alpenCmdHint');
    if (hint) hint.textContent = mode === 'bedrock'
      ? 'Bedrock: TPA mit /tpaccept annehmen. Voice Chat gibt es hier nicht.'
      : 'Java: TPA im Chat anklicken. Voice Chat mit Mod – nächster Abschnitt.';
    var box = document.getElementById('alpenCmdList');
    if (!box) return;
    var items = (live[mode] && live[mode].length) ? live[mode] : FALLBACK[mode];
    box.innerHTML = items.map(function (c) {
      return '<div class="cmd-row"><span class="cmd-name">' + esc(c.name) +
        '</span><span class="cmd-desc">' + esc(c.desc) +
        '</span><button type="button" class="cmd-copy" data-cmd="' + esc(c.name) + '">Kopieren</button></div>';
    }).join('');
    box.querySelectorAll('.cmd-copy').forEach(function (btn) {
      btn.onclick = function () {
        var t = btn.getAttribute('data-cmd') || '';
        if (typeof copyText === 'function') copyText(t, '✓ ' + t + ' kopiert');
        else if (navigator.clipboard) navigator.clipboard.writeText(t);
        btn.textContent = 'Kopiert';
        setTimeout(function () { btn.textContent = 'Kopieren'; }, 1200);
      };
    });
  }

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
      var dbx = window._fbDb || firebase.database();
      window._fbDb = dbx;
      ['java', 'bedrock'].forEach(function (ed) {
        dbx.ref('site_status/player_cmds/' + ed).on('value', function (snap) {
          live[ed] = parse(snap.val());
          if (ed === mode) render();
        });
      });
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { render(); listen(); });
  else { render(); listen(); }
})();
