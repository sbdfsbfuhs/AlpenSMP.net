import { useEffect, useState } from "react";
import { useLive } from "@/components/site/staff-live";
import { Neu } from "@/components/site/staff-shared";
import { ensureIdToken } from "@/lib/alpen/fb-auth";
import { asRole, roleLabel, ROLES } from "@/lib/alpen/roles";
import { securityJson } from "@/lib/alpen/security";
import { SITE } from "@/lib/alpen/site";
import {
  entries,
  fbUpdate,
  formatWhen,
  isStaffProfileColor,
  lateDays,
  type ModItem,
} from "@/lib/alpen/staff";

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

function activityWeekStart() {
  const date = new Date();
  const day = (date.getUTCDay() + 6) % 7;
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - day);
  return date.getTime();
}

type ActivityBuckets = { daily: Record<string, number>; weekly: Record<string, number> };
type ActivityReport = {
  ok: true;
  trackingReady?: boolean;
  minecraftNames?: Record<string, string>;
  members: Record<string, { website?: ActivityBuckets; minecraft?: ActivityBuckets }>;
};

function isActivityReport(value: unknown): value is ActivityReport {
  if (!value || typeof value !== "object" || !("ok" in value) || value.ok !== true || !("members" in value)) return false;
  const members = value.members;
  if (!members || typeof members !== "object" || Array.isArray(members)) return false;
  if ("minecraftNames" in value && (
    !value.minecraftNames ||
    typeof value.minecraftNames !== "object" ||
    Array.isArray(value.minecraftNames) ||
    !Object.values(value.minecraftNames).every((name) => typeof name === "string")
  )) return false;
  return Object.values(members).every((member) => {
    if (!member || typeof member !== "object") return false;
    return ["website", "minecraft"].every((source) => {
      const buckets = (member as Record<string, unknown>)[source];
      return buckets === undefined || (
        buckets !== null &&
        typeof buckets === "object" &&
        "daily" in buckets &&
        "weekly" in buckets &&
        buckets.daily !== null &&
        typeof buckets.daily === "object" &&
        !Array.isArray(buckets.daily) &&
        buckets.weekly !== null &&
        typeof buckets.weekly === "object" &&
        !Array.isArray(buckets.weekly)
      );
    });
  });
}

function currentWeekActivity(buckets: ActivityBuckets | undefined, start: string) {
  if (!buckets) return 0;
  return Object.entries(buckets.daily).reduce((total, [day, seconds]) =>
    day >= start && Number.isFinite(seconds) ? total + seconds : total, 0);
}

function durationLabel(seconds: number) {
  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours ? `${hours} h ${remainingMinutes} min` : `${minutes} min`;
}

