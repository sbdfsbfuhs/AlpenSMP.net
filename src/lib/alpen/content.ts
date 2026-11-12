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
      "Das Stehlen, Entwenden oder unerlaubte Aneignen fremder Gegenstände und Ressourcen ist grundsätzlich verboten. Das gilt innerhalb und ausserhalb von Claims.",
      "Fremde Bauwerke dürfen nicht ohne Erlaubnis verändert, beschädigt oder zerstört werden. Ungeclaimte Bauten dürfen ebenfalls nicht unnötig zerstört werden.",
      "Keine Claims blockieren, absichtlich Wege versperren oder andere Spieler durch Bauten gezielt stören.",
      "Ein fehlender Claim bedeutet nicht, dass fremdes Eigentum frei verfügbar ist. Bei Diebstahl entscheidet das Team anhand der Beweislage über Rückgabe, mögliche Entschädigung und Strafen.",
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
  category: "Welt & Schutz" | "Gemeinsam spielen" | "Komfort";
  title: string;
  summary: string;
  body: string[];
};

export const FEATURES: Feature[] = [
  {
    id: "survival",
    category: "Welt & Schutz",
    title: "Survival ohne Pay-to-Win",
    summary: "Eine gemeinsame Welt, in der dein Fortschritt von dir kommt.",
    body: [
      "Sammeln, bauen, erkunden und eigene Projekte umsetzen – ohne verkaufte Spielvorteile oder Pay-to-Win.",
      "Die Welt ist auf gemeinsames Survival ausgelegt. Besondere Aktionen und Spielbereiche ergänzen das normale Minecraft, statt es zu ersetzen.",
    ],
  },
  {
    id: "claims",
    category: "Welt & Schutz",
    title: "Deine Builds bleiben geschützt",
    summary: "Sichere dein Gebiet und gib Freunden passende Rechte.",
    body: [
      "Claims schützen dein Grundstück vor unerlaubtem Abbauen und Platzieren. Berechtigungen kannst du gezielt mit Freunden teilen.",
      "Zum Anlegen verwendest du eine goldene Schaufel: Markiere mit zwei Rechtsklicks die Ecken deines Gebiets. Die genaue Anleitung und passende Rechte-Befehle findest du im Guide.",
      "Deine Claim-Blöcke wachsen mit deiner Spielzeit: pro Stunde erhältst du 1.000 zusätzliche Blöcke.",
    ],
  },
  {
    id: "voice",
    category: "Gemeinsam spielen",
    title: "Simple Voice Chat",
    summary: "Sprich mit Spielern in deiner Nähe – wenn du möchtest.",
    body: [
      "Mit dem passenden Client-Mod kannst du direkt im Spiel mit Menschen in deiner Nähe sprechen.",
      "Der Voice Chat ist optional. Du kannst auch ohne Mod ganz normal auf den Server kommen. Eine Installationshilfe findest du im Guide.",
      "Auch im Voice Chat gelten die Serverregeln: respektvoll bleiben und niemanden absichtlich stören.",
    ],
  },
  {
    id: "graves",
    category: "Welt & Schutz",
    title: "Items nach dem Tod wiederfinden",
    summary: "Dein Todesgrab hilft dir, verlorene Ausrüstung zurückzuholen.",
    body: [
      "Nach einem Tod werden deine Gegenstände an einem Grab gesammelt, damit du sie wiederfinden kannst.",
      "Je nach Todesort kann das Grab schwer erreichbar sein. Deine Ausrüstung ist nicht in jeder Situation garantiert sicher.",
    ],
  },
  {
    id: "homes",
    category: "Komfort",
    title: "Homes, Spawn & Warps",
    summary: "Speichere Orte und finde wichtige Ziele schnell wieder.",
    body: [
      "Lege persönliche Homes an und kehre später dorthin zurück. Dazu kommen feste Ziele wie Spawn und Server-Warps.",
      "Die verfügbaren Befehle und Grenzen stehen in der gemeinsamen Befehlsübersicht weiter unten.",
    ],
  },
  {
    id: "teams",
    category: "Gemeinsam spielen",
    title: "Spieler-Teams",
    summary: "Gründe ein Team, teile Wege und spiele gemeinsam.",
    body: [
      "Erstelle ein Team, lade andere ein und nutze Team-Funktionen wie gemeinsamen Chat und eigene Ziele.",
      "Java- und Bedrock-Spieler können gemeinsam in einem Team spielen. Die Befehlsübersicht erklärt Einrichtung, Prefix und weitere Team-Funktionen.",
    ],
  },
  {
    id: "tpa",
    category: "Komfort",
    title: "Spieler treffen",
    summary: "Teleport-Anfragen machen Verabredungen einfacher.",
    body: [
      "Sende einem anderen Spieler eine Teleport-Anfrage. Erst wenn die Person sie annimmt, wirst du zu ihr teleportiert.",
      "So könnt ihr euch treffen, ohne erst Koordinaten auszutauschen.",
    ],
  },
  {
    id: "back",
    category: "Komfort",
    title: "Zurück zum letzten Ort",
    summary: "Kehre nach einem Tod oder einer Teleportation zurück.",
    body: [
      "Der Zurück-Befehl kann dich an deinen letzten gespeicherten Ort zurückbringen, zum Beispiel nach einem Tod.",
      "Welche Rückkehrpunkte verfügbar sind, hängt von der Situation ab. Die Befehlsübersicht zeigt den bestätigten Umfang.",
    ],
  },
  {
    id: "crossplay",
    category: "Gemeinsam spielen",
    title: "Java + Bedrock",
    summary: "Beide Editionen spielen auf derselben Welt.",
    body: [
      "Java- und Bedrock-Spieler teilen sich dieselbe Welt.",
      "Java: alpensmp.net. Den Port trägst du nicht ein. Der SRV-Eintrag schickt den Client auf play.alpensmp.net, Port 25565.",
      "Bedrock: play.alpensmp.net, Port 19132. Bedrock ignoriert den SRV-Eintrag.",
      "Empfohlene Version: Minecraft 1.21.11. Andere Versionen können funktionieren. Minecraft 26.2+ kann aktuell Verbindungsprobleme verursachen.",
    ],
  },
  {
    id: "duels",
    category: "Gemeinsam spielen",
    title: "Duelle & Arenen",
    summary: "Fordere andere zu einem fairen Kampf heraus.",
    body: [
      "Wenn ihr euch messen möchtet, könnt ihr Duelle austragen und dafür vorgesehene Arenen nutzen.",
      "Das normale Survival bleibt davon getrennt: Kämpfe gehören in die dafür vorgesehenen Bereiche und Situationen.",
    ],
  },
  {
    id: "building",
    category: "Komfort",
    title: "Bauen mit kleinen Extras",
    summary: "Praktische Bau- und Alltagsfunktionen, die Handgriffe sparen.",
    body: [
      "Neben klassischem Bauen gibt es praktische Extras wie Sitzen, Gegenstände präsentieren und komfortablere Handgriffe beim Sammeln und Bauen.",
      "Die Funktionen sollen den Alltag erleichtern, ohne dir Fortschritt oder Ressourcen einfach zu schenken.",
    ],
  },
  {
    id: "shops",
    category: "Komfort",
    title: "Handel & Shops",
    summary: "Tausche, handle und entdecke Angebote in der Welt.",
    body: [
      "Für den Handel gibt es Shops und weitere Möglichkeiten, mit anderen Spielern oder der Spielwelt zu tauschen.",
      "Achte bei Spielershops auf die angebotenen Waren und vereinbare grössere Tauschgeschäfte klar mit der anderen Person.",
    ],
  },
  {
    id: "activity",
    category: "Gemeinsam spielen",
    title: "Spielzeit & Aktivität",
    summary: "Behalte deine Zeit und wichtige Serverinfos im Blick.",
    body: [
      "Spielzeit- und Weltstatistiken geben dir einen Überblick über deine Aktivität und das Geschehen auf AlpenSMP.",
      "Wenn du kurz weg musst, kannst du deinen Status als AFK kennzeichnen. Für Neuigkeiten und Hilfe ist das Team über die Community erreichbar.",
    ],
  },
];

