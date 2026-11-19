import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalArticle, LegalLinks } from "@/components/site/legal";
import { SITE } from "@/lib/alpen/site";

const CONTACT_EMAIL = "alpensmp.net@gmail.com";

export const Route = createFileRoute("/impressum")({
  head: () => ({
    meta: [
      { title: "Impressum · AlpenSMP" },
      { name: "description", content: "Informationen zum privaten AlpenSMP-Angebot und Kontakt per E-Mail." },
    ],
  }),
  component: ImprintPage,
});

function ImprintPage() {
  return (
    <LegalArticle
      kicker="Recht"
      title="Impressum"
      lede="Privat betrieben und kostenlos. Es gibt keine Verkäufe oder kostenpflichtigen Ränge."
    >
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Angebot und Betreiber</h2>
        <p>AlpenSMP ist ein privater, nicht-kommerzieller Minecraft-Server mit Website {SITE.ip}. Java: {SITE.ip}. Bedrock: {SITE.play}, Port {SITE.bedrockPort}.</p>
        <p>Der Betreiber ist eine private Person und online unter dem Namen SwissRed erreichbar. AlpenSMP ist kein Unternehmen. Eine private Wohnanschrift wird aus Schutzgründen nicht auf der Website veröffentlicht.</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Kontakt</h2>
        <p>
          Für Fragen, Beschwerden und Datenschutzanliegen:{" "}
          <a className="text-brand underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          Alternativ kannst du ein <Link to="/kontakt" className="text-brand underline">Website-Ticket</Link> senden oder den{" "}
          <a className="text-brand underline" href={SITE.discord}>Discord</a> nutzen.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Hinweis zu Minecraft</h2>
        <p>
          Minecraft und die dazugehörigen Marken und Inhalte gehören ihren jeweiligen Rechteinhabern, darunter Mojang AB und Microsoft. AlpenSMP ist kein offizieller Minecraft-Server und steht in keiner Verbindung zu Mojang oder Microsoft.
          Spielerbilder werden nur nach Prüfung und mit Freigabe veröffentlicht. Weitere Informationen zu den Marken stellt{" "}
          <a className="text-brand underline" href="https://www.minecraft.net/en-us/usage-guidelines" target="_blank" rel="noopener noreferrer">Minecraft</a>{" "}
          bereit.
        </p>
      </section>
      <LegalLinks />
    </LegalArticle>
  );
}
