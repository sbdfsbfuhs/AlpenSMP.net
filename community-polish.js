/* Community: keine Doppelkarten, Discord + TikTok + Shots */
(function () {
  if (window.__alpenCommunityPolish) return;
  window.__alpenCommunityPolish = true;
  var DISCORD = "https://discord.gg/FfR56Ddtj8";
  var TIKTOK = "https://www.tiktok.com/@alpensmp";
  function css() {
    return "#community .grid-3{display:none!important}#community .community-btns{display:none!important}#community .cta-box{border:1px solid rgba(199,62,62,.2);box-shadow:0 16px 44px rgba(0,0,0,.28)}#community .comm-stage{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:22px}#community .comm-panel{position:relative;overflow:hidden;min-height:240px;border-radius:20px;border:1px solid rgba(255,255,255,.08);padding:28px 24px;display:flex;flex-direction:column;justify-content:flex-end;text-decoration:none;color:#fff;background:#12161e;transition:transform .3s ease,border-color .3s ease,box-shadow .3s ease}#community .comm-panel:hover{transform:translateY(-6px);border-color:rgba(199,62,62,.4);box-shadow:0 18px 40px rgba(0,0,0,.35)}#community .comm-panel.discord{background:linear-gradient(160deg,rgba(88,101,242,.28),rgba(12,16,24,.92) 55%)}#community .comm-panel.tiktok{background:linear-gradient(160deg,rgba(199,62,62,.22),rgba(12,16,24,.92) 55%)}#community .comm-k{font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:#c5cbd6;font-weight:700}#community .comm-n{font-family:Outfit,Inter,sans-serif;font-size:2rem;font-weight:800;line-height:1.1;margin:6px 0}#community .comm-panel .go{margin-top:12px;align-self:flex-start;min-height:44px;padding:10px 16px;border-radius:12px;font-weight:800;background:linear-gradient(135deg,#b91c1c,#c73e3e)}#community .comm-panel.discord .go{background:#5865F2}#community .comm-film{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-top:14px}#community .comm-film a{display:block;height:92px;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.08)}#community .comm-film img{width:100%;height:100%;object-fit:cover;transition:transform .45s ease}#community .comm-film a:hover img{transform:scale(1.08)}@media(max-width:800px){#community .comm-stage{grid-template-columns:1fr}#community .comm-film{grid-template-columns:repeat(3,1fr)}#community .comm-film a{height:78px}}";
  }
  function paintFilm(urls) {
    var film = document.getElementById("commFilm");
    if (!film) return;
    var list = (urls || []).filter(Boolean).slice(0, 6);
    if (!list.length) { film.style.display = "none"; return; }
    film.innerHTML = list.map(function (u) {
      return "<a href='" + TIKTOK + "' target='_blank' rel='noopener'><img src='" + String(u).replace(/'/g, "%27") + "' alt=''></a>";
    }).join("");
  }
  function loadShots() {
    var urls = [];
    try { if (window._galleryImages && window._galleryImages.length) urls = urls.concat(window._galleryImages); } catch (e) {}
    function take(data) {
      Object.keys(data || {}).forEach(function (k) {
        var r = data[k] || {};
        if (r.status && r.status !== "approved") return;
        var u = r.imageUrl || r.image || r.img;
        if (u) urls.push(String(u));
      });
      var seen = {}; var out = [];
      urls.forEach(function (u) { if (!seen[u]) { seen[u] = 1; out.push(u); } });
      paintFilm(out);
    }
    try {
      if (window.firebase && firebase.database) {
        firebase.database().ref("community_reviews").limitToLast(20).once("value", function (snap) { take(snap.val() || {}); });
        return;
      }
    } catch (e) {}
    paintFilm(urls);
  }
  function boot() {
    var p = location.pathname || "/";
    if (p !== "/" && p !== "/index.html") return;
    var root = document.getElementById("community");
    if (!root || document.getElementById("commStage")) return;
    if (!document.getElementById("alpenCommCss")) {
      var s = document.createElement("style"); s.id = "alpenCommCss"; s.textContent = css(); document.head.appendChild(s);
    }
    var count = document.getElementById("discordCardCount");
    var n = count && count.textContent && count.textContent !== "—" ? count.textContent : "264";
    var box = document.createElement("div");
    box.id = "commStage";
    box.innerHTML = "<div class='comm-stage'><a class='comm-panel discord' href='" + DISCORD + "' target='_blank' rel='noopener'><span class='comm-k'>Discord</span><div class='comm-n'><span id='discordCardCount'>" + n + "</span></div><span style='color:#c5cbd6'>Mitglieder online im Server</span><span class='go'>Beitreten</span></a><a class='comm-panel tiktok' href='" + TIKTOK + "' target='_blank' rel='noopener'><span class='comm-k'>TikTok</span><div class='comm-n'>@alpensmp</div><span style='color:#c5cbd6'>Clips, Builds und Server-Momente</span><span class='go'>Kanal öffnen</span></a></div><div class='comm-film' id='commFilm'></div>";
    var cta = root.querySelector(".cta-box");
    if (cta && cta.parentNode) cta.parentNode.insertBefore(box, cta.nextSibling);
    else root.querySelector(".container").appendChild(box);
    loadShots();
    setTimeout(loadShots, 1200);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 400);
})();
