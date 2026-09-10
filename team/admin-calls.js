/* Team Admin-Anfragen */
(function () {
  if (window.__alpenAdminCallsTeam) return;
  window.__alpenAdminCallsTeam = true;
  var lastAlertTs = Number(sessionStorage.getItem("alpenLastAlertTs") || "0");
  function safe(s) {
    return String(s == null ? "" : s).replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, """);
  }
  function ago(ts) {
    var d = Date.now() - (ts || 0);
    if (!ts) return "-";
    if (d < 60000) return "gerade eben";
    if (d < 3600000) return "vor " + Math.floor(d / 60000) + " Min.";
    if (d < 86400000) return "vor " + Math.floor(d / 3600000) + " Std.";
    return new Date(ts).toLocaleString("de-DE");
  }
  function sourceLabel(item) {
    var s = String(item.source || item.sourceLabel || "").toLowerCase();
    if (s.indexOf("minecraft") !== -1 || item.uuid) return "Minecraft Ingame";
    if (s.indexOf("website") !== -1 || item.ticketCode) return "Website";
    return item.sourceLabel || item.source || "Website";
  }
  function statusLabel(item) {
    var st = item.status || (item.claimedBy ? "claimed" : "open");
    if (st === "done" || st === "erledigt") return "Erledigt";
    if (st === "claimed" || st === "in_progress" || item.claimedBy) return "In Bearbeitung";
    return "Offen";
  }
  function isStaff() {
    if (!currentUser) return false;
    var r = currentUser.role;
    return r === "owner" || r === "admin" || r === "helper";
  }
  function enhance() {
    var h = document.querySelector("#tab-help h2");
    if (h) h.textContent = "Admin-Anfragen & Hilfe";
    var d = document.querySelector("#tab-help .desc");
    if (d) d.textContent = "Beanspruchen oder erledigen. Quelle: Minecraft oder Website.";
  }
  window.loadHelp = function () {
    enhance();
    if (!window.db) return;
    db.ref("helpRequests").once("value").then(function (snap) {
      var data = snap.val() || {};
      var el = document.getElementById("helpList");
      if (!el) return;
      var entries = Object.entries(data).filter(function (p) { return p[1] && !p[1].archived; });
      entries.sort(function (a, b) { return (b[1].ts || 0) - (a[1].ts || 0); });
      if (!entries.length) { el.innerHTML = '<div class="empty">Keine offenen Anfragen</div>'; return; }
      var can = isStaff();
      el.innerHTML = entries.map(function (pair) {
        var key = pair[0], item = pair[1];
        var kind = item.type === "admin_call" ? "Admin-Anfrage" : "Hilfe";
        var extra = item.claimedBy ? '<div class="meta">Zustaendig: ' + safe(item.claimedBy) + "</div>" : "";
        var open = (item.status === "open" || !item.status || item.status === "offen") && !item.claimedBy;
        var notDone = item.status !== "done" && item.status !== "erledigt";
        var btns = "";
        if (can) {
          btns = '<div class="help-actions">'
            + (open ? '<button class="btn btn-sm" type="button" onclick="claimAdminCall(\'' + key + '\')">Beanspruchen</button>' : "")
            + (notDone ? '<button class="btn btn-sm" type="button" onclick="doneAdminCall(\'' + key + '\')">Erledigt</button>' : "")
            + '<button class="btn btn-ghost btn-sm" type="button" onclick="removeItem(\'helpRequests\',\'' + key + '\')">Archiv</button></div>';
        }
        return '<div class="panic-item help-card"><div><strong>' + kind + "</strong></div>"
          + '<div class="meta">Quelle: ' + safe(sourceLabel(item)) + "</div>"
          + "<div>Spieler: <strong>" + safe(item.by) + "</strong></div>"
          + '<div class="help-reason">Grund: ' + safe(item.reason || item.msg) + "</div>"
          + '<div class="meta">Gesendet: ' + safe(ago(item.ts)) + "</div>"
          + '<div class="help-status">Status: ' + statusLabel(item) + "</div>"
          + extra + btns + "</div>";
      }).join("");
    });
  };
  window.claimAdminCall = function (key) {
    if (!currentUser) return;
    db.ref("helpRequests/" + key).update({ status: "claimed", claimedBy: currentUser.username, claimedAt: Date.now() })
      .then(function () { if (typeof toast === "function") toast("Beansprucht"); loadHelp(); });
  };
  window.doneAdminCall = function (key) {
    if (!currentUser) return;
    db.ref("helpRequests/" + key).update({ status: "done", doneBy: currentUser.username, doneAt: Date.now() })
      .then(function () { if (typeof toast === "function") toast("Erledigt"); loadHelp(); });
  };
  function soundEnabled() { try { return localStorage.getItem("alpenHelpSound") !== "off"; } catch (e) { return true; } }
  function playHelpSound() {
    if (!soundEnabled() || !currentUser) return;
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var o = ctx.createOscillator(); var g = ctx.createGain();
      o.type = "sine"; o.frequency.value = 880; g.gain.value = 0.04;
      o.connect(g); g.connect(ctx.destination); o.start();
      setTimeout(function () { o.frequency.value = 1174; }, 90);
      setTimeout(function () { o.stop(); ctx.close(); }, 220);
    } catch (e) {}
  }
  function listen() {
    if (!window.db || !currentUser) return;
    db.ref("helpRequests").limitToLast(1).on("child_added", function (snap) {
      var a = snap.val() || {};
      if (!a.ts || a.ts <= lastAlertTs) return;
      lastAlertTs = a.ts;
      sessionStorage.setItem("alpenLastAlertTs", String(lastAlertTs));
      playHelpSound();
      if (typeof toast === "function") toast("Neue Hilfe-Anfrage: " + (a.by || "Spieler"));
    });
  }
  function boot() { enhance(); listen(); if (document.getElementById("tab-help")) loadHelp(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 400); });
  else setTimeout(boot, 400);
})();
