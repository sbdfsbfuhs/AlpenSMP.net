/* Startseite: Live-Karte Hauptworld, NEU nur hier */
(function () {
  if (window.__alpenLiveMapV4) return;
  window.__alpenLiveMapV4 = true;
  var MAP = "https://map.alpensmp.falixsrv.me/#hauptworld:-1792:102:500:132:0:0:0:0:perspective";
  function injectCss() {
    var css = "#map.alpen-map-sec{padding:90px 24px}#map .alpen-map-head{text-align:center;max-width:740px;margin:0 auto 22px}#map .neu-pill{display:inline-flex;align-items:center;gap:8px;margin-bottom:10px}#map .neu-pill b{background:linear-gradient(135deg,#b91c1c,#c73e3e);color:#fff;font-size:.68rem;letter-spacing:.08em;padding:4px 8px;border-radius:999px}#map .alpen-map-frame{position:relative;border:1px solid rgba(255,255,255,.08);border-radius:20px;overflow:hidden;background:#0b0f16;height:680px;box-shadow:0 18px 50px rgba(0,0,0,.28)}#map .alpen-map-frame iframe{width:100%;height:100%;border:0;display:block;background:#0b0f16}#map .map-fallback{display:none;position:absolute;inset:0;align-items:center;justify-content:center;flex-direction:column;gap:10px;padding:28px;text-align:center;background:#0b0f16;color:#c5cbd6}#map .map-fallback.show{display:flex}#map .map-fallback strong{color:#fff;font-family:Outfit,Inter,sans-serif;font-size:1.25rem}#map .shot-map-btn{display:flex;justify-content:center;margin-top:20px}#map .shot-map-btn a,#map .map-fallback a.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:12px 22px;border-radius:12px;background:linear-gradient(135deg,#b91c1c,#c73e3e);color:#fff;font-weight:700;text-decoration:none;box-shadow:0 8px 24px rgba(199,62,62,.38)}.nav-links a#navMapLink,.mobile-menu a#mobileMapLink{position:relative}.nav-links a#navMapLink::before,.mobile-menu a#mobileMapLink::before{content:'NEU';position:absolute;top:-7px;right:-2px;background:#c73e3e;color:#fff;font-size:9px;font-weight:800;letter-spacing:.04em;padding:1px 5px;border-radius:999px}#map .shot-frame,#map .shot-dots{display:none!important}@media(max-width:800px){#map.alpen-map-sec{padding:56px 16px}#map .alpen-map-frame{height:min(70vh,520px);border-radius:16px}}";
    var el = document.getElementById("alpenMapCss");
    if (!el) { el = document.createElement("style"); el.id = "alpenMapCss"; document.head.appendChild(el); }
    el.textContent = css;
  }
  function markup() {
    return "<div class='container'><div class='alpen-map-head'><div class='neu-pill'><b>NEU</b><p class='slabel' style='margin:0'>LIVE MAP</p></div><h2 class='stitle'>AlpenSMP Live-Karte</h2><p class='sdesc' style='margin:0 auto'>BlueMap – Hauptworld (Overworld). Erkunde die Welt live und sieh, wo sich Spieler gerade befinden.</p></div><div class='alpen-map-frame'><iframe id='alpenMapFrame' title='BlueMap Hauptworld' src='" + MAP + "' allowfullscreen loading='eager' referrerpolicy='no-referrer-when-downgrade'></iframe><div class='map-fallback' id='alpenMapFallback'><strong>Die Karte antwortet gerade nicht.</strong><p>Öffnet direkt die Hauptworld (Overworld) in einem neuen Tab.</p><a class='btn' href='" + MAP + "' target='_blank' rel='noopener'>\uD83D\uDDFA\uFE0F Hauptworld öffnen</a></div></div><div class='shot-map-btn'><a href='" + MAP + "' target='_blank' rel='noopener'>\uD83D\uDDFA\uFE0F Live-Karte öffnen · Hauptworld</a></div></div>";
  }
  function watch() {
    var frame = document.getElementById("alpenMapFrame");
    var fall = document.getElementById("alpenMapFallback");
    if (!frame || !fall) return;
    var done = false;
    function fail() {
      if (done) return;
      done = true;
      frame.style.display = "none";
      fall.classList.add("show");
    }
    frame.addEventListener("error", fail);
    setTimeout(function () {
      try {
        var doc = frame.contentDocument;
        if (doc && doc.location && doc.location.href === "about:blank") fail();
      } catch (e) {}
    }, 8000);
  }
  function addSection() {
    var existing = document.getElementById("map");
    if (existing) {
      existing.className = "alpen-map-sec";
      existing.setAttribute("aria-label", "AlpenSMP Live-Karte Hauptworld");
      existing.innerHTML = markup();
      watch();
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
    watch();
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
