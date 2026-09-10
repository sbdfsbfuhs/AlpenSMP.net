/* Helper + Admin: Status-Banner auf der Website setzen */
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
    const body = {
      id: "active", status_type: payload.type, type: payload.type,
      title: payload.title || "", message: payload.message || "",
      is_active: payload.type !== "online", color: payload.color || "",
      created_by: currentUser.username, updated_by: currentUser.username,
      created_role: currentUser.role || "", created_at: Date.now(), updated_at: Date.now(),
      expires_at: expires
    };
    return db.ref("site_status/active").set(body).then(function () {
      return db.ref("site_status/log").push(body);
    }).then(function () { toast("Status gesetzt"); });
  };
  window.loadWebsitePanel = function () {
    if (!requireStaff()) return;
    applyAccess();
  };
  function loadExtra(src, key) {
    if (document.querySelector("script[data-" + key + "]")) return;
    var s = document.createElement("script");
    s.src = src;
    s.setAttribute("data-" + key, "1");
    document.body.appendChild(s);
  }
  loadExtra("admin-calls.js?v=20260910f", "alpen-admin-calls");
  loadExtra("staff-polish.js?v=20260910f", "alpen-staff-polish");
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyAccess);
  else applyAccess();
  setTimeout(applyAccess, 400);
})();
