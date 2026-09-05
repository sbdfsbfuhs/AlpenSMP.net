/* AlpenSMP – Owner/berechtigte können das öffentliche Regelwerk verwalten */
(function () {
  if (window.__alpenRulesEditor) return;
  window.__alpenRulesEditor = true;

  var historyCache = {};
  var draft = null;
  var showHistory = false;

  function canEdit() {
    if (typeof window.tmHasPerm === "function") return window.tmHasPerm("rules.manage");
    if (!window.currentUser) return false;
    var ou = typeof OWNER_USER === "string" ? OWNER_USER : "owner";
    return currentUser.username === ou || currentUser.role === "owner";
  }

  function attrEsc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "\u0026amp;")
      .replace(/"/g, "\u0026quot;")
      .replace(/</g, "\u0026lt;");
  }
  function e(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }
  function fmt(ts) {
    if (!ts) return "–";
    return new Date(ts).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function injectUi() {
    var tabs = document.querySelector(".tabs");
    if (tabs && !document.getElementById("rulesTabBtn")) {
      var b = document.createElement("button");
      b.className = "tab";
      b.id = "rulesTabBtn";
      b.type = "button";
      b.style.display = "none";
      b.setAttribute("data-tab", "rulesedit");
      b.textContent = "📜 Regelwerk";
      b.onclick = function () { if (typeof showTab === "function") showTab("rulesedit"); };
      tabs.appendChild(b);
    }
    var wrap = document.querySelector(".container");
    if (wrap && !document.getElementById("tab-rulesedit")) {
      var d = document.createElement("div");
      d.id = "tab-rulesedit";
      d.className = "hidden";
      d.innerHTML = [
        '<div class="card">',
        "<h2>📜 Öffentliches Regelwerk</h2>",
        '<p class="desc">Zentrale Quelle für <a href="https://alpensmp.net/regeln/" target="_blank" rel="noopener" style="color:#fda4af">alpensmp.net/regeln</a> und die AlpenKI. Inaktive Regeln erscheinen nicht öffentlich.</p>',
        '<div class="tm-sub" style="margin-bottom:14px">',
        '<button class="tab active" type="button" id="reTabEdit" onclick="reShowPanel(false)">Bearbeiten</button>',
        '<button class="tab" type="button" id="reTabHist" onclick="reShowPanel(true)">Änderungsverlauf</button>',
        "</div>",
        '<div id="reEditPanel">',
        '<textarea id="reIntro" placeholder="Einleitungstext"></textarea>',
        '<div id="reList"></div>',
        '<div class="form-row" style="margin-top:12px">',
        '<button class="btn" type="button" onclick="reAddRule()">+ Regel</button>',
        '<button class="btn" type="button" onclick="reSaveRules()">Speichern & live schalten</button>',
        '<button class="btn btn-ghost" type="button" onclick="reResetRules()">Auf 14 Standard-Regeln zurück</button>',
        "</div>",
        '<p class="hint" id="reStatus"></p>',
        "</div>",
        '<div id="reHistPanel" class="hidden"><div class="list" id="reHistList"></div></div>',
        "</div>"
      ].join("");
      wrap.appendChild(d);
    }
  }

  function ensureDraft() {
    if (!draft) draft = window.alpenNormalizeRules(window.ALPEN_RULES_LIVE || window.ALPEN_DEFAULT_RULES);
    return draft;
  }

  window.reShowPanel = function (hist) {
    showHistory = !!hist;
    var a = document.getElementById("reEditPanel");
    var b = document.getElementById("reHistPanel");
    if (a) a.classList.toggle("hidden", showHistory);
    if (b) b.classList.toggle("hidden", !showHistory);
    var te = document.getElementById("reTabEdit");
    var th = document.getElementById("reTabHist");
    if (te) te.classList.toggle("active", !showHistory);
    if (th) th.classList.toggle("active", showHistory);
    if (showHistory) rePaintHistory();
  };

  window.reRenderEditor = function () {
    var pack = ensureDraft();
    var intro = document.getElementById("reIntro");
    if (intro) intro.value = pack.intro || "";
    var list = document.getElementById("reList");
    if (!list) return;
    list.innerHTML = pack.rules.map(function (r, i) {
      var off = r.active === false;
      return '<div class="card" style="margin:12px 0;border-left:4px solid ' + (off ? "#64748b" : (r.highlight ? "#e53935" : "#334155")) + '">' +
        '<div class="form-row"><input data-re="id" data-i="' + i + '" type="number" value="' + r.id + '" style="max-width:90px" title="Regelnummer">' +
        '<input data-re="title" data-i="' + i + '" value="' + attrEsc(r.title) + '" placeholder="Titel">' +
        '<label class="switch" style="min-width:130px"><input type="checkbox" data-re="highlight" data-i="' + i + '"' + (r.highlight ? " checked" : "") + "> Wichtig</label>" +
        '<label class="switch" style="min-width:150px"><input type="checkbox" data-re="active" data-i="' + i + '"' + (off ? "" : " checked") + "> Aktiv / öffentlich</label></div>" +
        '<textarea data-re="paragraphs" data-i="' + i + '" placeholder="Absätze, ein Absatz pro Zeile">' + attrEsc((r.paragraphs || []).join("\n")) + "</textarea>" +
        '<textarea data-re="forbidden" data-i="' + i + '" placeholder="Verboten (eine Zeile pro Punkt)">' + attrEsc((r.forbidden || []).join("\n")) + "</textarea>" +
        '<textarea data-re="allowed" data-i="' + i + '" placeholder="Erlaubt (eine Zeile pro Punkt)">' + attrEsc((r.allowed || []).join("\n")) + "</textarea>" +
        '<textarea data-re="bullets" data-i="' + i + '" placeholder="Liste / Strafen (eine Zeile pro Punkt)">' + attrEsc((r.bullets || []).join("\n")) + "</textarea>" +
        '<textarea data-re="note" data-i="' + i + '" placeholder="Hervorgehobener Hinweis">' + attrEsc(r.note || "") + "</textarea>" +
        '<div class="form-row">' +
        '<button class="btn btn-ghost btn-sm" type="button" onclick="reMoveRule(' + i + ',-1)">↑</button>' +
        '<button class="btn btn-ghost btn-sm" type="button" onclick="reMoveRule(' + i + ',1)">↓</button>' +
        '<button class="btn btn-ghost btn-sm" type="button" onclick="reDelRule(' + i + ')">Regel entfernen</button>' +
        "</div></div>";
    }).join("");
  };

  function readDraft() {
    var pack = ensureDraft();
    var intro = document.getElementById("reIntro");
    pack.intro = intro ? intro.value : pack.intro;
    pack.rules.forEach(function (r, i) {
      var g = function (key) { return document.querySelector('[data-re="' + key + '"][data-i="' + i + '"]'); };
      if (g("id")) r.id = Number(g("id").value) || (i + 1);
      if (g("title")) r.title = g("title").value;
      if (g("highlight")) r.highlight = g("highlight").checked;
      if (g("active")) r.active = g("active").checked;
      if (g("paragraphs")) r.paragraphs = g("paragraphs").value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      if (g("forbidden")) r.forbidden = g("forbidden").value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      if (g("allowed")) r.allowed = g("allowed").value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      if (g("bullets")) r.bullets = g("bullets").value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      if (g("note")) r.note = g("note").value.trim();
      r.order = i + 1;
    });
    draft = pack;
    return pack;
  }

  window.reAddRule = function () {
    var pack = readDraft();
    var next = pack.rules.reduce(function (m, r) { return Math.max(m, Number(r.id) || 0); }, 0) + 1;
    pack.rules.push({ id: next, title: "Neue Regel", paragraphs: [""], forbidden: [], allowed: [], bullets: [], note: "", highlight: false, active: true, order: pack.rules.length + 1 });
    draft = pack;
    window.reRenderEditor();
  };
  window.reDelRule = function (i) {
    var pack = readDraft();
    pack.rules.splice(i, 1);
    draft = pack;
    window.reRenderEditor();
  };
  window.reMoveRule = function (i, dir) {
    var pack = readDraft();
    var j = i + dir;
    if (j < 0 || j >= pack.rules.length) return;
    var tmp = pack.rules[i];
    pack.rules[i] = pack.rules[j];
    pack.rules[j] = tmp;
    pack.rules.forEach(function (r, idx) { r.order = idx + 1; });
    draft = pack;
    window.reRenderEditor();
  };
  window.reResetRules = function () {
    if (!confirm("Auf die 14 Original-Regeln zurücksetzen? Ungespeicherte Änderungen gehen verloren.")) return;
    draft = window.alpenNormalizeRules(window.ALPEN_DEFAULT_RULES);
    window.reRenderEditor();
    toast("Standard geladen – noch Speichern klicken");
  };
  window.reSaveRules = function () {
    var go = (typeof window.tmAssertPerm === "function") ? window.tmAssertPerm("rules.manage") : (canEdit() ? Promise.resolve(true) : Promise.reject(new Error("perm")));
    go.then(function () {
      var pack = readDraft();
      var prev = window.ALPEN_RULES_LIVE || {};
      var summary = summarizeChange(prev, pack);
      return window.alpenSaveRules(pack, { by: currentUser.username, summary: summary }).then(function () {
        if (window.db) db.ref("staffActivity").push({ by: currentUser.username, role: currentUser.role || "", action: "hat das öffentliche Regelwerk aktualisiert", target: summary, ts: Date.now() });
        var st = document.getElementById("reStatus");
        if (st) st.textContent = "Live gespeichert ✓  –  " + new Date().toLocaleString("de-DE") + " · " + summary;
        toast("Regelwerk live ✓");
      });
    }).catch(function () { toast("Keine Berechtigung oder Speichern fehlgeschlagen"); });
  };

  function summarizeChange(prev, next) {
    var a = (prev && prev.rules) || [];
    var b = (next && next.rules) || [];
    if (a.length !== b.length) return a.length + " → " + b.length + " Regeln";
    var bits = [];
    b.forEach(function (r, i) {
      var o = a[i] || {};
      if (JSON.stringify(r) !== JSON.stringify(o)) bits.push("Regel " + r.id + " geändert");
    });
    return bits.length ? bits.join(", ") : (b.length + " Regeln gespeichert");
  }

  function listenHistory() {
    if (!window.db || window.__reHistOn) return;
    window.__reHistOn = true;
    db.ref("staffRuleHistory").limitToLast(40).on("value", function (s) {
      historyCache = s.val() || {};
      if (showHistory) rePaintHistory();
    });
  }

  function rePaintHistory() {
    var el = document.getElementById("reHistList");
    if (!el) return;
    var entries = Object.entries(historyCache).map(function (p) {
      return Object.assign({ _id: p[0] }, p[1] || {});
    }).sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
    if (!entries.length) { el.innerHTML = '<div class="empty">Noch kein Verlauf – nach dem ersten Speichern erscheint er hier.</div>'; return; }
    el.innerHTML = entries.map(function (h) {
      var pack = h.pack || {};
      var n = (pack.rules || []).length;
      return '<div class="item"><div style="flex:1;min-width:0"><div class="name">' + e(h.summary || (n + " Regeln")) + "</div>" +
        '<div class="meta">Geändert von: ' + e(h.by || "–") + " · " + e(fmt(h.ts)) + "</div>" +
        '<div class="form-row" style="margin-top:8px">' +
        '<button class="btn btn-sm" type="button" onclick="rePreviewHist(\'' + h._id + "')\">Ansehen</button>" +
        '<button class="btn btn-ghost btn-sm" type="button" onclick="reRestoreHist(\'' + h._id + "')\">↩️ Wiederherstellen</button>" +
        "</div><div id=\"rePrev-" + h._id + "\" class=\"meta\" style=\"display:none;margin-top:8px;white-space:pre-wrap\"></div></div></div>";
    }).join("");
  }

  window.rePreviewHist = function (id) {
    var h = historyCache[id];
    var box = document.getElementById("rePrev-" + id);
    if (!h || !box) return;
    if (box.style.display === "block") { box.style.display = "none"; return; }
    var rules = ((h.pack || {}).rules) || [];
    box.textContent = rules.map(function (r) {
      return "Regel " + r.id + (r.active === false ? " (inaktiv)" : "") + " · " + (r.title || "") + "\n" + ((r.paragraphs || []).join("\n"));
    }).join("\n\n");
    box.style.display = "block";
  };
  window.reRestoreHist = function (id) {
    var h = historyCache[id];
    if (!h || !h.pack) return toast("Kein Inhalt");
    if (!confirm("Diese Version live schalten? Die aktuelle Version wird vorher im Verlauf gespeichert.")) return;
    var go = (typeof window.tmAssertPerm === "function") ? window.tmAssertPerm("rules.manage") : Promise.resolve(true);
    go.then(function () {
      draft = window.alpenNormalizeRules(h.pack);
      return window.alpenSaveRules(draft, { by: currentUser.username, summary: "Wiederhergestellt: " + (h.summary || fmt(h.ts)) }).then(function () {
        window.reRenderEditor();
        window.reShowPanel(false);
        toast("Alte Version live ✓");
      });
    }).catch(function () {});
  };

  var _showApp = window.showApp;
  if (typeof _showApp === "function") {
    window.showApp = function () {
      var ret = _showApp.apply(this, arguments);
      injectUi();
      var btn = document.getElementById("rulesTabBtn");
      if (btn) btn.style.display = canEdit() ? "inline-block" : "none";
      if (typeof window.alpenLoadRules === "function") {
        window.alpenLoadRules(function (pack) {
          draft = window.alpenNormalizeRules(pack);
        });
      }
      listenHistory();
      return ret;
    };
  }

  var _showTab = window.showTab;
  if (typeof _showTab === "function") {
    window.showTab = function (name) {
      if (name === "rulesedit" && !canEdit()) {
        toast("Keine Berechtigung");
        return _showTab.call(this, "moderation");
      }
      var ret = _showTab.apply(this, arguments);
      var el = document.getElementById("tab-rulesedit");
      if (el) el.classList.toggle("hidden", name !== "rulesedit");
      if (name === "rulesedit") {
        draft = window.alpenNormalizeRules(window.ALPEN_RULES_LIVE || window.ALPEN_DEFAULT_RULES);
        window.reRenderEditor();
        var btn = document.getElementById("rulesTabBtn");
        if (btn) {
          document.querySelectorAll(".tabs > .tab").forEach(function (t) { t.classList.remove("active"); });
          btn.classList.add("active");
        }
      }
      return ret;
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", injectUi);
  else injectUi();
})();
