/* Helper + Admin: Status-Banner + Lockdown */
(function () {
  function requireStaff() {
    if (!currentUser) { toast("Nicht angemeldet"); return false; }
    return true;
  }
  function applyAccess() {
    const btn = document.getElementById("websiteTabBtn");
    if (btn) btn.style.display = "inline-block";
    if (!currentUser || currentUser.role === "owner") return;
    const tab = document.getElementById("tab-website");
    if (!tab) return;
    const grid = document.getElementById("ownerStatsGrid") || tab.querySelector(".owner-grid");
    if (grid) grid.style.display = "none";
    const settings = document.getElementById("ownerSettingsCard");
    if (settings) settings.style.display = "none";
  }
  window.writeActiveStatus = function (payload) {
    if (!requireStaff()) return Promise.reject();
    const expires = typeof statusExpiresAt === "function" ? statusExpiresAt() : null;
    const kind = payload.type || payload.color || "custom";
    const body = {
      id: "active", status_type: kind, type: kind,
      title: payload.title || "", message: payload.message || "",
      is_active: kind !== "online", color: payload.color || kind || "",
      lockdown: !!payload.lockdown,
      created_by: currentUser.username, updated_by: currentUser.username,
      created_role: currentUser.role || "", created_at: Date.now(), updated_at: Date.now(),
      expires_at: expires
    };
    return db.ref("site_status/active").set(body).then(function () {
      return db.ref("site_status/log").push(body);
    }).then(function () { toast(payload.lockdown ? "Lockdown aktiv" : "Status gesetzt"); });
  };
  window.saveCustomStatus = function () {
    const title = (document.getElementById("customStatusTitle").value || "").trim();
    const message = (document.getElementById("customStatusMessage").value || "").trim();
    const color = (document.getElementById("customStatusColor") && document.getElementById("customStatusColor").value) || "custom";
    if (!title) return toast("Titel fehlt");
    return writeActiveStatus({ type: color, title: title, message: message, color: color, lockdown: false });
  };
  window.setLockdown = function (mode) {
    if (mode === "off") {
      return writeActiveStatus({ type: "online", title: "Online", message: "", lockdown: false });
    }
    if (mode === "down") {
      return writeActiveStatus({
        type: "down", color: "down", lockdown: true,
        title: "Website gerade nicht erreichbar",
        message: "Bitte später nochmal versuchen. Der Server kann trotzdem online sein."
      });
    }
    if (mode === "edit") {
      return writeActiveStatus({
        type: "maintenance", color: "maintenance", lockdown: true,
        title: "Website wird bearbeitet",
        message: "Wir aktualisieren gerade Inhalte. Gleich wieder da."
      });
    }
    var title = (document.getElementById("customStatusTitle").value || "").trim() || "Hinweis";
    var message = (document.getElementById("customStatusMessage").value || "").trim() || "Kurze Unterbrechung.";
    return writeActiveStatus({ type: "custom", color: "custom", title: title, message: message, lockdown: true });
  };
  function injectLockdownCard() {
    if (document.getElementById("alpenLockdownCard")) return;
    var tab = document.getElementById("tab-website");
    if (!tab) return;
    var card = document.createElement("div");
    card.className = "card";
    card.id = "alpenLockdownCard";
    card.style.marginTop = "26px";
    card.innerHTML = "<h2>🔒 Lockdown</h2><p class=\"desc\">Sperrt die öffentliche Website (Start, Guide, Regeln, Reviews). Staff-Center bleibt erreichbar.</p>" +
      "<div style=\"display:flex;gap:8px;flex-wrap:wrap\">" +
      "<button class=\"btn\" onclick=\"setLockdown('down')\">Nicht erreichbar</button>" +
      "<button class=\"btn\" onclick=\"setLockdown('edit')\">Wird bearbeitet</button>" +
      "<button class=\"btn\" onclick=\"setLockdown('custom')\">Custom + Lockdown</button>" +
      "<button class=\"btn btn-ghost\" onclick=\"setLockdown('off')\">Lockdown aus</button>" +
      "</div><p class=\"hint\">Custom nutzt Titel und Nachricht aus der Status-Meldung oben.</p>";
    tab.appendChild(card);
  }
  window.loadWebsitePanel = function () {
    if (!requireStaff()) return;
    applyAccess();
    injectLockdownCard();
  };
  function loadExtra(src, key) {
    if (document.querySelector("script[data-" + key + "]")) return;
    var s = document.createElement("script");
    s.src = src;
    s.setAttribute("data-" + key, "1");
    document.body.appendChild(s);
  }
  loadExtra("admin-calls.js?v=20260910g", "alpen-admin-calls");
  loadExtra("staff-polish.js?v=20260910g", "alpen-staff-polish");
  loadExtra("guide-editor.js?v=06", "alpen-guide-editor");
  loadExtra("mc-panel-button.js?v=20260925", "alpen-mc-panel");
  loadExtra("https://alpensmp.net/version-badge.js?v=11", "alpen-version");
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { applyAccess(); injectLockdownCard(); });
  else { applyAccess(); injectLockdownCard(); }
  setTimeout(function () { applyAccess(); injectLockdownCard(); }, 400);
  setTimeout(injectLockdownCard, 1200);
})();
