/* Owner: Guide Themen, Schritte, Bilder */
(function () {
  if (window.__alpenGuideEditor) return;
  window.__alpenGuideEditor = true;
  function canEdit() { return !!(currentUser && (currentUser.role === "owner" || currentUser.role === "admin")); }
  function esc(s) { return String(s || "").replace(/&/g, "&").replace(/</g, "<").replace(/"/g, """); }
  function mount() {
    if (!canEdit() || !window.db) return;
    if (document.getElementById("alpenGuideAdmin")) return;
    var host = document.getElementById("tab-website") || document.getElementById("tab-help");
    if (!host) return;
    var box = document.createElement("div");
    box.id = "alpenGuideAdmin";
    box.className = "card";
    box.innerHTML = "<h2>Guide verwalten</h2><p class='desc'>Themen erscheinen auf /guide/. Bild als https-URL.</p><p><a class='btn btn-p' href='https://alpensmp.net/guide/' target='_blank' rel='noopener'>Guide öffnen</a></p><h3>Neues Thema</h3><input id='gtTitle' placeholder='Titel'><input id='gtDesc' placeholder='Kurzbeschreibung'><select id='gtTrack'><option value='alpensmp'>AlpenSMP</option><option value='minecraft'>Minecraft</option></select><button class='btn btn-p' type='button' id='gtAdd'>Thema anlegen</button><div id='gTopicList'></div><h3 style='margin-top:16px'>FAQ</h3><input id='gfq' placeholder='Frage'><textarea id='gfa' rows='2' placeholder='Antwort'></textarea><button class='btn' type='button' id='gfAdd'>FAQ speichern</button>";
    host.appendChild(box);
    document.getElementById("gtAdd").onclick = function () {
      var title = (document.getElementById("gtTitle").value || "").trim();
      var desc = (document.getElementById("gtDesc").value || "").trim();
      if (title.length < 3) return;
      var kind = document.getElementById("gtTrack").value;
      db.ref("guideTopics").push({ title: title, desc: desc, kind: kind, track: kind === "minecraft" ? "mc" : "alpen", active: true, order: Date.now(), ts: Date.now(), by: currentUser.username, steps: [{ title: "Schritt 1", text: desc || title, image: "" }] });
      if (typeof toast === "function") toast("Thema angelegt");
    };
    document.getElementById("gfAdd").onclick = function () {
      var q = (document.getElementById("gfq").value || "").trim();
      var a = (document.getElementById("gfa").value || "").trim();
      if (q.length < 3 || a.length < 3) return;
      db.ref("guideFaq").push({ q: q, a: a, ts: Date.now(), by: currentUser.username });
      if (typeof toast === "function") toast("FAQ gespeichert");
    };
    db.ref("guideTopics").on("value", function (snap) {
      var data = snap.val() || {};
      var list = document.getElementById("gTopicList");
      if (!list) return;
      list.innerHTML = Object.keys(data).map(function (id) {
        var t = data[id] || {}; var steps = Array.isArray(t.steps) ? t.steps : [];
        return "<div class='card' style='margin-top:12px'><strong>" + esc(t.title) + "</strong><p class='desc'>" + esc(t.desc || "") + "</p>" + steps.map(function (s, i) {
          return "<div class='g-step' data-id='" + id + "' data-i='" + i + "'><input class='gs-title' value='" + esc(s.title || "") + "' placeholder='Schritt-Titel'><textarea class='gs-text' rows='2'>" + esc(s.text || "") + "</textarea><input class='gs-img' value='" + esc(s.image || "") + "' placeholder='Bild-URL https://...'>" + (s.image ? "<img src='" + esc(s.image) + "' alt='' style='max-width:200px;border-radius:12px'>" : "") + "<button type='button' class='btn gs-save'>Speichern</button> <button type='button' class='btn gs-del'>Löschen</button></div>";
        }).join("") + "<button type='button' class='btn btn-p g-addstep' data-id='" + id + "'>Schritt hinzufügen</button> <button type='button' class='btn g-deltopic' data-id='" + id + "'>Thema löschen</button></div>";
      }).join("") || "<p class='desc'>Noch keine eigenen Themen.</p>";
      list.querySelectorAll(".g-addstep").forEach(function (b) {
        b.onclick = function () { var id = b.getAttribute("data-id"); var t = data[id] || {}; var steps = Array.isArray(t.steps) ? t.steps.slice() : []; steps.push({ title: "Neuer Schritt", text: "", image: "" }); db.ref("guideTopics/" + id + "/steps").set(steps); };
      });
      list.querySelectorAll(".g-deltopic").forEach(function (b) {
        b.onclick = function () { if (confirm("Thema löschen?")) db.ref("guideTopics/" + b.getAttribute("data-id")).remove(); };
      });
      list.querySelectorAll(".g-step").forEach(function (row) {
        var id = row.getAttribute("data-id"); var i = Number(row.getAttribute("data-i"));
        row.querySelector(".gs-save").onclick = function () {
          var t = data[id] || {}; var steps = Array.isArray(t.steps) ? t.steps.slice() : [];
          steps[i] = { title: row.querySelector(".gs-title").value.trim(), text: row.querySelector(".gs-text").value.trim(), image: row.querySelector(".gs-img").value.trim() };
          db.ref("guideTopics/" + id + "/steps").set(steps);
          if (typeof toast === "function") toast("Schritt gespeichert");
        };
        row.querySelector(".gs-del").onclick = function () { var t = data[id] || {}; var steps = (t.steps || []).slice(); steps.splice(i, 1); db.ref("guideTopics/" + id + "/steps").set(steps); };
      });
    });
  }
  setTimeout(mount, 700);
  setTimeout(mount, 2200);
})();
