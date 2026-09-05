/* AlpenSMP – offizielles Regelwerk (Wissensquelle für Seite + AlpenKI + Owner-Editor) */
(function (root) {
  var PAGE = "https://alpensmp.net/regeln/";
  var DISCORD = "https://discord.gg/FfR56Ddtj8";

  var DEFAULT_PACK = {
    intro: "Offizielles Regelwerk von AlpenSMP. Verbindlich beim Join – für Minecraft und, soweit genannt, Discord.",
    rules: [
      {
        id: 1,
        title: "Respekt",
        highlight: true,
        paragraphs: [
          "Behandle alle Spieler respektvoll. Beleidigungen, Mobbing, Hass, Diskriminierung, rassistische Äusserungen und toxisches Verhalten sind verboten."
        ]
      },
      {
        id: 2,
        title: "Chat",
        paragraphs: [
          "Kein Spam, unnötiges Wiederholen oder dauerhaftes GROSSSCHREIBEN. Werbung für andere Server oder Projekte ist nur mit Team-Erlaubnis erlaubt. Bleibt respektvoll und achtet darauf, wie eure Nachrichten auf andere wirken."
        ]
      },
      {
        id: 3,
        title: "Cheats & Mods",
        highlight: true,
        paragraphs: [
          "Verboten sind unter anderem:"
        ],
        forbidden: [
          "X-Ray",
          "Fly",
          "KillAura",
          "Reach",
          "ESP",
          "übermässige Autoclicker",
          "unfair vorteilhafte Makros",
          "Scripts oder Programme, die automatisch spielen"
        ],
        allowed: [
          "OptiFine",
          "Sodium",
          "Iris",
          "Freecam",
          "Xaero’s Minimap",
          "Shulker-Tooltips",
          "Inventory HUD",
          "Simple Voice Chat",
          "Performance- und Komfort-Mods"
        ],
        note: "Bei Unsicherheit gilt: Fragt das Team, bevor ihr den Mod benutzt."
      },
      {
        id: 4,
        title: "Fair Play",
        paragraphs: [
          "Kein Bugusing, Exploiten, Scammen oder Betrügen. Bugs müssen dem Team gemeldet werden. Das absichtliche Umgehen von Spielmechaniken oder Plugins ist verboten."
        ]
      },
      {
        id: 5,
        title: "Bauen & Claims",
        highlight: true,
        paragraphs: [
          "Fremde Bauwerke dürfen nicht ohne Erlaubnis verändert, beschädigt oder zerstört werden. Ungeclaimte Bauten dürfen nicht unnötig zerstört werden. Keine Claims blockieren, absichtlich Wege versperren oder andere Spieler durch Bauten gezielt stören."
        ],
        note: "Bauwerke mit sexuellen, pornografischen, extremistischen, rassistischen, diskriminierenden oder anderweitig anstössigen Inhalten sind verboten. Dies gilt auch für entsprechende Pixelarts, Schilder, Karten, Skins oder andere Darstellungen."
      },
      {
        id: 6,
        title: "Performance",
        paragraphs: [
          "Keine Lagmaschinen oder absichtliche Serverbelastung. Grosse Farmen und Redstone-Anlagen sind erlaubt, solange der Server dadurch nicht dauerhaft beeinträchtigt wird. Das Team darf problematische Anlagen anpassen, deaktivieren oder entfernen, wenn sie die Serverleistung beeinträchtigen."
        ]
      },
      {
        id: 7,
        title: "Team & Support",
        paragraphs: [
          "Teammitglieder sind respektvoll zu behandeln. Der Support darf nicht für Spam oder unnötige Diskussionen missbraucht werden. Teamentscheidungen sind grundsätzlich zu akzeptieren. Strafdiskussionen gehören nicht in den öffentlichen Chat."
        ]
      },
      {
        id: 8,
        title: "Voice Chat",
        paragraphs: [
          "Kein Schreien, absichtliches Stören, Stöhnen, extrem laute Geräusche oder störende Soundboards. Auch im Voice Chat gelten die Regeln zu Respekt, Diskriminierung und anstössigen Inhalten."
        ]
      },
      {
        id: 9,
        title: "Namen, Skins & Darstellungen",
        paragraphs: [
          "Spielernamen, Nicknames, Skins, Items, Schilder, Bücher, Karten und andere selbst erstellte Inhalte dürfen keine beleidigenden, rassistischen, diskriminierenden, sexuellen, pornografischen, extremistischen oder anderweitig unangemessenen Inhalte enthalten. Dies gilt sowohl für Minecraft als auch für Discord-Namen und Nicknames, soweit diese mit der AlpenSMP-Community in Verbindung stehen."
        ]
      },
      {
        id: 10,
        title: "Mehrfachaccounts",
        paragraphs: [
          "Java- und Bedrock-Accounts dürfen zum AFK-Stehen verwendet werden. Mehrfachaccounts dürfen jedoch nicht dazu verwendet werden, Regeln, Banns, Strafen oder andere Einschränkungen zu umgehen."
        ]
      },
      {
        id: 11,
        title: "Grundloses Töten",
        highlight: true,
        paragraphs: [
          "Grundloses Töten aus Spass ist nicht erlaubt. (ausser es sind beide Einverstanden)",
          "Wer andere Spieler ohne nachvollziehbaren Grund wiederholt tötet oder absichtlich provoziert, kann dafür bestraft werden.",
          "Wird ein Spieler nachweislich absichtlich und grundlos getötet, kann auch der Auslöser bzw. die Person, die den Konflikt bewusst begonnen hat, bestraft werden. Die Strafe fällt bei kleineren Fällen in der Regel entsprechend geringer aus."
        ]
      },
      {
        id: 12,
        title: "Unklare Fälle & Beweislage",
        highlight: true,
        paragraphs: [
          "Nicht jeder Vorfall lässt sich eindeutig aufklären. Das Team versucht grundsätzlich, Sachverhalte anhand von Logs, Beweisen, Aussagen und den vorhandenen Informationen fair zu beurteilen.",
          "Wenn der tatsächliche Täter nicht eindeutig festgestellt werden kann, kann der Owner in schwierigen Fällen eine Einzelfallentscheidung treffen. Dabei können ausnahmsweise auch mehrere beteiligte Personen sanktioniert werden, wenn eine eindeutige Zuordnung nicht möglich ist.",
          "Das bedeutet: Es ist möglich, dass jemand eine Strafe erhält, obwohl nicht zweifelsfrei bewiesen werden kann, dass diese Person allein der Täter war. Solche Entscheidungen werden nicht leichtfertig getroffen und sollen nur in Fällen angewendet werden, in denen eine faire Aufklärung nicht möglich ist."
        ]
      },
      {
        id: 13,
        title: "Owner & Einzelfallentscheidungen",
        highlight: true,
        paragraphs: [
          "Der Owner hat bei Streitfällen und unklaren Situationen das letzte Wort.",
          "Dabei gilt: Regeln können nicht jede einzelne Situation vollständig abdecken. Jeder Mensch hat eine andere Moralvorstellung und empfindet bestimmte Situationen unterschiedlich. Deshalb kann nicht jede Entscheidung jedem Spieler gefallen.",
          "Das Team versucht, fair, nachvollziehbar und nach bestem Wissen und Gewissen zu handeln. Die Regeln sollen Orientierung geben und nicht jede mögliche Situation bis ins kleinste Detail vorschreiben."
        ]
      },
      {
        id: 14,
        title: "Strafen",
        highlight: true,
        paragraphs: [
          "Je nach Schwere und Häufigkeit des Verstosses sind folgende Strafen möglich:"
        ],
        bullets: [
          "Verwarnung",
          "Kick",
          "temporärer Bann",
          "permanenter Bann",
          "weitere situationsabhängige Massnahmen"
        ],
        note: "Die Strafe richtet sich nach dem jeweiligen Fall, der Vorgeschichte und den Umständen. (du wirst in unseres System aufgenommen) Nicht jeder Verstoss wird gleich bestraft. Das Team entscheidet situationsabhängig und kann bei besonderen Umständen von einer üblichen Strafe abweichen."
      }
    ]
  };

  function clonePack(p) {
    return JSON.parse(JSON.stringify(p || DEFAULT_PACK));
  }

  function normalizePack(raw) {
    if (!raw || !Array.isArray(raw.rules) || !raw.rules.length) return clonePack(DEFAULT_PACK);
    var pack = {
      intro: raw.intro || DEFAULT_PACK.intro,
      updatedAt: raw.updatedAt || 0,
      updatedBy: raw.updatedBy || "",
      rules: raw.rules.map(function (r, i) {
        return {
          id: Number(r.id) || (i + 1),
          title: String(r.title || "Regel"),
          highlight: !!r.highlight,
          active: r.active !== false,
          order: Number(r.order != null ? r.order : (Number(r.id) || (i + 1))),
          paragraphs: Array.isArray(r.paragraphs) ? r.paragraphs.filter(Boolean) : (r.text ? [String(r.text)] : []),
          forbidden: Array.isArray(r.forbidden) ? r.forbidden.filter(Boolean) : [],
          allowed: Array.isArray(r.allowed) ? r.allowed.filter(Boolean) : [],
          bullets: Array.isArray(r.bullets) ? r.bullets.filter(Boolean) : [],
          note: r.note ? String(r.note) : ""
        };
      }).sort(function (a, b) { return (a.order - b.order) || (a.id - b.id); })
    };
    return pack;
  }

  function publicPack(raw) {
    var pack = normalizePack(raw);
    pack.rules = (pack.rules || []).filter(function (r) { return r.active !== false; });
    return pack;
  }

  function blob(r) {
    return [
      r.title || "",
      (r.paragraphs || []).join(" "),
      (r.forbidden || []).join(" "),
      (r.allowed || []).join(" "),
      (r.bullets || []).join(" "),
      r.note || ""
    ].join(" ").toLowerCase();
  }

  function findRule(pack, id) {
    var rules = (pack && pack.rules) || [];
    for (var i = 0; i < rules.length; i++) if (Number(rules[i].id) === Number(id)) return rules[i];
    return null;
  }

  function cite(r) {
    return "Regel " + r.id + " (" + r.title + ")";
  }

  function more() {
    return " Mehr dazu findest du auf " + PAGE;
  }

  function formatRule(r, prefix) {
    var parts = [];
    if (prefix) parts.push(prefix);
    else parts.push(cite(r) + ":");
    (r.paragraphs || []).forEach(function (p) { if (p) parts.push(p); });
    if (r.forbidden && r.forbidden.length) parts.push("Verboten: " + r.forbidden.join(", ") + ".");
    if (r.allowed && r.allowed.length) parts.push("Ausdrücklich erlaubt z. B.: " + r.allowed.join(", ") + ".");
    if (r.bullets && r.bullets.length) parts.push(r.bullets.join(", ") + ".");
    if (r.note) parts.push(r.note);
    parts.push("Quelle: " + PAGE);
    return parts.join(" ");
  }

  var ALIASES = [
    { id: 3, keys: ["x-ray", "xray", "x ray", "fly", "killaura", "kill aura", "reach", "esp", "autoclicker", "auto clicker", "makro", "macro", "script", "cheat", "cheats", "hack", "hacks", "hackclient", "optifine", "sodium", "iris", "freecam", "free cam", "xaero", "minimap", "shulker", "inventory hud", "mod", "mods"] },
    { id: 11, keys: ["töten", "toten", "killen", "pvp", "umbringen", "grundlos"] },
    { id: 10, keys: ["mehrfachaccount", "mehrfach", "alt account", "zweitaccount", "zweit-account", "altaccount", "afk"] },
    { id: 5, keys: ["grief", "claim", "bauen", "bauwerk", "pixelart", "pixel art", "zerstören"] },
    { id: 2, keys: ["spam", "grossschreiben", "großschreiben", "caps", "werbung", "chat"] },
    { id: 1, keys: ["respekt", "beleidig", "mobbing", "rassist", "diskrimin", "hass", "toxisch"] },
    { id: 4, keys: ["bugusing", "exploit", "scam", "betrug", "betrügen", "fair play", "fairplay"] },
    { id: 6, keys: ["lag", "lagmaschine", "redstone", "farm", "performance", "tps"] },
    { id: 8, keys: ["voice", "voicechat", "schreien", "soundboard", "stöhnen", "mikro"] },
    { id: 9, keys: ["skin", "spielername", "nickname", "schild", "buch"] },
    { id: 7, keys: ["support", "teamentscheid", "strafdiskussion"] },
    { id: 12, keys: ["unklar", "beweis", "logs", "täter"] },
    { id: 13, keys: ["owner", "letzte wort", "letztes wort", "einzelfall"] },
    { id: 14, keys: ["strafe", "strafen", "verwarnung", "bann", "ban", "kick", "regelverstoss", "regelverstoß"] }
  ];

  function isRuleQuestion(q) {
    return /regel|erlaubt|verboten|darf ich|darf man|cheat|hack|x-?ray|töten|toten|kill|ban+|strafe|mod\b|claim|grief|voice|skin|account|owner|fair ?play|respekt|werbung|lag/i.test(q);
  }

  function specialAnswer(q, pack) {
    var r3 = findRule(pack, 3);
    var r5 = findRule(pack, 5);
    var r10 = findRule(pack, 10);
    var r11 = findRule(pack, 11);
    var r13 = findRule(pack, 13);
    var r14 = findRule(pack, 14);

    if (/x-?ray/.test(q) && r3) {
      return "Nein. X-Ray ist laut " + cite(r3) + " verboten." + more();
    }
    if ((/sodium/.test(q) || /freecam/.test(q) || /optifine/.test(q) || /iris/.test(q)) && r3) {
      var named = [];
      if (/sodium/.test(q)) named.push("Sodium");
      if (/freecam/.test(q)) named.push("Freecam");
      if (/optifine/.test(q)) named.push("OptiFine");
      if (/iris/.test(q)) named.push("Iris");
      return "Ja. " + named.join(" und ") + " " + (named.length > 1 ? "sind" : "ist") + " laut " + cite(r3) + " ausdrücklich erlaubt. Bei Mods, die nicht genannt werden, solltest du vorher das Team fragen." + more();
    }
    if ((/töte|toten|killen|umbringen/.test(q)) && r11) {
      return "Grundloses Töten aus Spass ist laut " + cite(r11) + " nicht erlaubt – ausser beide Seiten sind einverstanden." + more();
    }
    if (/mehrfach|zweitaccount|alt.?account|zwei accounts/.test(q) && r10) {
      return "Ja, Java- und Bedrock-Accounts dürfen laut " + cite(r10) + " zum AFK-Stehen genutzt werden. Sie dürfen aber nicht benutzt werden, um Regeln, Banns oder Strafen zu umgehen." + more();
    }
    if (/letzte[sn]? wort|einzelfall|unklar/.test(q) && r13) {
      return "Bei Streitfällen und unklaren Situationen hat laut " + cite(r13) + " der Owner das letzte Wort. Regeln können nicht jede Situation vollständig abdecken." + more();
    }
    if (/regelverst|was passiert|strafe|bestraft|bann/.test(q) && r14 && !/mehrfach/.test(q)) {
      return "Laut " + cite(r14) + " sind je nach Fall Verwarnung, Kick, temporärer oder permanenter Bann sowie weitere Massnahmen möglich. Nicht jeder Verstoss wird gleich bestraft." + more();
    }
    if (/pixelart|porno|sexuell|rassist.*bau|anstöss/.test(q) && r5) {
      return "Laut " + cite(r5) + " sind Bauwerke mit sexuellen, pornografischen, extremistischen, rassistischen, diskriminierenden oder anstössigen Inhalten verboten – auch Pixelarts, Schilder, Karten und Skins." + more();
    }
    return null;
  }

  function answer(q, pack) {
    pack = publicPack(pack || root.ALPEN_RULES_LIVE || DEFAULT_PACK);
    var query = String(q || "").toLowerCase().trim();
    if (!query) return null;

    var num = query.match(/regel\s*(\d{1,2})/) || query.match(/§\s*(\d{1,2})/) || query.match(/\bnr\.?\s*(\d{1,2})\b/);
    if (num) {
      var n = parseInt(num[1], 10);
      var hit = findRule(pack, n);
      if (hit) return formatRule(hit);
      return "Im offiziellen AlpenSMP-Regelwerk gibt es keine Regel " + n + " (aktuell " + pack.rules.length + " Regeln). Ich erfinde keine Regeln. Alles steht auf " + PAGE;
    }

    var spec = specialAnswer(query, pack);
    if (spec) return spec;

    var scores = pack.rules.map(function (r) {
      var text = blob(r);
      var score = 0;
      query.split(/[^a-zäöüß0-9+]+/i).forEach(function (w) {
        if (w.length < 4) return;
        if (text.indexOf(w) !== -1) score += w.length;
      });
      ALIASES.forEach(function (a) {
        if (a.id !== r.id) return;
        a.keys.forEach(function (k) {
          if (query.indexOf(k) !== -1) score += k.length + 8;
        });
      });
      return { r: r, score: score };
    }).sort(function (a, b) { return b.score - a.score; });

    if (scores[0] && scores[0].score >= 8) {
      return formatRule(scores[0].r);
    }

    if (isRuleQuestion(query)) {
      return "Das steht so nicht eindeutig im offiziellen AlpenSMP-Regelwerk. Ich erfinde dazu keine Regel. Schau auf " + PAGE + " oder frag das Team auf Discord: " + DISCORD;
    }
    return null;
  }

  function getDb() {
    try {
      if (typeof db !== "undefined" && db && db.ref) return db;
      if (root.firebase && root.firebase.database) return root.firebase.database();
    } catch (e) {}
    return null;
  }

  function load(cb) {
    var done = typeof cb === "function" ? cb : function () {};
    var database = getDb();
    if (!database) {
      root.ALPEN_RULES_LIVE = clonePack(DEFAULT_PACK);
      root.ALPEN_RULES_PUBLIC = publicPack(root.ALPEN_RULES_LIVE);
      done(root.ALPEN_RULES_LIVE, false);
      return;
    }
    database.ref("site_rules").on("value", function (snap) {
      var val = snap.val();
      root.ALPEN_RULES_LIVE = normalizePack(val || DEFAULT_PACK);
      root.ALPEN_RULES_PUBLIC = publicPack(root.ALPEN_RULES_LIVE);
      done(root.ALPEN_RULES_LIVE, !!val);
    }, function () {
      root.ALPEN_RULES_LIVE = clonePack(DEFAULT_PACK);
      root.ALPEN_RULES_PUBLIC = publicPack(root.ALPEN_RULES_LIVE);
      done(root.ALPEN_RULES_LIVE, false);
    });
  }

  function save(pack, meta) {
    var database = getDb();
    if (!database) return Promise.reject(new Error("Keine Datenbank"));
    var body = normalizePack(pack);
    body.updatedAt = Date.now();
    body.updatedBy = (meta && meta.by) || "owner";
    return database.ref("site_rules").set(body).then(function () {
      try {
        database.ref("staffRuleHistory").push({
          ts: body.updatedAt,
          by: body.updatedBy,
          summary: (meta && meta.summary) || (body.rules.length + " Regeln gespeichert"),
          pack: body
        });
      } catch (err) {}
      root.ALPEN_RULES_LIVE = body;
      root.ALPEN_RULES_PUBLIC = publicPack(body);
      return body;
    });
  }

  root.ALPEN_DEFAULT_RULES = clonePack(DEFAULT_PACK);
  root.ALPEN_RULES_LIVE = clonePack(DEFAULT_PACK);
  root.ALPEN_RULES_PUBLIC = publicPack(DEFAULT_PACK);
  root.ALPEN_RULES_PAGE = PAGE;
  root.alpenNormalizeRules = normalizePack;
  root.alpenPublicRules = publicPack;
  root.alpenLoadRules = load;
  root.alpenSaveRules = save;
  root.alpenRulesAnswer = answer;
  root.alpenFindRule = findRule;
})(window);
