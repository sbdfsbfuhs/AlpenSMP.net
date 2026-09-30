/* AlpenKI: gleiches Robot-Icon + Regeln + Commands */
(function () {
  if (window.__alpenKiWidget) return;
  window.__alpenKiWidget = true;
  var path = (location.pathname || '/').toLowerCase();
  if (path.indexOf('/team') === 0) return;

  var ROBOT = '<svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><rect x="7" y="9" width="18" height="16" rx="5" fill="#fff"/><rect x="11" y="4" width="10" height="6" rx="2" fill="#fff"/><circle cx="13" cy="16" r="2.1" fill="#c73e3e"/><circle cx="19" cy="16" r="2.1" fill="#c73e3e"/><rect x="13" y="21" width="6" height="2" rx="1" fill="#c73e3e"/><rect x="4" y="14" width="3" height="6" rx="1.5" fill="#fff"/><rect x="25" y="14" width="3" height="6" rx="1.5" fill="#fff"/></svg>';

  var CMDS = {
    java: [
      ['/tpa', 'Teleport-Anfrage. In Java kann der andere im Chat klicken.'],
      ['/rtp', 'Zufälliger Teleport in die Welt.'],
      ['/sethome', 'Home speichern.'],
      ['/home 1', 'Zum Home. Zahl = Home-Nummer.'],
      ['/sit', 'Hinsetzen.'],
      ['/lay', 'Hinlegen.'],
      ['/warp', 'Warps: survival, strings, end, casino, shop, nether.'],
      ['/msg', 'Private Nachricht.'],
      ['/voicechat invite', 'Voice-Gruppe einladen. Nur Java mit Mod.'],
      ['/claim 5', 'Claim mit Radius 5.']
    ],
    bedrock: [
      ['/tpa', 'Teleport-Anfrage senden. Annehmen nicht per Klick.'],
      ['/tpaccept', 'TPA auf Bedrock annehmen – Befehl eintippen.'],
      ['/rtp', 'Zufälliger Teleport, wie Java.'],
      ['/sethome', 'Home speichern, wie Java.'],
      ['/home', 'Zum Home, wie Java.'],
      ['/warp survival', 'Warp Survival.'],
      ['/warp strings', 'Warp Strings.'],
      ['/warp end', 'Warp End.'],
      ['/warp casino', 'Warp Casino.'],
      ['/warp shop', 'Warp Shop.'],
      ['/warp nether', 'Warp Nether.']
    ]
  };

  window.alpenCommandsAnswer = function (q) {
    var s = String(q || '').toLowerCase();
    if (!/(command|befehl|\/tpa|\/home|\/rtp|\/warp|\/sit|\/lay|\/msg|\/claim|\/sethome|\/voice|tpaccept|bedrock.*tpa|java.*tpa)/.test(s)) {
      if (!/was kann ich tippen|welche befehle/.test(s)) return null;
    }
    var bed = /bedrock|pe\b|handy|tablet/.test(s);
    var list = bed ? CMDS.bedrock : CMDS.java;
    var hit = list.filter(function (c) {
      var n = c[0].replace('/', '');
      return s.indexOf(n) !== -1 || s.indexOf(c[0]) !== -1;
    });
    if (hit.length === 1) {
      return hit[0][0] + ' — ' + hit[0][1] + (bed ? ' (Bedrock)' : ' (Java)');
    }
    if (/tpaccept|annehmen/.test(s) && bed) return '/tpaccept — Auf Bedrock musst du TPA so annehmen. In Java reicht ein Klick im Chat.';
    if (/voice/.test(s)) return 'Voice Chat nur auf Java mit Simple Voice Chat. /voicechat invite gibt es auf Bedrock nicht.';
    var lines = list.map(function (c) { return c[0] + ': ' + c[1]; }).join('\n');
    return (bed ? 'Bedrock-Commands:\n' : 'Java-Commands:\n') + lines;
  };

  if (!document.getElementById('alpenKiIconCss')) {
    var css = document.createElement('style');
    css.id = 'alpenKiIconCss';
    css.textContent =
      '#aiToggle,.ai-toggle,#alpenKiFab,.alpen-ki-fab{position:fixed;right:20px;bottom:20px;z-index:80;width:56px;height:56px;border-radius:16px;border:1px solid rgba(199,62,62,.45);background:linear-gradient(135deg,#b91c1c,#c73e3e);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(199,62,62,.38);cursor:pointer;font-size:0;line-height:0}' +
      '#aiToggle svg,.ai-toggle svg{display:block}' +
      '.ai-bubble,.chat-bubble,#chatFab,[aria-label="Chat"]{display:none!important}';
    document.head.appendChild(css);
  }

  function styleToggle(btn) {
    if (!btn) return;
    btn.innerHTML = ROBOT;
    btn.setAttribute('aria-label', 'AlpenKI öffnen');
    btn.classList.add('ai-toggle');
  }

  function hideUgly() {
    document.querySelectorAll('button,a,div').forEach(function (el) {
      if (el.id === 'aiToggle' || el.closest('#aiPanel') || el.closest('.ai-panel')) return;
      var t = (el.textContent || '').trim();
      if (t === '💬' || t === '🗨️' || t === '💬') {
        if (el.getBoundingClientRect().width < 80) el.style.display = 'none';
      }
    });
  }

  function ensurePanel() {
    var tog = document.getElementById('aiToggle');
    var panel = document.getElementById('aiPanel');
    if (tog && panel) {
      styleToggle(tog);
      var inp = document.getElementById('aiInp') || panel.querySelector('input');
      if (inp && /Regelwerk/.test(inp.placeholder || '')) inp.placeholder = 'Frage zu Regeln oder Commands…';
      var first = panel.querySelector('.ai-m.bot, .ai-msg, .ai-messages > div');
      if (first && /Regelwerk/.test(first.textContent || '') && (first.textContent || '').length < 280) {
        first.textContent = 'Frag mich zu Regeln oder Commands – z. B. „Wie geht /tpa auf Bedrock?“ oder „Darf ich X-Ray?“';
      }
      hideUgly();
      return;
    }
    if (panel && !tog) return;
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<button class="ai-toggle" id="aiToggle" type="button" aria-label="AlpenKI öffnen">' + ROBOT + '</button>' +
      '<div class="ai-panel" id="aiPanel">' +
      '<div class="ai-h"><strong style="display:flex;align-items:center;gap:8px">' + ROBOT + ' AlpenKI</strong>' +
      '<button type="button" id="aiClose" aria-label="Schließen" style="background:none;border:0;color:#fff;font-size:20px;cursor:pointer">×</button></div>' +
      '<div class="ai-msgs" id="aiMsgs"><div class="ai-m bot">Frag mich zu Regeln oder Commands – z. B. „Wie geht /tpa auf Bedrock?“ oder „Darf ich X-Ray?“</div></div>' +
      '<div class="ai-row"><input id="aiInp" placeholder="Frage zu Regeln oder Commands…">' +
      '<button type="button" id="aiSend">→</button></div></div>';
    if (!document.getElementById('alpenKiPanelCss')) {
      var pcss = document.createElement('style');
      pcss.id = 'alpenKiPanelCss';
      pcss.textContent = '.ai-panel{position:fixed;right:20px;bottom:88px;z-index:80;width:min(380px,calc(100vw - 24px));max-height:min(520px,70vh);background:rgba(12,16,24,.97);border:1px solid rgba(255,255,255,.08);border-radius:18px;display:none;flex-direction:column;overflow:hidden}.ai-panel.open{display:flex}.ai-h{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08)}.ai-h svg{width:22px;height:22px}.ai-msgs{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px}.ai-m{max-width:92%;padding:10px 14px;border-radius:12px;font-size:.9rem;white-space:pre-wrap}.ai-m.bot{background:rgba(255,255,255,.05);color:#c5cbd6;align-self:flex-start}.ai-m.user{background:rgba(199,62,62,.2);align-self:flex-end}.ai-row{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(255,255,255,.08)}.ai-row input{flex:1;min-height:44px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:#0c1018;color:#fff;padding:0 12px}.ai-row button{min-height:44px;min-width:44px;border:0;border-radius:10px;background:linear-gradient(135deg,#b91c1c,#c73e3e);color:#fff;font-weight:700;cursor:pointer}';
      document.head.appendChild(pcss);
    }
    document.body.appendChild(wrap);
    var p = document.getElementById('aiPanel');
    document.getElementById('aiToggle').onclick = function () { p.classList.toggle('open'); };
    document.getElementById('aiClose').onclick = function () { p.classList.remove('open'); };
    function answer(q) {
      if (typeof window.alpenCommandsAnswer === 'function') {
        var c = window.alpenCommandsAnswer(q);
        if (c) return c;
      }
      if (typeof window.aiReply === 'function') return window.aiReply(q);
      if (typeof window.alpenRulesAnswer === 'function') {
        var r = window.alpenRulesAnswer(q, window.ALPEN_RULES_PUBLIC || window.ALPEN_RULES_LIVE);
        if (r) return r;
      }
      var query = String(q || '').toLowerCase();
      if (/join|beitreten|ip|bedrock|java/.test(query)) return 'Java: alpensmp.falixsrv.me · Bedrock-Port 27491. Empfohlen 1.21.11.';
      return 'Dazu habe ich keine bestätigte Info. Frag nach einem Command oder einer Regel.';
    }
    function send() {
      var inp = document.getElementById('aiInp');
      var q = (inp.value || '').trim();
      if (!q) return;
      var msgs = document.getElementById('aiMsgs');
      var u = document.createElement('div'); u.className = 'ai-m user'; u.textContent = q; msgs.appendChild(u);
      inp.value = '';
      var b = document.createElement('div'); b.className = 'ai-m bot'; b.textContent = answer(q); msgs.appendChild(b);
      msgs.scrollTop = msgs.scrollHeight;
    }
    document.getElementById('aiSend').onclick = send;
    document.getElementById('aiInp').addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
    hideUgly();
  }

  function wrapReply() {
    if (typeof window.aiReply === 'function' && !window.aiReply.__alpenCmds) {
      var orig = window.aiReply;
      window.aiReply = function (q) {
        var c = window.alpenCommandsAnswer && window.alpenCommandsAnswer(q);
        if (c) return c;
        if (typeof window.alpenRulesAnswer === 'function') {
          var r = window.alpenRulesAnswer(q, window.ALPEN_RULES_PUBLIC || window.ALPEN_RULES_LIVE);
          if (r) return r;
        }
        return orig(q);
      };
      window.aiReply.__alpenCmds = true;
    }
  }

  function boot() {
    ensurePanel();
    wrapReply();
    hideUgly();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
})();
