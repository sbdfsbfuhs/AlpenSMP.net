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

function dateInZurich() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Zurich",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  return `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}-${parts.find((part) => part.type === "day")?.value}`;
}

function dateOffset(date: string, days: number) {
  const result = new Date(`${date}T00:00:00.000Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

function activityWeekStart() {
  const today = dateInZurich();
  const day = new Date(`${today}T00:00:00.000Z`).getUTCDay();
  return dateOffset(today, -((day + 6) % 7));
}

function websiteWeekStart() {
  const today = new Date().toISOString().slice(0, 10);
  const day = new Date(`${today}T00:00:00.000Z`).getUTCDay();
  return dateOffset(today, -((day + 6) % 7));
}

type ActivityBuckets = { daily: Record<string, number>; weekly: Record<string, number> };
type ActivityHour = { active: number; afk: number; publicMessages: number; privateCommands: number };
type MinecraftActivity = ActivityBuckets & {
  active?: ActivityBuckets;
  afk?: ActivityBuckets;
  publicMessages?: ActivityBuckets;
  privateCommands?: ActivityBuckets;
  legacy?: ActivityBuckets;
  hourly?: Record<string, Record<string, ActivityHour>>;
};
type ActivityReport = {
  ok: true;
  trackingReady?: boolean;
  minecraftNames?: Record<string, string>;
  members: Record<string, { website?: ActivityBuckets; minecraft?: MinecraftActivity }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isNumericRecord(value: unknown) {
  return isRecord(value) && Object.values(value).every((item) =>
    typeof item === "number" && Number.isFinite(item) && item >= 0);
}

function isActivityBuckets(value: unknown): value is ActivityBuckets {
  return isRecord(value) && isNumericRecord(value.daily) && isNumericRecord(value.weekly);
}

function isMinecraftActivity(value: unknown): value is MinecraftActivity {
  if (!isActivityBuckets(value)) return false;
  const game = value as Record<string, unknown>;
  if (["active", "afk", "publicMessages", "privateCommands", "legacy"].some((key) =>
    game[key] !== undefined && !isActivityBuckets(game[key]))) return false;
  if (game.hourly === undefined) return true;
  if (!isRecord(game.hourly)) return false;
  return Object.values(game.hourly).every((hours) =>
    isRecord(hours) && Object.entries(hours).every(([hour, bucket]) =>
      /^(?:0|[1-9]|1\d|2[0-3])$/.test(hour) &&
      isRecord(bucket) &&
      ["active", "afk", "publicMessages", "privateCommands"].every((key) =>
        typeof bucket[key] === "number" && Number.isFinite(bucket[key]) && bucket[key] >= 0)));
}

function isActivityReport(value: unknown): value is ActivityReport {
  if (!isRecord(value) || value.ok !== true || !isRecord(value.members)) return false;
  if ("trackingReady" in value && typeof value.trackingReady !== "boolean") return false;
  if ("minecraftNames" in value && (
    !isRecord(value.minecraftNames) ||
    !Object.values(value.minecraftNames).every((name) => typeof name === "string")
  )) return false;
  return Object.values(value.members).every((member) => {
    if (!isRecord(member)) return false;
    if (member.website !== undefined && !isActivityBuckets(member.website)) return false;
    if (member.minecraft === undefined) return true;
    return isMinecraftActivity(member.minecraft);
  });
}

function currentWeekActivity(buckets: ActivityBuckets | undefined, start: string) {
  if (!buckets) return 0;
  return Object.entries(buckets.daily).reduce((total, [day, amount]) =>
    day >= start && Number.isFinite(amount) ? total + amount : total, 0);
}

function totalActivity(buckets: ActivityBuckets | undefined) {
  if (!buckets) return 0;
  return [...Object.values(buckets.daily), ...Object.values(buckets.weekly)]
    .reduce((total, amount) => total + amount, 0);
}

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("de-CH", {
    timeZone: "UTC",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${date}T12:00:00.000Z`));
}

