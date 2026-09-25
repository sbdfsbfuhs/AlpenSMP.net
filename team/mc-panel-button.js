(function () {
  var PANEL_URL = "http://92.5.174.100:3000";

  function inject() {
    var app = document.getElementById("app");
    if (!app || app.dataset.mcPanelInjected) return;
    var panicWrap = app.querySelector(".container > div");
    if (!panicWrap) return;
    app.dataset.mcPanelInjected = "1";

    var card = document.createElement("div");
    card.className = "card";
    card.style.margin = "0 auto 26px";
    card.style.maxWidth = "640px";
    card.style.textAlign = "center";
    card.innerHTML =
      "<h2>Minecraft Server Panel</h2>" +
      "<p class=\"desc\">Konsole, Start/Stopp und Dateien f\u00fcr das Team. \u00d6ffnet sich in einem neuen Tab (eigener Login).</p>" +
      "<a class=\"btn\" style=\"display:inline-block;text-decoration:none\" href=\"" +
      PANEL_URL +
      "\" target=\"_blank\" rel=\"noopener\">Panel \u00f6ffnen</a>" +
      "<p class=\"hint\">Hinweis: Das Panel l\u00e4uft auf dem VPS. Website-HTTPS kann die HTTP-Adresse nur als neuen Tab \u00f6ffnen, nicht einbetten.</p>";
    panicWrap.insertAdjacentElement("afterend", card);
  }

  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    if (document.getElementById("app") && document.getElementById("app").style.display !== "none") {
      inject();
    }
    if (tries > 80) clearInterval(timer);
  }, 400);
})();
