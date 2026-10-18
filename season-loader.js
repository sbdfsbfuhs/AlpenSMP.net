/* Season-Loader. Einzige Schalterdatei: /season.json → { "active": "halloween" } */
(function () {
  var allowed = { default: 1, halloween: 1, christmas: 1, easter: 1, spring: 1 };
  var labels = {
    halloween: "🎃 Spooky Season",
    christmas: "🎄 Frohe Weihnachten",
    easter: "🐣 Frohe Ostern",
    spring: "🌸 Willkommen Frühling",
  };

  function apply(name) {
    if (!allowed[name]) name = "default";
    var root = document.documentElement;
    root.setAttribute("data-season", name);
    root.dataset.seasonLabel = labels[name] || "";
    window.dispatchEvent(new Event("alpen-season"));
  }

  fetch("/season.json", { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("season");
      return res.json();
    })
    .then(function (data) {
      apply(data && data.active);
    })
    .catch(function () {
      apply("default");
    });
})();
