export type Rule = {
  id: number;
  title: string;
  highlight?: boolean;
  paragraphs: string[];
  forbidden?: string[];
  allowed?: string[];
  bullets?: string[];
  note?: string;
};

export const RULES_INTRO =
  "Offizielles Regelwerk von AlpenSMP. Verbindlich beim Join – für Minecraft und, soweit genannt, Discord.";

export const RULES: Rule[] = [
  {
    id: 1,
    title: "Respekt",
    highlight: true,
    paragraphs: [
      "Behandle alle Spieler respektvoll. Beleidigungen, Mobbing, Hass, Diskriminierung, rassistische Äusserungen und toxisches Verhalten sind verboten.",
    ],
  },
  {
    id: 2,
    title: "Chat",
    paragraphs: [
      "Kein Spam, unnötiges Wiederholen oder dauerhaftes GROSSSCHREIBEN. Werbung für andere Server oder Projekte ist nur mit Team-Erlaubnis erlaubt. Bleibt respektvoll und achtet darauf, wie eure Nachrichten auf andere wirken.",
    ],
  },
  {
    id: 3,
    title: "Cheats & Mods",
    highlight: true,
    paragraphs: ["Verboten sind unter anderem:"],
    forbidden: [
      "X-Ray",
      "Fly",
      "KillAura",
      "Reach",
      "ESP",
      "übermässige Autoclicker",
      "unfair vorteilhafte Makros",
      "Scripts oder Programme, die automatisch spielen",
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
      "Performance- und Komfort-Mods",
    ],
    note: "Bei Unsicherheit gilt: Fragt das Team, bevor ihr den Mod benutzt.",
  },
  {
    id: 4,
    title: "Fair Play",
    paragraphs: [
      "Kein Bugusing, Exploiten, Scammen oder Betrügen. Bugs müssen dem Team gemeldet werden. Das absichtliche Umgehen von Spielmechaniken oder Plugins ist verboten.",
    ],
  },
  {
    id: 5,
    title: "Bauen & Claims",
    highlight: true,
    paragraphs: [
      "Fremde Bauwerke dürfen nicht ohne Erlaubnis verändert, beschädigt oder zerstört werden. Ungeclaimte Bauten dürfen nicht unnötig zerstört werden. Keine Claims blockieren, absichtlich Wege versperren oder andere Spieler durch Bauten gezielt stören.",
    ],
    note: "Bauwerke mit sexuellen, pornografischen, extremistischen, rassistischen, diskriminierenden oder anderweitig anstössigen Inhalten sind verboten. Dies gilt auch für entsprechende Pixelarts, Schilder, Karten, Skins oder andere Darstellungen.",
  },
  {
    id: 6,
    title: "Performance",
    paragraphs: [
      "Keine Lagmaschinen oder absichtliche Serverbelastung. Grosse Farmen und Redstone-Anlagen sind erlaubt, solange der Server dadurch nicht dauerhaft beeinträchtigt wird. Das Team darf problematische Anlagen anpassen, deaktivieren oder entfernen, wenn sie die Serverleistung beeinträchtigen.",
    ],
  },
  {
    id: 7,
    title: "Team & Support",
    paragraphs: [
      "Teammitglieder sind respektvoll zu behandeln. Der Support darf nicht für Spam oder unnötige Diskussionen missbraucht werden. Teamentscheidungen sind grundsätzlich zu akzeptieren. Strafdiskussionen gehören nicht in den öffentlichen Chat.",
    ],
  },
  {
    id: 8,
    title: "Voice Chat",
    paragraphs: [
      "Kein Schreien, absichtliches Stören, Stöhnen, extrem laute Geräusche oder störende Soundboards. Auch im Voice Chat gelten die Regeln zu Respekt, Diskriminierung und anstössigen Inhalten.",
    ],
  },
  {
    id: 9,
    title: "Namen, Skins & Darstellungen",
    paragraphs: [
      "Spielernamen, Nicknames, Skins, Items, Schilder, Bücher, Karten und andere selbst erstellte Inhalte dürfen keine beleidigenden, rassistischen, diskriminierenden, sexuellen, pornografischen, extremistischen oder anderweitig unangemessenen Inhalte enthalten. Dies gilt sowohl für Minecraft als auch für Discord-Namen und Nicknames, soweit diese mit der AlpenSMP-Community in Verbindung stehen.",
    ],
  },
  {
    id: 10,
    title: "Mehrfachaccounts",
    paragraphs: [
      "Java- und Bedrock-Accounts dürfen zum AFK-Stehen verwendet werden. Mehrfachaccounts dürfen jedoch nicht dazu verwendet werden, Regeln, Banns, Strafen oder andere Einschränkungen zu umgehen.",
    ],
  },
  {
    id: 11,
    title: "Grundloses Töten",
    highlight: true,
    paragraphs: [
      "Grundloses Töten aus Spass ist nicht erlaubt. (ausser es sind beide Einverstanden)",
      "Wer andere Spieler ohne nachvollziehbaren Grund wiederholt tötet oder absichtlich provoziert, kann dafür bestraft werden.",
      "Wird ein Spieler nachweislich absichtlich und grundlos getötet, kann auch der Auslöser bzw. die Person, die den Konflikt bewusst begonnen hat, bestraft werden. Die Strafe fällt bei kleineren Fällen in der Regel entsprechend geringer aus.",
    ],
  },
  {
    id: 12,
    title: "Unklare Fälle & Beweislage",
    highlight: true,
    paragraphs: [
      "Nicht jeder Vorfall lässt sich eindeutig aufklären. Das Team versucht grundsätzlich, Sachverhalte anhand von Logs, Beweisen, Aussagen und den vorhandenen Informationen fair zu beurteilen.",
      "Wenn der tatsächliche Täter nicht eindeutig festgestellt werden kann, kann der Owner in schwierigen Fällen eine Einzelfallentscheidung treffen. Dabei können ausnahmsweise auch mehrere beteiligte Personen sanktioniert werden, wenn eine eindeutige Zuordnung nicht möglich ist.",
      "Das bedeutet: Es ist möglich, dass jemand eine Strafe erhält, obwohl nicht zweifelsfrei bewiesen werden kann, dass diese Person allein der Täter war. Solche Entscheidungen werden nicht leichtfertig getroffen und sollen nur in Fällen angewendet werden, in denen eine faire Aufklärung nicht möglich ist.",
    ],
  },
  {
    id: 13,
    title: "Owner & Einzelfallentscheidungen",
    highlight: true,
    paragraphs: [
      "Der Owner hat bei Streitfällen und unklaren Situationen das letzte Wort.",
      "Dabei gilt: Regeln können nicht jede einzelne Situation vollständig abdecken. Jeder Mensch hat eine andere Moralvorstellung und empfindet bestimmte Situationen unterschiedlich. Deshalb kann nicht jede Entscheidung jedem Spieler gefallen.",
      "Das Team versucht, fair, nachvollziehbar und nach bestem Wissen und Gewissen zu handeln. Die Regeln sollen Orientierung geben und nicht jede mögliche Situation bis ins kleinste Detail vorschreiben.",
    ],
  },
  {
    id: 14,
    title: "Strafen",
    highlight: true,
    paragraphs: ["Je nach Schwere und Häufigkeit des Verstosses sind folgende Strafen möglich:"],
    bullets: [
      "Verwarnung",
      "Kick",
      "temporärer Bann",
      "permanenter Bann",
      "weitere situationsabhängige Massnahmen",
    ],
    note: "Die Strafe richtet sich nach dem jeweiligen Fall, der Vorgeschichte und den Umständen. (du wirst in unseres System aufgenommen) Nicht jeder Verstoss wird gleich bestraft. Das Team entscheidet situationsabhängig und kann bei besonderen Umständen von einer üblichen Strafe abweichen.",
  },
];

