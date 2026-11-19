import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalArticle, LegalLinks } from "@/components/site/legal";

export const Route = createFileRoute("/nutzung")({
  head: () => ({
    meta: [
      { title: "Nutzung · AlpenSMP" },
      { name: "description", content: "Verständliche Bedingungen für den kostenlosen AlpenSMP-Server, die Website und Community-Beiträge." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalArticle
      kicker="Recht"
      title="Nutzungsbedingungen"
      lede="Diese Bedingungen gelten für Website, Minecraft-Server und eingereichte Community-Beiträge. Die Spielregeln gelten zusätzlich."
    >
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Kostenloses Angebot und Verfügbarkeit</h2>
        <p>Der Server ist kostenlos. Es gibt derzeit keine Verkäufe, kostenpflichtigen Ränge, Abonnements oder Produkte. Ein Kauf von Spielzugang wird nicht angeboten.</p>
        <p>Der Betrieb kann wegen Wartung, Sicherheitsproblemen, technischer Störungen oder fehlender Ressourcen vorübergehend unterbrochen oder beendet werden. Eine bestimmte Verfügbarkeit, Weltlaufzeit oder dauerhafte Sicherung einzelner Spielstände wird nicht zugesagt. Wenn möglich, kündigt das Team geplante Änderungen auf der Website oder im Discord an.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Verhalten und Moderation</h2>
        <p>
          Auf dem Server gelten die <Link to="/regeln" className="text-brand underline">Spielregeln</Link>. In den mit AlpenSMP verbundenen Support- und Community-Kanälen gelten mindestens dieselben Grundsätze zu Respekt und Sicherheit: keine Belästigung, Diskriminierung, Drohungen, Betrugsversuche oder Spam. Auf Discord gelten zusätzlich die Nutzungsbedingungen von Discord. Cheats, Missbrauch von Fehlern und das Umgehen von Sanktionen sind nicht erlaubt.
        </p>
        <p>
          Je nach Schwere, Wiederholung, Auswirkungen und Vorgeschichte kann das Team eine Verwarnung, einen Kick, einen temporären oder permanenten Bann oder eine andere angemessene Massnahme einsetzen. Bei akuter Gefahr oder laufendem Missbrauch kann das Team vorläufig sofort handeln. Soweit möglich, erhältst du eine verständliche Begründung.
        </p>
        <p>
          Wenn du eine Massnahme für falsch hältst, kannst du über ein{" "}
          <Link to="/kontakt" className="text-brand underline">Ticket</Link>{" "}
          mit der Kategorie „Beschwerde“ oder per E-Mail an{" "}
          <a className="text-brand underline" href="mailto:alpensmp.net@gmail.com">alpensmp.net@gmail.com</a>{" "}
          Einspruch einlegen. Nenne deinen Ingame-Namen, den ungefähren Zeitpunkt und – falls vorhanden – den Bann-Grund. Das Team prüft die Angaben erneut; wenn es organisatorisch möglich ist, soll die Prüfung nicht allein durch die Person erfolgen, die die ursprüngliche Massnahme getroffen hat. Eine Änderung der Entscheidung ist damit nicht garantiert.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Rezensionen und Spielerbilder</h2>
        <p>
          Rezensionen und Screenshots werden zunächst zur Prüfung gespeichert und erst nach deiner ausdrücklichen Freigabe öffentlich gezeigt. Die Einwilligung zur Veröffentlichung ist freiwillig und kann für die Zukunft widerrufen werden. Du kannst die Entfernung eines veröffentlichten Beitrags verlangen.
        </p>
        <p>
          Reiche nur Inhalte ein, die du einreichen und zur Veröffentlichung freigeben darfst. Zeige keine privaten Angaben und keine anderen Personen ohne deren Zustimmung. Das Team kann Beiträge ablehnen oder entfernen, wenn sie gegen Regeln verstossen, Rechte anderer verletzen oder nicht mehr veröffentlicht werden sollen. Die Bearbeitung des Beitrags für Supportzwecke ist davon getrennt.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Datenschutz und externe Angebote</h2>
        <p>
          Welche Daten im Spiel, auf der Website und im Support anfallen, steht in der{" "}
          <Link to="/datenschutz" className="text-brand underline">Datenschutzerklärung</Link>. Bitte poste keine Passwörter, Zugangsdaten oder unnötigen privaten Angaben. Links zu Discord, TikTok, Modrinth und anderen externen Diensten führen zu eigenständigen Angeboten mit deren eigenen Bedingungen und Datenschutzinformationen.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Verantwortung und Änderungen</h2>
        <p>
          Das Team bemüht sich um einen stabilen und fairen Betrieb, kann aber Ausfälle, Datenverluste oder Fehler nicht vollständig ausschliessen. Diese Bedingungen schliessen keine Haftung aus, die nach anwendbarem Recht nicht ausgeschlossen werden darf.
        </p>
        <p>Wenn sich Angebot oder Regeln wesentlich ändern, wird die aktuelle Fassung auf der Website veröffentlicht und nach Möglichkeit zusätzlich im Discord oder im Spiel angekündigt.</p>
      </section>
      <LegalLinks />
    </LegalArticle>
  );
}
