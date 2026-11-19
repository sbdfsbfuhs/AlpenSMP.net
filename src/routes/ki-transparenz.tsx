import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Shell } from "@/components/site/shell";

export const Route = createFileRoute("/ki-transparenz")({
  head: () => ({
    meta: [
      { title: "KI-Transparenz · AlpenSMP" },
      {
        name: "description",
        content: "Was der Website-Assistent und der Discord-Supportbot automatisieren und welche KI-Dienste dabei eingesetzt werden.",
      },
    ],
  }),
  component: AiTransparencyPage,
});

function AiTransparencyPage() {
  return (
    <Shell>
      <PageHero
        kicker="Transparenz"
        title="KI-Transparenz"
        lede="Welche Funktionen automatisiert sind, welche KI-Dienste im Discord-Support vorkommen und wo menschliche Prüfung wichtig bleibt."
      />
      <article className="shell max-w-3xl space-y-8 py-12 text-sm leading-relaxed text-muted">
        <section className="card p-5 text-fg">
          <h2 className="text-lg font-semibold">Kurz erklärt</h2>
          <p className="mt-3">
            Die Website-AlpenKI ist ein automatischer Assistent mit fest hinterlegten Antworten. Der Discord-Supportbot nutzt für bestimmte Antworten ein Sprachmodell über die Groq-API. KI-Antworten können unvollständig oder falsch sein. Bei einer Beschwerde, einem Bann oder einem anderen wichtigen Anliegen kannst du eine Prüfung durch das Team verlangen.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">AlpenKI auf der Website</h2>
          <p className="mt-3">
            Der Chat am Maskottchen sucht lokal im Website-Code nach passenden, vorformulierten Antworten zu Server, Regeln und Befehlen. Er ruft dafür kein externes Sprachmodell auf. Die Eingaben werden durch diese Funktion nicht an Groq gesendet.
          </p>
          <p className="mt-3">
            Der Assistent ist kein Teammitglied. Wenn er deine Frage nicht beantworten kann, wende dich über{" "}
            <Link to="/kontakt" className="text-fg underline">Kontakt</Link>{" "}
            oder Discord an das Team.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">KI-Unterstützung auf Discord</h2>
          <p className="mt-3">
            Der Discord-Supportbot kann mit Groq ein Sprachmodell aufrufen, um Antworten auf Supportfragen vorzubereiten. Dafür werden der relevante Nachrichtenverlauf, Anzeigenamen und gegebenenfalls Dateinamen von Anhängen an Groq übermittelt. Die Bot-Software lädt die Anhänge nicht als Dateien zum Modell hoch. Ticketverläufe können zusätzlich für das Supportteam gespeichert werden. Einzelheiten zu Daten und Speicherfristen stehen in der{" "}
            <Link to="/datenschutz" className="text-fg underline">Datenschutzerklärung</Link>.
          </p>
          <p className="mt-3">
            Der Bot kann eine Übergabe an das Team anstossen. Über Sanktionen entscheidet das Team, nicht die KI. Teile dem Bot keine Passwörter oder unnötigen privaten Angaben mit.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Texte und Bilder</h2>
          <p className="mt-3">
            Beim Erstellen und Überarbeiten einzelner Website-Texte wurden teilweise KI-Werkzeuge als Schreibhilfe verwendet. Die Inhalte werden redaktionell geprüft und vom Betreiber verantwortet. Im Projekt ist nicht verlässlich dokumentiert, welche einzelnen Bilddateien mit KI erzeugt oder bearbeitet wurden; deshalb wird keine pauschale Herkunftsbehauptung zu allen Bildern gemacht.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Rechtlicher Hinweis</h2>
          <p className="mt-3">
            Diese Seite beschreibt die nach aktuellem Projektstand bekannten Funktionen. Sie ist keine Rechtsberatung, Zertifizierung oder Bestätigung vollständiger Konformität. Die Verordnung (EU) 2024/1689 gilt grundsätzlich ab dem 2. August 2026; ob einzelne Pflichten auf eine bestimmte Funktion anwendbar sind, hängt unter anderem von ihrer technischen Ausgestaltung und dem jeweiligen Anwendungsbereich ab.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <a className="text-fg underline" href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj" target="_blank" rel="noopener noreferrer">
                Verordnung (EU) 2024/1689 auf EUR-Lex
              </a>
            </li>
            <li>
              <a className="text-fg underline" href="https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai" target="_blank" rel="noopener noreferrer">
                Europäische Kommission: Überblick zum AI Act
              </a>
            </li>
          </ul>
        </section>
      </article>
    </Shell>
  );
}
