/* Staff-Center: Aufräumen, 3 Rollen, Leitfaden, Mini-Hilfe, Ton */
(function () {
  if (window.__alpenStaffPolish) return;
  window.__alpenStaffPolish = true;

  var ALLOWED = { owner: 1, admin: 1, helper: 1 };
  var DEFAULT_GUIDE = [
    { id: "insult", title: "Beleidigung", duration: 1, unit: "hours", stack: true, note: "1 Stunde pro Beleidigung, stapelbar.", active: true },
    { id: "spam", title: "Spam", duration: 30, unit: "minutes", stack: false, note: "Wiederholung erhöhen.", active: true },
    { id: "grief", title: "Griefing", duration: 1, unit: "days", stack: false, note: "Je nach Schaden erhöhen.", active: true },
    { id: "cheat", title: "Cheating / Hacks", duration: 7, unit: "days", stack: false, note: "Bei hartnäckigem Cheat permanent prüfen.", active: true },
    { id: "ban_evade", title: "Ban-Umgehung", duration: 7, unit: "days", stack: false, note: "Auf den ursprünglichen Ban aufschlagen.", active: true }
  ];

  function isOwner() { return !!(currentUser && currentUser.role === "owner"); }
  function unitLabel(u) { return u === "minutes" ? "Minuten" : u === "days" ? "Tage" : "Stunden"; }
  function durText(it) { return it.duration + " " + unitLabel(it.unit) + (it.stack ? " (stapelbar)" : ""); }
  function escText(s) { return String(s == null ? "" : s).replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">"); }

  function injectCss() {
    if (document.getElementById("alpenPolishCss")) return;
    var s = document.createElement("style");
    s.id = "alpenPolishCss";
    s.textContent = ".tm-bell,.tm-search-btn{overflow:visible}.tm-bell .badge,.nav-badge,.badge{min-width:18px;height:18px;padding:0 5px;line-height:18px;font-size:11px;overflow:visible;right:-6px;top:-6px}.btn,.tab,button{overflow:visible;white-space:nowrap}.panic-item,.item,.card,.help-card{overflow-wrap:anywhere;word-break:break-word}.help-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}#tab-help .list,#helpList{max-height:none}.alpen-extra{margin-top:18px}.alpen-guide-item{background:rgba(0,0,0,.28);border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin:8px 0}.alpen-ai{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 16px}.alpen-ai input{flex:1;min-width:180px;margin:0}.alpen-ai-out{background:rgba(0,0,0,.28);border-radius:12px;padding:12px;min-height:42px;color:var(--muted)}details.alpen-fold{background:rgba(0,0,0,.2);border:1px solid var(--border);border-radius:12px;padding:10px 14px;margin:8px 0}details.alpen-fold summary{cursor:pointer;font-weight:700}option[value=moderator],option[value=builder],option[value=developer]{display:none!important}";
    document.head.appendChild(s);
  }

  function pruneRoleUi() {
    document.querySelectorAll("option").forEach(function (o) {
      var v = (o.value || "").toLowerCase();
      var t = (o.textContent || "").toLowerCase();
      if (/moderator|builder|developer|entwickler|bauer/.test(v + " " + t) && !ALLOWED[v]) o.remove();
    });
  }

  function ensureHelpExtras() {
    var tab = document.getElementById("tab-help");
    if (!tab || document.getElementById("alpenHelpExtras")) return;
    var on = true;
    try { on = localStorage.getItem("alpenHelpSound") !== "off"; } catch (e) {}
    var box = document.createElement("div");
    box.id = "alpenHelpExtras";
    box.className = "card alpen-extra";
    box.innerHTML = "<h2>Team-Hilfe</h2><p class=\"desc\">Kurz nachschlagen. Keine erfundenen Strafen.</p>"
      + '<label class="switch" style="margin:10px 0;display:flex;gap:8px;align-items:center"><input id="alpenSoundToggle" type="checkbox"' + (on ? " checked" : "") + "><span>Ton bei neuer Hilfe-Anfrage</span></label>"
      + '<div class="alpen-ai"><input id="alpenAiQ" placeholder="Wie lange bannen bei Beleidigung?"><button class="btn" type="button" id="alpenAiGo">Fragen</button></div>"
      + '<div class="alpen-ai-out" id="alpenAiOut">Frage z. B. nach Beleidigung, Spam, Griefing oder Ban-Umgehung.</div>"
      + '<h2 style="margin-top:22px">Straf-Leitfaden</h2><p class="desc">Nur Nachschlagen. Owner kann Einträge ändern.</p><div id="alpenGuideList"></div>"
      + (isOwner() ? '<div class="alpen-ai"><input id="gTitle" placeholder="Grund"><input id="gDur" placeholder="Dauer" style="max-width:90px"><select id="gUnit"><option value="minutes">Minuten</option><option value="hours" selected>Stunden</option><option value="days">Tage</option></select><input id="gNote" placeholder="Hinweis"><button class="btn" type="button" id="gAdd">Eintrag</button></div>' : "");
    tab.appendChild(box);
    var tog = document.getElementById("alpenSoundToggle");
    if (tog) tog.onchange = function () { try { localStorage.setItem("alpenHelpSound", tog.checked ? "on" : "off"); } catch (e) {} };
    var go = document.getElementById("alpenAiGo");
    if (go) go.onclick = runAi;
    var inp = document.getElementById("alpenAiQ");
    if (inp) inp.addEventListener("keydown", function (e) { if (e.key === "Enter") runAi(); });
    var add = document.getElementById("gAdd");
    if (add) add.onclick = addGuide;
  }

  function loadGuide(cb) {
    if (!window.db) return;
    db.ref("punishmentGuide").once("value").then(function (snap) {
      var data = snap.val();
      if (!data) {
        var seed = {};
        DEFAULT_GUIDE.forEach(function (it) { seed[it.id] = it; });
        return db.ref("punishmentGuide").set(seed).then(function () { cb(seed); });
      }
      cb(data);
    });
  }
  function renderGuide(data) {
    var el = document.getElementById("alpenGuideList");
    if (!el) return;
    var items = Object.entries(data || {}).map(function (p) { return Object.assign({ id: p[0] }, p[1] || {}); }).filter(function (it) { return it.active !== false; });
    if (!items.length) { el.innerHTML = '<div class="empty">Noch keine Einträge</div>'; return; }
    el.innerHTML = items.map(function (it) {
      var del = isOwner() ? ' <button class="btn btn-ghost btn-sm" type="button" onclick="alpenDelGuide(\'' + it.id + '\')">Löschen</button>' : "";
      return '<div class="alpen-guide-item"><b>' + escText(it.title) + "</b><div>" + escText(durText(it)) + '</div><div class="meta">' + escText(it.note || "") + "</div>" + del + "</div>";
    }).join("");
  }
  window.alpenDelGuide = function (id) { if (!isOwner() || !id) return; db.ref("punishmentGuide/" + id).remove().then(refreshGuide); };
  function addGuide() {
    if (!isOwner()) return;
    var title = ((document.getElementById("gTitle") || {}).value || "").trim();
    var duration = Number((document.getElementById("gDur") || {}).value || 0);
    var unit = (document.getElementById("gUnit") || {}).value || "hours";
    var note = (document.getElementById("gNote") || {}).value || "";
    if (title.length < 2 || !duration) { if (typeof toast === "function") toast("Grund und Dauer angeben"); return; }
    db.ref("punishmentGuide/g" + Date.now().toString(36)).set({ title: title, duration: duration, unit: unit, note: note, stack: false, active: true }).then(refreshGuide);
  }
  function refreshGuide() { loadGuide(renderGuide); }
  function runAi() {
    var q = ((document.getElementById("alpenAiQ") || {}).value || "").toLowerCase().trim();
    var out = document.getElementById("alpenAiOut");
    if (!out) return;
    if (q.length < 2) { out.textContent = "Bitte etwas genauer fragen."; return; }
    loadGuide(function (guide) {
      var hit = null;
      Object.values(guide || {}).forEach(function (it) {
        if (!it || it.active === false) return;
        var blob = ((it.title || "") + " " + (it.note || "") + " " + (it.id || "")).toLowerCase();
        if (q.split(/\s+/).some(function (w) { return w.length > 3 && blob.indexOf(w) !== -1; }) || blob.indexOf(q) !== -1) hit = it;
      });
      if (/beleidig|insult|hate/.test(q)) hit = hit || guide.insult;
      if (/spam|werbung/.test(q)) hit = hit || guide.spam;
      if (/grief|zerst/.test(q)) hit = hit || guide.grief;
      if (/cheat|hack|xray/.test(q)) hit = hit || guide.cheat;
      if (/umgeh|altacc|alt account/.test(q)) hit = hit || guide.ban_evade;
      if (hit) out.innerHTML = "<strong>" + escText(hit.title) + "</strong><div>" + escText(durText(hit)) + "</div><div>" + escText(hit.note || "") + "</div>";
      else out.textContent = "Steht nicht im Leitfaden, Owner fragen.";
    });
  }

  function boot() { injectCss(); pruneRoleUi(); ensureHelpExtras(); refreshGuide(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 500); });
  else setTimeout(boot, 500);
  setInterval(pruneRoleUi, 2500);
})();
