/* Status: Java-Port 27491, gleiche DB-Schreibung wie bisher */
(function () {
  if (window.__alpenStatusFix) return;
  window.__alpenStatusFix = true;
  function host() {
    var ip = (window.CONFIG && CONFIG.serverIp) || "alpensmp.falixsrv.me";
    var port = (window.CONFIG && CONFIG.bedrockPort) || "27491";
    if (String(ip).indexOf(":") === -1) ip = ip + ":" + port;
    return ip;
  }
  function patch() {
    if (typeof window.fetchStatus !== "function") return false;
    window.fetchStatus = async function () {
      try {
        var ctrl = new AbortController();
        var timeout = setTimeout(function () { ctrl.abort(); }, 8000);
        var res = await fetch("https://api.mcsrvstat.us/3/" + host(), { signal: ctrl.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error("API-Fehler: " + res.status);
        var data = await res.json();
        window.lastGood = { data: data, ts: Date.now() };
        if (typeof failSince !== "undefined") failSince = null;
        if (typeof applyOnline === "function") applyOnline(data);
      } catch (err) {
        if (typeof applyProblem === "function") applyProblem();
      }
    };
    window.fetchStatus();
    return true;
  }
  function boot() {
    var p = location.pathname || "/";
    if (p !== "/" && p !== "/index.html") return;
    if (patch()) return;
    setTimeout(patch, 400);
    setTimeout(patch, 1200);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
