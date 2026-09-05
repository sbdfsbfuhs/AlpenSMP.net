/* AlpenSMP Team-Management – hängt am bestehenden Staff Center, ersetzt nichts. */
(function () {
  if (window.__alpenTM) return;
  window.__alpenTM = true;

  var PERMS = [
    { g: "Team", items: [
      ["team.view", "Team-Mitglieder ansehen"],
      ["team.edit", "Team-Mitglieder bearbeiten"],
      ["team.create", "Team-Mitglieder erstellen"],
      ["team.remove", "Team-Mitglieder entfernen"],
      ["roles.view", "Rollen ansehen"],
      ["roles.edit", "Rollen bearbeiten"]
    ]},
    { g: "Moderation", items: [
      ["mod.bans.create", "Bans erstellen"],
      ["mod.bans.archive", "Bans archivieren"],
      ["mod.warns.create", "Warnungen erstellen"],
      ["mod.help.reply", "Hilfe-Anfragen beantworten"]
    ]},
    { g: "Website", items: [
      ["web.view", "Website-Einstellungen ansehen"],
      ["web.edit", "Website-Einstellungen bearbeiten"],
      ["web.stats", "Spielerzahlen bearbeiten"],
      ["web.status", "Statusmeldung ändern"]
    ]},
    { g: "Community", items: [
      ["community.reviews", "Rezensionen moderieren"],
      ["community.images", "Screenshots moderieren"]
    ]},
    { g: "Organisation", items: [
      ["org.notes", "Team-Notizen"],
      ["org.tasks", "Aufgaben verwalten"],
      ["org.announce", "Team-Ankündigungen erstellen"],
      ["org.activity", "Aktivitätsprotokoll ansehen"],
      ["org.instant", "Sofortmeldung senden"]
    ]}
  ];

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
    owner: { name: "Owner", desc: "Vollzugriff auf das Staff Center", color: "#e53935", priority: 100, locked: true, perms: allPermTrue() },
    admin: { name: "Admin", desc: "Leitung ohne Rollen-Editor", color: "#f97316", priority: 80, perms: (function () {
      var p = allPermTrue(); p["roles.edit"] = false; return p;
    })() },
    moderator: { name: "Moderator", desc: "Moderation, Community, Hilfe", color: "#38bdf8", priority: 60, perms: pick(
      "team.view", "mod.bans.create", "mod.bans.archive", "mod.warns.create", "mod.help.reply",
      "web.status", "community.reviews", "community.images", "org.notes", "org.tasks", "org.announce"
    ) },
    helper: { name: "Helper", desc: "Hilfe, Status-Banner, Notizen, eigene Aufgaben", color: "#34d399", priority: 40, perms: pick(
      "team.view", "mod.help.reply", "web.status", "org.notes", "org.tasks"
    ) },
    builder: { name: "Builder", desc: "Bauen, Notizen, Aufgaben", color: "#a78bfa", priority: 30, perms: pick(
      "team.view", "org.notes", "org.tasks"
    ) },
    developer: { name: "Developer", desc: "Website-Status und Organisation", color: "#22d3ee", priority: 50, perms: pick(
      "team.view", "web.view", "web.status", "org.notes", "org.tasks", "org.activity"
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
  var tmSub = "dash";
  var listenersOn = false;
  var popupOpen = false;

  function ownerName() { return typeof OWNER_USER === "string" ? OWNER_USER : "owner"; }
  function isHardOwner() { return !!(currentUser && currentUser.username === ownerName()); }
  function isOwnerRole() { return isHardOwner() || !!(currentUser && currentUser.role === "owner"); }
  function roleObj(id) {
    return (rolesCache && rolesCache[id]) || DEFAULT_ROLES[id] || { name: id || "–", color: "#94a3b8", priority: 0, perms: {} };
  }
  function hasPerm(key) {
    if (!currentUser) return false;
    if (isOwnerRole()) return true;
    var r = roleObj(currentUser.role);
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
  function e(s) { return typeof esc === "function" ? esc(String(s == null ? "" : s)) : String(s == null ? "" : s); }
  function randPw() { return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6); }
  function safeId(s) { return String(s || "").replace(/[^a-zA-Z0-9._-]/g, ""); }

  function injectCss() {
    if (document.getElementById("tmCss")) return;
    var s = document.createElement("style");
    s.id = "tmCss";
    s.textContent = [
      ".tm-kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:18px}",
      "@media(max-width:900px){.tm-kpis{grid-template-columns:repeat(2,1fr)}}",
      ".tm-kpi{background:rgba(0,0,0,.28);border:1px solid var(--border);border-radius:12px;padding:14px}",
      ".tm-kpi b{display:block;font-size:1.45rem;color:#fda4af}",
      ".tm-kpi span{color:var(--muted);font-size:.8rem}",
      ".tm-sub{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px;align-items:center}",
      ".tm-prio-info{color:#34d399}.tm-prio-important{color:#f59e0b}.tm-prio-urgent{color:#f87171}",
      ".tm-modal{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:4000;display:none;align-items:center;justify-content:center;padding:20px}",
      ".tm-modal.show{display:flex}",
      ".tm-modal .box{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:26px;max-width:520px;width:100%;max-height:86vh;overflow:auto;animation:fadeUp .35s ease}",
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
      "#tmNoteExtras input,#tmNoteExtras select{margin-bottom:11px}"
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
      b.innerHTML = "👑 Team-Management <span class=\"badge\" id=\"teamBadge\" style=\"display:none\">0</span>";
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
        d2.innerHTML = "<div class=\"card\"><h2>✅ Meine Aufgaben</h2><p class=\"desc\">Nur dir zugewiesen. Status kannst du selbst setzen.</p><div class=\"list\" id=\"myTasksList\"></div></div>";
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
    enhanceNotesCard();
    addInstantButton();
  }

  function teamHtml() {
    return [
      "<div class=\"tm-kpis\">",
      "<div class=\"tm-kpi\"><span>👥 Teammitglieder</span><b id=\"tmKpiUsers\">–</b></div>",
      "<div class=\"tm-kpi\"><span>🟢 Online</span><b id=\"tmKpiOnline\">–</b></div>",
      "<div class=\"tm-kpi\"><span>📢 Ungelesene Ankündigungen</span><b id=\"tmKpiAnn\">–</b></div>",
      "<div class=\"tm-kpi\"><span>✅ Offene Aufgaben</span><b id=\"tmKpiTasks\">–</b></div>",
      "<div class=\"tm-kpi\"><span>🚨 Dringende Meldungen</span><b id=\"tmKpiUrgent\">–</b></div>",
      "</div>",
      "<div class=\"tm-sub\">",
      "<button class=\"tab active\" type=\"button\" onclick=\"tmShowSub('dash')\">Übersicht</button>",
      "<button class=\"tab\" type=\"button\" onclick=\"tmShowSub('members')\">Mitglieder</button>",
      "<button class=\"tab\" type=\"button\" onclick=\"tmShowSub('roles')\">Rollen</button>",
      "<button class=\"tab\" type=\"button\" onclick=\"tmShowSub('ann')\">Ankündigungen</button>",
      "<button class=\"tab\" type=\"button\" onclick=\"tmShowSub('tasks')\">Aufgaben</button>",
      "<button class=\"tab\" type=\"button\" onclick=\"tmShowSub('notes')\">Notizen</button>",
      "<button class=\"tab\" type=\"button\" onclick=\"tmShowSub('log')\">Protokoll</button>",
      "<button class=\"btn tm-instant btn-sm\" type=\"button\" onclick=\"tmStartInstant()\">🚨 SOFORTMELDUNG</button>",
      "</div>",
      "<div id=\"tmSubDash\"></div>",
      "<div id=\"tmSubMembers\" class=\"hidden\"></div>",
      "<div id=\"tmSubRoles\" class=\"hidden\"></div>",
      "<div id=\"tmSubAnn\" class=\"hidden\"></div>",
      "<div id=\"tmSubTasks\" class=\"hidden\"></div>",
      "<div id=\"tmSubNotes\" class=\"hidden\"></div>",
      "<div id=\"tmSubLog\" class=\"hidden\"></div>"
    ].join("");
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
    db.ref("staffRoles").on("value", function (s) { rolesCache = s.val() || {}; applyChrome(); tmRefresh(); });
    db.ref("staffUsers").on("value", function (s) { usersCache = s.val() || {}; fillAssignSelects(); tmRefresh(); });
    db.ref("staffAnnouncements").on("value", function (s) {
      announcementsCache = s.val() || {};
      tmRefresh();
      tmMaybePopup();
    });
    db.ref("staffAnnouncementReads").on("value", function (s) { readsCache = s.val() || {}; tmRefresh(); });
    db.ref("staffTasks").on("value", function (s) { tasksCache = s.val() || {}; tmRefresh(); tmRenderMyTasks(); tmBadges(); });
    db.ref("notes").on("value", function (s) { notesCache = s.val() || {}; tmRenderNotesModeration(); if (tmSub === "notes") tmRenderNotes(); });
    db.ref("staffActivity").limitToLast(120).on("value", function (s) { activityCache = s.val() || {}; if (tmSub === "dash" || tmSub === "log") tmRefresh(); });
    db.ref("presence").on("value", function (s) { presenceCache = s.val() || {}; tmKpis(); });
  }

  function applyChrome() {
    var teamBtn = document.getElementById("teamTabBtn");
    if (teamBtn) teamBtn.style.display = isOwnerRole() ? "inline-block" : "none";
    var inst = document.getElementById("tmInstantTop");
    if (inst) inst.style.display = hasPerm("org.instant") ? "inline-block" : "none";
    var webBtn = document.getElementById("websiteTabBtn");
    if (webBtn && (hasPerm("web.view") || hasPerm("web.status") || hasPerm("web.stats") || hasPerm("web.edit"))) {
      webBtn.style.display = "inline-block";
    }
    var tab = document.getElementById("tab-website");
    if (tab) {
      var grid = tab.querySelector(".owner-grid");
      if (grid) grid.style.display = (isOwnerRole() || hasPerm("web.stats")) ? "" : "none";
      var cards = tab.querySelectorAll(":scope > .card");
      if (cards.length > 1) cards[cards.length - 1].style.display = (isOwnerRole() || hasPerm("web.edit")) ? "" : "none";
    }
  }

  window.tmShowSub = function (name) {
    tmSub = name;
    ["dash", "members", "roles", "ann", "tasks", "notes", "log"].forEach(function (n) {
      var el = document.getElementById("tmSub" + n.charAt(0).toUpperCase() + n.slice(1));
      if (el) el.classList.toggle("hidden", n !== name);
    });
    var bar = document.querySelector("#tab-team .tm-sub");
    if (bar) {
      var keys = ["dash", "members", "roles", "ann", "tasks", "notes", "log"];
      bar.querySelectorAll(".tab").forEach(function (t, i) {
        t.classList.toggle("active", keys[i] === name);
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
      if (readsCache[id] && readsCache[id][user]) return;
      n++;
    });
    return n;
  }
  function openTasksCount() {
    return Object.values(tasksCache || {}).filter(function (t) { return t && t.status !== "done"; }).length;
  }
  function urgentCount() {
    var now = Date.now();
    return Object.values(announcementsCache || {}).filter(function (a) {
      return a && (a.priority === "urgent" || a.instant) && !(a.expiresAt && a.expiresAt < now);
    }).length;
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
    var e1 = document.getElementById("tmKpiUrgent");
    if (e1) e1.textContent = String(urgentCount());
  }
  function tmBadges() {
    if (!currentUser) return;
    var n = unreadFor(currentUser.username);
    var tb = document.getElementById("teamBadge");
    if (tb) { tb.style.display = n ? "flex" : "none"; tb.textContent = n; }
    var mine = Object.values(tasksCache || {}).filter(function (t) {
      return t && t.assignee === currentUser.username && t.status !== "done";
    }).length;
    var mb = document.getElementById("myTasksBadge");
    if (mb) { mb.style.display = mine ? "flex" : "none"; mb.textContent = mine; }
  }

  function tmRenderDash() {
    var el = document.getElementById("tmSubDash");
    if (!el) return;
    var acts = actEntries().slice(0, 8);
    el.innerHTML = "<div class=\"card\"><h2>Letzte Aktivitäten</h2>" +
      (acts.length ? "<div class=\"list\">" + acts.map(function (x) {
        return "<div class=\"item\"><div><div class=\"name\">" + e(x.by) + "</div><div>" + e(x.action) + (x.target ? " · " + e(x.target) : "") + "</div><div class=\"meta\">" + e(fmt(x.ts)) + "</div></div></div>";
      }).join("") + "</div>" : "<div class=\"empty\">Noch keine Einträge</div>") + "</div>";
  }

  function fillAssignSelects() {
    var html = "<option value=\"\">Niemandem zugewiesen</option>" + userEntries().map(function (u) {
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
      return "<option value=\"" + e(id) + "\"" + (id === selected ? " selected" : "") + ">" + e((roleObj(id).name) || id) + "</option>";
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
      return "<div class=\"item\"><div style=\"flex:1\"><div class=\"name\"><span class=\"dot\" style=\"background:" + (online ? "var(--ok)" : "#64748b") + "\"></span>" +
        e(u._id) + " <span class=\"role-pill\" style=\"background:" + e(ro.color || "#94a3b8") + "22;color:" + e(ro.color || "#94a3b8") + "\">" + e(ro.name || u.role) + "</span>" +
        (u.disabled ? " · <span style=\"color:var(--warn)\">deaktiviert</span>" : "") + "</div>" +
        "<div class=\"meta\">Status: " + (u.disabled ? "inaktiv" : "aktiv") + " · erstellt " + e(fmt(u.createdAt)) +
        " von " + e(u.createdBy || "–") + " · letzter Login " + e(fmt(last)) + "</div>" +
        (hasPerm("team.edit") && !locked ? ("<div class=\"form-row\" style=\"margin-top:10px\">" +
          "<select id=\"tmrole-" + e(id) + "\">" + roleSelectHtml(u.role) + "</select>" +
          "<button class=\"btn btn-sm\" onclick=\"tmSaveMember('" + e(id) + "')\">Rolle speichern</button>" +
          "<button class=\"btn btn-ghost btn-sm\" onclick=\"tmToggleMember('" + e(id) + "'," + (!!u.disabled) + ")\">" + (u.disabled ? "Aktivieren" : "Deaktivieren") + "</button>" +
          "<button class=\"btn btn-ghost btn-sm\" onclick=\"tmResetPw('" + e(id) + "')\">PW reset</button>" +
          (hasPerm("team.remove") ? "<button class=\"btn btn-ghost btn-sm\" onclick=\"tmDeleteMember('" + e(id) + "')\">Löschen</button>" : "") +
          "</div>") : (locked ? "<div class=\"meta\">Owner-Account ist geschützt.</div>" : "")) +
        "</div></div>";
    }).join("");
    el.innerHTML = "<div class=\"card\"><h2>Team-Mitglieder</h2><p class=\"desc\">Die alte User-Verwaltung bleibt unter „User verwalten“.</p>" +
      (hasPerm("team.create") ? "<div class=\"form-row\"><input id=\"tmNewName\" placeholder=\"Benutzername\"><input id=\"tmNewPw\" placeholder=\"Temp. Passwort\"><select id=\"tmNewRole\">" + roleSelectHtml("helper") + "</select></div><button class=\"btn\" onclick=\"tmCreateMember()\">+ Account anlegen</button>" : "") +
      "<div class=\"list\">" + (list || "<div class=\"empty\">Keine Accounts</div>") + "</div></div>";
  }

  window.tmCreateMember = function () {
    assertPerm("team.create").then(function () {
      var username = (document.getElementById("tmNewName").value || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
      var tempPw = document.getElementById("tmNewPw").value;
      var role = document.getElementById("tmNewRole").value || "helper";
      if (!username || !tempPw) return toast("Name + Passwort nötig");
      if (username === ownerName()) return toast("Reserviert");
      return db.ref("staffUsers/" + username).once("value").then(function (snap) {
        if (snap.exists()) return toast("Existiert schon");
        return db.ref("staffUsers/" + username).set({
          password: tempPw, role: role, mustChangePw: true, createdAt: Date.now(), createdBy: currentUser.username, disabled: false
        }).then(function () {
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
      return db.ref("staffUsers/" + username).update({ role: role }).then(function () {
        logAct("hat die Rolle von " + username + " auf " + role + " geändert", username);
        toast("Rolle gespeichert ✓");
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

  function tmRenderRoles() {
    var el = document.getElementById("tmSubRoles");
    if (!el) return;
    if (!hasPerm("roles.view")) { el.innerHTML = "<div class=\"card\"><div class=\"empty\">Keine Berechtigung</div></div>"; return; }
    var merged = Object.assign({}, DEFAULT_ROLES, rolesCache);
    var cards = Object.keys(merged).sort(function (a, b) {
      return (roleObj(b).priority || 0) - (roleObj(a).priority || 0);
    }).map(function (id) {
      var r = merged[id];
      var perms = r.perms || {};
      var canEdit = hasPerm("roles.edit");
      var boxes = PERMS.map(function (g) {
        return "<div class=\"perm-g\">" + e(g.g) + "</div>" + g.items.map(function (it) {
          return "<label class=\"switch\"><input type=\"checkbox\" data-role=\"" + e(id) + "\" data-perm=\"" + it[0] + "\"" + (perms[it[0]] ? " checked" : "") + (canEdit ? "" : " disabled") + "> " + e(it[1]) + "</label>";
        }).join("");
      }).join("");
      return "<div class=\"card\" style=\"margin-bottom:14px;border-left:4px solid " + e(r.color || "#e53935") + "\"><h2>" + e(r.name || id) + " <span style=\"color:var(--muted);font-size:.9rem\">(" + e(id) + ")</span></h2>" +
        "<p class=\"desc\">" + e(r.desc || "") + " · Priorität " + e(r.priority || 0) + "</p>" +
        (canEdit ? "<div class=\"form-row\"><input id=\"rn-" + e(id) + "\" value=\"" + e(r.name || "") + "\" placeholder=\"Name\"><input id=\"rd-" + e(id) + "\" value=\"" + e(r.desc || "") + "\" placeholder=\"Beschreibung\"><input id=\"rc-" + e(id) + "\" type=\"color\" value=\"" + e(r.color || "#e53935") + "\" style=\"max-width:70px;padding:4px\"><input id=\"rp-" + e(id) + "\" type=\"number\" value=\"" + e(r.priority || 0) + "\" placeholder=\"Priorität\"></div>" : "") +
        "<div class=\"perm-grid\">" + boxes + "</div>" +
        (canEdit ? "<button class=\"btn\" onclick=\"tmSaveRole('" + e(id) + "')\">Rolle speichern</button>" + (r.locked ? "" : " <button class=\"btn btn-ghost\" onclick=\"tmDeleteRole('" + e(id) + "')\">Löschen</button>") : "") +
        "</div>";
    }).join("");
    el.innerHTML = "<div class=\"card\" style=\"margin-bottom:14px\"><h2>🔐 Rollen & Berechtigungen</h2><p class=\"desc\">Checkboxen gelten wirklich – jede Schreib-Funktion prüft die Rolle in Firebase, nicht nur das Interface.</p>" +
      (hasPerm("roles.edit") ? "<div class=\"form-row\"><input id=\"tmRoleId\" placeholder=\"id (z.B. trial)\"><input id=\"tmRoleName\" placeholder=\"Anzeigename\"></div><button class=\"btn\" onclick=\"tmNewRole()\">+ Rolle anlegen</button>" : "") +
      "</div>" + cards;
  }

  window.tmSaveRole = function (id) {
    id = safeId(id);
    assertPerm("roles.edit").then(function () {
      var perms = {};
      document.querySelectorAll("input[data-role=\"" + id + "\"]").forEach(function (box) { perms[box.getAttribute("data-perm")] = box.checked; });
      var prev = Object.assign({}, DEFAULT_ROLES[id] || {}, rolesCache[id] || {});
      var body = {
        name: (document.getElementById("rn-" + id) || {}).value || prev.name || id,
        desc: (document.getElementById("rd-" + id) || {}).value || prev.desc || "",
        color: (document.getElementById("rc-" + id) || {}).value || prev.color || "#e53935",
        priority: Number((document.getElementById("rp-" + id) || {}).value || prev.priority || 0),
        locked: !!prev.locked,
        perms: perms
      };
      return db.ref("staffRoles/" + id).set(body).then(function () {
        logAct("hat Rolle gespeichert", id);
        toast("Rolle gespeichert ✓");
      });
    }).catch(function () {});
  };
  window.tmNewRole = function () {
    assertPerm("roles.edit").then(function () {
      var id = (document.getElementById("tmRoleId").value || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
      var name = (document.getElementById("tmRoleName").value || "").trim() || id;
      if (!id) return toast("ID fehlt");
      return db.ref("staffRoles/" + id).set({
        name: name, desc: "", color: "#94a3b8", priority: 10, locked: false, perms: pick("team.view", "org.notes")
      }).then(function () { logAct("hat eine Rolle erstellt", id); toast("Rolle angelegt"); });
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
    var staffN = userEntries().filter(function (u) { return !u.disabled; }).length || 1;
    var list = entries.map(function (pair) {
      var id = pair[0], a = pair[1] || {};
      var reads = readsCache[id] || {};
      var n = Object.keys(reads).length;
      var who = Object.keys(reads).join(", ") || "noch niemand";
      var cls = a.priority === "urgent" || a.instant ? "tm-prio-urgent" : a.priority === "important" ? "tm-prio-important" : "tm-prio-info";
      var prio = a.instant ? "🚨 Sofort" : a.priority === "urgent" ? "🔴 Dringend" : a.priority === "important" ? "🟡 Wichtig" : "🟢 Information";
      return "<div class=\"item\"><div style=\"flex:1\"><div class=\"name " + cls + "\">" + prio + " · " + e(a.title) + "</div>" +
        "<div>" + e(a.message) + "</div>" +
        "<div class=\"meta\">" + e(fmt(a.ts)) + " · " + e(a.by || "") + (a.expiresAt ? " · bis " + e(fmt(a.expiresAt)) : "") + "</div>" +
        "<div class=\"meta\">Gelesen: " + n + "/" + staffN + " Teammitglieder · " + e(who) + "</div></div></div>";
    }).join("");
    el.innerHTML = "<div class=\"card\"><h2>📢 Team-Ankündigungen</h2>" +
      (hasPerm("org.announce") ? "<input id=\"tmAnnTitle\" placeholder=\"Titel\"><textarea id=\"tmAnnMsg\" placeholder=\"Nachricht\"></textarea><div class=\"form-row\"><select id=\"tmAnnPrio\"><option value=\"info\">🟢 Information</option><option value=\"important\">🟡 Wichtig</option><option value=\"urgent\">🔴 Dringend</option></select><input id=\"tmAnnExp\" type=\"datetime-local\"></div><button class=\"btn\" onclick=\"tmCreateAnn(false)\">+ Ankündigung</button>" : "") +
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
    var user = currentUser.username;
    var now = Date.now();
    var unread = Object.entries(announcementsCache || {}).filter(function (pair) {
      var a = pair[1];
      if (!a) return false;
      if (a.expiresAt && a.expiresAt < now) return false;
      if (readsCache[pair[0]] && readsCache[pair[0]][user]) return false;
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

  function taskStatusLabel(st) {
    return st === "done" ? "🟢 Erledigt" : st === "progress" ? "🟡 In Bearbeitung" : "⚪ Offen";
  }
  function tmRenderTasks() {
    var el = document.getElementById("tmSubTasks");
    if (!el) return;
    var all = isOwnerRole() || hasPerm("org.tasks");
    var entries = Object.entries(tasksCache || {}).sort(function (a, b) { return (b[1].ts || 0) - (a[1].ts || 0); }).filter(function (p) {
      return all || (p[1] && p[1].assignee === currentUser.username);
    });
    var list = entries.map(function (pair) {
      var id = pair[0], t = pair[1] || {};
      return "<div class=\"item\"><div style=\"flex:1\"><div class=\"name\">" + e(t.title) + " · " + taskStatusLabel(t.status) + "</div>" +
        "<div>" + e(t.desc || "") + "</div>" +
        "<div class=\"meta\">für " + e(t.assignee || "–") + " · Prio " + e(t.priority || "info") + " · fällig " + e(fmt(t.due)) + " · erstellt " + e(fmt(t.ts)) + "</div>" +
        "<div class=\"form-row\" style=\"margin-top:8px\">" +
        "<button class=\"btn-quick\" onclick=\"tmSetTask('" + id + "','open')\">⚪ Offen</button>" +
        "<button class=\"btn-quick\" onclick=\"tmSetTask('" + id + "','progress')\">🟡 In Bearbeitung</button>" +
        "<button class=\"btn-quick\" onclick=\"tmSetTask('" + id + "','done')\">🟢 Erledigt</button></div></div></div>";
    }).join("");
    el.innerHTML = "<div class=\"card\"><h2>✅ Aufgaben</h2>" +
      (hasPerm("org.tasks") ? "<input id=\"tmTaskTitle\" placeholder=\"Titel\"><textarea id=\"tmTaskDesc\" placeholder=\"Beschreibung\"></textarea><div class=\"form-row\"><select id=\"tmTaskAssignee\"></select><select id=\"tmTaskPrio\"><option value=\"info\">Normal</option><option value=\"important\">Wichtig</option><option value=\"urgent\">Dringend</option></select><input id=\"tmTaskDue\" type=\"datetime-local\"></div><button class=\"btn\" onclick=\"tmCreateTask()\">+ Aufgabe</button>" : "") +
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
        title: title, desc: desc, assignee: assignee, priority: priority,
        status: "open", ts: Date.now(), due: dueRaw ? new Date(dueRaw).getTime() : null, by: currentUser.username
      }).then(function () {
        logAct("hat eine Aufgabe erstellt", title + " → " + assignee);
        toast("Aufgabe angelegt");
        document.getElementById("tmTaskTitle").value = "";
        document.getElementById("tmTaskDesc").value = "";
      });
    }).catch(function () {});
  };
  window.tmSetTask = function (id, status) {
    var t = (tasksCache || {})[id];
    if (!t || !currentUser) return;
    var mine = t.assignee === currentUser.username;
    var go = mine ? Promise.resolve(true) : assertPerm("org.tasks");
    go.then(function () {
      return db.ref("staffTasks/" + id).update({ status: status, updatedAt: Date.now(), updatedBy: currentUser.username }).then(function () {
        logAct("hat Aufgabenstatus auf " + status + " gesetzt", t.title || id);
      });
    }).catch(function () {});
  };
  function tmRenderMyTasks() {
    var el = document.getElementById("myTasksList");
    if (!el || !currentUser) return;
    var entries = Object.entries(tasksCache || {}).sort(function (a, b) { return (b[1].ts || 0) - (a[1].ts || 0); }).filter(function (p) { return p[1] && p[1].assignee === currentUser.username; });
    el.innerHTML = entries.length ? entries.map(function (pair) {
      var id = pair[0], t = pair[1];
      return "<div class=\"item\"><div style=\"flex:1\"><div class=\"name\">" + e(t.title) + " · " + taskStatusLabel(t.status) + "</div><div>" + e(t.desc || "") + "</div>" +
        "<div class=\"meta\">fällig " + e(fmt(t.due)) + "</div>" +
        "<div class=\"form-row\" style=\"margin-top:8px\"><button class=\"btn-quick\" onclick=\"tmSetTask('" + id + "','open')\">⚪ Offen</button>" +
        "<button class=\"btn-quick\" onclick=\"tmSetTask('" + id + "','progress')\">🟡 In Bearbeitung</button>" +
        "<button class=\"btn-quick\" onclick=\"tmSetTask('" + id + "','done')\">🟢 Erledigt</button></div></div></div>";
    }).join("") : "<div class=\"empty\">Keine Aufgaben für dich</div>";
  }
  window.tmRenderMyTasks = tmRenderMyTasks;

  function tmRenderNotes() {
    var el = document.getElementById("tmSubNotes");
    if (!el) return;
    el.innerHTML = "<div class=\"card\"><h2>📝 Team-Notizen</h2><p class=\"desc\">Dieselben Notizen wie unter Moderation – mit Titel, Prio, Zuweisung und Archiv.</p><input type=\"search\" id=\"tmNoteSearch\" class=\"search\" placeholder=\"Suchen…\" oninput=\"tmRenderNotes()\"><div class=\"list\" id=\"tmNoteList\"></div></div>";
    tmPaintNotes(document.getElementById("tmNoteList"), (document.getElementById("tmNoteSearch") || {}).value || "");
  }
  window.tmRenderNotesModeration = function () {
    tmPaintNotes(document.getElementById("noteList"), (document.getElementById("noteSearch") || {}).value || "");
  };
  function tmPaintNotes(el, q) {
    if (!el) return;
    q = (q || "").toLowerCase();
    var entries = Object.entries(notesCache || {}).sort(function (a, b) { return (b[1].ts || 0) - (a[1].ts || 0); }).filter(function (p) {
      var n = p[1] || {};
      if (n.archived) return false;
      var blob = ((n.title || "") + " " + (n.text || "") + " " + (n.by || "") + " " + (n.assignedTo || "")).toLowerCase();
      return !q || blob.indexOf(q) !== -1;
    });
    el.innerHTML = entries.length ? entries.map(function (pair) {
      var id = pair[0], n = pair[1] || {};
      var cls = n.priority === "urgent" ? "tm-prio-urgent" : n.priority === "important" ? "tm-prio-important" : "";
      var prio = n.priority === "urgent" ? "🔴 " : n.priority === "important" ? "🟡 " : "";
      return "<div class=\"item\"><div style=\"flex:1\"><div class=\"name " + cls + "\">" + prio + e(n.title || "Notiz") + (n.assignedTo ? " → " + e(n.assignedTo) : "") + "</div>" +
        "<div>" + e(n.text || "") + "</div><div class=\"meta\">" + e(fmt(n.ts)) + " · " + e(n.by || "") + "</div></div>" +
        "<button class=\"btn-icon\" title=\"Archivieren\" onclick=\"tmArchiveNote('" + id + "')\">✕</button></div>";
    }).join("") : "<div class=\"empty\">Keine Notizen</div>";
  }
  window.tmArchiveNote = function (id) {
    assertPerm("org.notes").then(function () {
      return db.ref("notes/" + id).update({ archived: true, archivedBy: currentUser.username, archivedAt: Date.now() }).then(function () {
        logAct("hat eine Notiz archiviert", id);
      });
    }).catch(function () {});
  };

  function tmRenderLog() {
    var el = document.getElementById("tmSubLog");
    if (!el) return;
    if (!hasPerm("org.activity")) { el.innerHTML = "<div class=\"card\"><div class=\"empty\">Keine Berechtigung</div></div>"; return; }
    el.innerHTML = "<div class=\"card\"><h2>📋 Aktivitätsprotokoll</h2><div class=\"form-row\"><input id=\"tmLogUser\" placeholder=\"Filter Benutzer\" oninput=\"tmPaintLog()\"><input id=\"tmLogAct\" placeholder=\"Filter Aktion\" oninput=\"tmPaintLog()\"></div><div class=\"list\" id=\"tmLogList\"></div></div>";
    tmPaintLog();
  }
  window.tmPaintLog = function () {
    var el = document.getElementById("tmLogList");
    if (!el) return;
    var u = ((document.getElementById("tmLogUser") || {}).value || "").toLowerCase();
    var a = ((document.getElementById("tmLogAct") || {}).value || "").toLowerCase();
    var entries = actEntries().filter(function (x) {
      if (u && String(x.by || "").toLowerCase().indexOf(u) < 0) return false;
      if (a && (String(x.action || "") + " " + String(x.target || "")).toLowerCase().indexOf(a) < 0) return false;
      return true;
    });
    el.innerHTML = entries.length ? entries.map(function (x) {
      return "<div class=\"item\"><div><div class=\"name\">" + e(x.by) + "</div><div>" + e(x.action) + (x.target ? " · " + e(x.target) : "") + "</div><div class=\"meta\">" + e(fmt(x.ts)) + (x.role ? " · " + e(x.role) : "") + "</div></div></div>";
    }).join("") : "<div class=\"empty\">Keine Einträge</div>";
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
  wrap("saveCommand", "web.edit", "hat einen Command gespeichert");

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
    else if (path === "commands") perm = "web.edit";
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
    setTimeout(applyChrome, 500);
    setTimeout(tmMaybePopup, 600);
  };

  window.showTab = function (name) {
    if (name === "team" && !isOwnerRole()) { toast("Nur Owner"); name = "moderation"; }
    var names = ["moderation", "help", "commands", "settings", "community", "website", "archive", "users", "team", "mytasks", "rulesedit"];
    names.forEach(function (t) {
      var el = document.getElementById("tab-" + t);
      if (el) el.classList.toggle("hidden", t !== name);
    });
    document.querySelectorAll(".tabs > .tab").forEach(function (t) { t.classList.remove("active"); });
    var ev = window.event;
    var clicked = ev && ev.target && ev.target.closest ? ev.target.closest(".tabs > .tab") : null;
    if (clicked) clicked.classList.add("active");
    else {
      var btn = document.querySelector('.tabs > .tab[data-tab="' + name + '"]');
      if (btn) btn.classList.add("active");
    }
    if (name === "users") loadUsers();
    if (name === "help") loadHelp();
    if (name === "commands") loadCommands();
    if (name === "archive") loadArchive();
    if (name === "website") loadWebsitePanel();
    if (name === "community") renderCommunity();
    if (name === "team") tmShowSub(tmSub || "dash");
    if (name === "mytasks") tmRenderMyTasks();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { injectCss(); injectUi(); });
  else { injectCss(); injectUi(); }
  if (typeof currentUser !== "undefined" && currentUser) {
    setTimeout(function () { injectUi(); startTm(); applyChrome(); }, 200);
  }
})();
