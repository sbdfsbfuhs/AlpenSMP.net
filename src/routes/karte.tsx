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
            ? "Erkunde die BlueMap der gemeinsamen Overworld direkt hier – zoome hinein und navigiere durch die Welt."
            : "Der Speicher auf dem Kartenserver ist voll. Die Welt selbst läuft weiter – nur die BlueMap ist bis auf Weiteres zu."
        }
      />
      <div className="shell py-12">
        {SITE.mapOpen ? (
          <div className="mx-auto w-full max-w-[70svh] space-y-3">
            <div className="flex flex-col items-start gap-2">
              <p className="text-sm font-semibold text-fg">BlueMap – Hauptworld (Overworld)</p>
              <p className="text-xs text-muted">
                Ziehe die Karte zum Verschieben und nutze Mausrad oder zwei Finger zum Zoomen.
              </p>
              <a className="btn-brand" href={SITE.map} target="_blank" rel="noopener noreferrer">
                Karte in neuem Tab öffnen
              </a>
            </div>
            <iframe
              className="block h-[84svh] min-h-[30rem] max-h-[60rem] w-full rounded-lg border border-line bg-surface shadow-xl"
              src={SITE.map}
              title="BlueMap-Live-Karte der AlpenSMP-Hauptworld"
              loading="lazy"
              referrerPolicy="no-referrer"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="map-hold relative overflow-hidden rounded-lg border border-line">
            <img src="/media/ridge.jpg" alt="" aria-hidden="true" className="hero-drift tone-red absolute inset-0 h-full w-full object-cover opacity-60" />
            <div className="red-wash absolute inset-0" />
            <div className="map-grid absolute inset-0" aria-hidden="true" />
            <div className="relative flex min-h-[28rem] items-center justify-center px-6 py-16">
              <div className="card max-w-lg p-8 text-center">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-ember">
                  <span className="pulse-dot off" aria-hidden="true" />
                  Gerade nicht erreichbar
                </p>
                <h2 className="display mt-4 text-4xl">Speicher voll.</h2>
                <p className="mt-4 text-muted">
                  Die Live-Karte braucht Platz, und der ist gerade alle. Schau ein anderes Mal wieder vorbei. Sobald wieder Speicher frei ist, liegt die Hauptworld hier.
                </p>
                <Link to="/server" className="btn-brand mt-6">
                  Spielen geht trotzdem
                </Link>
              </div>
            </div>
          </div>
        )}
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