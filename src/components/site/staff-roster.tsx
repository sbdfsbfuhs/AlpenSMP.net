import { useLive } from "@/components/site/staff-live";
import { Neu } from "@/components/site/staff-shared";
import { entries, type ModItem } from "@/lib/alpen/staff";

function WeekStats() {
  const bans = useLive<ModItem>("bans");
  const warns = useLive<ModItem>("warns");
  const help = useLive<ModItem>("helpRequests");
  const start = weekStart();
  const names = new Map<string, { bans: number; warns: number; help: number }>();
  const bump = (name: string | undefined, key: "bans" | "warns" | "help") => {
    if (!name) return;
    const row = names.get(name) ?? { bans: 0, warns: 0, help: 0 };
    row[key] += 1;
    names.set(name, row);
  };
  for (const item of Object.values(bans)) if ((item.ts || 0) >= start) bump(item.by, "bans");
  for (const item of Object.values(warns)) if ((item.ts || 0) >= start) bump(item.by, "warns");
  for (const item of Object.values(help)) if (item.status === "erledigt" && (item.updatedAt || 0) >= start) bump(item.doneBy, "help");
  const rows = [...names.entries()].sort((a, b) => b[1].bans + b[1].warns + b[1].help - (a[1].bans + a[1].warns + a[1].help));
  return (
    <section className="card card-still p-4 text-sm">
      <h3 className="font-semibold">Diese Woche, nur für dich</h3>
      {rows.length ? (
        <ul className="mt-2 space-y-1">
          {rows.map(([name, row]) => (
            <li key={name}>{name}: {row.bans} Bans · {row.warns} Warnungen · {row.help} Hilfe erledigt</li>
          ))}
        </ul>
      ) : <p className="mt-2 text-muted">Diese Woche noch nichts</p>}
    </section>
  );
}

function weekStart() {
  const date = new Date();
  const day = (date.getDay() + 6) % 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day);
  return date.getTime();
}

export function Roster({ owner }: { owner: boolean }) {
  const users = useLive<{ role?: string; disabled?: boolean }>("staffUsers");
  const presence = useLive<{ lastSeen?: number; writingAt?: number }>("presence");
  const tasks = useLive<{ title?: string; assignee?: string; by?: string; acceptedBy?: string; status?: string; done?: boolean; ts?: number; updatedAt?: number }>("tasks");
  const absences = useLive<{ by?: string; from?: string; until?: string }>("absences");
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  const away = new Set(
    entries(absences)
      .filter(([, item]) => item.from && item.until && item.from <= today && today <= item.until)
      .map(([, item]) => item.by || ""),
  );
  const late = entries(users).filter(([name, item]) => {
    if (item.disabled || away.has(name)) return false;
    const seen = presence[name]?.lastSeen || 0;
    return !seen || now - seen > 3 * 86_400_000;
  });

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Team</h2>
      <p className="text-sm text-muted">Mindestens alle 3 Tage reinschauen, ausser es gibt eine Abwesenheit. Je länger jemand fehlt, desto röter wird die Karte.</p>
      {late.length ? (
        <p className="rounded-md border border-red-500 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          Nicht online und nicht abwesend: {late.map(([name]) => name).join(", ")}
        </p>
      ) : null}
      {owner ? <WeekStats /> : null}
      {entries(users).map(([name, item]) => {
        const seen = presence[name]?.lastSeen || 0;
        const writing = presence[name]?.writingAt || 0;
        const online = now - seen < 45_000;
        const typing = now - writing < 8_000;
        const absent = away.has(name);
        const days = seen ? (now - seen) / 86_400_000 : 99;
        const tone = item.disabled
          ? "border-red-500 bg-red-950/40"
          : absent
            ? "border-sky-700"
            : days < 1
              ? "border-emerald-500"
              : days < 2
                ? "border-lime-600"
                : days < 3
                  ? "border-amber-500 bg-amber-950/30"
                  : "border-red-600 bg-red-950/50";
        const open = entries(tasks).filter(([, task]) => {
          if (task.status === "archived" || task.done) return false;
          return task.acceptedBy === name || task.assignee === name;
        });
        return (
          <article key={name} className={`card card-still border-2 p-4 text-sm ${tone}`}>
            <p className={`font-semibold${days >= 3 && !absent ? " text-red-200" : ""}`}>
              <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${online ? "bg-emerald-400" : "bg-zinc-500"}`} />
              {name} · {item.role || "helper"}
              {item.disabled ? " · pausiert" : ""}
              {absent ? " · abwesend" : online ? " · online" : seen ? ` · vor ${Math.max(1, Math.floor(days))} Tag${Math.floor(days) === 1 ? "" : "en"}` : " · noch nie online"}
              {typing ? " · schreibt" : ""}
            </p>
            {open.length ? (
              <ul className="mt-2 space-y-1 text-muted">
                {open.map(([key, task]) => (
                  <li key={key}>{task.title}<Neu ts={task.ts} updatedAt={task.updatedAt} /></li>
                ))}
              </ul>
            ) : <p className="mt-1 text-muted">Keine offene Aufgabe</p>}
          </article>
        );
      })}
    </div>
  );
}

