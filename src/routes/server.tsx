import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Shell } from "@/components/site/shell";
import { SiteMascot } from "@/components/site/assistant";
import { CopyIp, MotdNotice, SiteBanner, StatusCard } from "@/components/site/live";
import { SITE } from "@/lib/alpen/site";

export const Route = createFileRoute("/server")({
  head: () => ({
    meta: [
      { title: "Server beitreten · AlpenSMP" },
      {
        name: "description",
        content: "Java- und Bedrock-Adresse, Port 27491, Version 1.21.11 und Live-Status von AlpenSMP.",
      },
    ],
  }),
  component: ServerPage,
});

function ServerPage() {
  return (
    <Shell>
      <PageHero
        kicker="Beitreten"
        title="Bereit für dein Abenteuer?"
        lede="Adresse und Port stehen direkt bei den Schritten – zum Kopieren. Java und Bedrock spielen auf derselben Welt."
      />
      <div className="shell grid gap-6 py-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <MotdNotice />
          <SiteBanner />
          <article className="card p-6">
            <h2 className="text-xl font-semibold">Java Edition</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted">
              <li>Minecraft Java öffnen</li>
              <li>Mehrspieler, dann Server hinzufügen</li>
              <li>Adresse eingeben und speichern</li>
              <li>Beitreten</li>
            </ol>
            <div className="mt-5">
              <CopyIp value={SITE.ip} label="Server-Adresse" />
            </div>
          </article>
          <article className="card p-6">
            <h2 className="text-xl font-semibold">Bedrock Edition</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted">
              <li>Minecraft Bedrock öffnen</li>
              <li>Server hinzufügen</li>
              <li>Adresse und Port eingeben</li>
              <li>Beitreten</li>
            </ol>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <CopyIp value={SITE.ip} label="Server-Adresse" />
              <CopyIp value={SITE.bedrockPort} label="Port" />
            </div>
          </article>
          <article className="card p-6">
            <h2 className="text-xl font-semibold">Empfohlene Version: Minecraft {SITE.version}</h2>
            <p className="mt-3 text-muted">
              Andere Versionen können funktionieren. Minecraft 26.2+ kann aktuell Verbindungsprobleme verursachen. Der
              Server läuft auf Paper.
            </p>
            <p className="mt-3 text-muted">
              AlpenSMP ist kostenlos. Es gibt keine Pay-to-Win-Ränge und keinen Spenden-Zwang. Der Server ist privat
              und nicht-kommerziell.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/guide" className="btn-gold">
                Spieler-Guide
              </Link>
              <Link to="/features" className="btn-ghost">
                Features & Befehle
              </Link>
            </div>
          </article>
        </div>
        <StatusCard />
      </div>
      <SiteMascot bias="look" align="end" line="Java oder Bedrock – ich sag dir, wie du joinest." />
    </Shell>
  );
}