export type Feature = {
  id: string;
  title: string;
  summary: string;
  body: string[];
};

export const FEATURES: Feature[] = [
  {
    id: "survival",
    title: "Survival",
    summary: "Klassisches Survival auf einer gemeinsamen Welt.",
    body: [
      "Klassisches Vanilla-Survival auf einer gemeinsamen Welt. Keine Pay-to-Win-Mechaniken, keine überladenen Minigames – du baust, erkundest und spielst, wie Minecraft gedacht ist.",
      "Mit fairer Community und persönlicher Serverleitung.",
    ],
  },
  {
    id: "claims",
    title: "Claims",
    summary: "GriefPrevention schützt deine Builds.",
    body: [
      "Mit GriefPrevention (Claims) schützt du deine Builds vor Griefing.",
      "Je länger du online bist, desto mehr Claim-Blöcke bekommst du. Pro 1 Stunde Spielzeit: +1000 Blöcke.",
      "Beanspruche dein Gebiet und lade Freunde ein – Fremde können dort nichts abbauen oder platzieren.",
    ],
  },
  {
    id: "voice",
    title: "Simple Voice Chat",
    summary: "Nähe-basierte Sprache direkt im Spiel.",
    body: [
      "Simple Voice Chat ist auf dem Server aktiv. Mit dem passenden Client-Mod (Java) kannst du im Spiel mit anderen sprechen – ohne extra Discord-Call.",
      "Der Mod ist optional. Ohne ihn kannst du trotzdem joinen und normal spielen. Empfohlen ist die Version passend zu Minecraft 1.21.11, zum Beispiel über Modrinth (Fabric, Forge, NeoForge und mehr).",
      "Im Voice Chat gelten dieselben Regeln zu Respekt, Diskriminierung und anstössigen Inhalten. Kein Schreien, Stören oder Soundboard-Spam.",
    ],
  },
  {
    id: "graves",
    title: "Todesgräber",
    summary: "Items bleiben nach dem Tod auffindbar.",
    body: [
      "Wenn du stirbst, bleiben deine Items in einem Todesgrab auffindbar. Du verlierst sie nicht einfach in Lava oder der Leere.",
      "Hol sie dir in Ruhe zurück – sofern das Grab erreichbar ist.",
    ],
  },
  {
    id: "homes",
    title: "Homes",
    summary: "Setze Homes und kehre jederzeit zurück.",
    body: [
      "Setze mit /sethome einen Speicherpunkt und kehre jederzeit mit /home zurück.",
      "Praktisch für Base, Farm und Shop – ohne lange Wege. /homes zeigt deine gespeicherten Punkte.",
    ],
  },
  {
    id: "tpa",
    title: "TPA",
    summary: "Teleportiere dich zu anderen Spielern.",
    body: [
      "Mit /tpa und dem Spielernamen schickst du eine Teleport-Anfrage.",
      "Der andere kann annehmen – so trefft ihr euch schnell, ohne Koordinaten zu tauschen.",
    ],
  },
  {
    id: "back",
    title: "/back",
    summary: "Zurück zu deinem letzten Tod.",
    body: [
      "/back bringt dich zurück zu deinem letzten Todesort.",
      "Ideal, um Items zu holen oder den Ort nochmal zu checken.",
    ],
  },
  {
    id: "crossplay",
    title: "Java + Bedrock",
    summary: "Beide Editionen spielen auf derselben Welt.",
    body: [
      "Java- und Bedrock-Spieler teilen sich dieselbe Welt.",
      "Java: alpensmp.net. Den Port trägst du nicht ein. Der SRV-Eintrag schickt den Client auf play.alpensmp.net, Port 25565.",
      "Bedrock: play.alpensmp.net, Port 19132. Bedrock ignoriert den SRV-Eintrag.",
      "Empfohlene Version: Minecraft 1.21.11. Andere Versionen können funktionieren. Minecraft 26.2+ kann aktuell Verbindungsprobleme verursachen.",
    ],
  },
];

