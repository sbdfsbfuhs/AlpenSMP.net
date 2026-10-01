import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PlayerCommands } from "@/components/site/commands";
import { SiteMascot } from "@/components/site/assistant";
import { PageHero, Shell } from "@/components/site/shell";
import { GUIDE, type GuideChapter } from "@/lib/alpen/content";
import { entries, fbGet } from "@/lib/alpen/staff";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Spieler-Guide · AlpenSMP" },
      {
        name: "description",
        content: "Start auf AlpenSMP: Minecraft-Grundlagen, IP, Regeln, Voice Chat und die aktuellen Befehle.",
      },
    ],
  }),
  component: GuidePage,
});

function GuidePage() {
  const [track, setTrack] = useState<"mc" | "alpen" | null>(null);
  const [query, setQuery] = useState("");
  const [topics, setTopics] = useState<{ title?: string; description?: string; category?: string; steps?: string; image?: string }[]>([]);

  useEffect(() => {
    fbGet<Record<string, { title?: string; description?: string; category?: string; steps?: string; image?: string }>>("guideTopics")
      .then((value) => setTopics(entries(value).map(([, item]) => item)))
      .catch(() => setTopics([]));
  }, []);

  const chapters = useMemo(() => {
    const pool = track ? GUIDE.filter((chapter) => chapter.track === track) : GUIDE;
    const q = query.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter((chapter) =>
      (chapter.title + chapter.description + chapter.keywords + chapter.blocks.join(" ")).toLowerCase().includes(q),
    );
  }, [track, query]);

  return (
    <Shell>
      <PageHero
        kicker="Spieler-Guide"
        title="Alles für den Start."
        lede="Zwei Wege rein. Darunter die Befehle für Java und Bedrock, jeweils mit Kopieren."
      />
      <div className="shell py-12">
        {topics.length ? (
          <div className="mb-10 space-y-3">
            {topics.map((topic) => (
              <article key={topic.title} className="card p-5">
                <p className="text-xs text-faint">{topic.category}</p>
                <h2 className="text-xl font-semibold">{topic.title}</h2>
                <p className="mt-2 text-sm text-muted">{topic.description}</p>
                {topic.steps ? <p className="mt-2 text-sm whitespace-pre-line text-muted">{topic.steps}</p> : null}
                {topic.image ? <img src={topic.image} alt="" className="mt-3 max-h-48 rounded-md object-cover" /> : null}
              </article>
            ))}
          </div>
        ) : null}
        {track === null ? <Choice onPick={setTrack} /> : (
          <div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                className="field"
                type="search"
                placeholder="Was möchtest du wissen?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="button" className="btn-ghost" onClick={() => setTrack(null)}>
                Auswahl ändern
              </button>
            </div>
            <p className="mt-4 text-sm text-faint">
              {chapters.length} Kapitel · {track === "mc" ? "Minecraft-Grundlagen" : "AlpenSMP"}
            </p>
            <div className="mt-6 space-y-4">
              {chapters.map((chapter, index) => (
                <Chapter key={chapter.id} chapter={chapter} index={index + 1} total={chapters.length} />
              ))}
              {!chapters.length ? <p className="text-muted">Nichts dazu gefunden. Versuch ein anderes Wort.</p> : null}
            </div>
            {track === "mc" ? (
              <button type="button" className="btn-gold mt-8" onClick={() => setTrack("alpen")}>
                Weiter zu AlpenSMP
              </button>
            ) : null}
          </div>
        )}
        <SiteMascot bias="look" inset line="Die Befehle kann ich dir auch erklären." />
        <div className="mt-16">
          <PlayerCommands />
        </div>
      </div>
    </Shell>
  );
}

function Choice({ onPick }: { onPick: (track: "alpen" | "mc") => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <button type="button" className="card p-6 text-left" onClick={() => onPick("alpen")}>
        <h2 className="text-2xl font-semibold">Ja, ich kenne Minecraft</h2>
        <p className="mt-2 text-muted">Ich kenne die Grundlagen bereits.</p>
        <span className="btn-gold mt-6">AlpenSMP entdecken</span>
      </button>
      <button type="button" className="card p-6 text-left" onClick={() => onPick("mc")}>
        <h2 className="text-2xl font-semibold">Nein, ich bin neu bei Minecraft</h2>
        <p className="mt-2 text-muted">Zuerst die wichtigsten Grundlagen lernen.</p>
        <span className="btn-ghost mt-6">Minecraft lernen</span>
      </button>
    </div>
  );
}

function Chapter({ chapter, index, total }: { chapter: GuideChapter; index: number; total: number }) {
  return (
    <article className="card cmd-in p-6" style={{ animationDelay: `${index * 40}ms` }}>
      <p className="text-xs text-faint">
        {index} / {total}
      </p>
      <h2 className="mt-2 text-2xl font-semibold">{chapter.title}</h2>
      <p className="mt-1 text-muted">{chapter.description}</p>
      <ul className="mt-4 space-y-2 text-sm text-muted">
        {chapter.blocks.map((block) => (
          <li key={block}>{block}</li>
        ))}
      </ul>
    </article>
  );
}
