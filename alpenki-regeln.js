/* AlpenSMP – AlpenKI kennt das Regelwerk. Keine zweiten Regeln-Buttons. */
(function () {
  if (window.__alpenRulesHome) return;
  window.__alpenRulesHome = true;

  function injectCss() {
    if (document.getElementById("alpenRulesHomeCss")) return;
    var s = document.createElement("style");
    s.id = "alpenRulesHomeCss";
    s.textContent = [
      ".nav-links{flex-wrap:nowrap}",
      ".nav-links a{white-space:nowrap;flex-shrink:0}",
      ".nav-regeln,.btn-regeln{font-weight:700!important;white-space:nowrap!important}",
      ".nav-regeln{color:#fff!important;background:rgba(199,62,62,.18)!important;border:1px solid rgba(229,57,53,.4);border-radius:10px;padding:8px 16px!important}",
      ".nav-regeln::after{display:none!important}",
      ".nav-regeln:hover{background:rgba(199,62,62,.28)!important;color:#fff!important}",
      ".btn-regeln{background:rgba(199,62,62,.14)!important;border:1px solid rgba(229,57,53,.45)!important;color:#fff!important}",
      "@media(max-width:1100px){.nav-links{display:none!important}.hamburger{display:flex!important}}"
    ].join("");
    document.head.appendChild(s);
  }

  function removeDuplicates() {
    ["navRulesLink", "heroRulesBtn", "mobileRulesLink"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var node = el.closest("li") || el;
      if (node.parentNode) node.parentNode.removeChild(node);
    });
    function dedupe(rootSel) {
      var root = document.querySelector(rootSel);
      if (!root) return;
      var seen = false;
      Array.prototype.slice.call(root.querySelectorAll("a")).forEach(function (a) {
        var href = a.getAttribute("href") || "";
        if (href.indexOf("/regeln") === -1 && href.indexOf("regeln/") === -1) return;
        if (seen) {
          var n = a.closest("li") || a;
          if (n.parentNode) n.parentNode.removeChild(n);
        } else {
          seen = true;
          a.style.whiteSpace = "nowrap";
        }
      });
    }
    dedupe(".nav-links");
    dedupe(".hero-btns");
    dedupe("#mobileMenu");
  }

  function wrapAI() {
    if (typeof window.aiReply !== "function") return;
    if (window.aiReply.__alpenRules) return;
    var orig = window.aiReply;
    window.aiReply = function (q) {
      if (typeof window.alpenRulesAnswer === "function") {
        var hit = window.alpenRulesAnswer(q, window.ALPEN_RULES_PUBLIC || window.ALPEN_RULES_LIVE);
        if (hit) return hit;
      }
      return orig(q);
    };
    window.aiReply.__alpenRules = true;
  }

  function boot() {
    injectCss();
    removeDuplicates();
    wrapAI();
    if (typeof window.alpenLoadRules === "function") window.alpenLoadRules(function () { wrapAI(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 400);
})();
