import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Shell } from "@/components/site/shell";

// Freiwillige Transparenzseite. Keine Rechtsbescheinigung.
// Sichtbare Chat-Kennzeichnung sitzt in assistant.tsx, weil AlpenKI als Assistent auftritt.
export const Route = createFileRoute("/ki-transparenz")({
  head: () => ({
    meta: [
      { title: "KI-Transparenz · AlpenSMP" },
      {
        name: "description",
        content:
          "Freiwilliger Hinweis, wo auf alpensmp.net KI-Werkzeuge beim Bau genutzt wurden und dass AlpenKI kein Mensch ist.",
      },
    ],
  }),
  component: AiTransparencyPage,
});

function AiTransparencyPage() {
  return (
    <Shell>
      <PageHero
        kicker="Freiwillige Transparenz"
        title="KI-Transparenz"
        lede="Was auf dieser Website automatisiert ist, und was nicht. Das ist kein Nachweis, dass die Website jede Pflicht des EU AI Act erfüllt."
      />
      <article className="shell max-w-3xl space-y-8 py-12 text-sm leading-relaxed text-muted">
        <section className="card p-5 text-fg">
          <h2 className="text-lg font-semibold">Kurz</h2>
          <p className="mt-3">
            Beim Erstellen und Bearbeiten dieser Website, bei Gestaltung und Programmierung, wurden teilweise KI-gestützte Werkzeuge eingesetzt.
            Soweit eine Kennzeichnung nach den geltenden Transparenzanforderungen nötig ist, steht sie an der betreffenden Stelle.
            Die redaktionelle und inhaltliche Verantwortung für die veröffentlichten Inhalte liegt beim Betreiber dieser Website.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">AlpenKI</h2>
          <p className="mt-3">
            Der Chat am Maskottchen heißt AlpenKI. Es ist ein automatischer Assistent mit fest hinterlegten Antworten zu Server, Regeln und Befehlen.
            Er ruft kein Sprachmodell auf und denkt sich keine neuen Texte aus. Im Chat steht deshalb ab der ersten Nachricht: automatischer Assistent, kein Mensch.
          </p>
          <p className="mt-3">
            Ob das rechtlich ein KI-System im Sinn von Art. 50 Abs. 1 der Verordnung (EU) 2024/1689 ist, steht hier nicht fest.
            Die Pflicht trifft nach dem Wortlaut vor allem Anbieter, die ein System für den direkten Austausch mit Personen bauen.
            Die Leitlinien der Kommission nennen dafür vier Punkte, unter anderem dass es sich um ein KI-System handelt und nicht nur um automatische Standardantworten.
            Der Hinweis im Chat ist trotzdem da, damit niemand eine Mitarbeiterin oder einen Mitarbeiter erwartet.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Texte</h2>
          <p className="mt-3">
            Regeln, Serverinfos, Guide und die übrigen Seitentexte sind redaktionelle Inhalte des Betreibers. Ein Teil davon ist mit KI-Hilfe entworfen und danach vom Betreiber übernommen worden.
            Es sind keine Meldungen zu Angelegenheiten von öffentlichem Interesse im Sinn von Art. 50 Abs. 4.
            Auch wenn man sie so lesen würde: Ein Mensch prüft und veröffentlicht sie, und der Betreiber trägt die redaktionelle Verantwortung. Dann gilt die Ausnahme in Art. 50 Abs. 4.
            Deshalb steht nicht unter jedem Absatz ein KI-Hinweis.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Bilder, Ton, Video</h2>
          <p className="mt-3">
            Es gibt keine Ton- oder Videodateien. Das Maskottchen ist eine gezeichnete Figur im Browser, keine Abbildung einer echten Person.
            Logo, Share-Bild und Hintergrundfotos sind Gestaltung. Die Galerie zeigt Aufnahmen, die Spieler einsenden, nachdem das Team sie freigibt.
            Im Projekt ist nicht hinterlegt, welches einzelne Bild ein KI-Modell erzeugt hat.
          </p>
          <p className="mt-3">
            Art. 50 Abs. 4 verlangt eine Kennzeichnung bei Deepfakes: Bild, Ton oder Video, das bestehenden Personen, Objekten, Orten, Einrichtungen oder Ereignissen ähnelt und fälschlich echt wirken würde.
            So etwas ist auf dieser Website nicht festgestellt. Eine pauschale Bildmarkierung wäre deshalb eine Behauptung, die das Projekt nicht hergibt.
            Die maschinenlesbare Markierung nach Art. 50 Abs. 2 trifft den Anbieter des erzeugenden KI-Systems, nicht nachträglich jede statische Datei auf einem Webserver.
            Gefälschte Herkunftsdaten werden hier nicht eingebaut.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Schweiz und EU</h2>
          <p className="mt-3">
            Der Betreiber sitzt nach eigener Angabe in der Schweiz. Die Website ist auch aus der EU erreichbar.
            Die Verordnung (EU) 2024/1689 gilt nach Art. 2 Abs. 1 Buchst. c auch für Anbieter und Betreiber in einem Drittstaat, wenn die Ausgabe des KI-Systems in der Union verwendet wird.
            Ob das auf einzelne Funktionen dieser Website zutrifft, ist keine Rechtsauskunft.
            Art. 50 gilt nach den Leitlinien der Kommission seit dem 2. August 2026. Inhalte, die davor erzeugt wurden, müssen laut der Fragen-und-Antworten-Seite der Kommission nicht nachträglich gekennzeichnet werden.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Was diese Seite nicht ist</h2>
          <p className="mt-3">
            Sie ist eine freiwillige Transparenzmaßnahme. Sie ist kein Code of Practice, keine Zertifizierung und keine Aussage, die Website sei vollständig konform.
            Emotionen oder biometrische Merkmale werden nicht erkannt.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <a className="text-fg underline" href="https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32024R1689">
                Verordnung (EU) 2024/1689 auf EUR-Lex
              </a>
            </li>
            <li>
              <a className="text-fg underline" href="https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50">
                Art. 50, AI Act Service Desk der Kommission
              </a>
            </li>
            <li>
              <a className="text-fg underline" href="https://digital-strategy.ec.europa.eu/en/library/guidelines-transparency-obligations-providers-and-deployers-ai-systems">
                Leitlinien der Kommission zu Art. 50, Juli 2026
              </a>
            </li>
            <li>
              <a className="text-fg underline" href="https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content">
                Code of Practice on Transparency of AI-Generated Content
              </a>
            </li>
          </ul>
          <p className="mt-4">
            <Link to="/kontakt" className="text-fg underline">
              Kontakt
            </Link>
          </p>
        </section>
      </article>
    </Shell>
  );
}
