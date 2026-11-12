import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHero, Shell } from "@/components/site/shell";
import { SiteMascot } from "@/components/site/assistant";
import { FAQ } from "@/lib/alpen/content";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ · AlpenSMP" },
      { name: "description", content: "Häufige Fragen zu IP, Bedrock-Port, Version, Claims, Voice Chat und Support." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  useEffect(() => {
    const syncHash = () => {
      const match = /^#faq-(\d+)$/.exec(window.location.hash);
      if (!match) return;
      const index = Number(match[1]);
      if (!FAQ[index]) return;
      setOpen(index);
      window.requestAnimationFrame(() => document.getElementById(`faq-${index}`)?.scrollIntoView({ block: "start" }));
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);
  return (
    <Shell>
      <PageHero
        kicker="FAQ"
        title="Häufig gestellte Fragen"
        lede="IP, Version, Bedrock, Claims, Voice und Support – die Antworten, die auf AlpenSMP wirklich gelten."
      />
      <div className="shell max-w-3xl py-12">
        <div className="stagger divide-y divide-line overflow-hidden rounded-lg border border-line">
          {FAQ.map((item, index) => {
            const isOpen = open === index;
            return (
              <div id={`faq-${index}`} key={item.q} className="faq-row scroll-mt-24 bg-surface" data-open={isOpen}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : index)}
                >
                  {item.q}
                  <span className="faq-mark text-brand" aria-hidden="true">
                    {isOpen ? "–" : "+"}
                  </span>
                </button>
                {isOpen ? <p className="panel-in px-5 pb-5 text-sm text-muted">{item.a}</p> : null}
              </div>
            );
          })}
        </div>
        <SiteMascot home="faq" bias="scratch" inset align="end" line="Steht deine Frage nicht dabei? Ich kenne das Regelwerk." />
      </div>
    </Shell>
  );
}
