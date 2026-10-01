import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Shell } from "@/components/site/shell";
import { SiteMascot } from "@/components/site/assistant";
import { TicketForm } from "@/components/site/forms";

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
        <SiteMascot bias="sleep" inset line="Kurze Frage? Ich antworte sofort. Sonst das Ticket." />
        <TicketForm />
        <p className="mt-6 text-sm text-faint">AlpenSMP ist ein privater, nicht-kommerzieller Minecraft-Server.</p>
      </div>
    </Shell>
  );
}
