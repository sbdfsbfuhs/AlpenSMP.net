/* AlpenSMP BlueMap Embed */
(function () {
  if (window.__alpenBlueMap) return;
  window.__alpenBlueMap = true;
  var HTTP_MAP = "http://eu9-o.falixserver.net:26040/#hauptworld:-1792:102:500:132:0:0:0:0:perspective";
  function savedHttps() {
    try { return (localStorage.getItem("alpensmp_bluemap_https") || "").trim(); } catch (e) { return ""; }
  }
  function mapSrc() {
    var u = (window.ALPENSMP_BLUEMAP_HTTPS || savedHttps() || "").trim();
    if (u && /^https:\/\//i.test(u)) {
      if (u.indexOf("#") < 0) u += "#hauptworld:-1792:102:500:132:0:0:0:0:perspective";
      return u;
    }
    return HTTP_MAP;
  }
  function isHttpsPage() { return location.protocol === "https:"; }
  function canEmbedDirectly() {
    var src = mapSrc();
    if (src.indexOf("https://") === 0) return true;
    return !isHttpsPage();
  }
  function injectCss() {
    if (document.getElementById("alpenMapCss")) return;
    var s = document.createElement("style");
    s.id = "alpenMapCss";
    s.textContent = "#map.alpen-map-sec{padding:70px 24px 90px}#map .alpen-map-frame{position:relative;border:1px solid rgba(255,255,255,.08);border-radius:20px;overflow:hidden;background:#0b0f16;min-height:min(78vh,820px)}#map .alpen-map-frame iframe{width:100%;height:min(78vh,820px);min-height:420px;border:0;display:block}#map .alpen-map-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start;justify-content:space-between;margin:0 0 16px}#map .alpen-map-note{color:#c5cbd6;max-width:740px}#map .map-setup{padding:28px;color:#c5cbd6}#map .map-setup ol{margin:12px 0 16px 20px}#map .map-setup input{width:min(100%,520px);min-height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:#12161e;color:#fff;padding:0 12px;margin:8px 8px 8px 0}";
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
      if (live && live.parentNode) live.parentNode.insertAdjacentElement("afterend", li);
      else links.appendChild(li);
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
  function frameHtml() {
    var src = mapSrc();
    if (canEmbedDirectly()) {
      return "<iframe title='AlpenSMP BlueMap' src='" + src.replace(/\"/g, "") + "' allowfullscreen loading='eager'></iframe>";
    }
    return "<div class='map-setup'><p><strong>Die Karte braucht HTTPS, sonst bleibt der Bereich schwarz.</strong></p><p>BlueMap läuft aktuell nur unter HTTP. Der Browser blockiert das in der HTTPS-Website.</p><p>Saubere Lösung (Falix Reverse Proxy, 2 Minuten):</p><ol><li>Falix Panel → Server → <strong>Network</strong> → <strong>Reverse Proxy</strong> → Create Proxy</li><li>Subdomain z. B. <code>alpensmp-map</code> → ergibt <code>https://alpensmp-map.falix.org</code></li><li>Backend-Port: <strong>26040</strong></li><li>Warten bis SSL aktiv ist, URL unten einfügen</li></ol><input id='bluemapHttpsInput' placeholder='https://alpensmp-map.falix.org' value='" + (savedHttps() || "") + "'><button class='btn btn-primary' type='button' id='bluemapHttpsSave'>HTTPS-Karte laden</button> <a class='btn btn-secondary' href='" + HTTP_MAP + "' target='_blank' rel='noopener'>Vorher in neuem Tab öffnen</a><p style='margin-top:12px'>Vollseite: <a href='https://alpensmp.net/map/'>alpensmp.net/map/</a></p></div>";
  }
  function bindSave() {
    var btn = document.getElementById("bluemapHttpsSave");
    var inp = document.getElementById("bluemapHttpsInput");
    if (!btn || !inp) return;
    btn.onclick = function () {
      var v = (inp.value || "").trim();
      if (!/^https:\/\//i.test(v)) { alert("Bitte eine https:// URL eintragen."); return; }
      try { localStorage.setItem("alpensmp_bluemap_https", v); } catch (e) {}
      window.ALPENSMP_BLUEMAP_HTTPS = v;
      var box = document.querySelector("#map .alpen-map-frame");
      if (box) box.innerHTML = "<iframe title='AlpenSMP BlueMap' src='" + v.replace(/\"/g, "") + (v.indexOf("#") < 0 ? "#hauptworld:-1792:102:500:132:0:0:0:0:perspective" : "") + "' allowfullscreen></iframe>";
    };
  }
  function addSection() {
    if (document.getElementById("map")) {
      var box = document.querySelector("#map .alpen-map-frame");
      if (box && !box.querySelector("iframe") && canEmbedDirectly()) box.innerHTML = frameHtml();
      bindSave();
      return;
    }
    var after = document.getElementById("live") || document.querySelector(".live-wrap") || document.getElementById("about");
    if (!after) return;
    var sec = document.createElement("section");
    sec.id = "map"; sec.className = "alpen-map-sec"; sec.setAttribute("aria-labelledby", "map-title");
    sec.innerHTML = "<div class='container'><p class='slabel'>Live-Karte</p><h2 class='stitle' id='map-title'>AlpenSMP Weltkarte</h2><div class='alpen-map-bar'><p class='alpen-map-note'>BlueMap der Hauptwelt. Zoom, Verschieben und Weltenwechsel funktionieren in der eingebetteten Karte, sobald sie über HTTPS läuft.</p></div><div class='alpen-map-frame'>" + frameHtml() + "</div></div>";
    after.insertAdjacentElement("afterend", sec);
    bindSave();
  }
  function fromFirebase() {
    try {
      if (!window.firebase || !firebase.database) return;
      firebase.database().ref("site_settings/bluemapHttps").once("value", function (snap) {
        var v = snap.val();
        if (v && String(v).indexOf("https://") === 0) {
          window.ALPENSMP_BLUEMAP_HTTPS = String(v);
          try { localStorage.setItem("alpensmp_bluemap_https", String(v)); } catch (e) {}
          addSection();
        }
      });
    } catch (e) {}
  }
  function boot() {
    var p = location.pathname || "/";
    if (p !== "/" && p !== "/index.html") return;
    injectCss(); addNav(); addSection(); fromFirebase();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 400);
})();
