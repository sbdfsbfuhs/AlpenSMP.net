/* AlpenSMP BlueMap – nur ergänzen, nichts entfernen */
(function () {
  if (window.__alpenBlueMap) return;
  window.__alpenBlueMap = true;
  var MAP_SRC = "http://eu9-o.falixserver.net:26040/#hauptworld:-1792:102:500:132:0:0:0:0:perspective";
  var MAP_OPEN = "http://eu9-o.falixserver.net:26040/#hauptworld:-1792:102:500:132:0:0:0:0:perspective";
  function injectCss() {
    if (document.getElementById("alpenMapCss")) return;
    var s = document.createElement("style");
    s.id = "alpenMapCss";
    s.textContent = "#map.alpen-map-sec{padding:70px 24px 90px;position:relative}#map .alpen-map-frame{position:relative;border:1px solid rgba(255,255,255,.08);border-radius:20px;overflow:hidden;background:rgba(18,22,30,.7);box-shadow:0 18px 50px rgba(0,0,0,.35)}#map .alpen-map-frame iframe{width:100%;height:min(78vh,820px);min-height:420px;border:0;display:block;background:#0b0f16}#map .alpen-map-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin:0 0 16px}#map .alpen-map-note{color:#c5cbd6;font-size:.95rem;max-width:720px}@media(max-width:700px){#map .alpen-map-frame iframe{min-height:360px;height:70vh}}";
    document.head.appendChild(s);
  }
  function addNav() {
    var links = document.querySelector(".nav-links");
    if (links && !document.getElementById("navMapLink")) {
      var live = links.querySelector('a[href="#live"]');
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.id = "navMapLink"; a.href = "#map"; a.setAttribute("data-sec", "map"); a.textContent = "Karte";
      li.appendChild(a);
      if (live && live.parentNode && live.parentNode.parentNode === links) {
        live.parentNode.insertAdjacentElement("afterend", li);
      } else {
        links.appendChild(li);
      }
    }
    var mob = document.getElementById("mobileMenu");
    if (mob && !document.getElementById("mobileMapLink")) {
      var ma = document.createElement("a");
      ma.id = "mobileMapLink"; ma.href = "#map"; ma.textContent = "Karte";
      var liveM = mob.querySelector('a[href="#live"]');
      if (liveM && liveM.nextSibling) mob.insertBefore(ma, liveM.nextSibling);
      else mob.appendChild(ma);
    }
  }
  function addSection() {
    if (document.getElementById("map")) return;
    var after = document.getElementById("live") || document.querySelector(".live-wrap") || document.getElementById("about");
    if (!after || !after.parentNode) return;
    var sec = document.createElement("section");
    sec.id = "map";
    sec.className = "alpen-map-sec";
    sec.setAttribute("aria-labelledby", "map-title");
    sec.innerHTML = "<div class='container'><p class='slabel'>Live-Karte</p><h2 class='stitle' id='map-title'>AlpenSMP Weltkarte</h2><div class='alpen-map-bar'><p class='alpen-map-note'>Die BlueMap der Hauptwelt – zoomen und verschieben direkt hier. Falls der Browser die Karte blockiert (HTTP in HTTPS), öffne sie in einem neuen Tab.</p><a class='btn btn-primary' href='" + MAP_OPEN + "' target='_blank' rel='noopener'>Karte in neuem Tab</a></div><div class='alpen-map-frame'><iframe title='AlpenSMP BlueMap' src='" + MAP_SRC + "' loading='lazy' referrerpolicy='no-referrer-when-downgrade' allowfullscreen></iframe></div></div>";
    if (after.id === "live" || after.classList.contains("live-wrap")) {
      after.insertAdjacentElement("afterend", sec);
    } else {
      after.parentNode.insertBefore(sec, after);
    }
  }
  function boot() {
    if ((location.pathname || "/") !== "/" && location.pathname !== "/index.html") return;
    injectCss();
    addNav();
    addSection();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 300);
})();
