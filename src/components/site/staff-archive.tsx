import { useMemo, useState } from "react";
import { useLive, wipe } from "@/components/site/staff-live";
import { entries, formatWhen, type ModItem, type StaffSession } from "@/lib/alpen/staff";

type ArchivePath = "bans" | "warns" | "helpRequests";
type ArchiveFilter = "all" | ArchivePath;
type ArchiveRow = { path: ArchivePath; key: string; item: ModItem };

const ARCHIVE_TYPES: { value: ArchiveFilter; label: string }[] = [
  { value: "all", label: "Alle Einträge" },
  { value: "bans", label: "Bans" },
  { value: "warns", label: "Warnungen" },
  { value: "helpRequests", label: "Support" },
];

function typeLabel(path: ArchivePath) {
  if (path === "bans") return "Ban";
  if (path === "warns") return "Verwarnung";
  return "Support-Anfrage";
}

function archiveTime(item: ModItem) {
  return item.archivedAt || item.updatedAt || item.ts || 0;
}

export function Archive({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const bans = useLive<ModItem>("bans");
  const warns = useLive<ModItem>("warns");
  const help = useLive<ModItem>("helpRequests");
  const [filter, setFilter] = useState<ArchiveFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const rows = useMemo<ArchiveRow[]>(
    () => [
      ...entries(bans).map(([key, item]) => ({ path: "bans" as const, key, item })),
      ...entries(warns).map(([key, item]) => ({ path: "warns" as const, key, item })),
      ...entries(help).map(([key, item]) => ({ path: "helpRequests" as const, key, item })),
    ]
      .filter((row) => row.item.archived)
      .sort((first, second) => sort === "newest"
        ? archiveTime(second.item) - archiveTime(first.item)
        : archiveTime(first.item) - archiveTime(second.item)),
    [bans, help, sort, warns],
  );
  const counts: Record<ArchiveFilter, number> = {
    all: rows.length,
    bans: rows.filter((row) => row.path === "bans").length,
    warns: rows.filter((row) => row.path === "warns").length,
    helpRequests: rows.filter((row) => row.path === "helpRequests").length,
  };
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visible = rows.filter((row) => {
    if (filter !== "all" && row.path !== filter) return false;
    if (!normalizedQuery) return true;
    const searchable = [
      typeLabel(row.path),
      row.item.name,
      row.item.by,
      row.item.topic,
      row.item.ticketCode,
      row.item.reason,
      row.item.msg,
      row.item.text,
      row.item.archiveReason,
      row.item.archivedBy,
    ].filter(Boolean).join(" ").toLocaleLowerCase();
    return searchable.includes(normalizedQuery);
  });

  return (
    <div className="space-y-4">
      <section className="card card-still space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-faint">Moderation &amp; Support</p>
            <h2 className="mt-1 text-xl font-semibold">Archiv</h2>
            <p className="mt-1 text-sm text-muted">Finde abgeschlossene oder entfernte Einträge nach Typ, Name oder Inhalt.</p>
          </div>
          <span className="rounded-full border border-line px-3 py-1 text-sm text-muted">
            {rows.length} {rows.length === 1 ? "archivierter Eintrag" : "archivierte Einträge"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Archiv nach Eintragstyp filtern">
          {ARCHIVE_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              className={filter === value ? "btn-brand px-3" : "btn-ghost px-3"}
              onClick={() => setFilter(value)}
            >
              {label} <span className="ml-1 text-xs opacity-70">{counts[value]}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.4fr)]">
          <label className="block text-sm font-medium">
            Archiv durchsuchen
            <input
              className="field mt-1"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Spieler, Ticketnummer, Grund oder Inhalt"
            />
          </label>
          <label className="block text-sm font-medium">
            Sortieren
            <select className="field mt-1" value={sort} onChange={(event) => setSort(event.target.value === "oldest" ? "oldest" : "newest")}>
              <option value="newest">Zuletzt archiviert</option>
              <option value="oldest">Älteste zuerst</option>
            </select>
          </label>
        </div>
        <p className="text-xs text-faint">{visible.length} von {rows.length} Einträgen angezeigt</p>
      </section>

      {visible.length ? (
        <ul className="grid gap-3 xl:grid-cols-2">
          {visible.map((row) => {
            const title = row.item.topic || row.item.name || row.item.by || "Archiv-Eintrag";
            const content = row.item.reason || row.item.msg || row.item.text || "Keine weiteren Details gespeichert.";
            const archivedAt = archiveTime(row.item);
            return (
              <li key={row.path + row.key} className="card card-still p-4 sm:p-5">
                <article className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full border border-line px-2.5 py-1 text-xs font-semibold text-muted">{typeLabel(row.path)}</span>
                    {archivedAt ? <time className="text-xs text-faint">Archiviert {formatWhen(archivedAt)}</time> : <span className="text-xs text-faint">Archivdatum unbekannt</span>}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{title}</h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted line-clamp-3">{content}</p>
                  </div>
                  <dl className="grid gap-2 border-t border-line pt-3 text-xs sm:grid-cols-2">
                    <div>
                      <dt className="text-faint">{row.path === "helpRequests" ? "Spieler" : "Minecraft-Name"}</dt>
                      <dd className="mt-0.5 font-medium text-ice">
                        {row.path === "helpRequests" ? row.item.by || "Unbekannt" : row.item.name || "Unbekannt"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-faint">Archiviert durch</dt>
                      <dd className="mt-0.5 font-medium text-ice">{row.item.archivedBy || "Unbekannt"}</dd>
                    </div>
                    {row.item.ticketCode ? (
                      <div className="sm:col-span-2">
                        <dt className="text-faint">Ticketnummer</dt>
                        <dd className="mt-0.5 break-all font-mono">{row.item.ticketCode}</dd>
                      </div>
                    ) : null}
                  </dl>
                  {row.item.archiveReason ? (
                    <p className="rounded-md bg-bg px-3 py-2 text-xs">
                      <span className="font-semibold">Archivgrund:</span> {row.item.archiveReason}
                    </p>
                  ) : null}
                  {user.role === "owner" ? (
                    <div className="border-t border-line pt-3">
                      <button
                        type="button"
                        className="btn-ghost px-3"
                        onClick={() => void wipe(row.path, row.key, note, row.path === "helpRequests" ? row.item.ticketCode : undefined)}
                      >
                        Endgültig löschen
                      </button>
                    </div>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="card card-still p-6 text-center">
          <h3 className="font-semibold">{rows.length ? "Keine passenden Einträge" : "Das Archiv ist leer"}</h3>
          <p className="mt-1 text-sm text-muted">
            {rows.length ? "Ändere die Suche oder den Eintragstyp, um archivierte Inhalte zu finden." : "Archivierte Bans, Warnungen und Support-Anfragen erscheinen hier."}
          </p>
          {rows.length && (query || filter !== "all") ? (
            <button type="button" className="btn-ghost mt-3" onClick={() => { setQuery(""); setFilter("all"); }}>
              Filter zurücksetzen
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

