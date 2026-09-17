(function () {
  if (document.querySelector("script[data-alpen-chrome]")) return;
  var s = document.createElement("script");
  s.src = "https://alpensmp.net/alpen-chrome.js?v=16";
  s.setAttribute("data-alpen-chrome", "1");
  document.body.appendChild(s);
  var v = document.createElement("script");
  v.src = "https://alpensmp.net/version-badge.js?v=16";
  document.body.appendChild(v);
})();
