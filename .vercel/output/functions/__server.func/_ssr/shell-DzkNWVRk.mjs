import { i as __toESM } from "../_runtime.mjs";
import { q as require_react, x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Mountain, c as Menu, i as Send, s as MessageCircle, t as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shell-DzkNWVRk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SITE = {
	name: "AlpenSMP",
	ip: "alpensmp.falixsrv.me",
	bedrockPort: "27491",
	version: "1.21.11",
	discord: "https://discord.gg/FfR56Ddtj8",
	discordCode: "FfR56Ddtj8",
	tiktok: "https://www.tiktok.com/@alpensmp",
	tiktokHandle: "@alpensmp",
	map: "https://alpensmp-map.falix.org/#hauptworld:-1792:139:493:38:0.01:0:0:0:perspective",
	voiceMod: "https://modrinth.com/plugin/simple-voice-chat",
	modrinthApp: "https://modrinth.com/app",
	staff: "https://alpensmp.net/team",
	rulesPage: "https://alpensmp.net/regeln/",
	fb: "https://alpensmp-ad844-default-rtdb.europe-west1.firebasedatabase.app"
};
var NAV = [
	{
		to: "/",
		label: "Start"
	},
	{
		to: "/server",
		label: "Server"
	},
	{
		to: "/features",
		label: "Features"
	},
	{
		to: "/regeln",
		label: "Regeln"
	},
	{
		to: "/guide",
		label: "Guide"
	},
	{
		to: "/karte",
		label: "Karte"
	},
	{
		to: "/community",
		label: "Community"
	}
];
var MORE = [
	{
		to: "/faq",
		label: "FAQ"
	},
	{
		to: "/kontakt",
		label: "Kontakt"
	},
	{
		to: "/team",
		label: "Team"
	}
];
var RULES_INTRO = "Offizielles Regelwerk von AlpenSMP. Verbindlich beim Join – für Minecraft und, soweit genannt, Discord.";
var RULES = [
	{
		id: 1,
		title: "Respekt",
		highlight: true,
		paragraphs: ["Behandle alle Spieler respektvoll. Beleidigungen, Mobbing, Hass, Diskriminierung, rassistische Äusserungen und toxisches Verhalten sind verboten."]
	},
	{
		id: 2,
		title: "Chat",
		paragraphs: ["Kein Spam, unnötiges Wiederholen oder dauerhaftes GROSSSCHREIBEN. Werbung für andere Server oder Projekte ist nur mit Team-Erlaubnis erlaubt. Bleibt respektvoll und achtet darauf, wie eure Nachrichten auf andere wirken."]
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
		paragraphs: ["Kein Bugusing, Exploiten, Scammen oder Betrügen. Bugs müssen dem Team gemeldet werden. Das absichtliche Umgehen von Spielmechaniken oder Plugins ist verboten."]
	},
	{
		id: 5,
		title: "Bauen & Claims",
		highlight: true,
		paragraphs: ["Fremde Bauwerke dürfen nicht ohne Erlaubnis verändert, beschädigt oder zerstört werden. Ungeclaimte Bauten dürfen nicht unnötig zerstört werden. Keine Claims blockieren, absichtlich Wege versperren oder andere Spieler durch Bauten gezielt stören."],
		note: "Bauwerke mit sexuellen, pornografischen, extremistischen, rassistischen, diskriminierenden oder anderweitig anstössigen Inhalten sind verboten. Dies gilt auch für entsprechende Pixelarts, Schilder, Karten, Skins oder andere Darstellungen."
	},
	{
		id: 6,
		title: "Performance",
		paragraphs: ["Keine Lagmaschinen oder absichtliche Serverbelastung. Grosse Farmen und Redstone-Anlagen sind erlaubt, solange der Server dadurch nicht dauerhaft beeinträchtigt wird. Das Team darf problematische Anlagen anpassen, deaktivieren oder entfernen, wenn sie die Serverleistung beeinträchtigen."]
	},
	{
		id: 7,
		title: "Team & Support",
		paragraphs: ["Teammitglieder sind respektvoll zu behandeln. Der Support darf nicht für Spam oder unnötige Diskussionen missbraucht werden. Teamentscheidungen sind grundsätzlich zu akzeptieren. Strafdiskussionen gehören nicht in den öffentlichen Chat."]
	},
	{
		id: 8,
		title: "Voice Chat",
		paragraphs: ["Kein Schreien, absichtliches Stören, Stöhnen, extrem laute Geräusche oder störende Soundboards. Auch im Voice Chat gelten die Regeln zu Respekt, Diskriminierung und anstössigen Inhalten."]
	},
	{
		id: 9,
		title: "Namen, Skins & Darstellungen",
		paragraphs: ["Spielernamen, Nicknames, Skins, Items, Schilder, Bücher, Karten und andere selbst erstellte Inhalte dürfen keine beleidigenden, rassistischen, diskriminierenden, sexuellen, pornografischen, extremistischen oder anderweitig unangemessenen Inhalte enthalten. Dies gilt sowohl für Minecraft als auch für Discord-Namen und Nicknames, soweit diese mit der AlpenSMP-Community in Verbindung stehen."]
	},
	{
		id: 10,
		title: "Mehrfachaccounts",
		paragraphs: ["Java- und Bedrock-Accounts dürfen zum AFK-Stehen verwendet werden. Mehrfachaccounts dürfen jedoch nicht dazu verwendet werden, Regeln, Banns, Strafen oder andere Einschränkungen zu umgehen."]
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
		paragraphs: ["Je nach Schwere und Häufigkeit des Verstosses sind folgende Strafen möglich:"],
		bullets: [
			"Verwarnung",
			"Kick",
			"temporärer Bann",
			"permanenter Bann",
			"weitere situationsabhängige Massnahmen"
		],
		note: "Die Strafe richtet sich nach dem jeweiligen Fall, der Vorgeschichte und den Umständen. (du wirst in unseres System aufgenommen) Nicht jeder Verstoss wird gleich bestraft. Das Team entscheidet situationsabhängig und kann bei besonderen Umständen von einer üblichen Strafe abweichen."
	}
];
var FEATURES = [
	{
		id: "survival",
		title: "Survival",
		summary: "Klassisches Survival auf einer gemeinsamen Welt.",
		body: ["Klassisches Vanilla-Survival auf einer gemeinsamen Welt. Keine Pay-to-Win-Mechaniken, keine überladenen Minigames – du baust, erkundest und spielst, wie Minecraft gedacht ist.", "Mit fairer Community und persönlicher Serverleitung."]
	},
	{
		id: "claims",
		title: "Claims",
		summary: "GriefPrevention schützt deine Builds.",
		body: [
			"Mit GriefPrevention (Claims) schützt du deine Builds vor Griefing.",
			"Je länger du online bist, desto mehr Claim-Blöcke bekommst du. Pro 1 Stunde Spielzeit: +1000 Blöcke.",
			"Beanspruche dein Gebiet und lade Freunde ein – Fremde können dort nichts abbauen oder platzieren."
		]
	},
	{
		id: "voice",
		title: "Simple Voice Chat",
		summary: "Nähe-basierte Sprache direkt im Spiel.",
		body: [
			"Simple Voice Chat ist auf dem Server aktiv. Mit dem passenden Client-Mod (Java) kannst du im Spiel mit anderen sprechen – ohne extra Discord-Call.",
			"Der Mod ist optional. Ohne ihn kannst du trotzdem joinen und normal spielen. Empfohlen ist die Version passend zu Minecraft 1.21.11, zum Beispiel über Modrinth (Fabric, Forge, NeoForge und mehr).",
			"Im Voice Chat gelten dieselben Regeln zu Respekt, Diskriminierung und anstössigen Inhalten. Kein Schreien, Stören oder Soundboard-Spam."
		]
	},
	{
		id: "graves",
		title: "Todesgräber",
		summary: "Items bleiben nach dem Tod auffindbar.",
		body: ["Wenn du stirbst, bleiben deine Items in einem Todesgrab auffindbar. Du verlierst sie nicht einfach in Lava oder der Leere.", "Hol sie dir in Ruhe zurück – sofern das Grab erreichbar ist."]
	},
	{
		id: "homes",
		title: "Homes",
		summary: "Setze Homes und kehre jederzeit zurück.",
		body: ["Setze mit /sethome einen Speicherpunkt und kehre jederzeit mit /home zurück.", "Praktisch für Base, Farm und Shop – ohne lange Wege. /homes zeigt deine gespeicherten Punkte."]
	},
	{
		id: "tpa",
		title: "TPA",
		summary: "Teleportiere dich zu anderen Spielern.",
		body: ["Mit /tpa und dem Spielernamen schickst du eine Teleport-Anfrage.", "Der andere kann annehmen – so trefft ihr euch schnell, ohne Koordinaten zu tauschen."]
	},
	{
		id: "back",
		title: "/back",
		summary: "Zurück zu deinem letzten Tod.",
		body: ["/back bringt dich zurück zu deinem letzten Todesort.", "Ideal, um Items zu holen oder den Ort nochmal zu checken."]
	},
	{
		id: "crossplay",
		title: "Java + Bedrock",
		summary: "Beide Editionen spielen auf derselben Welt.",
		body: [
			"Java- und Bedrock-Spieler teilen sich dieselbe Welt.",
			"Java: Adresse alpensmp.falixsrv.me. Bedrock: dieselbe Adresse plus Port 27491.",
			"Empfohlene Version: Minecraft 1.21.11. Andere Versionen können funktionieren. Minecraft 26.2+ kann aktuell Verbindungsprobleme verursachen."
		]
	}
];
var COMMANDS = [
	{
		cmd: "/spawn",
		text: "Zurück zum Spawn."
	},
	{
		cmd: "/sethome",
		text: "Speichert einen Punkt für Base, Farm oder Shop."
	},
	{
		cmd: "/home",
		text: "Kehrt zu deinem gesetzten Home zurück."
	},
	{
		cmd: "/homes",
		text: "Zeigt deine gespeicherten Homes."
	},
	{
		cmd: "/tpa",
		text: "Teleport-Anfrage an einen Spieler. Nach Annahme seid ihr zusammen."
	},
	{
		cmd: "/back",
		text: "Zurück zum letzten Todesort – praktisch für die Item-Recovery."
	},
	{
		cmd: "/rtp",
		text: "Zufälliger Teleport in die Welt."
	},
	{
		cmd: "/msg",
		text: "Private Nachricht an einen Spieler."
	},
	{
		cmd: "/call admin",
		text: "Ruft das Team, wenn du im Spiel Hilfe brauchst."
	}
];
var PILLARS = [
	{
		title: "Survival",
		text: "Klassisches Survival auf einer gemeinsamen Welt."
	},
	{
		title: "Community",
		text: "Persönlich, fair und aktiv – hier zählt das Miteinander."
	},
	{
		title: "Deine Geschichte",
		text: "Baue, entdecke und spiele – allein oder gemeinsam."
	}
];
var FAQ = [
	{
		q: "Wie kann ich AlpenSMP beitreten?",
		a: "Minecraft öffnen, Mehrspieler auswählen und die Server-Adresse alpensmp.falixsrv.me eingeben. Für Bedrock zusätzlich den Port 27491 angeben. Unter Server findest du alles zum direkten Kopieren."
	},
	{
		q: "Welche Minecraft-Version wird empfohlen?",
		a: "Empfohlen wird aktuell Minecraft 1.21.11. Andere Versionen können funktionieren; 26.2+ kann Verbindungsprobleme verursachen."
	},
	{
		q: "Kann ich mit Bedrock beitreten?",
		a: "Ja. AlpenSMP unterstützt Java und Bedrock – beide Editionen spielen auf demselben Server gemeinsam."
	},
	{
		q: "Wie lautet die Server-IP?",
		a: "alpensmp.falixsrv.me – du kannst sie auf der Startseite oder unter Server mit einem Klick kopieren."
	},
	{
		q: "Welchen Port brauche ich auf Bedrock?",
		a: "Der Bedrock-Port ist 27491. Adresse: alpensmp.falixsrv.me."
	},
	{
		q: "Brauche ich Discord, um spielen zu können?",
		a: "Nein. Discord ist nicht zwingend erforderlich, wird aber für Support, Updates und die Community empfohlen."
	},
	{
		q: "Kann ich meine Gebäude schützen?",
		a: "Ja. Deine Grundstücke und Builds werden durch GriefPrevention geschützt. Pro Stunde Online-Zeit gibt es +1000 Claim-Blöcke."
	},
	{
		q: "Gibt es Simple Voice Chat?",
		a: "Ja. Simple Voice Chat ist auf dem Server aktiv. Für Java installierst du den Client-Mod (z. B. über Modrinth). Ohne Mod kannst du trotzdem normal spielen."
	},
	{
		q: "Gibt es /home, /tpa und /back?",
		a: "Ja. Homes, TPA und /back gehören zu den verfügbaren Server-Features. /back bringt dich zurück zu deinem letzten Tod. Dazu kommen /spawn, /homes, /rtp, /msg und /call admin."
	},
	{
		q: "Was passiert, wenn ich sterbe?",
		a: "Deine Items bleiben über die Todesgräber auffindbar – du verlierst sie nicht einfach."
	},
	{
		q: "Ist AlpenSMP kostenlos?",
		a: "Ja. Du kannst dem Server kostenlos beitreten. Es gibt keine Pay-to-Win-Mechaniken. AlpenSMP ist ein privater, nicht-kommerzieller Minecraft-Server."
	},
	{
		q: "Wo bekomme ich Hilfe, wenn etwas nicht funktioniert?",
		a: "Öffne ein Ticket auf dieser Website oder auf dem AlpenSMP-Discord. Dort helfen wir persönlich weiter."
	},
	{
		q: "Ist AlpenSMP ein Survival-Server?",
		a: "Ja. AlpenSMP basiert auf einem gemeinsamen Survival-Erlebnis mit Community, Projekten und eigenen Geschichten – ergänzt um praktische Komfort-Funktionen."
	},
	{
		q: "Kann ich mit Freunden zusammenspielen?",
		a: "Absolut. Gemeinsam bauen, erkunden und Projekte starten gehört zum Konzept von AlpenSMP."
	},
	{
		q: "Wo ist die Live-Karte?",
		a: "Die BlueMap der Hauptworld (Overworld) öffnet sich über den Bereich Karte. Sie zeigt die gemeinsame Overworld in einem eigenen Tab."
	},
	{
		q: "Darf ich X-Ray, Fly oder KillAura?",
		a: "Nein. X-Ray, Fly, KillAura, Reach, ESP, übermässige Autoclicker und automatisches Spielen sind verboten. Erlaubt sind unter anderem Sodium, Iris, OptiFine, Freecam, Xaero’s Minimap und Simple Voice Chat. Bei Unsicherheit vorher das Team fragen."
	}
];
var GUIDE = [
	{
		id: "mc-was",
		track: "mc",
		title: "Was ist Minecraft?",
		description: "Welt aus Blöcken – bauen, erkunden, sammeln, überleben.",
		keywords: "minecraft grundlagen blöcke",
		blocks: ["Minecraft ist ein Spiel in einer Welt aus Würfeln (Blöcken). Du kannst abbauen, bauen, Ressourcen sammeln, Tiere züchten, Höhlen erkunden und nachts gegen Monster bestehen."]
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
			"Eine Unterkunft mit Tür und Fackeln bauen, bevor es dunkel wird."
		]
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
			"Creeper explodieren in der Nähe – Abstand halten."
		]
	},
	{
		id: "alpen-willkommen",
		track: "alpen",
		title: "Willkommen auf AlpenSMP",
		description: "Survival für Java und Bedrock.",
		keywords: "willkommen survival community",
		blocks: ["Deutschsprachiger Survival-Server, gemeinsame Welt, keine Pay-to-Win-Mechaniken.", "Dazu Claims, optionaler Voice Chat, Homes, TPA, RTP und Todesgräber."]
	},
	{
		id: "alpen-join",
		track: "alpen",
		title: "Server beitreten",
		description: "IP, Port, Version.",
		keywords: "join ip bedrock port version",
		blocks: [
			"Java: alpensmp.falixsrv.me",
			"Bedrock: dieselbe Adresse, Port 27491",
			"Empfohlen: Minecraft 1.21.11. Version 26.2+ kann Verbindungsprobleme machen."
		]
	},
	{
		id: "alpen-regeln",
		track: "alpen",
		title: "Server-Regeln",
		description: "Immer das offizielle Regelwerk nutzen.",
		keywords: "regeln fairplay mods",
		blocks: ["14 verbindliche Regeln – für Minecraft und, soweit genannt, Discord.", "Kurzfassung: Respekt, kein Cheat, Claims nicht griefen, Fair Play. Die vollständige Fassung steht unter Regeln."]
	},
	{
		id: "alpen-voice",
		track: "alpen",
		title: "Voice Chat",
		description: "Simple Voice Chat, optional.",
		keywords: "voice modrinth mikro",
		blocks: ["Nähe-basierte Sprache. Ohne Mod kannst du trotzdem joinen.", "Java-Mod passend zu 1.21.11, zum Beispiel über die Modrinth-App."]
	},
	{
		id: "alpen-commands",
		track: "alpen",
		title: "Wichtige Befehle",
		description: "Nur bestätigte Commands.",
		keywords: "spawn home tpa back rtp msg admin",
		blocks: [
			"/spawn · /sethome · /home · /homes",
			"/tpa · /back · /rtp · /msg · /call admin",
			"Claims wachsen mit der Spielzeit: +1000 Claim-Blöcke pro Stunde online."
		]
	}
];
var REVIEWS = [
	{
		name: "Owner beugt sich",
		rating: 5,
		text: "Super server Super Owner"
	},
	{
		name: "Ich0913",
		rating: 5,
		text: "Toller server, Nette und hilfsbereite admins und owner und coole gebäude.\nMan kann verhindern das andere dein haus hochjagen was sehr toll ist.\n\nToller server, kann man nur weiter empfehlen!!"
	},
	{
		name: "Pfitzinator",
		rating: 5,
		text: "sehr netter owner und sehr nette ownerin sehr große gebeude und eine sehr nette community"
	},
	{
		name: "YB-FOREVER",
		rating: 5,
		text: "In einer Zeit des Überkonsums wo man keine 2 min ohne Eindrücke von außen verbringen kann ist der AlpenSMP perfekt zum abschalten.Keine nervigen Spammer, kein Pay to win, keine Werbung, keine Überladenen Lobbys ich könnte ewig weiter machen.Der AlpenSMP ist einfach Minecraft wie es gedacht ist ob alleine vor sich hin tüfteln oder mit anderen Chillen es geht nicht darum der beste zu sein sondern einfach Spaß zu haben."
	},
	{
		name: "Reaxsis",
		rating: 5,
		text: "Sehr coole und nette Menschen außer Bexy_1 , Sehr netter Owner, Coole Builds und es macht sehr viel Spaß einfach zu spielen ich kann diesen Server sehr empfehlen."
	},
	{
		name: "AltSplash3908",
		rating: 5,
		text: "Geiler Server, netter Owner und nettes Team. Hab viele Freunde gefunden und coole/lustige Momente garantiert"
	},
	{
		name: "Bexy_1",
		rating: 5,
		text: "mir Gefällt an dem Server dass der owner und die Admins Server nett sind und der Server sehr flüssig ist"
	},
	{
		name: "FlaviousABG",
		rating: 5,
		text: "Ein wirklich super SMP-Server! Die Community ist freundlich und das Spielerlebnis macht richtig Spaß. Besonders der Owner SwissRed kümmert sich gut um den Server und die Spieler. Man merkt, dass viel Arbeit und Mühe in den AlpenSMP gesteckt wird. Klare Empfehlung für alle, die einen guten Minecraft-SMP suchen!"
	},
	{
		name: "Plinsen (in Minecraft Sasuke)",
		rating: 4,
		text: "Es gibt sehr viele nette Leute und es ist allgemein sehr idyllisch.\nAllerdings sind viele orte schon leergefarmt."
	},
	{
		name: "Heini14",
		rating: 5,
		text: "Es ist ein sehr entspannter SMP auf dem sich die Menschen auf das Bauen und das Soziale miteinander fokussieren."
	},
	{
		name: "GamerLoks2303",
		rating: 5,
		text: "Immer was los, sympathische Leute, jede Menge Spaß und eine richtig gute Community"
	},
	{
		name: "MaysonKF",
		rating: 5,
		text: "Ich Persönlich finde den Server sehr cool er macht nen Riesen Spaß zu zocken. Man kann viele neue Leute kennenlernen. Der Owner und die Ownerin sind beide sehr liebe Personen mit denen man über alles reden kann. Also kommt auf den Server um Spaß zu haben."
	},
	{
		name: "Pfitzinator",
		rating: 5,
		text: "toller server coole leute und noch viel mehr"
	},
	{
		name: "GamerFinn023",
		rating: 5,
		text: "Mega Server viele lustige Leute und immer neu Sachen zu entdecken"
	}
];
var TEAM = [
	{
		role: "Owner",
		title: "Serverleitung & Vision",
		text: "Persönliche Serverleitung statt anonymer Netzwerk-Struktur. Der Owner hat bei Streitfällen und unklaren Situationen das letzte Wort und hält die Richtung: Vanilla Survival, fair, ohne Pay-to-Win."
	},
	{
		role: "Moderation",
		title: "Faire Spielumgebung",
		text: "Moderation achtet auf Respekt, Claims und Fair Play. Strafen reichen je nach Fall von Verwarnung über Kick bis zu temporärem oder permanentem Bann. Diskussionen über Strafen gehören nicht in den öffentlichen Chat."
	},
	{
		role: "Community",
		title: "Support & Austausch",
		text: "Updates, gemeinsame Projekte und Hilfe laufen über Discord und Tickets. Discord ist nicht Pflicht zum Spielen, aber der direkte Weg zum Team."
	}
];
function cite(id, title) {
	return `Regel ${id} (${title})`;
}
function answerQuestion(raw) {
	const q = raw.toLowerCase().trim();
	if (!q) return "Schreib eine Frage – zum Beispiel nach der IP, Claims oder „Darf ich X-Ray?“.";
	const num = q.match(/regel\s*(\d{1,2})/) || q.match(/§\s*(\d{1,2})/);
	if (num) {
		const n = Number(num[1]);
		const hit = RULES.find((r) => r.id === n);
		if (!hit) return `Im Regelwerk gibt es keine Regel ${n}. Aktuell sind es ${RULES.length} Regeln.`;
		const parts = [`${cite(hit.id, hit.title)}:`, ...hit.paragraphs];
		if (hit.forbidden?.length) parts.push(`Verboten: ${hit.forbidden.join(", ")}.`);
		if (hit.allowed?.length) parts.push(`Ausdrücklich erlaubt, zum Beispiel: ${hit.allowed.join(", ")}.`);
		if (hit.bullets?.length) parts.push(hit.bullets.join(", ") + ".");
		if (hit.note) parts.push(hit.note);
		return parts.join(" ");
	}
	if (/x-?ray|killaura|fly hack|reach\b|esp\b/.test(q)) return "Nein. X-Ray, Fly, KillAura, Reach und ESP sind laut Regel 3 (Cheats & Mods) verboten.";
	if (/sodium|freecam|optifine|iris|xaero|minimap/.test(q)) return "Ja. OptiFine, Sodium, Iris, Freecam und Xaero’s Minimap sind laut Regel 3 ausdrücklich erlaubt. Mods, die dort nicht stehen, vorher beim Team nachfragen.";
	if (/töte|töten|toten|killen|umbringen|pvp/.test(q)) return "Grundloses Töten aus Spass ist laut Regel 11 nicht erlaubt – ausser beide Seiten sind einverstanden.";
	if (/mehrfach|zweitaccount|alt.?account|afk/.test(q)) return "Java- und Bedrock-Accounts dürfen laut Regel 10 zum AFK-Stehen genutzt werden. Sie dürfen Regeln, Banns oder Strafen nicht umgehen.";
	if (/ip|adresse|serverip/.test(q)) return `Die Server-Adresse lautet ${SITE.ip}. Java: Mehrspieler, Adresse einfügen. Bedrock: dieselbe Adresse, Port ${SITE.bedrockPort}.`;
	if (/port|bedrock/.test(q)) return `Bedrock-Port: ${SITE.bedrockPort}. Adresse: ${SITE.ip}. Java und Bedrock spielen auf derselben Welt.`;
	if (/version|1\.21|26\.2/.test(q)) return `Empfohlen: Minecraft ${SITE.version}. Andere Versionen können gehen. 26.2+ kann Verbindungsprobleme machen. Der Server läuft auf Paper.`;
	if (/claim|grief|schutz|grundstück/.test(q)) return "GriefPrevention schützt deine Builds. Pro 1 Stunde Online-Zeit: +1000 Claim-Blöcke. Freunde kannst du einladen, Fremde können im Claim nicht abbauen oder platzieren.";
	if (/voice|mikro|sprechen|proximity/.test(q)) return "Simple Voice Chat ist aktiv und nähe-basiert. Für Java brauchst du den Client-Mod (Modrinth), passend zu deiner Minecraft-Version. Ohne Mod kannst du trotzdem joinen.";
	if (/home|sethome/.test(q)) return "Mit /sethome speicherst du einen Punkt, mit /home kehrst du zurück. /homes listet deine Punkte.";
	if (/tpa|teleport/.test(q)) return "/tpa und der Spielername sendet eine Anfrage. Nach Annahme teleportierst du dich zum anderen.";
	if (/\bback\b|todesort/.test(q)) return "/back bringt dich zum letzten Todesort – praktisch, um Items zu holen.";
	if (/tod|sterben|grab|items/.test(q)) return "Bei Tod bleiben Items in einem Todesgrab. Du kannst sie holen, solange das Grab erreichbar ist.";
	if (/kosten|gratis|pay|spende|donate/.test(q)) return "AlpenSMP ist kostenlos und ohne Pay-to-Win. Spielen geht ohne Zahlung. Es ist ein privater, nicht-kommerzieller Server.";
	if (/discord|ticket|hilfe|support/.test(q)) return `Discord: ${SITE.discord} – Tickets, Updates und Community. Discord ist nicht Pflicht zum Spielen. Ein Ticket geht auch unter Kontakt.`;
	if (/tiktok/.test(q)) return `TikTok: ${SITE.tiktokHandle} – Clips, Builds und Server-Momente.`;
	if (/karte|bluemap|map/.test(q)) return "Die Live-Karte ist eine BlueMap der Hauptworld (Overworld). Du öffnest sie unter Karte in einem neuen Tab.";
	if (/rtp|spawn|\/msg|call admin|befehl|command/.test(q)) return "Bestätigte Befehle: /spawn, /sethome, /home, /homes, /tpa, /back, /rtp, /msg und /call admin.";
	if (/strafe|bann|ban|kick|verwarn/.test(q)) return "Laut Regel 14 sind je nach Fall Verwarnung, Kick, temporärer oder permanenter Bann sowie weitere Massnahmen möglich. Nicht jeder Verstoss wird gleich bestraft.";
	if (/owner|letzte[sn]? wort|einzelfall/.test(q)) return "Bei Streitfällen und unklaren Situationen hat laut Regel 13 der Owner das letzte Wort. Regeln können nicht jede Situation vollständig abdecken.";
	if (/pixelart|porno|sexuell|rassist|skin/.test(q)) return "Laut Regel 5 und 9 sind sexuelle, pornografische, extremistische, rassistische oder diskriminierende Bauwerke, Pixelarts, Schilder, Karten, Skins und Namen verboten.";
	if (/hallo|hi\b|hey|moin/.test(q)) return "Hey. Frag nach IP, Port, Version, Claims, Voice Chat, Regeln oder Discord.";
	if (/danke|thanks/.test(q)) return "Gern. Viel Spaß auf AlpenSMP.";
	if (/regel/.test(q)) return "Das offizielle Regelwerk hat 14 Regeln. Frag zum Beispiel „Was steht in Regel 5?“ oder „Sind Sodium und Freecam erlaubt?“.";
	return `Dazu habe ich keine feste Antwort aus dem Regelwerk. Schreib dem Team auf Discord: ${SITE.discord}`;
}
var STARTER = "Hallo. Ich kenne das offizielle AlpenSMP-Regelwerk. Frag nach der IP – oder „Darf ich X-Ray?“, „Sind Sodium und Freecam erlaubt?“";
function Assistant() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [text, setText] = (0, import_react.useState)("");
	const [msgs, setMsgs] = (0, import_react.useState)([{
		role: "bot",
		text: STARTER
	}]);
	function send() {
		const q = text.trim();
		if (!q) return;
		setText("");
		setMsgs((list) => [
			...list,
			{
				role: "user",
				text: q
			},
			{
				role: "bot",
				text: answerQuestion(q)
			}
		]);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed bottom-4 left-4 z-40",
		children: [open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mb-3 flex w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-line bg-bg-raised shadow-2xl",
			role: "dialog",
			"aria-label": "AlpenKI",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-center justify-between border-b border-line px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: "AlpenKI"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "grid size-9 place-items-center text-muted",
						"aria-label": "Schließen",
						onClick: () => setOpen(false),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex max-h-80 flex-col gap-3 overflow-y-auto px-4 py-4",
					children: msgs.map((msg, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: msg.role === "user" ? "ml-6 rounded-md bg-surface-2 px-3 py-2 text-sm text-fg" : "mr-4 rounded-md border border-line bg-surface px-3 py-2 text-sm text-muted",
						children: msg.text
					}, i))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex gap-2 border-t border-line p-3",
					onSubmit: (e) => {
						e.preventDefault();
						send();
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						value: text,
						maxLength: 200,
						placeholder: "Deine Frage…",
						"aria-label": "Nachricht eingeben",
						onChange: (e) => setText(e.target.value)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "grid size-11 shrink-0 place-items-center rounded-md bg-gold text-bg",
						"aria-label": "Senden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
					})]
				})
			]
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-fg hover:border-gold",
			"aria-expanded": open,
			onClick: () => setOpen((v) => !v),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4 text-gold" }), "AlpenKI"]
		})]
	});
}
function Shell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "#main",
				className: "sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-gold focus:px-3 focus:py-2 focus:text-bg",
				children: "Zum Inhalt springen"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				id: "main",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Assistant, {})
		]
	});
}
function Mark({ className = "size-8" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "grid size-10 place-items-center rounded-md border border-line bg-surface-2 text-gold",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mountain, {
			className,
			strokeWidth: 1.75,
			"aria-hidden": "true"
		})
	});
}
function Header() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const close = () => setOpen(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-40 border-b border-line/80 bg-bg/90 backdrop-blur",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "shell flex h-16 items-center gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-3",
					onClick: close,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "display text-lg text-fg",
						children: ["Alpen", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-gold",
							children: "SMP"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "ml-auto hidden items-center gap-1 lg:flex",
					"aria-label": "Hauptnavigation",
					children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: item.to,
						activeOptions: { exact: item.to === "/" },
						className: "rounded-md px-3 py-2 text-sm text-muted data-[status=active]:text-fg",
						children: item.label
					}, item.to))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/server",
					className: "btn-gold hidden sm:inline-flex",
					children: "Beitreten"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "ml-auto grid size-11 place-items-center rounded-md border border-line text-fg lg:hidden",
					"aria-expanded": open,
					"aria-label": open ? "Menü schließen" : "Menü öffnen",
					onClick: () => setOpen((v) => !v),
					children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
				})
			]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "border-t border-line bg-bg-raised lg:hidden",
			"aria-label": "Mobile Navigation",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shell flex flex-col py-3",
				children: [[...NAV, ...MORE].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: item.to,
					className: "min-h-11 rounded-md px-2 py-3 text-base text-fg",
					onClick: close,
					children: item.label
				}, item.to)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/server",
					className: "btn-gold mt-2",
					onClick: close,
					children: "Beitreten"
				})]
			})
		}) : null]
	});
}
function Footer() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "mt-20 border-t border-line",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "shell grid gap-10 py-12 md:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:col-span-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "display text-2xl",
							children: ["Alpen", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-gold",
								children: "SMP"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 max-w-sm text-sm text-muted",
							children: "Vanilla Survival · Java & Bedrock · Faire Community · Persönliche Serverleitung"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-faint",
							children: "Privater, nicht-kommerzieller Minecraft-Server."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold text-fg",
					children: "Seiten"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2 text-sm text-muted",
					children: [...NAV, ...MORE].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: item.to,
						className: "hover:text-gold",
						children: item.label
					}) }, item.to))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold text-fg",
					children: "Community"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 space-y-2 text-sm text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: SITE.discord,
							target: "_blank",
							rel: "noreferrer",
							className: "hover:text-gold",
							children: "Discord"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: SITE.tiktok,
							target: "_blank",
							rel: "noreferrer",
							className: "hover:text-gold",
							children: ["TikTok ", SITE.tiktokHandle]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: SITE.map,
							target: "_blank",
							rel: "noreferrer",
							className: "hover:text-gold",
							children: "Live-Karte"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: SITE.staff,
							target: "_blank",
							rel: "noreferrer",
							className: "hover:text-gold",
							children: "Staff-Bereich"
						}) })
					]
				})] })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-line",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shell flex flex-col gap-2 py-4 text-xs text-faint sm:flex-row sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "© 2026 AlpenSMP" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Für die Community gebaut." })]
			})
		})]
	});
}
function PageHero({ kicker, title, lede }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "border-b border-line bg-bg-raised",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "shell py-14 md:py-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "kicker",
					children: kicker
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "display mt-3 max-w-3xl text-4xl text-fg md:text-5xl",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-2xl text-lg text-muted",
					children: lede
				})
			]
		})
	});
}
//#endregion
export { PILLARS as a, RULES as c, Shell as d, TEAM as f, GUIDE as i, RULES_INTRO as l, FAQ as n, PageHero as o, FEATURES as r, REVIEWS as s, COMMANDS as t, SITE as u };
