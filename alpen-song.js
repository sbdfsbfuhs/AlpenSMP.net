/* Offizieller AlpenSMP-Song im Hero – Suno Embed, kein Autoplay */
(function () {
  if (window.__alpenSong) return;
  window.__alpenSong = true;
  var SONG = "https://suno.com/song/91e6d4da-6c75-473c-93ec-147b5bc7b411?sh=Weq5E6V68VNlnm3w";
  var EMBED = "https://suno.com/embed/91e6d4da-6c75-473c-93ec-147b5bc7b411";
  var COVER = "https://cdn2.suno.ai/image_91e6d4da-6c75-473c-93ec-147b5bc7b411.jpeg";
  function css() {
    return "#alpenSong{max-width:420px;margin:18px auto 0;text-align:left;background:rgba(18,22,30,.72);border:1px solid rgba(255,255,255,.1);border-radius:16px;backdrop-filter:blur(14px);padding:12px 14px;box-shadow:0 12px 36px rgba(0,0,0,.28)}#alpenSong .row{display:flex;gap:12px;align-items:center}#alpenSong img.cover{width:56px;height:56px;border-radius:12px;object-fit:cover;flex-shrink:0}#alpenSong .meta{min-width:0;flex:1}#alpenSong .ttl{font-family:Outfit,Inter,sans-serif;font-weight:800;color:#fff;line-height:1.2}#alpenSong .by{color:#c5cbd6;font-size:.86rem}#alpenSong .acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}#alpenSong .play{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:8px 14px;border-radius:10px;border:0;cursor:pointer;font-weight:700;color:#fff;background:linear-gradient(135deg,#b91c1c,#c73e3e)}#alpenSong .open{display:inline-flex;align-items:center;min-height:40px;padding:8px 12px;border-radius:10px;text-decoration:none;color:#fff;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);font-weight:600;font-size:.86rem}#alpenSong .frame{display:none;margin-top:10px;border-radius:12px;overflow:hidden;height:80px}#alpenSong.open .frame{display:block}#alpenSong.open img.cover{box-shadow:0 0 0 2px rgba(199,62,62,.45);animation:alpenSongPulse 1.6s ease-in-out infinite}@keyframes alpenSongPulse{50%{box-shadow:0 0 0 4px rgba(199,62,62,.15)}}@media(max-width:640px){#alpenSong{max-width:100%;margin-left:0;margin-right:0}}";
  }
  function inject() {
    if (document.getElementById("alpenSong")) return;
    var host = document.querySelector(".hero-content") || document.querySelector(".hero") || document.getElementById("home");
    if (!host) return;
    if (!document.getElementById("alpenSongCss")) {
      var s = document.createElement("style"); s.id = "alpenSongCss"; s.textContent = css(); document.head.appendChild(s);
    }
    var box = document.createElement("div");
    box.id = "alpenSong";
    box.innerHTML = "<div class='row'><img class='cover' src='" + COVER + "' alt='Alpen SMP Song'><div class='meta'><div class='ttl'>\uD83C\uDFB5 Alpen SMP</div><div class='by'>by linghingdonkh · Suno</div></div></div><div class='acts'><button type='button' class='play' id='alpenSongPlay'>\u25B6 Abspielen</button><a class='open' href='" + SONG + "' target='_blank' rel='noopener'>AlpenSMP Song anhören</a></div><div class='frame'><iframe title='Alpen SMP Song' src='" + EMBED + "' width='100%' height='80' frameborder='0' allow='autoplay; encrypted-media' loading='lazy'></iframe></div>";
    var btns = host.querySelector(".hero-btns") || host.querySelector(".ip-box");
    if (btns && btns.parentNode === host) btns.insertAdjacentElement("afterend", box);
    else host.appendChild(box);
    document.getElementById("alpenSongPlay").onclick = function () {
      box.classList.add("open");
      this.textContent = "\u25B6 Player geöffnet";
    };
  }
  function boot() {
    var p = location.pathname || "/";
    if (p !== "/" && p !== "/index.html") return;
    inject();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 300);
})();
