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
      lede="Auf dieser Website werden derzeit keine kostenpflichtigen Leistungen angeboten."
    >
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Keine Verkäufe</h2>
        <p>Es gibt keine kostenpflichtigen Ränge, Abonnements, Produkte oder Zahlungsfunktion. Der Serverzugang ist kostenlos; über diese Website wird kein Geld entgegengenommen.</p>
        <p>Wenn du eine Zahlung vermutest, die mit AlpenSMP zusammenhängt, melde dich über ein <Link to="/kontakt" className="text-brand underline">Ticket</Link> oder per E-Mail an <a className="text-brand underline" href="mailto:alpensmp.net@gmail.com">alpensmp.net@gmail.com</a>. Die Website kann keine Zahlung zurückerstatten, die sie nicht entgegengenommen hat. Zwingende gesetzliche Ansprüche bleiben unberührt.</p>
      </section>
      <LegalLinks />
    </LegalArticle>
  );
}
