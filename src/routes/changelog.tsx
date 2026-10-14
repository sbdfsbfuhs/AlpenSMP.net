import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHero, Shell } from "@/components/site/shell";
import { SiteMascot } from "@/components/site/assistant";
import { useFbValue, type NewsCategory, type NewsItem } from "@/lib/alpen/broadcast";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog & News · AlpenSMP" },
      { name: "description", content: "Was sich auf AlpenSMP geändert hat: Commands, Regeln, Events und Server-Updates." },
    ],
  }),
  component: ChangelogPage,
});

const CATS = ["Alle", "Update", "Regel", "Command", "Event", "Wartung", "Neu"] as const;

function ChangelogPage() {
  const raw = useFbValue<Record<string, NewsItem>>("changelog");
  const [cat, setCat] = useState<(typeof CATS)[number]>("Alle");
  const [shown, setShown] = useState(10);
  const rows = useMemo(() => {
    return Object.entries(raw ?? {})
      .map(([id, item]) => ({ id, ...item }))
      .filter((item) => item.published && item.title)
      .filter((item) => cat === "Alle" || item.category === cat)
      .sort((a, b) => (b.date || 0) - (a.date || 0));
  }, [raw, cat]);

  return (
    <Shell>
      <PageHero
        kicker="Server"
        title="📋 Changelog & News"
        lede="Was sich geändert hat – Commands, Regeln, Server-Updates."
      />
      <SiteMascot home="news" bias="sit" align="end" line="Neue Commands und Regeln stehen hier zuerst." />
      <div className="shell py-10">
        <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Kategorien">
          {CATS.map((item) => (
            <button
              key={item}
              type="button"
              className={item === cat ? "btn-brand shrink-0" : "btn-ghost shrink-0"}
              onClick={() => {
                setCat(item);
                setShown(10);
              }}
            >
              {item}
            </button>
          ))}
        </div>
        <ul className="mt-6 space-y-4">
          {rows.slice(0, shown).map((item) => (
            <li key={item.id} className="card card-still p-5">
              <div className="flex flex-wrap items-center gap-3">
                <time className="text-sm text-muted" dateTime={item.date ? new Date(item.date).toISOString() : undefined}>
                  {item.date
                    ? new Date(item.date).toLocaleDateString("de-CH", { day: "numeric", month: "long", year: "numeric" })
                    : "Ohne Datum"}
                </time>
                <span className={`news-badge cat-${slug(item.category)}`}>{item.category || "Update"}</span>
              </div>
              <h2 className="mt-3 text-2xl font-semibold">{item.title}</h2>
              {item.description ? <div className="mt-3 space-y-2 text-sm text-muted"><Rich text={item.description} /></div> : null}
              {item.url ? (
                <a className="btn-ghost mt-4" href={item.url} target="_blank" rel="noopener noreferrer">
                  Mehr erfahren
                </a>
              ) : null}
            </li>
          ))}
        </ul>
        {!rows.length ? <p className="mt-8 text-muted">Noch keine Einträge in dieser Kategorie.</p> : null}
        {shown < rows.length ? (
          <button type="button" className="btn-ghost mt-6" onClick={() => setShown((n) => n + 10)}>
            Mehr laden
          </button>
        ) : null}
      </div>
    </Shell>
  );
}

function slug(category?: string) {
  const known: NewsCategory[] = ["Update", "Regel", "Command", "Event", "Wartung", "Neu"];
  return known.includes(category as NewsCategory) ? (category as string).toLowerCase() : "update";
}

function Rich({ text }: { text: string }) {
  return text.split("\n").map((line, index) => (
    <p key={index}>{inline(line)}</p>
  ));
}

function inline(line: string) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : <span key={index}>{part}</span>,
  );
}