function StaffActivityStats({
  people,
}: {
  people: Array<{ username: string; label: string }>;
}) {
  const [website, setWebsite] = useState<ActivityReport | null>(null);
  const [minecraft, setMinecraft] = useState<ActivityReport | null>(null);
  const [errors, setErrors] = useState<{ website?: string; minecraft?: string }>({});
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setErrors({});
      setWebsite(null);
      setMinecraft(null);
      const results = await Promise.allSettled([
        securityJson<unknown>("/api/staff-activity/weekly"),
        (async () => {
          const token = await ensureIdToken();
          if (!token) throw new Error("Bitte melde dich erneut an.");
          const response = await fetch(`${SITE.panelControlApi}/api/minecraft/staff-activity`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: AbortSignal.timeout(8000),
          });
          if (!response.ok) throw new Error(`Anfrage fehlgeschlagen (${response.status}).`);
          return response.json() as Promise<unknown>;
        })(),
      ]);
      if (!active) return;
      const nextErrors: { website?: string; minecraft?: string } = {};
      if (results[0].status === "fulfilled" && isActivityReport(results[0].value)) {
        setWebsite(results[0].value);
      } else {
        setWebsite(null);
        nextErrors.website = results[0].status === "rejected"
          ? results[0].reason instanceof Error ? results[0].reason.message : "Nicht verfügbar."
          : "Antwort des Sicherheitsdienstes ist ungültig.";
      }
      if (results[1].status === "fulfilled" && isActivityReport(results[1].value)) {
        setMinecraft(results[1].value);
      } else {
        setMinecraft(null);
        nextErrors.minecraft = results[1].status === "rejected"
          ? results[1].reason instanceof Error ? results[1].reason.message : "Nicht verfügbar."
          : "Antwort des Minecraft-Panels ist ungültig.";
      }
      setErrors(nextErrors);
      setLoading(false);
    };
    void load();
    return () => { active = false; };
  }, [refreshKey]);

  useEffect(() => {
    const timer = window.setInterval(() => setRefreshKey((value) => value + 1), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const start = new Date(activityWeekStart()).toISOString().slice(0, 10);
  const days = Math.max(1, Math.floor((Date.now() - activityWeekStart()) / 86_400_000) + 1);
  return (
    <section className="card card-still space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
        <h3 className="font-semibold">Aktivität diese Woche</h3>
        <p className="mt-1 text-xs text-muted">
          Website-Zeit zählt sichtbare Nutzung mit kürzlicher Eingabe; Minecraft-Zeit misst die Serververbindung, nicht AFK- oder Spielaktionen.
          Tageswerte: 30 Tage, danach Wochenwerte bis maximal ein Jahr. Die Historie beginnt erst ab Aktivierung.
        </p>
        </div>
        <button type="button" className="btn-ghost shrink-0" onClick={() => setRefreshKey((value) => value + 1)} disabled={loading}>
          {loading ? "Lade…" : "Aktualisieren"}
        </button>
      </div>
      {loading ? <p className="text-sm text-muted">Aktivitätsdaten werden geladen…</p> : null}
      {errors.website ? <p className="text-sm text-red-300" role="alert">Website: {errors.website}</p> : null}
      {errors.minecraft ? <p className="text-sm text-red-300" role="alert">Minecraft: {errors.minecraft}</p> : null}
      {!loading && minecraft?.trackingReady === false && !errors.minecraft ? (
        <p className="text-sm text-amber-200">Die Minecraft-Brücke hat die aktuelle Zustimmungs-Zuordnung noch nicht geladen. Aktualisiere nach etwa einer Minute.</p>
      ) : null}
      {!loading && people.length === 0 ? <p className="text-sm text-muted">Keine aktiven Staff-Konten.</p> : null}
      {!loading && people.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="py-2 pr-3">Mitglied</th>
                <th className="py-2 pr-3">Website</th>
                <th className="py-2 pr-3">Minecraft</th>
                <th className="py-2 pr-3">Gesamt</th>
                <th className="py-2">Ø pro Tag</th>
              </tr>
            </thead>
            <tbody>
              {people.map(({ username, label }) => {
                const siteMember = website?.members[username];
                const gameMember = minecraft?.members[username];
                const siteSeconds = currentWeekActivity(siteMember?.website, start);
                const gameSeconds = currentWeekActivity(gameMember?.minecraft, start);
                const siteReady = Boolean(siteMember);
                const gameReady = Boolean(gameMember && minecraft?.trackingReady);
                const complete = siteReady && gameReady;
                return (
                  <tr key={username} className="border-t border-white/10">
                    <th scope="row" className="py-2 pr-3 font-medium">
                      {label}
                      {minecraft?.minecraftNames?.[username] ? (
                        <span className="block text-xs font-normal text-muted">
                          Minecraft: {minecraft.minecraftNames[username]}
                        </span>
                      ) : null}
                    </th>
                    <td className="py-2 pr-3">{siteReady ? durationLabel(siteSeconds) : "Nicht erfasst"}</td>
                    <td className="py-2 pr-3">{gameReady ? durationLabel(gameSeconds) : minecraft?.trackingReady ? "Nicht erfasst" : "—"}</td>
                    <td className="py-2 pr-3">{complete ? durationLabel(siteSeconds + gameSeconds) : "Unvollständig"}</td>
                    <td className="py-2">{complete ? `${Math.round((siteSeconds + gameSeconds) / days / 60)} min` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

export function Roster({ owner, note }: { owner: boolean; note: (text: string) => void }) {
  const users = useLive<{
    role?: string;
    disabled?: boolean;
    lateDays?: number;
    displayName?: string;
    profileColor?: string;
  }>("staffDirectory");
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
      {owner ? (
        <>
          <WeekStats />
          <StaffActivityStats
            people={people
              .filter(([, item]) => !item.disabled)
              .map(([username, item]) => ({ username, label: item.displayName || username }))}
          />
        </>
      ) : null}
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
                <span
                  className="mr-2 inline-grid size-7 place-items-center rounded-full text-xs font-bold text-white"
                  style={{
                    backgroundColor: isStaffProfileColor(item.profileColor)
                      ? item.profileColor
                      : "#e1062c",
                  }}
                  aria-hidden="true"
                >
                  {(item.displayName || name).slice(0, 1).toUpperCase()}
                </span>
                {item.displayName || name}
                {item.displayName ? ` · @${name}` : ""}
                {" · "}
                {roleLabel(role)}
                {item.disabled ? " · pausiert" : ""}
                {absent
                  ? " · abwesend"
                  : online
                    ? " · online"
                    : seen
                      ? ` · vor ${Math.max(1, Math.floor(days))} Tag${Math.floor(days) === 1 ? "" : "en"} · ${formatWhen(seen)}`
                      : " · noch nie online"}
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
                      void fbUpdate(`staffUsers/${name}`, { lateDays: next })
                        .then(() => fbUpdate(`staffDirectory/${name}`, { lateDays: next }))
                        .then(() => note("Abwesenheitsschwelle gespeichert"))
                        .catch((error) =>
                          note(error instanceof Error ? error.message : "Speichern fehlgeschlagen"),
                        );
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

