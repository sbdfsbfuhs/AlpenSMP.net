/* Startseite: Live-Karte als großer Button, kein totes iframe */
(function () {
  if (window.__alpenLiveMapV6) return;
  window.__alpenLiveMapV6 = true;
  var MAP = "https://alpensmp-map.falix.org/#hauptworld:-1792:139:493:38:0.01:0:0:0:perspective";
  function injectCss() {
    var css = "#map.alpen-map-sec{padding:90px 24px}#map .alpen-map-head{text-align:center;max-width:740px;margin:0 auto 22px}#map .neu-pill{display:inline-flex;align-items:center;gap:8px;margin-bottom:10px}#map .neu-pill b{background:linear-gradient(135deg,#b91c1c,#c73e3e);color:#fff;font-size:.68rem;letter-spacing:.08em;padding:4px 8px;border-radius:999px}#map .map-cta{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;border:1px solid rgba(255,255,255,.08);border-radius:20px;background:rgba(18,22,30,.72);padding:48px 24px;min-height:280px;box-shadow:0 18px 50px rgba(0,0,0,.28)}#map .map-cta p{color:#c5cbd6;max-width:520px;text-align:center}#map .map-cta a{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:64px;padding:18px 36px;border-radius:14px;background:linear-gradient(135deg,#b91c1c,#c73e3e);color:#fff;font-weight:800;font-size:1.15rem;text-decoration:none;box-shadow:0 10px 28px rgba(199,62,62,.42)}.nav-links a#navMapLink,.mobile-menu a#mobileMapLink{position:relative}.nav-links a#navMapLink::before,.mobile-menu a#mobileMapLink::before{content:'NEU';position:absolute;top:-7px;right:-2px;background:#c73e3e;color:#fff;font-size:9px;font-weight:800;letter-spacing:.04em;padding:1px 5px;border-radius:999px}#map iframe,#map .alpen-map-frame,#map .shot-frame,#map .shot-dots,#map .shot-map-btn{display:none!important}@media(max-width:800px){#map.alpen-map-sec{padding:56px 16px}#map .map-cta{padding:32px 16px;min-height:220px}#map .map-cta a{width:100%;min-height:56px;font-size:1.05rem}}";
    var el = document.getElementById("alpenMapCss");
    if (!el) { el = document.createElement("style"); el.id = "alpenMapCss"; document.head.appendChild(el); }
    el.textContent = css;
  }
  function markup() {
    return "<div class='container'><div class='alpen-map-head'><div class='neu-pill'><b>NEU</b><p class='slabel' style='margin:0'>LIVE MAP</p></div><h2 class='stitle'>AlpenSMP Live-Karte</h2><p class='sdesc' style='margin:0 auto'>BlueMap – Hauptworld (Overworld).</p></div><div class='map-cta'><a href='" + MAP + "' target='_blank' rel='noopener'>\uD83D\uDDFA\uFE0F Live-Karte öffnen</a><p>Öffnet BlueMap der Hauptworld in einem neuen Tab.</p></div></div>";
  }
  function addSection() {
    var existing = document.getElementById("map");
    if (existing) {
      existing.className = "alpen-map-sec";
      existing.setAttribute("aria-label", "AlpenSMP Live-Karte Hauptworld");
      existing.innerHTML = markup();
      return;
    }
    var after = document.getElementById("live") || document.querySelector(".live-wrap") || document.getElementById("about");
    if (!after) return;
    var sec = document.createElement("section");
    sec.id = "map";
    sec.className = "alpen-map-sec";
    sec.setAttribute("aria-label", "AlpenSMP Live-Karte Hauptworld");
    sec.innerHTML = markup();
    after.insertAdjacentElement("afterend", sec);
  }
  function boot() {
    var p = location.pathname || "/";
    if (p !== "/" && p !== "/index.html") return;
    injectCss();
    addSection();
    var a = document.getElementById("navMapLink"); if (a) { a.textContent = "Karte"; a.href = "#map"; }
    var m = document.getElementById("mobileMapLink"); if (m) { m.textContent = "Karte"; m.href = "#map"; }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 200);
})();
