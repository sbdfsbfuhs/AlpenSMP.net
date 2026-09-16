/* Nur Community-Bereich: stärkere Buttons + Animation */
(function () {
  if (window.__alpenCommunityPolish) return;
  window.__alpenCommunityPolish = true;
  function boot() {
    var p = location.pathname || "/";
    if (p !== "/" && p !== "/index.html") return;
    var root = document.getElementById("community");
    if (!root) return;
    if (!document.getElementById("alpenCommCss")) {
      var s = document.createElement("style");
      s.id = "alpenCommCss";
      s.textContent = "#community .cta-box{position:relative;overflow:hidden;border:1px solid rgba(199,62,62,.22);box-shadow:0 18px 50px rgba(0,0,0,.28),0 0 0 1px rgba(255,255,255,.04) inset}#community .cta-box::before{content:'';position:absolute;inset:-40% auto auto -20%;width:280px;height:280px;background:radial-gradient(circle,rgba(199,62,62,.22),transparent 70%);pointer-events:none;animation:alpenCommGlow 6s ease-in-out infinite}#community .community-btns .btn{min-height:52px;padding:14px 26px;font-weight:800;letter-spacing:.01em;transition:transform .25s ease,box-shadow .25s ease}#community .community-btns .btn:hover{transform:translateY(-3px)}#community .btn-discord{box-shadow:0 10px 28px rgba(88,101,242,.35)}#community .btn-tiktok{background:#111;border:1px solid rgba(255,255,255,.16)!important;color:#fff!important}#community .btn-tiktok:hover{box-shadow:0 10px 28px rgba(255,255,255,.12)}#community .grid-3 .card{transition:transform .35s ease,border-color .35s ease,box-shadow .35s ease}#community .grid-3 .card:hover{transform:translateY(-8px);border-color:rgba(199,62,62,.4);box-shadow:0 18px 40px rgba(0,0,0,.35),0 0 24px rgba(199,62,62,.18)}#community .grid-3 .card .icon{transition:transform .35s ease}#community .grid-3 .card:hover .icon{transform:scale(1.12)}#community .card a.btn,#community .card .btn{min-height:44px;font-weight:700}#discordCardCount{animation:alpenCountPulse 2.8s ease-in-out infinite}@keyframes alpenCommGlow{50%{transform:translate(40%,20%)}}@keyframes alpenCountPulse{50%{filter:drop-shadow(0 0 10px rgba(224,92,92,.45))}}";
      document.head.appendChild(s);
    }
    var tk = root.querySelector('a[href*="tiktok"]');
    if (tk) tk.classList.add("btn-tiktok");
    root.querySelectorAll(".grid-3 .card").forEach(function (card, i) {
      card.style.transitionDelay = (i * 40) + "ms";
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 300);
})();
