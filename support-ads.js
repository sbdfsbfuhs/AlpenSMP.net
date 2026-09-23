/* AlpenSMP – optionaler Support, Werbung erst nach Klick */
(function () {
  if (window.__alpenSupportAds) return;
  window.__alpenSupportAds = true;
  var p = (location.pathname || '/').toLowerCase();
  if (p.indexOf('/team') !== -1) return;

  var KEY = 'alpensmp_show_ads';
  function adsOn() {
    try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }
  function setAds(on) {
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {}
    renderRail();
    syncToggle();
  }

  /* Eigene kleine Slots – später durch echte Ad-Codes ersetzbar */
  var SLOTS = [
    { title: 'Discord', text: 'Community & Support', href: 'https://discord.gg/FfR56Ddtj8' },
    { title: 'TikTok', text: '@alpensmp', href: 'https://www.tiktok.com/@alpensmp' }
  ];

  var css = document.createElement('style');
  css.textContent = [
    '#alpenSupportBtn{position:fixed;left:16px;bottom:16px;z-index:880;border:1px solid rgba(255,255,255,.12);background:rgba(18,22,30,.92);color:#f2f4f7;border-radius:999px;padding:8px 12px;font:600 12px Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.35)}',
    '#alpenSupportBtn:hover{border-color:rgba(199,62,62,.45);color:#fff}',
    '#alpenSupportPanel{position:fixed;left:16px;bottom:56px;z-index:881;width:min(260px,calc(100vw - 32px));background:rgba(12,16,24,.97);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:14px;display:none;box-shadow:0 16px 40px rgba(0,0,0,.45)}',
    '#alpenSupportPanel.open{display:block}',
    '#alpenSupportPanel h4{margin:0 0 6px;font:700 14px Outfit,Inter,sans-serif}',
    '#alpenSupportPanel p{margin:0 0 12px;color:#9aa3b2;font:13px/1.45 Inter,system-ui,sans-serif}',
    '#alpenSupportPanel label{display:flex;gap:8px;align-items:flex-start;font:13px Inter,system-ui,sans-serif;color:#f2f4f7;cursor:pointer}',
    '#alpenSupportRail{position:fixed;right:10px;top:50%;transform:translateY(-50%);z-index:700;width:108px;display:none;flex-direction:column;gap:10px}',
    '#alpenSupportRail.show{display:flex}',
    '.alpen-ad-slot{display:block;text-decoration:none;color:#f2f4f7;background:rgba(18,22,30,.88);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:10px 8px;text-align:center}',
    '.alpen-ad-slot strong{display:block;font:700 11px Outfit,sans-serif;color:#e05c5c;letter-spacing:.04em;text-transform:uppercase}',
    '.alpen-ad-slot span{display:block;margin-top:4px;font:11px/1.35 Inter,sans-serif;color:#9aa3b2}',
    '@media(max-width:1100px){#alpenSupportRail{display:none!important}}',
    '@media(max-width:700px){#alpenSupportBtn{bottom:92px;left:12px}}'
  ].join('');
  document.head.appendChild(css);

  var btn = document.createElement('button');
  btn.id = 'alpenSupportBtn';
  btn.type = 'button';
  btn.textContent = 'Unterstützen';
  document.body.appendChild(btn);

  var panel = document.createElement('div');
  panel.id = 'alpenSupportPanel';
  panel.innerHTML = '<h4>Server unterstützen</h4><p>Hosting kostet. Werbung bleibt aus, bis du sie bewusst einschaltest. Kein Vorteil im Spiel.</p><label><input id="alpenAdsToggle" type="checkbox"> Kleine Banner rechts anzeigen</label>';
  document.body.appendChild(panel);

  var rail = document.createElement('aside');
  rail.id = 'alpenSupportRail';
  rail.setAttribute('aria-label', 'Unterstützung');
  document.body.appendChild(rail);

  function renderRail() {
    rail.innerHTML = '';
    if (!adsOn()) {
      rail.classList.remove('show');
      return;
    }
    SLOTS.forEach(function (s) {
      var a = document.createElement('a');
      a.className = 'alpen-ad-slot';
      a.href = s.href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML = '<strong>' + s.title + '</strong><span>' + s.text + '</span>';
      rail.appendChild(a);
    });
    rail.classList.add('show');
  }
  function syncToggle() {
    var t = document.getElementById('alpenAdsToggle');
    if (t) t.checked = adsOn();
  }

  btn.addEventListener('click', function () {
    panel.classList.toggle('open');
  });
  document.addEventListener('click', function (e) {
    if (!panel.contains(e.target) && e.target !== btn) panel.classList.remove('open');
  });
  panel.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'alpenAdsToggle') setAds(e.target.checked);
  });

  renderRail();
  syncToggle();
})();
