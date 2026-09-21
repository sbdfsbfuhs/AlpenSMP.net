/* Version nur im Footer, kein zweites Copyright */
(function () {
  if (window.__alpenVersionBadge19) return;
  window.__alpenVersionBadge19 = true;
  window.__alpenVersionBadge = true;
  var p = (location.pathname || "/").toLowerCase();
  var label = "Website 1.3";
  if (p.indexOf("/team") !== -1) label = "Team 1.3";
  else if (p.indexOf("/guide") !== -1) label = "Guide 0.7";
  else if (p.indexOf("/regeln") !== -1) label = "Regeln 1.0";
  else if (p.indexOf("/reviews") !== -1) label = "Reviews 1.0";
  window.__alpenVersionLabel = label;
  var old = document.getElementById("alpenVer");
  if (old && old.parentNode) old.parentNode.removeChild(old);
  if (!document.getElementById("alpenFootFixCss")) {
    var st = document.createElement("style");
    st.id = "alpenFootFixCss";
    st.textContent = ".footer-bottom{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;justify-content:space-between;padding-bottom:18px}.footer-team-link{opacity:1!important;font-size:.94rem!important;color:inherit}.footer-team-link::before{content:'\uD83D\uDEE1\uFE0F ';font-size:1.05em}.alpen-ver-foot{width:100%;margin-top:4px;font-size:12px;color:#9aa3b2;text-align:right}footer{padding-bottom:72px}@media(max-width:700px){.footer-bottom{flex-direction:column;align-items:flex-start}#toTop,.to-top,[class*='totop'],[class*='to-top']{bottom:88px!important}#alpenKiFab,.alpen-ki-fab,[id*='alpenKi']{bottom:22px!important}}";
    document.head.appendChild(st);
  }
  function intoFooter() {
    var bottom = document.querySelector(".footer-bottom");
    var f = bottom || document.querySelector("footer, .alpen-foot");
    if (!f) return;
    if (f.querySelector(".alpen-ver-foot")) return;
    var row = document.createElement("div");
    row.className = "alpen-ver-foot";
    row.textContent = label;
    f.appendChild(row);
    var team = document.querySelector(".footer-team-link");
    if (team && team.textContent.indexOf("Staff") !== -1 && team.textContent.indexOf("\uD83D\uDEE1") === -1) {
      team.textContent = "Staff";
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", intoFooter);
  else intoFooter();
  setTimeout(intoFooter, 400);
  setTimeout(intoFooter, 1200);
  if (!document.querySelector("script[data-alpen-chrome]")) {
    var s = document.createElement("script");
    s.src = "https://alpensmp.net/alpen-chrome.js?v=16";
    s.setAttribute("data-alpen-chrome", "1");
    document.body.appendChild(s);
  }
  if (!document.querySelector("script[data-alpen-ki-widget]") && p.indexOf("/team") === -1) {
    var k = document.createElement("script");
    k.src = "https://alpensmp.net/alpen-ki-widget.js?v=15";
    k.setAttribute("data-alpen-ki-widget", "1");
    document.body.appendChild(k);
  }
  if ((p === "/" || p === "/index.html" || p === "") && !document.querySelector("script[data-alpen-status-fix-4]")) {
    var stf = document.createElement("script");
    stf.src = "https://alpensmp.net/status-fix.js?v=4";
    stf.setAttribute("data-alpen-status-fix-4", "1");
    document.body.appendChild(stf);
  }
})();
