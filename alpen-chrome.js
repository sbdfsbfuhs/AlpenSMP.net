/* AlpenSMP – gemeinsame globale Hauptnavigation auf allen normalen Seiten. */
(function () {
  if (window.__alpenChrome) return;
  window.__alpenChrome = true;

  var path = (location.pathname || "/").replace(/\/+$/, "") || "/";
  var p = path.toLowerCase();
  if (p === "/" || p.indexOf("/team") === 0) return;

  var pages = ["/guide", "/regeln", "/reviews"];
  var isSupported = pages.some(function (page) { return p.indexOf(page) === 0; });
  if (!isSupported) return;

  var css = [
    ".alpen-nav{position:sticky;top:0;z-index:1000;height:72px;background:rgba(8,10,14,.92);backdrop-filter:blur(18px);border-bottom:1px solid rgba(255,255,255,.08)}",
    ".alpen-nav *{box-sizing:border-box}",
    ".alpen-nav-inner{max-width:1200px;margin:0 auto;padding:0 24px;height:100%;display:flex;align-items:center;justify-content:space-between;gap:12px}",
    ".alpen-nav .alpen-logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:#f2f4f7;font-family:'Outfit',system-ui,sans-serif;font-weight:800;font-size:1.4rem;letter-spacing:-.02em;flex-shrink:0}",
    ".alpen-nav .alpen-logo img{width:36px;height:36px;border-radius:9px;object-fit:contain}",
    ".alpen-nav .alpen-logo span{background:linear-gradient(135deg,#fff,#e05c5c 55%,#f87171);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}",
    ".alpen-nav-links{display:flex;align-items:center;gap:4px;list-style:none;margin:0;padding:0;flex-wrap:nowrap;min-width:0}",
    ".alpen-nav-links a{position:relative;display:inline-flex;align-items:center;min-height:44px;padding:8px 14px;border-radius:8px;color:#9aa3b2;text-decoration:none;font-family:'Inter',system-ui,sans-serif;font-weight:500;font-size:.92rem;white-space:nowrap;transition:color .3s,background .3s,transform .3s}",
    ".alpen-nav-links a:after{content:'';position:absolute;left:14px;right:14px;bottom:4px;height:2px;background:linear-gradient(90deg,#c73e3e,#e05c5c);border-radius:2px;transform:scaleX(0);transform-origin:left;transition:transform .35s}",
    ".alpen-nav-links a:hover{color:#f2f4f7;background:rgba(199,62,62,.08);transform:translateY(-1px)}",
    ".alpen-nav-links a:hover:after,.alpen-nav-links a[aria-current='page']:after{transform:scaleX(1)}",
    ".alpen-nav-links a[aria-current='page']{color:#f2f4f7}",
    ".alpen-nav-links .alpen-rules{color:#fff;background:rgba(199,62,62,.18);border:1px solid rgba(229,57,53,.4);font-weight:700;padding:8px 16px}",
    ".alpen-nav-links .alpen-rules:after,.alpen-nav-links .alpen-cta:after{display:none}",
    ".alpen-nav-links .alpen-cta{background:linear-gradient(135deg,#b91c1c,#c73e3e);color:#fff;font-weight:600;padding:10px 20px;border-radius:10px;box-shadow:0 4px 20px rgba(199,62,62,.38)}",
    ".alpen-nav-links .alpen-cta:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(199,62,62,.38)}",
    ".alpen-hamburger{display:none;flex-direction:column;gap:5px;background:none;border:0;cursor:pointer;padding:8px}",
    ".alpen-hamburger span{width:22px;height:2px;background:#f2f4f7;border-radius:2px;transition:.3s}",
    ".alpen-mobile{display:none}",
    "@media(max-width:1100px){.alpen-nav-links{display:none}.alpen-hamburger{display:flex}.alpen-mobile{position:absolute;top:72px;left:0;right:0;z-index:999;background:rgba(8,10,14,.97);backdrop-filter:blur(20px);padding:20px 24px;flex-direction:column;gap:6px;border-bottom:1px solid rgba(255,255,255,.08)}.alpen-mobile.show{display:flex}.alpen-mobile a{color:#9aa3b2;text-decoration:none;padding:14px 16px;border-radius:10px;font:500 .95rem 'Inter',system-ui,sans-serif}.alpen-mobile a:hover,.alpen-mobile a[aria-current='page']{background:rgba(199,62,62,.12);color:#f2f4f7}.alpen-mobile .alpen-cta{background:linear-gradient(135deg,#b91c1c,#c73e3e);color:#fff;font-weight:700}}",
    "@media(max-width:520px){.alpen-nav-inner{padding:0 16px}.alpen-nav .alpen-logo{font-size:1.15rem}.alpen-mobile{padding:16px}}"] .join("");

  function activeKey() {
    if (p.indexOf("/guide") === 0) return "guide";
    if (p.indexOf("/reviews") === 0) return "reviews";
    return "rules";
  }

  function link(href, label, key, extra) {
    var current = key === activeKey() ? " aria-current=\"page\"" : "";
    return "<a href=\"" + href + "\"" + current + (extra ? " class=\"" + extra + "\"" : "") + ">" + label + "</a>";
  }

  function render() {
    if (document.getElementById("alpenGlobalNav")) return;
    var items = [
      link("https://alpensmp.net/#home", "Home", "home"),
      link("https://alpensmp.net/#live", "Live", "live"),
      link("https://alpensmp.net/#about", "Über uns", "about"),
      link("https://alpensmp.net/#features", "Features", "features"),
      link("https://alpensmp.net/#join", "Beitreten", "join"),
      link("https://alpensmp.net/#reviews", "Stimmen", "reviews"),
      link("https://alpensmp.net/#faq", "FAQ", "faq"),
      link("https://alpensmp.net/regeln/", "📜 Server-Regeln", "rules", "alpen-rules"),
      link("https://alpensmp.net/guide/", "Spieler-Guide", "guide", "alpen-rules"),
      link("https://alpensmp.net/#join", "SPIELEN", "join", "alpen-cta")
    ].join("");
    var mobile = [
      link("https://alpensmp.net/#home", "Home", "home"), link("https://alpensmp.net/#live", "Live", "live"),
      link("https://alpensmp.net/#about", "Über uns", "about"), link("https://alpensmp.net/#features", "Features", "features"),
      link("https://alpensmp.net/#join", "Beitreten", "join"), link("https://alpensmp.net/#reviews", "Stimmen", "reviews"),
      link("https://alpensmp.net/#faq", "FAQ", "faq"), link("https://alpensmp.net/regeln/", "📜 Server-Regeln", "rules"),
      link("https://alpensmp.net/guide/", "Spieler-Guide", "guide"), link("https://alpensmp.net/#join", "SPIELEN", "join", "alpen-cta")
    ].join("");
    var wrap = document.createElement("div");
    wrap.innerHTML = "<nav id=\"alpenGlobalNav\" class=\"alpen-nav\" aria-label=\"Hauptnavigation\"><div class=\"alpen-nav-inner\"><a class=\"alpen-logo\" href=\"https://alpensmp.net/\"><img src=\"https://alpensmp.net/logo.png\" alt=\"AlpenSMP Logo\"><span>ALPEN<span>SMP</span></span></a><div class=\"alpen-nav-links\">" + items + "</div><button class=\"alpen-hamburger\" type=\"button\" aria-label=\"Menü öffnen\" aria-expanded=\"false\"><span></span><span></span><span></span></button></div><div class=\"alpen-mobile\">" + mobile + "</div></nav>";
    var old = document.querySelector("body > nav");
    if (old) old.replaceWith(wrap.firstElementChild); else document.body.insertBefore(wrap.firstElementChild, document.body.firstChild);
    var nav = document.getElementById("alpenGlobalNav");
    var button = nav.querySelector(".alpen-hamburger");
    var menu = nav.querySelector(".alpen-mobile");
    button.addEventListener("click", function () { var open = menu.classList.toggle("show"); button.setAttribute("aria-expanded", String(open)); });
  }

  var style = document.createElement("style"); style.id = "alpenChromeCss"; style.textContent = css; document.head.appendChild(style);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render); else render();
})();