export const COMMANDS = [
  { cmd: "/spawn", text: "Zurück zum Spawn." },
  { cmd: "/sethome", text: "Speichert einen Punkt für Base, Farm oder Shop." },
  { cmd: "/home", text: "Kehrt zu deinem gesetzten Home zurück." },
  { cmd: "/homes", text: "Zeigt deine gespeicherten Homes." },
  { cmd: "/tpa Spieler", text: "Teleport-Anfrage. Der andere muss annehmen." },
  { cmd: "/back", text: "Zurück zum letzten Todesort." },
  { cmd: "/rtp", text: "Zufälliger Teleport in die Welt." },
  { cmd: "/msg Spieler", text: "Private Nachricht." },
  { cmd: "/call admin", text: "Ruft das Team, wenn du im Spiel Hilfe brauchst." },
];

export const BEDROCK_COMMANDS = [
  { cmd: "/spawn", text: "Zurück zum Spawn. Chat über die Chat-Taste öffnen, nicht mit T." },
  { cmd: "/sethome", text: "Speichert einen Punkt. Gleicher Befehl, anderer Chat." },
  { cmd: "/home", text: "Kehrt zu deinem Home zurück." },
  { cmd: "/homes", text: "Zeigt deine Homes." },
  { cmd: "/tpa .Spieler", text: "Bedrock-Namen beginnen mit einem Punkt." },
  { cmd: "/back", text: "Zurück zum letzten Todesort." },
  { cmd: "/rtp", text: "Zufälliger Teleport." },
  { cmd: "/msg .Spieler", text: "Private Nachricht an einen Bedrock-Namen mit Punkt." },
  { cmd: "/call admin", text: "Ruft das Team. Ebenfalls über die Chat-Taste." },
];

