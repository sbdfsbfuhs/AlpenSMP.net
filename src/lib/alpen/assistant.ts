import { RULES } from "@/lib/alpen/content";
import { SITE } from "@/lib/alpen/site";

function cite(id: number, title: string) {
  return `Regel ${id} (${title})`;
}

export function answerQuestion(raw: string): string {
  const q = raw.toLowerCase().trim();
  if (!q) return "Schreib eine Frage – zum Beispiel nach der IP, Claims oder „Darf ich X-Ray?“.";

  const num = q.match(/regel\s*(\d{1,2})/) || q.match(/§\s*(\d{1,2})/);
  if (num) {
    const n = Number(num[1]);
    const hit = RULES.find((r) => r.id === n);
    if (!hit) return `Im Regelwerk gibt es keine Regel ${n}. Aktuell sind es ${RULES.length} Regeln.`;
    const parts = [`${cite(hit.id, hit.title)}:` , ...hit.paragraphs];
    if (hit.forbidden?.length) parts.push(`Verboten: ${hit.forbidden.join(", ")}.`);
    if (hit.allowed?.length) parts.push(`Ausdrücklich erlaubt, zum Beispiel: ${hit.allowed.join(", ")}.`);
    if (hit.bullets?.length) parts.push(hit.bullets.join(", ") + ".");
    if (hit.note) parts.push(hit.note);
    return parts.join(" ");
  }

  if (/x-?ray|killaura|fly hack|reach\b|esp\b/.test(q)) {
    return "Nein. X-Ray, Fly, KillAura, Reach und ESP sind laut Regel 3 (Cheats & Mods) verboten.";
  }
  if (/sodium|freecam|optifine|iris|xaero|minimap/.test(q)) {
    return "Ja. OptiFine, Sodium, Iris, Freecam und Xaero’s Minimap sind laut Regel 3 ausdrücklich erlaubt. Mods, die dort nicht stehen, vorher beim Team nachfragen.";
  }
  if (/töte|töten|toten|killen|umbringen|pvp/.test(q)) {
    return "Grundloses Töten aus Spass ist laut Regel 11 nicht erlaubt – ausser beide Seiten sind einverstanden.";
  }
  if (/mehrfach|zweitaccount|alt.?account|afk/.test(q)) {
    return "Java- und Bedrock-Accounts dürfen laut Regel 10 zum AFK-Stehen genutzt werden. Sie dürfen Regeln, Banns oder Strafen nicht umgehen.";
  }
  if (/ip|adresse|serverip/.test(q)) {
    return `Java: ${SITE.ip}. Den Port trägst du nicht ein, der SRV-Eintrag schickt den Client auf ${SITE.play}, Port ${SITE.javaPort}. Bedrock: ${SITE.play}, Port ${SITE.bedrockPort}, weil Bedrock den SRV-Eintrag ignoriert.`;
  }
  if (/port|bedrock/.test(q)) {
    return `Bedrock: ${SITE.play}, Port ${SITE.bedrockPort}. Bedrock ignoriert den SRV-Eintrag. Java: nur ${SITE.ip}, ohne Port. Der SRV-Eintrag schickt Java auf ${SITE.play}, Port ${SITE.javaPort}.`;
  }
  if (/version|1\.21|26\.2/.test(q)) {
    return `Empfohlen: Minecraft ${SITE.version}. Andere Versionen können gehen. 26.2+ kann Verbindungsprobleme machen. Der Server läuft auf Paper.`;
  }
  if (/claim|grief|schutz|grundstück/.test(q)) {
    return "GriefPrevention schützt deine Builds. Pro 1 Stunde Online-Zeit: +1000 Claim-Blöcke. Freunde kannst du einladen, Fremde können im Claim nicht abbauen oder platzieren.";
  }
  if (/voice|mikro|sprechen|proximity/.test(q)) {
    return "Simple Voice Chat ist aktiv und nähe-basiert. Für Java brauchst du den Client-Mod (Modrinth), passend zu deiner Minecraft-Version. Ohne Mod kannst du trotzdem joinen.";
  }
  if (/home|sethome/.test(q)) return "Mit /sethome speicherst du einen Punkt, mit /home kehrst du zurück. /homes listet deine Punkte.";
  if (/tpa|teleport/.test(q)) return "/tpa und der Spielername sendet eine Anfrage. Nach Annahme teleportierst du dich zum anderen.";
  if (/\bback\b|todesort/.test(q)) return "/back bringt dich zum letzten Todesort – praktisch, um Items zu holen.";
  if (/tod|sterben|grab|items/.test(q)) {
    return "Bei Tod bleiben Items in einem Todesgrab. Du kannst sie holen, solange das Grab erreichbar ist.";
  }
  if (/kosten|gratis|pay|spende|donate/.test(q)) {
    return "AlpenSMP ist kostenlos und ohne Pay-to-Win. Spielen geht ohne Zahlung. Es ist ein privater, nicht-kommerzieller Server.";
  }
  if (/discord|ticket|hilfe|support/.test(q)) {
    return `Discord: ${SITE.discord} – Tickets, Updates und Community. Discord ist nicht Pflicht zum Spielen. Ein Ticket geht auch unter Kontakt.`;
  }
  if (/tiktok/.test(q)) return `TikTok: ${SITE.tiktokHandle} – Clips, Builds und Server-Momente.`;
  if (/karte|bluemap|map/.test(q)) {
    return "Die Live-Karte ist gerade zu. Der Speicher auf dem Kartenserver ist voll. Schau ein anderes Mal wieder vorbei. Spielen geht trotzdem, die Welt selbst läuft.";
  }
  if (/prefix|teamfarbe|farbcode|namensfarbe/.test(q)) {
    return "Das ist der Team-Prefix, nicht der Spielername. Chat öffnen: /team prefix und direkt Farbcode plus Teamname, ohne Leerzeichen. Beispiel: /team prefix &cAlpen. Farbcode und Teamname zusammen höchstens 10 Zeichen. Im Tab steht der Prefix vor dem Spielernamen, und nur dieser Text ist farbig. Alle Farben stehen auf der Prefix-Seite.";
  }
  if (/rtp|spawn|\/msg|call admin|befehl|command/.test(q)) {
    return "Java (Taste T): /spawn, /sethome, /home, /homes, /tpa Spieler, /back, /rtp, /msg Spieler, /call admin. Bedrock (Chat-Taste): dieselben Befehle, aber Namen mit Punkt, zum Beispiel /tpa .Spieler.";
  }
  if (/strafe|bann|ban|kick|verwarn/.test(q)) {
    return "Laut Regel 14 sind je nach Fall Verwarnung, Kick, temporärer oder permanenter Bann sowie weitere Massnahmen möglich. Nicht jeder Verstoss wird gleich bestraft.";
  }
  if (/owner|letzte[sn]? wort|einzelfall/.test(q) && /letzte|einzelfall|streit|wort/.test(q)) {
    return "Bei Streitfällen und unklaren Situationen hat laut Regel 13 der Owner das letzte Wort. Der Owner heißt ingame SwissRed. Regeln können nicht jede Situation vollständig abdecken.";
  }

  const known = knownFacts(q);
  if (known) return known;

  if (/team|admin|staff|helper|supporter|builder/.test(q)) {
    return "Owner ist SwissRed. Im Team gibt es außerdem Admin, Helper, Supporter und Builder. Öffentliche Fragen beantworte ich. Für ein Ticket: Kontakt oder Discord.";
  }
  if (/pixelart|porno|sexuell|rassist|skin/.test(q)) {
    return "Laut Regel 5 und 9 sind sexuelle, pornografische, extremistische, rassistische oder diskriminierende Bauwerke, Pixelarts, Schilder, Karten, Skins und Namen verboten.";
  }
  if (/hallo|hi\b|hey|moin|servus|guten (tag|morgen|abend)/.test(q)) {
    return "Hey. Ich bin die AlpenKI. Frag nach der IP, nach SwissRed, nach Claims oder den Regeln. Oder sag: setz dich, schlaf, wink.";
  }
  if (/danke|thanks|merci/.test(q)) return "Gern. Viel Spaß auf AlpenSMP.";
  if (/wer bist du|was bist du|wie heißt du|dein name|bist du/.test(q)) {
    return "Ich bin die AlpenKI, das Maskottchen von AlpenSMP. Ich kenne die Regeln, die IP und die Befehle. Sag wink, setz dich oder schlaf, dann mach ich das.";
  }
  if (/was ist alpen|was macht alpen|erzähl.*server|über den server|wer seid ihr/.test(q)) {
    return "AlpenSMP ist ein deutscher Vanilla-Survival-Server. Java und Bedrock, eine Welt, ohne Pay-to-Win. Community, Claims, Homes und Voice Chat.";
  }
  if (/wie join|wie komm|beitreten|joinen|mitspielen/.test(q)) {
    return `Java: ${SITE.ip}, ohne Port. Bedrock: ${SITE.play}, Port ${SITE.bedrockPort}. Version ungefähr ${SITE.version}.`;
  }
  if (/mascot|maskottchen|häschen|hase|känchen/.test(q)) {
    return "Das bin ich. Cremefarben, roter Schal. Klick mich, dann öffnet sich dieser Chat. Ich kann sitzen, schlafen, winken und gähnen.";
  }
  if (/witz|haha|lustig|joke/.test(q)) return "Warum hat der Creeper keine Freunde? Weil er immer explodiert, wenn es spannend wird. haha";
  if (/regel/.test(q)) return "Das offizielle Regelwerk hat 14 Regeln. Frag zum Beispiel „Was steht in Regel 5?“ oder „Sind Sodium und Freecam erlaubt?“.";
  if (/was kannst du|hilfe mir|was geht|befehle an dich/.test(q)) {
    return "Ich antworte zu IP, Version, Mods, Claims, Homes, Voice, Discord, Regeln und zum Owner SwissRed. Außerdem: setz dich, schlaf, steh auf, wink, gähn.";
  }

  return "Bro, hab kein Plan was du meinst. Öffne Discord, da hilft das Team.";
}

