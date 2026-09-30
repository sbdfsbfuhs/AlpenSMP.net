/* Hero: Originaltext bleibt. Join-Karten + MOTD nur dazu. */
(function () {
  if (window.__alpenHeroInvite5) return;
  window.__alpenHeroInvite5 = true;
  var path = (location.pathname || '/').toLowerCase();
  if (path.indexOf('/team') !== -1) return;
  if (path !== '/' && path !== '/index.html' && path !== '') return;

  var IP = 'alpensmp.falixsrv.me';
  var PORT = '27491';
  var MOTD = 'ETWAS GROSSES KOMMT \u00b7 Vielleicht bald neue IP? \u00b7 AlpenSMP.net jetzt hinzuf\u00fcgen';

  function copy(val, btn) {
    var t = String(val || '');
    if (typeof copyText === 'function') copyText(t, '\u2713 ' + t + ' kopiert');
    else if (navigator.clipboard) navigator.clipboard.writeText(t);
    if (btn) {
      var old = btn.textContent;
      btn.textContent = 'Kopiert';
      setTimeout(function () { btn.textContent = old; }, 1400);
    }
  }

  if (!document.getElementById('alpenHeroCss')) {
    var st = document.createElement('style');
    st.id = 'alpenHeroCss';
    st.textContent =
      '#hero .container,#hero{position:relative}' +
      '#hero h1,.hero h1{display:block!important;opacity:1!important;visibility:visible!important}' +
      '#hero .hero-actions,.hero .hero-actions{display:flex!important;opacity:1!important}' +
      '#alpenMotd{display:flex;align-items:center;gap:10px;margin:18px auto 0;max-width:640px;padding:10px 16px;border-radius:999px;border:1px solid rgba(255,213,79,.28);background:linear-gradient(90deg,rgba(28,24,16,.88),rgba(18,16,12,.92));color:#f0e2a8;font-family:ui-monospace,Consolas,monospace;font-size:.84rem}' +
      '#alpenMotd b{color:#ffe082;white-space:nowrap;margin-right:6px}' +
      '#alpenJoinGrid{width:min(380px,100%);margin:22px auto 0}' +
      '@media(min-width:980px){#alpenJoinGrid{position:absolute;right:24px;top:50%;transform:translateY(-50%);margin:0}}' +
      '.alpen-join-grid{display:flex;flex-direction:column;gap:12px}' +
      '.alpen-join-card{padding:16px;border-radius:16px;border:1px solid rgba(255,255,255,.1);background:rgba(8,10,14,.72);backdrop-filter:blur(12px);text-align:left}' +
      '.alpen-join-card h3{margin:0 0 8px;font-size:1rem}' +
      '.alpen-join-row{display:flex;gap:8px;margin-top:8px}' +
      '.alpen-join-row input{flex:1;min-width:0;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:#fff;border-radius:10px;padding:10px 12px;font-family:ui-monospace,monospace}' +
      '.alpen-join-row button{flex-shrink:0;background:#c73e3e;border:0;color:#fff;border-radius:10px;padding:10px 12px;font-weight:700;cursor:pointer}' +
      '.alpen-join-card small{display:block;margin-top:8px;color:rgba(242,244,247,.6);font-size:.78rem}' +
      '#alpenHeroLayout{display:contents}' +
      '#alpenHeroLayout .alpen-hero-left,#alpenHeroLayout .alpen-hero-right{display:contents}';
    document.head.appendChild(st);
  }

  function findHero() {
    return document.querySelector('#hero, section.hero, .hero');
  }

  function hideLoneCopy() {
    var hero = findHero();
    if (!hero) return;
    hero.querySelectorAll('button').forEach(function (btn) {
      if (btn.closest('#alpenJoinGrid') || btn.closest('.hero-actions')) return;
      var t = (btn.textContent || '').trim();
      if (t === 'Kopieren' || t === 'IP kopieren' && !btn.closest('#alpenJoinGrid')) {
        btn.style.display = 'none';
        var p = btn.parentElement;
        if (p && (p.textContent || '').replace(/\s+/g, ' ').trim().length < 24) p.style.display = 'none';
      }
    });
  }

  function undoBadWrap() {
    var wrap = document.getElementById('alpenHeroLayout');
    if (!wrap) return;
    var parent = wrap.parentNode;
    if (!parent) return;
    while (wrap.firstChild) {
      var col = wrap.firstChild;
      if (col.classList && (col.classList.contains('alpen-hero-left') || col.classList.contains('alpen-hero-right'))) {
        while (col.firstChild) parent.insertBefore(col.firstChild, wrap);
        wrap.removeChild(col);
      } else {
        parent.insertBefore(col, wrap);
      }
    }
    parent.removeChild(wrap);
  }

  function ensureMotd(hero) {
    if (document.getElementById('alpenMotd')) return;
    var bar = document.createElement('div');
    bar.id = 'alpenMotd';
    bar.innerHTML = '<b>Vom Server</b><span>' + MOTD + '</span>';
    var actions = hero.querySelector('.hero-actions, .hero-btns, .hero-buttons');
    if (actions && actions.parentNode) actions.parentNode.insertBefore(bar, actions.nextSibling);
    else {
      var h1 = hero.querySelector('h1');
      if (h1 && h1.parentNode) h1.parentNode.appendChild(bar);
      else hero.appendChild(bar);
    }
  }

  function ensureJoin(hero) {
    if (document.getElementById('alpenJoinGrid')) return;
    var grid = document.createElement('div');
    grid.id = 'alpenJoinGrid';
    grid.className = 'alpen-join-grid';
    grid.innerHTML =
      '<div class="alpen-join-card"><h3>Java</h3>' +
      '<div class="alpen-join-row"><input readonly value="' + IP + '">' +
      '<button type="button" data-copy="' + IP + '">IP kopieren</button></div>' +
      '<small>Mehrspieler \u2192 Server hinzuf\u00fcgen</small></div>' +
      '<div class="alpen-join-card"><h3>Bedrock</h3>' +
      '<div class="alpen-join-row"><input readonly value="' + IP + '">' +
      '<button type="button" data-copy="' + IP + '">IP kopieren</button></div>' +
      '<div class="alpen-join-row"><input readonly value="' + PORT + '">' +
      '<button type="button" data-copy="' + PORT + '">Port kopieren</button></div>' +
      '<small>Port ' + PORT + ' \u00b7 Crossplay</small></div>';
    hero.appendChild(grid);
    grid.querySelectorAll('button[data-copy]').forEach(function (btn) {
      btn.onclick = function () { copy(btn.getAttribute('data-copy'), btn); };
    });
  }

  function run() {
    var hero = findHero();
    if (!hero) return;
    undoBadWrap();
    ensureMotd(hero);
    ensureJoin(hero);
    hideLoneCopy();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  setTimeout(run, 200);
  setTimeout(run, 800);
})();
