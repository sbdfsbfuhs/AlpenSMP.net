import { createFileRoute } from "@tanstack/react-router";
import { DiscordLink, PageHero, Shell, TikTokLink } from "@/components/site/shell";
import { SiteMascot } from "@/components/site/assistant";
import { TicketForm } from "@/components/site/forms";

const CONTACT_EMAIL = "alpensmp.net@gmail.com";

export const Route = createFileRoute("/kontakt")({
  head: () => ({
    meta: [
      { title: "Kontakt & Ticket · AlpenSMP" },
      { name: "description", content: "Ticket an das AlpenSMP-Team senden und Antworten mit deinem Code nachlesen." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <Shell>
      <PageHero
        kicker="Support"
        title="Kontakt & Ticket"
        lede="Ticket hier oder auf Discord. Du bekommst einen Code und kannst die Antwort danach nachlesen."
      />
      <div className="shell max-w-2xl py-12">
        <div className="card card-still mb-6 flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm text-muted">Per E-Mail erreichst du den Betreiber direkt:</p>
            <a className="mt-1 inline-block text-brand underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>
          <div className="flex flex-wrap gap-2">
            <DiscordLink>Discord öffnen</DiscordLink>
            <TikTokLink>TikTok</TikTokLink>
          </div>
        </div>
        <SiteMascot home="kontakt" bias="sleep" inset line="Kurze Frage? Ich antworte sofort. Sonst das Ticket." />
        <TicketForm />
        <p className="mt-6 text-sm text-faint">AlpenSMP ist ein privater, nicht-kommerzieller Minecraft-Server. Bitte sende keine Passwörter oder unnötigen privaten Angaben.</p>
      </div>
    </Shell>
  );
}
