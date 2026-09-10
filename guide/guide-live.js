/* Lädt Owner-Themen aus Firebase in den öffentlichen Guide */
(function () {
  function merge(val) {
    if (!window.ALPEN_GUIDE) window.ALPEN_GUIDE = { topics: [], faq: [], categories: [] };
    var g = window.ALPEN_GUIDE;
    if (!g.topics) g.topics = [];
    Object.keys(val || {}).forEach(function (id) {
      var t = val[id] || {};
      var topic = {
        id: id,
        cat: t.track === "mc" || t.kind === "minecraft" ? "mc" : "alpen",
        track: t.track === "mc" || t.kind === "minecraft" ? "mc" : "alpen",
        kind: t.kind === "minecraft" ? "minecraft" : "alpensmp",
        order: t.order || t.ts || 0,
        icon: t.icon || "",
        title: t.title || "Thema",
        desc: t.desc || "",
        active: t.active !== false,
        steps: Array.isArray(t.steps) && t.steps.length ? t.steps : [{ title: t.title || "Schritt", text: t.desc || "", image: t.image || "" }]
      };
      var idx = -1;
      g.topics.forEach(function (x, i) { if (x.id === id) idx = i; });
      if (idx >= 0) g.topics[idx] = topic; else g.topics.push(topic);
    });
  }
  function boot() {
    try {
      if (window.firebase && firebase.apps && !firebase.apps.length) {
        firebase.initializeApp({ apiKey: "AIzaSyBugFF4T6y_XEhCYde99bwpSyYZOuKbJHc", databaseURL: "https://alpensmp-ad844-default-rtdb.europe-west1.firebasedatabase.app/", projectId: "alpensmp-ad844" });
      }
      var db = window.firebase && firebase.database ? firebase.database() : null;
      if (!db) return;
      db.ref("guideTopics").on("value", function (snap) { merge(snap.val() || {}); });
      db.ref("guideFaq").on("value", function (snap) {
        var v = snap.val() || {};
        var extra = Object.keys(v).map(function (k) { return v[k]; });
        if (!window.ALPEN_GUIDE.faq) window.ALPEN_GUIDE.faq = [];
        extra.forEach(function (f) { if (f && f.q) window.ALPEN_GUIDE.faq.push(f); });
      });
    } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
