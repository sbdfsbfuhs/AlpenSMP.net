import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Shell } from "@/components/site/shell";
import { SiteMascot } from "@/components/site/assistant";
import { SITE } from "@/lib/alpen/site";

export const Route = createFileRoute("/karte")({
  head: () => ({
    meta: [
      { title: "Live-Karte · AlpenSMP" },
      {
        name: "description",
        content: SITE.mapOpen
          ? "BlueMap der AlpenSMP-Hauptworld, der gemeinsamen Overworld."
          : "Die AlpenSMP-Live-Karte ist gerade zu, weil der Kartenspeicher voll ist.",
      },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  return (
    <Shell>
      <PageHero
        kicker="Live-Karte"
        title={SITE.mapOpen ? "Die Hauptworld, von oben." : "Die Karte macht gerade Pause."}
        lede={
          SITE.mapOpen
            ? "BlueMap der gemeinsamen Overworld. Die Karte öffnet sich in einem eigenen Tab, damit sie flüssig bleibt."
            : "Der Speicher auf dem Kartenserver ist voll. Die Welt selbst läuft weiter – nur die BlueMap ist bis auf Weiteres zu."
        }
      />
      <div className="shell py-12">
        <div className="map-hold relative overflow-hidden rounded-lg border border-line">
          <img src="/media/ridge.jpg" alt="" className="hero-drift tone-red absolute inset-0 h-full w-full object-cover opacity-60" />
          <div className="red-wash absolute inset-0" />
          <div className="map-grid absolute inset-0" aria-hidden="true" />
          <div className="relative flex min-h-[28rem] items-center justify-center px-6 py-16">
            {SITE.mapOpen ? (
              <div className="card max-w-lg p-8 text-center">
                <p className="kicker">Neu</p>
                <h2 className="display mt-3 text-4xl">AlpenSMP Live-Karte</h2>
                <p className="mt-3 text-muted">BlueMap – Hauptworld (Overworld).</p>
                <a className="btn-gold mt-6" href={SITE.map} target="_blank" rel="noreferrer">
                  Live-Karte öffnen
                </a>
              </div>
            ) : (
              <div className="card max-w-lg p-8 text-center">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-ember">
                  <span className="pulse-dot off" aria-hidden="true" />
                  Gerade nicht erreichbar
                </p>
                <h2 className="display mt-4 text-4xl">Speicher voll.</h2>
                <p className="mt-4 text-muted">
                  Die Live-Karte braucht Platz, und der ist gerade alle. Schau ein anderes Mal wieder vorbei. Sobald wieder Speicher frei ist, liegt die Hauptworld hier.
                </p>
                <Link to="/server" className="btn-gold mt-6">
                  Spielen geht trotzdem
                </Link>
              </div>
            )}
          </div>
        </div>
        <SiteMascot
          home="karte"
          bias="look"
          inset
          align="end"
          line={SITE.mapOpen ? "Die Karte zeigt nur die Hauptworld." : "Die Karte ist zu. Spielen geht trotzdem."}
        />
      </div>
    </Shell>
  );
}