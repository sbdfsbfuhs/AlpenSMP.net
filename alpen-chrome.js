/* Gemeinsame Navigation nur auf Guide und Regeln – Startseite bleibt Referenz */
(function () {
  if (window.__alpenChrome) return;
  window.__alpenChrome = true;
  var path = (location.pathname || "/").replace(/\/+$/, "") || "/";
  var p = path.toLowerCase();
  if (p === "/" || p.indexOf("/team") === 0) return;
  if (p.indexOf("/guide") !== 0 && p.indexOf("/regeln") !== 0) return;
  var CSS = ".alpen-nav{position:sticky;top:0;z-index:80;height:72px;background:rgba(8,10,14,.92);backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,.08)}.alpen-nav-inner{max-width:1180px;margin:0 auto;padding:0 16px;height:100%;display:flex;align-items:center;justify-content:space-between;gap:12px}.alpen-nav .logo{display:flex;align-items:center;gap:10px;font-family:Outfit,Inter,sans-serif;font-weight:800;color:#fff;text-decoration:none}.alpen-nav .logo img{width:36px;height:36px;border-radius:9px}.alpen-nav .logo span{background:linear-gradient(135deg,#fff,#e05c5c);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.alpen-links{display:flex;align-items:center;gap:4px;list-style:none;margin:0;padding:0;overflow:auto}.alpen-links a{color:#9aa3b2;font-weight:600;font-size:.88rem;padding:10px 12px;border-radius:10px;text-decoration:none;white-space:nowrap;min-height:44px;display:inline-flex;align-items:center}.alpen-links a:hover{color:#fff;background:rgba(199,62,62,.12)}.alpen-links a.on{color:#fff;background:rgba(199,62,62,.22);border:1px solid rgba(229,57,53,.45)}.alpen-links .nav-cta{background:linear-gradient(135deg,#b91c1c,#c73e3e)!important;color:#fff!important}.alpen-ham{display:none;flex-direction:column;gap:5px;background:none;border:0;cursor:pointer}.alpen-ham span{display:block;width:22px;height:2px;background:#fff}.alpen-mobile{display:none;flex-direction:column;padding:12px 16px;background:#080a0e}.alpen-mobile.show{display:flex}.alpen-mobile a{color:#d1d5db;padding:12px;text-decoration:none}.alpen-hero{position:relative;padding:56px 20px 40px;text-align:center;overflow:hidden}.alpen-hero::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,10,14,.42),rgba(8,10,14,.92)),url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=60&w=1600&auto=format&fit=crop') center/cover;pointer-events:none}.alpen-hero>*{position:relative}.alpen-foot{border-top:1px solid rgba(255,255,255,.08);padding:28px 20px;text-align:center;color:#6b7280}.alpen-foot a{color:#9aa3b2;margin:0 8px}@media(max-width:980px){.alpen-links{display:none}.alpen-ham{display:flex}}";
  function injectCss() {
    if (document.getElementById("alpenChromeCss")) return;
    var s = document.createElement("style"); s.id = "alpenChromeCss"; s.textContent = CSS; document.head.appendChild(s);
  }
  function links(active) {
    var items = [["https://alpensmp.net/#home","Home","home"],["https://alpensmp.net/#live","Live","live"],["https://alpensmp.net/#about","Über uns","about"],["https://alpensmp.net/#features","Features","features"],["https://alpensmp.net/#join","Beitreten","join"],["https://alpensmp.net/#reviews","Stimmen","reviews"],["https://alpensmp.net/#faq","FAQ","faq"],["https://alpensmp.net/regeln/","Server-Regeln","regeln"],["https://alpensmp.net/guide/","Spieler-Guide","guide"]];
    return items.map(function (it) { return "<li><a class='" + (it[2] === active ? "on" : "") + "' href='" + it[0] + "'>" + it[1] + "</a></li>"; }).join("") + "<li><a class='nav-cta' href='https://alpensmp.net/#join'>SPIELEN</a></li>";
  }
  function activeKey() { return p.indexOf("/guide") === 0 ? "guide" : "regeln"; }
  function paintNav() {
    var html = "<nav class='alpen-nav'><div class='alpen-nav-inner'><a class='logo' href='https://alpensmp.net'><img src='https://alpensmp.net/logo.png' alt=''>ALPEN<span>SMP</span></a><ul class='alpen-links'>" + links(activeKey()) + "</ul><button class='alpen-ham' type='button' id='alpenHam'><span></span><span></span><span></span></button></div></nav><div class='alpen-mobile' id='alpenMobile'>" + links(activeKey()).replace(/<li>|<\/li>/g, "") + "</div>";
    var old = document.querySelector("nav"); var wrap = document.createElement("div"); wrap.innerHTML = html;
    if (old && old.parentNode) old.parentNode.replaceChild(wrap, old);
    else document.body.insertBefore(wrap, document.body.firstChild);
    var ham = document.getElementById("alpenHam"); var mob = document.getElementById("alpenMobile");
    if (ham && mob) ham.onclick = function () { mob.classList.toggle("show"); };
  }
  function paintFooter() {
    var html = "<footer class='alpen-foot'><strong>ALPEN SMP</strong><div style='margin-top:10px'><a href='https://alpensmp.net'>Start</a><a href='https://alpensmp.net/guide/'>Spieler-Guide</a><a href='https://alpensmp.net/regeln/'>Server-Regeln</a><a href='https://discord.gg/FfR56Ddtj8' target='_blank' rel='noopener'>Discord</a></div><div style='margin-top:10px'>© " + new Date().getFullYear() + " AlpenSMP</div></footer>";
    var f = document.querySelector("footer"); if (f) f.outerHTML = html; else document.body.insertAdjacentHTML("beforeend", html);
  }
  function paintHero() { var hero = document.querySelector(".hero, header.hero, .page-hero"); if (hero) hero.classList.add("alpen-hero"); }
  function boot() { injectCss(); paintNav(); paintFooter(); paintHero(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
