import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalArticle, LegalLinks } from "@/components/site/legal";
import { SITE } from "@/lib/alpen/site";

export const Route = createFileRoute("/datenschutz")({
  head: () => ({
    meta: [
      { title: "Datenschutz · AlpenSMP" },
      { name: "description", content: "Informationen zu Website, Minecraft-Server, Discord-Support, Datenverarbeitung und deinen Rechten." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalArticle
      kicker="Recht"
      title="Datenschutzerklärung"
      lede="Hier steht, welche Daten beim Besuch der Website, beim Spielen und im Support anfallen. Es gibt keine Werbung, keine Analyseprofile und keinen Verkauf von Daten."
    >
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Verantwortlicher und Rechtsrahmen</h2>
        <p>
          Verantwortlich ist der private Betreiber von AlpenSMP, im Spiel SwissRed. Kontakt läuft über das{" "}
          <Link to="/kontakt" className="text-brand underline">Ticket</Link> oder den{" "}
          <a className="text-brand underline" href={SITE.discord}>Discord</a>. Eine Postanschrift wird hier nicht veröffentlicht.
        </p>
        <p>
          Es gilt das schweizerische Datenschutzgesetz (DSG). Soweit die Datenschutz-Grundverordnung (DSGVO) anwendbar ist, insbesondere für Personen aus dem EWR, beachten wir auch deren Vorgaben und die jeweils geltenden nationalen Ergänzungen.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Rechtsgrundlagen</h2>
        <p>
          Nach Schweizer DSG erfolgt die Bearbeitung im Rahmen der gesetzlichen Voraussetzungen, insbesondere soweit sie für überwiegende private Interessen an einem sicheren und regelkonformen Betrieb erforderlich ist. Soweit die DSGVO gilt, stützen wir die Verarbeitung von Website-Zugriffs- und Serverdaten für Betrieb, Sicherheit und Moderation auf berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO). Für Website-Tickets sowie die Speicherung und Veröffentlichung von Rezensionen oder Bildern holen wir beim Absenden eine Einwilligung ein (Art. 6 Abs. 1 lit. a DSGVO). Eine Einwilligung kann für die Zukunft widerrufen werden.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Besuch der Website und technische Logs</h2>
        <p>
          Die Website wird über den US-Anbieter Vercel und dessen globales Edge-Netzwerk ausgeliefert. Für Auslieferung, Stabilität und Sicherheit können dabei technische Zugriffsdaten verarbeitet werden, etwa IP-Adresse, Zeitpunkt, angeforderte Seite, Browser-/Geräteinformationen und Referrer. Die Website verwendet kein Analytics- oder Werbetracking.
        </p>
        <p>
          Vercel betreibt ein globales Edge-Netzwerk. Die konkrete Verarbeitung und Aufbewahrung technischer Logs richtet sich nach Vercels Dienst und Einstellungen; eine eigene feste Löschfrist ist hier nicht konfiguriert.{" "}
          <a className="text-brand underline" href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noopener noreferrer">Datenschutzhinweise von Vercel</a>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Minecraft-Spielbetrieb</h2>
        <p>
          Der Minecraft-Server läuft auf Oracle Cloud Infrastructure in der Schweiz. Zur Verbindung und zum Spielbetrieb werden Minecraft-Name und UUID verarbeitet. Die Serverkonfiguration protokolliert außerdem Verbindungs-IP-Adressen. Verbindungs- und Serverlogs können Zeitpunkte, öffentliche Chat-/Befehlstexte und technische Ereignisse enthalten.
        </p>
        <p>
          Spielstände speichern je nach Welt unter anderem Position, Inventar und Fortschritt. Plugins speichern für ihre Funktionen zusätzliche Daten, zum Beispiel Claims, Teams, Spielzeit, Moderationsvorgänge und Anti-Cheat-Ereignisse. Anti-Cheat-Hinweise können an den privaten Team-Discord gesendet werden. Das Team prüft mögliche Sanktionen; das geprüfte Anti-Cheat-Setup verhängt nicht selbstständig Bans.
        </p>
        <p>
          Diese Daten dienen dem Betrieb des Servers, der Zuordnung von Spielständen, dem Schutz vor Missbrauch und Cheats sowie der Moderation und Durchsetzung der Regeln. Soweit die DSGVO gilt, ist die Verarbeitung für Sicherheit und Moderation durch berechtigte Interessen am stabilen, fairen Serverbetrieb begründet.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Website-Formulare und Firebase</h2>
        <p>Die Formulare fragen kein Konto, keine E-Mail-Adresse, keine Telefonnummer und kein Alter ab.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Rezension oder Community-Bild: Ingame-Name, Text oder Bildunterschrift, Sternezahl, optionales Bild, Zeitpunkt, Freigabestatus und Einwilligung.</li>
          <li>Website-Ticket: Minecraft-Name, Kategorie, Betreff, Nachricht, Zeitpunkt, Status, Antworten und ein geheimer Ticketcode.</li>
          <li>Öffentliche Serverstatistik: Zeitstempel und aggregierte Spielerzahlen, keine Spielernamen oder UUIDs.</li>
        </ul>
        <p>
          Rezensionen und Bilder werden erst nach Prüfung veröffentlicht. Für ihre Speicherung und Veröffentlichung ist eine Einwilligung erforderlich; du kannst sie für die Zukunft widerrufen und die Entfernung eines öffentlichen Beitrags verlangen. Bei Tickets wird die Einwilligung vor dem Absenden abgefragt.
        </p>
        <p>
          Die Einreichungen liegen in der Firebase Realtime Database von Google in der Region europe-west1 (Belgien). Google verarbeitet die Daten als Dienstleister; die Serverstatus-Notiz, aggregierte Spielerzahlen und Statistikverläufe liegen ebenfalls dort. Statistikverläufe älter als sieben Tage werden beim nächsten aktiven Statistikabruf aufgeräumt.{" "}
          <a className="text-brand underline" href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">Firebase-Datenschutz</a>{" "}
          · <a className="text-brand underline" href="https://cloud.google.com/terms/data-processing-addendum" target="_blank" rel="noopener noreferrer">Google Cloud-Datenverarbeitungsbedingungen</a>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Discord-Support und KI-Antworten</h2>
        <p>
          Wenn du den Discord-Support nutzt, verarbeitet Discord deine Accountdaten und Nachrichten nach{" "}
          <a className="text-brand underline" href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer">Discords Datenschutzhinweisen</a>. Der Support-Bot verarbeitet in Support-Tickets Discord-ID und Anzeigename, Nachrichtenverlauf, Kategorie, Antworten und Zeitpunkte. Ticket-Metadaten liegen zusätzlich in einer lokalen Bot-Datenbank auf dem Server.
        </p>
        <p>
          Für eine KI-gestützte Antwort kann der Bot den Verlauf eines Support-Tickets – einschließlich Anzeigenamen, Nachrichtentexten und gegebenenfalls Dateinamen von Anhängen – an die Groq-Cloud-API übermitteln. Die Anhänge selbst werden dabei nicht an Groq übertragen. Groq verarbeitet diese Eingaben nach den{" "}
          <a className="text-brand underline" href="https://console.groq.com/docs/legal/customer-data-processing-addendum" target="_blank" rel="noopener noreferrer">Datenverarbeitungsbedingungen von Groq</a>. KI-Antworten entscheiden nicht über Sperren; Sanktionen legt das Team fest.
        </p>
        <p>Es wurde keine allgemeine Übertragung des öffentlichen Minecraft-Chats in Discord eingerichtet. Discord-Nachrichten können durch Wortfilter automatisch entfernt werden.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Weitere Dienste und Datenübermittlungen</h2>
        <p>
          Die serverseitige Live-Statistik fragt mcsrvstat.us, die Discord-API und Firebase ab. Diese Dienste erhalten dabei die Serveradresse oder die für die Abfrage nötigen Statistikdaten, nicht deine Browser-IP. Discord, TikTok, Modrinth und YouTube öffnen sich erst, wenn du den jeweiligen Link anklickst. YouTube-Videos und Vorschaubilder werden nicht eingebettet.
        </p>
        <p>
          Vercel, Oracle Cloud, Google, Discord und Groq können Daten je nach Dienst außerhalb der Schweiz oder des EWR verarbeiten. Für Übermittlungen gelten die jeweils anwendbaren Angemessenheitsbeschlüsse und vertraglichen Schutzmaßnahmen der Anbieter. Die Anbieterinformationen sind oben verlinkt; Vercel stellt seine{" "}
          <a className="text-brand underline" href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noopener noreferrer">Datenschutzhinweise</a>{" "}
          und Oracle seine{" "}
          <a className="text-brand underline" href="https://www.oracle.com/legal/privacy/" target="_blank" rel="noopener noreferrer">Datenschutzhinweise</a>{" "}
          bereit. Eine Weitergabe zu Werbezwecken findet nicht statt.
        </p>
        <p>Es gibt keinen Newsletter, keine Marketing-E-Mails und keine Zahlungsfunktion.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Cookies und lokale Speicherung</h2>
        <p>
          Die Website-Schriften liegen lokal; es werden keine Google Fonts nachgeladen. Es gibt keine Analyse- oder Werbe-Cookies.
        </p>
        <p>
          Im Browser werden technisch nötige Zeitpunkte für Formular-Sperren, Statistikabfragen und das Aufräumen alter Messwerte lokal gespeichert. Das Team-Login setzt erst beim Anmelden im Personalbereich ein Token; öffentliche Seiten tun das nicht. Du kannst diese lokalen Werte in deinem Browser löschen.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Speicherdauer</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Spielstände, Moderations- und Plugin-Daten sowie Serverlogs haben derzeit keine feste automatische Löschfrist. Sie bleiben grundsätzlich gespeichert, solange der Server betrieben wird; eine automatische Löschung wegen Inaktivität findet nicht statt.</li>
          <li>Für Serverkonfiguration und Bot-Daten werden Backups erstellt. Für deren Löschung ist keine feste Frist eingerichtet; entfernte Daten können daher noch in vorhandenen Backups liegen.</li>
          <li>Freigegebene Rezensionen und Bilder bleiben öffentlich, bis du ihre Entfernung verlangst oder der Beitrag nicht mehr benötigt wird. Nicht freigegebene Beiträge sieht nur das Team und löscht sie, wenn sie nicht mehr benötigt werden.</li>
          <li>Der Zugriffscode eines Website-Tickets läuft nach 30 Tagen ab. Das macht den Ticketinhalt nicht automatisch unlesbar für das Team und löscht den Datensatz nicht automatisch; das Team löscht ihn, wenn er nicht mehr benötigt wird oder auf Anfrage.</li>
          <li>Für technische Website-Logs bei Vercel gilt die Aufbewahrung des Anbieters; eine eigene Frist ist nicht bekannt.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Deine Rechte</h2>
        <p>
          Du kannst Auskunft, Berichtigung und Löschung deiner Daten verlangen. Soweit anwendbar, kannst du außerdem eine Einschränkung der Verarbeitung und Datenübertragbarkeit verlangen, einer Verarbeitung auf Grundlage berechtigter Interessen widersprechen und eine erteilte Einwilligung mit Wirkung für die Zukunft widerrufen.
        </p>
        <p>
          Stelle die Anfrage über das{" "}<Link to="/kontakt" className="text-brand underline">Website-Ticket</Link>{" "}oder den{" "}
          <a className="text-brand underline" href={SITE.discord}>Discord</a>. Nenne die betroffenen Kennungen, die du kennst – zum Beispiel Minecraft-Name/UUID, Discord-Name oder Ticketcode – aber sende keine Passwörter oder Zugangsschlüssel. Beschwerden sind beim Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) oder, soweit die DSGVO gilt, bei der zuständigen Datenschutzaufsicht möglich.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Automatisierung, Minderjährige und Sicherheit</h2>
        <p>
          Es gibt keine festgelegte Altersgrenze für den Server; das Alter wird nicht abgefragt. Für Minderjährige gelten die Einwilligungsregeln ihres Wohnsitzlandes; wo erforderlich, muss eine erziehungsberechtigte Person zustimmen. Die Website trifft keine automatisierten Entscheidungen mit rechtlicher oder ähnlich erheblicher Wirkung. Wortfilter können einzelne Nachrichten entfernen, und Anti-Cheat-Systeme protokollieren Auffälligkeiten oder melden sie dem Team. Über Sanktionen entscheidet das Team.
        </p>
        <p>
          Zugriffe auf interne Team- und Supportdaten sind beschränkt. Verbindungen zu den genannten Webdiensten erfolgen verschlüsselt, soweit der jeweilige Dienst dies unterstützt. Absolute Sicherheit kann bei einer Datenübertragung oder Speicherung im Internet nicht garantiert werden.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Änderungen</h2>
        <p>
          Diese Erklärung wird angepasst, wenn sich Datenverarbeitung oder Dienste ändern. Die aktuelle Fassung steht immer auf dieser Website. Über wesentliche Änderungen informieren wir nach Möglichkeit zusätzlich über Discord oder im Spiel.
        </p>
      </section>
      <p className="text-xs text-faint">Stand: 15. November 2026</p>
      <LegalLinks />
    </LegalArticle>
  );
}
