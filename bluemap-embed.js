/* Startseite: Karten-iframe durch wechselnde Rezensionsbilder ersetzen */
(function () {
  if (window.__alpenShotSlider) return;
  window.__alpenShotSlider = true;
  window.__alpenBlueMap = true;
  function injectCss() {
    var css = "#map.alpen-map-sec{padding:70px 24px 80px}#map .shot-frame{position:relative;border:1px solid rgba(255,255,255,.08);border-radius:20px;overflow:hidden;background:#0b0f16;min-height:460px;height:min(70vh,740px)}#map .shot-frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .85s ease}#map .shot-frame img.on{opacity:1}#map .shot-dots{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px}#map .shot-dots button{width:9px;height:9px;border-radius:50%;border:0;background:rgba(255,255,255,.28);cursor:pointer;padding:0}#map .shot-dots button.on{background:#c73e3e}#map iframe,#map .alpen-map-frame,#map .map-setup,#map .map-button-group{display:none!important}";
    var el = document.getElementById("alpenMapCss");
    if (!el) { el = document.createElement("style"); el.id = "alpenMapCss"; document.head.appendChild(el); }
    el.textContent = css;
  }
  function markup() {
    return "<div class='container'><p class='slabel'>Community</p><h2 class='stitle'>Eure Shots</h2><div class='shot-frame' id='shotFrame'></div><div class='shot-dots' id='shotDots'></div></div>";
  }
  function addSection() {
    var existing = document.getElementById("map");
    if (existing) { existing.className = "alpen-map-sec"; existing.innerHTML = markup(); return; }
    var after = document.getElementById("live") || document.querySelector(".live-wrap") || document.getElementById("about");
    if (!after) return;
    var sec = document.createElement("section");
    sec.id = "map"; sec.className = "alpen-map-sec"; sec.setAttribute("aria-label", "Community-Bilder");
    sec.innerHTML = markup();
    after.insertAdjacentElement("afterend", sec);
  }
  function unique(list) {
    var seen = {}; var out = [];
    list.forEach(function (u) { if (u && !seen[u]) { seen[u] = 1; out.push(u); } });
    return out;
  }
  function start(urls) {
    var frame = document.getElementById("shotFrame");
    var dots = document.getElementById("shotDots");
    if (!frame) return;
    if (!urls.length) {
      frame.innerHTML = "<p style='padding:48px 24px;color:#c5cbd6;text-align:center'>Noch keine freigegebenen Bilder aus den Rezensionen.</p>";
      return;
    }
    frame.innerHTML = urls.map(function (u, idx) {
      return "<img src='" + String(u).replace(/'/g, "%27") + "' alt='' class='" + (idx === 0 ? "on" : "") + "'>";
    }).join("");
    if (dots) {
      dots.innerHTML = urls.map(function (_, idx) {
        return "<button type='button' class='" + (idx === 0 ? "on" : "") + "' data-i='" + idx + "' aria-label='Bild'></button>";
      }).join("");
    }
    var i = 0;
    function show(n) {
      i = (n + urls.length) % urls.length;
      frame.querySelectorAll("img").forEach(function (el, idx) { el.classList.toggle("on", idx === i); });
      if (dots) dots.querySelectorAll("button").forEach(function (el, idx) { el.classList.toggle("on", idx === i); });
    }
    if (dots) {
      dots.querySelectorAll("button").forEach(function (b) {
        b.onclick = function () { show(Number(b.getAttribute("data-i"))); };
      });
    }
    if (urls.length > 1 && !window.__alpenShotTimer) {
      window.__alpenShotTimer = setInterval(function () { show(i + 1); }, 4500);
    }
  }
  function load() {
    var urls = [];
    try { if (window._galleryImages && window._galleryImages.length) urls = urls.concat(window._galleryImages); } catch (e) {}
    function take(data) {
      Object.keys(data || {}).forEach(function (k) {
        var r = data[k] || {};
        if (r.status && r.status !== "approved") return;
        var u = r.imageUrl || r.image || r.img;
        if (u) urls.push(String(u));
      });
      start(unique(urls));
    }
    try {
      if (window.firebase && firebase.database) {
        firebase.database().ref("community_reviews").limitToLast(40).once("value", function (snap) { take(snap.val() || {}); });
        return;
      }
    } catch (e) {}
    start(unique(urls));
  }
  function boot() {
    var p = location.pathname || "/";
    if (p !== "/" && p !== "/index.html") return;
    injectCss();
    addSection();
    var a = document.getElementById("navMapLink"); if (a) a.textContent = "Shots";
    var m = document.getElementById("mobileMapLink"); if (m) m.textContent = "Shots";
    load();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 400);
})();
