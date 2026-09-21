/* Live-Status Port 27491 + Verlauf ohne Fake-Nullen */
(function () {
  window.__alpenStatusFix3 = true;
  function pingUrl() {
    var ip = (window.CONFIG && CONFIG.serverIp) || "alpensmp.falixsrv.me";
    var port = (window.CONFIG && CONFIG.bedrockPort) || "27491";
    ip = String(ip).split(":")[0];
    return "https://api.minetools.eu/ping/" + encodeURIComponent(ip) + "/" + encodeURIComponent(port);
  }
  function toStatus(raw) {
    if (!raw || raw.error) return null;
    var pl = raw.players || {};
    var ver = raw.version && (raw.version.name || raw.version);
    return {
      online: true,
      players: { online: Number(pl.online) || 0, max: pl.max != null ? pl.max : "\u2014" },
      version: ver || ""
    };
  }
  function cleanSeries(arr) {
    arr = (arr || []).slice().sort(function (a, b) { return a.t - b.t; });
    return arr.filter(function (p, i) {
      if (!p || !p.t) return false;
      if (Number(p.n) > 0) return true;
      var near = false;
      for (var j = 0; j < arr.length; j++) {
        if (j === i) continue;
        if (Number(arr[j].n) > 0 && Math.abs(arr[j].t - p.t) <= 20 * 60 * 1000) { near = true; break; }
      }
      return !near;
    });
  }
  function patchChart() {
    if (typeof window.drawChart !== "function" || window.drawChart.__alpenClean) return;
    var orig = window.drawChart;
    window.drawChart = function (arr) {
      return orig(cleanSeries(arr));
    };
    window.drawChart.__alpenClean = true;
  }
  function patchWrite() {
    window.writeRemoteHistory = function (n) {
      var db = typeof initFirebase === "function" ? initFirebase() : null;
      if (!db) return;
      var last = Number((typeof lsGet === "function" && lsGet("alpensmp_hist_push")) || 0);
      if (Date.now() - last < 60 * 1000) return;
      if (typeof lsSet === "function") lsSet("alpensmp_hist_push", String(Date.now()));
      db.ref("site_stats_history").push({
        t: Date.now(),
        n: Number(n) || 0,
        online_count: Number(n) || 0,
        total_players_ever: (window.CONFIG && CONFIG.totalJoined) || 0
      });
      db.ref("site_stats").update({ current_players: Number(n) || 0, updated_at: Date.now() });
    };
  }
  function patch() {
    if (typeof window.applyOnline !== "function") return false;
    patchWrite();
    patchChart();
    window.fetchStatus = async function () {
      try {
        var ctrl = new AbortController();
        var timeout = setTimeout(function () { ctrl.abort(); }, 8000);
        var res = await fetch(pingUrl(), { signal: ctrl.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error("API-Fehler: " + res.status);
        var data = toStatus(await res.json());
        if (!data) throw new Error("kein ping");
        window.lastGood = { data: data, ts: Date.now() };
        if (typeof failSince !== "undefined") failSince = null;
        applyOnline(data);
      } catch (err) {
        if (window.lastGood && Date.now() - window.lastGood.ts < 5 * 60 * 1000) {
          applyOnline(window.lastGood.data);
        }
      }
    };
    window.fetchStatus();
    return true;
  }
  function boot() {
    var p = location.pathname || "/";
    if (p !== "/" && p !== "/index.html") return;
    if (patch()) {
      try {
        if (typeof drawChart === "function") {
          var local = typeof lsGetJSON === "function" ? lsGetJSON("alpensmp_server_history", []) : [];
          drawChart((window._remoteHistory || []).concat(local));
        }
      } catch (e) {}
      return;
    }
    setTimeout(patch, 400);
    setTimeout(patch, 1400);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