export type PlayerCommand = { cmd: string; text: string; href?: string; hrefLabel?: string };

export type CommandGroup = {
  id: string;
  title: string;
  note?: string;
  rows: PlayerCommand[];
};

/** Bestätigte Spieler-Befehle. Claims stehen absichtlich zuerst. */
export const COMMAND_GROUPS: CommandGroup[] = [
  {
    id: "claims",
    title: "Claims",
    note: "Am Anfang ist es am schwierigsten. Nimm eine normale goldene Schaufel. Rechtsklick auf den Boden: ein Diamantblock erscheint. Geh in die andere Ecke und klicke nochmal rechts. Dann steht ein Viereck aus Glowstone und Goldblöcken. Ein Video auf Deutsch kommt. Das englische Video vom Plugin erklärt es nicht gut.",
    rows: [
      { cmd: "/abandonclaim", text: "Löscht den Claim, in dem du stehst." },
      { cmd: "/abandonallclaims", text: "Löscht alle deine Claims." },
      { cmd: "/trust Spieler", text: "Darf in deinem Claim bauen." },
      { cmd: "/containertrust Spieler", text: "Darf Kisten, Türen, Knöpfe und Tiere benutzen." },
      { cmd: "/accesstrust Spieler", text: "Darf Knöpfe, Hebel und Betten benutzen." },
      { cmd: "/permissiontrust Spieler", text: "Darf Rechte weitergeben." },
      { cmd: "/untrust Spieler", text: "Nimmt die Rechte in diesem Claim weg." },
      { cmd: "/untrust all", text: "Nimmt jemandem die Rechte in allen deinen Claims weg." },
      { cmd: "/trustlist", text: "Zeigt, wer Rechte im Claim hat." },
      { cmd: "/subdivideclaims", text: "Schaltet die Schaufel auf Unterbereiche." },
      { cmd: "/restrictsubclaim", text: "Der Unterbereich erbt keine Rechte vom grossen Claim." },
      { cmd: "/trapped", text: "Holt dich aus einem fremden Claim." },
      { cmd: "/claimexplosions", text: "Schaltet Explosionen in deinem Claim um." },
    ],
  },
  {
    id: "homes",
    title: "Homes",
    note: "Höchstens 5 Homes.",
    rows: [
      { cmd: "/sethome Name", text: "Speichert ein Home an deiner Position." },
      { cmd: "/home Name", text: "Teleportiert dich zu diesem Home." },
      { cmd: "/delhome Name", text: "Löscht dieses Home." },
    ],
  },
  {
    id: "teleport",
    title: "Teleport",
    rows: [
      { cmd: "/spawn", text: "Zurück zum Spawn." },
      { cmd: "/rtp", text: "Zufälliger Teleport." },
      { cmd: "/back", text: "Zurück zum letzten Todespunkt." },
      { cmd: "/warp Name", text: "Teleport zu einem Server-Warp." },
      { cmd: "/tpa Spieler", text: "Fragt, ob du zu diesem Spieler darfst." },
      { cmd: "/tpahere Spieler", text: "Bittet diesen Spieler, zu dir zu kommen." },
      { cmd: "/tpaccept", text: "Nimmt die Teleport-Anfrage an." },
      { cmd: "/tpdeny", text: "Lehnt die Teleport-Anfrage ab." },
    ],
  },
  {
    id: "chat",
    title: "Nachrichten",
    rows: [
      { cmd: "/msg Spieler", text: "Private Nachricht." },
      { cmd: "/w", text: "Antwort auf die letzte private Nachricht." },
      { cmd: "/mail", text: "Öffnet die Mailbox." },
      { cmd: "/afk", text: "Setzt dich abwesend. Das passiert auch automatisch." },
    ],
  },
  {
    id: "teams",
    title: "Teams",
    note: "Zuerst /team create Name. Ohne Team gehen Prefix, Team-Home, Warps und Teamchat nicht.",
    rows: [
      {
        cmd: "/team create Name",
        text: "Legt dein Team an. Danach erst gehen die anderen Team-Befehle.",
      },
      { cmd: "/team disband", text: "Löst das Team auf. Nur als Owner." },
      { cmd: "/team leave", text: "Verlässt das Team." },
      { cmd: "/team invite Spieler", text: "Lädt jemanden ein." },
      { cmd: "/team join", text: "Nimmt eine Einladung an." },
      { cmd: "/team kick Spieler", text: "Wirft jemanden aus dem Team." },
      { cmd: "/team info", text: "Zeigt dein Team." },
      { cmd: "/team list", text: "Zeigt die Teams auf dem Server." },
      {
        cmd: "/team prefix &cAlpen",
        text: "Setzt Farbe und Kürzel. Geht erst nach /team create.",
        href: "/prefix",
        hrefLabel: "Prefix bauen",
      },
      { cmd: "/team ally", text: "Verbündet ein Team oder nimmt es weg." },
      { cmd: "/team enemy", text: "Markiert ein Feind-Team oder nimmt es weg." },
      { cmd: "/team pvp", text: "Schaltet Friendly Fire um." },
      { cmd: "/team sethome", text: "Setzt das Team-Home. Nicht dasselbe wie /sethome." },
      { cmd: "/team home", text: "Teleport zum Team-Home." },
      { cmd: "/team setwarp Name", text: "Setzt einen Team-Warp." },
      { cmd: "/team warp", text: "Teleport zu einem Team-Warp." },
      { cmd: "/team promote Spieler", text: "Macht jemanden zum Manager." },
      { cmd: "/team demote Spieler", text: "Nimmt den Manager-Rang weg." },
      { cmd: "/tc Nachricht", text: "Teamchat, nur an dein Team." },
    ],
  },
  {
    id: "voice",
    title: "Voice",
    rows: [
      { cmd: "/voicechat invite Spieler", text: "Lädt jemanden in deine Voice-Gruppe." },
      { cmd: "/voicechat join Name", text: "Tritt einer Gruppe bei." },
      { cmd: "/voicechat leave", text: "Verlässt die Gruppe." },
      { cmd: "/voicechat help", text: "Listet die Voice-Befehle." },
    ],
  },
  {
    id: "sonst",
    title: "Sitz, Hut, Duell",
    rows: [
      { cmd: "/sit", text: "Setzt dich hin." },
      { cmd: "/lay", text: "Legt dich hin." },
      { cmd: "/spin", text: "Dreht dich." },
      { cmd: "/crawl", text: "Kriecht durch eine 1-Block-Lücke." },
      { cmd: "/hat", text: "Setzt den Block oder das Item in der Hand auf den Kopf." },
      { cmd: "/playtime", text: "Zeigt deine Spielzeit." },
      { cmd: "/duel Spieler", text: "Fordert jemanden zum Duell." },
    ],
  },
];

