/* Community: Discord + TikTok, keine Bildleiste */
(function () {
  if (window.__alpenCommunityPolish2) return;
  window.__alpenCommunityPolish2 = true;
  var DISCORD = "https://discord.gg/FfR56Ddtj8";
  var TIKTOK = "https://www.tiktok.com/@alpensmp";
  function css() {
    return "#community .grid-3{display:none!important}#community .community-btns{display:none!important}#community .comm-film,#commFilm{display:none!important}#community .cta-box{border:1px solid rgba(199,62,62,.2);box-shadow:0 16px 44px rgba(0,0,0,.28)}#community .comm-stage{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:22px}#community .comm-panel{position:relative;overflow:hidden;min-height:220px;border-radius:20px;border:1px solid rgba(255,255,255,.08);padding:28px 24px;display:flex;flex-direction:column;justify-content:flex-end;text-decoration:none;color:#fff;background:#12161e;transition:transform .3s ease,border-color .3s ease,box-shadow .3s ease}#community .comm-panel:hover{transform:translateY(-6px);border-color:rgba(199,62,62,.4);box-shadow:0 18px 40px rgba(0,0,0,.35)}#community .comm-panel.discord{background:linear-gradient(160deg,rgba(88,101,242,.28),rgba(12,16,24,.92) 55%)}#community .comm-panel.tiktok{background:linear-gradient(160deg,rgba(199,62,62,.22),rgba(12,16,24,.92) 55%)}#community .comm-k{font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:#c5cbd6;font-weight:700}#community .comm-n{font-family:Outfit,Inter,sans-serif;font-size:2rem;font-weight:800;line-height:1.1;margin:6px 0}#community .comm-panel .go{margin-top:12px;align-self:flex-start;min-height:44px;padding:10px 16px;border-radius:12px;font-weight:800;background:linear-gradient(135deg,#b91c1c,#c73e3e)}#community .comm-panel.discord .go{background:#5865F2}@media(max-width:800px){#community .comm-stage{grid-template-columns:1fr}}";
  }
  function markup(n) {
    return "<div class='comm-stage'><a class='comm-panel discord' href='" + DISCORD + "' target='_blank' rel='noopener'><span class='comm-k'>Discord</span><div class='comm-n'><span id='discordCardCount'>" + n + "</span></div><span style='color:#c5cbd6'>Mitglieder auf Discord</span><span class='go'>Beitreten</span></a><a class='comm-panel tiktok' href='" + TIKTOK + "' target='_blank' rel='noopener'><span class='comm-k'>TikTok</span><div class='comm-n'>@alpensmp</div><span style='color:#c5cbd6'>Clips folgen – Builds und Server-Momente</span><span class='go'>Kanal öffnen</span></a></div>";
  }
  function boot() {
    var p = location.pathname || "/";
    if (p !== "/" && p !== "/index.html") return;
    var root = document.getElementById("community");
    if (!root) return;
    if (!document.getElementById("alpenCommCss")) {
      var s = document.createElement("style"); s.id = "alpenCommCss"; s.textContent = css(); document.head.appendChild(s);
    } else {
      document.getElementById("alpenCommCss").textContent = css();
    }
    var count = document.getElementById("discordCardCount");
    var n = count && count.textContent && count.textContent !== "\u2014" ? count.textContent : "263";
    var box = document.getElementById("commStage");
    if (!box) {
      box = document.createElement("div");
      box.id = "commStage";
      var cta = root.querySelector(".cta-box");
      if (cta && cta.parentNode) cta.parentNode.insertBefore(box, cta.nextSibling);
      else root.querySelector(".container").appendChild(box);
    }
    box.innerHTML = markup(n);
    var film = document.getElementById("commFilm");
    if (film && film.parentNode) film.parentNode.removeChild(film);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 400);
})();