export const PILLARS = [
  {
    title: "Survival",
    text: "Klassisches Survival auf einer gemeinsamen Welt.",
  },
  {
    title: "Community",
    text: "Persönlich, fair und aktiv – hier zählt das Miteinander.",
  },
  {
    title: "Deine Geschichte",
    text: "Baue, entdecke und spiele – allein oder gemeinsam.",
  },
];

export const FAQ = [
  {
    q: "Wie kann ich AlpenSMP beitreten?",
    a: "Java: alpensmp.net, Port nicht eintragen. Der SRV-Eintrag schickt den Client auf play.alpensmp.net, Port 25565. Bedrock: play.alpensmp.net, Port 19132, weil Bedrock den SRV-Eintrag ignoriert.",
  },
  {
    q: "Welche Minecraft-Version wird empfohlen?",
    a: "Empfohlen wird aktuell Minecraft 1.21.11. Andere Versionen können funktionieren; 26.2+ kann Verbindungsprobleme verursachen.",
  },
  {
    q: "Kann ich mit Bedrock beitreten?",
    a: "Ja. AlpenSMP unterstützt Java und Bedrock – beide Editionen spielen auf demselben Server gemeinsam.",
  },
  {
    q: "Wie lautet die Server-IP?",
    a: "Java: alpensmp.net. Bedrock: play.alpensmp.net. Kopieren geht auf der Startseite und unter Server.",
  },
  {
    q: "Welchen Port brauche ich auf Bedrock?",
    a: "Port 19132, Adresse play.alpensmp.net. Bedrock ignoriert den SRV-Eintrag, deshalb nicht nur alpensmp.net.",
  },
  {
    q: "Brauche ich Discord, um spielen zu können?",
    a: "Nein. Discord ist nicht zwingend erforderlich, wird aber für Support, Updates und die Community empfohlen.",
  },
  {
    q: "Kann ich meine Gebäude schützen?",
    a: "Ja. Deine Grundstücke und Builds werden durch GriefPrevention geschützt. Pro Stunde Online-Zeit gibt es +1000 Claim-Blöcke.",
  },
  {
    q: "Gibt es Simple Voice Chat?",
    a: "Ja. Simple Voice Chat ist auf dem Server aktiv. Für Java installierst du den Client-Mod (z. B. über Modrinth). Ohne Mod kannst du trotzdem normal spielen.",
  },
  {
    q: "Gibt es /home, /tpa und /back?",
    a: "Ja. Java und Bedrock nutzen dieselben Funktionen, aber nicht denselben Chat. Java: T, dann /tpa Spieler. Bedrock: Chat-Taste, und Namen mit Punkt, also /tpa .Spieler. Dazu /spawn, /sethome, /home, /homes, /back, /rtp, /msg und /call admin.",
  },
  {
    q: "Was passiert, wenn ich sterbe?",
    a: "Deine Items bleiben über die Todesgräber auffindbar – du verlierst sie nicht einfach.",
  },
  {
    q: "Ist AlpenSMP kostenlos?",
    a: "Ja. Du kannst dem Server kostenlos beitreten. Es gibt keine Pay-to-Win-Mechaniken. AlpenSMP ist ein privater, nicht-kommerzieller Minecraft-Server.",
  },
  {
    q: "Wo bekomme ich Hilfe, wenn etwas nicht funktioniert?",
    a: "Öffne ein Ticket auf dieser Website oder auf dem AlpenSMP-Discord. Dort helfen wir persönlich weiter.",
  },
  {
    q: "Ist AlpenSMP ein Survival-Server?",
    a: "Ja. AlpenSMP basiert auf einem gemeinsamen Survival-Erlebnis mit Community, Projekten und eigenen Geschichten – ergänzt um praktische Komfort-Funktionen.",
  },
  {
    q: "Kann ich mit Freunden zusammenspielen?",
    a: "Absolut. Gemeinsam bauen, erkunden und Projekte starten gehört zum Konzept von AlpenSMP.",
  },
  {
    q: "Wo ist die Live-Karte?",
    a: "Unter Karte. Sie ist gerade nicht erreichbar, weil der Speicher auf dem Kartenserver voll ist. Schau ein anderes Mal wieder vorbei. Spielen geht trotzdem.",
  },
  {
    q: "Darf ich X-Ray, Fly oder KillAura?",
    a: "Nein. X-Ray, Fly, KillAura, Reach, ESP, übermässige Autoclicker und automatisches Spielen sind verboten. Erlaubt sind unter anderem Sodium, Iris, OptiFine, Freecam, Xaero’s Minimap und Simple Voice Chat. Bei Unsicherheit vorher das Team fragen.",
  },
];

