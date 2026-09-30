/* Hero: MOTD + klare Java/Bedrock-Join-Felder */
(function () {
  if (window.__alpenHeroInvite) return;
  window.__alpenHeroInvite = true;
  var path = (location.pathname || '/').toLowerCase();
  if (path.indexOf('/team') !== -1) return;
  if (path !== '/' && path !== '/index.html' && path !== '') return;

  var IP = 'alpensmp.falixsrv.me';
  var PORT = '27491';
  var MOTD = 'AlpenSMP \u2022 ETWAS GROSSES KOMMT... \u00b7 Vielleicht bald neue IP? \u2022 AlpenSMP.net jetzt hinzuf\u00fcgen!';

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
      '#alpenMotd{display:flex;align-items:center;gap:12px;margin:0 auto 22px;max-width:920px;padding:11px 16px;border-radius:999px;border:1px solid rgba(212,175,106,.28);background:linear-gradient(90deg,rgba(28,24,16,.88),rgba(18,16,12,.92));color:#e8d9a8;font-size:.92rem;overflow:hidden}' +
      '#alpenMotd b{color:#f3e3b0;white-space:nowrap}' +
      '#alpenMotd .motd-track{overflow:hidden;flex:1}' +
      '#alpenMotd .motd-text{display:inline-block;white-space:nowrap;animation:motdSlide 22s linear infinite}' +
      '@keyframes motdSlide{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}' +
      '.alpen-join-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:22px;max-width:760px}' +
      '.alpen-join-card{text-align:left;padding:16px 16px 14px;border-radius:16px;border:1px solid var(--border);background:rgba(8,10,14,.55);backdrop-filter:blur(10px)}' +
      '.alpen-join-card h3{margin:0 0 10px;font-size:1.02rem}' +
      '.alpen-join-row{display:flex;gap:8px;align-items:center;margin-top:8px}' +
      '.alpen-join-row input{flex:1;min-width:0;background:rgba(255,255,255,.04);border:1px solid var(--border);color:#fff;border-radius:10px;padding:10px 12px;font-family:ui-monospace,monospace}' +
      '.alpen-join-row button{flex-shrink:0;background:#c73e3e;border:0;color:#fff;border-radius:10px;padding:10px 12px;font-weight:700;cursor:pointer}' +
      '.alpen-join-card small{display:block;margin-top:8px;color:var(--text2);font-size:.8rem}' +
      '@media(max-width:720px){.alpen-join-grid{grid-template-columns:1fr}#alpenMotd{border-radius:16px;align-items:flex-start}}';
    document.head.appendChild(st);
  }

  function findHero() {
    return document.querySelector('#hero, .hero, section.hero, header.hero, .hero-copy') ||
      document.querySelector('main section') ||
      document.querySelector('h1') && document.querySelector('h1').closest('section');
  }

  function injectMotd(hero) {
    if (document.getElementById('alpenMotd')) return;
    var bar = document.createElement('div');
    bar.id = 'alpenMotd';
    bar.innerHTML = '<b>Vom Server</b><div class="motd-track"><span class="motd-text">' +
      MOTD + ' \u00a0\u00a0\u2022\u00a0\u00a0 ' + MOTD + '</span></div>';
    var host = hero.querySelector('.container, .hero-copy, .hero-inner') || hero;
    host.insertBefore(bar, host.firstChild);
  }

  function injectJoin(hero) {
    if (document.getElementById('alpenJoinGrid')) return;
    var grid = document.createElement('div');
    grid.id = 'alpenJoinGrid';
    grid.className = 'alpen-join-grid';
    grid.innerHTML =
      '<div class="alpen-join-card"><h3>Java</h3>' +
      '<div class="alpen-join-row"><input id="alpenJavaIp" readonly value="' + IP + '">' +
      '<button type="button" data-copy="' + IP + '">IP kopieren</button></div>' +
      '<small>Mehrspieler \u2192 Server hinzuf\u00fcgen \u2192 Adresse einf\u00fcgen</small></div>' +
      '<div class="alpen-join-card"><h3>Bedrock</h3>' +
      '<div class="alpen-join-row"><input id="alpenBedrockIp" readonly value="' + IP + '">' +
      '<button type="button" data-copy="' + IP + '">IP kopieren</button></div>' +
      '<div class="alpen-join-row"><input id="alpenBedrockPort" readonly value="' + PORT + '">' +
      '<button type="button" data-copy="' + PORT + '">Port kopieren</button></div>' +
      '<small>Adresse + Port ' + PORT + ' \u00b7 Crossplay mit Java</small></div>';
    var after = hero.querySelector('h1, .stitle, .hero-copy p, .sdesc');
    var box = hero.querySelector('.container, .hero-copy, .hero-inner') || hero;
    if (after && after.parentNode === box) after.parentNode.insertBefore(grid, after.nextSibling);
    else box.appendChild(grid);
    grid.querySelectorAll('button[data-copy]').forEach(function (btn) {
      btn.onclick = function () { copy(btn.getAttribute('data-copy'), btn); };
    });
  }

  function run() {
    var hero = findHero();
    if (!hero) return;
    injectMotd(hero);
    injectJoin(hero);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  setTimeout(run, 400);
})();
