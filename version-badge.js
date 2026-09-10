/* AlpenSMP Versionszeile unten links */
(function () {
  if (window.__alpenVersionBadge) return;
  window.__alpenVersionBadge = true;
  var p = (location.pathname || "/").toLowerCase();
  var label = "Website 1.0";
  if (p.indexOf("/team") === 0 || p.indexOf("/team/") !== -1) label = "Team 1.2";
  else if (p.indexOf("/guide") === 0) label = "Guide 0.5";
  else if (p.indexOf("/regeln") === 0) label = "Website 1.0";
  function paint() {
    var d = document.getElementById("alpenVer");
    if (!d) {
      d = document.createElement("div");
      d.id = "alpenVer";
      d.style.cssText = "position:fixed;left:12px;bottom:12px;z-index:99999;background:#0c1018;border:1px solid rgba(199,62,62,.5);color:#fda4af;padding:6px 10px;border-radius:10px;font-size:12px;pointer-events:none";
      document.body.appendChild(d);
    }
    d.textContent = label;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paint);
  else paint();
  setTimeout(paint, 400);
})();
