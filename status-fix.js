/* Live-Status: Port 27491, alte Offline-API darf nicht mehr überschreiben */
(function () {
  window.__alpenStatusFix4 = true;
  var PING = "https://api.minetools.eu/ping/alpensmp.falixsrv.me/27491";

  if (!window.fetch.__alpenPing) {
    var rawFetch = window.fetch.bind(window);
    window.fetch = function (url, opts) {
      var u = typeof url === "string" ? url : (url && url.url) || "";
      if (u.indexOf("api.mcsrvstat.us") !== -1) return rawFetch(PING, opts);
      return rawFetch(url, opts);
    };
    window.fetch.__alpenPing = true;
  }

  function normalize(raw) {
    if (!raw) return null;
    if (raw.error) return null;
    if (raw.online === false && raw.players == null) return null;
    var pl = raw.players || {};
    if (raw.online === true || typeof pl.online === "number") {
      var ver = raw.version;
      if (ver && typeof ver === "object") ver = ver.name || "";
      return {
        online: true,
        players: { online: Number(pl.online) || 0, max: pl.max != null ? pl.max : "\u2014" },
        version: ver || ""
      };
    }
    return null;
  }

  function cleanSeries(arr) {
    arr = (arr || []).slice().sort(function (a, b) { return a.t - b.t; });
    return arr.filter(function (p, i) {
      if (!p || !p.t) return false;
      if (Number(p.n) > 0) return true;
      for (var j = 0; j < arr.length; j++) {
        if (j === i) continue;
        if (Number(arr[j].n) > 0 && Math.abs(arr[j].t - p.t) <= 20 * 60 * 1000) return false;
      }
      return true;
    });
  }

  function patchFns() {
    if (typeof window.applyOnline !== "function") return false;

    if (!window.applyOnline.__alpenNorm) {
      var origOn = window.applyOnline;
      window.applyOnline = function (data) {
        var n = normalize(data);
        if (!n) {
          if (window.lastGood && Date.now() - window.lastGood.ts < 8 * 60 * 1000) {
            return origOn(window.lastGood.data);
          }
          return;
        }
        window.lastGood = { data: n, ts: Date.now() };
        return origOn(n);
      };
      window.applyOnline.__alpenNorm = true;
    }

    if (typeof window.applyProblem === "function" && !window.applyProblem.__alpenHold) {
      var origProb = window.applyProblem;
      window.applyProblem = function () {
        if (window.lastGood && Date.now() - window.lastGood.ts < 8 * 60 * 1000) {
          return window.applyOnline(window.lastGood.data);
        }
        return origProb();
      };
      window.applyProblem.__alpenHold = true;
    }

    if (typeof window.drawChart === "function" && !window.drawChart.__alpenClean) {
      var origDraw = window.drawChart;
      window.drawChart = function (arr) { return origDraw(cleanSeries(arr)); };
      window.drawChart.__alpenClean = true;
    }

    window.writeRemoteHistory = function (n) {
      var db = typeof initFirebase === "function" ? initFirebase() : null;
      if (!db) return;
      var last = Number((typeof lsGet === "function" && lsGet("alpensmp_hist_push")) || 0);
      if (Date.now() - last < 60 * 1000) return;
      if (typeof lsSet === "function") lsSet("alpensmp_hist_push", String(Date.now()));
      db.ref("site_stats_history").push({
        t: Date.now(), n: Number(n) || 0, online_count: Number(n) || 0,
        total_players_ever: (window.CONFIG && CONFIG.totalJoined) || 0
      });
      db.ref("site_stats").update({ current_players: Number(n) || 0, updated_at: Date.now() });
    };

    window.fetchStatus = async function () {
      try {
        var ctrl = new AbortController();
        var t = setTimeout(function () { ctrl.abort(); }, 8000);
        var res = await window.fetch(PING, { signal: ctrl.signal });
        clearTimeout(t);
        if (!res.ok) throw new Error("ping");
        var data = normalize(await res.json());
        if (!data) throw new Error("empty");
        window.applyOnline(data);
      } catch (e) {
        if (typeof window.applyProblem === "function") window.applyProblem();
      }
    };

    window.fetchStatus();
    return true;
  }

  function boot() {
    var p = location.pathname || "/";
    if (p !== "/" && p !== "/index.html") return;
    if (!patchFns()) {
      setTimeout(boot, 300);
      setTimeout(boot, 1200);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
