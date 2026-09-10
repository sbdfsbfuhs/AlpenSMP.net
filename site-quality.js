/* AlpenSMP Qualität: Vollpower, Kontrast, KI-Kontext */
(function () {
  if (window.__alpenQuality) return;
  window.__alpenQuality = true;
  try { localStorage.setItem("alpensmp_mode", "full"); } catch (e) {}
  document.body.classList.remove("mode-lite");
  document.body.classList.add("mode-full");
  var modal = document.getElementById("perfModal"); if (modal) modal.style.display = "none";
  var tog = document.getElementById("modeToggle"); if (tog) tog.style.display = "none";
  var css = document.createElement("style");
  css.textContent = ".btn,.btn-primary,.btn-p,.nav-cta{min-height:44px;font-weight:700}.btn-secondary,.btn-s{background:rgba(255,255,255,.08)!important;border:1px solid rgba(255,255,255,.16)!important;color:#fff!important}.pick-card,.review-card{cursor:pointer}.pick-card:hover,.review-card:hover{transform:translateY(-2px);border-color:rgba(229,57,53,.45)}.desc,.meta,.lead{color:#c5cbd6!important}#perfModal,#modeToggle{display:none!important}";
  document.head.appendChild(css);
  if (!document.querySelector("script[data-alpen-chrome]")) {
    var c = document.createElement("script"); c.src = "https://alpensmp.net/alpen-chrome.js?v=13"; c.setAttribute("data-alpen-chrome", "1"); document.body.appendChild(c);
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
      var query = String(q || "").toLowerCase();
      if (typeof window.alpenRulesAnswer === "function") {
        var rule = window.alpenRulesAnswer(q, window.ALPEN_RULES_PUBLIC || window.ALPEN_RULES_LIVE);
        if (rule) return rule;
      }
      if (/join|beitreten|ip|bedrock|java/.test(query)) return "Java: alpensmp.falixsrv.me · Bedrock: dieselbe Adresse, Port 27491. Empfohlen: Minecraft 1.21.11. Guide: https://alpensmp.net/guide/";
      if (/voice|sprach/.test(query)) return "Simple Voice Chat ist optional und nähebasiert. Ohne Mod kannst du trotzdem joinen. Guide: https://alpensmp.net/guide/";
      if (/claim|grief/.test(query)) return "Builds werden mit GriefPrevention geschützt. Claim-Schritte stehen als Platzhalter im Guide. Regeln: https://alpensmp.net/regeln/";
      if (/command|befehl|spawn|tpa|home/.test(query)) return "Bestätigte Befehle: /spawn, /sethome, /home, /homes, /tpa, /back, /rtp, /msg und /call admin plus Grund.";
      if (/regel/.test(query)) return "Das offizielle Regelwerk: https://alpensmp.net/regeln/";
      var hit = orig(q);
      if (hit) return hit;
      return "Dazu habe ich aktuell keine bestätigte Information. Schau in den Guide oder die Regeln, oder frag das Team.";
    };
    window.aiReply.__alpenSmart = true;
  }
  setTimeout(reviewsLink, 700);
  setTimeout(smarterAI, 500);
  setTimeout(smarterAI, 1600);
})();
