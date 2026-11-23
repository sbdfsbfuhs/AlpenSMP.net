import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalArticle, LegalLinks } from "@/components/site/legal";
import { SITE } from "@/lib/alpen/site";

const CONTACT_EMAIL = "alpensmp.net@gmail.com";

export const Route = createFileRoute("/impressum")({
  head: () => ({
    meta: [
      { title: "Impressum · AlpenSMP" },
      {
        name: "description",
        content: "Informationen zum privaten AlpenSMP-Angebot und Kontakt per E-Mail.",
      },
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
        <p>
          AlpenSMP ist ein privater, nicht-kommerzieller Minecraft-Server mit Website {SITE.ip}.
          Java: {SITE.ip}. Bedrock: {SITE.play}, Port {SITE.bedrockPort}.
        </p>
        <p>
          Der Betreiber ist eine private Person und online unter dem Namen SwissRed erreichbar.
          AlpenSMP ist kein Unternehmen. Eine private Wohnanschrift wird aus Schutzgründen nicht auf
          der Website veröffentlicht.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Kontakt</h2>
        <p>
          Für Fragen, Beschwerden und Datenschutzanliegen:{" "}
          <a className="text-brand underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          . Alternativ kannst du ein{" "}
          <Link to="/kontakt" className="text-brand underline">
            Website-Ticket
          </Link>{" "}
          senden oder den{" "}
          <a className="text-brand underline" href={SITE.discord}>
            Discord
          </a>{" "}
          nutzen.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Angaben und rechtliche Einordnung</h2>
        <p>
          <strong className="text-fg">Pflicht, falls anwendbar:</strong> § 5 DDG verlangt für
          geschäftsmässige, in der Regel gegen Entgelt angebotene digitale Dienste unter anderem den
          Namen und die Anschrift des Diensteanbieters sowie eine erreichbare E-Mail-Adresse. Ob
          diese Voraussetzungen bei diesem privaten, kostenlosen Angebot erfüllt sind, ist nicht
          abschliessend rechtlich beurteilt. Diese Seite behauptet deshalb nicht, dass die
          E-Mail-Adresse allein in jedem Fall genügt.
        </p>
        <p>
          <strong className="text-fg">Empfohlen und vorhanden:</strong> Eine direkte
          Kontaktmöglichkeit per E-Mail und ein zusätzliches Website-Ticket.{" "}
          <strong className="text-fg">Freiwillig:</strong> Die technischen Serveradressen und der
          Hinweis, dass AlpenSMP nicht mit Mojang oder Microsoft verbunden ist.
        </p>
        <p>
          <strong className="text-fg">Nach den mitgeteilten Angaben nicht einschlägig:</strong>{" "}
          Firmenname, Rechtsform und Handelsregisterangaben, da AlpenSMP privat und ohne Unternehmen
          betrieben wird. Das sagt nichts darüber aus, ob andere Informationspflichten greifen.
        </p>
        <p>
          <strong className="text-fg">Unklar und zu prüfen:</strong> Ob deutsche
          Informationspflichten auf dieses kostenlose Angebot anwendbar sind und welche Pflichten
          sich für den konkreten Fall aus Schweizer Recht, insbesondere dem UWG, ergeben. Es wird
          weder pauschal behauptet, jede private Website müsse eine Wohnadresse nennen, noch dass
          eine solche Angabe sicher entbehrlich sei. Eine private Wohnanschrift, ein Wohnort und
          weitere private Kontaktdaten werden hier nicht veröffentlicht. Die konkrete Lage sollte
          mit einer erwachsenen Vertrauensperson oder einer Rechtsberatung geklärt werden.
        </p>
        <p className="text-xs text-faint">
          Quellen:{" "}
          <a
            className="text-brand underline"
            href="https://www.gesetze-im-internet.de/ddg/__5.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            DDG § 5
          </a>{" "}
          ·{" "}
          <a
            className="text-brand underline"
            href="https://www.fedlex.admin.ch/eli/cc/1988/223_223_223/de"
            target="_blank"
            rel="noopener noreferrer"
          >
            Schweizer UWG (Fedlex)
          </a>
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Hinweis zu Minecraft</h2>
        <p>
          Minecraft und die dazugehörigen Marken und Inhalte gehören ihren jeweiligen
          Rechteinhabern, darunter Mojang AB und Microsoft. AlpenSMP ist kein offizieller
          Minecraft-Server und steht in keiner Verbindung zu Mojang oder Microsoft. Spielerbilder
          werden nur nach Prüfung und mit Freigabe veröffentlicht. Weitere Informationen zu den
          Marken stellt{" "}
          <a
            className="text-brand underline"
            href="https://www.minecraft.net/en-us/usage-guidelines"
            target="_blank"
            rel="noopener noreferrer"
          >
            Minecraft
          </a>{" "}
          bereit.
        </p>
      </section>
      <LegalLinks />
    </LegalArticle>
  );
}
