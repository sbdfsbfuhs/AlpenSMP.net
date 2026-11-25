import { useEffect, useState } from "react";
import { useLive } from "@/components/site/staff-live";
import {
  createStaffAccount,
  entries,
  fbGet,
  fbUpdate,
  formatWhen,
  removeStaffAccount,
  resetStaffPassword,
  setStaffEmail,
  setStaffPaused,
  setStaffRole,
  syncMinecraftStaffActivity,
  syncStaffDirectory,
  type ModItem,
  type StaffSession,
} from "@/lib/alpen/staff";

const BUILDER_DIRECTORY_QUERY = { orderBy: "role", equalTo: "builder" } as const;

function useBuilderPresence(names: string[]) {
  const key = names.join("\u0000");
  const [presence, setPresence] = useState<Record<string, { lastSeen?: number }>>({});

  useEffect(() => {
    let stop = false;
    const usernames = key ? key.split("\u0000") : [];
    if (!usernames.length) {
      setPresence({});
      return () => {
        stop = true;
      };
    }

    void Promise.all(
      usernames.map(async (name) => [name, await fbGet<{ lastSeen?: number }>(`presence/${name}`)] as const),
    )
      .then((rows) => {
        if (!stop) setPresence(Object.fromEntries(rows.map(([name, value]) => [name, value ?? {}])));
      })
      .catch((error: unknown) => {
        if (stop) return;
        const code = "LIVE-BUILDER-PRESENCE-001";
        console.error(`[Staff Center] ${code}: Builder-Präsenz konnte nicht geladen werden.`, error);
        window.dispatchEvent(new CustomEvent("staff-live:error", {
          detail: {
            code,
            message: error instanceof Error ? error.message : "Unbekannter Fehler",
          },
        }));
      });

    return () => {
      stop = true;
    };
  }, [key]);

  return presence;
}

