/* AlpenSMP – AlpenKI kennt das Regelwerk. */
(function () {
  if (window.__alpenRulesHome) return;
  window.__alpenRulesHome = true;
  function loadScript(src, key) {
    if (document.querySelector("script[data-" + key + "]")) return;
    var s = document.createElement("script");
    s.src = src;
    s.setAttribute("data-" + key, "1");
    document.body.appendChild(s);
  }
  function addGuideLink() {
    if (document.getElementById("navGuideLinkHtml")) return;
    function addAfter(sel, make) {
      var a = document.querySelector(sel);
      if (!a) return;
      var host = a.closest("li") || a;
      if (!host.parentNode) return;
      if (host.parentNode.querySelector("[href*='/guide']")) return;
      var node = make();
      if (host.nextSibling) host.parentNode.insertBefore(node, host.nextSibling);
      else host.parentNode.appendChild(node);
    }
    addAfter("#navRulesLinkHtml, a.nav-regeln", function () {
      var li = document.createElement("li"); var a = document.createElement("a");
      a.href = "https://alpensmp.net/guide/"; a.className = "nav-regeln"; a.id = "navGuideLinkHtml"; a.textContent = "Spieler-Guide";
      li.appendChild(a); return li;
    });
  }
  function wrapAI() {
    if (typeof window.aiReply !== "function" || window.aiReply.__alpenRules) return;
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
    addGuideLink();
    wrapAI();
    loadScript("admin-call.js?v=20260907a", "alpen-admin-call");
    loadScript("https://alpensmp.net/version-badge.js?v=13", "alpen-version");
    loadScript("https://alpensmp.net/site-quality.js?v=13", "alpen-quality");
    if (typeof window.alpenLoadRules === "function") window.alpenLoadRules(function () { wrapAI(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 400);
})();
