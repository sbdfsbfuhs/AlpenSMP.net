import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalArticle, LegalLinks } from "@/components/site/legal";
import { SITE } from "@/lib/alpen/site";

export const Route = createFileRoute("/datenschutz")({
  head: () => ({
    meta: [
      { title: "Datenschutz · AlpenSMP" },
      { name: "description", content: "Welche Daten AlpenSMP beim Einreichen speichert, warum, und wie du sie löschen lässt." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalArticle
      kicker="Recht"
      title="Datenschutzerklärung"
      lede="AlpenSMP ist ein privater, nicht-kommerzieller Minecraft-Server in der Schweiz. Es gibt keine Werbe- oder Analyseprofile und keinen Verkauf von Daten."
    >
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Wer verantwortlich ist</h2>
        <p>
          Verantwortlich ist der private Betreiber von AlpenSMP, im Spiel SwissRed. Kontakt läuft über das{" "}
          <Link to="/kontakt" className="text-brand underline">Ticket</Link> oder den{" "}
          <a className="text-brand underline" href={SITE.discord}>Discord</a>. Eine Straße steht hier nicht, weil keine zur Veröffentlichung vorliegt.
        </p>
        <p>Es gilt das schweizerische Datenschutzgesetz (DSG). Wer aus der EU spielt, kann dieselben Auskünfte über das Ticket verlangen.</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Was beim Einreichen gespeichert wird</h2>
        <p>Nur das, was für die Prüfung nötig ist. Kein Konto, keine E-Mail, kein Telefon und keine Altersabfrage.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Rezension oder Shot: Name, Text, Sternezahl, optional ein Bild, Zeitpunkt, Status der Freigabe.</li>
          <li>Ticket: Name, Thema, Nachricht, ein Code zum späteren Nachlesen.</li>
          <li>Die Einwilligung, dass der Beitrag gespeichert und nach Freigabe gezeigt werden darf.</li>
        </ul>
        <p>Ohne angehakte Einwilligung geht das Formular nicht raus. Bilder nur, wenn du bestätigst, dass du sie zeigen darfst.</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Wo die Daten liegen</h2>
        <p>
          Die Einreichungen liegen in der Firebase Realtime Database von Google, Region europe-west1. Google ist Auftragsbearbeiter für diesen Speicher.
          Interne Team-Daten können zusätzlich auf dem eigenen Server liegen. Die öffentliche Notiz zum Serverstatus und die aggregierten Spielerzahlen bleiben in Firebase, damit sie auch bei ausgeschaltetem Spielserver lesbar sind.
        </p>
        <p>Freigegebene Rezensionen und Bilder sind danach öffentlich auf dieser Website. Abgelehnte Beiträge sieht nur das Team.</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Cookies und lokale Speicherung</h2>
        <p>
          Es gibt kein Analyse-Tool und kein Werbenetz. Die Website-Schriften liegen lokal; es werden keine Google Fonts nachgeladen.
        </p>
        <p>
          Im Browser bleiben technisch nötige lokale Sperrwerte: eine Minute nach dem Absenden eines Tickets sowie Zeitpunkte für die Live-Statistik und das Aufräumen alter Messwerte. Das sind keine Werbe- oder Analyse-IDs.
          Das Team-Login setzt erst ein Token, wenn sich jemand im Personalbereich anmeldet. Öffentliche Seiten tun das nicht.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Drittanbieter und externe Inhalte</h2>
        <p>
          Die Live-Statistik fragt über den AlpenSMP-Webserver den Minecraft-Statusdienst mcsrvstat.us, die Discord-API und Firebase ab.
          Dein Browser baut dafür keine direkte Verbindung zu diesen Diensten auf; sie sehen bei diesen Abfragen die Serveradresse, nicht deine Browser-IP.
          Der Hosting-Anbieter der Website verarbeitet deine IP-Adresse technisch, um die Seite auszuliefern und zu schützen.
        </p>
        <p>
          Discord, TikTok und Modrinth sind normale Links und öffnen erst, wenn du sie anklickst. YouTube-Videos werden nicht eingebettet und Vorschaubilder nicht von YouTube geladen;
          YouTube öffnet sich erst nach einem Klick. Die Live-Karte ist kein eingebettetes Fremdframe und öffnet sich, wenn sie verfügbar ist, in einem eigenen Tab.
        </p>
        <p>Es gibt keinen Newsletter, keine Marketing-E-Mails und keine Abonnement- oder Zahlungsfunktion.</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Wie lange, und deine Rechte</h2>
        <p>Freigegebene Stimmen bleiben, solange die Seite sie zeigt. Tickets und abgelehnte Beiträge löscht das Team auf Wunsch oder wenn sie nicht mehr nötig sind.</p>
        <p>
          Du kannst Auskunft, Berichtigung und Löschung über das Ticket verlangen. Nenne dafür den Namen oder den Ticket-Code, den du behalten hast.
          Zuständige Aufsicht in der Schweiz ist der Eidgenössische Datenschutz- und Öffentlichkeitsbeauftragte.
        </p>
      </section>
      <LegalLinks />
    </LegalArticle>
  );
}
