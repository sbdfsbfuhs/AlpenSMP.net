import { useLive } from "@/components/site/staff-live";
import { Neu } from "@/components/site/staff-shared";
import { asRole, roleLabel, ROLES } from "@/lib/alpen/roles";
import { entries, fbUpdate, lateDays, type ModItem } from "@/lib/alpen/staff";

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
  const users = useLive<{ role?: string; disabled?: boolean; lateDays?: number }>("staffUsers");
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
  const rank = new Map(ROLES.map((role, index) => [role, index]));
  const people = entries(users).sort((a, b) => {
    const left = rank.get(asRole(a[1].role)) ?? ROLES.length;
    const right = rank.get(asRole(b[1].role)) ?? ROLES.length;
    if (left !== right) return left - right;
    return a[0].localeCompare(b[0], "de");
  });
  const late = people.filter(([name, item]) => {
    if (item.disabled || away.has(name)) return false;
    const seen = presence[name]?.lastSeen || 0;
    const limit = lateDays(item.lateDays);
    return !seen || now - seen > limit * 86_400_000;
  });

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Team</h2>
      <p className="text-sm text-muted">
        Standard sind 3 Tage, bis eine Karte rot wird. Abwesenheiten zählen nicht.
        {owner ? " Die Zahl stellst du pro Account ein." : ""}
      </p>
      {late.length ? (
        <p className="rounded-md border border-red-500 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          Nicht online und nicht abwesend: {late.map(([name]) => name).join(", ")}
        </p>
      ) : null}
      {owner ? <WeekStats /> : null}
      {people.map(([name, item], index) => {
        const role = asRole(item.role);
        const previous = index > 0 ? asRole(people[index - 1][1].role) : "";
        const seen = presence[name]?.lastSeen || 0;
        const writing = presence[name]?.writingAt || 0;
        const online = now - seen < 45_000;
        const typing = now - writing < 8_000;
        const absent = away.has(name);
        const limit = lateDays(item.lateDays);
        const days = seen ? (now - seen) / 86_400_000 : limit;
        const ratio = days / limit;
        const tone = item.disabled
          ? "border-red-500 bg-red-950/40"
          : absent
            ? "border-sky-700"
            : ratio < 0.34
              ? "border-emerald-500"
              : ratio < 0.67
                ? "border-lime-600"
                : ratio < 1
                  ? "border-amber-500 bg-amber-950/30"
                  : "border-red-600 bg-red-950/50";
        const open = entries(tasks).filter(([, task]) => {
          if (task.status === "archived" || task.done) return false;
          return task.acceptedBy === name || task.assignee === name;
        });
        const overdue = !absent && !item.disabled && days >= limit;
        return (
          <div key={name}>
            {role !== previous ? <h3 className="pt-2 text-sm font-semibold text-muted">{roleLabel(role)}</h3> : null}
            <article className={`card card-still mt-2 border-2 p-4 text-sm ${tone}`}>
              <p className={`font-semibold${overdue ? " text-red-200" : ""}`}>
                <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${online ? "bg-emerald-400" : "bg-zinc-500"}`} />
                {name} · {roleLabel(role)}
                {item.disabled ? " · pausiert" : ""}
                {absent ? " · abwesend" : online ? " · online" : seen ? ` · vor ${Math.max(1, Math.floor(days))} Tag${Math.floor(days) === 1 ? "" : "en"}` : " · noch nie online"}
                {typing ? " · schreibt" : ""}
              </p>
              {owner ? (
                <label className="mt-2 flex items-center gap-2 text-xs text-muted">
                  Rot nach
                  <input
                    className="field w-16 py-1"
                    type="number"
                    min={1}
                    max={30}
                    defaultValue={limit}
                    key={`${name}-${limit}`}
                    onBlur={(event) => {
                      const next = lateDays(event.target.value);
                      event.target.value = String(next);
                      if (next === limit) return;
                      void fbUpdate(`staffUsers/${name}`, { lateDays: next });
                    }}
                  />
                  Tagen
                </label>
              ) : (
                <p className="mt-1 text-xs text-faint">Rot nach {limit} Tagen</p>
              )}
              {open.length ? (
                <ul className="mt-2 space-y-1 text-muted">
                  {open.map(([key, task]) => (
                    <li key={key}>{task.title}<Neu ts={task.ts} updatedAt={task.updatedAt} /></li>
                  ))}
                </ul>
              ) : <p className="mt-1 text-muted">Keine offene Aufgabe</p>}
            </article>
          </div>
        );
      })}
    </div>
  );
}

