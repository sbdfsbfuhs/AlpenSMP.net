/* AlpenSMP Guide App 0.6 */
(function () {
  var DONE_KEY = "alpensmp-guide-done-v2";
  var PATH_KEY = "alpensmp-guide-path-v2";
  var data = window.ALPEN_GUIDE || { categories: [], topics: [], faq: [] };
  var path = null, openTopic = null, stepIdx = 0;
  function loadDone() { try { return JSON.parse(localStorage.getItem(DONE_KEY) || "{}"); } catch (e) { return {}; } }
  function saveDone(m) { try { localStorage.setItem(DONE_KEY, JSON.stringify(m)); } catch (e) {} }
  function topics() {
    return (data.topics || []).filter(function (t) {
      if (t.active === false) return false;
      if (path === "alpen") return t.track === "alpen" || t.track === "both";
      if (path === "mc") return true;
      return false;
    }).sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  }
  function byCat(id) { return topics().filter(function (t) { return t.cat === id; }); }
  function cats() {
    return (data.categories || []).filter(function (c) {
      if (c.active === false) return false;
      if (path === "alpen" && c.track === "mc") return false;
      return byCat(c.id).length;
    });
  }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">"); }
  function dashHtml() {
    var done = loadDone(); var all = topics();
    var nDone = all.filter(function (t) { return done[t.id]; }).length;
    var pct = all.length ? Math.round(nDone / all.length * 100) : 0;
    var cards = cats().map(function (c) {
      var list = byCat(c.id); var d = list.filter(function (t) { return done[t.id]; }).length;
      return '<div class="alpen-card dash-cat"><div class="badge ' + (c.track === "mc" ? "mc" : "alpen") + '">' + esc(c.icon + " " + c.title) + "</div><p>" + esc(c.desc || "") + "</p><strong>" + d + " / " + list.length + " abgeschlossen</strong></div>";
    }).join("");
    return '<div class="progress-box"><h2>Dein Fortschritt</h2><div class="bar"><i style="width:' + pct + '%"></i></div><p class="hint">' + pct + " % · " + nDone + " von " + all.length + " Themen abgeschlossen</p></div><div class="dash-grid">" + cards + "</div>";
  }
  function faqHtml(q) {
    var faq = data.faq || [];
    if (q) faq = faq.filter(function (f) { return (f.q + " " + f.a).toLowerCase().indexOf(q) !== -1; });
    if (!faq.length) return "";
    return "<section class='chapter'><h2>Häufige Fragen</h2>" + faq.map(function (f) { return "<details class='more'><summary>" + esc(f.q) + "</summary><p>" + f.a + "</p></details>"; }).join("") + "<p style='margin-top:14px'><a class='btn btn-p' href='https://alpensmp.net/regeln/'>Offizielle Server-Regeln</a></p></section>";
  }
  function listHtml(q) {
    q = (q || "").toLowerCase().trim(); var done = loadDone();
    return cats().map(function (c) {
      var items = byCat(c.id).filter(function (t) {
        if (!q) return true;
        return (t.title + " " + t.desc + " " + (t.keywords || "") + JSON.stringify(t.steps || [])).toLowerCase().indexOf(q) !== -1;
      });
      if (!items.length) return "";
      return "<section class='chapter'><div class='badge " + (c.track === "mc" ? "mc" : "alpen") + "'>" + esc(c.icon + " " + c.title) + "</div>" + items.map(function (t) {
        var ok = !!done[t.id];
        return "<div class='topic-row'><div><strong>" + esc(t.icon || "") + " " + esc(t.title) + "</strong><p>" + esc(t.desc || "") + "</p></div><button type='button' class='btn " + (ok ? "btn-ok" : "btn-p") + "' data-open='" + t.id + "'>" + (ok ? "Abgeschlossen" : "Starten") + "</button></div>";
      }).join("") + "</section>";
    }).join("") + faqHtml(q);
  }
  function topicView() {
    var t = (data.topics || []).filter(function (x) { return x.id === openTopic; })[0]; if (!t) return;
    var steps = t.steps || [{ title: t.title, text: t.desc || "" }];
    if (stepIdx < 0) stepIdx = 0; if (stepIdx >= steps.length) stepIdx = steps.length - 1;
    var s = steps[stepIdx];
    var img = s.image ? "<img class='alpen-step-img' src='" + esc(s.image) + "' alt=''>" : "";
    var tip = s.tip ? "<div class='alpen-tip'><strong>Tipp:</strong> " + s.tip + "</div>" : "";
    var warn = s.warn ? "<div class='alpen-warn'><strong>Wichtig:</strong> " + s.warn + "</div>" : "";
    var root = document.getElementById("chapterRoot");
    root.innerHTML = "<article class='chapter'><div class='badge " + (t.kind === "minecraft" ? "mc" : "alpen") + "'>" + (t.kind === "minecraft" ? "Minecraft" : "AlpenSMP") + "</div><h2>" + esc(t.icon || "") + " " + esc(t.title) + "</h2><p class='hint'>Schritt " + (stepIdx + 1) + " von " + steps.length + "</p><div class='bar'><i style='width:" + Math.round(((stepIdx + 1) / steps.length) * 100) + "%'></i></div><h3 style='margin-top:16px'>" + esc(s.title || "") + "</h3><p>" + (s.text || "") + "</p>" + img + tip + warn + "<div class='row-actions'><button type='button' class='btn btn-s' id='gBack'>Zurück</button><button type='button' class='btn btn-p' id='gNext'>" + (stepIdx === steps.length - 1 ? "Thema abschliessen" : "Weiter") + "</button><button type='button' class='btn btn-ghost' id='gClose'>Zur Übersicht</button></div></article>";
    document.getElementById("gBack").onclick = function () { if (stepIdx === 0) { openTopic = null; render(); } else { stepIdx--; topicView(); } };
    document.getElementById("gNext").onclick = function () { if (stepIdx >= steps.length - 1) { var m = loadDone(); m[t.id] = Date.now(); saveDone(m); openTopic = null; render(); } else { stepIdx++; topicView(); } };
    document.getElementById("gClose").onclick = function () { openTopic = null; render(); };
  }
  function render() {
    var dash = document.getElementById("dashRoot"); if (dash) dash.innerHTML = dashHtml();
    if (openTopic) { topicView(); return; }
    document.getElementById("chapterRoot").innerHTML = listHtml(document.getElementById("guideSearch").value);
    document.getElementById("chapterRoot").querySelectorAll("[data-open]").forEach(function (b) {
      b.onclick = function () { openTopic = b.getAttribute("data-open"); stepIdx = 0; topicView(); };
    });
  }
  function openPath(p) {
    path = p; try { localStorage.setItem(PATH_KEY, p); } catch (e) {}
    document.getElementById("chooser").classList.add("hidden");
    document.getElementById("guideApp").classList.remove("hidden");
    render();
  }
  function boot() {
    document.getElementById("pickYes").onclick = function () { openPath("alpen"); };
    document.getElementById("pickNo").onclick = function () { openPath("mc"); };
    document.getElementById("changePath").onclick = function () {
      path = null; try { localStorage.removeItem(PATH_KEY); } catch (e) {}
      document.getElementById("guideApp").classList.add("hidden");
      document.getElementById("chooser").classList.remove("hidden");
    };
    document.getElementById("guideSearch").addEventListener("input", render);
    try { var saved = localStorage.getItem(PATH_KEY); if (saved === "mc" || saved === "alpen") openPath(saved); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