export type GuideChapter = {
  id: string;
  track: "mc" | "alpen";
  title: string;
  description: string;
  keywords: string;
  blocks: string[];
};

export const GUIDE: GuideChapter[] = [
  {
    id: "mc-was",
    track: "mc",
    title: "Was ist Minecraft?",
    description: "Welt aus Blöcken – bauen, erkunden, sammeln, überleben.",
    keywords: "minecraft grundlagen blöcke",
    blocks: [
      "Minecraft ist ein Spiel in einer Welt aus Würfeln (Blöcken). Du kannst abbauen, bauen, Ressourcen sammeln, Tiere züchten, Höhlen erkunden und nachts gegen Monster bestehen.",
    ],
  },
  {
    id: "mc-minuten",
    track: "mc",
    title: "Deine ersten Minuten",
    description: "Sieben einfache Schritte für den Start – die wichtigsten zuerst.",
    keywords: "holz haus werkbank fackeln",
    blocks: [
      "Holz sammeln.",
      "Eine Werkbank bauen.",
      "Eine Unterkunft mit Tür und Fackeln bauen, bevor es dunkel wird.",
    ],
  },
  {
    id: "mc-survive",
    track: "mc",
    title: "Überleben",
    description: "Herzen, Hunger, Nacht und Monster.",
    keywords: "hunger creeper herzen nacht",
    blocks: [
      "Ohne Hunger keine Regeneration. Iss regelmäßig.",
      "Monster spawnen im Dunkeln. Licht und ein geschlossenes Haus helfen in der ersten Nacht.",
      "Creeper explodieren in der Nähe – Abstand halten.",
    ],
  },
  {
    id: "alpen-willkommen",
    track: "alpen",
    title: "Willkommen auf AlpenSMP",
    description: "Survival für Java und Bedrock.",
    keywords: "willkommen survival community",
    blocks: [
      "Deutschsprachiger Survival-Server, gemeinsame Welt, keine Pay-to-Win-Mechaniken.",
      "Dazu Claims, optionaler Voice Chat, Homes, TPA, RTP und Todesgräber.",
    ],
  },
  {
    id: "alpen-join",
    track: "alpen",
    title: "Server beitreten",
    description: "IP, Port, Version.",
    keywords: "join ip bedrock port version",
    blocks: [
      "Java: alpensmp.net. Port nicht eintragen. Der SRV-Eintrag geht auf play.alpensmp.net, Port 25565.",
      "Bedrock: play.alpensmp.net, Port 19132. Bedrock ignoriert den SRV-Eintrag.",
      "Empfohlen: Minecraft 1.21.11. Version 26.2+ kann Verbindungsprobleme machen.",
    ],
  },
  {
    id: "alpen-regeln",
    track: "alpen",
    title: "Server-Regeln",
    description: "Immer das offizielle Regelwerk nutzen.",
    keywords: "regeln fairplay mods",
    blocks: [
      "14 verbindliche Regeln – für Minecraft und, soweit genannt, Discord.",
      "Kurzfassung: Respekt, kein Cheat, Claims nicht griefen, Fair Play. Die vollständige Fassung steht unter Regeln.",
    ],
  },
  {
    id: "alpen-voice",
    track: "alpen",
    title: "Voice Chat",
    description: "Simple Voice Chat, optional.",
    keywords: "voice modrinth mikro",
    blocks: [
      "Nähe-basierte Sprache. Ohne Mod kannst du trotzdem joinen.",
      "Java-Mod passend zu 1.21.11, zum Beispiel über die Modrinth-App.",
    ],
  },
  {
    id: "alpen-commands",
    track: "alpen",
    title: "Wichtige Befehle",
    description: "Java und Bedrock, jeweils zum Kopieren.",
    keywords: "spawn home tpa back rtp msg admin java bedrock",
    blocks: [
      "Java (Taste T): /spawn · /sethome · /home · /homes · /tpa Spieler · /back · /rtp · /msg Spieler · /call admin",
      "Bedrock (Chat-Taste): dieselben Befehle, Namen mit Punkt – /tpa .Spieler und /msg .Spieler.",
    ],
  },
];

export type Review = {
  name: string;
  rating: number;
  text: string;
};

