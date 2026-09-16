/* AlpenSMP – zentrale globale Hauptnavigation für alle normalen Hauptseiten. */
(function () {
  if (window.__alpenChrome) return;
  window.__alpenChrome = true;

  var path = (location.pathname || "/").replace(/\/+$/, "") || "/";
  var p = path.toLowerCase();
  if (p === "/" || p.indexOf("/team") === 0) return;

  var supported = ["/regeln", "/guide", "/reviews", "/map"];
  if (!supported.some(function (page) { return p.indexOf(page) === 0; })) return;

  var CSS = [
    ".alpen-global-nav{position:sticky;top:0;z-index:1000;height:72px;background:rgba(8,10,14,.92);backdrop-filter:blur(18px);border-bottom:1px solid rgba(255,255,255,.08)}",
    ".alpen-global-nav,.alpen-global-nav *{box-sizing:border-box}",
    ".alpen-global-nav-inner{max-width:1200px;margin:0 auto;padding:0 24px;height:100%;display:flex;align-items:center;justify-content:space-between;gap:12px}",
    ".alpen-global-logo{display:flex;align-items:center;gap:10px;color:#f2f4f7;text-decoration:none;font-family:'Outfit',system-ui,sans-serif;font-weight:800;font-size:1.4rem;letter-spacing:-.02em;flex-shrink:0}",
    ".alpen-global-logo img{width:36px;height:36px;border-radius:9px;object-fit:contain}",
    ".alpen-global-logo>span>span{background:linear-gradient(135deg,#fff,#e05c5c 55%,#f87171);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}",
    ".alpen-global-links{display:flex;align-items:center;gap:4px;list-style:none;margin:0;padding:0;min-width:0;flex-wrap:nowrap}",
    ".alpen-global-links a{position:relative;display:inline-flex;align-items:center;min-height:44px;padding:8px 14px;border-radius:8px;color:#9aa3b2;text-decoration:none;font-family:'Inter',system-ui,sans-serif;font-weight:500;font-size:.92rem;white-space:nowrap;transition:color .3s,background .3s,transform .3s}",
    ".alpen-global-links a:after{content:'';position:absolute;left:14px;right:14px;bottom:4px;height:2px;background:linear-gradient(90deg,#c73e3e,#e05c5c);border-radius:2px;transform:scaleX(0);transform-origin:left;transition:transform .35s}",
    ".alpen-global-links a:hover{color:#f2f4f7;background:rgba(199,62,62,.08);transform:translateY(-1px)}",
    ".alpen-global-links a[aria-current='page'],.alpen-global-links a[aria-current='page']:hover{color:#f2f4f7}",
    ".alpen-global-links a:hover:after,.alpen-global-links a[aria-current='page']:after{transform:scaleX(1)}",
    ".alpen-global-links a.alpen-rules{color:#fff;background:rgba(199,62,62,.18);border:1px solid rgba(229,57,53,.4);font-weight:700;padding:8px 16px}",
    ".alpen-global-links a.alpen-rules:after,.alpen-global-links a.alpen-cta:after{display:none}",
    ".alpen-global-links a.alpen-cta{background:linear-gradient(135deg,#b91c1c,#c73e3e);color:#fff;font-weight:600;padding:10px 20px;border-radius:10px;box-shadow:0 4px 20px rgba(199,62,62,.38)}",
    ".alpen-global-links a.alpen-cta:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(199,62,62,.38)}",
    ".alpen-global-hamburger{display:none;flex-direction:column;gap:5px;background:none;border:0;cursor:pointer;padding:8px}",
    ".alpen-global-hamburger span{width:22px;height:2px;background:#f2f4f7;border-radius:2px;transition:.3s}",
    ".alpen-global-mobile{display:none}",
    "@media(max-width:1100px){.alpen-global-links{display:none}.alpen-global-hamburger{display:flex}.alpen-global-mobile{position:absolute;top:72px;left:0;right:0;z-index:999;background:rgba(8,10,14,.97);backdrop-filter:blur(20px);padding:20px 24px;flex-direction:column;gap:6px;border-bottom:1px solid rgba(255,255,255,.08)}.alpen-global-mobile.show{display:flex}.alpen-global-mobile a{color:#9aa3b2;text-decoration:none;padding:14px 16px;border-radius:10px;font:500 .95rem 'Inter',system-ui,sans-serif}.alpen-global-mobile a:hover,.alpen-global-mobile a[aria-current='page']{background:rgba(199,62,62,.12);color:#f2f4f7}.alpen-global-mobile a.alpen-cta{background:linear-gradient(135deg,#b91c1c,#c73e3e);color:#fff;font-weight:700}}",
    "@media(max-width:520px){.alpen-global-nav-inner{padding:0 16px}.alpen-global-logo{font-size:1.15rem}.alpen-global-mobile{padding:16px}}"
  ].join("");

  function current(key) { return key === (p.indexOf("/regeln") === 0 ? "rules" : p.indexOf("/guide") === 0 ? "guide" : p.indexOf("/reviews") === 0 ? "reviews" : "map") ? " aria-current=\"page\"" : ""; }
  function a(href, text, key, cls) { return "<a href=\"" + href + "\"" + current(key) + (cls ? " class=\"" + cls + "\"" : "") + ">" + text + "</a>"; }

  function render() {
    if (document.getElementById("alpenGlobalNav")) return;
    var links = [
      a("https://alpensmp.net/#home", "Home", "home"),
      a("https://alpensmp.net/#live", "Live", "live"),
      a("https://alpensmp.net/#about", "Über uns", "about"),
      a("https://alpensmp.net/#features", "Features", "features"),
      a("https://alpensmp.net/#join", "Beitreten", "join"),
      a("https://alpensmp.net/#reviews", "Stimmen", "reviews"),
      a("https://alpensmp.net/#faq", "FAQ", "faq"),
      a("https://alpensmp.net/regeln/", "📜 Server-Regeln", "rules", "alpen-rules"),
      a("https://alpensmp.net/guide/", "Spieler-Guide", "guide", "alpen-rules"),
      a("https://alpensmp.net/#join", "SPIELEN", "join", "alpen-cta")
    ].join("");
    var mobile = [
      a("https://alpensmp.net/#home", "Home", "home"), a("https://alpensmp.net/#live", "Live", "live"),
      a("https://alpensmp.net/#about", "Über uns", "about"), a("https://alpensmp.net/#features", "Features", "features"),
      a("https://alpensmp.net/#join", "Beitreten", "join"), a("https://alpensmp.net/#reviews", "Stimmen", "reviews"),
      a("https://alpensmp.net/#faq", "FAQ", "faq"), a("https://alpensmp.net/regeln/", "📜 Server-Regeln", "rules"),
      a("https://alpensmp.net/guide/", "Spieler-Guide", "guide"), a("https://alpensmp.net/#join", "SPIELEN", "join", "alpen-cta")
    ].join("");

    var host = document.createElement("div");
    host.innerHTML = "<nav id=\"alpenGlobalNav\" class=\"alpen-global-nav\" aria-label=\"Hauptnavigation\"><div class=\"alpen-global-nav-inner\"><a class=\"alpen-global-logo\" href=\"https://alpensmp.net/\"><img src=\"https://alpensmp.net/logo.png\" alt=\"AlpenSMP Logo\"><span>ALPEN<span>SMP</span></span></a><div class=\"alpen-global-links\">" + links + "</div><button class=\"alpen-global-hamburger\" type=\"button\" aria-label=\"Menü öffnen\" aria-expanded=\"false\"><span></span><span></span><span></span></button></div><div class=\"alpen-global-mobile\">" + mobile + "</div></nav>";
    var nav = host.firstElementChild;
    var oldNav = document.querySelector("body > nav");
    if (oldNav) oldNav.remove();
    var oldBar = document.querySelector("body > .bar");
    if (oldBar) oldBar.remove();
    document.body.insertBefore(nav, document.body.firstChild);

    var button = nav.querySelector(".alpen-global-hamburger");
    var menu = nav.querySelector(".alpen-global-mobile");
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("show");
      button.setAttribute("aria-expanded", String(open));
    });
  }

  var style = document.createElement("style");
  style.id = "alpenChromeCss";
  style.textContent = CSS;
  document.head.appendChild(style);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render); else render();
})();
