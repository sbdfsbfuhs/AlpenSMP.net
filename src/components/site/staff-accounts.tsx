import { useState } from "react";
import { useLive } from "@/components/site/staff-live";
import {
  createStaffAccount,
  entries,
  fbUpdate,
  formatWhen,
  removeStaffAccount,
  resetStaffPassword,
  setStaffEmail,
  setStaffPaused,
  setStaffRole,
  type ModItem,
  type StaffSession,
} from "@/lib/alpen/staff";

export function Accounts({ note, actor }: { note: (text: string) => void; actor: StaffSession }) {
  const users = useLive<{ role?: string; mustChangePw?: boolean; uid?: string; disabled?: boolean; lastLogin?: number }>("staffUsers");
  const presence = useLive<{ lastSeen?: number }>("presence");
  const logs = useLive<{ by?: string; action?: string; detail?: string; ts?: number }>("staffLog");
  const bans = useLive<ModItem>("bans");
  const warns = useLive<ModItem>("warns");
  const notes = useLive<ModItem>("notes");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("helper");
  const [formError, setFormError] = useState("");

  return (
    <div className="space-y-4">
      <form
        className="card card-still p-5"
        onSubmit={(event) => {
          event.preventDefault();
          setFormError("");
          if (actor.role !== "owner") return setFormError("Nur der Owner vergibt Rollen");
          void createStaffAccount({ username, email, role, createdBy: actor.username })
            .then(() => {
              setUsername("");
              setEmail("");
              setFormError("");
              note("Account angelegt. Passwort-Link an die persönliche E-Mail-Adresse gesendet.");
            })
            .catch((err) => setFormError(err instanceof Error ? err.message : "Anlegen fehlgeschlagen"));
        }}
      >
        <h2 className="text-lg font-semibold">Account anlegen</h2>
        <p className="mt-2 text-sm text-muted">Teamname und persönliche E-Mail-Adresse sind erforderlich. Die Person meldet sich mit ihrer E-Mail-Adresse an und erhält einen sicheren Link, um ihr Passwort selbst festzulegen. E-Mail-Adressen werden nicht öffentlich über Teamnamen aufgelöst.</p>
        <input className="field mt-3" placeholder="Name im Team" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="off" />
        <input className="field mt-2" type="email" placeholder="Persönliche E-Mail-Adresse" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
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
          <h2 className="text-lg font-semibold">Interne Daten</h2>
          <p className="mt-2 text-sm text-muted">Migrierte Teamdaten werden über den Sicherheits-Server gelesen und gespeichert. Firebase bleibt für Konten sowie Status- und Notfalldaten; die ursprünglichen Firebase-Daten werden nicht automatisch gelöscht.</p>
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

function StreamerAccount({ note, actor }: { note: (text: string) => void; actor: StaffSession }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [notify, setNotify] = useState(true);
  const [error, setError] = useState("");
  if (actor.role !== "owner") return null;
  return (
    <form
      className="card card-still p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        void createStaffAccount({ username, email, role: "streamer", createdBy: actor.username })
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
      <h2 className="text-lg font-semibold">Streamer-Account anlegen</h2>
      <p className="mt-2 text-sm text-muted">Die Rolle ist fest Streamer. Die Person sieht danach nur den Tab „Mein Stream“ und meldet sich mit ihrer E-Mail-Adresse an. Der Passwort-Link wird dorthin gesendet.</p>
      <input className="field mt-3" placeholder="Name" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="off" />
      <input className="field mt-2" type="email" placeholder="Persönliche E-Mail-Adresse" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
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
  item: { role?: string; email?: string; mustChangePw?: boolean; uid?: string; disabled?: boolean; lastLogin?: number };
  actor: StaffSession;
  note: (text: string) => void;
  lastSeen?: number;
  events: { ts: number; text: string }[];
}) {
  const mine = name === actor.username;
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(item.role || "helper");
  const [email, setEmail] = useState(item.email || "");

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
            E-Mail {item.email || "nicht hinterlegt"} ·{" "}
            Login {formatWhen(item.lastLogin) || "noch nie"}
            {lastSeen ? ` · zuletzt da ${formatWhen(lastSeen)}` : ""}
            {!item.uid ? " · Account noch nicht vollständig eingerichtet" : ""}
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
            <input className="field" type="email" placeholder="Persönliche E-Mail-Adresse" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <button
              type="button"
              className="btn-ghost"
              onClick={() =>
                void setStaffEmail(name, email, actor.username)
                  .then(() => {
                    note(email.trim().toLowerCase() === item.email?.trim().toLowerCase() ? "Passwort-Link gesendet" : "E-Mail gespeichert. Passwort-Link wurde gesendet.");
                  })
                  .catch((err) => note(err instanceof Error ? err.message : "E-Mail konnte nicht gespeichert werden"))
              }
            >
              E-Mail speichern & Passwort-Link senden
            </button>
          </div>
          {item.email ? (
            <button type="button" className="btn-brand" onClick={() => void resetStaffPassword(name, actor.username).then(() => note("Falls die Adresse zum Account gehört, wurde ein Passwort-Link gesendet.")).catch((err) => note(err instanceof Error ? err.message : "Passwort-Link konnte nicht gesendet werden"))}>
              Passwort-Link erneut senden
            </button>
          ) : null}
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
