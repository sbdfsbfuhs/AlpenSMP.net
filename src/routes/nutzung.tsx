import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalArticle, LegalLinks } from "@/components/site/legal";

export const Route = createFileRoute("/nutzung")({
  head: () => ({
    meta: [
      { title: "Nutzung · AlpenSMP" },
      { name: "description", content: "Bedingungen für Website und Server: Regeln gelten, Beiträge brauchen Rechte und Freigabe, es gibt keinen Kauf." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalArticle
      kicker="Recht"
      title="Nutzungsbedingungen"
      lede="Für die Website und den Spielserver. Die Spielregeln bleiben davon unberührt und gelten im Spiel weiter."
    >
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Zugang</h2>
        <p>Der Server ist gratis. Es gibt keinen Vertrag über einen Kauf, kein Abo und keinen Anspruch auf einen Platz, eine bestimmte Spielzeit oder dass eine Welt für immer stehen bleibt.</p>
        <p>
          Im Spiel gelten die <Link to="/regeln" className="text-brand underline">Regeln</Link>. Wer sie bricht, kann verwarnt, gekickt oder gebannt werden.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Beiträge</h2>
        <p>Eine Rezension oder ein Bild erscheint erst, wenn das Team sie freigibt. Bis dahin ist sie nicht öffentlich. Das Team darf ablehnen, kürzen oder später wieder wegnehmen, zum Beispiel bei Beleidigung oder wenn das Bild nicht von dir ist.</p>
        <p>Du bestätigst beim Senden, dass der Text von dir ist und du das Bild zeigen darfst. Keine erfundenen Bewertungen, keine fremden Fotos, keine Werbung.</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Was die Seite nicht verspricht</h2>
        <p>Keine Garantie auf ununterbrochene Erreichbarkeit, eine bestimmte Spielerzahl oder dass jeder Build stehen bleibt. Aussagen auf der Seite beschreiben den Server, sie sind kein Versprechen eines Unternehmens.</p>
        <p>Links zu Discord, TikTok und Modrinth führen auf andere Anbieter. Dafür gilt deren Recht, nicht dieses.</p>
      </section>
      <LegalLinks />
    </LegalArticle>
  );
}
