import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalArticle, LegalLinks } from "@/components/site/legal";
import { SITE } from "@/lib/alpen/site";

const CONTACT_EMAIL = "alpensmp.net@gmail.com";
const PANEL_API_HOST = new URL(SITE.securityApi).host;

export const Route = createFileRoute("/datenschutz")({
  head: () => ({
    meta: [
      { title: "Datenschutz · AlpenSMP" },
      {
        name: "description",
        content:
          "Informationen zu Website, Minecraft-Server, Discord-Support, Datenverarbeitung und deinen Rechten.",
      },
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
        <h2 className="text-xl font-semibold text-fg">Verantwortlicher und Kontakt</h2>
        <p>
          Verantwortlich ist der private Betreiber von AlpenSMP, online unter dem Namen SwissRed.
          Für Datenschutzanfragen und die Ausübung deiner Rechte erreichst du ihn unter{" "}
          <a className="text-brand underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          . Du kannst auch ein{" "}
          <Link to="/kontakt" className="text-brand underline">
            Website-Ticket
          </Link>{" "}
          senden. Eine private Wohnanschrift wird nicht veröffentlicht.
        </p>
        <p>
          Für die Bearbeitung gelten das schweizerische Datenschutzgesetz (DSG) und – soweit dessen
          räumlicher Anwendungsbereich erfüllt ist – die Datenschutz-Grundverordnung (DSGVO). Ein
          bloss möglicher Zugriff aus der EU macht die DSGVO nicht automatisch anwendbar. Sie kann
          insbesondere gelten, wenn das Angebot gezielt Personen in der EU anspricht oder ihr
          Verhalten dort beobachtet; ob das bei AlpenSMP der Fall ist, muss anhand des tatsächlichen
          Angebots beurteilt werden. Dass der Zugang kostenlos ist, schliesst die DSGVO nicht
          automatisch aus.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Rechtsgrundlagen und Grundsätze</h2>
        <p>
          Daten werden für den Betrieb des kostenlosen Angebots, die Beantwortung angefragter
          Unterstützung, die Sicherheit und die Moderation bearbeitet. Die Grundsätze des Schweizer
          DSG sind einzuhalten; die Rechtsgrundlagen der DSGVO werden nicht automatisch auf das
          Schweizer Recht übertragen. Soweit die DSGVO gilt, stützen wir notwendige Betriebs-,
          Sicherheits- und Supportbearbeitungen grundsätzlich auf berechtigte Interessen (Art. 6
          Abs. 1 lit. f DSGVO). Die öffentliche Anzeige einer Rezension und eines Spielerbilds wird
          getrennt und freiwillig freigegeben; eine Bildfreigabe ersetzt weder die Rechte am Bild
          noch die Zustimmung abgebildeter Personen.
        </p>
        <p>
          Das Absenden eines Supporttickets ist nicht von einer Datenschutz-Einwilligung abhängig.
          Bitte übermittle nur Angaben, die für dein Anliegen nötig sind, und keine Passwörter oder
          Zugangsdaten.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Website-Aufruf und technische Logs</h2>
        <p>
          Die Website wird über Vercel und dessen globales Netzwerk ausgeliefert. Dabei können
          technische Zugriffsdaten wie IP-Adresse, Zeitpunkt, angeforderte Seite,
          Browser-/Geräteinformationen, Referrer und Fehlerstatus verarbeitet werden, um die Seite
          auszuliefern, Störungen zu beheben und Missbrauch abzuwehren. Es wird kein Analytics- oder
          Werbetracking eingesetzt.
        </p>
        <p>
          Die konkrete Aufbewahrungsdauer und die betroffenen Verarbeitungsorte der Vercel-Logs sind
          aus dem Website-Repository nicht ersichtlich. Sie hängen auch von den tatsächlich
          verwendeten Vercel-Einstellungen ab; eine feste Frist wird deshalb nicht behauptet.{" "}
          <a
            className="text-brand underline"
            href="https://vercel.com/legal/privacy-notice"
            target="_blank"
            rel="noopener noreferrer"
          >
            Datenschutzhinweise von Vercel
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Minecraft-Spielbetrieb</h2>
        <p>
          Die geprüfte Oracle-Cloud-Instanz meldet die Region{" "}
          <span className="font-mono text-fg">eu-frankfurt-1</span> (Frankfurt, Deutschland). Auf
          derselben Instanz laufen der Minecraft-Server, die AlpenSMP-Sicherheits-API und der
          Discord-Bot; der Karten- und Panelzugriff wird dort ebenfalls weitergeleitet. Beim
          Verbinden fallen Minecraft-Name, UUID, Verbindungs-IP sowie Login- und Logout-Zeitpunkte
          an. Serverlogs können ausserdem öffentliche Chat- und Befehlstexte sowie technische
          Ereignisse enthalten.
        </p>
        <p>
          Für Spielstände und Plugins werden je nach Funktion Positionen, Inventar, Fortschritt,
          Claims, Teams, Spielzeit, Moderations- und Banninformationen sowie Anti-Cheat-Hinweise
          gespeichert. Sie dienen dem Spielbetrieb, der Zuordnung von Spielständen, der Sicherheit
          und der Durchsetzung der Regeln. Hinweise aus Anti-Cheat-Systemen werden vom Team
          beurteilt; über Sanktionen entscheidet nicht allein ein automatisches System.
        </p>
        <p>
          Minecraft-Logs werden in komprimierte Rotationsdateien aufgeteilt; eine feste automatische
          Löschung nach einer bestimmten Zahl von Tagen ist in der geprüften Konfiguration nicht
          belegt. In den geprüften Server- und Plugin-Konfigurationen ist keine automatische
          Löschung von Welt-, Statistik- und Plugin-Daten nach Inaktivität belegt. Löschanfragen
          werden manuell geprüft; Daten, die für eine gemeinsam genutzte Welt oder eine konkrete
          Sicherheitsmassnahme erforderlich sind, können nicht immer einzeln entfernt werden.
        </p>
        <p>
          In der geprüften DriveBackupV2-Konfiguration ist Google Drive aktiviert, während geplante
          Backups deaktiviert sind. Der konfigurierte Aufbewahrungswert beträgt 20 Backups; lokale
          Kopien sind mit einem Aufbewahrungswert von 0 konfiguriert. Das ist eine Begrenzung nach
          Anzahl, keine feste Frist in Tagen. Ob und wann manuelle Backups tatsächlich erstellt
          werden, der Speicherort des Google-Drive-Kontos und zusätzliche Oracle-Cloud-Snapshots
          sind nicht bestätigt.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">
          Website-Tickets, Rezensionen und Spielerbilder
        </h2>
        <p>
          Die öffentlichen Formulare fragen keine E-Mail-Adresse, Telefonnummer oder Altersangabe
          ab. Ein Website-Ticket enthält Minecraft-Name, Kategorie, Betreff, Nachricht, Zeitpunkt,
          Bearbeitungsstatus und Antworten. Der Ticketcode dient als geheimer Zugangslink.
          Rezensionen und Spielerbilder enthalten den eingereichten Ingame-Namen, Text
          beziehungsweise Bildunterschrift, Sternezahl, Bild und Zeitpunkt. Die Bestätigung zur
          internen Prüfung ist von der freiwilligen Veröffentlichung getrennt. Für Rezensionstext
          und Spielerbild gibt es eigene Veröffentlichungsfreigaben; bei Bildern wird zusätzlich
          bestätigt, dass die nötigen Rechte und Zustimmungen vorliegen.
        </p>
        <p>
          Zur Missbrauchsabwehr verarbeitet die Sicherheits-API die Verbindungs-IP vorübergehend in
          einem flüchtigen Rate-Limit-Speicher. Die Einträge laufen nach höchstens 15 Minuten für
          Supportanfragen/Tickets beziehungsweise einer Stunde für Rezensionen/Bilder ab; sie werden
          dafür nicht in der SQLite-Datenbank gespeichert.
        </p>
        <p>
          Diese Formulardaten werden vom Browser an die AlpenSMP-Sicherheits-API unter{" "}
          <span className="font-mono text-fg">{PANEL_API_HOST}</span> gesendet und dort in einer
          SQLite-Datenbank auf einem Ubuntu-Server gespeichert. Sie werden nicht über den
          Website-Code in die Firebase Realtime Database geschrieben. Supportanfragen, Tickets,
          Rezensionen und Spielerbilder werden ab einem Alter von 365 Tagen beim nächsten täglichen
          Bereinigungslauf aus der aktiven Datenbank gelöscht. Die Bereinigung läuft beim Start der
          API und danach täglich. Für öffentliche Formulare gelten zusätzlich serverseitige
          Anfragelimits.
        </p>
        <p>
          Ein Ticketcode ist nach 30 Tagen für öffentliche Abfragen ungültig; der gespeicherte
          Ticketinhalt wird dadurch nicht sofort gelöscht, sondern nach der genannten Jahresfrist.
          Zeitgestempelte SQLite-Datenbank-Backups werden ab einem Alter von 365 Tagen beim nächsten
          täglichen Bereinigungslauf entfernt. Ein bereits gelöschter Datensatz kann dadurch noch
          bis zu einem weiteren Jahr in einem Backup enthalten sein. Ob zusätzliche Infrastruktur-
          oder Cloud-Snapshots bestehen und wie lange sie aufbewahrt werden, ist nicht bestätigt.
          Nicht freigegebene Beiträge bleiben intern und werden nicht veröffentlicht. Öffentliche
          Rezensionen und Bilder werden vor einer Freigabe vom Team geprüft. Du kannst eine
          Einwilligung für die Zukunft widerrufen oder die Entfernung verlangen; für eine frühere
          Löschung aus der internen Warteschlange kannst du dich ebenfalls an die unten genannte
          E-Mail wenden.
        </p>
        <p>
          Hochgeladene PNG-, JPG- und WebP-Bilder werden im Browser vor dem Versand in ein JPEG mit
          höchstens 1600 Pixeln Kantenlänge umgerechnet und komprimiert. Die Datei wird nicht
          unverändert übertragen. Lade keine privaten Angaben und keine Bilder anderer Personen ohne
          deren Zustimmung hoch.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Firebase und öffentliche Serverstatistik</h2>
        <p>
          Die Firebase-Realtime-Database-URL weist auf die Region{" "}
          <span className="font-mono text-fg">europe-west1</span> (Belgien) hin. Sie enthält den
          öffentlichen Serverstatus und aggregierte Gesamtzahlen. Der zeitliche Verlauf der
          gleichzeitig online befindlichen Spieler wird durch die Sicherheits-API aus der
          öffentlichen Serverstatus-Abfrage erstellt und in ihrer SQLite-Datenbank gespeichert.
          Dafür werden ungefähr alle 15 Minuten nur Zeitstempel und Spielerzahl gespeichert, keine
          Minecraft-Namen oder UUIDs. Verlaufseinträge älter als sieben Tage werden beim API-Start
          und danach täglich bereinigt. Diese Regionangabe bezieht sich auf die Realtime Database;
          der Verarbeitungsort von Firebase Authentication ist nicht aus der Projektkonfiguration
          ersichtlich.{" "}
          <a
            className="text-brand underline"
            href="https://firebase.google.com/support/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Firebase-Datenschutz
          </a>{" "}
          ·{" "}
          <a
            className="text-brand underline"
            href="https://cloud.google.com/terms/data-processing-addendum"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Cloud-Datenverarbeitungsbedingungen
          </a>
          .
        </p>
        <p>
          Für den geschützten Team-Bereich wird Firebase Authentication verwendet. Dabei werden
          Teamkonto-Kennung, E-Mail-Adresse und Authentifizierungsdaten bearbeitet. Im Browser
          werden erforderliche Anmeldedaten im Sitzungsspeicher gehalten. Der separate Login über
          einen Grok-Auth-Broker ist laut Betreiberangabe in der Live-Umgebung nicht aktiv.
        </p>
        <p>
          Nach ausdrücklicher aktueller Einwilligung werden Staff-Aktivitätswerte getrennt für
          Website und Minecraft erfasst. Website-Zeit wird nur bei sichtbarem Staff-Center und
          kürzlicher Eingabe über begrenzte Zeitintervalle aggregiert; Eingabetexte werden dafür
          nicht gespeichert. Die optionale Minecraft-Erfassung misst die Server-Verbindungszeit
          der zugeordneten Staff-Konten einschliesslich verbundener AFK-Zeit, nicht einzelne
          Spielaktionen. Die Website-Werte
          liegen in der lokalen Sicherheits-API-Datenbank; Minecraft-Werte in einer lokalen
          Plugin-Datei auf der geprüften Serverinstanz. Tageswerte werden 30 Tage und anschliessend
          Wochenwerte bis höchstens 365 Tage gespeichert. Die Erfassung beginnt erst nach
          Aktivierung und Einwilligung; rückwirkende Werte werden nicht erstellt. Die aktuelle
          Zustimmungs-Zuordnung für Minecraft wird beim Abruf der Owner-Statistik synchronisiert;
          ein Pausieren wird deshalb bei der nächsten Owner-Synchronisierung wirksam. Beim
          Selbst-Widerruf entfernt die Sicherheits-API die Minecraft-Zuordnung und Website-Historie;
          das Plugin übernimmt die Änderung spätestens bei seiner nächsten Prüfung. Fragen kannst
          du an die Kontakt-E-Mail richten.
        </p>
        <p>
          Eine optionale TOTP-Zwei-Faktor-Anmeldung kann in Firebase Authentication eingerichtet
          werden, sofern die dafür nötige Identity-Platform-Konfiguration aktiviert ist. Der
          Authenticator-Schlüssel wird bei der Einrichtung angezeigt und muss in deiner
          Authenticator-App gesichert werden; er wird von Firebase für die Anmeldung verwaltet.
          Ohne eingerichteten Wiederherstellungsweg kann der Verlust des Geräts den Zugang
          erschweren.
        </p>
        <p>
          Der Quellcode enthält zusätzlich Unterstützung für PostgreSQL (Neon) für diesen nicht
          aktiven Login-Pfad. Diese Datenbank wird laut Betreiberangabe in der Live-Umgebung nicht
          verwendet.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Discord-Support und KI-Antworten</h2>
        <p>
          Bei Discord-Support verarbeitet Discord deine Accountdaten und Nachrichten nach{" "}
          <a
            className="text-brand underline"
            href="https://discord.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Discords Datenschutzhinweisen
          </a>
          . Der Bot verarbeitet für Supporttickets Discord-ID und Anzeigename, Nachrichtenverlauf,
          Kategorie, Antworten, Zeitpunkte und interne Notizen. Geschlossene Ticketkanäle sowie die
          zugehörigen Ticket- und Notizdatensätze in der aktiven SQLite-Datenbank werden nach zehn
          Tagen automatisch gelöscht. Eine beim Schliessen erstellte Transkriptdatei mit
          Nachrichten, Namen/IDs, Zeitpunkten und Anhang-URLs wird zusätzlich in einen
          Team-Discord-Kanal gesendet; der Bot löscht diese Kopie nicht automatisch. Lokale
          Bot-Backups enthalten teilweise die SQLite-Datenbank. Für diese Kopien sowie Feedback-,
          Statistik- und Ticket-Sperrdaten ist im Bot-Code keine automatische Löschfrist belegt.
        </p>
        <p>
          Für automatische Antworten liest der Bot den Verlauf des Ticketkanals und übermittelt
          Nachrichten der betroffenen Person und des Teams, Bot-Antworten, Anzeigenamen sowie
          gegebenenfalls Dateinamen von Anhängen an die Groq-Cloud-API. Die angehängten Dateien
          selbst werden nicht als Dateien hochgeladen. Eine auf Team-Anfrage erstellte
          KI-Zusammenfassung kann bis zu 50 Nachrichten mit Namen und Text enthalten. Der Bot-Host
          steht auf derselben geprüften Oracle-Cloud-Instanz in Frankfurt; die Verarbeitungsregionen
          von Discord und Groq sowie eine zusätzliche Löschfrist bei diesen Anbietern sind nicht aus
          der Bot-Konfiguration ersichtlich. Groq verarbeitet die Anfrage nach seinen{" "}
          <a
            className="text-brand underline"
            href="https://console.groq.com/docs/legal/customer-data-processing-addendum"
            target="_blank"
            rel="noopener noreferrer"
          >
            Datenverarbeitungsbedingungen
          </a>
          . Die Website-AlpenKI ist davon getrennt: Sie verwendet fest hinterlegte Antworten und
          sendet Chatfragen nicht an ein Sprachmodell. KI-Antworten können falsch sein; für eine
          Prüfung durch das Team kannst du eine Übergabe verlangen.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Karte und weitere externe Dienste</h2>
        <p>
          Die BlueMap unter{" "}
          <a
            className="text-brand underline"
            href={SITE.map}
            target="_blank"
            rel="noopener noreferrer"
          >
            map.alpensmp.net
          </a>{" "}
          wird direkt im Browser geladen und auf die geprüfte Oracle-Cloud-Instanz in Frankfurt
          weitergeleitet. Beim Öffnen der Karte erhält der Kartenserver technische Verbindungsdaten
          wie deine IP-Adresse, Zeitpunkt und angeforderte Karteninhalte.
        </p>
        <p>
          Serverstatus und Discord-Mitgliederzahlen werden serverseitig bei mcsrvstat.us
          beziehungsweise der Discord-API abgerufen. Dabei werden die Serveradresse beziehungsweise
          der Discord-Einladungscode übermittelt. Die Besucher-IP wird nicht direkt weitergereicht;
          die externe API sieht jedoch die ausgehende Verbindung der Vercel-Funktion. Links zu
          Discord, TikTok, Modrinth und YouTube öffnen externe Seiten erst nach dem Anklicken.
          YouTube-Videos werden nicht eingebettet.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Speicherung im Browser und Cookies</h2>
        <p>
          Es gibt keine Werbe- oder Analyse-Cookies. Die Website verwendet einzelne Werte in
          localStorage und sessionStorage, etwa für Formular-Wartezeiten, Anzeigeeinstellungen, den
          Team-Login und die aktuelle Sitzung. Diese Werte dienen nicht dem Tracking. Ob jede
          optionale, länger gespeicherte Anzeigeeinstellung in Deutschland unter die Ausnahme für
          unbedingt erforderliche Speicherungen nach § 25 TDDDG fällt, ist nicht abschliessend
          geprüft; eine pauschale Aussage, dass dafür nie eine Einwilligung nötig ist, wird nicht
          gemacht.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">
          Empfänger und mögliche Datenübermittlungen
        </h2>
        <p>
          Je nach Funktion erhalten Vercel, Google Firebase/Authentication, die Sicherheits-API
          unter {PANEL_API_HOST}, Oracle Cloud, Google Drive, Discord, Groq und mcsrvstat.us die
          oben beschriebenen Daten. Für den geprüften Oracle-Host ist Frankfurt bestätigt; für
          Firebase Realtime Database weist die URL auf Belgien hin. Die Verarbeitungsorte von
          Vercel, Firebase Authentication, Discord, Groq sowie dem Google-Drive-Konto und die
          jeweiligen Unterauftragsbearbeiter sind nicht vollständig bestätigt. Anbieter können Daten
          auch ausserhalb der Schweiz oder des EWR bearbeiten. Es wird deshalb keine bestimmte
          Angemessenheitsentscheidung oder Standardvertragsklausel für alle Anbieter behauptet. Die
          jeweiligen Anbieterinformationen sind verlinkt; bei Fragen kannst du den Betreiber
          kontaktieren.
        </p>
        <p>
          Wenn du die Kontakt-E-Mail verwendest, werden deine Absenderadresse und der
          Nachrichteninhalt von deinem E-Mail-Anbieter sowie beim Empfang durch Gmail/Google
          bearbeitet.{" "}
          <a
            className="text-brand underline"
            href="https://policies.google.com/privacy?hl=de"
            target="_blank"
            rel="noopener noreferrer"
          >
            Datenschutzhinweise von Google
          </a>
          .
        </p>
        <p>Es gibt keinen Newsletter, keine Marketing-E-Mails und keine Zahlungsfunktion.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Deine Rechte</h2>
        <p>
          Du kannst im Rahmen des jeweils anwendbaren Rechts Auskunft, Berichtigung und Löschung
          verlangen. Soweit vorgesehen, kannst du auch eine Einschränkung der Bearbeitung oder
          Datenübertragbarkeit verlangen, einer auf berechtigte Interessen gestützten Bearbeitung
          widersprechen und eine erteilte Einwilligung mit Wirkung für die Zukunft widerrufen. Du
          kannst dich ausserdem bei der zuständigen Datenschutzaufsicht beschweren.
        </p>
        <p>
          Schreibe an{" "}
          <a className="text-brand underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>{" "}
          oder nutze das{" "}
          <Link to="/kontakt" className="text-brand underline">
            Website-Ticket
          </Link>
          . Nenne nur die Kennungen, die zur Zuordnung nötig sind, etwa Minecraft-Name/UUID,
          Discord-Name oder Ticketcode. Sende keine Passwörter. In der Schweiz ist der
          Eidgenössische Datenschutz- und Öffentlichkeitsbeauftragte (EDÖB) zuständig; soweit die
          DSGVO gilt, kannst du dich an eine zuständige Datenschutzaufsichtsbehörde wenden.
        </p>
        <p>
          Lösch- und Widerrufsanfragen werden manuell geprüft. Daten werden aus den aktiven Systemen
          entfernt, soweit dies technisch möglich und mit dem Betrieb einer gemeinsam genutzten Welt
          sowie notwendigen Sicherheitsmassnahmen vereinbar ist. Backups und
          Discord-Transkriptkopien können davon abweichende Fristen haben; wenn eine Kopie nicht
          sofort entfernt werden kann, wird dies bei der Antwort erläutert.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">
          Minderjährige, Automatisierung und Sicherheit
        </h2>
        <p>
          Es gibt keine feste Altersgrenze für den Server; das Alter wird nicht abgefragt. Für
          Minderjährige gelten je nach Wohnsitz und Verarbeitung unterschiedliche Regeln.
          Insbesondere die besondere Regel in Art. 8 DSGVO betrifft nur bestimmte
          einwilligungsbasierte Angebote der Informationsgesellschaft an Kinder; sie ist keine
          pauschale Zustimmungspflicht für jede Bearbeitung. Die konkrete Anwendbarkeit und
          Einwilligungsfähigkeit sollte eine erwachsene Vertrauensperson oder eine Rechtsberatung
          prüfen.
        </p>
        <p>
          Es werden keine automatisierten Einzelentscheidungen mit rechtlicher oder ähnlich
          erheblicher Wirkung getroffen. Wortfilter können Nachrichten entfernen und
          Anti-Cheat-Systeme Auffälligkeiten melden; das Team beurteilt Sanktionen. Das
          Website-Frontend verlangt für interne Bereiche eine Anmeldung und Rollen. Die tatsächlich
          eingesetzten Firebase-Produktionsregeln und die Live-Konfiguration der Sicherheits-API
          konnten nicht unabhängig abgerufen werden. Datenübertragungen erfolgen, soweit der
          jeweilige Dienst dies unterstützt, verschlüsselt; absolute Sicherheit kann nicht
          garantiert werden.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Offizielle Rechtsquellen</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <a
              className="text-brand underline"
              href="https://www.fedlex.admin.ch/eli/cc/2022/491/de"
              target="_blank"
              rel="noopener noreferrer"
            >
              Schweizer Datenschutzgesetz (Fedlex)
            </a>
          </li>
          <li>
            <a
              className="text-brand underline"
              href="https://www.edoeb.admin.ch/de/datenschutzerklaerungen-im-internet"
              target="_blank"
              rel="noopener noreferrer"
            >
              EDÖB: Datenschutzerklärungen im Internet
            </a>
          </li>
          <li>
            <a
              className="text-brand underline"
              href="https://eur-lex.europa.eu/eli/reg/2016/679/oj"
              target="_blank"
              rel="noopener noreferrer"
            >
              Datenschutz-Grundverordnung (EUR-Lex)
            </a>
          </li>
          <li>
            <a
              className="text-brand underline"
              href="https://www.gesetze-im-internet.de/ddg/__5.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              DDG § 5 – Informationspflichten (Gesetze-im-Internet)
            </a>
          </li>
          <li>
            <a
              className="text-brand underline"
              href="https://www.gesetze-im-internet.de/ttdsg/__25.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              TDDDG § 25 – Endeinrichtungen (Gesetze-im-Internet)
            </a>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">
          Änderungen und noch zu bestätigende Angaben
        </h2>
        <p>
          Die Website-Tickets und Community-Einreichungen werden nach der oben genannten Jahresfrist
          bereinigt. Noch zu bestätigen sind insbesondere die Vercel-Logaufbewahrung, die
          Firebase-Produktionsregeln und Authentifizierungsregion, die Löschfristen für
          Discord-Transkripte und Bot-Backups, die Zeitspanne zwischen den Minecraft-Backups sowie
          allfällige Oracle-Cloud-Snapshots. Für Minecraft-Logs besteht derzeit keine belegte feste
          Tagesfrist. Diese Erklärung wird angepasst, wenn sich die tatsächliche Datenbearbeitung
          ändert.
        </p>
        <p className="text-xs text-faint">Stand: 19. November 2026</p>
      </section>
      <LegalLinks />
    </LegalArticle>
  );
}