function knownFacts(q: string): string | null {
  const swiss = /swiss\s*red|swissred|\bswiss\b/.test(q);
  const owner = /owner|serverleitung|gründer|gruender/.test(q);
  const cmds =
    "Java (Taste T): /spawn, /sethome, /home, /homes, /tpa Spieler, /back, /rtp, /msg Spieler, /call admin. Bedrock (Chat-Taste): dieselben Befehle, Namen mit Punkt, also /tpa .Spieler und /msg .Spieler.";

  if (/passwort|password|\bseed\b|welt.?seed/.test(q)) {
    return `Passwort und Seed sind nicht öffentlich. Die Server-Adresse ist ${SITE.ip}.`;
  }
  if (/wo (ist|liegt|steht|finde ich) (der |den )?server|server.?adresse|welche ip/.test(q)) {
    return `Java: ${SITE.ip}, Port nicht eintragen. Bedrock: ${SITE.play}, Port ${SITE.bedrockPort}. Website: https://alpensmp.net.`;
  }
  if ((swiss || owner) && /wohn|lebt|adresse|privat|haus\b|heimat|woher|stadt|land\b|zu hause|zuhause/.test(q)) {
    return `SwissRed ist der Owner, so heißt er ingame. Wo er privat wohnt, sag ich nicht. Für dich erreichst du ihn über den Server ${SITE.ip} oder den Discord ${SITE.discord}.`;
  }
  if (/wie alt|echter name|richtigen? namen|irl|real life|discord.?tag|wohnort/.test(q)) {
    return "Privatdaten geb ich nicht raus. Fest steht nur: Der Owner heißt ingame SwissRed.";
  }
  if (/bist du (der )?(owner|swiss)|heißt du swiss|heisst du swiss|bist du swissred/.test(q)) {
    return "Nein. Ich bin die AlpenKI, das Maskottchen mit dem roten Schal. Der Owner heißt ingame SwissRed.";
  }
  if (/ownerin|zweite owner|mitowner/.test(q)) {
    return "In den Community-Stimmen wird eine Ownerin erwähnt. Einen festen öffentlichen Ingame-Namen dafür hab ich nicht. Der Owner, der feststeht, heißt SwissRed.";
  }
  if (
    swiss ||
    /wer ist der owner|wie hei[sß]t der owner|name (vom|des) owners|wer leitet|wer hat (den |diesen )?server|serverowner/.test(q)
  ) {
    return "Der Owner von AlpenSMP heißt ingame SwissRed. Bei Streitfällen hat er laut Regel 13 das letzte Wort. Richtung: Vanilla Survival, fair, ohne Pay-to-Win.";
  }
  if (/wie viele regeln|wieviel regeln|anzahl.*regeln|14 regeln/.test(q)) {
    return "Es gibt 14 Regeln. Frag zum Beispiel „Was steht in Regel 3?“ oder „Regel 11“.";
  }
  if (/welche befehle|alle befehle|command liste|befehls?liste|was für befehle|welche commands/.test(q)) {
    return cmds;
  }
  if (/punkt|\.spieler|bedrock.?name/.test(q)) {
    return "Auf Bedrock beginnt der Name mit einem Punkt. Beispiel: /tpa .Spieler und /msg .Spieler. Den Chat öffnest du mit der Chat-Taste, nicht mit T.";
  }
  if (/taste t|chat.?taste|wie öffne ich (den )?chat/.test(q)) {
    return "Java: Taste T, dann den Befehl. Bedrock: Chat-Taste, und Namen mit Punkt.";
  }
  if (/whitelist|white list/.test(q)) {
    return `Eine Whitelist steht auf der Website nicht. Joinen geht mit der Adresse ${SITE.ip}.`;
  }
  if (/cracked|premium|offline.?mode|noid/.test(q)) {
    return "Ob Cracked erlaubt ist, steht nicht im Regelwerk. Im Zweifel kurz auf Discord fragen, bevor du joinst.";
  }
  if (/nether|\bend\b|the end|enderdrache/.test(q)) {
    return "Die Live-Karte zeigt nur die Hauptworld, und sie ist gerade zu, weil der Speicher voll ist. Zu Nether und End steht auf der Seite nichts Extra.";
  }
  if (/geld|coins?|economy|eco\b|rang|rank|kit\b|pay.?to.?win|spende|donate|shop.?befehl/.test(q)) {
    return "AlpenSMP ist kostenlos und ohne Pay-to-Win. Ränge oder Kits zum Kaufen gibt es nicht. Einen Geld- oder Shop-Befehl listet die Seite nicht.";
  }
  if (/creative|gamemode|\/fly|fliegen/.test(q) && !/fly hack/.test(q)) {
    return "AlpenSMP ist Survival, kein Creative-Server. Fly-Hacks sind laut Regel 3 verboten. Survival-Flug aus dem Spiel selbst, zum Beispiel mit Elytren, ist normales Minecraft.";
  }
  if (/claim.?block|1000|wie viel claim|wieviele claim|claim größe|claimgro/.test(q)) {
    return "GriefPrevention: pro 1 Stunde online +1000 Claim-Blöcke. Im Claim können Fremde nichts abbauen oder platzieren. Freunde kannst du einladen, den genauen Zusatzbefehl nennt die Seite nicht.";
  }
  if (/\bseed\b|koordinate|spawn.?punkt|wo ist (der )?spawn/.test(q)) {
    return "Spawn-Koordinaten und den Seed gibt die Website nicht raus. Mit /spawn kommst du trotzdem hin.";
  }
  if (/sprache|deutsch|englisch|schweizerdeutsch|auf deutsch/.test(q)) {
    return "AlpenSMP ist deutschsprachig. Der Owner heißt ingame SwissRed. Die Community, die Regeln und die Website sind auf Deutsch.";
  }
  if (/paper|falix|host/.test(q)) {
    return `Der Server läuft auf Paper. Die Adresse ist ${SITE.ip}. Empfohlen ist Minecraft ${SITE.version}.`;
  }
  if (/website|alpensmp\.net|domain/.test(q)) {
    return "Die Website ist https://alpensmp.net. Discord: " + SITE.discord + ". TikTok: " + SITE.tiktokHandle + ".";
  }
  if (/helper werden|admin werden|staff werden|bewerb|mod werden|ins team/.test(q)) {
    return "Ob jemand ins Team kommt, entscheidet SwissRed. Fragen geht über Discord, nicht per Spam im Chat. Regel 6: Support nicht für unnötige Diskussionen missbrauchen.";
  }
  if (/kannst du bannen|banne mich|bist du (ein )?admin|kannst du kicken/.test(q)) {
    return "Nein. Ich bin nur die AlpenKI. Bannen und Kicken macht das Team. Im Spiel rufst du sie mit /call admin.";
  }
  if (/minigame|lobby|skyblock|bedwars/.test(q)) {
    return "Nein. AlpenSMP ist ein Survival-SMP, keine Minigame-Lobby und kein Skyblock.";
  }
  if (/wipe|reset|season|neu aufgesetzt|mapreset/.test(q)) {
    return "Ein Wipe oder eine neue Season steht nicht auf der Website. Nicht davon ausgehen. Frag SwissRed oder das Team auf Discord.";
  }
  if (/wie viele spieler|spielerzahl|ist (der )?server (online|an|aus)|serverstatus/.test(q)) {
    return "Eine feste Spielerzahl hab ich nicht. Ob der Server online ist und wie viele drauf sind, steht live auf der Startseite.";
  }
  if (/soundboard|schreien|mikro spam|voice.?regel/.test(q)) {
    return "Im Voice Chat gelten Respekt und Regel 5. Kein Schreien, Stören oder Soundboard-Spam. Simple Voice Chat ist nähe-basiert und der Mod ist freiwillig.";
  }
  if (/werbung|anderen server|anderen server bewerben/.test(q)) {
    return "Werbung für andere Server oder Projekte ist laut Regel 1 nur mit Team-Erlaubnis erlaubt.";
  }
  if (/scam|betrug|klau|stehlen|item.?dup|dupe|bug.?using|exploit/.test(q)) {
    return "Scammen, Betrügen, Bugusing und Exploits sind laut Regel 4 verboten. Bugs musst du dem Team melden, nicht ausnutzen.";
  }
  if (/claim betreten|darf ich (in )?(den |einen )?claim|fremder claim|haus betreten/.test(q)) {
    return "Fremde können in deinem Claim nichts abbauen oder platzieren. Griefing bleibt verboten. Einfach durchlaufen ist nicht extra verboten, solange du nichts kaputt machst oder klaust.";
  }
  if (/hunger|essen|regenerier|herz/.test(q)) {
    return "Normales Minecraft: ohne Hunger keine Regeneration. Iss regelmäßig. Monster spawnen im Dunkeln, also Licht und ein Haus für die erste Nacht.";
  }
  if (/creeper/.test(q) && /warum|freund|witz/.test(q)) {
    return "Warum hat der Creeper keine Freunde? Weil er immer explodiert, wenn es spannend wird. haha";
  }
  if (/elytra|netherit|enchant|zauber/.test(q)) {
    return "Das ist normales Survival-Minecraft. Der Server schaltet Elytren, Netherite oder Zauber nicht extra frei oder zu. Verboten sind nur Cheats, Dupes und Exploits.";
  }
  if (/modrinth|voice.?mod|voice.?client|fabric|forge/.test(q)) {
    return `Simple Voice Chat für Java gibt es auf Modrinth, passend zu Minecraft ${SITE.version}: ${SITE.voiceMod}. Ohne Mod kannst du trotzdem joinen.`;
  }
  if (/26\.2|neueste version|zu neu/.test(q)) {
    return `Empfohlen ist Minecraft ${SITE.version}. 26.2+ kann Verbindungsprobleme machen. Der Server läuft auf Paper.`;
  }
  if (/bexy/.test(q)) {
    return "Bexy_1 kommt in den Community-Stimmen vor. Das ist kein öffentlicher Staff-Rang. Der Owner heißt SwissRed.";
  }
  if (/was ist grief|griefprevention|was ist ein claim/.test(q)) {
    return "GriefPrevention schützt dein Grundstück. Pro Stunde online: +1000 Claim-Blöcke. Fremde können dort nicht abbauen oder platzieren.";
  }
  if (/was macht (\/)?rtp|was ist rtp|zufalls.?teleport/.test(q)) {
    return "/rtp teleportiert dich an einen zufälligen Ort in der Welt. Zurück zum Start geht mit /spawn, zum Home mit /home.";
  }
  if (/was macht (\/)?tpa|tpa annehmen|tpaccept/.test(q)) {
    return "/tpa Spieler schickt eine Anfrage. Der andere muss annehmen, dann wirst du zu ihm teleportiert. Auf Bedrock: /tpa .Spieler.";
  }
  if (/was macht (\/)?back/.test(q)) return "/back bringt dich zum letzten Todesort, damit du Items aus dem Todesgrab holen kannst.";
  if (/was macht (\/)?msg|private nachricht|flüstern|whisper/.test(q)) {
    return "/msg Spieler schickt eine private Nachricht. Auf Bedrock mit Punkt: /msg .Spieler.";
  }
  if (/call admin|admin rufen|hilfe im spiel/.test(q)) {
    return "/call admin ruft das Team, wenn du im Spiel Hilfe brauchst. Auf Bedrock ebenfalls über die Chat-Taste.";
  }
  if (/wie viele homes|home limit|mehrere homes/.test(q)) {
    return "/sethome speichert einen Punkt, /home bringt dich hin, /homes listet deine Punkte. Ein festes Limit steht auf der Website nicht.";
  }
  if (/tod(es)?grab|items weg|lava|stirbt/.test(q)) {
    return "Beim Tod bleiben die Items in einem Todesgrab, solange das Grab erreichbar ist. /back bringt dich zum Todesort.";
  }
  if (/discord.?pflicht|muss ich (auf )?discord|ohne discord/.test(q)) {
    return `Nein. Discord ist nicht Pflicht zum Spielen. Zum Joinen reicht ${SITE.ip}. Discord ist für Support und Updates: ${SITE.discord}.`;
  }
  if (/straf.*chat|ban.*diskut|warum wurde|unban/.test(q)) {
    return "Strafdiskussionen gehören laut Regel 6 nicht in den öffentlichen Chat. Ein Entbann oder eine Erklärung läuft über ein Ticket oder Discord, nicht über die AlpenKI.";
  }
  if (/lag.?maschine|redstone.?farm|zu große farm|server lag/.test(q)) {
    return "Große Farmen und Redstone sind erlaubt, solange der Server nicht dauerhaft laggt. Das Team darf Anlagen anpassen oder entfernen, wenn sie die Leistung killen. Absichtliche Lagmaschinen sind verboten.";
  }
  if (/skin|name ändern|nickname|unschöner name/.test(q)) {
    return "Namen, Skins, Schilder, Bücher und Karten dürfen laut Regel 9 nichts Beleidigendes, Rassistisches, Sexuelles oder Extremistisches enthalten. Das gilt auch für Discord-Namen, die zur Community gehören.";
  }
  if (/alpenki|wer bist|was kannst|maskottchen/.test(q)) return null;
  if (owner) {
    return "Der Owner heißt ingame SwissRed. Bei Streitfällen hat er laut Regel 13 das letzte Wort. Der Server bleibt Vanilla Survival, fair und ohne Pay-to-Win.";
  }
  return null;
}

export type KiAction = { label: string; href: string };

export function replyTo(raw: string): { text: string; actions: KiAction[] } {
  const text = answerQuestion(raw);
  const q = raw.toLowerCase();
  const actions: KiAction[] = [];
  const unknown = text.startsWith("Bro,");
  if (/regel/.test(q)) actions.push({ label: "Regeln", href: "/regeln" });
  if (/tiktok/.test(q)) actions.push({ label: "TikTok", href: SITE.tiktok });
  if (unknown || /discord|ticket|hilfe|support/.test(q)) actions.push({ label: "Discord öffnen", href: SITE.discord });
  if (/ip|join|beitreten|bedrock|port|version|server/.test(q)) actions.push({ label: "Server", href: "/server" });
  if (/karte|\bmap\b|bluemap/.test(q)) actions.push({ label: "Karte", href: "/karte" });
  if (/prefix|farbe|farbcode/.test(q)) actions.push({ label: "Prefix-Farben", href: "/prefix" });
  if (/home|tpa|befehl|command|guide/.test(q)) actions.push({ label: "Guide", href: "/guide" });
  if (/faq|frage/.test(q)) actions.push({ label: "FAQ", href: "/faq" });
  return { text, actions };
}
