import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DiscordLink, PageHero, Shell } from "@/components/site/shell";
import { SiteMascot } from "@/components/site/assistant";
import { RULES, RULES_INTRO } from "@/lib/alpen/content";
import { entries, fbGet } from "@/lib/alpen/staff";

export const Route = createFileRoute("/regeln")({
  head: () => ({
    meta: [
      { title: "Server-Regeln · AlpenSMP" },
      {
        name: "description",
        content: "Die 14 verbindlichen AlpenSMP-Regeln zu Respekt, Mods, Claims, Voice Chat und Strafen.",
      },
    ],
  }),
  component: RulesPage,
});

function RulesPage() {
  const [extra, setExtra] = useState<{ title?: string; body?: string }[]>([]);
  useEffect(() => {
    fbGet<Record<string, { title?: string; body?: string }>>("rulesPublic")
      .then((value) => setExtra(entries(value).map(([, item]) => item)))
      .catch(() => setExtra([]));
  }, []);

  return (
    <Shell>
      <PageHero
        kicker="Offizielles Regelwerk"
        title="14 klare Regeln."
        lede={RULES_INTRO + " Für Survival, Chat, Mods und Fairplay – ohne Kleinprint-Dschungel."}
      />
      <div className="shell flex flex-wrap gap-3 py-8 text-sm text-muted">
        <span className="rounded-full border border-line px-3 py-1">14 Regeln</span>
        <span className="rounded-full border border-line px-3 py-1">Java & Bedrock</span>
        <span className="rounded-full border border-line px-3 py-1">Kein Pay-to-Win</span>
      </div>
      <SiteMascot home="regeln" bias="sit" align="end" line="Unsicher bei einem Mod? Frag mich, bevor du joinest." />
      {extra.length ? (
        <div className="shell mb-8 space-y-2">
          {extra.map((rule) => (
            <details key={rule.title} className="card p-4" open>
              <summary className="cursor-pointer font-semibold">{rule.title}</summary>
              <p className="mt-3 text-sm whitespace-pre-line text-muted">{rule.body}</p>
            </details>
          ))}
        </div>
      ) : null}
      <div className="shell grid gap-8 pb-8 lg:grid-cols-[16rem_1fr]">
        <nav className="card h-fit p-4 lg:sticky lg:top-24" aria-label="Regelverzeichnis">
          <p className="text-xs font-semibold tracking-widest text-faint uppercase">Inhalt</p>
          <ol className="mt-3 space-y-1 text-sm">
            {RULES.map((rule) => (
              <li key={rule.id}>
                <a className="block rounded-md px-2 py-1.5 text-muted hover:bg-surface-2 hover:text-fg" href={`#regel-${rule.id}`}>
                  {rule.id}. {rule.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="space-y-4">
          {RULES.map((rule) => (
            <article id={`regel-${rule.id}`} key={rule.id} className="card scroll-mt-24 p-6">
              <div className="flex items-baseline gap-3">
                <span className="display text-2xl text-gold">{String(rule.id).padStart(2, "0")}</span>
                <h2 className="text-xl font-semibold">{rule.title}</h2>
                {rule.highlight ? <span className="text-xs font-semibold text-ice">Wichtig</span> : null}
              </div>
              <div className="mt-4 space-y-3 text-sm text-muted">
                {rule.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {rule.forbidden?.length ? (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-ember">Verboten</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {rule.forbidden.map((item) => (
                      <li key={item} className="rounded-full border border-ember/40 px-3 py-1 text-sm text-fg">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {rule.allowed?.length ? (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-ice">Erlaubt</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {rule.allowed.map((item) => (
                      <li key={item} className="rounded-full border border-ice/40 px-3 py-1 text-sm text-fg">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {rule.bullets?.length ? (
                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted">
                  {rule.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {rule.note ? <p className="mt-4 text-sm text-fg">{rule.note}</p> : null}
            </article>
          ))}
          <p className="text-sm text-faint">
            Unklar? Frag AlpenKI unten links oder das Team auf <DiscordLink className="mx-1 align-middle">Discord</DiscordLink>.
          </p>
        </div>
      </div>
    </Shell>
  );
}
