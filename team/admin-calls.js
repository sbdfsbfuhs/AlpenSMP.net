/* Team Admin-Anfragen */
(function () {
  if (window.__alpenAdminCallsTeam) return;
  window.__alpenAdminCallsTeam = true;
  var lastAlertTs = Number(sessionStorage.getItem("alpenLastAlertTs") || "0");

  function safe(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, """);
  }
  function ago(ts) {
    var d = Date.now() - (ts || 0);
    if (!ts) return "–";
    if (d < 60000) return "gerade eben";
    if (d < 3600000) return "vor " + Math.floor(d / 60000) + " Min.";
    if (d < 86400000) return "vor " + Math.floor(d / 3600000) + " Std.";
    try { return new Date(ts).toLocaleString("de-DE"); } catch (e) { return String(ts); }
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
  function enhance() {
    var h = document.querySelector("#tab-help h2");
    if (h) h.textContent = "Admin-Anfragen & Hilfe";
    var d = document.querySelector("#tab-help .desc");
    if (d) d.textContent = "Spieler-Rufe aus Minecraft und Website-Tickets.";
  }

  function renderHelp(data) {
    enhance();
    var el = document.getElementById("helpList");
    if (!el) {
      var tab = document.getElementById("tab-help");
      if (!tab) return;
      el = document.createElement("div");
      el.id = "helpList";
      el.className = "list";
      tab.appendChild(el);
    }
    var entries = Object.entries(data || {}).filter(function (p) {
      return p[1] && !p[1].archived;
    });
    entries.sort(function (a, b) { return (b[1].ts || 0) - (a[1].ts || 0); });
    if (!entries.length) {
      el.innerHTML = '<div class="empty">Keine offenen Anfragen</div>';
      return;
    }
    var can = currentUser && (currentUser.role === "owner" || currentUser.role === "admin" || currentUser.role === "moderator" || currentUser.role === "helper");
    el.innerHTML = entries.map(function (pair) {
      var key = pair[0], item = pair[1] || {};
      var kind = item.type === "admin_call" ? "Admin-Anfrage" : "Hilfe";
      var extra = item.claimedBy ? '<div class="meta">Zuständig: ' + safe(item.claimedBy) + "</div>" : "";
      var meta = [];
      if (item.requestId) meta.push("ID #" + item.requestId);
      if (item.uuid) meta.push("UUID " + item.uuid);
      if (item.server) meta.push(item.server);
      var replies = "";
      if (item.replies) {
        replies = Object.values(item.replies).map(function (r) {
          return '<div style="margin-top:8px;padding:10px;background:rgba(0,0,0,.3);border-radius:9px;font-size:.9rem"><strong>'
            + safe(r.by) + "</strong>: " + safe(r.text) + "</div>";
        }).join("");
      }
      var btns = "";
      if (can) {
        btns = '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">'
          + ((item.status === "open" || !item.status || item.status === "offen") && !item.claimedBy
            ? '<button class="btn btn-sm" onclick="claimAdminCall(\'' + key + '\')">Übernehmen</button>' : "")
          + (item.status !== "done" && item.status !== "erledigt"
            ? '<button class="btn btn-sm" onclick="doneAdminCall(\'' + key + '\')">Erledigt</button>' : "")
          + '<input type="text" id="reply-' + key + '" placeholder="Antwort..." style="margin:0;flex:1">'
          + '<button class="btn btn-sm" onclick="replyHelp(\'' + key + '\')">Antworten</button>'
          + '<button class="btn btn-ghost btn-sm" onclick="removeItem(\'helpRequests\',\'' + key + '\')">Archiv</button></div>';
      }
      return '<div class="panic-item" style="margin-bottom:12px"><div><strong>'
        + kind + '</strong></div><div class="meta">Quelle: ' + safe(sourceLabel(item))
        + '</div><div>Spieler: <strong>' + safe(item.by) + '</strong></div>'
        + '<div style="margin:8px 0">Grund: ' + safe(item.reason || item.msg) + "</div>"
        + '<div class="meta">Gesendet: ' + safe(ago(item.ts))
        + (meta.length ? " · " + safe(meta.join(" · ")) : "") + "</div>"
        + '<div style="margin-top:6px;font-weight:700">Status: ' + statusLabel(item) + "</div>"
        + extra + replies + btns + "</div>";
    }).join("");
  }

  window.loadHelp = function () {
    enhance();
    if (!window.db) return;
    db.ref("helpRequests").once("value").then(function (snap) {
      renderHelp(snap.val() || {});
    }).catch(function () {
      var el = document.getElementById("helpList");
      if (el) el.innerHTML = '<div class="empty">Hilfe-Liste konnte nicht geladen werden.</div>';
    });
  };

  window.claimAdminCall = function (key) {
    if (!currentUser) return;
    db.ref("helpRequests/" + key).update({ status: "claimed", claimedBy: currentUser.username, claimedAt: Date.now() })
      .then(function () { if (typeof toast === "function") toast("Übernommen"); loadHelp(); });
  };
  window.doneAdminCall = function (key) {
    if (!currentUser) return;
    db.ref("helpRequests/" + key).update({ status: "done", doneBy: currentUser.username, doneAt: Date.now() })
      .then(function () { if (typeof toast === "function") toast("Erledigt"); loadHelp(); });
  };

  function listenAlerts() {
    if (!window.db || !currentUser) return;
    db.ref("staffAlerts").limitToLast(8).on("child_added", function (snap) {
      var a = snap.val() || {};
      if (!a.ts || a.ts <= lastAlertTs) return;
      lastAlertTs = a.ts;
      sessionStorage.setItem("alpenLastAlertTs", String(lastAlertTs));
      if (a.kind !== "admin_call") return;
      if (typeof toast === "function") toast("Neue Admin-Anfrage: " + (a.player || "") + " braucht Hilfe.");
    });
  }

  function boot() {
    enhance();
    if (currentUser) listenAlerts();
    if (window.db) window.loadHelp();
    else setTimeout(function () { if (window.db) window.loadHelp(); }, 800);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 400); });
  else setTimeout(boot, 400);
})();
