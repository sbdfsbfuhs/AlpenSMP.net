import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Shell } from "@/components/site/shell";
import { SiteMascot } from "@/components/site/assistant";
import { SITE } from "@/lib/alpen/site";

export const Route = createFileRoute("/karte")({
  head: () => ({
    meta: [
      { title: "Live-Karte · AlpenSMP" },
      { name: "description", content: "BlueMap der AlpenSMP-Hauptworld, der gemeinsamen Overworld." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  return (
    <Shell>
      <PageHero
        kicker="Live-Karte"
        title="Die Hauptworld, von oben."
        lede="BlueMap der gemeinsamen Overworld. Die Karte öffnet sich in einem eigenen Tab, damit sie flüssig bleibt."
      />
      <div className="shell py-12">
        <div className="relative overflow-hidden rounded-lg border border-line">
          <img src="/media/ridge.jpg" alt="" className="hero-drift tone-red h-80 w-full object-cover opacity-70 md:h-96" />
          <div className="red-wash absolute inset-0" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg/55 px-6 text-center">
            <p className="kicker">Neu</p>
            <h2 className="display text-4xl">AlpenSMP Live-Karte</h2>
            <p className="max-w-md text-muted">BlueMap – Hauptworld (Overworld).</p>
            <a className="btn-gold" href={SITE.map} target="_blank" rel="noreferrer">
              Live-Karte öffnen
            </a>
          </div>
        </div>
        <p className="mt-4 text-sm text-faint">Öffnet BlueMap der Hauptworld in einem neuen Tab.</p>
        <SiteMascot bias="look" inset align="end" line="Die Karte zeigt nur die Hauptworld." />
      </div>
    </Shell>
  );
}