export function Accounts({ note, actor }: { note: (text: string) => void; actor: StaffSession }) {
  const users = useLive<{ role?: string; email?: string; mustChangePw?: boolean; uid?: string; disabled?: boolean; lastLogin?: number }>(
    "staffUsers",
    true,
    actor.role === "buildmanager" ? BUILDER_DIRECTORY_QUERY : undefined,
  );
  const builderPresence = useBuilderPresence(actor.role === "buildmanager" ? Object.keys(users) : []);
  const allPresence = useLive<{ lastSeen?: number }>("presence", actor.role !== "buildmanager");
  const presence = actor.role === "buildmanager" ? builderPresence : allPresence;
  const logs = useLive<{ by?: string; target?: string; action?: string; detail?: string; ts?: number }>("staffLog");
  const bans = useLive<ModItem>("bans", actor.role !== "buildmanager");
  const warns = useLive<ModItem>("warns", actor.role !== "buildmanager");
  const notes = useLive<ModItem>("notes", actor.role !== "buildmanager");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("helper");
  const [formError, setFormError] = useState("");
  const [syncingDirectory, setSyncingDirectory] = useState(false);
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState<"all" | "active" | "paused">("all");
  const accountRows = entries(users).sort(([first], [second]) => first.localeCompare(second, "de"));
  const activeCount = accountRows.filter(([, item]) => !item.disabled).length;
  const pausedCount = accountRows.length - activeCount;
  const query = search.trim().toLocaleLowerCase("de");
  const filteredAccounts = accountRows.filter(([name, item]) => {
    const matchesQuery = !query ||
      `${name} ${item.email || ""} ${item.role || ""}`.toLocaleLowerCase("de").includes(query);
    const matchesFilter = accountFilter === "all" ||
      (accountFilter === "paused" ? item.disabled === true : item.disabled !== true);
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="space-y-4">
      <section className="card card-still space-y-4 p-4 sm:p-5" aria-labelledby="accounts-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="accounts-heading" className="text-lg font-semibold">Teamkonten</h2>
            <p className="mt-1 text-sm text-muted">Finde ein Konto über Name, E-Mail oder Rolle und öffne nur die benötigten Details.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-line px-2.5 py-1">{accountRows.length} Konten</span>
            <span className="rounded-full border border-line px-2.5 py-1">{activeCount} freigegeben</span>
            <span className="rounded-full border border-line px-2.5 py-1">{pausedCount} pausiert</span>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <label className="block text-sm font-medium">
            Konten durchsuchen
            <input
              className="field mt-1"
              type="search"
              placeholder="Teamname, E-Mail oder Rolle"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Konten filtern">
            {([
              ["all", `Alle (${accountRows.length})`],
              ["active", `Freigegeben (${activeCount})`],
              ["paused", `Pausiert (${pausedCount})`],
            ] as const).map(([filter, label]) => (
              <button
                key={filter}
                type="button"
                className={accountFilter === filter ? "btn-brand px-3" : "btn-ghost px-3"}
                aria-pressed={accountFilter === filter}
                onClick={() => setAccountFilter(filter)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {actor.role === "owner" || actor.role === "buildmanager" ? (
        <section className="space-y-2" aria-label="Weitere Account-Verwaltung">
          <details className="card card-still overflow-hidden">
            <summary className="cursor-pointer p-4">
              <span className="block font-semibold">Team-Account anlegen</span>
              <span className="mt-1 block text-sm text-muted">Teamname, persönliche E-Mail-Adresse und Rolle festlegen.</span>
            </summary>
            <form
              className="space-y-4 border-t border-line p-4 sm:p-5"
              onSubmit={(event) => {
                event.preventDefault();
                setFormError("");
                void createStaffAccount({
                  username,
                  email,
                  role: actor.role === "buildmanager" ? "builder" : role,
                  createdBy: actor.username,
                  actorRole: actor.role,
                })
                  .then(() => {
                    setUsername("");
                    setEmail("");
                    setFormError("");
                    note("Account angelegt. Passwort-Link an die persönliche E-Mail-Adresse gesendet.");
                  })
                  .catch((err) => setFormError(err instanceof Error ? err.message : "Anlegen fehlgeschlagen"));
              }}
            >
              <p className="text-sm text-muted">
                Die Person legt ihr Passwort über einen sicheren Link selbst fest. E-Mail-Adressen werden nicht öffentlich über Teamnamen aufgelöst.
              </p>
              <label className="block text-sm font-medium">
                Teamname
                <input className="field mt-1" placeholder="Name im Team" value={username} onChange={(event) => setUsername(event.target.value)} required autoComplete="off" />
              </label>
              <label className="block text-sm font-medium">
                Persönliche E-Mail-Adresse
                <input className="field mt-1" type="email" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
              </label>
              {actor.role === "owner" ? (
                <label className="block text-sm font-medium">
                  Rolle
                  <select className="field mt-1" value={role} onChange={(event) => setRole(event.target.value)}>
                    <option value="helper">Helper</option>
                    <option value="supporter">Supporter</option>
                    <option value="builder">Builder</option>
                    <option value="buildmanager">Buildmanager</option>
                    <option value="streamer">Streamer</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>
                </label>
              ) : (
                <p className="rounded-md border border-line p-3 text-sm text-muted">Rolle: Builder. Buildmanager können ausschließlich Builder-Konten anlegen.</p>
              )}
              {formError ? <p className="text-sm text-ember" role="alert">{formError}</p> : null}
              <button className="btn-brand w-full sm:w-auto" type="submit">Team-Account anlegen</button>
            </form>
          </details>
          <details className="card card-still overflow-hidden">
            <summary className="cursor-pointer p-4">
              <span className="block font-semibold">Streamer-Account anlegen</span>
              <span className="mt-1 block text-sm text-muted">Spezialkonto für den Tab „Mein Stream“.</span>
            </summary>
            <div className="border-t border-line">
              <StreamerAccount note={note} actor={actor} />
            </div>
          </details>
          <details className="card card-still overflow-hidden">
            <summary className="cursor-pointer p-4">
              <span className="block font-semibold">Teamverzeichnis synchronisieren</span>
              <span className="mt-1 block text-sm text-muted">Selten benötigte interne Synchronisierung.</span>
            </summary>
            <div className="space-y-3 border-t border-line p-4 sm:p-5">
              <p className="text-sm text-muted">
                Übernimmt Teamname, Rolle, Pausenstatus und Abwesenheitsschwelle. E-Mail-Adressen bleiben geschützt; vorhandene Einträge werden nicht gelöscht.
              </p>
              <button
                type="button"
                className="btn-ghost"
                disabled={syncingDirectory}
                onClick={() => {
                  setSyncingDirectory(true);
                  void syncStaffDirectory(actor)
                    .then((count) => note(`Teamverzeichnis aktualisiert (${count} Konten).`))
                    .catch((error) =>
                      note(error instanceof Error ? error.message : "Teamverzeichnis konnte nicht synchronisiert werden."),
                    )
                    .finally(() => setSyncingDirectory(false));
                }}
              >
                {syncingDirectory ? "Synchronisiere …" : "Teamverzeichnis jetzt synchronisieren"}
              </button>
            </div>
          </details>
        </section>
      ) : null}

      {filteredAccounts.length ? (
        <ul className="space-y-3">
          {filteredAccounts.map(([name, item]) => (
            <AccountCard
              key={name}
              name={name}
              item={item}
              actor={actor}
              note={note}
              lastSeen={presence[name]?.lastSeen}
              events={[
                ...entries(logs)
                  .filter(([, row]) => row.by === name || row.target === name)
                  .map(([, row]) => ({ ts: row.ts || 0, text: `${row.action || "Aktion"}${row.detail ? ` · ${row.detail}` : ""}` })),
                ...entries(bans)
                  .filter(([, row]) => row.by === name)
                  .map(([, row]) => ({ ts: row.ts || 0, text: `Ban · ${row.name || ""} · ${row.reason || ""}` })),
                ...entries(warns)
                  .filter(([, row]) => row.by === name)
                  .map(([, row]) => ({ ts: row.ts || 0, text: `Warnung · ${row.name || ""} · ${row.reason || ""}` })),
                ...entries(notes)
                  .filter(([, row]) => row.by === name)
                  .map(([, row]) => ({ ts: row.ts || 0, text: `Notiz · ${row.text || ""}` })),
              ].sort((first, second) => second.ts - first.ts).slice(0, 40)}
            />
          ))}
        </ul>
      ) : (
        <p className="card card-still p-5 text-sm text-muted">
          {accountRows.length ? "Keine Konten passen zu Suche und Filter." : "Noch keine Teamkonten vorhanden."}
        </p>
      )}
    </div>
  );
}

function StreamerAccount({ note, actor }: { note: (text: string) => void; actor: StaffSession }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [notify, setNotify] = useState(true);
  const [error, setError] = useState("");
  if (actor.role !== "owner") return null;
  return (
    <form
      className="space-y-4 p-4 sm:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        void createStaffAccount({ username, email, role: "streamer", createdBy: actor.username, actorRole: actor.role })
          .then(async () => {
            const name = username.trim().toLowerCase().replace(/\s+/g, "");
            try {
              await fbUpdate(`staffUsers/${name}`, { notifyLive: notify });
            } catch {
              /* Hinweis-Flag ist optional, der Account steht. */
            }
            setUsername("");
            setEmail("");
            note("Streamer-Account angelegt. Passwort-Link wurde versendet.");
          })
          .catch((err) => setError(err instanceof Error ? err.message : "Anlegen fehlgeschlagen"));
      }}
    >
      <p className="text-sm text-muted">
        Die Rolle ist fest auf Streamer gesetzt. Die Person sieht nur „Mein Stream“ und erhält den Passwort-Link per E-Mail.
      </p>
      <label className="block text-sm font-medium">
        Teamname
        <input className="field mt-1" placeholder="Name im Team" value={username} onChange={(event) => setUsername(event.target.value)} required autoComplete="off" />
      </label>
      <label className="block text-sm font-medium">
        Persönliche E-Mail-Adresse
        <input className="field mt-1" type="email" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input className="mt-1" type="checkbox" checked={notify} onChange={(event) => setNotify(event.target.checked)} />
        <span>Hinweis im Staff-Center erhalten, wenn der Stream live geht</span>
      </label>
      {error ? <p className="text-sm text-ember" role="alert">{error}</p> : null}
      <button className="btn-brand w-full sm:w-auto" type="submit">Streamer-Account anlegen</button>
    </form>
  );
}

function AccountCard({
  name,
  item,
  actor,
  note,
  lastSeen,
  events,
}: {
  name: string;
  item: { role?: string; email?: string; mustChangePw?: boolean; uid?: string; disabled?: boolean; lastLogin?: number };
  actor: StaffSession;
  note: (text: string) => void;
  lastSeen?: number;
  events: { ts: number; text: string }[];
}) {
  const mine = name === actor.username;
  const [open, setOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [role, setRole] = useState(item.role || "helper");
  const [email, setEmail] = useState(item.email || "");
  const canManage = !mine && (
    actor.role === "owner" ||
    (actor.role === "buildmanager" && item.role === "builder")
  );

  async function changePausedState() {
    try {
      await setStaffPaused(name, !item.disabled, actor.username, actor.role);
    } catch (error) {
      note(error instanceof Error ? error.message : "Pausenstatus konnte nicht gespeichert werden.");
      return;
    }
    try {
      await syncMinecraftStaffActivity();
      note(item.disabled ? "Account frei; Minecraft-Zuordnung synchronisiert." : "Account pausiert; Minecraft-Zuordnung entfernt.");
    } catch (error) {
      note(`Accountstatus gespeichert, aber Minecraft-Zuordnung nicht synchronisiert: ${error instanceof Error ? error.message : "unbekannter Fehler"}`);
    }
  }

  async function deleteAccount() {
    if (!window.confirm("Account löschen? Gespeicherte Bans bleiben.")) return;
    try {
      await removeStaffAccount(name, actor.username, actor.role);
    } catch (error) {
      note(error instanceof Error ? error.message : "Löschen fehlgeschlagen.");
      return;
    }
    try {
      await syncMinecraftStaffActivity();
      note("Account gelöscht; Minecraft-Zuordnung synchronisiert.");
    } catch (error) {
      note(`Account gelöscht, aber Minecraft-Zuordnung nicht synchronisiert: ${error instanceof Error ? error.message : "unbekannter Fehler"}`);
    }
  }

  return (
    <li className={`card card-still p-4 text-sm${item.disabled ? " border border-red-500 bg-red-950/40" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`font-semibold${item.disabled ? " text-red-300" : ""}`}>{name}</h3>
            <span className="rounded-full border border-line px-2 py-0.5 text-xs capitalize">{item.role || "helper"}</span>
            {item.disabled ? <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-300">Pausiert</span> : null}
            {item.mustChangePw ? <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-200">Passwort ändern</span> : null}
            {!item.uid ? <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-200">Einrichtung offen</span> : null}
          </div>
          <p className="mt-1 break-all text-muted">{item.email || "Keine E-Mail-Adresse hinterlegt"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-ghost"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Aktivität ausblenden" : "Aktivität anzeigen"}
          </button>
          {canManage ? (
            <button
              type="button"
              className="btn-ghost"
              aria-expanded={manageOpen}
              onClick={() => setManageOpen((value) => !value)}
            >
              {manageOpen ? "Verwaltung schließen" : "Verwalten"}
            </button>
          ) : null}
        </div>
      </div>
      {manageOpen && canManage ? (
        <section className="mt-4 space-y-4 border-t border-line pt-4" aria-label={`${name} verwalten`}>
          <h4 className="font-semibold">Account bearbeiten</h4>
          <div className="grid gap-3 lg:grid-cols-2">
            {actor.role === "owner" ? (
              <div className="space-y-3 rounded-lg border border-line p-3">
              <h5 className="font-medium">Rolle</h5>
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <select className="field" aria-label={`Rolle für ${name}`} value={role} onChange={(event) => setRole(event.target.value)}>
                  <option value="helper">Helper</option>
                  <option value="supporter">Supporter</option>
                  <option value="builder">Builder</option>
                  <option value="buildmanager">Buildmanager</option>
                  <option value="streamer">Streamer</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
                <button type="button" className="btn-ghost" onClick={() => {
                  if (role === "owner" && !window.confirm("Diese Person wird Owner und darf alles.")) return;
                  void setStaffRole(name, role, actor.username, actor.role).then(async () => {
                    try {
                      await syncMinecraftStaffActivity();
                      note("Rolle gespeichert; Minecraft-Zuordnung synchronisiert.");
                    } catch (error) {
                      note(`Rolle gespeichert, aber Minecraft-Zuordnung nicht synchronisiert: ${error instanceof Error ? error.message : "unbekannter Fehler"}`);
                    }
                  }).catch((err) => note(err instanceof Error ? err.message : "Fehlgeschlagen"));
                }}>
                  Rolle speichern
                </button>
              </div>
            </div>
            ) : null}
            <div className="space-y-3 rounded-lg border border-line p-3">
              <h5 className="font-medium">E-Mail und Zugang</h5>
              <label className="block text-sm font-medium">
                Persönliche E-Mail-Adresse
                <input className="field mt-1" type="email" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
              </label>
              <button
                type="button"
                className="btn-ghost w-full"
                onClick={() =>
                  void setStaffEmail(name, email, actor.username, actor.role)
                    .then(() => {
                      note(email.trim().toLowerCase() === item.email?.trim().toLowerCase() ? "Passwort-Link gesendet" : "E-Mail gespeichert. Passwort-Link wurde gesendet.");
                    })
                    .catch((err) => note(err instanceof Error ? err.message : "E-Mail konnte nicht gespeichert werden"))
                }
              >
                E-Mail speichern und Passwort-Link senden
              </button>
              {item.email ? (
                <button type="button" className="btn-ghost w-full" onClick={() => void resetStaffPassword(name, actor.username, actor.role).then(() => note("Falls die Adresse zum Account gehört, wurde ein Passwort-Link gesendet.")).catch((err) => note(err instanceof Error ? err.message : "Passwort-Link konnte nicht gesendet werden"))}>
                  Passwort-Link erneut senden
                </button>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
            <span className="mr-1 text-sm font-medium">Kontozugriff</span>
            <button type="button" className="btn-ghost" onClick={() => void changePausedState()}>
              {item.disabled ? "Konto freigeben" : "Konto pausieren"}
            </button>
            <button type="button" className="btn-ghost text-red-300" onClick={() => void deleteAccount()}>
              Account löschen
            </button>
          </div>
        </section>
      ) : null}
      {open ? (
        <section className="mt-4 space-y-3 border-t border-line pt-4" aria-label={`Aktivität von ${name}`}>
          <h4 className="font-semibold">Aktivität</h4>
          <dl className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-md border border-line p-3">
              <dt className="text-xs text-muted">Letzter Login</dt>
              <dd className="mt-1 font-medium">{formatWhen(item.lastLogin) || "Noch nie"}</dd>
            </div>
            <div className="rounded-md border border-line p-3">
              <dt className="text-xs text-muted">Zuletzt gesehen</dt>
              <dd className="mt-1 font-medium">{formatWhen(lastSeen) || "Noch nicht"}</dd>
            </div>
          </dl>
          <ul className="space-y-2">
            {events.length ? events.map((event, index) => (
              <li key={`${event.ts}-${index}`} className="rounded-md border border-line p-3 text-muted">
                <span className="text-fg">{formatWhen(event.ts)}</span> · {event.text}
              </li>
            )) : <li className="text-muted">Noch keine weiteren Aktivitäten</li>}
          </ul>
        </section>
      ) : null}
    </li>
  );
}