function busiestHour(activity: MinecraftActivity | undefined) {
  if (!activity?.hourly) return null;
  const totals = Array.from({ length: 24 }, () => 0);
  for (const hours of Object.values(activity.hourly)) {
    for (const [hour, bucket] of Object.entries(hours)) totals[Number(hour)] += bucket.active;
  }
  const peak = Math.max(...totals);
  return peak > 0 ? totals.indexOf(peak) : null;
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

  const today = dateInZurich();
  const start = activityWeekStart();
  const siteStart = websiteWeekStart();
  const days = Math.floor(
    (Date.parse(`${today}T00:00:00.000Z`) - Date.parse(`${start}T00:00:00.000Z`)) / 86_400_000,
  ) + 1;
  const detailDates = Array.from({ length: 7 }, (_, index) => dateOffset(today, index - 6));
  return (
    <section className="card card-still space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Aktivität diese Woche</h3>
          <p className="mt-1 text-xs text-muted">
            Minecraft-Zeit wird mit AlpenAFK in aktive und AFK-Zeit getrennt. Nachrichten werden nur
            gezählt, nicht gespeichert; private Befehle sind Versuche. Minecraft-Stunden und -Tageswerte nutzen
            Europe/Zurich: täglich 30 Tage, danach Wochenwerte bis maximal ein Jahr. Historische
            Onlinezeit vor der Trennung bleibt als AFK-eingeschlossen gekennzeichnet.
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
        <p className="text-sm text-amber-200">
          Die Minecraft-Brücke oder AlpenAFK-Statusverbindung ist noch nicht bereit. Neue aktive/AFK-Werte
          erscheinen, sobald die aktualisierte Bridge läuft.
        </p>
      ) : null}
      {!loading && people.length === 0 ? <p className="text-sm text-muted">Keine aktiven Staff-Konten.</p> : null}
      {!loading && people.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="py-2 pr-3">Mitglied</th>
                <th className="py-2 pr-3">Website</th>
                <th className="py-2 pr-3">Minecraft aktiv</th>
                <th className="py-2 pr-3">AFK</th>
                <th className="py-2 pr-3">Öffentlich</th>
                <th className="py-2 pr-3">Private Befehle*</th>
                <th className="py-2 pr-3">Aktiv gesamt</th>
                <th className="py-2">Ø/Tag</th>
              </tr>
            </thead>
            <tbody>
              {people.map(({ username, label }) => {
                const siteMember = website?.members[username];
                const gameMember = minecraft?.members[username];
                const game = gameMember?.minecraft;
                const siteSeconds = currentWeekActivity(siteMember?.website, siteStart);
                const siteReady = Boolean(siteMember);
                const gameReady = Boolean(gameMember && minecraft?.trackingReady);
                const metricsReady = Boolean(gameReady && game?.active && game.afk);
                const activeSeconds = currentWeekActivity(game?.active, start);
                const afkSeconds = currentWeekActivity(game?.afk, start);
                const totalActive = siteSeconds + activeSeconds;
                const complete = siteReady && metricsReady;
                return (
                  <tr key={username} className="border-t border-white/10">
                    <th scope="row" className="py-2 pr-3 font-medium">
                      {label}
                      {minecraft?.minecraftNames?.[username] ? (
                        <span className="block text-xs font-normal text-muted">
                          Minecraft: {minecraft.minecraftNames[username]}
                        </span>
                      ) : null}
                      {totalActivity(game?.legacy) > 0 ? (
                        <span className="block text-xs font-normal text-amber-200">
                          Historisch inkl. AFK: {durationLabel(totalActivity(game?.legacy))}
                        </span>
                      ) : null}
                    </th>
                    <td className="py-2 pr-3">{siteReady ? durationLabel(siteSeconds) : "Nicht erfasst"}</td>
                    <td className="py-2 pr-3">{metricsReady ? durationLabel(activeSeconds) : "—"}</td>
                    <td className="py-2 pr-3">{metricsReady ? durationLabel(afkSeconds) : "—"}</td>
                    <td className="py-2 pr-3">
                      {gameReady ? currentWeekActivity(game?.publicMessages, start).toLocaleString("de-CH") : "—"}
                    </td>
                    <td className="py-2 pr-3">
                      {gameReady ? currentWeekActivity(game?.privateCommands, start).toLocaleString("de-CH") : "—"}
                    </td>
                    <td className="py-2 pr-3">{complete ? durationLabel(totalActive) : "Unvollständig"}</td>
                    <td className="py-2">{complete ? `${Math.round(totalActive / days / 60)} min` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-muted">* Verwendete private Nachrichten-Befehle, keine bestätigten Zustellungen.</p>
        </div>
      ) : null}
      {!loading && people.length > 0 ? (
        <div className="space-y-2">
          {people.map(({ username, label }) => {
            const game = minecraft?.members[username]?.minecraft;
            const peakHour = busiestHour(game);
            const detailsReady = Boolean(minecraft?.trackingReady && game?.active && game.afk);
            const messagesReady = Boolean(minecraft?.trackingReady && game?.publicMessages && game.privateCommands);
            return (
              <details key={`${username}-activity`} className="rounded-lg border border-white/10 px-3 py-2">
                <summary className="cursor-pointer text-sm font-medium">
                  Tagesdetails: {label} (letzte 7 Tage)
                </summary>
                <p className="mt-2 text-xs text-muted">
                  Aktivste Stunde der letzten 30 Tage: {peakHour === null ? "noch keine aktiven Werte" : `${String(peakHour).padStart(2, "0")}:00–${String((peakHour + 1) % 24).padStart(2, "0")}:00 Uhr`}
                </p>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left text-xs">
                    <thead className="text-muted">
                      <tr>
                        <th className="py-1 pr-3">Tag</th>
                        <th className="py-1 pr-3">Aktiv</th>
                        <th className="py-1 pr-3">AFK</th>
                        <th className="py-1 pr-3">Öffentlich</th>
                        <th className="py-1 pr-3">Private Befehle*</th>
                        <th className="py-1">Alt: inkl. AFK</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailDates.map((date) => (
                        <tr key={date} className="border-t border-white/10">
                          <th scope="row" className="py-1 pr-3 font-medium">{dateLabel(date)}</th>
                          <td className="py-1 pr-3">{detailsReady ? durationLabel(game?.active?.daily[date] || 0) : "—"}</td>
                          <td className="py-1 pr-3">{detailsReady ? durationLabel(game?.afk?.daily[date] || 0) : "—"}</td>
                          <td className="py-1 pr-3">{messagesReady ? (game?.publicMessages?.daily[date] || 0).toLocaleString("de-CH") : "—"}</td>
                          <td className="py-1 pr-3">{messagesReady ? (game?.privateCommands?.daily[date] || 0).toLocaleString("de-CH") : "—"}</td>
                          <td className="py-1">{game?.legacy?.daily[date] ? durationLabel(game.legacy.daily[date]) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            );
          })}
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
  const hasBuildmanager = people.some(([, item]) => asRole(item.role) === "buildmanager");
  const buildmanagerRank = rank.get("buildmanager") ?? ROLES.length;
  const nextRoleIndex = people.findIndex(
    ([, item]) => (rank.get(asRole(item.role)) ?? ROLES.length) > buildmanagerRank,
  );
  const buildmanagerInsertIndex = nextRoleIndex < 0 ? people.length : nextRoleIndex;
  const emptyBuildmanagerSection = (
    <section className="py-2" aria-label="Buildmanager">
      <h3 className="text-sm font-semibold text-muted">Buildmanager</h3>
      <p className="card card-still mt-2 p-4 text-sm text-muted">Noch keine Buildmanager im Team.</p>
    </section>
  );
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
            {!hasBuildmanager && index === buildmanagerInsertIndex ? emptyBuildmanagerSection : null}
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
      {!hasBuildmanager && buildmanagerInsertIndex === people.length ? emptyBuildmanagerSection : null}
    </div>
  );
}

