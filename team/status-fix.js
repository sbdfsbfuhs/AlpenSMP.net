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
    else {
      const cards = tab.querySelectorAll(":scope > .card");
      if (cards.length > 1) cards[cards.length - 1].style.display = "none";
    }
  }

  window.writeActiveStatus = function (payload) {
    if (!requireStaff()) return Promise.reject();
    const expires = typeof statusExpiresAt === "function" ? statusExpiresAt() : null;
    const body = {
      id: "active",
      status_type: payload.type,
      type: payload.type,
      title: payload.title || "",
      message: payload.message || "",
      is_active: payload.type !== "online",
      color: payload.color || "",
      created_by: currentUser.username,
      updated_by: currentUser.username,
      created_role: currentUser.role || "",
      created_at: Date.now(),
      updated_at: Date.now(),
      expires_at: expires
    };
    return db.ref("site_status/active").set(body).then(function () {
      return db.ref("site_status/log").push(body);
    }).then(function () { toast("Status gesetzt ✓"); });
  };

  window.loadWebsitePanel = function () {
    if (!requireStaff()) return;
    applyAccess();
    const row = document.getElementById("statusPresets");
    if (row && !row.dataset.ready && typeof STATUS_PRESETS !== "undefined") {
      row.innerHTML = STATUS_PRESETS.map(function (p) {
        return '<button type="button" class="preset-chip" data-type="' + p.type + '" onclick=\'setStatusPreset(' + JSON.stringify(p) + ')\'>' + p.title + "</button>";
      }).join("");
      row.dataset.ready = "1";
    }
    if (!window._websiteListenersBound) {
      window._websiteListenersBound = true;
      db.ref("site_status/active").on("value", function (snap) {
        if (typeof renderStatusPreview === "function") renderStatusPreview(snap.val());
      });
      if (currentUser.role === "owner") {
        db.ref("site_stats").on("value", function (snap) {
          const s = snap.val() || {};
          const total = Number(s.total_players_ever || 0);
          const cur = s.current_players;
          const nowEl = document.getElementById("ownerTotalNow");
          const inEl = document.getElementById("ownerTotalInput");
          const curEl = document.getElementById("ownerCurrentInput");
          if (nowEl) nowEl.textContent = isNaN(total) ? "–" : total.toLocaleString("de-DE");
          if (inEl && document.activeElement !== inEl) inEl.value = isNaN(total) ? "" : String(total);
          if (curEl && document.activeElement !== curEl && cur != null) curEl.value = String(cur);
        });
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyAccess);
  } else {
    applyAccess();
  }
  setTimeout(applyAccess, 400);
})();
