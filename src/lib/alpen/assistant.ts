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
    return `Die Server-Adresse lautet ${SITE.ip}. Java: Mehrspieler, Adresse einfügen. Bedrock: dieselbe Adresse, Port ${SITE.bedrockPort}.`;
  }
  if (/port|bedrock/.test(q)) {
    return `Bedrock-Port: ${SITE.bedrockPort}. Adresse: ${SITE.ip}. Java und Bedrock spielen auf derselben Welt.`;
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
    return "Die Live-Karte ist eine BlueMap der Hauptworld (Overworld). Du öffnest sie unter Karte in einem neuen Tab.";
  }
  if (/rtp|spawn|\/msg|call admin|befehl|command/.test(q)) {
    return "Java (Taste T): /spawn, /sethome, /home, /homes, /tpa Spieler, /back, /rtp, /msg Spieler, /call admin. Bedrock (Chat-Taste): dieselben Befehle, aber Namen mit Punkt, zum Beispiel /tpa .Spieler.";
  }
  if (/strafe|bann|ban|kick|verwarn/.test(q)) {
    return "Laut Regel 14 sind je nach Fall Verwarnung, Kick, temporärer oder permanenter Bann sowie weitere Massnahmen möglich. Nicht jeder Verstoss wird gleich bestraft.";
  }
  if (/owner|letzte[sn]? wort|einzelfall/.test(q)) {
    return "Bei Streitfällen und unklaren Situationen hat laut Regel 13 der Owner das letzte Wort. Regeln können nicht jede Situation vollständig abdecken.";
  }
  if (/pixelart|porno|sexuell|rassist|skin/.test(q)) {
    return "Laut Regel 5 und 9 sind sexuelle, pornografische, extremistische, rassistische oder diskriminierende Bauwerke, Pixelarts, Schilder, Karten, Skins und Namen verboten.";
  }
  if (/hallo|hi\b|hey|moin|servus|guten (tag|morgen|abend)/.test(q)) {
    return "Hey. Ich bin die AlpenKI. Frag nach IP, Port, Version, Claims, Voice Chat oder den Regeln. Oder sag: setz dich, schlaf, wink.";
  }
  if (/danke|thanks|merci/.test(q)) return "Gern. Viel Spaß auf AlpenSMP.";
  if (/wer bist du|was bist du|wie heißt du|dein name|bist du/.test(q)) {
    return "Ich bin die AlpenKI, das Maskottchen von AlpenSMP. Ich kenne die Regeln, die IP und die Befehle. Sag wink, setz dich oder schlaf, dann mach ich das.";
  }
  if (/was ist alpen|was macht alpen|erzähl.*server|über den server|wer seid ihr/.test(q)) {
    return "AlpenSMP ist ein deutscher Vanilla-Survival-Server. Java und Bedrock, eine Welt, ohne Pay-to-Win. Community, Claims, Homes und Voice Chat.";
  }
  if (/wie join|wie komm|beitreten|joinen|mitspielen/.test(q)) {
    return `Java: Mehrspieler, Adresse ${SITE.ip}. Bedrock: dieselbe Adresse, Port ${SITE.bedrockPort}. Version ungefähr ${SITE.version}.`;
  }
  if (/mascot|maskottchen|häschen|hase|känchen/.test(q)) {
    return "Das bin ich. Cremefarben, roter Schal. Klick mich, dann öffnet sich dieser Chat. Ich kann sitzen, schlafen, winken und gähnen.";
  }
  if (/witz|haha|lustig|joke/.test(q)) return "Warum hat der Creeper keine Freunde? Weil er immer explodiert, wenn es spannend wird. haha";
  if (/team|owner|admin|staff/.test(q) && !/letzte/.test(q)) {
    return "Das Team sitzt im Staff-Center. Öffentliche Fragen beantworte ich. Für ein Ticket: Kontakt oder Discord.";
  }
  if (/regel/.test(q)) return "Das offizielle Regelwerk hat 14 Regeln. Frag zum Beispiel „Was steht in Regel 5?“ oder „Sind Sodium und Freecam erlaubt?“.";
  if (/was kannst du|hilfe mir|was geht|befehle an dich/.test(q)) {
    return "Ich antworte zu IP, Version, Mods, Claims, Homes, Voice, Discord und Regeln. Außerdem: setz dich, schlaf, steh auf, wink, gähn.";
  }

  return `Dazu habe ich keine feste Antwort aus dem Regelwerk. Schreib dem Team auf Discord: ${SITE.discord}`;
}
