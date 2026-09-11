/* AlpenSMP Qualität: Vollpower, Kontrast, keine fixed Version */
(function () {
  if (window.__alpenQuality) return;
  window.__alpenQuality = true;
  try { localStorage.setItem("alpensmp_mode", "full"); } catch (e) {}
  document.body.classList.remove("mode-lite");
  document.body.classList.add("mode-full");
  var modal = document.getElementById("perfModal"); if (modal) modal.style.display = "none";
  var tog = document.getElementById("modeToggle"); if (tog) tog.style.display = "none";
  var css = document.createElement("style");
  css.textContent = ".btn,.btn-primary,.btn-p,.nav-cta{min-height:44px;font-weight:700}.btn-secondary,.btn-s{background:rgba(255,255,255,.08)!important;border:1px solid rgba(255,255,255,.16)!important;color:#fff!important}.pick-card,.review-card{cursor:pointer}.pick-card:hover,.review-card:hover{transform:translateY(-2px);border-color:rgba(229,57,53,.45)}.desc,.meta,.lead{color:#c5cbd6!important}#perfModal,#modeToggle,#alpenVer{display:none!important}";
  document.head.appendChild(css);
  var stale = document.getElementById("alpenVer"); if (stale && stale.parentNode) stale.parentNode.removeChild(stale);
  if (!document.querySelector("script[data-alpen-chrome]")) {
    var c = document.createElement("script"); c.src = "https://alpensmp.net/alpen-chrome.js?v=15"; c.setAttribute("data-alpen-chrome", "1"); document.body.appendChild(c);
  }
  function reviewsLink() {
    var box = document.getElementById("reviews") || document.querySelector("#stimmen, .reviews");
    if (!box || document.getElementById("allReviewsLink")) return;
    var a = document.createElement("a"); a.id = "allReviewsLink"; a.href = "https://alpensmp.net/reviews/"; a.className = "btn btn-secondary"; a.textContent = "Alle Rezensionen ansehen"; a.style.margin = "16px 0"; box.appendChild(a);
  }
  function smarterAI() {
    if (typeof window.aiReply !== "function" || window.aiReply.__alpenSmart) return;
    var orig = window.aiReply;
    window.aiReply = function (q) {
      if (typeof window.alpenRulesAnswer === "function") {
        var rule = window.alpenRulesAnswer(q, window.ALPEN_RULES_PUBLIC || window.ALPEN_RULES_LIVE);
        if (rule) return rule;
      }
      var query = String(q || "").toLowerCase();
      if (/join|beitreten|ip|bedrock|java/.test(query)) return "Java: alpensmp.falixsrv.me · Bedrock: Port 27491. Empfohlen 1.21.11.";
      if (/voice|sprach/.test(query)) return "Simple Voice Chat ist optional und nähebasiert.";
      if (/command|befehl|spawn|tpa|home/.test(query)) return "Bestätigte Befehle: /spawn, /sethome, /home, /homes, /tpa, /back, /rtp, /msg, /call admin.";
      if (/regel/.test(query)) return "Offizielles Regelwerk: https://alpensmp.net/regeln/";
      var hit = orig(q);
      return hit || "Dazu habe ich aktuell keine bestätigte Information.";
    };
    window.aiReply.__alpenSmart = true;
  }
  setTimeout(reviewsLink, 700);
  setTimeout(smarterAI, 500);
  setTimeout(smarterAI, 1600);
})();
