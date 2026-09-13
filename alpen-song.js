/* Offizieller AlpenSMP-Song – rechts im Hero */
(function () {
  if (window.__alpenSong) return;
  window.__alpenSong = true;
  var SONG = "https://suno.com/song/91e6d4da-6c75-473c-93ec-147b5bc7b411?sh=Weq5E6V68VNlnm3w";
  var EMBED = "https://suno.com/embed/91e6d4da-6c75-473c-93ec-147b5bc7b411";
  var COVER = "https://cdn2.suno.ai/image_91e6d4da-6c75-473c-93ec-147b5bc7b411.jpeg";
  function css() {
    return "#alpenSong{position:absolute;right:28px;top:50%;transform:translateY(-42%);width:min(320px,34vw);z-index:12;text-align:left;background:rgba(12,16,24,.78);border:1px solid rgba(255,255,255,.12);border-radius:18px;backdrop-filter:blur(16px);padding:14px;box-shadow:0 16px 40px rgba(0,0,0,.35)}#alpenSong .row{display:flex;gap:12px;align-items:center}#alpenSong img.cover{width:64px;height:64px;border-radius:14px;object-fit:cover;flex-shrink:0}#alpenSong .ttl{font-family:Outfit,Inter,sans-serif;font-weight:800;color:#fff}#alpenSong .by{color:#c5cbd6;font-size:.84rem;margin-top:2px}#alpenSong .acts{display:flex;flex-direction:column;gap:8px;margin-top:12px}#alpenSong .play,#alpenSong .open{display:flex;align-items:center;justify-content:center;min-height:42px;padding:8px 12px;border-radius:11px;font-weight:700;text-decoration:none;border:0;cursor:pointer}#alpenSong .play{color:#fff;background:linear-gradient(135deg,#b91c1c,#c73e3e)}#alpenSong .open{color:#fff;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);font-size:.88rem}#alpenSong .frame{display:none;margin-top:10px;height:170px;border-radius:12px;overflow:hidden;background:#0b0f16}#alpenSong.open .frame{display:block}#alpenSong .frame iframe{width:100%;height:170px;border:0}#alpenSong.open img.cover{box-shadow:0 0 0 2px rgba(199,62,62,.45)}@media(max-width:1100px){#alpenSong{position:relative;right:auto;top:auto;transform:none;width:min(360px,92%);margin:18px auto 0}}@media(max-width:640px){#alpenSong{width:100%}}";
  }
  function inject() {
    if (document.getElementById("alpenSong")) return;
    var hero = document.querySelector(".hero") || document.getElementById("home");
    if (!hero) return;
    if (getComputedStyle(hero).position === "static") hero.style.position = "relative";
    if (!document.getElementById("alpenSongCss")) {
      var s = document.createElement("style"); s.id = "alpenSongCss"; s.textContent = css(); document.head.appendChild(s);
    }
    var box = document.createElement("div");
    box.id = "alpenSong";
    box.innerHTML = "<div class='row'><img class='cover' src='" + COVER + "' alt=''><div><div class='ttl'>\uD83C\uDFB5 Alpen SMP</div><div class='by'>by linghingdonkh</div></div></div><div class='acts'><button type='button' class='play' id='alpenSongPlay'>\u25B6 Abspielen</button><a class='open' href='" + SONG + "' target='_blank' rel='noopener'>Auf Suno öffnen</a></div><div class='frame' id='alpenSongFrame'></div>";
    hero.appendChild(box);
    document.getElementById("alpenSongPlay").onclick = function () {
      box.classList.add("open");
      var fr = document.getElementById("alpenSongFrame");
      if (fr && !fr.querySelector("iframe")) {
        fr.innerHTML = "<iframe title='Alpen SMP Song' src='" + EMBED + "' allow='autoplay; encrypted-media'></iframe>";
      }
      this.textContent = "Player aktiv";
    };
  }
  function boot() {
    var p = location.pathname || "/";
    if (p !== "/" && p !== "/index.html") return;
    inject();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 250);
})();