export const REVIEWS: Review[] = [
  { name: "Owner beugt sich", rating: 5, text: "Super server Super Owner" },
  {
    name: "Ich0913",
    rating: 5,
    text: "Toller server, Nette und hilfsbereite admins und owner und coole gebäude.\nMan kann verhindern das andere dein haus hochjagen was sehr toll ist.\n\nToller server, kann man nur weiter empfehlen!!",
  },
  {
    name: "Pfitzinator",
    rating: 5,
    text: "sehr netter owner und sehr nette ownerin sehr große gebeude und eine sehr nette community",
  },
  {
    name: "YB-FOREVER",
    rating: 5,
    text: "In einer Zeit des Überkonsums wo man keine 2 min ohne Eindrücke von außen verbringen kann ist der AlpenSMP perfekt zum abschalten.Keine nervigen Spammer, kein Pay to win, keine Werbung, keine Überladenen Lobbys ich könnte ewig weiter machen.Der AlpenSMP ist einfach Minecraft wie es gedacht ist ob alleine vor sich hin tüfteln oder mit anderen Chillen es geht nicht darum der beste zu sein sondern einfach Spaß zu haben.",
  },
  {
    name: "Reaxsis",
    rating: 5,
    text: "Sehr coole und nette Menschen außer Bexy_1 , Sehr netter Owner, Coole Builds und es macht sehr viel Spaß einfach zu spielen ich kann diesen Server sehr empfehlen.",
  },
  {
    name: "AltSplash3908",
    rating: 5,
    text: "Geiler Server, netter Owner und nettes Team. Hab viele Freunde gefunden und coole/lustige Momente garantiert",
  },
  {
    name: "Bexy_1",
    rating: 5,
    text: "mir Gefällt an dem Server dass der owner und die Admins Server nett sind und der Server sehr flüssig ist",
  },
  {
    name: "FlaviousABG",
    rating: 5,
    text: "Ein wirklich super SMP-Server! Die Community ist freundlich und das Spielerlebnis macht richtig Spaß. Besonders der Owner SwissRed kümmert sich gut um den Server und die Spieler. Man merkt, dass viel Arbeit und Mühe in den AlpenSMP gesteckt wird. Klare Empfehlung für alle, die einen guten Minecraft-SMP suchen!",
  },
  {
    name: "Plinsen (in Minecraft Sasuke)",
    rating: 4,
    text: "Es gibt sehr viele nette Leute und es ist allgemein sehr idyllisch.\nAllerdings sind viele orte schon leergefarmt.",
  },
  {
    name: "Heini14",
    rating: 5,
    text: "Es ist ein sehr entspannter SMP auf dem sich die Menschen auf das Bauen und das Soziale miteinander fokussieren.",
  },
  {
    name: "GamerLoks2303",
    rating: 5,
    text: "Immer was los, sympathische Leute, jede Menge Spaß und eine richtig gute Community",
  },
  {
    name: "MaysonKF",
    rating: 5,
    text: "Ich Persönlich finde den Server sehr cool er macht nen Riesen Spaß zu zocken. Man kann viele neue Leute kennenlernen. Der Owner und die Ownerin sind beide sehr liebe Personen mit denen man über alles reden kann. Also kommt auf den Server um Spaß zu haben.",
  },
  { name: "Pfitzinator", rating: 5, text: "toller server coole leute und noch viel mehr" },
  {
    name: "GamerFinn023",
    rating: 5,
    text: "Mega Server viele lustige Leute und immer neu Sachen zu entdecken",
  },
];

export const TEAM = [
  {
    role: "Owner",
    title: "Serverleitung & Vision",
    text: "Persönliche Serverleitung statt anonymer Netzwerk-Struktur. Der Owner hat bei Streitfällen und unklaren Situationen das letzte Wort und hält die Richtung: Vanilla Survival, fair, ohne Pay-to-Win.",
  },
  {
    role: "Moderation",
    title: "Faire Spielumgebung",
    text: "Moderation achtet auf Respekt, Claims und Fair Play. Strafen reichen je nach Fall von Verwarnung über Kick bis zu temporärem oder permanentem Bann. Diskussionen über Strafen gehören nicht in den öffentlichen Chat.",
  },
  {
    role: "Community",
    title: "Support & Austausch",
    text: "Updates, gemeinsame Projekte und Hilfe laufen über Discord und Tickets. Discord ist nicht Pflicht zum Spielen, aber der direkte Weg zum Team.",
  },
];
