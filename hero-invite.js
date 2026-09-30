/* Hero: MOTD + Java/Bedrock untereinander, mittig, animiert */
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
      btn.classList.add('copied');
      var old = btn.textContent;
      btn.textContent = 'Kopiert';
      setTimeout(function () { btn.textContent = old; btn.classList.remove('copied'); }, 1400);
    }
  }

  if (!document.getElementById('alpenHeroCss')) {
    var st = document.createElement('style');
    st.id = 'alpenHeroCss';
    st.textContent =
      '#alpenMotd{display:flex;align-items:center;justify-content:center;gap:12px;margin:0 auto 20px;max-width:720px;padding:10px 18px;border-radius:999px;border:1px solid rgba(212,175,106,.3);background:linear-gradient(90deg,rgba(28,24,16,.82),rgba(18,16,12,.9));color:#e8d9a8;font-size:.88rem;overflow:hidden;animation:heroFade .6s ease both}' +
      '#alpenMotd b{color:#f3e3b0;white-space:nowrap}' +
      '#alpenMotd .motd-track{overflow:hidden;flex:1;min-width:0}' +
      '#alpenMotd .motd-text{display:inline-block;white-space:nowrap;animation:motdSlide 24s linear infinite}' +
      '@keyframes motdSlide{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}' +
      '@keyframes heroFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}' +
      '@keyframes heroPulse{0%,100%{box-shadow:0 0 0 0 rgba(199,62,62,.35)}70%{box-shadow:0 0 0 8px rgba(199,62,62,0)}}' +
      '.hero .alpen-join-grid,.alpen-join-grid{display:flex;flex-direction:column;gap:12px;margin:22px auto 0;max-width:420px;width:100%;text-align:left}' +
      '.alpen-join-card{padding:16px;border-radius:16px;border:1px solid rgba(255,255,255,.1);background:rgba(8,10,14,.62);backdrop-filter:blur(12px);animation:heroFade .55s ease both;transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease}' +
      '.alpen-join-card:nth-child(2){animation-delay:.08s}' +
      '.alpen-join-card:hover{transform:translateY(-3px);border-color:rgba(199,62,62,.4);box-shadow:0 12px 30px rgba(0,0,0,.28)}' +
      '.alpen-join-card h3{margin:0 0 10px;font-size:1rem}' +
      '.alpen-join-row{display:flex;gap:8px;align-items:center;margin-top:8px}' +
      '.alpen-join-row input{flex:1;min-width:0;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:#fff;border-radius:10px;padding:10px 12px;font-family:ui-monospace,monospace;transition:border-color .2s,box-shadow .2s,transform .2s}' +
      '.alpen-join-row input:focus{outline:none;border-color:#c73e3e;box-shadow:0 0 0 3px rgba(199,62,62,.22);transform:translateY(-1px)}' +
      '.alpen-join-row button{flex-shrink:0;background:#c73e3e;border:0;color:#fff;border-radius:10px;padding:10px 12px;font-weight:700;cursor:pointer;transition:transform .2s,filter .2s,background .2s}' +
      '.alpen-join-row button:hover{filter:brightness(1.08);transform:translateY(-1px)}' +
      '.alpen-join-row button:active{transform:scale(.96)}' +
      '.alpen-join-row button.copied{background:#34d399;animation:heroPulse .6s ease}' +
      '.alpen-join-card small{display:block;margin-top:8px;color:rgba(242,244,247,.62);font-size:.78rem}' +
      '.hero .hero-actions a,.hero .hero-actions button,.hero .btn{transition:transform .22s ease,box-shadow .22s ease}' +
      '.hero .hero-actions a:hover,.hero .btn:hover{transform:translateY(-2px)}' +
      '#alpenJoinGrid{position:relative;left:auto;right:auto;float:none;margin-left:auto;margin-right:auto}' +
      '@media(max-width:720px){#alpenMotd{border-radius:16px}}';
    document.head.appendChild(st);
  }

  function findHero() {
    return document.querySelector('#hero, section.hero, .hero') ||
      (document.querySelector('h1') && document.querySelector('h1').closest('section'));
  }

  function injectMotd(hero) {
    if (document.getElementById('alpenMotd')) return;
    var bar = document.createElement('div');
    bar.id = 'alpenMotd';
    bar.innerHTML = '<b>Vom Server</b><div class="motd-track"><span class="motd-text">' +
      MOTD + ' \u00a0\u00a0\u2022\u00a0\u00a0 ' + MOTD + '</span></div>';
    var h1 = hero.querySelector('h1');
    if (h1 && h1.parentNode) h1.parentNode.insertBefore(bar, h1);
    else {
      var box = hero.querySelector('.container, .hero-copy, .hero-inner') || hero;
      box.insertBefore(bar, box.firstChild);
    }
  }

  function injectJoin(hero) {
    if (document.getElementById('alpenJoinGrid')) {
      var old = document.getElementById('alpenJoinGrid');
      if (old && old.parentNode && old.previousElementSibling && old.previousElementSibling.tagName === 'H1') {
        old.remove();
      } else return;
    }
    var grid = document.createElement('div');
    grid.id = 'alpenJoinGrid';
    grid.className = 'alpen-join-grid';
    grid.innerHTML =
      '<div class="alpen-join-card"><h3>Java</h3>' +
      '<div class="alpen-join-row"><input readonly value="' + IP + '">' +
      '<button type="button" data-copy="' + IP + '">IP kopieren</button></div>' +
      '<small>Mehrspieler \u2192 Server hinzuf\u00fcgen \u2192 Adresse einf\u00fcgen</small></div>' +
      '<div class="alpen-join-card"><h3>Bedrock</h3>' +
      '<div class="alpen-join-row"><input readonly value="' + IP + '">' +
      '<button type="button" data-copy="' + IP + '">IP kopieren</button></div>' +
      '<div class="alpen-join-row"><input readonly value="' + PORT + '">' +
      '<button type="button" data-copy="' + PORT + '">Port kopieren</button></div>' +
      '<small>Adresse + Port ' + PORT + ' \u00b7 Crossplay mit Java</small></div>';
    var actions = hero.querySelector('.hero-actions, .hero-btns, .hero-buttons');
    var ipChip = hero.querySelector('.server-ip, .ip-chip, [class*="ip-copy"]');
    if (actions && actions.parentNode) actions.parentNode.insertBefore(grid, actions.nextSibling);
    else {
      var box = hero.querySelector('.container, .hero-copy, .hero-inner') || hero;
      box.appendChild(grid);
    }
    if (ipChip) ipChip.style.display = 'none';
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
  setTimeout(run, 300);
})();
