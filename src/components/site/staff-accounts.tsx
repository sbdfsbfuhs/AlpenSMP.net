import { useEffect, useState } from "react";
import { useLive } from "@/components/site/staff-live";
import {
  createStaffAccount,
  entries,
  fbGet,
  fbSet,
  fbUpdate,
  formatWhen,
  removeStaffAccount,
  resetStaffPassword,
  setStaffPaused,
  setStaffRole,
  type ModItem,
  type StaffSession,
} from "@/lib/alpen/staff";
import { relay } from "@/lib/alpen/security";

export function Accounts({ note, actor }: { note: (text: string) => void; actor: StaffSession }) {
  const users = useLive<{ role?: string; mustChangePw?: boolean; uid?: string; disabled?: boolean; lastLogin?: number }>("staffUsers");
  const presence = useLive<{ lastSeen?: number }>("presence");
  const logs = useLive<{ by?: string; action?: string; detail?: string; ts?: number }>("staffLog");
  const bans = useLive<ModItem>("bans");
  const warns = useLive<ModItem>("warns");
  const notes = useLive<ModItem>("notes");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("helper");
  const [formError, setFormError] = useState("");
  const [copying, setCopying] = useState(false);
  const [copyResult, setCopyResult] = useState("");

  useEffect(() => {
    if (actor.role !== "owner") return;
    for (const [name, item] of entries(users)) {
      if (!item.uid) void fbSet(`staffOpen/${name}`, { open: true, role: item.role || "helper" }).catch(() => undefined);
    }
  }, [users, actor.role]);

  return (
    <div className="space-y-4">
      <form
        className="card card-still p-5"
        onSubmit={(event) => {
          event.preventDefault();
          setFormError("");
          if (actor.role !== "owner") return setFormError("Nur der Owner vergibt Rollen");
          void createStaffAccount({ username, password, role, createdBy: actor.username })
            .then(() => {
              setUsername("");
              setPassword("");
              setFormError("");
              note("Account angelegt. Die Person meldet sich mit dem Namen an.");
            })
            .catch((err) => setFormError(err instanceof Error ? err.message : "Anlegen fehlgeschlagen"));
        }}
      >
        <h2 className="text-lg font-semibold">Account anlegen</h2>
        <p className="mt-2 text-sm text-muted">Nur Team-Name und Startpasswort. Keine private E-Mail. Ein gesetztes Passwort kann später niemand ansehen, auch du nicht. Du siehst es nur, während du es eintippst.</p>
        <input className="field mt-3" placeholder="Name im Team" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="field mt-2" type="text" placeholder="Startpasswort" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        <select className="field mt-2" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="helper">Helper</option>
          <option value="supporter">Supporter</option>
          <option value="builder">Builder</option>
          <option value="streamer">Streamer</option>
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
        </select>
        {formError ? <p className="mt-3 text-sm text-ember">{formError}</p> : null}
        <button className="btn-brand mt-3" type="submit">Anlegen</button>
      </form>
      {actor.role === "owner" ? (
        <section className="card card-still p-5">
          <h2 className="text-lg font-semibold">Interne Daten übernehmen</h2>
          <p className="mt-2 text-sm text-muted">Kopiert Bans, Verwarnungen, Notizen, Tickets, Hilfe, Commands, Aufgaben, Abwesenheiten, interne Regeln, Einstellungen und Live auf den neuen Server. Firebase bleibt als Reserve. Einmal drücken, während du angemeldet bist.</p>
          <button
            type="button"
            className="btn-brand mt-3"
            disabled={copying}
            onClick={() => {
              setCopying(true);
              setCopyResult("");
              void copyInternal()
                .then((text) => setCopyResult(text))
                .catch((err) => setCopyResult(err instanceof Error ? err.message : "Kopieren fehlgeschlagen"))
                .finally(() => setCopying(false));
            }}
          >
            {copying ? "Kopiere…" : "Jetzt kopieren"}
          </button>
          {copyResult ? <p className="mt-3 text-sm text-muted">{copyResult}</p> : null}
        </section>
      ) : null}
      <StreamerAccount note={note} actor={actor} />
      <ul className="space-y-3">
        {entries(users).map(([name, item]) => (
          <AccountCard
            key={name}
            name={name}
            item={item}
            actor={actor}
            note={note}
            lastSeen={presence[name]?.lastSeen}
            events={[
              ...entries(logs)
                .filter(([, row]) => row.by === name)
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
            ].sort((a, b) => b.ts - a.ts).slice(0, 40)}
          />
        ))}
      </ul>
    </div>
  );
}

const COPY_ROOTS: [string, string][] = [
  ["bans", "Bans"],
  ["warns", "Verwarnungen"],
  ["notes", "Notizen"],
  ["helpRequests", "Hilfe"],
  ["tickets", "Tickets"],
  ["commands", "Commands"],
  ["banGuide", "Bann-Leitfaden"],
  ["tasks", "Aufgaben"],
  ["absences", "Abwesenheiten"],
  ["rulesStaff", "Interne Regeln"],
  ["guideTopics", "Guide"],
  ["site_copy", "Texte"],
  ["site_settings", "Einstellungen"],
  ["live_streams", "Live"],
];

const KEY = /^[A-Za-z0-9_-]{1,80}$/;

async function putTree(path: string, value: unknown, depth: number): Promise<{ ok: number; fail: number }> {
  if (value == null || depth > 6) return { ok: 0, fail: value == null ? 0 : 1 };
  const json = JSON.stringify(value);
  if (json.length <= 30000) {
    const saved = await relay(path, "PUT", value);
    return saved.handled ? { ok: 1, fail: 0 } : { ok: 0, fail: 1 };
  }
  if (typeof value !== "object" || Array.isArray(value)) return { ok: 0, fail: 1 };
  let ok = 0;
  let fail = 0;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (!KEY.test(key)) {
      fail += 1;
      continue;
    }
    const part = await putTree(`${path}/${key}`, child, depth + 1);
    ok += part.ok;
    fail += part.fail;
  }
  return { ok, fail };
}

