/* Spieler-Commands Java/Bedrock – unabhängig von Team-Commands */
(function () {
  if (window.__alpenCmdsPublic) return;
  window.__alpenCmdsPublic = true;
  var path = (location.pathname || '/').toLowerCase();
  if (path.indexOf('/team') !== -1) return;
  if (path !== '/' && path !== '/index.html' && path !== '') return;

  var JAVA = [
    { name: '/tpa', desc: 'Teleport-Anfrage senden. Der andere klickt in Java einfach auf die Chat-Nachricht.' },
    { name: '/rtp', desc: 'Zufälliger Teleport in die Welt.' },
    { name: '/sethome', desc: 'Home speichern (Base, Farm, Shop).' },
    { name: '/home 1', desc: 'Zum gespeicherten Home teleportieren. Zahl = Home-Nummer.' },
    { name: '/sit', desc: 'Hinsetzen.' },
    { name: '/lay', desc: 'Hinlegen.' },
    { name: '/warp', desc: 'Zu öffentlichen Warps: survival, strings, end, casino, shop, nether.' },
    { name: '/msg', desc: 'Private Nachricht an einen Spieler.' },
    { name: '/voicechat invite', desc: 'Jemanden in eine Voice-Gruppe einladen (nur Java, Mod nötig).' },
    { name: '/claim 5', desc: 'Claim mit Radius 5 setzen. Zahl = Radius.' }
  ];
  var BEDROCK = [
    { name: '/tpa', desc: 'Teleport-Anfrage senden. Annehmen geht nicht per Klick.' },
    { name: '/tpaccept', desc: 'TPA annehmen. Auf Bedrock musst du das eintippen.' },
    { name: '/rtp', desc: 'Zufälliger Teleport – gleich wie bei Java.' },
    { name: '/sethome', desc: 'Home speichern – gleich wie bei Java.' },
    { name: '/home', desc: 'Zum Home teleportieren – gleich wie bei Java.' },
    { name: '/warp survival', desc: 'Warp Survival.' },
    { name: '/warp strings', desc: 'Warp Strings.' },
    { name: '/warp end', desc: 'Warp End.' },
    { name: '/warp casino', desc: 'Warp Casino.' },
    { name: '/warp shop', desc: 'Warp Shop.' },
    { name: '/warp nether', desc: 'Warp Nether.' }
  ];

  var mode = 'java';

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
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
      '#commands .cmd-row{display:grid;grid-template-columns:minmax(150px,230px) 1fr auto;gap:12px;align-items:center;padding:15px 18px;border-bottom:1px solid var(--border);animation:cmdIn .35s ease both}' +
      '#commands .cmd-row:last-child{border-bottom:0}' +
      '#commands .cmd-name{font-weight:700;color:var(--red2);white-space:nowrap}' +
      '#commands .cmd-desc{color:var(--text2);font-size:.94rem}' +
      '#commands .cmd-copy{background:rgba(199,62,62,.14);border:1px solid rgba(199,62,62,.35);color:var(--red2);border-radius:8px;padding:7px 12px;font-weight:600;cursor:pointer;font-size:.82rem}' +
      '#commands .cmd-copy:hover{background:rgba(199,62,62,.28)}' +
      '@keyframes cmdIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}' +
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
      '<p class="sdesc">Nur Spieler-Befehle. Java und Bedrock unterscheiden sich – einfach umschalten.</p></div>' +
      '<div class="cmd-switch" id="alpenCmdSwitch"><span class="cmd-knob"></span>' +
      '<button type="button" data-mode="java">Java</button>' +
      '<button type="button" data-mode="bedrock">Bedrock</button></div>' +
      '<p class="cmd-hint" id="alpenCmdHint"></p>' +
      '<div class="cmd-list" id="alpenCmdList"></div>' +
      '</div>';
    var host = document.getElementById('mods') || document.getElementById('join') || document.getElementById('faq');
    if (host && host.parentNode) host.parentNode.insertBefore(sec, host);
    else document.body.appendChild(sec);
    sec.querySelectorAll('#alpenCmdSwitch button').forEach(function (b) {
      b.onclick = function () { setMode(b.getAttribute('data-mode')); };
    });
    return sec;
  }

  function render() {
    ensure();
    var sw = document.getElementById('alpenCmdSwitch');
    if (sw) sw.classList.toggle('bedrock', mode === 'bedrock');
    var hint = document.getElementById('alpenCmdHint');
    if (hint) {
      hint.textContent = mode === 'bedrock'
        ? 'Bedrock: TPA mit /tpaccept annehmen. Voice Chat gibt es hier nicht.'
        : 'Java: TPA-Anfrage kannst du im Chat anklicken. Voice Chat mit Mod – Links im nächsten Abschnitt.';
    }
    var box = document.getElementById('alpenCmdList');
    if (!box) return;
    var items = mode === 'bedrock' ? BEDROCK : JAVA;
    box.innerHTML = items.map(function (c, i) {
      return '<div class="cmd-row" style="animation-delay:' + (i * 0.03) + 's"><span class="cmd-name">' +
        esc(c.name) + '</span><span class="cmd-desc">' + esc(c.desc) +
        '</span><button type="button" class="cmd-copy" data-cmd="' + esc(c.name) + '">Kopieren</button></div>';
    }).join('');
    box.querySelectorAll('.cmd-copy').forEach(function (btn) {
      btn.onclick = function () {
        var t = btn.getAttribute('data-cmd') || '';
        if (typeof copyText === 'function') copyText(t, '✓ ' + t + ' kopiert');
        else if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(t).then(function () {
            btn.textContent = 'Kopiert';
            setTimeout(function () { btn.textContent = 'Kopieren'; }, 1400);
          });
        }
      };
    });
  }

  function setMode(m) {
    mode = m === 'bedrock' ? 'bedrock' : 'java';
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
