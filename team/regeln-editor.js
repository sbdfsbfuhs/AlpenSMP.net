/* AlpenSMP – Owner kann das öffentliche Regelwerk im Staff Center bearbeiten */
(function () {
  if (window.__alpenRulesEditor) return;
  window.__alpenRulesEditor = true;

  function isOwner() {
    if (!window.currentUser) return false;
    var ou = typeof OWNER_USER === "string" ? OWNER_USER : "owner";
    return currentUser.username === ou || currentUser.role === "owner";
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
        '<p class="desc">Änderungen erscheinen live auf <a href="https://alpensmp.net/regeln/" target="_blank" rel="noopener" style="color:#fda4af">alpensmp.net/regeln</a> und sind die Wissensquelle der AlpenKI. Nur Owner.</p>',
        '<textarea id="reIntro" placeholder="Einleitungstext"></textarea>',
        '<div id="reList"></div>',
        '<div class="form-row" style="margin-top:12px">',
        '<button class="btn" type="button" onclick="reAddRule()">+ Regel</button>',
        '<button class="btn" type="button" onclick="reSaveRules()">Speichern & live schalten</button>',
        '<button class="btn btn-ghost" type="button" onclick="reResetRules()">Auf 14 Standard-Regeln zurück</button>',
        "</div>",
        '<p class="hint" id="reStatus"></p>',
        "</div>"
      ].join("");
      wrap.appendChild(d);
    }
  }

  var draft = null;

  function ensureDraft() {
    if (!draft) draft = window.alpenNormalizeRules(window.ALPEN_RULES_LIVE || window.ALPEN_DEFAULT_RULES);
    return draft;
  }

  function attrEsc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "\u0026amp;")
      .replace(/"/g, "\u0026quot;")
      .replace(/</g, "\u0026lt;");
  }

  window.reRenderEditor = function () {
    var pack = ensureDraft();
    var intro = document.getElementById("reIntro");
    if (intro) intro.value = pack.intro || "";
    var list = document.getElementById("reList");
    if (!list) return;
    list.innerHTML = pack.rules.map(function (r, i) {
      return '<div class="card" style="margin:12px 0;border-left:4px solid ' + (r.highlight ? "#e53935" : "#334155") + '">' +
        '<div class="form-row"><input data-re="id" data-i="' + i + '" type="number" value="' + r.id + '" style="max-width:90px">' +
        '<input data-re="title" data-i="' + i + '" value="' + attrEsc(r.title) + '" placeholder="Titel">' +
        '<label class="switch" style="min-width:160px"><input type="checkbox" data-re="highlight" data-i="' + i + '"' + (r.highlight ? " checked" : "") + "> Wichtig</label></div>" +
        '<textarea data-re="paragraphs" data-i="' + i + '" placeholder="Absätze, ein Absatz pro Zeile">' + attrEsc((r.paragraphs || []).join("\n")) + "</textarea>" +
        '<textarea data-re="forbidden" data-i="' + i + '" placeholder="Verboten (eine Zeile pro Punkt)">' + attrEsc((r.forbidden || []).join("\n")) + "</textarea>" +
        '<textarea data-re="allowed" data-i="' + i + '" placeholder="Erlaubt (eine Zeile pro Punkt)">' + attrEsc((r.allowed || []).join("\n")) + "</textarea>" +
        '<textarea data-re="bullets" data-i="' + i + '" placeholder="Liste / Strafen (eine Zeile pro Punkt)">' + attrEsc((r.bullets || []).join("\n")) + "</textarea>" +
        '<textarea data-re="note" data-i="' + i + '" placeholder="Hervorgehobener Hinweis">' + attrEsc(r.note || "") + "</textarea>" +
        '<button class="btn btn-ghost btn-sm" type="button" onclick="reDelRule(' + i + ')">Regel entfernen</button></div>';
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
      if (g("paragraphs")) r.paragraphs = g("paragraphs").value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      if (g("forbidden")) r.forbidden = g("forbidden").value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      if (g("allowed")) r.allowed = g("allowed").value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      if (g("bullets")) r.bullets = g("bullets").value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      if (g("note")) r.note = g("note").value.trim();
    });
    draft = pack;
    return pack;
  }

  window.reAddRule = function () {
    var pack = readDraft();
    var next = pack.rules.reduce(function (m, r) { return Math.max(m, Number(r.id) || 0); }, 0) + 1;
    pack.rules.push({ id: next, title: "Neue Regel", paragraphs: [""], forbidden: [], allowed: [], bullets: [], note: "", highlight: false });
    draft = pack;
    window.reRenderEditor();
  };
  window.reDelRule = function (i) {
    var pack = readDraft();
    pack.rules.splice(i, 1);
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
    if (!isOwner()) return toast("Nur Owner");
    var pack = readDraft();
    window.alpenSaveRules(pack, { by: currentUser.username }).then(function () {
      if (window.db) db.ref("staffActivity").push({ by: currentUser.username, role: currentUser.role || "", action: "hat das öffentliche Regelwerk aktualisiert", target: pack.rules.length + " Regeln", ts: Date.now() });
      var st = document.getElementById("reStatus");
      if (st) st.textContent = "Live gespeichert ✓  –  " + new Date().toLocaleString("de-DE");
      toast("Regelwerk live ✓");
    }).catch(function () { toast("Speichern fehlgeschlagen"); });
  };

  var _showApp = window.showApp;
  if (typeof _showApp === "function") {
    window.showApp = function () {
      var ret = _showApp.apply(this, arguments);
      injectUi();
      var btn = document.getElementById("rulesTabBtn");
      if (btn) btn.style.display = isOwner() ? "inline-block" : "none";
      if (typeof window.alpenLoadRules === "function") {
        window.alpenLoadRules(function (pack) {
          draft = window.alpenNormalizeRules(pack);
        });
      }
      return ret;
    };
  }

  var _showTab = window.showTab;
  if (typeof _showTab === "function") {
    window.showTab = function (name) {
      if (name === "rulesedit" && !isOwner()) {
        toast("Nur Owner");
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
