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
        content: "Java: alpensmp.net. Bedrock: play.alpensmp.net, Port 19132. Version 1.21.11 und Live-Status von AlpenSMP.",
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
        lede="Java und Bedrock spielen auf derselben Welt. Die Adressen kannst du direkt kopieren."
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
              <li>Adresse eintragen. Den Port lässt du leer.</li>
              <li>Beitreten</li>
            </ol>
            <p className="mt-3 text-sm text-muted">
              Der SRV-Eintrag schickt den Client auf {SITE.play}, Port {SITE.javaPort}. Den Port musst du im Java-Client nicht eintragen.
            </p>
            <div className="mt-5">
              <CopyIp value={SITE.ip} label="Java" />
            </div>
          </article>
          <article className="card p-6">
            <h2 className="text-xl font-semibold">Bedrock Edition</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted">
              <li>Minecraft Bedrock öffnen</li>
              <li>Server hinzufügen</li>
              <li>Adresse und Port eintragen</li>
              <li>Beitreten</li>
            </ol>
            <p className="mt-3 text-sm text-muted">
              Bedrock ignoriert den SRV-Eintrag, deshalb die play-Adresse und der Port.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <CopyIp value={SITE.play} label="Bedrock" />
              <CopyIp value={SITE.bedrockPort} label="Port" />
            </div>
          </article>
          <article className="card p-6">
            <h2 className="text-xl font-semibold">Team-Prefix</h2>
            <p className="mt-3 text-muted">
              Im Chat <code className="text-gold">/team prefix</code>, direkt danach der Farbcode und der Teamname. Nicht der Spielername. Farbcode und Team-Text zusammen höchstens 10 Zeichen, ohne Leerzeichen.
              Im Tab steht der Prefix vor dem Namen, der Text selbst ist farbig. Beispiel: <code className="text-gold">/team prefix &cAlpen</code>
            </p>
            <Link to="/prefix" className="btn-gold mt-5">
              Farben und Befehl
            </Link>
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
      <SiteMascot home="server" bias="look" align="end" line="Java oder Bedrock – ich sag dir, wie du joinest." />
    </Shell>
  );
}
