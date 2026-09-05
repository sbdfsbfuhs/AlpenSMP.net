/* AlpenSMP Team-Management – hängt am bestehenden Staff Center, ersetzt nichts. */
(function () {
  if (window.__alpenTM) return;
  window.__alpenTM = true;

  var PERMS = [
    { g: "Team", items: [
      ["team.view", "Team ansehen"],
      ["team.edit", "Mitglieder bearbeiten"],
      ["team.create", "Mitglieder erstellen"],
      ["team.remove", "Mitglieder entfernen"],
      ["roles.view", "Rollen ansehen"],
      ["roles.edit", "Rollen bearbeiten"]
    ]},
    { g: "Moderation", items: [
      ["mod.bans.create", "Bans erstellen"],
      ["mod.bans.archive", "Bans archivieren"],
      ["mod.warns.create", "Warnungen erstellen"],
      ["mod.help.reply", "Hilfe-Anfragen beantworten"]
    ]},
    { g: "Commands", items: [
      ["commands.view", "Commands sehen"],
      ["commands.manage", "Commands verwalten"]
    ]},
    { g: "Regelwerk", items: [
      ["rules.view", "Regeln ansehen"],
      ["rules.manage", "Regelwerk bearbeiten"]
    ]},
    { g: "Website", items: [
      ["web.view", "Website ansehen"],
      ["web.edit", "Website-Einstellungen"],
      ["web.stats", "Spielerzahlen bearbeiten"],
      ["web.status", "Statusmeldung ändern"]
    ]},
    { g: "Community", items: [
      ["community.reviews", "Rezensionen moderieren"],
      ["community.images", "Screenshots moderieren"]
    ]},
    { g: "Organisation", items: [
      ["org.notes", "Notizen verwalten"],
      ["org.tasks", "Aufgaben verwalten"],
      ["org.announce", "Ankündigungen senden"],
      ["org.activity", "Protokoll ansehen"],
      ["org.instant", "Sofortmeldung senden"],
      ["org.absences", "Abwesenheiten"]
    ]}
  ];

  var SIMPLE = [
    ["warns", "Warnungen", ["mod.warns.create"]],
    ["help", "Hilfe bearbeiten", ["mod.help.reply"]],
    ["bans", "Bans", ["mod.bans.create", "mod.bans.archive"]],
    ["members", "User verwalten", ["team.view", "team.edit", "team.create", "team.remove"]],
    ["commands", "Commands verwalten", ["commands.view", "commands.manage"]],
    ["rules", "Regelwerk bearbeiten", ["rules.view", "rules.manage"]],
    ["announce", "Ankündigungen senden", ["org.announce"]],
    ["instant", "Sofortmeldungen", ["org.instant"]],
    ["tasks", "Aufgaben verwalten", ["org.tasks"]],
    ["web", "Webseite verwalten", ["web.view", "web.edit", "web.status", "web.stats"]],
    ["community", "Community moderieren", ["community.reviews", "community.images"]],
    ["notes", "Notizen verwalten", ["org.notes"]]
  ];

  var ROLE_ICON = { owner: "👑", admin: "🛡️", moderator: "🔨", helper: "🟢", developer: "🔧", builder: "🧱" };

  function allPermTrue() {
    var o = {};
    PERMS.forEach(function (g) { g.items.forEach(function (it) { o[it[0]] = true; }); });
    return o;
  }
  function pick() {
    var o = {}, keys = arguments;
    PERMS.forEach(function (g) { g.items.forEach(function (it) { o[it[0]] = false; }); });
    for (var i = 0; i < keys.length; i++) o[keys[i]] = true;
    return o;
  }

  var DEFAULT_ROLES = {
    owner: { name: "Owner", desc: "Vollzugriff", color: "#e53935", priority: 100, locked: true, perms: allPermTrue() },
    admin: { name: "Admin", desc: "Moderation, Support, Verwaltung", color: "#f97316", priority: 80, perms: (function () {
      var p = allPermTrue(); p["roles.edit"] = false; p["rules.manage"] = false; return p;
    })() },
    moderator: { name: "Moderator", desc: "Moderation und Support", color: "#38bdf8", priority: 60, perms: pick(
      "team.view", "mod.bans.create", "mod.bans.archive", "mod.warns.create", "mod.help.reply",
      "commands.view", "web.status", "community.reviews", "community.images",
      "org.notes", "org.tasks", "org.announce", "org.absences"
    ) },
    helper: { name: "Helper", desc: "Support und erlaubte Commands", color: "#34d399", priority: 40, perms: pick(
      "team.view", "mod.help.reply", "commands.view", "web.status", "org.notes", "org.tasks", "org.absences"
    ) },
    builder: { name: "Builder", desc: "Bauen, Notizen, Aufgaben", color: "#a78bfa", priority: 30, perms: pick(
      "team.view", "commands.view", "org.notes", "org.tasks", "org.absences"
    ) },
    developer: { name: "Developer", desc: "Technische Funktionen", color: "#22d3ee", priority: 50, perms: pick(
      "team.view", "commands.view", "web.view", "web.status", "org.notes", "org.tasks", "org.activity", "org.absences"
    ) }
  };

  var rolesCache = {};
  var usersCache = {};
  var announcementsCache = {};
  var readsCache = {};
  var tasksCache = {};
  var notesCache = {};
  var activityCache = {};
  var presenceCache = {};
  var absencesCache = {};
  var commandsCache = {};
  var notifReads = {};
  var tmSub = "dash";
  var listenersOn = false;
  var popupOpen = false;
  var previewRole = null;
  var openRoleId = null;
  var logFilter = "all";
  var cmdFilter = "";
  var searchOpen = false;
  var bellOpen = false;
  var prefs = { ann: true, tasks: true, help: true, instant: true, compact: false, anim: true };

  try {
    var savedPrefs = JSON.parse(localStorage.getItem("alpen_tm_prefs") || "null");
    if (savedPrefs) prefs = Object.assign(prefs, savedPrefs);
  } catch (err) {}

  function ownerName() { return typeof OWNER_USER === "string" ? OWNER_USER : "owner"; }
  function isHardOwner() { return !!(currentUser && currentUser.username === ownerName()); }
  function isOwnerRole() { return isHardOwner() || !!(currentUser && currentUser.role === "owner"); }
  function roleObj(id) {
    return (rolesCache && rolesCache[id]) || DEFAULT_ROLES[id] || { name: id || "–", color: "#94a3b8", priority: 0, perms: {} };
  }
  function uiRole() {
    if (previewRole && isHardOwner()) return previewRole;
    return currentUser && currentUser.role;
  }
  function hasPerm(key) {
    if (!currentUser) return false;
    var role = uiRole();
    if (!role) return false;
    if (role === "owner") return true;
    var r = roleObj(role);
    return !!(r.perms && r.perms[key]);
  }
  function assertPerm(key) {
    if (!currentUser) { toast("Nicht angemeldet"); return Promise.reject(new Error("auth")); }
    if (currentUser.username === ownerName()) return Promise.resolve(true);
    return db.ref("staffUsers/" + currentUser.username).once("value").then(function (snap) {
      var data = snap.val();
      if (!data) { toast("Account nicht gefunden"); return Promise.reject(new Error("missing")); }
      if (data.disabled) { toast("Account deaktiviert"); doLogout(); return Promise.reject(new Error("disabled")); }
      var role = data.role || "helper";
      if (role === "owner" && data.ownerUntil && Date.now() > data.ownerUntil) {
        role = "admin";
        db.ref("staffUsers/" + currentUser.username).update({ role: "admin" });
      }
      currentUser.role = role;
      try { sessionStorage.setItem("alpensmp_staff_user", JSON.stringify(currentUser)); } catch (err) {}
      if (role === "owner") return true;
      var r = roleObj(role);
      if (!(r.perms && r.perms[key])) { toast("Keine Berechtigung"); return Promise.reject(new Error("perm")); }
      return true;
    });
  }
  window.tmHasPerm = hasPerm;
  window.tmAssertPerm = assertPerm;

  function logAct(action, target) {
    if (!currentUser) return;
    db.ref("staffActivity").push({
      by: currentUser.username,
      role: currentUser.role || "",
      action: action,
      target: target || "",
      ts: Date.now()
    });
  }
  function fmt(ts) {
    if (typeof formatDate === "function") return formatDate(ts);
    if (!ts) return "–";
    return new Date(ts).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  }
  function fmtLong(ts) {
    if (!ts) return "–";
    return new Date(ts).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  function e(s) { return typeof esc === "function" ? esc(String(s == null ? "" : s)) : String(s == null ? "" : s); }
  function randPw() { return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6); }
  function safeId(s) { return String(s || "").replace(/[^a-zA-Z0-9._-]/g, ""); }
  function savePrefs() { try { localStorage.setItem("alpen_tm_prefs", JSON.stringify(prefs)); } catch (err) {} }
  function iconFor(id) { return ROLE_ICON[id] || "●"; }
  function daysSince(ts) {
    if (!ts) return null;
    return Math.floor((Date.now() - ts) / 86400000);
  }

  function injectCss() {
    if (document.getElementById("tmCss")) return;
    var s = document.createElement("style");
    s.id = "tmCss";
    s.textContent = [
      "html,body,#app{overflow-x:hidden}",
      ".item,.card,p,.meta,.name,.desc{overflow-wrap:anywhere;word-break:break-word}",
      ".item{flex-wrap:wrap;min-width:0}.item>div{min-width:0}",
      ".tm-kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin-bottom:16px}",
      "@media(max-width:1100px){.tm-kpis{grid-template-columns:repeat(3,1fr)}}",
      "@media(max-width:700px){.tm-kpis{grid-template-columns:repeat(2,1fr)}}",
      ".tm-kpi{background:rgba(0,0,0,.28);border:1px solid var(--border);border-radius:12px;padding:12px}",
      ".tm-kpi b{display:block;font-size:1.35rem;color:#fda4af}",
      ".tm-kpi span{color:var(--muted);font-size:.78rem}",
      ".tm-sub{display:flex;gap:8px;flex-wrap:nowrap;margin:0 0 16px;align-items:center;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:4px}",
      ".tm-sub .tab,.tm-sub .btn{flex:0 0 auto}",
      ".tm-prio-info{color:#34d399}.tm-prio-important{color:#f59e0b}.tm-prio-urgent{color:#f87171}",
      ".tm-modal{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:4000;display:none;align-items:center;justify-content:center;padding:20px}",
      ".tm-modal.show{display:flex}",
      ".tm-modal .box{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:26px;max-width:560px;width:100%;max-height:86vh;overflow:auto;animation:fadeUp .35s ease}",
      ".tm-modal.urgent .box{border-color:rgba(239,68,68,.7);box-shadow:0 0 40px rgba(239,68,68,.35)}",
      ".tm-flash{position:absolute;inset:0;pointer-events:none;border-radius:18px;box-shadow:inset 0 0 80px rgba(239,68,68,.25);animation:tmPulse 1.4s infinite}",
      "@keyframes tmPulse{0%,100%{opacity:.35}50%{opacity:.9}}",
      ".perm-grid{display:grid;gap:6px;margin:8px 0 14px}",
      ".perm-g{font-size:.78rem;color:var(--muted);margin-top:10px;text-transform:uppercase;letter-spacing:.06em}",
      ".switch{display:flex;align-items:center;gap:8px;font-size:.9rem}",
      ".dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px}",
      ".tm-instant{background:linear-gradient(135deg,#7f1d1d,#ef4444)!important;box-shadow:0 0 18px rgba(239,68,68,.4);color:#fff!important;border:none!important}",
      ".tm-instant:hover{filter:brightness(1.08)}",
      ".role-pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:.78rem;font-weight:700;margin-left:6px}",
      "#tmNoteExtras input,#tmNoteExtras select{margin-bottom:11px}",
      ".tm-preview-bar{background:rgba(245,158,11,.14);border:1px solid rgba(245,158,11,.4);color:#fde68a;padding:10px 16px;display:none;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;position:sticky;top:64px;z-index:90}",
      ".tm-preview-bar.show{display:flex}",
      ".tm-nav-tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
      ".tm-bell,.tm-search-btn{position:relative;background:transparent;border:1px solid var(--border);color:var(--text);width:40px;height:40px;border-radius:10px;cursor:pointer}",
      ".tm-drop{position:absolute;right:0;top:46px;width:min(360px,calc(100vw - 24px));background:var(--card);border:1px solid var(--border);border-radius:14px;padding:12px;z-index:200;max-height:70vh;overflow:auto;box-shadow:0 16px 40px rgba(0,0,0,.45)}",
      ".tm-hint{border-left:3px solid #f59e0b;padding:10px 12px;margin:6px 0;background:rgba(245,158,11,.08);border-radius:8px;font-size:.9rem}",
      ".tm-hint.ok{border-left-color:#34d399;background:rgba(52,211,153,.08)}",
      ".tm-hint.bad{border-left-color:#ef4444;background:rgba(239,68,68,.1)}",
      ".tm-read-box{background:rgba(0,0,0,.22);border:1px solid var(--border);border-radius:10px;padding:10px;margin-top:8px;font-size:.85rem}",
      ".cmd-icons{letter-spacing:2px;font-size:1rem}",
      "body.tm-compact .card{padding:16px}",
      "body.tm-compact .tm-kpi{padding:8px}",
      "body.tm-noanim *,body.tm-noanim *::before,body.tm-noanim *::after{animation:none!important;transition:none!important}",
      "#usersTabBtn{display:none!important}",
      ".tm-role-card{margin-bottom:10px}",
      ".tm-role-head{display:flex;justify-content:space-between;gap:8px;align-items:center;cursor:pointer;flex-wrap:wrap}",
      "@media(max-width:700px){.tm-nav-tools{width:100%}.navbar{align-items:flex-start}.form-row>*{min-width:100%}}"
    ].join("");
    document.head.appendChild(s);
  }

  function injectUi() {
    var tabs = document.querySelector(".tabs");
    if (tabs && !document.getElementById("teamTabBtn")) {
      tabs.querySelectorAll(":scope > .tab").forEach(function (btn) {
        if (btn.getAttribute("data-tab")) return;
        var oc = btn.getAttribute("onclick") || "";
        var m = oc.match(/showTab\('([^']+)'\)/);
        if (m) btn.setAttribute("data-tab", m[1]);
      });
      var b = document.createElement("button");
      b.className = "tab";
      b.id = "teamTabBtn";
      b.type = "button";
      b.style.display = "none";
      b.setAttribute("data-tab", "team");
      b.onclick = function () { showTab("team"); };
      b.innerHTML = "👑 Team <span class=\"badge\" id=\"teamBadge\" style=\"display:none\">0</span>";
      tabs.appendChild(b);
      var b2 = document.createElement("button");
      b2.className = "tab";
      b2.id = "myTasksTabBtn";
      b2.type = "button";
      b2.setAttribute("data-tab", "mytasks");
      b2.onclick = function () { showTab("mytasks"); };
      b2.innerHTML = "✅ Aufgaben <span class=\"badge\" id=\"myTasksBadge\" style=\"display:none\">0</span>";
      tabs.appendChild(b2);
    }
    if (!document.getElementById("tab-team")) {
      var wrapEl = document.querySelector(".container");
      if (wrapEl) {
        var d = document.createElement("div");
        d.id = "tab-team";
        d.className = "hidden";
        d.innerHTML = teamHtml();
        wrapEl.appendChild(d);
        var d2 = document.createElement("div");
        d2.id = "tab-mytasks";
        d2.className = "hidden";
        d2.innerHTML = "<div class=\"card\"><h2>✅ Meine Aufgaben</h2><p class=\"desc\">Dir zugewiesen oder von dir übernommen.</p><div class=\"list\" id=\"myTasksList\"></div></div>";
        wrapEl.appendChild(d2);
      }
    }
    if (!document.getElementById("tmPopup")) {
      var m = document.createElement("div");
      m.id = "tmPopup";
      m.className = "tm-modal";
      m.innerHTML = "<div class=\"box\" style=\"position:relative\"><div class=\"tm-flash\" id=\"tmPopupFlash\" style=\"display:none\"></div><div id=\"tmPopupPrio\" class=\"desc\"></div><h2 id=\"tmPopupTitle\"></h2><p id=\"tmPopupBody\" style=\"color:var(--muted);white-space:pre-wrap;margin:12px 0 16px\"></p><div class=\"meta\" id=\"tmPopupMeta\" style=\"color:var(--muted);font-size:.85rem;margin-bottom:16px\"></div><button class=\"btn\" style=\"width:100%\" onclick=\"tmMarkRead()\">✓ Gelesen</button></div>";
      document.body.appendChild(m);
    }
    if (!document.getElementById("tmConfirm")) {
      var c = document.createElement("div");
      c.id = "tmConfirm";
      c.className = "tm-modal";
      c.innerHTML = "<div class=\"box\"><h2>🚨 Sofortmeldung</h2><p class=\"desc\">Diese Nachricht wird an das gesamte Team gesendet. Fortfahren?</p><div id=\"tmConfirmPreview\" style=\"margin:12px 0;padding:12px;border:1px solid var(--border);border-radius:10px\"></div><div style=\"display:flex;gap:8px;flex-wrap:wrap\"><button class=\"btn tm-instant\" onclick=\"tmConfirmInstant()\">Senden</button><button class=\"btn btn-ghost\" onclick=\"document.getElementById('tmConfirm').classList.remove('show')\">Abbrechen</button></div></div>";
      document.body.appendChild(c);
    }
    injectNav();
    injectPreviewBar();
    enhanceNotesCard();
    enhanceSettings();
    enhanceCmdForm();
    addInstantButton();
    hideLiveStand();
    applyPrefsClass();
  }

  function teamHtml() {
    return [
      "<div class=\"tm-kpis\">",
      "<div class=\"tm-kpi\"><span>👥 Teammitglieder</span><b id=\"tmKpiUsers\">–</b></div>",
      "<div class=\"tm-kpi\"><span>🟢 Online</span><b id=\"tmKpiOnline\">–</b></div>",
      "<div class=\"tm-kpi\"><span>🔔 Ungelesene Meldungen</span><b id=\"tmKpiAnn\">–</b></div>",
      "<div class=\"tm-kpi\"><span>📋 Offene Aufgaben</span><b id=\"tmKpiTasks\">–</b></div>",
      "<div class=\"tm-kpi\"><span>🏖️ Abwesend</span><b id=\"tmKpiAway\">–</b></div>",
      "<div class=\"tm-kpi\"><span>⚠️ Hinweise</span><b id=\"tmKpiHints\">–</b></div>",
      "</div>",
      "<div class=\"tm-sub\">",
      "<button class=\"tab active\" type=\"button\" onclick=\"tmShowSub('dash')\">Übersicht</button>",
      "<button class=\"tab\" type=\"button\" onclick=\"tmShowSub('members')\">👥 Mitglieder</button>",
      "<button class=\"tab\" type=\"button\" onclick=\"tmShowSub('roles')\">👑 Rollen</button>",
      "<button class=\"tab\" type=\"button\" onclick=\"tmShowSub('ann')\">📢 Ankündigungen</button>",
      "<button class=\"tab\" type=\"button\" onclick=\"tmShowSub('tasks')\">📋 Aufgaben</button>",
      "<button class=\"tab\" type=\"button\" onclick=\"tmShowSub('away')\">🏖️ Abwesenheiten</button>",
      "<button class=\"tab\" type=\"button\" onclick=\"tmShowSub('notes')\">📝 Notizen</button>",
      "<button class=\"tab\" type=\"button\" onclick=\"tmShowSub('log')\">📋 Protokoll</button>",
      "<button class=\"btn tm-instant btn-sm\" type=\"button\" onclick=\"tmStartInstant()\">🚨 SOFORTMELDUNG</button>",
      "</div>",
      "<div id=\"tmSubDash\"></div>",
      "<div id=\"tmSubMembers\" class=\"hidden\"></div>",
      "<div id=\"tmSubRoles\" class=\"hidden\"></div>",
      "<div id=\"tmSubAnn\" class=\"hidden\"></div>",
      "<div id=\"tmSubTasks\" class=\"hidden\"></div>",
      "<div id=\"tmSubAway\" class=\"hidden\"></div>",
      "<div id=\"tmSubNotes\" class=\"hidden\"></div>",
      "<div id=\"tmSubLog\" class=\"hidden\"></div>"
    ].join("");
  }

  function injectNav() {
    if (document.getElementById("tmNavTools")) return;
    var bar = document.querySelector(".navbar > div");
    if (!bar) return;
    var tools = document.createElement("div");
    tools.id = "tmNavTools";
    tools.className = "tm-nav-tools";
    tools.innerHTML = [
      '<select id="tmPreviewSelect" style="display:none;width:auto;margin:0;padding:8px 10px" onchange="tmSetPreview(this.value)" title="Ansicht wechseln">',
      '<option value="">👑 Owner-Ansicht</option></select>',
      '<div style="position:relative"><button type="button" class="tm-search-btn" onclick="tmToggleSearch()" title="Suche">🔎</button>',
      '<div id="tmSearchDrop" class="tm-drop" style="display:none"><input id="tmGlobalSearch" placeholder="Mitglieder, Commands, Aufgaben…" oninput="tmRunSearch()"><div id="tmSearchResults" class="list"></div></div></div>',
      '<div style="position:relative"><button type="button" class="tm-bell" onclick="tmToggleBell()" title="Benachrichtigungen">🔔<span class="badge" id="tmBellBadge" style="display:none">0</span></button>',
      '<div id="tmBellDrop" class="tm-drop" style="display:none"></div></div>'
    ].join("");
    bar.insertBefore(tools, bar.firstChild);
    document.addEventListener("click", function (ev) {
      if (!ev.target.closest("#tmNavTools")) {
        searchOpen = false; bellOpen = false;
        var sd = document.getElementById("tmSearchDrop"); if (sd) sd.style.display = "none";
        var bd = document.getElementById("tmBellDrop"); if (bd) bd.style.display = "none";
      }
    });
  }

  function injectPreviewBar() {
    if (document.getElementById("tmPreviewBar")) return;
    var app = document.getElementById("app");
    if (!app) return;
    var bar = document.createElement("div");
    bar.id = "tmPreviewBar";
    bar.className = "tm-preview-bar";
    bar.innerHTML = '<span>👁️ Vorschau: <strong id="tmPreviewName">Helper</strong> — Du siehst aktuell, was diese Rolle sehen und benutzen kann. Deine Owner-Rechte bleiben erhalten.</span><button class="btn btn-sm" type="button" onclick="tmClearPreview()">↩️ Zurück zur Owner-Ansicht</button>';
    var nav = app.querySelector(".navbar");
    if (nav && nav.nextSibling) app.insertBefore(bar, nav.nextSibling);
    else app.insertBefore(bar, app.firstChild);
  }

  function enhanceNotesCard() {
    var ta = document.getElementById("noteText");
    if (!ta || document.getElementById("noteTitle")) return;
    var box = ta.parentNode;
    var extra = document.createElement("div");
    extra.id = "tmNoteExtras";
    extra.innerHTML = [
      "<input type=\"text\" id=\"noteTitle\" placeholder=\"Titel\">",
      "<div class=\"form-row\">",
      "<select id=\"notePrio\"><option value=\"info\">🟢 Information</option><option value=\"important\">🟡 Wichtig</option><option value=\"urgent\">🔴 Dringend</option></select>",
      "<select id=\"noteAssign\"><option value=\"\">Niemandem zugewiesen</option></select>",
      "</div>",
      "<input type=\"search\" id=\"noteSearch\" class=\"search\" placeholder=\"Notizen suchen…\" oninput=\"tmRenderNotesModeration()\">"
    ].join("");
    box.insertBefore(extra, ta);
  }

  function enhanceSettings() {
    var tab = document.getElementById("tab-settings");
    if (!tab || document.getElementById("tmSettingsExtra")) return;
    var extra = document.createElement("div");
    extra.id = "tmSettingsExtra";
    extra.innerHTML = [
      '<div class="card" style="max-width:640px;margin-top:18px"><h2>👤 Mein Konto</h2><div id="tmAccountBox" class="desc"></div></div>',
      '<div class="card" style="max-width:640px;margin-top:18px"><h2>🔔 Benachrichtigungen</h2>',
      '<label class="switch"><input type="checkbox" id="prefAnn"> Ankündigungen</label>',
      '<label class="switch"><input type="checkbox" id="prefTasks"> Aufgaben</label>',
      '<label class="switch"><input type="checkbox" id="prefHelp"> Hilfe</label>',
      '<label class="switch"><input type="checkbox" id="prefInstant"> Sofortmeldungen</label></div>',
      '<div class="card" style="max-width:640px;margin-top:18px"><h2>🎨 Darstellung</h2>',
      '<label class="switch"><input type="checkbox" id="prefCompact"> Kompakte Ansicht</label>',
      '<label class="switch"><input type="checkbox" id="prefAnim"> Animationen</label></div>',
      '<div class="card" style="max-width:640px;margin-top:18px"><h2>🔐 Sicherheit</h2>',
      '<p class="desc" id="tmSecBox">Aktive Sitzung in diesem Browser.</p>',
      '<button class="btn btn-ghost" type="button" onclick="doLogout()">Abmelden</button></div>'
    ].join("");
    tab.appendChild(extra);
    ["prefAnn", "prefTasks", "prefHelp", "prefInstant", "prefCompact", "prefAnim"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var map = { prefAnn: "ann", prefTasks: "tasks", prefHelp: "help", prefInstant: "instant", prefCompact: "compact", prefAnim: "anim" };
      el.checked = !!prefs[map[id]];
      if (id === "prefAnim") el.checked = prefs.anim !== false;
      el.onchange = function () {
        prefs[map[id]] = el.checked;
        savePrefs();
        applyPrefsClass();
      };
    });
  }

  function paintSettings() {
    var box = document.getElementById("tmAccountBox");
    if (!box || !currentUser) return;
    var u = usersCache[currentUser.username] || {};
    var ro = roleObj(currentUser.role);
    box.innerHTML = "Benutzername: <strong>" + e(currentUser.username) + "</strong><br>Rolle: " + e(ro.name || currentUser.role) +
      "<br>Letzter Login: " + e(fmt(u.lastLogin)) + "<br>Letzte Aktivität: " + e(fmt((presenceCache[currentUser.username] || {}).lastSeen || u.lastLogin));
    var sec = document.getElementById("tmSecBox");
    if (sec) sec.textContent = "Aktive Sitzung · " + currentUser.username + " · letzter Login " + fmt(u.lastLogin);
  }

  function enhanceCmdForm() {
    var box = document.getElementById("commandsOwnerBox");
    if (!box || document.getElementById("tmCmdRoles")) return;
    var extra = document.createElement("div");
    extra.id = "tmCmdExtra";
    extra.innerHTML = '<input type="text" id="cmdCategory" placeholder="Kategorie (z.B. Teleport, Moderation)">' +
      '<div id="tmCmdRoles" class="perm-grid"></div>';
    box.insertBefore(extra, document.getElementById("cmdSaveBtn"));
    var search = document.createElement("input");
    search.type = "search";
    search.id = "cmdSearch";
    search.className = "search";
    search.placeholder = "Command suchen…";
    search.oninput = function () { cmdFilter = search.value; loadCommands(); };
    var card = box.parentNode;
    if (card) card.insertBefore(search, box);
  }

  function paintCmdRoles(selected) {
    var el = document.getElementById("tmCmdRoles");
    if (!el) return;
    selected = selected || {};
    var merged = Object.assign({}, DEFAULT_ROLES, rolesCache);
    el.innerHTML = '<div class="perm-g">Berechtigte Rollen</div>' + Object.keys(merged).sort(function (a, b) {
      return (roleObj(b).priority || 0) - (roleObj(a).priority || 0);
    }).map(function (id) {
      var on = selected[id] !== false;
      return '<label class="switch"><input type="checkbox" data-cmd-role="' + e(id) + '"' + (on ? " checked" : "") + "> " +
        iconFor(id) + " " + e(roleObj(id).name || id) + "</label>";
    }).join("");
  }

  function addInstantButton() {
    var panic = document.querySelector(".btn-panic");
    if (!panic || document.getElementById("tmInstantTop")) return;
    var btn = document.createElement("button");
    btn.id = "tmInstantTop";
    btn.className = "btn tm-instant";
    btn.style.marginLeft = "10px";
    btn.style.display = "none";
    btn.type = "button";
    btn.textContent = "🚨 SOFORTMELDUNG";
    btn.onclick = function () { tmStartInstant(); };
    panic.parentNode.appendChild(btn);
  }

  function hideLiveStand() {
    var tab = document.getElementById("tab-website");
    if (!tab) return;
    tab.querySelectorAll("h2").forEach(function (h) {
      if (/Live-Stand/i.test(h.textContent || "")) {
        var card = h.closest(".card");
        if (card) card.style.display = "none";
      }
    });
  }

  function applyPrefsClass() {
    document.body.classList.toggle("tm-compact", !!prefs.compact);
    document.body.classList.toggle("tm-noanim", prefs.anim === false);
  }

  function seedRoles() {
    if (!isHardOwner()) return;
    db.ref("staffRoles").once("value").then(function (snap) {
      if (snap.exists()) return;
      db.ref("staffRoles").set(DEFAULT_ROLES);
    });
  }

  function guardSession() {
    if (!currentUser) return;
    if (isHardOwner()) return;
    db.ref("staffUsers/" + currentUser.username).once("value").then(function (snap) {
      var data = snap.val();
      if (!data) { doLogout(); return; }
      if (data.disabled) { toast("Account deaktiviert"); doLogout(); }
    });
  }

  function startTm() {
    if (listenersOn || !currentUser) return;
    listenersOn = true;
    seedRoles();
    guardSession();
    db.ref("staffRoles").on("value", function (s) { rolesCache = s.val() || {}; fillPreviewSelect(); applyChrome(); tmRefresh(); });
    db.ref("staffUsers").on("value", function (s) { usersCache = s.val() || {}; fillAssignSelects(); tmRefresh(); paintSettings(); });
    db.ref("staffAnnouncements").on("value", function (s) {
      announcementsCache = s.val() || {};
      tmRefresh();
      tmMaybePopup();
      tmPaintBell();
    });
    db.ref("staffAnnouncementReads").on("value", function (s) { readsCache = s.val() || {}; tmRefresh(); tmPaintBell(); });
    db.ref("staffTasks").on("value", function (s) { tasksCache = s.val() || {}; tmRefresh(); tmRenderMyTasks(); tmBadges(); tmPaintBell(); });
    db.ref("notes").on("value", function (s) { notesCache = s.val() || {}; tmRenderNotesModeration(); if (tmSub === "notes") tmRenderNotes(); });
    db.ref("staffActivity").limitToLast(160).on("value", function (s) { activityCache = s.val() || {}; if (tmSub === "dash" || tmSub === "log") tmRefresh(); });
    db.ref("presence").on("value", function (s) { presenceCache = s.val() || {}; tmKpis(); tmPaintBell(); });
    db.ref("staffAbsences").on("value", function (s) { absencesCache = s.val() || {}; tmRefresh(); });
    db.ref("commands").on("value", function (s) { commandsCache = s.val() || {}; });
    if (currentUser) {
      db.ref("staffNotifications/" + currentUser.username).on("value", function (s) {
        notifReads = s.val() || {};
        tmPaintBell();
      });
    }
  }

  function fillPreviewSelect() {
    var sel = document.getElementById("tmPreviewSelect");
    if (!sel) return;
    sel.style.display = isHardOwner() ? "inline-block" : "none";
    var merged = Object.assign({}, DEFAULT_ROLES, rolesCache);
    var cur = sel.value;
    sel.innerHTML = '<option value="">👑 Owner-Ansicht</option>' + Object.keys(merged).map(function (id) {
      return '<option value="' + e(id) + '">' + iconFor(id) + " " + e(roleObj(id).name || id) + "</option>";
    }).join("");
    sel.value = previewRole || "";
    if (cur && !sel.value) sel.value = "";
  }

  window.tmSetPreview = function (role) {
    if (!isHardOwner()) return;
    previewRole = role || null;
    var bar = document.getElementById("tmPreviewBar");
    if (bar) {
      bar.classList.toggle("show", !!previewRole);
      var n = document.getElementById("tmPreviewName");
      if (n) n.textContent = roleObj(previewRole).name || previewRole || "";
    }
    applyChrome();
    tmRefresh();
    if (typeof loadCommands === "function") loadCommands();
    if (typeof loadHelp === "function") loadHelp();
  };
  window.tmClearPreview = function () {
    previewRole = null;
    var sel = document.getElementById("tmPreviewSelect");
    if (sel) sel.value = "";
    tmSetPreview("");
  };

  function applyChrome() {
    var teamBtn = document.getElementById("teamTabBtn");
    if (teamBtn) teamBtn.style.display = (isOwnerRole() && !previewRole) ? "inline-block" : "none";
    var usersBtn = document.getElementById("usersTabBtn");
    if (usersBtn) usersBtn.style.display = "none";
    var inst = document.getElementById("tmInstantTop");
    if (inst) inst.style.display = hasPerm("org.instant") ? "inline-block" : "none";
    var webBtn = document.getElementById("websiteTabBtn");
    if (webBtn && (hasPerm("web.view") || hasPerm("web.status") || hasPerm("web.stats") || hasPerm("web.edit"))) {
      webBtn.style.display = "inline-block";
    } else if (webBtn && !hasPerm("web.view") && !hasPerm("web.status")) {
      webBtn.style.display = "none";
    }
    var tab = document.getElementById("tab-website");
    if (tab) {
      var grid = tab.querySelector(".owner-grid");
      if (grid) grid.style.display = (hasPerm("web.stats") || hasPerm("web.edit")) ? "" : "none";
      var cards = tab.querySelectorAll(":scope > .card");
      if (cards.length > 1) cards[cards.length - 1].style.display = hasPerm("web.edit") ? "" : "none";
    }
    var cmdBox = document.getElementById("commandsOwnerBox");
    if (cmdBox) cmdBox.style.display = hasPerm("commands.manage") ? "block" : "none";
    var rulesBtn = document.getElementById("rulesTabBtn");
    if (rulesBtn) rulesBtn.style.display = hasPerm("rules.manage") ? "inline-block" : "none";
    hideLiveStand();
    fillPreviewSelect();
  }

  var SUBS = ["dash", "members", "roles", "ann", "tasks", "away", "notes", "log"];
  window.tmShowSub = function (name) {
    tmSub = name;
    SUBS.forEach(function (n) {
      var el = document.getElementById("tmSub" + n.charAt(0).toUpperCase() + n.slice(1));
      if (el) el.classList.toggle("hidden", n !== name);
    });
    var bar = document.querySelector("#tab-team .tm-sub");
    if (bar) {
      bar.querySelectorAll(".tab").forEach(function (t, i) {
        t.classList.toggle("active", SUBS[i] === name);
      });
    }
    tmRefresh();
  };

  function tmRefresh() {
    tmKpis();
    tmBadges();
    applyChrome();
    if (!document.getElementById("tab-team") || document.getElementById("tab-team").classList.contains("hidden")) {
      tmRenderMyTasks();
      return;
    }
    if (tmSub === "dash") tmRenderDash();
    if (tmSub === "members") tmRenderMembers();
    if (tmSub === "roles") tmRenderRoles();
    if (tmSub === "ann") tmRenderAnn();
    if (tmSub === "tasks") tmRenderTasks();
    if (tmSub === "away") tmRenderAway();
    if (tmSub === "notes") tmRenderNotes();
    if (tmSub === "log") tmRenderLog();
    tmRenderMyTasks();
  }

  function userEntries() {
    return Object.keys(usersCache || {}).map(function (k) {
      var u = Object.assign({}, usersCache[k] || {});
      u._id = k;
      return u;
    });
  }
  function actEntries() {
    return Object.entries(activityCache || {}).map(function (p) {
      return Object.assign({ _id: p[0] }, p[1] || {});
    }).sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
  }
  function onlineCount() {
    return Object.values(presenceCache || {}).filter(function (u) { return u && u.online; }).length;
  }
  function unreadFor(user) {
    var n = 0, now = Date.now();
    Object.keys(announcementsCache || {}).forEach(function (id) {
      var a = announcementsCache[id];
      if (!a) return;
      if (a.expiresAt && a.expiresAt < now) return;
      if (a.roles && a.roles.length && a.roles.indexOf((usersCache[user] || {}).role || "") < 0 && user !== ownerName()) return;
      if (readsCache[id] && readsCache[id][user]) return;
      n++;
    });
    return n;
  }
  function openTasksCount() {
    return Object.values(tasksCache || {}).filter(function (t) {
      return t && t.status !== "done" && t.status !== "archived" && !t.archived;
    }).length;
  }
  function currentAbsence(username) {
    var now = Date.now();
    var hit = null;
    Object.values(absencesCache || {}).forEach(function (a) {
      if (!a || a.user !== username) return;
      if (a.from && a.to && now >= a.from && now <= a.to) hit = a;
    });
    return hit;
  }
  function awayCount() {
    var n = 0;
    userEntries().forEach(function (u) { if (currentAbsence(u._id)) n++; });
    return n;
  }

  function buildHints() {
    var hints = [];
    userEntries().forEach(function (u) {
      if (u.disabled) return;
      var last = u.lastLogin || (presenceCache[u._id] && presenceCache[u._id].lastSeen);
      var d = daysSince(last);
      if (d != null && d >= 8) hints.push({ lvl: "warn", text: u._id + " ist seit " + d + " Tagen nicht online." });
    });
    var staff = userEntries().filter(function (u) { return !u.disabled; });
    Object.keys(announcementsCache || {}).forEach(function (id) {
      var a = announcementsCache[id];
      if (!a || a.priority !== "important" && !a.instant && a.priority !== "urgent") return;
      if (a.expiresAt && a.expiresAt < Date.now()) return;
      var unread = staff.filter(function (u) { return !(readsCache[id] && readsCache[id][u._id]); });
      if (unread.length) hints.push({ lvl: "warn", text: unread.length + " Mitglieder haben „" + (a.title || "Ankündigung") + "“ noch nicht gelesen." });
    });
    Object.values(tasksCache || {}).forEach(function (t) {
      if (!t || t.archived || t.status === "done" || t.status === "archived") return;
      if (t.due && t.due < Date.now()) hints.push({ lvl: "bad", text: "Aufgabe „" + (t.title || "") + "“ ist überfällig." });
      else if (t.ts && daysSince(t.ts) >= 5 && (t.status === "open" || !t.status)) {
        hints.push({ lvl: "warn", text: "Eine Aufgabe wartet seit " + daysSince(t.ts) + " Tagen auf Bearbeitung: „" + (t.title || "") + "“." });
      }
    });
    userEntries().forEach(function (u) {
      var a = currentAbsence(u._id);
      if (a) hints.push({ lvl: "warn", text: u._id + " ist aktuell abwesend" + (a.reason ? " (" + a.reason + ")" : "") + "." });
    });
    return hints;
  }

  function tmKpis() {
    var a = document.getElementById("tmKpiUsers");
    if (a) a.textContent = String(userEntries().length);
    var b = document.getElementById("tmKpiOnline");
    if (b) b.textContent = String(onlineCount());
    var c = document.getElementById("tmKpiAnn");
    if (c && currentUser) c.textContent = String(unreadFor(currentUser.username));
    var d = document.getElementById("tmKpiTasks");
    if (d) d.textContent = String(openTasksCount());
    var e1 = document.getElementById("tmKpiAway");
    if (e1) e1.textContent = String(awayCount());
    var h = document.getElementById("tmKpiHints");
    if (h) h.textContent = String(buildHints().length);
  }
  function tmBadges() {
    if (!currentUser) return;
    var n = unreadFor(currentUser.username);
    var tb = document.getElementById("teamBadge");
    if (tb) { tb.style.display = n ? "flex" : "none"; tb.textContent = n; }
    var mine = Object.values(tasksCache || {}).filter(function (t) {
      return t && !t.archived && t.status !== "done" && t.status !== "archived" &&
        (t.assignee === currentUser.username || t.takenBy === currentUser.username);
    }).length;
    var mb = document.getElementById("myTasksBadge");
    if (mb) { mb.style.display = mine ? "flex" : "none"; mb.textContent = mine; }
    tmPaintBell();
  }

  function tmRenderDash() {
    var el = document.getElementById("tmSubDash");
    if (!el) return;
    var hints = buildHints();
    var next = [];
    if (currentUser && unreadFor(currentUser.username)) next.push(unreadFor(currentUser.username) + " ungelesene Ankündigung(en)");
    var myOpen = Object.values(tasksCache || {}).filter(function (t) {
      return t && (t.assignee === currentUser.username || t.takenBy === currentUser.username) && t.status !== "done" && !t.archived;
    });
    if (myOpen.length) next.push(myOpen.length + " offene Aufgabe(n) für dich");
    var acts = actEntries().slice(0, 8);
    var hintHtml = hints.length
      ? hints.map(function (h) { return '<div class="tm-hint ' + (h.lvl === "bad" ? "bad" : "") + '">⚠️ ' + e(h.text) + "</div>"; }).join("")
      : '<div class="tm-hint ok">🟢 Alles okay – keine Hinweise.</div>';
    el.innerHTML = '<div class="card" style="margin-bottom:14px"><h2>🧠 Team-Hinweise</h2>' + hintHtml + "</div>" +
      '<div class="card" style="margin-bottom:14px"><h2>Nächste Schritte</h2>' +
      (next.length ? "<ul style=\"margin-left:18px;color:var(--muted)\">" + next.map(function (x) { return "<li>" + e(x) + "</li>"; }).join("") + "</ul>" : '<div class="empty">Nichts Offenes für dich.</div>') + "</div>" +
      "<div class=\"card\"><h2>Letzte Aktivitäten</h2>" +
      (acts.length ? "<div class=\"list\">" + acts.map(function (x) {
        return "<div class=\"item\"><div><div class=\"name\">" + e(x.by) + "</div><div>" + e(x.action) + (x.target ? " · " + e(x.target) : "") + "</div><div class=\"meta\">" + e(fmt(x.ts)) + "</div></div></div>";
      }).join("") + "</div>" : "<div class=\"empty\">Noch keine Einträge</div>") + "</div>";
  }

  function fillAssignSelects() {
    var html = "<option value=\"\">Niemandem zugewiesen</option><option value=\"all\">👥 Alle</option>" + userEntries().map(function (u) {
      return "<option value=\"" + e(u._id) + "\">" + e(u._id) + "</option>";
    }).join("");
    ["noteAssign", "tmTaskAssignee"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        var cur = el.value;
        el.innerHTML = html;
        el.value = cur;
      }
    });
  }

  function roleSelectHtml(selected) {
    return Object.keys(Object.assign({}, DEFAULT_ROLES, rolesCache)).map(function (id) {
      return "<option value=\"" + e(id) + "\"" + (id === selected ? " selected" : "") + ">" + iconFor(id) + " " + e((roleObj(id).name) || id) + "</option>";
    }).join("");
  }

  function tmRenderMembers() {
    var el = document.getElementById("tmSubMembers");
    if (!el) return;
    if (!hasPerm("team.view")) { el.innerHTML = "<div class=\"card\"><div class=\"empty\">Keine Berechtigung</div></div>"; return; }
    var list = userEntries().map(function (u) {
      var id = safeId(u._id);
      var online = presenceCache[u._id] && presenceCache[u._id].online;
      var last = u.lastLogin || (presenceCache[u._id] && presenceCache[u._id].lastSeen) || 0;
      var ro = roleObj(u.role);
      var locked = u._id === ownerName();
      var abs = currentAbsence(u._id);
      return "<div class=\"item\"><div style=\"flex:1\"><div class=\"name\"><span class=\"dot\" style=\"background:" + (online ? "var(--ok)" : "#64748b") + "\"></span>" +
        e(u._id) + " <span class=\"role-pill\" style=\"background:" + e(ro.color || "#94a3b8") + "22;color:" + e(ro.color || "#94a3b8") + "\">" + iconFor(u.role) + " " + e(ro.name || u.role) + "</span>" +
        (u.disabled ? " · <span style=\"color:var(--warn)\">deaktiviert</span>" : "") +
        (abs ? " · 🏖️ " + e(abs.reason || "Abwesend") : "") + "</div>" +
        "<div class=\"meta\">Status: " + (u.disabled ? "inaktiv" : (online ? "online" : "offline")) +
        " · erstellt " + e(fmt(u.createdAt)) + " von " + e(u.createdBy || "–") +
        " · letzter Login " + e(fmt(last)) +
        (u.ownerUntil ? " · Owner bis " + e(fmt(u.ownerUntil)) : "") + "</div>" +
        (hasPerm("team.edit") && !locked ? ("<div class=\"form-row\" style=\"margin-top:10px\">" +
          "<select id=\"tmrole-" + e(id) + "\">" + roleSelectHtml(u.role) + "</select>" +
          "<input id=\"tmuntil-" + e(id) + "\" placeholder=\"Owner bis (z.B. 7 Tage)\" style=\"max-width:180px\">" +
          "<button class=\"btn btn-sm\" onclick=\"tmSaveMember('" + e(id) + "')\">Speichern</button>" +
          "<button class=\"btn btn-ghost btn-sm\" onclick=\"tmToggleMember('" + e(id) + "'," + (!!u.disabled) + ")\">" + (u.disabled ? "Aktivieren" : "Deaktivieren") + "</button>" +
          "<button class=\"btn btn-ghost btn-sm\" onclick=\"tmResetPw('" + e(id) + "')\">PW reset</button>" +
          (hasPerm("team.remove") ? "<button class=\"btn btn-ghost btn-sm\" onclick=\"tmDeleteMember('" + e(id) + "')\">Löschen</button>" : "") +
          "</div>") : (locked ? "<div class=\"meta\">Owner-Account ist geschützt.</div>" : "")) +
        "</div></div>";
    }).join("");
    el.innerHTML = "<div class=\"card\"><h2>👥 Mitglieder</h2><p class=\"desc\">Alle Team-Accounts an einer Stelle. Passwörter werden nicht mehr im Klartext in der Liste angezeigt.</p>" +
      (hasPerm("team.create") ? "<div class=\"form-row\"><input id=\"tmNewName\" placeholder=\"Benutzername\"><input id=\"tmNewPw\" placeholder=\"Temp. Passwort\"><select id=\"tmNewRole\">" + roleSelectHtml("helper") + "</select></div><input id=\"tmNewUntil\" placeholder=\"Owner bis (optional, z.B. 7 Tage)\"><button class=\"btn\" onclick=\"tmCreateMember()\">+ Account anlegen</button>" : "") +
      "<div class=\"list\">" + (list || "<div class=\"empty\">Keine Accounts</div>") + "</div></div>";
  }

  window.tmCreateMember = function () {
    assertPerm("team.create").then(function () {
      var username = (document.getElementById("tmNewName").value || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
      var tempPw = document.getElementById("tmNewPw").value;
      var role = document.getElementById("tmNewRole").value || "helper";
      var untilStr = ((document.getElementById("tmNewUntil") || {}).value || "").trim();
      if (!username || !tempPw) return toast("Name + Passwort nötig");
      if (username === ownerName()) return toast("Reserviert");
      return db.ref("staffUsers/" + username).once("value").then(function (snap) {
        if (snap.exists()) return toast("Existiert schon");
        var data = { password: tempPw, role: role, mustChangePw: true, createdAt: Date.now(), createdBy: currentUser.username, disabled: false };
        if (role === "owner" && untilStr && typeof parseDuration === "function") data.ownerUntil = parseDuration(untilStr);
        return db.ref("staffUsers/" + username).set(data).then(function () {
          logAct("hat einen Team-Account erstellt", username);
          document.getElementById("tmNewName").value = "";
          document.getElementById("tmNewPw").value = "";
          toast("Account angelegt ✓");
        });
      });
    }).catch(function () {});
  };
  window.tmSaveMember = function (username) {
    username = safeId(username);
    if (username === ownerName()) return toast("Owner ist geschützt");
    assertPerm("team.edit").then(function () {
      var role = document.getElementById("tmrole-" + username).value;
      var untilStr = ((document.getElementById("tmuntil-" + username) || {}).value || "").trim();
      var upd = { role: role };
      if (role === "owner" && untilStr && typeof parseDuration === "function") upd.ownerUntil = parseDuration(untilStr);
      else if (role !== "owner") upd.ownerUntil = null;
      return db.ref("staffUsers/" + username).update(upd).then(function () {
        logAct("hat die Rolle von " + username + " auf " + role + " geändert", username);
        toast("Gespeichert ✓");
      });
    }).catch(function () {});
  };
  window.tmToggleMember = function (username, currentlyDisabled) {
    username = safeId(username);
    if (username === ownerName()) return toast("Owner ist geschützt");
    assertPerm("team.edit").then(function () {
      return db.ref("staffUsers/" + username).update({ disabled: !currentlyDisabled }).then(function () {
        if (!currentlyDisabled) db.ref("presence/" + username).remove();
        logAct((currentlyDisabled ? "hat Account aktiviert" : "hat Account deaktiviert"), username);
        toast(currentlyDisabled ? "Aktiviert" : "Deaktiviert");
      });
    }).catch(function () {});
  };
  window.tmResetPw = function (username) {
    username = safeId(username);
    if (username === ownerName()) return toast("Owner ist geschützt");
    assertPerm("team.edit").then(function () {
      var pw = randPw();
      return db.ref("staffUsers/" + username).update({ password: pw, mustChangePw: true }).then(function () {
        logAct("hat das Passwort zurückgesetzt", username);
        toast("Neues Temp-PW: " + pw);
      });
    }).catch(function () {});
  };
  window.tmDeleteMember = function (username) {
    username = safeId(username);
    assertPerm("team.remove").then(function () {
      if (username === currentUser.username) return toast("Dich selbst nicht löschen");
      if (username === ownerName()) return toast("Owner ist geschützt");
      if (!confirm("\"" + username + "\" wirklich löschen?")) return;
      return db.ref("staffUsers/" + username).remove().then(function () {
        db.ref("presence/" + username).remove();
        logAct("hat einen Team-Account gelöscht", username);
        toast("Gelöscht");
      });
    }).catch(function () {});
  };

  function simpleChecked(perms, keys) {
    return keys.every(function (k) { return perms[k]; });
  }

  function tmRenderRoles() {
    var el = document.getElementById("tmSubRoles");
    if (!el) return;
    if (!hasPerm("roles.view")) { el.innerHTML = "<div class=\"card\"><div class=\"empty\">Keine Berechtigung</div></div>"; return; }
    var merged = Object.assign({}, DEFAULT_ROLES, rolesCache);
    var canEdit = hasPerm("roles.edit");
    var cards = Object.keys(merged).sort(function (a, b) {
      return (roleObj(b).priority || 0) - (roleObj(a).priority || 0);
    }).map(function (id) {
      var r = merged[id];
      var perms = r.perms || {};
      var open = openRoleId === id;
      var simple = SIMPLE.map(function (it) {
        return "<label class=\"switch\"><input type=\"checkbox\" data-role=\"" + e(id) + "\" data-simple=\"" + it[0] + "\" data-keys=\"" + it[2].join(",") + "\"" +
          (simpleChecked(perms, it[2]) ? " checked" : "") + (canEdit ? "" : " disabled") + "> " + e(it[1]) + "</label>";
      }).join("");
      var adv = PERMS.map(function (g) {
        return "<div class=\"perm-g\">" + e(g.g) + "</div>" + g.items.map(function (it) {
          return "<label class=\"switch\"><input type=\"checkbox\" data-role=\"" + e(id) + "\" data-perm=\"" + it[0] + "\"" + (perms[it[0]] ? " checked" : "") + (canEdit ? "" : " disabled") + "> " + e(it[1]) + "</label>";
        }).join("");
      }).join("");
      return "<div class=\"card tm-role-card\" style=\"border-left:4px solid " + e(r.color || "#e53935") + "\">" +
        "<div class=\"tm-role-head\" onclick=\"tmToggleRoleCard('" + e(id) + "')\"><div><h2 style=\"margin:0\">" + iconFor(id) + " " + e(r.name || id) +
        " <span style=\"color:var(--muted);font-size:.85rem\">" + e(r.desc || "") + "</span></h2></div><span class=\"meta\">" + (open ? "▲" : "▼") + "</span></div>" +
        (open ? ((canEdit ? "<div class=\"form-row\" style=\"margin-top:10px\"><input id=\"rn-" + e(id) + "\" value=\"" + e(r.name || "") + "\" placeholder=\"Name\"><input id=\"rd-" + e(id) + "\" value=\"" + e(r.desc || "") + "\" placeholder=\"Beschreibung\"><input id=\"rc-" + e(id) + "\" type=\"color\" value=\"" + e(r.color || "#e53935") + "\" style=\"max-width:70px;padding:4px\"></div>" : "") +
          "<div class=\"perm-grid\" style=\"margin-top:8px\">" + simple + "</div>" +
          "<details style=\"margin:8px 0\"><summary class=\"meta\" style=\"cursor:pointer\">Erweiterte Rechte</summary><div class=\"perm-grid\">" + adv + "</div></details>" +
          (canEdit ? "<button class=\"btn\" onclick=\"tmSaveRole('" + e(id) + "')\">Rolle speichern</button> " +
            "<button class=\"btn btn-ghost\" onclick=\"tmCopyRole('" + e(id) + "')\">Rolle kopieren</button>" +
            (r.locked ? "" : " <button class=\"btn btn-ghost\" onclick=\"tmDeleteRole('" + e(id) + "')\">Löschen</button>") : "")
        ) : "") + "</div>";
    }).join("");
    el.innerHTML = "<div class=\"card\" style=\"margin-bottom:14px\"><h2>👑 Rollen & Rechte</h2><p class=\"desc\">Einfache Checkboxen. Speichern prüft die Rechte in Firebase – nicht nur die Oberfläche.</p>" +
      (canEdit ? "<div class=\"form-row\"><input id=\"tmRoleId\" placeholder=\"id (z.B. trial)\"><input id=\"tmRoleName\" placeholder=\"Anzeigename\"></div><button class=\"btn\" onclick=\"tmNewRole()\">+ Rolle anlegen</button>" : "") +
      "</div>" + cards;
  }
  window.tmToggleRoleCard = function (id) {
    openRoleId = openRoleId === id ? null : id;
    tmRenderRoles();
  };

  window.tmSaveRole = function (id) {
    id = safeId(id);
    assertPerm("roles.edit").then(function () {
      var perms = {};
      document.querySelectorAll("input[data-role=\"" + id + "\"][data-simple]").forEach(function (box) {
        (box.getAttribute("data-keys") || "").split(",").forEach(function (k) { if (k) perms[k] = box.checked; });
      });
      document.querySelectorAll("input[data-role=\"" + id + "\"][data-perm]").forEach(function (box) {
        perms[box.getAttribute("data-perm")] = box.checked;
      });
      var prev = Object.assign({}, DEFAULT_ROLES[id] || {}, rolesCache[id] || {});
      var body = {
        name: (document.getElementById("rn-" + id) || {}).value || prev.name || id,
        desc: (document.getElementById("rd-" + id) || {}).value || prev.desc || "",
        color: (document.getElementById("rc-" + id) || {}).value || prev.color || "#e53935",
        priority: prev.priority || 0,
        locked: !!prev.locked,
        perms: perms
      };
      return db.ref("staffRoles/" + id).set(body).then(function () {
        logAct("hat Rolle gespeichert", id);
        toast("Rolle gespeichert ✓");
      });
    }).catch(function () {});
  };
  window.tmCopyRole = function (id) {
    id = safeId(id);
    assertPerm("roles.edit").then(function () {
      var src = Object.assign({}, DEFAULT_ROLES[id] || {}, rolesCache[id] || {});
      var nid = (id + "_copy").replace(/[^a-z0-9_-]/g, "").slice(0, 24);
      return db.ref("staffRoles/" + nid).set({
        name: (src.name || id) + " Kopie", desc: src.desc || "", color: src.color || "#94a3b8",
        priority: (src.priority || 10) - 1, locked: false, perms: Object.assign({}, src.perms || {})
      }).then(function () { logAct("hat Rolle kopiert", nid); toast("Kopie angelegt"); openRoleId = nid; });
    }).catch(function () {});
  };
  window.tmNewRole = function () {
    assertPerm("roles.edit").then(function () {
      var id = (document.getElementById("tmRoleId").value || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
      var name = (document.getElementById("tmRoleName").value || "").trim() || id;
      if (!id) return toast("ID fehlt");
      return db.ref("staffRoles/" + id).set({
        name: name, desc: "", color: "#94a3b8", priority: 10, locked: false, perms: pick("team.view", "org.notes", "commands.view", "org.absences")
      }).then(function () { logAct("hat eine Rolle erstellt", id); toast("Rolle angelegt"); openRoleId = id; });
    }).catch(function () {});
  };
  window.tmDeleteRole = function (id) {
    id = safeId(id);
    assertPerm("roles.edit").then(function () {
      if ((DEFAULT_ROLES[id] || {}).locked) return toast("Standard-Rolle geschützt");
      if (!confirm("Rolle löschen?")) return;
      return db.ref("staffRoles/" + id).remove().then(function () { logAct("hat eine Rolle gelöscht", id); toast("Gelöscht"); });
    }).catch(function () {});
  };

  function tmRenderAnn() {
    var el = document.getElementById("tmSubAnn");
    if (!el) return;
    var entries = Object.entries(announcementsCache || {}).sort(function (a, b) { return (b[1].ts || 0) - (a[1].ts || 0); });
    var staff = userEntries().filter(function (u) { return !u.disabled; });
    var list = entries.map(function (pair) {
      var id = pair[0], a = pair[1] || {};
      var reads = readsCache[id] || {};
      var readUsers = staff.filter(function (u) { return reads[u._id]; });
      var unreadUsers = staff.filter(function (u) { return !reads[u._id]; });
      var cls = a.priority === "urgent" || a.instant ? "tm-prio-urgent" : a.priority === "important" ? "tm-prio-important" : "tm-prio-info";
      var prio = a.instant ? "🚨 Sofort" : a.priority === "urgent" ? "🔴 Wichtig/Dringend" : a.priority === "important" ? "🟡 Wichtig" : "🟢 Normal";
      return "<div class=\"item\"><div style=\"flex:1\"><div class=\"name " + cls + "\">" + prio + " · " + e(a.title) + "</div>" +
        "<div>" + e(a.message) + "</div>" +
        "<div class=\"meta\">" + e(fmt(a.ts)) + " · " + e(a.by || "") + (a.expiresAt ? " · bis " + e(fmt(a.expiresAt)) : "") + "</div>" +
        "<div class=\"meta\">Gelesen: " + readUsers.length + "/" + staff.length + " · Noch nicht: " + unreadUsers.length + "/" + staff.length + "</div>" +
        "<details class=\"tm-read-box\"><summary>✓ Gelesen (" + readUsers.length + ")</summary>" +
        (readUsers.length ? readUsers.map(function (u) {
          var ts = reads[u._id] && (reads[u._id].ts || reads[u._id]);
          return "<div>✓ " + e(u._id) + (ts ? " – " + e(fmt(ts)) : "") + "</div>";
        }).join("") : "<div class=\"meta\">noch niemand</div>") +
        "<div style=\"margin-top:8px\">⏳ Noch nicht gelesen</div>" +
        (unreadUsers.length ? unreadUsers.map(function (u) { return "<div>⏳ " + e(u._id) + "</div>"; }).join("") : "<div class=\"meta\">alle haben gelesen</div>") +
        "</details>" +
        (hasPerm("org.announce") ? "<button class=\"btn btn-ghost btn-sm\" style=\"margin-top:8px\" onclick=\"tmDeleteAnn('" + id + "')\">🗑️ Löschen</button>" : "") +
        "</div></div>";
    }).join("");
    el.innerHTML = "<div class=\"card\"><h2>📢 Ankündigungen</h2>" +
      (hasPerm("org.announce") ? "<input id=\"tmAnnTitle\" placeholder=\"Titel\"><textarea id=\"tmAnnMsg\" placeholder=\"Nachricht\"></textarea><div class=\"form-row\"><select id=\"tmAnnPrio\"><option value=\"info\">🟢 Normal</option><option value=\"important\">🟡 Wichtig</option><option value=\"urgent\">🔴 Sofort / dringend</option></select><input id=\"tmAnnExp\" type=\"datetime-local\"></div><button class=\"btn\" onclick=\"tmCreateAnn(false)\">+ Ankündigung</button>" : "") +
      "<div class=\"list\">" + (list || "<div class=\"empty\">Keine Ankündigungen</div>") + "</div></div>";
  }

  window.tmCreateAnn = function (instant, preset) {
    var p = instant ? "org.instant" : "org.announce";
    assertPerm(p).then(function () {
      var title, message, priority, expiresAt = null;
      if (preset) {
        title = preset.title; message = preset.message; priority = "urgent";
      } else {
        title = (document.getElementById("tmAnnTitle") || {}).value;
        message = (document.getElementById("tmAnnMsg") || {}).value;
        priority = (document.getElementById("tmAnnPrio") || {}).value || "info";
        var exp = (document.getElementById("tmAnnExp") || {}).value;
        if (exp) expiresAt = new Date(exp).getTime();
      }
      title = (title || "").trim(); message = (message || "").trim();
      if (!title || !message) return toast("Titel und Nachricht nötig");
      return db.ref("staffAnnouncements").push({
        title: title, message: message, priority: instant ? "urgent" : priority,
        instant: !!instant, by: currentUser.username, ts: Date.now(), expiresAt: expiresAt
      }).then(function () {
        logAct(instant ? "hat eine Sofortmeldung gesendet" : "hat eine neue Team-Ankündigung erstellt", title);
        toast("Gesendet ✓");
        if (document.getElementById("tmAnnTitle")) document.getElementById("tmAnnTitle").value = "";
        if (document.getElementById("tmAnnMsg")) document.getElementById("tmAnnMsg").value = "";
      });
    }).catch(function () {});
  };
  window.tmDeleteAnn = function (id) {
    assertPerm("org.announce").then(function () {
      if (!confirm("Ankündigung wirklich löschen?")) return;
      return db.ref("staffAnnouncements/" + id).remove().then(function () {
        db.ref("staffAnnouncementReads/" + id).remove();
        logAct("hat eine Ankündigung gelöscht", id);
        toast("Gelöscht");
      });
    }).catch(function () {});
  };

  window.tmStartInstant = function () {
    if (!hasPerm("org.instant")) return toast("Keine Berechtigung");
    var presets = [
      { title: "🚨 Server ist offline", message: "Der Server ist derzeit nicht erreichbar." },
      { title: "⚠️ Server wird neu gestartet", message: "Bitte kurz warten, Restart läuft." },
      { title: "🔧 Wartung beginnt", message: "Wartungsarbeiten – Team bitte bereit halten." },
      { title: "📢 Team-Besprechung", message: "Bitte jetzt ins Team-Meeting kommen." },
      { title: "❗ Sicherheitsproblem", message: "Mögliche Sicherheitslage – keine Infos nach außen." }
    ];
    var box = document.getElementById("tmConfirmPreview");
    if (box) {
      box.innerHTML = presets.map(function (p, i) {
        return "<button class=\"btn-quick\" type=\"button\" onclick=\"tmPickInstant(" + i + ")\">" + e(p.title) + "</button>";
      }).join("") + "<input id=\"tmInstTitle\" placeholder=\"Titel\" style=\"margin-top:10px\"><textarea id=\"tmInstMsg\" placeholder=\"Eigene Nachricht\"></textarea>";
    }
    window.__tmInstantPresets = presets;
    document.getElementById("tmConfirm").classList.add("show");
  };
  window.tmPickInstant = function (i) {
    var p = (window.__tmInstantPresets || [])[i];
    if (!p) return;
    document.getElementById("tmInstTitle").value = p.title;
    document.getElementById("tmInstMsg").value = p.message;
  };
  window.tmConfirmInstant = function () {
    var title = (document.getElementById("tmInstTitle") || {}).value;
    var message = (document.getElementById("tmInstMsg") || {}).value;
    document.getElementById("tmConfirm").classList.remove("show");
    tmCreateAnn(true, { title: title, message: message });
  };

  function tmMaybePopup() {
    if (!currentUser || popupOpen) return;
    if (prefs.ann === false && prefs.instant === false) return;
    var user = currentUser.username;
    var now = Date.now();
    var unread = Object.entries(announcementsCache || {}).filter(function (pair) {
      var a = pair[1];
      if (!a) return false;
      if (a.expiresAt && a.expiresAt < now) return false;
      if (readsCache[pair[0]] && readsCache[pair[0]][user]) return false;
      if (a.instant && prefs.instant === false) return false;
      if (!a.instant && prefs.ann === false) return false;
      return true;
    }).sort(function (a, b) {
      var pa = a[1].instant || a[1].priority === "urgent" ? 2 : a[1].priority === "important" ? 1 : 0;
      var pb = b[1].instant || b[1].priority === "urgent" ? 2 : b[1].priority === "important" ? 1 : 0;
      return pb - pa || (b[1].ts || 0) - (a[1].ts || 0);
    });
    if (!unread.length) return;
    showPopup(unread[0][0], unread[0][1]);
  }
  function showPopup(id, a) {
    popupOpen = true;
    window.__tmPopupId = id;
    var modal = document.getElementById("tmPopup");
    var urgent = !!(a.instant || a.priority === "urgent");
    modal.classList.toggle("urgent", urgent);
    var flash = document.getElementById("tmPopupFlash");
    if (flash) flash.style.display = urgent ? "block" : "none";
    document.getElementById("tmPopupPrio").textContent = a.instant ? "🚨 SOFORTMELDUNG" : (a.priority === "urgent" ? "🔴 Dringend" : a.priority === "important" ? "🟡 Wichtig" : "🟢 Information");
    document.getElementById("tmPopupTitle").textContent = a.title || "";
    document.getElementById("tmPopupBody").textContent = a.message || "";
    document.getElementById("tmPopupMeta").textContent = (a.by || "") + " · " + fmt(a.ts);
    modal.classList.add("show");
  }
  window.tmMarkRead = function () {
    var id = window.__tmPopupId;
    if (!id || !currentUser) return;
    db.ref("staffAnnouncementReads/" + id + "/" + currentUser.username).set({ ts: Date.now(), username: currentUser.username }).then(function () {
      logAct("hat die Ankündigung gelesen", (announcementsCache[id] || {}).title || id);
      document.getElementById("tmPopup").classList.remove("show");
      popupOpen = false;
      setTimeout(tmMaybePopup, 250);
    });
  };

  function taskStatus(t) {
    if (!t) return "open";
    if (t.archived || t.status === "archived") return "archived";
    if (t.status === "done") return "done";
    if (t.due && t.due < Date.now() && t.status !== "done") return "overdue";
    if (t.status === "progress") return "progress";
    if (t.takenBy || t.status === "taken") return "taken";
    return t.status || "open";
  }
  function taskStatusLabel(st) {
    return st === "done" ? "✅ Erledigt" : st === "progress" ? "🔄 In Bearbeitung" : st === "taken" ? "🙋 Übernommen" : st === "overdue" ? "⏳ Überfällig" : st === "archived" ? "📦 Archiviert" : "🆕 Offen";
  }
  function tmRenderTasks() {
    var el = document.getElementById("tmSubTasks");
    if (!el) return;
    var all = isOwnerRole() || hasPerm("org.tasks");
    var entries = Object.entries(tasksCache || {}).sort(function (a, b) { return (b[1].ts || 0) - (a[1].ts || 0); }).filter(function (p) {
      var t = p[1] || {};
      if (t.archived || t.status === "archived") return isOwnerRole();
      return all || t.assignee === currentUser.username || t.assignee === "all" || !t.assignee || t.takenBy === currentUser.username;
    });
    var list = entries.map(function (pair) {
      var id = pair[0], t = pair[1] || {};
      var st = taskStatus(t);
      var canTake = (t.assignee === "all" || !t.assignee) && !t.takenBy && st !== "done" && st !== "archived";
      return "<div class=\"item\"><div style=\"flex:1\"><div class=\"name\">" + e(t.title) + " · " + taskStatusLabel(st) + "</div>" +
        "<div>" + e(t.desc || "") + "</div>" +
        "<div class=\"meta\">Zuständig: " + e(t.takenBy || t.assignee || "alle") + " · Prio " + e(t.priority || "info") + " · Frist " + e(fmt(t.due)) +
        (t.doneBy ? " · erledigt von " + e(t.doneBy) + " am " + e(fmt(t.doneAt)) : "") + "</div>" +
        "<div class=\"form-row\" style=\"margin-top:8px\">" +
        (canTake ? "<button class=\"btn-quick\" onclick=\"tmTakeTask('" + id + "')\">🙋 Übernehmen</button>" : "") +
        "<button class=\"btn-quick\" onclick=\"tmSetTask('" + id + "','progress')\">🔄 In Bearbeitung</button>" +
        "<button class=\"btn-quick\" onclick=\"tmSetTask('" + id + "','done')\">✅ Erledigt</button></div></div></div>";
    }).join("");
    el.innerHTML = "<div class=\"card\"><h2>📋 Aufgaben</h2>" +
      (hasPerm("org.tasks") ? "<input id=\"tmTaskTitle\" placeholder=\"Titel\"><textarea id=\"tmTaskDesc\" placeholder=\"Beschreibung\"></textarea><div class=\"form-row\"><select id=\"tmTaskAssignee\"></select><select id=\"tmTaskPrio\"><option value=\"info\">Normal</option><option value=\"important\">🟡 Wichtig</option><option value=\"urgent\">🔴 Hoch</option></select><input id=\"tmTaskDue\" type=\"datetime-local\"></div><button class=\"btn\" onclick=\"tmCreateTask()\">📋 Aufgabe erstellen</button>" : "") +
      "<div class=\"list\">" + (list || "<div class=\"empty\">Keine Aufgaben</div>") + "</div></div>";
    fillAssignSelects();
  }
  window.tmCreateTask = function () {
    assertPerm("org.tasks").then(function () {
      var title = (document.getElementById("tmTaskTitle").value || "").trim();
      var desc = (document.getElementById("tmTaskDesc").value || "").trim();
      var assignee = document.getElementById("tmTaskAssignee").value;
      var priority = document.getElementById("tmTaskPrio").value;
      var dueRaw = document.getElementById("tmTaskDue").value;
      if (!title) return toast("Titel fehlt");
      return db.ref("staffTasks").push({
        title: title, desc: desc, assignee: assignee || "all", priority: priority,
        status: "open", ts: Date.now(), due: dueRaw ? new Date(dueRaw).getTime() : null, by: currentUser.username
      }).then(function () {
        logAct("hat eine Aufgabe erstellt", title + " → " + (assignee || "alle"));
        toast("Aufgabe angelegt");
        document.getElementById("tmTaskTitle").value = "";
        document.getElementById("tmTaskDesc").value = "";
      });
    }).catch(function () {});
  };
  window.tmTakeTask = function (id) {
    var t = (tasksCache || {})[id];
    if (!t || !currentUser) return;
    if (t.takenBy) return toast("Bereits übernommen");
    db.ref("staffTasks/" + id).update({
      takenBy: currentUser.username, takenAt: Date.now(), assignee: currentUser.username, status: "taken", updatedAt: Date.now()
    }).then(function () {
      logAct("hat eine Aufgabe übernommen", t.title || id);
      toast("Übernommen");
    });
  };
  window.tmSetTask = function (id, status) {
    var t = (tasksCache || {})[id];
    if (!t || !currentUser) return;
    var mine = t.assignee === currentUser.username || t.takenBy === currentUser.username;
    var go = mine ? Promise.resolve(true) : assertPerm("org.tasks");
    go.then(function () {
      var upd = { status: status, updatedAt: Date.now(), updatedBy: currentUser.username };
      if (status === "done") {
        upd.archived = true;
        upd.doneBy = currentUser.username;
        upd.doneAt = Date.now();
        upd.archivedAt = Date.now();
        upd.archivedBy = currentUser.username;
      }
      return db.ref("staffTasks/" + id).update(upd).then(function () {
        logAct(status === "done" ? "hat eine Aufgabe erledigt" : "hat Aufgabenstatus auf " + status + " gesetzt", t.title || id);
        if (status === "done") toast("Erledigt und archiviert");
      });
    }).catch(function () {});
  };
  function tmRenderMyTasks() {
    var el = document.getElementById("myTasksList");
    if (!el || !currentUser) return;
    var entries = Object.entries(tasksCache || {}).sort(function (a, b) { return (b[1].ts || 0) - (a[1].ts || 0); }).filter(function (p) {
      var t = p[1];
      return t && !t.archived && t.status !== "archived" && (t.assignee === currentUser.username || t.takenBy === currentUser.username || t.assignee === "all");
    });
    el.innerHTML = entries.length ? entries.map(function (pair) {
      var id = pair[0], t = pair[1];
      var st = taskStatus(t);
      var canTake = (t.assignee === "all" || !t.assignee) && !t.takenBy;
      return "<div class=\"item\"><div style=\"flex:1\"><div class=\"name\">" + e(t.title) + " · " + taskStatusLabel(st) + "</div><div>" + e(t.desc || "") + "</div>" +
        "<div class=\"meta\">Frist " + e(fmt(t.due)) + "</div>" +
        "<div class=\"form-row\" style=\"margin-top:8px\">" +
        (canTake ? "<button class=\"btn-quick\" onclick=\"tmTakeTask('" + id + "')\">🙋 Übernehmen</button>" : "") +
        "<button class=\"btn-quick\" onclick=\"tmSetTask('" + id + "','progress')\">🔄 In Bearbeitung</button>" +
        "<button class=\"btn-quick\" onclick=\"tmSetTask('" + id + "','done')\">✅ Erledigt</button></div></div></div>";
    }).join("") : "<div class=\"empty\">Keine Aufgaben für dich</div>";
  }
  window.tmRenderMyTasks = tmRenderMyTasks;

  function tmRenderAway() {
    var el = document.getElementById("tmSubAway");
    if (!el) return;
    var entries = Object.entries(absencesCache || {}).sort(function (a, b) { return (b[1].from || 0) - (a[1].from || 0); });
    var list = entries.map(function (pair) {
      var id = pair[0], a = pair[1] || {};
      var nowOn = a.from && a.to && Date.now() >= a.from && Date.now() <= a.to;
      var mine = currentUser && a.user === currentUser.username;
      return "<div class=\"item\"><div style=\"flex:1\"><div class=\"name\">" + (nowOn ? "🏖️ " : "") + e(a.user) + " · " + e(a.reason || a.status || "Abwesend") + "</div>" +
        "<div class=\"meta\">" + e(fmt(a.from)) + " – " + e(fmt(a.to)) + (nowOn ? " · aktuell" : "") + "</div></div>" +
        ((mine || hasPerm("team.edit")) ? "<button class=\"btn-icon\" onclick=\"tmDelAway('" + id + "')\">✕</button>" : "") + "</div>";
    }).join("");
    el.innerHTML = "<div class=\"card\"><h2>🏖️ Abwesenheiten</h2><p class=\"desc\">Jeder darf die eigene Abwesenheit eintragen.</p>" +
      "<div class=\"form-row\"><input id=\"tmAwayFrom\" type=\"date\"><input id=\"tmAwayTo\" type=\"date\"><input id=\"tmAwayReason\" placeholder=\"Grund (Ferien, eingeschränkt…)\"></div>" +
      "<div class=\"form-row\"><select id=\"tmAwayStatus\"><option value=\"away\">🏖️ Abwesend</option><option value=\"limited\">⚠️ Eingeschränkt verfügbar</option><option value=\"available\">🟢 Verfügbar</option></select></div>" +
      "<button class=\"btn\" onclick=\"tmAddAway()\">Abwesenheit eintragen</button>" +
      "<div class=\"list\">" + (list || "<div class=\"empty\">Keine Einträge</div>") + "</div></div>";
  }
  window.tmAddAway = function () {
    if (!currentUser) return;
    var from = (document.getElementById("tmAwayFrom") || {}).value;
    var to = (document.getElementById("tmAwayTo") || {}).value;
    var reason = ((document.getElementById("tmAwayReason") || {}).value || "").trim();
    var status = ((document.getElementById("tmAwayStatus") || {}).value) || "away";
    if (!from || !to) return toast("Von und Bis nötig");
    var f = new Date(from).getTime();
    var t = new Date(to).getTime() + 86400000 - 1;
    if (t < f) return toast("Bis liegt vor Von");
    db.ref("staffAbsences").push({
      user: currentUser.username, from: f, to: t, reason: reason || "Abwesend", status: status, ts: Date.now(), by: currentUser.username
    }).then(function () {
      logAct("hat Abwesenheit eingetragen", reason || "Abwesend");
      toast("Eingetragen");
    });
  };
  window.tmDelAway = function (id) {
    var a = (absencesCache || {})[id];
    if (!a || !currentUser) return;
    if (a.user !== currentUser.username && !hasPerm("team.edit")) return toast("Keine Berechtigung");
    db.ref("staffAbsences/" + id).remove();
  };

  function tmRenderNotes() {
    var el = document.getElementById("tmSubNotes");
    if (!el) return;
    el.innerHTML = "<div class=\"card\"><h2>📝 Team-Notizen</h2><p class=\"desc\">Dieselben Notizen wie unter Moderation.</p>" +
      "<div class=\"form-row\"><input type=\"search\" id=\"tmNoteSearch\" class=\"search\" placeholder=\"Suchen…\" oninput=\"tmRenderNotes()\">" +
      "<select id=\"tmNoteFilter\" onchange=\"tmRenderNotes()\"><option value=\"open\">Aktiv</option><option value=\"archived\">Archiv</option><option value=\"all\">Alle</option></select></div>" +
      "<div class=\"list\" id=\"tmNoteList\"></div></div>";
    tmPaintNotes(document.getElementById("tmNoteList"), (document.getElementById("tmNoteSearch") || {}).value || "", (document.getElementById("tmNoteFilter") || {}).value || "open");
  }
  window.tmRenderNotesModeration = function () {
    tmPaintNotes(document.getElementById("noteList"), (document.getElementById("noteSearch") || {}).value || "", "open");
  };
  function tmPaintNotes(el, q, filter) {
    if (!el) return;
    q = (q || "").toLowerCase();
    filter = filter || "open";
    var entries = Object.entries(notesCache || {}).sort(function (a, b) { return (b[1].ts || 0) - (a[1].ts || 0); }).filter(function (p) {
      var n = p[1] || {};
      if (filter === "open" && n.archived) return false;
      if (filter === "archived" && !n.archived) return false;
      var blob = ((n.title || "") + " " + (n.text || "") + " " + (n.by || "") + " " + (n.assignedTo || "")).toLowerCase();
      return !q || blob.indexOf(q) !== -1;
    });
    el.innerHTML = entries.length ? entries.map(function (pair) {
      var id = pair[0], n = pair[1] || {};
      var cls = n.priority === "urgent" ? "tm-prio-urgent" : n.priority === "important" ? "tm-prio-important" : "";
      var prio = n.priority === "urgent" ? "🔴 " : n.priority === "important" ? "🟡 " : "";
      return "<div class=\"item\"><div style=\"flex:1\"><div class=\"name " + cls + "\">" + prio + e(n.title || "Notiz") + (n.assignedTo ? " → " + e(n.assignedTo) : "") + "</div>" +
        "<div>" + e(n.text || "") + "</div><div class=\"meta\">" + e(fmt(n.ts)) + " · " + e(n.by || "") + (n.archived ? " · archiviert" : "") + "</div></div>" +
        (!n.archived ? "<button class=\"btn-icon\" title=\"Archivieren\" onclick=\"tmArchiveNote('" + id + "')\">✕</button>" : "") + "</div>";
    }).join("") : "<div class=\"empty\">Keine Notizen</div>";
  }
  window.tmArchiveNote = function (id) {
    assertPerm("org.notes").then(function () {
      return db.ref("notes/" + id).update({ archived: true, archivedBy: currentUser.username, archivedAt: Date.now() }).then(function () {
        logAct("hat eine Notiz archiviert", id);
      });
    }).catch(function () {});
  };

  function logCat(x) {
    var t = ((x.action || "") + " " + (x.target || "")).toLowerCase();
    if (/ban|warn|kick|moderation/.test(t)) return "mod";
    if (/command/.test(t)) return "cmd";
    if (/regel/.test(t)) return "rules";
    if (/aufgabe/.test(t)) return "tasks";
    if (/ankünd|sofort|gelesen/.test(t)) return "team";
    if (/passwort|rolle|account|mitglied/.test(t)) return "settings";
    return "team";
  }
  function tmRenderLog() {
    var el = document.getElementById("tmSubLog");
    if (!el) return;
    if (!hasPerm("org.activity")) { el.innerHTML = "<div class=\"card\"><div class=\"empty\">Keine Berechtigung</div></div>"; return; }
    el.innerHTML = "<div class=\"card\"><h2>📋 Aktivitätsprotokoll</h2>" +
      "<div class=\"filter-row\">" +
      [["all", "Alle"], ["team", "Team"], ["mod", "Moderation"], ["cmd", "Commands"], ["rules", "Regeln"], ["tasks", "Aufgaben"], ["settings", "Einstellungen"]].map(function (p) {
        return "<button class=\"btn-quick" + (logFilter === p[0] ? " active" : "") + "\" onclick=\"tmLogFilter('" + p[0] + "')\">" + p[1] + "</button>";
      }).join("") + "</div>" +
      "<div class=\"form-row\"><input id=\"tmLogUser\" placeholder=\"Benutzer suchen\" oninput=\"tmPaintLog()\"></div>" +
      "<div class=\"list\" id=\"tmLogList\"></div></div>";
    tmPaintLog();
  }
  window.tmLogFilter = function (f) { logFilter = f; tmPaintLog(); };
  window.tmPaintLog = function () {
    var el = document.getElementById("tmLogList");
    if (!el) return;
    var u = ((document.getElementById("tmLogUser") || {}).value || "").toLowerCase();
    var entries = actEntries().filter(function (x) {
      if (u && String(x.by || "").toLowerCase().indexOf(u) < 0) return false;
      if (logFilter !== "all" && logCat(x) !== logFilter) return false;
      return true;
    });
    var groups = {};
    entries.forEach(function (x) {
      var day = x.ts ? new Date(x.ts).toLocaleDateString("de-DE") : "";
      var key = (x.by || "–") + "||" + day;
      if (!groups[key]) groups[key] = [];
      groups[key].push(x);
    });
    var html = Object.keys(groups).map(function (key) {
      var parts = key.split("||");
      var items = groups[key];
      return "<div class=\"item\"><div style=\"flex:1\"><div class=\"name\">👤 " + e(parts[0]) + " · " + items.length + " Aktivit" + (items.length === 1 ? "ät" : "äten") + " · " + e(parts[1]) + "</div>" +
        items.map(function (x) {
          return "<div style=\"margin-top:6px\">• " + e(x.action) + (x.target ? " · " + e(x.target) : "") + " <span class=\"meta\">" + e(fmt(x.ts)) + "</span></div>";
        }).join("") + "</div></div>";
    }).join("");
    el.innerHTML = html || "<div class=\"empty\">Keine Einträge</div>";
  };

  /* Suche + Glocke */
  window.tmToggleSearch = function () {
    searchOpen = !searchOpen; bellOpen = false;
    var sd = document.getElementById("tmSearchDrop"); if (sd) sd.style.display = searchOpen ? "block" : "none";
    var bd = document.getElementById("tmBellDrop"); if (bd) bd.style.display = "none";
    if (searchOpen) {
      var inp = document.getElementById("tmGlobalSearch");
      if (inp) { inp.focus(); tmRunSearch(); }
    }
  };
  window.tmRunSearch = function () {
    var q = ((document.getElementById("tmGlobalSearch") || {}).value || "").trim().toLowerCase();
    var box = document.getElementById("tmSearchResults");
    if (!box) return;
    if (q.length < 2) { box.innerHTML = '<div class="empty">Mindestens 2 Zeichen</div>'; return; }
    var hits = [];
    userEntries().forEach(function (u) {
      if (u._id.toLowerCase().indexOf(q) >= 0) hits.push({ t: "Mitglied", n: u._id, go: function () { showTab("team"); tmShowSub("members"); } });
    });
    Object.values(commandsCache || {}).forEach(function (c) {
      if (((c.name || "") + " " + (c.desc || "")).toLowerCase().indexOf(q) >= 0) hits.push({ t: "Command", n: c.name, go: function () { showTab("commands"); } });
    });
    Object.values(tasksCache || {}).forEach(function (t) {
      if (((t.title || "") + " " + (t.desc || "")).toLowerCase().indexOf(q) >= 0) hits.push({ t: "Aufgabe", n: t.title, go: function () { showTab("team"); tmShowSub("tasks"); } });
    });
    Object.values(announcementsCache || {}).forEach(function (a) {
      if (((a.title || "") + " " + (a.message || "")).toLowerCase().indexOf(q) >= 0) hits.push({ t: "Ankündigung", n: a.title, go: function () { showTab("team"); tmShowSub("ann"); } });
    });
    Object.values(notesCache || {}).forEach(function (n) {
      if (((n.title || "") + " " + (n.text || "")).toLowerCase().indexOf(q) >= 0) hits.push({ t: "Notiz", n: n.title || n.text, go: function () { showTab("moderation"); } });
    });
    actEntries().slice(0, 80).forEach(function (x) {
      if (((x.by || "") + " " + (x.action || "") + " " + (x.target || "")).toLowerCase().indexOf(q) >= 0) hits.push({ t: "Aktivität", n: (x.by || "") + " · " + (x.action || ""), go: function () { showTab("team"); tmShowSub("log"); } });
    });
    var pack = window.ALPEN_RULES_LIVE || {};
    (pack.rules || []).forEach(function (r) {
      if (((r.title || "") + " " + ((r.paragraphs || []).join(" "))).toLowerCase().indexOf(q) >= 0) hits.push({ t: "Regel " + r.id, n: r.title, go: function () { showTab("rulesedit"); } });
    });
    if (typeof allBans !== "undefined") {
      Object.values(allBans || {}).forEach(function (b) {
        if ((b.name || "").toLowerCase().indexOf(q) >= 0) hits.push({ t: "Spieler / Ban", n: b.name, go: function () { showTab("moderation"); } });
      });
    }
    hits = hits.slice(0, 20);
    box.innerHTML = hits.length ? hits.map(function (h, i) {
      return "<div class=\"item\" style=\"cursor:pointer\" onclick=\"tmSearchGo(" + i + ")\"><div><div class=\"meta\">" + e(h.t) + "</div><div class=\"name\">" + e(String(h.n || "").slice(0, 80)) + "</div></div></div>";
    }).join("") : '<div class="empty">Nichts gefunden</div>';
    window.__tmSearchHits = hits;
  };
  window.tmSearchGo = function (i) {
    var h = (window.__tmSearchHits || [])[i];
    if (!h) return;
    searchOpen = false;
    var sd = document.getElementById("tmSearchDrop"); if (sd) sd.style.display = "none";
    h.go();
  };

  function notifItems() {
    if (!currentUser) return [];
    var items = [];
    var user = currentUser.username;
    Object.entries(announcementsCache || {}).forEach(function (p) {
      var a = p[1]; if (!a) return;
      if (a.expiresAt && a.expiresAt < Date.now()) return;
      if (readsCache[p[0]] && readsCache[p[0]][user]) return;
      items.push({ id: "ann-" + p[0], icon: a.instant ? "🚨" : "📢", text: (a.instant ? "Sofortmeldung: " : "Ankündigung: ") + (a.title || ""), ts: a.ts || 0 });
    });
    Object.entries(tasksCache || {}).forEach(function (p) {
      var t = p[1]; if (!t || t.archived) return;
      if (t.assignee === user && t.status !== "done") items.push({ id: "task-" + p[0], icon: "📋", text: "Aufgabe zugewiesen: " + (t.title || ""), ts: t.ts || 0 });
      if (t.due && t.due < Date.now() && t.status !== "done" && (t.assignee === user || t.assignee === "all" || isOwnerRole())) {
        items.push({ id: "over-" + p[0], icon: "⚠️", text: "Aufgabe überfällig: " + (t.title || ""), ts: t.due });
      }
    });
    buildHints().forEach(function (h, i) {
      if (/nicht online/.test(h.text)) items.push({ id: "hint-" + i, icon: "⚠️", text: h.text, ts: Date.now() });
    });
    return items.filter(function (it) { return !(notifReads && notifReads[it.id] && notifReads[it.id].read); }).sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
  }
  function tmPaintBell() {
    var items = notifItems();
    var badge = document.getElementById("tmBellBadge");
    if (badge) { badge.style.display = items.length ? "flex" : "none"; badge.textContent = items.length; }
    var drop = document.getElementById("tmBellDrop");
    if (!drop || !bellOpen) return;
    drop.innerHTML = items.length ? items.map(function (it) {
      return "<div class=\"item\"><div style=\"flex:1\"><div class=\"name\">" + it.icon + " " + e(it.text) + "</div><div class=\"meta\">" + e(fmt(it.ts)) + "</div></div>" +
        "<button class=\"btn-ghost btn-sm\" onclick=\"tmReadNotif('" + e(it.id) + "')\">✓</button></div>";
    }).join("") + '<button class="btn btn-ghost btn-sm" style="width:100%;margin-top:8px" onclick="tmReadAllNotif()">Alle als gelesen</button>'
      : '<div class="empty">Keine neuen Benachrichtigungen</div>';
  }
  window.tmToggleBell = function () {
    bellOpen = !bellOpen; searchOpen = false;
    var bd = document.getElementById("tmBellDrop"); if (bd) bd.style.display = bellOpen ? "block" : "none";
    var sd = document.getElementById("tmSearchDrop"); if (sd) sd.style.display = "none";
    tmPaintBell();
  };
  window.tmReadNotif = function (id) {
    if (!currentUser) return;
    db.ref("staffNotifications/" + currentUser.username + "/" + id).set({ read: true, ts: Date.now() });
  };
  window.tmReadAllNotif = function () {
    if (!currentUser) return;
    var upd = {};
    notifItems().forEach(function (it) { upd[it.id] = { read: true, ts: Date.now() }; });
    db.ref("staffNotifications/" + currentUser.username).update(upd);
  };

  /* ---------- wrap existing functions (echte Checks, nicht nur UI) ---------- */
  function wrap(name, perm, label) {
    var orig = window[name];
    if (typeof orig !== "function") return;
    window[name] = function () {
      var args = arguments;
      var self = this;
      if (!currentUser) return toast("Nicht angemeldet");
      return assertPerm(perm).then(function () {
        if (label) logAct(label);
        return orig.apply(self, args);
      }).catch(function () {});
    };
  }
  wrap("addBan", "mod.bans.create", "hat einen Ban eingetragen");
  wrap("addKick", "mod.bans.create", "hat einen Kick eingetragen");
  wrap("addWarn", "mod.warns.create", "hat eine Warnung eingetragen");
  wrap("confirmArchive", "mod.bans.archive", "hat archiviert");
  wrap("replyHelp", "mod.help.reply", "hat eine Hilfe-Anfrage beantwortet");
  wrap("createUser", "team.create", "hat einen Team-Account erstellt");
  wrap("updateUser", "team.edit", "hat einen Team-Account bearbeitet");
  wrap("kickUser", "team.remove", "hat einen Team-Account entfernt");
  wrap("saveSiteSettings", "web.edit", "hat Website-Einstellungen gespeichert");
  wrap("saveTotalPlayers", "web.stats", "hat Spielerzahlen geändert");
  wrap("bumpTotalPlayers", "web.stats", "hat Spielerzahlen geändert");
  wrap("saveCurrentPlayers", "web.stats", "hat Online-Stand gesetzt");
  wrap("writeActiveStatus", "web.status", "hat die Statusmeldung geändert");
  wrap("setStatusPreset", "web.status");
  wrap("saveCustomStatus", "web.status", "hat Custom-Status gesetzt");
  wrap("deactivateStatus", "web.status", "hat Status deaktiviert");
  wrap("writeSiteStats", "web.stats");
  wrap("pushHistoryNow", "web.stats");

  var _setCommunityStatus = window.setCommunityStatus;
  window.setCommunityStatus = function (path, key, status) {
    var perm = path === "community_images" ? "community.images" : "community.reviews";
    var args = arguments, self = this;
    return assertPerm(perm).then(function () {
      logAct("hat Community-Status auf " + status + " gesetzt", path);
      return _setCommunityStatus.apply(self, args);
    }).catch(function () {});
  };

  var _removeItem = window.removeItem;
  window.removeItem = function (path, key) {
    var perm = "mod.bans.archive";
    if (path === "community_reviews") perm = "community.reviews";
    else if (path === "community_images") perm = "community.images";
    else if (path === "notes") perm = "org.notes";
    else if (path === "helpRequests") perm = "mod.help.reply";
    else if (path === "commands") perm = "commands.manage";
    var args = arguments, self = this;
    return assertPerm(perm).then(function () {
      return _removeItem.apply(self, args);
    }).catch(function () {});
  };

  var _requireOwner = window.requireOwner;
  window.requireOwner = function () {
    if (!currentUser) { toast("Nicht angemeldet"); return false; }
    if (isHardOwner() || (currentUser.role === "owner")) return true;
    if (hasPerm("web.view") || hasPerm("web.edit") || hasPerm("web.stats") || hasPerm("web.status")) return true;
    toast("Keine Berechtigung");
    return false;
  };

  var _renderList = window.renderList;
  window.renderList = function (id, entries, type) {
    if (type === "note" || id === "noteList") {
      notesCache = notesCache || {};
      (entries || []).forEach(function (pair) { if (pair) notesCache[pair[0]] = pair[1]; });
      tmRenderNotesModeration();
      return;
    }
    return _renderList.apply(this, arguments);
  };

  var _loadHelp = window.loadHelp;
  window.loadHelp = function () {
    db.ref("helpRequests").once("value").then(function (snap) {
      var data = snap.val() || {}, entries = Object.entries(data).filter(function (p) { return !p[1].archived; }).reverse();
      var el = document.getElementById("helpList");
      if (!el) return;
      if (!entries.length) { el.innerHTML = "<div class=\"empty\">Keine offenen Anfragen</div>"; return; }
      var canReply = hasPerm("mod.help.reply");
      el.innerHTML = entries.map(function (pair) {
        var key = pair[0], item = pair[1];
        var replies = "";
        if (item.replies) replies = Object.values(item.replies).map(function (r) {
          return "<div style=\"margin-top:8px;padding:10px;background:rgba(0,0,0,.3);border-radius:9px;font-size:.9rem\"><strong>" + e(r.by) + "</strong>: " + e(r.text) + " <small style=\"color:var(--muted)\">(" + e(fmt(r.ts)) + ")</small></div>";
        }).join("");
        return "<div class=\"panic-item\"><div><strong>🚨 " + e(item.by) + "</strong></div><div style=\"margin:8px 0\">" + e(item.msg) + "</div><div class=\"meta\">" + e(fmt(item.ts)) + "</div>" + replies +
          (canReply ? "<div style=\"margin-top:12px;display:flex;gap:8px;flex-wrap:wrap\"><input type=\"text\" id=\"reply-" + key + "\" placeholder=\"Antwort...\" style=\"margin:0;flex:1\"><button class=\"btn btn-sm\" onclick=\"replyHelp('" + key + "')\">Antworten</button><button class=\"btn btn-ghost btn-sm\" onclick=\"removeItem('helpRequests','" + key + "')\">Löschen</button></div>" : "") + "</div>";
      }).join("");
    });
  };

  window.addNote = function () {
    assertPerm("org.notes").then(function () {
      var text = (document.getElementById("noteText").value || "").trim();
      if (!text) return toast("Leer");
      var title = ((document.getElementById("noteTitle") || {}).value || "").trim();
      var priority = ((document.getElementById("notePrio") || {}).value) || "info";
      var assignedTo = ((document.getElementById("noteAssign") || {}).value) || "";
      return db.ref("notes").push({
        text: text, title: title, priority: priority, assignedTo: assignedTo,
        by: currentUser.username, ts: Date.now(), archived: false
      }).then(function () {
        document.getElementById("noteText").value = "";
        if (document.getElementById("noteTitle")) document.getElementById("noteTitle").value = "";
        logAct("hat eine Team-Notiz erstellt", title || text.slice(0, 40));
        toast("Notiz ✓");
      });
    }).catch(function () {});
  };

  window.saveCommand = function () {
    assertPerm("commands.manage").then(function () {
      var name = (document.getElementById("cmdName").value || "").trim();
      var desc = (document.getElementById("cmdDesc").value || "").trim();
      var editKey = document.getElementById("cmdEditKey").value;
      var cat = ((document.getElementById("cmdCategory") || {}).value || "").trim();
      if (!name) return toast("Command fehlt");
      var roles = {};
      document.querySelectorAll("[data-cmd-role]").forEach(function (box) { roles[box.getAttribute("data-cmd-role")] = box.checked; });
      var payload = { name: name, desc: desc || "–", by: currentUser.username, ts: Date.now(), category: cat, roles: roles };
      var op = editKey ? db.ref("commands/" + editKey).update(payload) : db.ref("commands").push(payload);
      return op.then(function () {
        if (typeof resetCmdForm === "function") resetCmdForm();
        var catEl = document.getElementById("cmdCategory"); if (catEl) catEl.value = "";
        paintCmdRoles({});
        logAct("hat einen Command gespeichert", name);
        toast("Gespeichert ✓");
        loadCommands();
      });
    }).catch(function () {});
  };

  var _editCommand = window.editCommand;
  window.editCommand = function (key, name, desc) {
    if (_editCommand) _editCommand(key, name, desc);
    var item = (commandsCache || {})[key] || {};
    var cat = document.getElementById("cmdCategory");
    if (cat) cat.value = item.category || "";
    paintCmdRoles(item.roles || {});
  };

  window.loadCommands = function () {
    paintCmdRoles({});
    db.ref("commands").once("value").then(function (snap) {
      var data = snap.val() || {};
      commandsCache = data;
      var entries = Object.entries(data).reverse();
      var el = document.getElementById("commandsList");
      if (!el) return;
      var q = (cmdFilter || "").toLowerCase();
      var role = uiRole();
      entries = entries.filter(function (p) {
        var item = p[1] || {};
        if (q && ((item.name || "") + " " + (item.desc || "") + " " + (item.category || "")).toLowerCase().indexOf(q) < 0) return false;
        if (item.roles && role && role !== "owner") {
          if (item.roles[role] === false) return false;
        }
        return true;
      });
      if (!entries.length) { el.innerHTML = "<div class=\"empty\">Keine Commands</div>"; return; }
      var grouped = {};
      entries.forEach(function (p) {
        var cat = (p[1].category || "Allgemein").trim() || "Allgemein";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(p);
      });
      el.innerHTML = Object.keys(grouped).map(function (cat) {
        return "<div class=\"perm-g\">" + e(cat) + "</div>" + grouped[cat].map(function (pair) {
          var key = pair[0], item = pair[1];
          var roles = item.roles || {};
          var icons = Object.keys(Object.assign({}, DEFAULT_ROLES, rolesCache)).sort(function (a, b) {
            return (roleObj(b).priority || 0) - (roleObj(a).priority || 0);
          }).filter(function (id) { return roles[id] !== false; }).map(iconFor).join(" ");
          var cmd = String(item.name || "").split(/\s+/)[0];
          return "<div class=\"item\"><div style=\"flex:1;min-width:0\"><div class=\"name\">" + e(item.name) + " <span class=\"cmd-icons\">" + icons + "</span></div>" +
            "<div>" + e(item.desc) + "</div><div class=\"meta\">" + e(fmt(item.ts)) + " · " + e(item.by || "") + "</div></div>" +
            "<div style=\"display:flex;gap:6px\"><button class=\"btn-icon\" title=\"Nur Command kopieren\" onclick=\"copyText('" + e(cmd).replace(/'/g, "") + "')\">📋</button>" +
            (hasPerm("commands.manage") ? "<button class=\"btn-icon\" onclick=\"editCommand('" + key + "','" + e(item.name) + "','" + e(item.desc) + "')\">✏️</button><button class=\"btn-icon\" onclick=\"removeItem('commands','" + key + "')\">✕</button>" : "") +
            "</div></div>";
        }).join("");
      }).join("");
    });
  };

  var _loadArchive = window.loadArchive;
  window.loadArchive = function () {
    var el = document.getElementById("archiveList");
    if (!el) return;
    var archived = [];
    Object.entries(allBans || {}).forEach(function (p) { if (p[1].archived) archived.push(Object.assign({}, p[1], { type: "Ban", group: "mod", key: p[0], path: "bans" })); });
    Object.entries(allKicks || {}).forEach(function (p) { if (p[1].archived) archived.push(Object.assign({}, p[1], { type: "Kick", group: "mod", key: p[0], path: "kicks" })); });
    Object.entries(allHelp || {}).forEach(function (p) { if (p[1].archived) archived.push(Object.assign({}, p[1], { name: p[1].by, reason: p[1].msg, type: "Hilfe", group: "help", key: p[0], path: "helpRequests" })); });
    Object.entries(notesCache || {}).forEach(function (p) { if (p[1].archived) archived.push(Object.assign({}, p[1], { name: p[1].title || "Notiz", reason: p[1].text, type: "Notiz", group: "other", key: p[0], path: "notes" })); });
    Object.entries(tasksCache || {}).forEach(function (p) {
      if (p[1].archived || p[1].status === "archived" || p[1].status === "done") {
        archived.push(Object.assign({}, p[1], { name: p[1].title, reason: (p[1].doneBy ? "erledigt von " + p[1].doneBy : p[1].desc), type: "Aufgabe", group: "tasks", key: p[0], path: "staffTasks" }));
      }
    });
    archived.sort(function (a, b) { return (b.archivedAt || b.doneAt || b.ts || 0) - (a.archivedAt || a.doneAt || a.ts || 0); });
    var q = ((document.getElementById("tmArchSearch") || {}).value || "").toLowerCase();
    var g = ((document.getElementById("tmArchGroup") || {}).value) || "all";
    if (g !== "all") archived = archived.filter(function (x) { return x.group === g; });
    if (q) archived = archived.filter(function (x) {
      return ((x.name || "") + " " + (x.reason || "") + " " + (x.type || "") + " " + (x.by || "")).toLowerCase().indexOf(q) >= 0;
    });
    var canHard = isOwnerRole() && !previewRole;
    var filters = '<div class="form-row"><input id="tmArchSearch" class="search" placeholder="Archiv suchen…" oninput="loadArchive()"><select id="tmArchGroup" onchange="loadArchive()">' +
      '<option value="all">Alle</option><option value="mod">🛡️ Moderation</option><option value="help">🚨 Hilfe</option><option value="tasks">📋 Aufgaben</option><option value="other">📝 Sonstiges</option></select></div>';
    if (document.getElementById("tmArchSearch")) {
      /* keep values */
    }
    var head = el.previousElementSibling;
    el.innerHTML = (archived.length ? archived.map(function (item) {
      return "<div class=\"item expired\"><div><div class=\"name\">[" + e(item.type) + "] " + e(item.name || "") + "</div><div>" + e(item.reason || "") + "</div>" +
        "<div class=\"meta\">" + e(fmt(item.ts)) + " · von " + e(item.by || "") + (item.doneBy ? " · erledigt " + e(item.doneBy) + " " + e(fmt(item.doneAt)) : "") + "</div></div>" +
        (canHard ? "<button class=\"btn-icon\" onclick=\"hardDelete('" + item.path + "','" + item.key + "')\">🗑</button>" : "") + "</div>";
    }).join("") : "<div class=\"empty\">Archiv leer</div>");
    var card = el.parentNode;
    if (card && !document.getElementById("tmArchSearch")) {
      var wrap = document.createElement("div");
      wrap.innerHTML = filters;
      card.insertBefore(wrap, el);
    } else if (document.getElementById("tmArchGroup")) {
      document.getElementById("tmArchGroup").value = g;
    }
  };

  var _hardDelete = window.hardDelete;
  window.hardDelete = function (path, key) {
    if (!isHardOwner() && !(currentUser && currentUser.role === "owner" && !previewRole)) return toast("Nur Owner");
    if (_hardDelete) return _hardDelete(path, key);
    if (!confirm("Endgültig löschen?")) return;
    db.ref(path + "/" + key).remove().then(function () { toast("Endgültig weg"); });
  };

  window.doLogin = function () {
    var user = document.getElementById("loginUser").value.trim().toLowerCase();
    var pass = document.getElementById("loginPass").value;
    if (!user || !pass) return showLoginError("Bitte alles ausfüllen");
    if (user === ownerName() && pass === (typeof OWNER_PASS === "string" ? OWNER_PASS : "")) {
      currentUser = { username: user, role: "owner", mustChangePw: false };
      afterLogin();
      return;
    }
    db.ref("staffUsers/" + user).once("value").then(function (snap) {
      var data = snap.val();
      if (!data || data.password !== pass) return showLoginError("Falsche Zugangsdaten");
      if (data.disabled) return showLoginError("Account deaktiviert");
      var role = data.role || "helper";
      if (role === "owner" && data.ownerUntil && Date.now() > data.ownerUntil) {
        role = "admin";
        db.ref("staffUsers/" + user).update({ role: "admin" });
      }
      currentUser = { username: user, role: role, mustChangePw: data.mustChangePw === true };
      db.ref("staffUsers/" + user).update({ lastLogin: Date.now() });
      afterLogin();
    }).catch(function () { showLoginError("Verbindungsfehler"); });
  };

  var _showApp = window.showApp;
  window.showApp = function () {
    _showApp();
    injectCss();
    injectUi();
    startTm();
    applyChrome();
    paintSettings();
    paintCmdRoles({});
    setTimeout(applyChrome, 500);
    setTimeout(tmMaybePopup, 600);
    setTimeout(hideLiveStand, 400);
  };

  window.showTab = function (name) {
    if (name === "users") { name = "team"; tmSub = "members"; }
    if (name === "team" && !(isOwnerRole() && !previewRole)) { toast("Nur Owner"); name = "moderation"; }
    var names = ["moderation", "help", "commands", "settings", "community", "website", "archive", "users", "team", "mytasks", "rulesedit"];
    names.forEach(function (t) {
      var el = document.getElementById("tab-" + t);
      if (el) el.classList.toggle("hidden", t !== name);
    });
    document.querySelectorAll(".tabs > .tab").forEach(function (t) { t.classList.remove("active"); });
    var ev = window.event;
    var clicked = ev && ev.target && ev.target.closest ? ev.target.closest(".tabs > .tab") : null;
    if (clicked && name !== "team") clicked.classList.add("active");
    else {
      var map = { team: "teamTabBtn", mytasks: "myTasksTabBtn", rulesedit: "rulesTabBtn" };
      var btn = document.getElementById(map[name]) || document.querySelector('.tabs > .tab[data-tab="' + name + '"]');
      if (btn) btn.classList.add("active");
    }
    if (name === "help") loadHelp();
    if (name === "commands") loadCommands();
    if (name === "archive") loadArchive();
    if (name === "website") { loadWebsitePanel(); hideLiveStand(); }
    if (name === "community") renderCommunity();
    if (name === "team") tmShowSub(tmSub || "dash");
    if (name === "mytasks") tmRenderMyTasks();
    if (name === "settings") paintSettings();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { injectCss(); injectUi(); });
  else { injectCss(); injectUi(); }
  if (typeof currentUser !== "undefined" && currentUser) {
    setTimeout(function () { injectUi(); startTm(); applyChrome(); }, 200);
  }
})();
