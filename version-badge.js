/* Version nur im Footer, keine fixed Badges */
(function () {
  if (window.__alpenVersionBadge) return;
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
  function intoFooter() {
    var f = document.querySelector("footer, .alpen-foot, .footer-bottom");
    if (!f) return;
    if (f.querySelector(".alpen-ver-foot")) return;
    var row = document.createElement("div");
    row.className = "alpen-ver-foot";
    row.style.cssText = "display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-top:10px;font-size:12px;color:#9aa3b2";
    row.innerHTML = "<span>© " + new Date().getFullYear() + " AlpenSMP</span><span>" + label + "</span>";
    f.appendChild(row);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", intoFooter);
  else intoFooter();
  setTimeout(intoFooter, 400);
  setTimeout(intoFooter, 1200);
  if (!document.querySelector("script[data-alpen-chrome]")) {
    var s = document.createElement("script");
    s.src = "https://alpensmp.net/alpen-chrome.js?v=15";
    s.setAttribute("data-alpen-chrome", "1");
    document.body.appendChild(s);
  }
  if (!document.querySelector("script[data-alpen-ki-widget]") && p.indexOf("/team") === -1) {
    var k = document.createElement("script");
    k.src = "https://alpensmp.net/alpen-ki-widget.js?v=15";
    k.setAttribute("data-alpen-ki-widget", "1");
    document.body.appendChild(k);
  }
})();
