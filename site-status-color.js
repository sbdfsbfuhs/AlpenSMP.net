/* Wendet site_status.color auf das Startseiten-Banner an */
(function () {
  function apply() {
    try {
      var banner = document.getElementById('siteStatusBanner');
      if (!banner || typeof initFirebase !== 'function') return;
      var db = initFirebase();
      if (!db) return;
      db.ref('site_status/active').on('value', function (snap) {
        var data = snap.val();
        if (!data || !data.is_active || data.type === 'online') return;
        var tone = String(data.color || data.type || 'custom');
        banner.className = 'site-status-banner ' + tone;
      });
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(apply, 300); });
  else setTimeout(apply, 300);
})();
