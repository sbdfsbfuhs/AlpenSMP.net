/* Owner: Guide verwalten */
(function () {
  if (window.__alpenGuideEditor) return;
  window.__alpenGuideEditor = true;
  function isOwner() { return !!(currentUser && currentUser.role === "owner"); }
  function mount() {
    if (!isOwner()) return;
    if (document.getElementById("alpenGuideAdmin")) return;
    var host = document.getElementById("tab-website") || document.getElementById("tab-help");
    if (!host) return;
    var box = document.createElement("div");
    box.id = "alpenGuideAdmin";
    box.className = "card";
    box.innerHTML = "<h2>Guide verwalten</h2><p class='desc'>Spieler-Guide. Keine erfundenen Commands. Bilder als URL.</p><p><a class='btn' href='https://alpensmp.net/guide/' target='_blank' rel='noopener'>Guide öffnen</a></p><h3>FAQ</h3><input id='gfq' placeholder='Frage'><textarea id='gfa' placeholder='Antwort' rows='3'></textarea><button class='btn' type='button' id='gfAdd'>FAQ speichern</button><h3 style='margin-top:16px'>Thema</h3><input id='gtTitle' placeholder='Titel'><input id='gtDesc' placeholder='Kurzbeschreibung'><select id='gtTrack'><option value='alpensmp'>AlpenSMP</option><option value='minecraft'>Minecraft</option></select><button class='btn' type='button' id='gtAdd'>Thema anlegen</button>";
    host.appendChild(box);
    document.getElementById("gfAdd").onclick = function () {
      var q = (document.getElementById("gfq").value || "").trim();
      var a = (document.getElementById("gfa").value || "").trim();
      if (q.length < 3 || a.length < 3 || !window.db) return;
      db.ref("guideFaq").push({ q: q, a: a, ts: Date.now(), by: currentUser.username });
      if (typeof toast === "function") toast("FAQ gespeichert");
    };
    document.getElementById("gtAdd").onclick = function () {
      var title = (document.getElementById("gtTitle").value || "").trim();
      var desc = (document.getElementById("gtDesc").value || "").trim();
      if (title.length < 3 || !window.db) return;
      db.ref("guideTopics").push({ title: title, desc: desc, kind: document.getElementById("gtTrack").value, active: true, ts: Date.now(), by: currentUser.username, steps: [] });
      if (typeof toast === "function") toast("Thema angelegt");
    };
  }
  setTimeout(mount, 800);
  setTimeout(mount, 2000);
})();
