/* Live-Status: direkter Ping auf Port 27491, schreibt in bestehende History */
(function () {
  window.__alpenStatusFix2 = true;
  function pingUrl() {
    var ip = (window.CONFIG && CONFIG.serverIp) || "alpensmp.falixsrv.me";
    var port = (window.CONFIG && CONFIG.bedrockPort) || "27491";
    ip = String(ip).split(":")[0];
    return "https://api.minetools.eu/ping/" + encodeURIComponent(ip) + "/" + encodeURIComponent(port);
  }
  function toStatus(raw) {
    if (!raw || raw.error) return { online: false, players: { online: 0, max: 0 } };
    var pl = raw.players || {};
    var ver = raw.version && (raw.version.name || raw.version);
    return {
      online: true,
      players: { online: Number(pl.online) || 0, max: pl.max != null ? pl.max : "—" },
      version: ver || ""
    };
  }
  function patch() {
    if (typeof window.applyOnline !== "function") return false;
    window.fetchStatus = async function () {
      try {
        var ctrl = new AbortController();
        var timeout = setTimeout(function () { ctrl.abort(); }, 8000);
        var res = await fetch(pingUrl(), { signal: ctrl.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error("API-Fehler: " + res.status);
        var data = toStatus(await res.json());
        window.lastGood = { data: data, ts: Date.now() };
        if (typeof failSince !== "undefined") failSince = null;
        applyOnline(data);
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
    setTimeout(patch, 1400);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