async function copyInternal() {
  const lines: string[] = [];
  for (const [path, label] of COPY_ROOTS) {
    const data = await fbGet<unknown>(path).catch(() => null);
    if (data == null) {
      lines.push(`${label}: leer`);
      continue;
    }
    const result = await putTree(path, data, 1);
    lines.push(`${label}: ${result.ok} gespeichert${result.fail ? `, ${result.fail} nicht` : ""}`);
  }
  return lines.join(" · ");
}

function StreamerAccount({ note, actor }: { note: (text: string) => void; actor: StaffSession }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notify, setNotify] = useState(true);
  const [error, setError] = useState("");
  if (actor.role !== "owner") return null;
  return (
    <form
      className="card card-still p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        void createStaffAccount({ username, password, role: "streamer", createdBy: actor.username })
          .then(async () => {
            const name = username.trim().toLowerCase().replace(/\s+/g, "");
            try {
              await fbUpdate(`staffUsers/${name}`, { notifyLive: notify });
            } catch {
              /* Hinweis-Flag ist optional, der Account steht. */
            }
            setUsername("");
            setPassword("");
            note("Streamer-Account angelegt");
          })
          .catch((err) => setError(err instanceof Error ? err.message : "Anlegen fehlgeschlagen"));
      }}
    >
      <h2 className="text-lg font-semibold">Streamer-Account anlegen</h2>
      <p className="mt-2 text-sm text-muted">Die Rolle ist fest Streamer. Die Person sieht danach nur den Tab „Mein Stream“.</p>
      <input className="field mt-3" placeholder="Name" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input className="field mt-2" type="text" placeholder="Startpasswort" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
        Hinweis im Staff-Center, wenn der Stream live geht
      </label>
      {error ? <p className="mt-3 text-sm text-ember">{error}</p> : null}
      <button className="btn-brand mt-3" type="submit">Account anlegen</button>
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
  item: { role?: string; mustChangePw?: boolean; uid?: string; disabled?: boolean; lastLogin?: number };
  actor: StaffSession;
  note: (text: string) => void;
  lastSeen?: number;
  events: { ts: number; text: string }[];
}) {
  const mine = name === actor.username;
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(item.role || "helper");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(true);

  return (
    <li className={`card card-still p-4 text-sm${item.disabled ? " border border-red-500 bg-red-950/40" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={`font-semibold${item.disabled ? " text-red-300" : ""}`}>
            {name} · {item.role || "helper"}
            {item.disabled ? " · pausiert" : ""}
            {item.mustChangePw ? " · muss Passwort ändern" : ""}
          </p>
          <p className="mt-1 text-muted">
            Login {formatWhen(item.lastLogin) || "noch nie"}
            {lastSeen ? ` · zuletzt da ${formatWhen(lastSeen)}` : ""}
            {!item.uid ? " · noch kein Passwort, setzt es beim nächsten Login" : ""}
          </p>
        </div>
        <button type="button" className="btn-ghost" onClick={() => setOpen((value) => !value)}>
          {open ? "Zuklappen" : "Aktivität"}
        </button>
      </div>
      {actor.role === "owner" && !mine ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="flex gap-2">
            <select className="field" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="helper">Helper</option>
              <option value="supporter">Supporter</option>
              <option value="builder">Builder</option>
              <option value="streamer">Streamer</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
            <button type="button" className="btn-ghost" onClick={() => {
              if (role === "owner" && !window.confirm("Diese Person wird Owner und darf alles.")) return;
              void setStaffRole(name, role, actor.username).then(() => note("Rolle gespeichert")).catch((err) => note(err instanceof Error ? err.message : "Fehlgeschlagen"));
            }}>
              Rolle
            </button>
          </div>
          <div className="flex gap-2">
            <input className="field" type={showPw ? "text" : "password"} placeholder="Neues Passwort" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="btn-ghost" onClick={() => setShowPw((value) => !value)}>{showPw ? "Verbergen" : "Ansehen"}</button>
            <button
              type="button"
              className="btn-brand"
              onClick={() =>
                void resetStaffPassword(name, password, actor.username)
                  .then(() => {
                    note("Neues Passwort gilt. Einmal weitergeben, danach nicht mehr sichtbar.");
                    setPassword("");
                  })
                  .catch((err) => note(err instanceof Error ? err.message : "Reset fehlgeschlagen"))
              }
            >
              Reset
            </button>
          </div>
          <button type="button" className="btn-ghost" onClick={() => void setStaffPaused(name, !item.disabled, actor.username).then(() => note(item.disabled ? "Account frei" : "Account pausiert")).catch((err) => note(err instanceof Error ? err.message : "Fehlgeschlagen"))}>
            {item.disabled ? "Freigeben" : "Pausieren"}
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() =>
              window.confirm("Account löschen? Gespeicherte Bans bleiben.") &&
              void removeStaffAccount(name, actor.username).then(() => note("Account gelöscht")).catch((err) => note(err instanceof Error ? err.message : "Löschen fehlgeschlagen"))
            }
          >
            Löschen
          </button>
        </div>
      ) : null}
      {open ? (
        <ul className="mt-4 space-y-2 border-t border-white/10 pt-3">
          {events.length ? events.map((event, index) => (
            <li key={`${event.ts}-${index}`} className="text-muted">
              <span className="text-fg">{formatWhen(event.ts)}</span> · {event.text}
            </li>
          )) : <li className="text-muted">Noch keine Aktivität</li>}
        </ul>
      ) : null}
    </li>
  );
}
