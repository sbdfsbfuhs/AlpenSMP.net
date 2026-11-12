import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { COMMAND_GROUPS, FAQ, FEATURES, GUIDE, RULES } from "@/lib/alpen/content";
import { MORE, NAV, SITE } from "@/lib/alpen/site";

type SearchEntry = {
  title: string;
  type: string;
  description: string;
  href: string;
};

const PAGE_ENTRIES: SearchEntry[] = [...NAV, ...MORE].map((page) => ({
  title: page.label,
  type: "Seite",
  description: `AlpenSMP · ${page.label}`,
  href: page.to,
}));

const SEARCH_ENTRIES: SearchEntry[] = [
  ...PAGE_ENTRIES,
  {
    title: "Server-IP und Beitreten",
    type: "Server",
    description: `Java ${SITE.ip} · Bedrock ${SITE.play} · Port ${SITE.bedrockPort}`,
    href: "/server",
  },
  ...FAQ.map((item, index) => ({
    title: item.q,
    type: "FAQ",
    description: item.a,
    href: `/faq#faq-${index}`,
  })),
  ...FEATURES.map((feature) => ({
    title: feature.title,
    type: "Feature",
    description: `${feature.summary} ${feature.body.join(" ")}`,
    href: `/features#${feature.id}`,
  })),
  ...COMMAND_GROUPS.flatMap((group) =>
    group.rows.map((row) => ({
      title: row.cmd,
      type: `Befehl · ${group.title}`,
      description: row.text,
      href: `/features#commands-${group.id}`,
    })),
  ),
  ...GUIDE.map((chapter) => ({
    title: chapter.title,
    type: "Guide",
    description: `${chapter.description} ${chapter.keywords} ${chapter.blocks.join(" ")}`,
    href: `/guide#${chapter.id}`,
  })),
  ...RULES.map((rule) => ({
    title: `Regel ${rule.id}: ${rule.title}`,
    type: "Regeln",
    description: [
      ...rule.paragraphs,
      ...(rule.forbidden ?? []),
      ...(rule.allowed ?? []),
      ...(rule.bullets ?? []),
      rule.note ?? "",
    ].join(" "),
    href: `/regeln#regel-${rule.id}`,
  })),
];

function normalize(value: string) {
  return value
    .toLocaleLowerCase("de")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function rank(entry: SearchEntry, query: string, terms: string[]) {
  const title = normalize(entry.title);
  const content = normalize(`${entry.type} ${entry.description}`);
  if (!terms.every((term) => title.includes(term) || content.includes(term))) return -1;
  return (
    (title === query ? 100 : title.startsWith(query) ? 50 : title.includes(query) ? 25 : 0) +
    terms.reduce((score, term) => score + (title.includes(term) ? 5 : 0), 0)
  );
}

export function SiteSearch() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  function open() {
    if (!dialog.current?.open) dialog.current?.showModal();
    window.setTimeout(() => input.current?.focus(), 0);
  }

  function close() {
    dialog.current?.close();
    setQuery("");
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const results = useMemo(() => {
    const normalized = normalize(query);
    if (!normalized)
      return SEARCH_ENTRIES.filter((entry) =>
        ["Server-IP und Beitreten", "Spieler-Guide", "Server-Regeln", "FAQ", "Community"].includes(
          entry.title,
        ),
      );
    const terms = normalized.split(" ").filter(Boolean);
    return SEARCH_ENTRIES.map((entry) => ({ entry, score: rank(entry, normalized, terms) }))
      .filter((result) => result.score >= 0)
      .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, "de"))
      .slice(0, 8)
      .map(({ entry }) => entry);
  }, [query]);

  return (
    <>
      <button
        type="button"
        className="site-search-trigger"
        aria-label="Website durchsuchen"
        onClick={open}
      >
        <Search className="size-4" aria-hidden="true" />
        <span>Suchen</span>
        <kbd>Ctrl K</kbd>
      </button>
      <dialog
        ref={dialog}
        className="site-search-dialog"
        aria-labelledby="site-search-title"
        onClick={(event) => {
          if (event.target === dialog.current) close();
        }}
        onClose={() => setQuery("")}
      >
        <div className="site-search-heading">
          <div>
            <h2 id="site-search-title" className="text-lg font-semibold">
              AlpenSMP durchsuchen
            </h2>
            <p className="mt-1 text-sm text-muted">Seiten, FAQ, Regeln, Features und Befehle</p>
          </div>
          <button
            type="button"
            className="site-search-close"
            aria-label="Suche schliessen"
            onClick={close}
          >
            <X className="size-5" />
          </button>
        </div>
        <label className="site-search-input-wrap">
          <Search className="size-5 shrink-0 text-brand" aria-hidden="true" />
          <input
            ref={input}
            className="site-search-input"
            type="search"
            value={query}
            aria-label="Suchbegriff"
            placeholder="Zum Beispiel: Bedrock-Port, Claims, Bann"
            onChange={(event) => setQuery(event.target.value)}
          />
          <kbd>ESC</kbd>
        </label>
        <p className="site-search-count" aria-live="polite">
          {results.length
            ? `${results.length}${query.trim() ? " passende" : " häufig gesuchte"} ${results.length === 1 ? "Stelle" : "Stellen"}`
            : "Keine Treffer. Versuch einen anderen Suchbegriff."}
        </p>
        <ul className="site-search-results">
          {results.map((result) => (
            <li key={`${result.type}-${result.href}-${result.title}`}>
              <a href={result.href} onClick={close} className="site-search-result">
                <span className="site-search-result-copy">
                  <span className="site-search-result-title">{result.title}</span>
                  <span className="site-search-result-description">{result.description}</span>
                </span>
                <span className="site-search-result-type">{result.type}</span>
              </a>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}
