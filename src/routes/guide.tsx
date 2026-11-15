import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PlayerCommands } from "@/components/site/commands";
import { SiteMascot } from "@/components/site/assistant";
import { ModsGuide } from "@/components/site/guide/mods";
import { BeginnerGuide } from "@/components/site/guide/beginner";
import { PageHero, Shell } from "@/components/site/shell";
import { GUIDE, type GuideChapter } from "@/lib/alpen/content";
import { entries, fbGet } from "@/lib/alpen/staff";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Spieler-Guide · AlpenSMP" },
      {
        name: "description",
        content: "AlpenSMP, Minecraft-Grundlagen, Mods, Voice Chat und Spielerbefehle – direkt erreichbar.",
      },
    ],
  }),
  component: GuidePage,
});

type Section = "alpen" | "basics" | "mods" | "commands";

function GuidePage() {
  const [section, setSection] = useState<Section>("alpen");
  const [query, setQuery] = useState("");
  const [topics, setTopics] = useState<{ title?: string; description?: string; category?: string; steps?: string; image?: string }[]>([]);
  const pickSection = (next: Section) => {
    setSection(next);
    if (window.location.hash) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  };

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash === "mods") {
      setSection("mods");
      return;
    }
    if (hash === "befehle" || hash === "alpen-commands" || hash.startsWith("commands-")) {
      setSection("commands");
      return;
    }
    if (hash === "grundlagen") {
      setSection("basics");
      return;
    }
    const chapter = GUIDE.find((item) => item.id === hash);
    if (chapter) {
      setSection(chapter.id === "alpen-commands" ? "commands" : chapter.track === "mc" ? "basics" : "alpen");
    }
  }, []);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (section === "mods" && id === "mods") {
      window.requestAnimationFrame(() => document.getElementById("mods")?.scrollIntoView({ block: "start" }));
      return;
    }
    if (section === "commands" && (id === "befehle" || id === "alpen-commands" || id.startsWith("commands-"))) {
      window.requestAnimationFrame(() => document.getElementById("befehle")?.scrollIntoView({ block: "start" }));
      return;
    }
    if (section === "basics" && (id === "grundlagen" || GUIDE.some((chapter) => chapter.id === id && chapter.track === "mc"))) {
      window.requestAnimationFrame(() => document.getElementById("grundlagen")?.scrollIntoView({ block: "start" }));
      return;
    }
    if (section !== "alpen" || !GUIDE.some((chapter) => chapter.id === id && chapter.track === "alpen")) return;
    window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
  }, [section]);

  useEffect(() => {
    fbGet<Record<string, { title?: string; description?: string; category?: string; steps?: string; image?: string }>>("guideTopics")
      .then((value) => setTopics(entries(value).map(([, item]) => item)))
      .catch(() => setTopics([]));
  }, []);

  const chapters = useMemo(() => {
    const pool = section === "alpen"
      ? GUIDE.filter((chapter) => chapter.track === "alpen" && chapter.id !== "alpen-commands")
      : [];
    const q = query.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter((chapter) =>
      (chapter.title + chapter.description + chapter.keywords + chapter.blocks.join(" ")).toLowerCase().includes(q),
    );
  }, [section, query]);

  return (
    <Shell>
      <PageHero
        kicker="Spieler-Guide"
        title="Finde schnell deinen Einstieg."
        lede="Wähle direkt einen Bereich. Du musst dich nicht erst durch mehrere Auswahlseiten klicken."
      />
      <div id="start" className="shell scroll-mt-24 py-12">
        <GuideTabs section={section} onPick={pickSection} />
        {section === "alpen" ? (
          <>
            {topics.length ? (
              <div className="mb-10 space-y-3">
                {topics.map((topic) => (
                  <article key={topic.title} className="card p-5">
                    <p className="text-xs text-faint">{topic.category}</p>
                    <h2 className="text-xl font-semibold">{topic.title}</h2>
                    <p className="mt-2 text-sm text-muted">{topic.description}</p>
                    {topic.steps ? <p className="mt-2 text-sm whitespace-pre-line text-muted">{topic.steps}</p> : null}
                    {topic.image ? <img src={topic.image} alt={topic.title} className="mt-3 max-h-48 rounded-md object-cover" loading="lazy" decoding="async" /> : null}
                  </article>
                ))}
              </div>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                className="field"
                type="search"
                placeholder="Thema auf AlpenSMP suchen"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <p className="mt-4 text-sm text-faint">{chapters.length} Kapitel · AlpenSMP</p>
            <div className="mt-6 space-y-4">
              {chapters.map((chapter, index) => (
                <Chapter key={chapter.id} chapter={chapter} index={index + 1} total={chapters.length} />
              ))}
              {!chapters.length ? <p className="text-muted">Nichts dazu gefunden. Versuch ein anderes Wort.</p> : null}
            </div>
          </>
        ) : null}
        {section === "basics" ? (
          <div id="grundlagen" className="scroll-mt-24">
            <BeginnerGuide />
          </div>
        ) : null}
        {section === "mods" ? (
          <div id="mods" className="scroll-mt-24">
            <ModsGuide />
          </div>
        ) : null}
        {section === "commands" ? (
          <div id="befehle" className="mt-8 scroll-mt-24 border-t border-line pt-10">
            <PlayerCommands />
          </div>
        ) : null}
        {section === "alpen" || section === "commands" ? (
          <SiteMascot home="guide" bias="look" inset line="Such einen Befehl oder frag mich direkt." />
        ) : null}
      </div>
    </Shell>
  );
}

function GuideTabs({ section, onPick }: { section: Section; onPick: (section: Section) => void }) {
  const tabs: { id: Section; label: string }[] = [
    { id: "alpen", label: "AlpenSMP starten" },
    { id: "basics", label: "Minecraft lernen" },
    { id: "mods", label: "Mods & Voice" },
    { id: "commands", label: "Spieler-Befehle" },
  ];
  return (
    <nav className="guide-tabs mb-8" aria-label="Guide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={section === tab.id ? "btn-brand" : "btn-ghost"}
          aria-current={section === tab.id ? "page" : undefined}
          onClick={() => onPick(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

function Chapter({ chapter, index, total }: { chapter: GuideChapter; index: number; total: number }) {
  return (
    <article id={chapter.id} className="card cmd-in scroll-mt-24 p-6" style={{ animationDelay: `${index * 40}ms` }}>
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
      {chapter.id === "alpen-regeln" ? (
        <Link to="/regeln" className="btn-ghost mt-5 inline-flex">
          Offizielles Regelwerk öffnen
        </Link>
      ) : null}
    </article>
  );
}
