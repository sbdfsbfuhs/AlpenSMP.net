/* Staff polish v20260910f */
(function () {
  if (window.__alpenStaffPolish) return;
  window.__alpenStaffPolish = true;
  var VER = "Staff v20260910f";
  var ALLOWED = { owner: 1, admin: 1, helper: 1 };
  var DEFAULT_GUIDE = {
    insult: { title: "Beleidigung", duration: 1, unit: "hours", stack: true, note: "1 Stunde pro Beleidigung, stapelbar.", active: true },
    spam: { title: "Spam", duration: 30, unit: "minutes", stack: false, note: "Wiederholung erhoehen.", active: true },
    grief: { title: "Griefing", duration: 1, unit: "days", stack: false, note: "Je nach Schaden erhoehen.", active: true },
    cheat: { title: "Cheating / Hacks", duration: 7, unit: "days", stack: false, note: "Bei hartnaeckigem Cheat pruefen.", active: true },
    ban_evade: { title: "Ban-Umgehung", duration: 7, unit: "days", stack: false, note: "Auf den urspruenglichen Ban aufschlagen.", active: true }
  };
  function isOwner() { return !!(currentUser && currentUser.role === "owner"); }
  function unitLabel(u) { return u === "minutes" ? "Minuten" : u === "days" ? "Tage" : "Stunden"; }
  function durText(it) { return it.duration + " " + unitLabel(it.unit) + (it.stack ? " (stapelbar)" : ""); }
  function escText(s) { return String(s == null ? "" : s).replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">"); }
  function showVersion() {
    var d = document.getElementById("alpenVer");
    if (!d) {
      d = document.createElement("div");
      d.id = "alpenVer";
      d.style.cssText = "position:fixed;left:12px;bottom:12px;z-index:99999;background:#0c1018;border:1px solid rgba(199,62,62,.5);color:#fda4af;padding:6px 10px;border-radius:10px;font-size:12px;pointer-events:none";
      document.body.appendChild(d);
    }
    d.textContent = VER;
  }
  function injectCss() {
    if (document.getElementById("alpenPolishCss")) return;
    var s = document.createElement("style");
    s.id = "alpenPolishCss";
    s.textContent = ".tabs,.tab-row,.tm-sub{overflow:visible!important}.tab,button.tab{overflow:visible!important;position:relative}.tab .badge,.tabs .badge,.badge{position:absolute;top:-8px;right:-8px;min-width:18px;height:18px;padding:0 5px;line-height:18px;font-size:11px;border-radius:999px;z-index:8}.btn,button{overflow:visible;white-space:nowrap}.alpen-extra{margin-top:18px}.alpen-guide-item{background:rgba(0,0,0,.28);border:1px solid var(--border);border-radius:12px;padding:12px;margin:8px 0}.alpen-ai{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.alpen-ai input{flex:1;min-width:160px;margin:0}.alpen-ai-out{background:rgba(0,0,0,.28);border-radius:12px;padding:12px}option[value=moderator],option[value=builder],option[value=developer]{display:none!important}";
    document.head.appendChild(s);
  }
  function pruneRoleUi() {
    document.querySelectorAll("option").forEach(function (o) {
      var v = (o.value || "").toLowerCase();
      if (v === "moderator" || v === "builder" || v === "developer") o.remove();
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
    var html = "<h2>Team-Hilfe</h2><p class='desc'>Kurz nachschlagen.</p>";
    html += "<label style='display:flex;gap:8px;align-items:center;margin:10px 0'><input id='alpenSoundToggle' type='checkbox'" + (on ? " checked" : "") + "><span>Ton bei neuer Hilfe-Anfrage</span></label>";
    html += "<div class='alpen-ai'><input id='alpenAiQ' placeholder='Wie lange bannen bei Beleidigung?'><button class='btn' type='button' id='alpenAiGo'>Fragen</button></div>";
    html += "<div class='alpen-ai-out' id='alpenAiOut'>Frage nach Beleidigung, Spam oder Griefing.</div>";
    html += "<h2 style='margin-top:22px'>Straf-Leitfaden</h2><p class='desc'>Nur Nachschlagen. Owner kann Eintraege aendern.</p><div id='alpenGuideList'></div>";
    if (isOwner()) {
      html += "<div class='alpen-ai'><input id='gTitle' placeholder='Grund'><input id='gDur' placeholder='Dauer' style='max-width:90px'><select id='gUnit'><option value='minutes'>Minuten</option><option value='hours' selected>Stunden</option><option value='days'>Tage</option></select><input id='gNote' placeholder='Hinweis'><button class='btn' type='button' id='gAdd'>Eintrag</button></div>";
    }
    box.innerHTML = html;
    tab.appendChild(box);
    var tog = document.getElementById("alpenSoundToggle");
    if (tog) tog.onchange = function () { try { localStorage.setItem("alpenHelpSound", tog.checked ? "on" : "off"); } catch (e) {} };
    var go = document.getElementById("alpenAiGo");
    if (go) go.onclick = runAi;
    var add = document.getElementById("gAdd");
    if (add) add.onclick = addGuide;
  }
  function loadGuide(cb) {
    if (!window.db) return;
    db.ref("punishmentGuide").once("value").then(function (snap) {
      var data = snap.val();
      if (!data) return db.ref("punishmentGuide").set(DEFAULT_GUIDE).then(function () { cb(DEFAULT_GUIDE); });
      cb(data);
    });
  }
  function renderGuide(data) {
    var el = document.getElementById("alpenGuideList");
    if (!el) return;
    var items = Object.entries(data || {}).map(function (p) { return Object.assign({ id: p[0] }, p[1] || {}); }).filter(function (it) { return it.active !== false; });
    el.innerHTML = items.map(function (it) {
      var del = isOwner() ? " <button class='btn btn-ghost btn-sm' type='button' onclick=\"alpenDelGuide('" + it.id + "')\">Loeschen</button>" : "";
      return "<div class='alpen-guide-item'><b>" + escText(it.title) + "</b><div>" + escText(durText(it)) + "</div><div class='meta'>" + escText(it.note || "") + "</div>" + del + "</div>";
    }).join("");
  }
  window.alpenDelGuide = function (id) { if (isOwner() && id) db.ref("punishmentGuide/" + id).remove().then(refreshGuide); };
  function addGuide() {
    if (!isOwner()) return;
    var title = ((document.getElementById("gTitle") || {}).value || "").trim();
    var duration = Number((document.getElementById("gDur") || {}).value || 0);
    var unit = (document.getElementById("gUnit") || {}).value || "hours";
    var note = (document.getElementById("gNote") || {}).value || "";
    if (title.length < 2 || !duration) return;
    db.ref("punishmentGuide/g" + Date.now().toString(36)).set({ title: title, duration: duration, unit: unit, note: note, stack: false, active: true }).then(refreshGuide);
  }
  function refreshGuide() { loadGuide(renderGuide); }
  function runAi() {
    var q = ((document.getElementById("alpenAiQ") || {}).value || "").toLowerCase();
    var out = document.getElementById("alpenAiOut");
    if (!out) return;
    loadGuide(function (guide) {
      var hit = null;
      Object.keys(guide || {}).forEach(function (k) {
        var it = guide[k];
        var blob = ((it.title || "") + " " + (it.note || "") + " " + k).toLowerCase();
        if (blob.indexOf(q) !== -1) hit = it;
      });
      if (/beleidig/.test(q)) hit = hit || guide.insult;
      if (/spam/.test(q)) hit = hit || guide.spam;
      if (/grief/.test(q)) hit = hit || guide.grief;
      if (/cheat|hack/.test(q)) hit = hit || guide.cheat;
      if (hit) out.innerHTML = "<strong>" + escText(hit.title) + "</strong><div>" + escText(durText(hit)) + "</div><div>" + escText(hit.note || "") + "</div>";
      else out.textContent = "Steht nicht im Leitfaden, Owner fragen.";
    });
  }
  function boot() {
    showVersion();
    injectCss();
    pruneRoleUi();
    ensureHelpExtras();
    refreshGuide();
  }
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
  setTimeout(boot, 2500);
  setInterval(pruneRoleUi, 3000);
})();
