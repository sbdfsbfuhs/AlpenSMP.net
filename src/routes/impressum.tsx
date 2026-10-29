import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalArticle, LegalLinks } from "@/components/site/legal";
import { SITE } from "@/lib/alpen/site";

export const Route = createFileRoute("/impressum")({
  head: () => ({
    meta: [
      { title: "Impressum · AlpenSMP" },
      { name: "description", content: "Anbieter von AlpenSMP: privater, nicht-kommerzieller Minecraft-Server. Kontakt über Ticket oder Discord." },
    ],
  }),
  component: ImprintPage,
});

function ImprintPage() {
  return (
    <LegalArticle
      kicker="Recht"
      title="Impressum"
      lede="Privater, nicht-kommerzieller Minecraft-Server. Kein Shop, keine Ränge zum Kaufen."
    >
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Angebot</h2>
        <p>AlpenSMP, Website {SITE.ip}. Java über {SITE.ip}. Bedrock über {SITE.play}, Port {SITE.bedrockPort}.</p>
        <p>Betreiber ist eine private Person, im Spiel und auf dieser Website als SwissRed erreichbar. Es ist kein Unternehmen und keine Mehrwertsteuer ausgewiesen, weil nichts verkauft wird.</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Kontakt</h2>
        <p>
          Schriftlich über das <Link to="/kontakt" className="text-brand underline">Ticket</Link>. Für kurze Fragen der{" "}
          <a className="text-brand underline" href={SITE.discord}>Discord</a>. Eine postalische Anschrift ist hier nicht eingetragen. Sie wird nicht erfunden. Wenn eine Behörde oder eine betroffene Person eine Zustelladresse braucht, läuft das über das Ticket.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Hinweis zu Minecraft</h2>
        <p>
          Minecraft und die damit verbundenen Marken gehören Mojang / Microsoft. AlpenSMP ist kein offizieller Server und steht in keiner Verbindung zu Mojang.
          Screenshots auf der Seite stammen von Spielern und werden erst nach Freigabe gezeigt.
        </p>
      </section>
      <LegalLinks />
    </LegalArticle>
  );
}
