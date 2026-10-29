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
      lede="AlpenSMP ist ein privater, nicht-kommerzieller Minecraft-Server in der Schweiz. Es gibt kein Tracking und keinen Verkauf von Daten."
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
        <p>Nur das, was für die Prüfung nötig ist. Kein Konto, keine E-Mail, kein Telefon.</p>
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
          Interne Team-Daten können zusätzlich auf dem eigenen Server liegen. Die öffentliche Notiz zum Serverstatus bleibt in Firebase, damit sie auch bei ausgeschaltetem Spielserver lesbar ist.
        </p>
        <p>Freigegebene Rezensionen und Bilder sind danach öffentlich auf dieser Website. Abgelehnte Beiträge sieht nur das Team.</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Cookies und lokale Speicherung</h2>
        <p>
          Es gibt kein Analyse-Tool, kein Werbenetz und kein Google-Font-Abruf. Deshalb gibt es keinen Cookie-Banner. Ein Banner wäre hier nur Dekoration.
        </p>
        <p>
          Im Browser bleibt technisch nötig: eine Minute Sperre nach dem Absenden, damit niemand das Formular flutet, und die Darstellung der Seite.
          Das Team-Login setzt erst ein Token, wenn sich jemand im Personalbereich anmeldet. Öffentliche Seiten tun das nicht.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Schriften, Einbettungen, Karte</h2>
        <p>Die Schriften liegen auf diesem Server, nicht bei Google. Discord, TikTok und Modrinth sind normale Links und öffnen erst, wenn du sie anklickst.</p>
        <p>Die Live-Karte ist kein eingebettetes Fremdframe. Sie öffnet sich, wenn sie verfügbar ist, in einem eigenen Tab auf dem Kartenserver.</p>
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
