/* Season-Loader.
   Live-Wert: Firebase /season  (Staff-Center schreibt das)
   Fallback:  /season.json      { "active": "halloween" }
*/
(function () {
  var FB = "https://alpensmp-ad844-default-rtdb.europe-west1.firebasedatabase.app/season.json";
  var allowed = { default: 1, halloween: 1, christmas: 1, newyear: 1, easter: 1, spring: 1 };
  var labels = {
    halloween: "🎃 Spooky Season",
    christmas: "🎄 Frohe Weihnachten",
    newyear: "🎆 Gutes neues Jahr",
    easter: "🐣 Frohe Ostern",
    spring: "🌸 Willkommen Frühling",
  };
  var current = "";
  var stopFx = function () {};

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function piece(className, html) {
    var node = document.createElement("span");
    node.className = className;
    node.style.setProperty("--x", rand(0, 100) + "%");
    node.style.setProperty("--sway", rand(-70, 70) + "px");
    node.style.setProperty("--rot", rand(180, 720) + "deg");
    if (html) node.innerHTML = html;
    return node;
  }

  function field(root, count, build) {
    var nodes = [];
    var alive = true;
    function birth() {
      if (!alive || nodes.length >= count) return;
      var node = build();
      root.appendChild(node);
      nodes.push(node);
      node.addEventListener("animationend", function () {
        if (!alive) return;
        node.remove();
        nodes = nodes.filter(function (item) { return item !== node; });
        birth();
      });
    }
    var i;
    for (i = 0; i < count; i += 1) birth();
    return function () {
      alive = false;
      nodes.forEach(function (node) { node.remove(); });
    };
  }

  function start(name) {
    stopFx();
    var old = document.getElementById("season-overlay");
    if (old) old.remove();
    if (name === "default" || reduced()) return;
    var root = document.createElement("div");
    root.id = "season-overlay";
    document.body.appendChild(root);
    if (name === "halloween") {
      stopFx = field(root, 6, function () {
        var node = piece("fx fx-up");
        node.style.setProperty("--d", rand(16, 26) + "s");
        node.style.setProperty("--o", String(rand(0.16, 0.4)));
        node.style.setProperty("--s", rand(18, 34) + "px");
        node.innerHTML = '<svg viewBox="0 0 32 40" width="1em" height="1.25em" aria-hidden="true"><path fill="#fff" d="M16 1c-8 0-13 7-13 15v18l4-3 4 4 5-4 5 4 4-4 4 3V16C29 8 24 1 16 1zm-5 16a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm10 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>';
        return node;
      });
    } else if (name === "christmas") {
      stopFx = field(root, 26, function () {
        var node = piece("fx fx-down", "❄");
        node.style.setProperty("--d", rand(10, 20) + "s");
        node.style.setProperty("--o", String(rand(0.35, 0.85)));
        node.style.setProperty("--s", rand(10, 22) + "px");
        node.style.color = Math.random() > 0.8 ? "#d8dde6" : "#fff";
        return node;
      });
    } else if (name === "newyear") {
      var colors = ["#ffd700", "#f5f5f5", "#cc0000"];
      stopFx = field(root, 28, function () {
        var node = piece("fx fx-confetti");
        node.style.setProperty("--d", rand(4.5, 8) + "s");
        node.style.setProperty("--o", "0.9");
        node.style.setProperty("--c", colors[Math.floor(Math.random() * colors.length)]);
        node.style.setProperty("--w", rand(6, 10) + "px");
        node.style.setProperty("--h", rand(8, 14) + "px");
        return node;
      });
    } else if (name === "easter") {
      var pastels = ["#f6c6ea", "#a8d5a2", "#fde68a", "#bfdbfe"];
      stopFx = field(root, 8, function () {
        var node = piece("fx fx-up", "●");
        node.style.setProperty("--d", rand(18, 28) + "s");
        node.style.setProperty("--o", String(rand(0.15, 0.32)));
        node.style.setProperty("--s", rand(10, 16) + "px");
        node.style.color = pastels[Math.floor(Math.random() * pastels.length)];
        return node;
      });
    } else if (name === "spring") {
      stopFx = field(root, 16, function () {
        var node = piece("fx fx-petal", "🌸");
        node.style.setProperty("--d", rand(12, 20) + "s");
        node.style.setProperty("--o", String(rand(0.28, 0.55)));
        node.style.setProperty("--s", rand(12, 20) + "px");
        node.style.setProperty("--sway", rand(40, 140) + "px");
        return node;
      });
    }
  }

  function apply(name) {
    if (!allowed[name]) name = "default";
    if (name === current) return;
    current = name;
    document.documentElement.setAttribute("data-season", name);
    document.documentElement.dataset.seasonLabel = labels[name] || "";
    window.dispatchEvent(new Event("alpen-season"));
    start(name);
  }

  function fromFile() {
    return fetch("/season.json", { cache: "no-store" })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) { apply(data && data.active); })
      .catch(function () { apply("default"); });
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
  pull();
  window.setInterval(pull, 180000);
})();
