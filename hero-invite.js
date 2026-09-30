/* Hero: links Branding, rechts Join, MOTD unter Buttons, alte IP-Box weg */
(function () {
  if (window.__alpenHeroInvite) return;
  window.__alpenHeroInvite = true;
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
      btn.classList.add('copied');
      setTimeout(function () { btn.textContent = old; btn.classList.remove('copied'); }, 1400);
    }
  }

  if (!document.getElementById('alpenHeroCss')) {
    var st = document.createElement('style');
    st.id = 'alpenHeroCss';
    st.textContent =
      '#alpenHeroLayout{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(280px,.85fr);gap:36px 40px;align-items:center;width:100%;max-width:1180px;margin:0 auto;text-align:left}' +
      '#alpenHeroLayout .alpen-hero-left{display:flex;flex-direction:column;align-items:flex-start}' +
      '#alpenHeroLayout h1{font-size:clamp(3.4rem,7vw,6.1rem)!important;line-height:.92!important;letter-spacing:-.03em;margin:8px 0 14px!important}' +
      '#alpenHeroLayout .hero-actions,#alpenHeroLayout .hero-btns{justify-content:flex-start;margin-top:18px}' +
      '#alpenMotd{display:flex;align-items:center;gap:10px;margin:18px 0 0;max-width:100%;padding:10px 14px;border-radius:999px;border:1px solid rgba(255,213,79,.28);background:linear-gradient(90deg,rgba(28,24,16,.88),rgba(18,16,12,.92));color:#f0e2a8;font-family:ui-monospace,Consolas,monospace;font-size:.84rem;line-height:1.4}' +
      '#alpenMotd b{color:#ffe082;white-space:nowrap;font-family:inherit}' +
      '.alpen-join-grid{display:flex;flex-direction:column;gap:12px;width:100%}' +
      '.alpen-join-card{padding:16px;border-radius:16px;border:1px solid rgba(255,255,255,.1);background:rgba(8,10,14,.66);backdrop-filter:blur(12px)}' +
      '.alpen-join-card h3{margin:0 0 10px;font-size:1rem}' +
      '.alpen-join-row{display:flex;gap:8px;margin-top:8px}' +
      '.alpen-join-row input{flex:1;min-width:0;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:#fff;border-radius:10px;padding:10px 12px;font-family:ui-monospace,monospace}' +
      '.alpen-join-row button{flex-shrink:0;background:#c73e3e;border:0;color:#fff;border-radius:10px;padding:10px 12px;font-weight:700;cursor:pointer}' +
      '.alpen-join-row button.copied{background:#34d399}' +
      '.alpen-join-card small{display:block;margin-top:8px;color:rgba(242,244,247,.6);font-size:.78rem}' +
      '.hero .ip-chip,.hero .server-ip,.hero .server-ip-box,.hero .copy-ip,#hero .ip-row{display:none!important}' +
      '@media(max-width:900px){#alpenHeroLayout{grid-template-columns:1fr;text-align:center}#alpenHeroLayout .alpen-hero-left{align-items:center}#alpenHeroLayout .hero-actions{justify-content:center}}';
    document.head.appendChild(st);
  }

  function findHero() {
    return document.querySelector('#hero, section.hero, .hero');
  }

  function killOldCopy(root) {
    root.querySelectorAll('button,a,div,p,span').forEach(function (el) {
      if (el.closest('#alpenJoinGrid') || el.closest('#alpenMotd') || el.closest('.hero-actions')) return;
      var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!t) return;
      if (/^Kopieren$/i.test(t) || /^IP kopieren$/i.test(t) && !el.closest('#alpenJoinGrid')) {
        var box = el.closest('div') || el;
        if (box.id === 'alpenHeroLayout' || box.classList.contains('alpen-hero-left')) el.remove();
        else if ((box.textContent || '').replace(/\s+/g, ' ').trim().length < 40) box.remove();
        else el.remove();
        return;
      }
      if (/SERVER-?ADRESSE/i.test(t) && t.length < 90) {
        (el.closest('div') || el).style.display = 'none';
      }
    });
  }

  function ensureLayout(hero) {
    if (document.getElementById('alpenHeroLayout')) return document.getElementById('alpenHeroLayout');
    var box = hero.querySelector('.container') || hero;
    var wrap = document.createElement('div');
    wrap.id = 'alpenHeroLayout';
    var left = document.createElement('div');
    left.className = 'alpen-hero-left';
    var right = document.createElement('div');
    right.className = 'alpen-hero-right';
    while (box.firstChild) left.appendChild(box.firstChild);
    wrap.appendChild(left);
    wrap.appendChild(right);
    box.appendChild(wrap);
    return wrap;
  }

  function motdEl() {
    var bar = document.getElementById('alpenMotd');
    if (bar) return bar;
    bar = document.createElement('div');
    bar.id = 'alpenMotd';
    bar.innerHTML = '<b>Vom Server</b><span>' + MOTD + '</span>';
    return bar;
  }

  function joinEl() {
    var grid = document.getElementById('alpenJoinGrid');
    if (grid) return grid;
    grid = document.createElement('div');
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
    grid.querySelectorAll('button[data-copy]').forEach(function (btn) {
      btn.onclick = function () { copy(btn.getAttribute('data-copy'), btn); };
    });
    return grid;
  }

  function place() {
    var hero = findHero();
    if (!hero) return;
    var wrap = ensureLayout(hero);
    var left = wrap.querySelector('.alpen-hero-left');
    var right = wrap.querySelector('.alpen-hero-right');
    var bar = motdEl();
    var grid = joinEl();
    var actions = left.querySelector('.hero-actions, .hero-btns, .hero-buttons');
    if (bar.parentNode) bar.parentNode.removeChild(bar);
    if (actions && actions.parentNode === left) actions.parentNode.insertBefore(bar, actions.nextSibling);
    else left.appendChild(bar);
    right.appendChild(grid);
    killOldCopy(hero);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', place);
  else place();
  setTimeout(place, 250);
  setTimeout(place, 900);
})();
