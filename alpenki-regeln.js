/* AlpenSMP – Homepage: sichtbarer Regeln-Button + AlpenKI kennt das Regelwerk */
(function () {
  if (window.__alpenRulesHome) return;
  window.__alpenRulesHome = true;

  function injectCss() {
    if (document.getElementById("alpenRulesHomeCss")) return;
    var s = document.createElement("style");
    s.id = "alpenRulesHomeCss";
    s.textContent = [
      ".nav-regeln,.btn-regeln{font-weight:700!important}",
      ".nav-regeln{color:#fff!important;background:rgba(199,62,62,.18)!important;border:1px solid rgba(229,57,53,.4);border-radius:10px}",
      ".nav-regeln::after{display:none!important}",
      ".nav-regeln:hover{background:rgba(199,62,62,.28)!important;color:#fff!important}",
      ".btn-regeln{background:rgba(199,62,62,.14)!important;border:1px solid rgba(229,57,53,.45)!important;color:#fff!important}"
    ].join("");
    document.head.appendChild(s);
  }

  function addLink(parent, href, text, className, id) {
    if (!parent || document.getElementById(id)) return;
    var a = document.createElement("a");
    a.id = id;
    a.href = href;
    a.className = className || "";
    a.textContent = text;
    parent.appendChild(a);
    return a;
  }

  function injectLinks() {
    var ul = document.querySelector(".nav-links");
    if (ul && !document.getElementById("navRulesLink")) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.id = "navRulesLink";
      a.href = "/regeln/";
      a.className = "nav-regeln";
      a.textContent = "📜 Server-Regeln";
      li.appendChild(a);
      var cta = ul.querySelector(".nav-cta");
      if (cta && cta.parentElement) ul.insertBefore(li, cta.parentElement);
      else ul.appendChild(li);
    }

    var mobile = document.getElementById("mobileMenu");
    if (mobile && !document.getElementById("mobileRulesLink")) {
      var ma = document.createElement("a");
      ma.id = "mobileRulesLink";
      ma.href = "/regeln/";
      ma.textContent = "📜 Server-Regeln";
      ma.style.color = "#fecaca";
      ma.style.fontWeight = "700";
      var first = mobile.querySelector("a");
      if (first) mobile.insertBefore(ma, first.nextSibling);
      else mobile.appendChild(ma);
    }

    var hero = document.querySelector(".hero-btns");
    if (hero && !document.getElementById("heroRulesBtn")) {
      var hb = document.createElement("a");
      hb.id = "heroRulesBtn";
      hb.href = "/regeln/";
      hb.className = "btn btn-secondary btn-regeln";
      hb.textContent = "📜 Server-Regeln";
      hero.appendChild(hb);
    }

    document.querySelectorAll(".footer-col").forEach(function (col) {
      if (col.querySelector('a[href="/regeln/"], a[href="https://alpensmp.net/regeln/"]')) return;
      var title = (col.querySelector("h4") || {}).textContent || "";
      if (title.indexOf("Rechtliches") !== -1 || title.indexOf("Community") !== -1) {
        var fa = document.createElement("a");
        fa.href = "/regeln/";
        fa.textContent = "📜 Server-Regeln";
        col.insertBefore(fa, col.children[1] || null);
      }
    });

    var faq = document.querySelector("#faq .container, #faq");
    if (faq && !document.getElementById("faq-q-regeln-live")) {
      var box = document.createElement("div");
      box.className = "faq-item reveal";
      box.innerHTML = '<button class="faq-q" aria-expanded="false" id="faq-q-regeln-live">Wo finde ich die Serverregeln? <span class="arr" aria-hidden="true">↓</span></button>' +
        '<div class="faq-a" id="faq-a-regeln-live"><div class="faq-a-inner">Auf der eigenen Seite <a href="/regeln/" style="color:var(--red2);font-weight:700">alpensmp.net/regeln</a> – 14 verbindliche Regeln. AlpenKI kennt das Regelwerk und kann z. B. „Darf ich X-Ray?“ beantworten.</div></div>';
      var list = faq.querySelector(".faq-item") ? faq : faq;
      var items = faq.querySelectorAll(".faq-item");
      if (items.length) items[0].parentNode.insertBefore(box, items[0]);
      var btn = box.querySelector(".faq-q");
      btn.addEventListener("click", function () {
        var on = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", on ? "false" : "true");
        box.querySelector(".faq-a").classList.toggle("open", !on);
        box.classList.toggle("open", !on);
      });
    }

    var h4 = document.querySelector(".ai-header h4");
    if (h4) h4.textContent = "🤖 AlpenKI";
    var greet = document.querySelector("#aiMessages .ai-msg.bot");
    if (greet && greet.textContent.indexOf("Regel") === -1) {
      greet.textContent = "Hallo! Ich kenne das offizielle AlpenSMP-Regelwerk. Frag z. B. nach der IP, Discord – oder „Darf ich X-Ray?“, „Sind Sodium und Freecam erlaubt?“";
    }
  }

  function wrapAI() {
    if (typeof window.aiReply !== "function") return;
    if (window.aiReply.__alpenRules) return;
    var orig = window.aiReply;
    window.aiReply = function (q) {
      if (typeof window.alpenRulesAnswer === "function") {
        var hit = window.alpenRulesAnswer(q, window.ALPEN_RULES_LIVE);
        if (hit) return hit;
      }
      return orig(q);
    };
    window.aiReply.__alpenRules = true;
  }

  function boot() {
    injectCss();
    injectLinks();
    wrapAI();
    if (typeof window.alpenLoadRules === "function") window.alpenLoadRules(function () { wrapAI(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 400);
})();
