/* Einheitliche AlpenKI wie auf /regeln/ */
(function () {
  if (window.__alpenKiWidget) return;
  window.__alpenKiWidget = true;
  if (location.pathname.toLowerCase().indexOf("/team") === 0) return;
  if (document.getElementById("aiToggle") && document.getElementById("aiPanel")) return;
  var css = document.createElement("style");
  css.textContent = ".ai-toggle{position:fixed;right:20px;bottom:20px;z-index:60;width:56px;height:56px;border-radius:16px;border:1px solid rgba(199,62,62,.45);background:linear-gradient(135deg,#b91c1c,#c73e3e);color:#fff;font-size:1.3rem;cursor:pointer;box-shadow:0 10px 30px rgba(199,62,62,.38)}.ai-panel{position:fixed;right:20px;bottom:88px;z-index:60;width:min(380px,calc(100vw - 24px));max-height:min(520px,70vh);background:rgba(12,16,24,.97);border:1px solid rgba(255,255,255,.08);border-radius:18px;display:none;flex-direction:column;overflow:hidden}.ai-panel.open{display:flex}.ai-h{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08);font-family:Outfit,Inter,sans-serif}.ai-msgs{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px}.ai-m{max-width:92%;padding:10px 14px;border-radius:12px;font-size:.9rem}.ai-m.bot{background:rgba(255,255,255,.05);color:#c5cbd6;align-self:flex-start}.ai-m.user{background:rgba(199,62,62,.2);align-self:flex-end}.ai-row{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(255,255,255,.08)}.ai-row input{flex:1;min-height:44px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:#0c1018;color:#fff;padding:0 12px}.ai-row button{min-height:44px;border:0;border-radius:10px;background:linear-gradient(135deg,#b91c1c,#c73e3e);color:#fff;font-weight:700;padding:0 14px;cursor:pointer}";
  document.head.appendChild(css);
  var wrap = document.createElement("div");
  wrap.innerHTML = "<button class='ai-toggle' id='aiToggle' type='button' aria-label='AlpenKI öffnen'>\uD83E\uDD16</button><div class='ai-panel' id='aiPanel'><div class='ai-h'><strong>\uD83E\uDD16 AlpenKI</strong><button type='button' id='aiClose' aria-label='Schließen' style='background:none;border:0;color:#fff;font-size:20px;cursor:pointer'>×</button></div><div class='ai-msgs' id='aiMsgs'><div class='ai-m bot'>Frag mich zu Regeln, Join, Voice oder Commands. Ich erfinde nichts.</div></div><div class='ai-row'><input id='aiInp' placeholder='Frage zu AlpenSMP...'><button type='button' id='aiSend'>Senden</button></div></div>";
  document.body.appendChild(wrap);
  var panel = document.getElementById("aiPanel");
  document.getElementById("aiToggle").onclick = function () { panel.classList.toggle("open"); };
  document.getElementById("aiClose").onclick = function () { panel.classList.remove("open"); };
  function answer(q) {
    if (typeof window.aiReply === "function") return window.aiReply(q);
    if (typeof window.alpenRulesAnswer === "function") {
      var r = window.alpenRulesAnswer(q, window.ALPEN_RULES_PUBLIC || window.ALPEN_RULES_LIVE);
      if (r) return r;
    }
    var query = String(q || "").toLowerCase();
    if (/join|beitreten|ip|bedrock/.test(query)) return "Java: alpensmp.falixsrv.me · Bedrock: Port 27491. Empfohlen 1.21.11.";
    if (/voice/.test(query)) return "Simple Voice Chat ist optional. Ohne Mod kannst du trotzdem joinen.";
    if (/command|befehl|spawn|home|tpa/.test(query)) return "Bestätigte Befehle: /spawn /sethome /home /homes /tpa /back /rtp /msg /call admin.";
    return "Dazu habe ich aktuell keine bestätigte Information.";
  }
  function send() {
    var inp = document.getElementById("aiInp");
    var q = (inp.value || "").trim();
    if (!q) return;
    var msgs = document.getElementById("aiMsgs");
    var u = document.createElement("div"); u.className = "ai-m user"; u.textContent = q; msgs.appendChild(u);
    inp.value = "";
    var b = document.createElement("div"); b.className = "ai-m bot"; b.textContent = answer(q); msgs.appendChild(b);
    msgs.scrollTop = msgs.scrollHeight;
  }
  document.getElementById("aiSend").onclick = send;
  document.getElementById("aiInp").addEventListener("keydown", function (e) { if (e.key === "Enter") send(); });
})();