export const COMMANDS: PlayerCommand[] = COMMAND_GROUPS.flatMap((group) => group.rows);

export const BEDROCK_COMMANDS: PlayerCommand[] = COMMANDS.map((row) => ({
  ...row,
  cmd: row.cmd.replaceAll("Spieler", ".Spieler"),
  text: row.text,
}));

export const TEAM_COMMANDS = COMMAND_GROUPS.find((group) => group.id === "teams")?.rows ?? [];

/** Spieler-Teams. Ohne /team create gehen die übrigen Team-Befehle nicht. */
export const TEAM_BLOCKED = ["Gamers", "Rise", "Up"] as const;

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
    a: "Ja. Java und Bedrock nutzen dieselben Befehle. Java öffnet den Chat mit T. Bedrock mit der Chat-Taste, und Namen beginnen mit einem Punkt, also /tpa .Spieler. Die gruppierten Befehle stehen im Guide.",
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
    a: "Ja. Mit /team create Name gründest du ein Spieler-Team, 3 bis 10 Buchstaben. Prefix, Team-Home, Warps und Teamchat gehen erst danach. Ohne Team funktionieren diese Befehle nicht.",
  },
  {
    q: "Warum geht /team prefix nicht?",
    a: "Weil noch kein Team existiert. Zuerst /team create Name. Der Name hat 3 bis 10 Buchstaben, nur a bis z, keinen Farbcode. Danach /team prefix, zum Beispiel /team prefix &cAlpen. Ohne Team gehen auch Team-Home, Warps, die Endertruhe und /tc nicht.",
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

export const MODRINTH_STEPS = [
  {
    id: "app",
    title: "App herunterladen",
    text: "Die Modrinth App ist ein kostenloser Mod-Manager für Minecraft. Sie installiert Mods für dich. Du musst nichts von Hand in Ordner schieben.",
    href: "app" as const,
    hrefLabel: "Modrinth App herunterladen",
  },
  {
    id: "profile",
    title: "Profil anlegen",
    text: "App öffnen und ein Minecraft-Profil anlegen. Fabric oder Quilt wählen. Die Version muss zum Server passen.",
  },
  {
    id: "install",
    title: "Mod installieren",
    text: "Die Mod in der App suchen und mit einem Klick installieren.",
  },
  {
    id: "start",
    title: "Profil starten",
    text: "Das Profil starten. Minecraft öffnet sich mit den Mods aus diesem Profil.",
  },
];

export const VOICE_EXAMPLE = [
  {
    id: "search",
    title: "Suchen",
    text: "In der Modrinth App nach „Simple Voice Chat“ suchen.",
  },
  {
    id: "add",
    title: "Installieren",
    text: "Installieren und das Profil starten.",
  },
  {
    id: "talk",
    title: "Im Spiel",
    text: "V zum Reden. /voicechat help listet die Befehle. Hören geht nur, solange du auf AlpenSMP bist.",
  },
];

export const MOD_CATEGORIES = [
  {
    id: "optik",
    title: "Optik und Performance",
    text: "Sieht besser aus oder läuft flüssiger. Am Spiel selbst ändert sich nichts.",
    examples: ["Sodium", "Iris", "Bobby"],
  },
  {
    id: "sound",
    title: "Voice und Sound",
    text: "Hören und sprechen. Kein Vorteil im Kampf.",
    examples: ["Simple Voice Chat"],
  },
  {
    id: "qol",
    title: "Lebensqualität",
    text: "Übersicht, ohne zu sehen, wo andere Spieler stehen.",
    examples: ["Inventory HUD", "Minimap ohne Radar"],
  },
];

export const MOD_FORBIDDEN = ["X-Ray", "Kill-Aura", "Auto-Clicker", "jede Form von Cheat-Mod"];

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
      "Dazu Claims, optionaler Voice Chat, Homes, TPA, RTP, Todesgräber und Spieler-Teams über /team create.",
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
    id: "alpen-teams",
    track: "alpen",
    title: "Spieler-Teams",
    description: "Erst /team create. Prefix und der Rest gehen sonst nicht.",
    keywords: "team create prefix home warp echest chat pvp ally",
    blocks: [
      "Team anlegen: /team create Name. 3 bis 10 Buchstaben, nur a bis z, kein Farbcode. Gamers, Rise und Up sind gesperrt. Kostenlos, höchstens 20 Mitglieder.",
      "Ohne Team gehen /team prefix, /team home, /team warp und /tc nicht.",
      "Prefix danach: /team prefix &cAlpen. Farbcode und Buchstaben zusammen 3 bis 10 Zeichen. Im Chat folgt ein Leerzeichen.",
      "Team-Home und Warps: 3 Sekunden Wartezeit, Abbruch bei Bewegung oder Schaden, danach 120 Sekunden Pause. Höchstens 3 Warps. Friendly Fire ist in neuen Teams aus.",
    ],
  },
  {
    id: "alpen-commands",
    track: "alpen",
    title: "Wichtige Befehle",
    description: "Java und Bedrock, jeweils zum Kopieren.",
    keywords: "spawn home tpa back rtp msg admin java bedrock team prefix",
    blocks: [
      "Claims, Homes, Teleport, Nachrichten, Teams, Voice und Sitz-Befehle stehen unten nach Gruppen. Kopieren geht pro Befehl.",
      "Claimen: goldene Schaufel, Rechtsklick, andere Ecke, nochmal Rechtsklick.",
      "Bedrock: dieselben Befehle, Chat-Taste, Namen mit Punkt.",
    ],
  },
];

export type Review = {
  name: string;
  rating: number;
  text: string;
};

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
