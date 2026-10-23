/* Season-Loader.
   Live-Wert: Firebase /season  { "active": "christmas" | "auto" | ... }
   Fallback:  /season.json, danach Datum.
   Dekoration zeichnet die React-Komponente SeasonalDecorations.
*/
(function () {
  var FB = "https://alpensmp-ad844-default-rtdb.europe-west1.firebasedatabase.app/season.json";
  var allowed = {
    default: 1, spring: 1, summer: 1, autumn: 1, halloween: 1,
    winter: 1, christmas: 1, easter: 1, newyear: 1,
  };
  var labels = {
    spring: "🌸 Willkommen Frühling",
    summer: "☀️ Sommer auf dem Berg",
    autumn: "🍂 Goldener Herbst",
    halloween: "🎃 Spooky Season",
    winter: "❄️ Winter auf AlpenSMP",
    christmas: "🎄 Frohe Weihnachten",
    easter: "🐣 Frohe Ostern",
    newyear: "🎆 Gutes neues Jahr",
  };

  function easterSunday(year) {
    var a = year % 19;
    var b = Math.floor(year / 100);
    var c = year % 100;
    var d = Math.floor(b / 4);
    var e = b % 4;
    var f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4);
    var k = c % 4;
    var l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var month = Math.floor((h + l - 7 * m + 114) / 31);
    var day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  function autoSeason(now) {
    var month = now.getMonth() + 1;
    var day = now.getDate();
    if ((month === 12 && day === 31) || (month === 1 && day === 1)) return "newyear";
    if (month === 10) return "halloween";
    if (month === 12 || (month === 1 && day <= 6)) return "christmas";
    var easter = easterSunday(now.getFullYear());
    var start = new Date(easter);
    start.setDate(easter.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    var end = new Date(easter);
    end.setDate(easter.getDate() + 1);
    end.setHours(23, 59, 59, 999);
    if (now >= start && now <= end) return "easter";
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    if (month === 9) return "autumn";
    if (month === 11 || month === 1 || month === 2) return "winter";
    return "default";
  }

  function resolve(name) {
    if (!name || name === "auto") return autoSeason(new Date());
    return allowed[name] ? name : "default";
  }

  function apply(name) {
    name = resolve(name);
    document.documentElement.setAttribute("data-season", name);
    document.documentElement.dataset.seasonLabel = labels[name] || "";
    window.dispatchEvent(new Event("alpen-season"));
  }

  function fromFile() {
    return fetch("/season.json", { cache: "no-store" })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) { apply(data && data.active); })
      .catch(function () { apply("auto"); });
  }

  function pull() {
    fetch(FB, { cache: "no-store" })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data || data.error || !data.active) return fromFile();
        apply(data.active);
      })
      .catch(function () { fromFile(); });
  }

  window.addEventListener("alpen-season-pick", function (event) {
    apply(event.detail);
  });

  var query = "";
  try { query = new URLSearchParams(window.location.search).get("season") || ""; } catch (err) { query = ""; }
  if (query) apply(query);
  else pull();
  if (!query) window.setInterval(pull, 180000);
})();
