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
      "Am Anfang ist es am schwierigsten. Nimm eine normale goldene Schaufel. Rechtsklick auf den Boden: ein Diamantblock erscheint. Geh in die andere Ecke und klicke nochmal rechts. Dann steht ein Viereck aus Glowstone und Goldblöcken. Ein Video auf Deutsch kommt. Das englische Video vom Plugin erklärt es nicht gut.",
      "Je länger du online bist, desto mehr Claim-Blöcke bekommst du. Pro 1 Stunde Spielzeit: +1000 Blöcke.",
      "Beanspruche dein Gebiet und lade Freunde mit /trust ein. Fremde können dort nichts abbauen oder platzieren.",
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
      "Mit /sethome Name speicherst du einen Punkt. Höchstens 5 Homes.",
      "/home Name bringt dich dorthin, /delhome Name löscht den Punkt.",
      "Das persönliche Home ist nicht das Team-Home. /team home gibt es erst, nachdem ein Team mit /team create existiert.",
    ],
  },
  {
    id: "teams",
    title: "Spieler-Teams",
    summary: "Erst /team create. Ohne Team geht der Rest nicht.",
    body: [
      "Ein Team legst du mit /team create Name an. Der Name hat 3 bis 10 Buchstaben, nur a bis z, keine Leerzeichen und keinen Farbcode. Gamers, Rise und Up sind gesperrt. Erstellen kostet nichts. Höchstens 20 Mitglieder, und du bist nur in einem Team.",
      "Ohne dieses Team funktionieren /team prefix, /team home, /team warp, /tc und /team pvp nicht. /team list zeigt die Teams auch so.",
      "Der Prefix kommt danach: /team prefix und direkt Farbcode plus Buchstaben, zusammen 3 bis 10 Zeichen. Beispiel: /team prefix &cAlpen. Im Tab steht er vor dem Namen. Im Chat folgt ein Leerzeichen.",
      "Team-Home und Warps warten 3 Sekunden und brechen ab, wenn du dich bewegst oder Schaden bekommst. Danach 120 Sekunden Pause. Warps: höchstens 3. Die Endertruhe hat 3 Reihen.",
      "Friendly Fire ist in neuen Teams aus, /team pvp schaltet es um. Verbündete höchstens 4, Feinde höchstens 2. Beim Joinen kann eine Team-Nachricht erscheinen, 5 bis 40 Zeichen. Mit Lunar Client siehst du Teammitglieder auf der Minimap. Java und Bedrock können im selben Team sein.",
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
      { cmd: "/team create Name", text: "Legt dein Team an. Danach erst gehen die anderen Team-Befehle." },
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

export const VOICE_STEPS = [
  {
    id: "what",
    title: "Was das ist",
    text: "Damit kannst du mit anderen Spielern direkt im Spiel sprechen, wie ein Walkie-Talkie. Je näher, desto lauter.",
  },
  {
    id: "app",
    title: "Modrinth App holen",
    text: "Die Modrinth App ist ein kostenloses Programm, das Mods für dich installiert. Du musst nichts von Hand in Ordner schieben.",
    href: "app" as const,
    hrefLabel: "Modrinth App herunterladen",
  },
  {
    id: "install",
    title: "Voice Chat einbauen",
    text: "In der App nach „Simple Voice Chat“ suchen. Der Autor heißt henkelmax. Die Version muss zu deiner Minecraft-Version passen.",
    href: "voice" as const,
    hrefLabel: "Simple Voice Chat auf Modrinth",
  },
  {
    id: "use",
    title: "Im Spiel benutzen",
    text: "Taste V öffnet die Einstellungen. Sprechen geht mit gedrückter Taste. Standard ist Caps Lock.",
  },
  {
    id: "where",
    title: "Nur auf dem Server",
    text: "Der Voice Chat läuft nur, während du auf AlpenSMP bist. Im Hauptmenü oder auf einem anderen Server hörst du niemanden.",
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
