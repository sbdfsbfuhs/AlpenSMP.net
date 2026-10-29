import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalArticle, LegalLinks } from "@/components/site/legal";

export const Route = createFileRoute("/erstattung")({
  head: () => ({
    meta: [
      { title: "Erstattung · AlpenSMP" },
      { name: "description", content: "AlpenSMP verkauft nichts. Deshalb gibt es keine Erstattung über diese Website." },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <LegalArticle
      kicker="Recht"
      title="Erstattung"
      lede="Auf AlpenSMP gibt es nichts zu kaufen. Deshalb gibt es nichts zu erstatten."
    >
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Keine Verkäufe</h2>
        <p>Keine Ränge, keine Kits, keine Schlüssel, keine Spendenabwicklung und kein Warenkorb auf dieser Website. Der Serverzugang ist gratis.</p>
        <p>Wenn dir irgendwo Geld für AlpenSMP abgebucht wurde, kam das nicht von dieser Seite. Schreib ein <Link to="/kontakt" className="text-brand underline">Ticket</Link>, damit das Team es einordnen kann. Eine Rückzahlung durch die Website ist nicht möglich, weil keine Zahlung entgegengenommen wird.</p>
      </section>
      <LegalLinks />
    </LegalArticle>
  );
}
