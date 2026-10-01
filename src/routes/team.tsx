import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { PageHero, Shell } from "@/components/site/shell";
import { SiteMascot } from "@/components/site/assistant";
import { AbsenceBoard, BanGuideEditor, GuideEditor, LockdownTexts, MascotDesk, PlayerCommandEditor, RulesEditor, TasksBoard } from "@/components/site/staff-extra";
import { can, roleLabel, ROLES, asRole, type Role } from "@/lib/alpen/roles";
import {
  entries,
  fbGet,
  fbPush,
  fbRemove,
  fbSet,
  fbUpdate,
  formatRemaining,
  formatWhen,
  loginStaff,
  parseDuration,
  readSession,
  writeSession,
  type CommandItem,
  type CommunityItem,
  type ModItem,
  type StaffSession,
} from "@/lib/alpen/staff";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Staff-Center · AlpenSMP" },
      { name: "description", content: "Interner Bereich für Moderation, Commands, Hilfe und Freigaben." },
    ],
  }),
  component: StaffPage,
});

type Tab = "moderation" | "help" | "commands" | "community" | "rules" | "ban" | "tasks" | "absence" | "guide" | "mascot" | "settings" | "website" | "archive" | "users";
type Filter = "active" | "expired" | "archived" | "all";

const TABS: { id: Tab; label: string; area: "moderation" | "help" | "commandsRead" | "community" | "rulesRead" | "banGuide" | "tasks" | "absence" | "guide" | "mascot" | "settings" | "website" | "archive" | "roles" }[] = [
  { id: "moderation", label: "Moderation", area: "moderation" },
  { id: "help", label: "Hilfe", area: "help" },
  { id: "commands", label: "Commands", area: "commandsRead" },
  { id: "community", label: "Community", area: "community" },
  { id: "rules", label: "Regeln", area: "rulesRead" },
  { id: "ban", label: "Ban-Leitfaden", area: "banGuide" },
  { id: "tasks", label: "Aufgaben", area: "tasks" },
  { id: "absence", label: "Abwesenheit", area: "absence" },
  { id: "guide", label: "Guide", area: "guide" },
  { id: "mascot", label: "Maskottchen", area: "mascot" },
  { id: "settings", label: "Einstellungen", area: "settings" },
  { id: "website", label: "Website", area: "website" },
  { id: "archive", label: "Archiv", area: "archive" },
  { id: "users", label: "Accounts", area: "roles" },
];

function StaffPage() {
  const [user, setUser] = useState<StaffSession | null>(null);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setUser(readSession());
    setReady(true);
  }, []);

  function note(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2400);
  }

  function logout() {
    if (user) void fbRemove(`presence/${user.username}`);
    writeSession(null);
    setUser(null);
  }

  return (
    <Shell>
      <PageHero
        kicker="Nur fürs Team"
        title="Staff-Center"
        lede="Moderation, Hilfe, Commands und Freigaben. Dieselben Daten wie bisher – in der neuen Oberfläche."
      />
      <SiteMascot bias="sit" align="end" line="Öffentliche Fragen beantworte ich auf den anderen Seiten." />
      <div className="shell py-10">
        {!ready ? <p className="text-muted">Lade Zugang…</p> : null}
        {ready && !user ? <Login onIn={setUser} /> : null}
        {user?.mustChangePw ? (
          <ForcePassword user={user} onDone={setUser} note={note} />
        ) : user ? (
          <Desk user={user} onLogout={logout} note={note} />
        ) : null}
        {toast ? <p className="panel-in fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md bg-gold px-4 py-2 text-sm text-fg">{toast}</p> : null}
      </div>
    </Shell>
  );
}

function Login({ onIn }: { onIn: (user: StaffSession) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const session = await loginStaff(username, password);
      writeSession(session);
      await fbSet(`presence/${session.username}`, { username: session.username, role: session.role, online: true, lastSeen: Date.now() });
      onIn(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Zugang ungültig");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card card-still panel-in mx-auto max-w-md p-6" onSubmit={submit}>
      <h2 className="text-xl font-semibold">Anmelden</h2>
      <p className="mt-2 text-sm text-muted">Owner- und Team-Accounts vom bisherigen Staff-Bereich.</p>
      <label className="mt-5 block text-sm">
        Name
        <input className="field mt-1" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
      </label>
      <label className="mt-3 block text-sm">
        Passwort
        <input className="field mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      </label>
      {error ? <p className="mt-3 text-sm text-ember">{error}</p> : null}
      <button className="btn-gold mt-5 w-full" type="submit" disabled={busy}>
        {busy ? "Prüfe…" : "Rein"}
      </button>
    </form>
  );
}

function ForcePassword({ user, onDone, note }: { user: StaffSession; onDone: (user: StaffSession) => void; note: (text: string) => void }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    if (a.length < 4) return note("Min. 4 Zeichen");
    if (a !== b) return note("Stimmt nicht überein");
    await fbUpdate(`staffUsers/${user.username}`, { password: a, mustChangePw: false });
    const next = { ...user, mustChangePw: false };
    writeSession(next);
    onDone(next);
    note("Passwort gespeichert");
  }

  return (
    <form className="card card-still mx-auto max-w-md p-6" onSubmit={save}>
      <h2 className="text-xl font-semibold">Neues Passwort</h2>
      <input className="field mt-4" type="password" value={a} onChange={(e) => setA(e.target.value)} placeholder="Neues Passwort" />
      <input className="field mt-3" type="password" value={b} onChange={(e) => setB(e.target.value)} placeholder="Wiederholen" />
      <button className="btn-gold mt-4" type="submit">Speichern</button>
    </form>
  );
}

function Desk({ user, onLogout, note }: { user: StaffSession; onLogout: () => void; note: (text: string) => void }) {
  const real = user.role;
  const [view, setView] = useState<Role>(asRole(user.role));
  const shown = (can(real, "roles") || real === "admin" ? view : user.role) as string;
  const tabs = TABS.filter((item) => {
    if (item.id === "commands") return can(shown, "commandsRead") || can(shown, "staffCommands");
    if (item.id === "rules") return can(shown, "rulesRead") || can(shown, "rulesEdit");
    return can(shown, item.area);
  });
  const [tab, setTab] = useState<Tab>(tabs[0]?.id ?? "settings");
  const safeTab = tabs.some((item) => item.id === tab) ? tab : tabs[0]?.id;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Angemeldet als <span className="text-fg">{user.username}</span> · {roleLabel(real)}
        </p>
        <div className="flex gap-2">
          {can(shown, "help") ? (
            <button type="button" className="btn-ghost" onClick={() => void askHelp(user, note)}>
              Hilfe rufen
            </button>
          ) : null}
          <button type="button" className="btn-ghost" onClick={onLogout}>
            Abmelden
          </button>
        </div>
      </div>
      {can(real, "roles") || real === "admin" ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">Ansicht als</span>
          {ROLES.map((role) => (
            <button key={role} type="button" className={shown === role ? "btn-gold px-3" : "btn-ghost px-3"} onClick={() => setView(role)}>
              {roleLabel(role)}
            </button>
          ))}
          <span className="text-xs text-faint">Ändert nicht die echte Rolle.</span>
        </div>
      ) : null}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === safeTab ? "btn-gold shrink-0" : "btn-ghost shrink-0"}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="panel-in mt-6" key={safeTab}>
        {safeTab === "moderation" ? <Moderation user={user} note={note} /> : null}
        {safeTab === "help" ? <HelpDesk user={user} note={note} act={can(shown, "helpAct") && can(real, "helpAct")} moderate={can(shown, "moderation") && can(real, "moderation")} /> : null}
        {safeTab === "commands" ? (
          <div className="space-y-6">
            {can(shown, "commandsRead") ? <PlayerCommandEditor real={real} view={shown} note={note} /> : null}
            {can(shown, "staffCommands") ? <Commands user={user} note={note} /> : null}
          </div>
        ) : null}
        {safeTab === "community" ? <Community user={user} note={note} /> : null}
        {safeTab === "rules" ? (
          <div className="space-y-4">
            <RulesEditor real={real} view={shown} note={note} />
            {can(shown, "rulesRead") && (can(real, "rulesEdit") || can(shown, "staffCommands") || shown !== "builder") ? (
              <RulesEditor real={real} view={can(shown, "rulesEdit") ? shown : "helper"} note={note} staff />
            ) : null}
          </div>
        ) : null}
        {safeTab === "ban" ? <BanGuideEditor real={real} view={shown} note={note} /> : null}
        {safeTab === "tasks" ? <TasksBoard real={real} view={shown} note={note} username={user.username} /> : null}
        {safeTab === "absence" ? <AbsenceBoard real={real} view={shown} note={note} username={user.username} /> : null}
        {safeTab === "guide" ? <GuideEditor real={real} view={shown} note={note} /> : null}
        {safeTab === "mascot" ? <MascotDesk real={real} note={note} /> : null}
        {safeTab === "settings" ? <Settings user={user} note={note} /> : null}
        {safeTab === "website" ? (
          <div>
            <Website user={user} note={note} />
            <LockdownTexts real={real} view={shown} note={note} />
          </div>
        ) : null}
        {safeTab === "archive" ? <Archive user={user} note={note} /> : null}
        {safeTab === "users" ? <Accounts note={note} actor={user} /> : null}
      </div>
    </div>
  );
}

async function askHelp(user: StaffSession, note: (text: string) => void) {
  const msg = window.prompt("Was brauchst du?");
  if (!msg) return;
  await fbPush("helpRequests", { by: user.username, msg, ts: Date.now(), replies: {}, status: "open" });
  note("Hilfe gesendet");
}

function useLive<T>(path: string) {
  const [data, setData] = useState<Record<string, T>>({});
  useEffect(() => {
    let stop = false;
    const pull = () => {
      fbGet<Record<string, T>>(path).then((value) => {
        if (!stop) setData(value ?? {});
      }).catch(() => {});
    };
    pull();
    const id = window.setInterval(pull, 6000);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, [path]);
  return data;
}

function Moderation({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const bans = useLive<ModItem>("bans");
  const kicks = useLive<ModItem>("kicks");
  const warns = useLive<ModItem>("warns");
  const notes = useLive<ModItem>("notes");
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ModForm title="Ban" path="bans" user={user} note={note} withDuration presets={["5min", "1h", "1d", "7d", "30d", "Permanent"]} reasons={[["Griefing", "1d"], ["Beleidigung", "7d"], ["Cheating", "30d"]]} />
      <List title="Bans" path="bans" items={entries(bans)} user={user} note={note} timed />
      <ModForm title="Kick" path="kicks" user={user} note={note} withDuration />
      <List title="Kicks" path="kicks" items={entries(kicks)} user={user} note={note} timed />
      <ModForm title="Warnung" path="warns" user={user} note={note} />
      <List title="Warnungen" path="warns" items={entries(warns)} user={user} note={note} />
      <NoteForm user={user} note={note} />
      <List title="Notizen" path="notes" items={entries(notes)} user={user} note={note} notes />
    </div>
  );
}

function ModForm({
  title,
  path,
  user,
  note,
  withDuration,
  presets,
  reasons,
}: {
  title: string;
  path: string;
  user: StaffSession;
  note: (text: string) => void;
  withDuration?: boolean;
  presets?: string[];
  reasons?: [string, string][];
}) {
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState(withDuration ? "Permanent" : "");

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return note("Name fehlt");
    const body: ModItem = {
      name: name.trim(),
      reason: reason.trim() || "–",
      by: user.username,
      ts: Date.now(),
    };
    if (withDuration) {
      body.duration = duration.trim() || "Permanent";
      body.endsAt = parseDuration(body.duration);
    }
    await fbPush(path, body);
    setName("");
    setReason("");
    note(`${title} gespeichert`);
  }

  return (
    <form className="card card-still p-5" onSubmit={save}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <input className="field mt-3" placeholder="Spieler" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="field mt-2" placeholder="Grund" value={reason} onChange={(e) => setReason(e.target.value)} />
      {withDuration ? <input className="field mt-2" placeholder="Dauer" value={duration} onChange={(e) => setDuration(e.target.value)} /> : null}
      {presets ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {presets.map((item) => (
            <button key={item} type="button" className="btn-ghost px-3" onClick={() => setDuration(item)}>
              {item}
            </button>
          ))}
        </div>
      ) : null}
      {reasons ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {reasons.map(([label, dur]) => (
            <button key={label} type="button" className="btn-ghost px-3" onClick={() => { setReason(label); setDuration(dur); }}>
              {label}
            </button>
          ))}
        </div>
      ) : null}
      <button className="btn-gold mt-4" type="submit">Eintragen</button>
    </form>
  );
}

function NoteForm({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <form
      className="card card-still p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) return note("Leer");
        void fbPush("notes", { text: text.trim(), by: user.username, ts: Date.now() }).then(() => {
          setText("");
          note("Notiz gespeichert");
        });
      }}
    >
      <h2 className="text-lg font-semibold">Team-Notiz</h2>
      <textarea className="field mt-3 min-h-24" value={text} onChange={(e) => setText(e.target.value)} />
      <button className="btn-gold mt-4" type="submit">Notiz speichern</button>
    </form>
  );
}

function List({
  title,
  path,
  items,
  user,
  note,
  timed,
  notes,
}: {
  title: string;
  path: string;
  items: [string, ModItem][];
  user: StaffSession;
  note: (text: string) => void;
  timed?: boolean;
  notes?: boolean;
}) {
  const [filter, setFilter] = useState<Filter>(notes ? "all" : "active");
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    return items.filter(([, item]) => {
      const expired = Boolean(item.endsAt && item.endsAt <= Date.now());
      if (!notes) {
        if (filter === "archived") return Boolean(item.archived);
        if (filter === "expired") return !item.archived && expired;
        if (filter === "active") return !item.archived && !expired;
      }
      const blob = `${item.name || ""} ${item.reason || ""} ${item.text || ""} ${item.by || ""}`.toLowerCase();
      return blob.includes(q.trim().toLowerCase());
    });
  }, [items, filter, q, notes]);

  return (
    <section className="card card-still p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        {!notes ? (
          <div className="flex flex-wrap gap-1">
            {(["active", "expired", "archived", "all"] as Filter[]).map((item) => (
              <button key={item} type="button" className={item === filter ? "btn-gold px-3" : "btn-ghost px-3"} onClick={() => setFilter(item)}>
                {item === "active" ? "Aktiv" : item === "expired" ? "Abgelaufen" : item === "archived" ? "Archiv" : "Alle"}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <input className="field mt-3" placeholder="Suchen" value={q} onChange={(e) => setQ(e.target.value)} />
      <ul className="mt-3 max-h-80 space-y-2 overflow-auto">
        {rows.map(([key, item]) => (
          <li key={key} className="cmd-in rounded-md border border-line bg-bg px-3 py-2 text-sm">
            <p className="font-semibold">{notes ? item.text : item.name}</p>
            {!notes ? <p className="text-muted">{item.reason}</p> : null}
            <p className="text-xs text-faint">
              {timed ? formatRemaining(item.endsAt) : ""} {item.duration ? `· ${item.duration}` : ""} · {item.by} · {formatWhen(item.ts)}
            </p>
            <div className="mt-2 flex gap-2">
              {!item.archived ? (
                <button type="button" className="btn-ghost px-3" onClick={() => void archive(path, key, user, note)}>
                  Archiv
                </button>
              ) : null}
              {user.role === "owner" ? (
                <button type="button" className="btn-ghost px-3" onClick={() => void wipe(path, key, note)}>
                  Löschen
                </button>
              ) : null}
            </div>
          </li>
        ))}
        {!rows.length ? <li className="text-sm text-muted">Keine Einträge</li> : null}
      </ul>
    </section>
  );
}

async function archive(path: string, key: string, user: StaffSession, note: (text: string) => void) {
  const reason = window.prompt("Begründung") || "";
  if (user.role !== "owner" && reason.trim().length < 3) return note("Begründung Pflicht");
  await fbUpdate(`${path}/${key}`, { archived: true, archivedBy: user.username, archivedAt: Date.now(), archiveReason: reason || "Owner" });
  note("Im Archiv");
}

async function wipe(path: string, key: string, note: (text: string) => void) {
  if (!window.confirm("Endgültig löschen?")) return;
  await fbRemove(`${path}/${key}`);
  note("Gelöscht");
}

function HelpDesk({ user, note, act, moderate }: { user: StaffSession; note: (text: string) => void; act: boolean; moderate: boolean }) {
  const data = useLive<ModItem>("helpRequests");
  const rows = entries(data).filter(([, item]) => !item.archived);
  return (
    <div className="space-y-3">
      {rows.map(([key, item]) => (
        <article key={key} className="card card-still cmd-in p-5">
          <p className="font-semibold">{item.by}</p>
          <p className="mt-2 text-sm">{item.msg}</p>
          <p className="mt-1 text-xs text-faint">{formatWhen(item.ts)} {item.status ? `· ${item.status}` : ""}</p>
          <ul className="mt-3 space-y-2">
            {Object.values(item.replies ?? {}).map((reply, index) => (
              <li key={index} className="rounded-md bg-bg px-3 py-2 text-sm">
                <span className="font-semibold">{reply.by}: </span>{reply.text}
              </li>
            ))}
          </ul>
          {act ? <ReplyBox id={key} user={user} ticket={item.ticketCode} note={note} /> : null}
          {act ? (
            <button type="button" className="btn-ghost mt-3" onClick={() => void fbUpdate(`helpRequests/${key}`, { status: "erledigt" }).then(() => note("Als erledigt markiert"))}>
              Erledigt
            </button>
          ) : null}
          {moderate ? (
            <button type="button" className="btn-ghost mt-3" onClick={() => void archive("helpRequests", key, user, note)}>Archivieren</button>
          ) : null}
        </article>
      ))}
      {!rows.length ? <p className="text-muted">Keine offenen Anfragen</p> : null}
    </div>
  );
}

function ReplyBox({ id, user, ticket, note }: { id: string; user: StaffSession; ticket?: string; note: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) return;
        const payload = { by: user.username, text: text.trim(), ts: Date.now() };
        void fbPush(`helpRequests/${id}/replies`, payload).then(async () => {
          if (ticket) {
            await fbPush(`tickets/${ticket}/replies`, payload);
            await fbUpdate(`tickets/${ticket}`, { status: "beantwortet" });
          }
          setText("");
          note("Antwort gesendet");
        });
      }}
    >
      <input className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder="Antwort" />
      <button className="btn-gold" type="submit">Senden</button>
    </form>
  );
}

function Commands({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const data = useLive<CommandItem>("commands");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [editKey, setEditKey] = useState("");
  const rows = entries(data).sort((a, b) => (b[1].ts || 0) - (a[1].ts || 0));

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!can(user.role, "commandsEdit")) return note("Deine echte Rolle darf das nicht");
    if (!name.trim()) return note("Command fehlt");
    const payload = { name: name.trim(), desc: desc.trim() || "–", category: category.trim(), by: user.username, ts: Date.now() };
    if (editKey) await fbUpdate(`commands/${editKey}`, payload);
    else await fbPush("commands", payload);
    setName("");
    setDesc("");
    setCategory("");
    setEditKey("");
    note("Command gespeichert");
  }

  return (
    <div className="space-y-6">
      {can(user.role, "commandsEdit") ? (
        <form className="card card-still p-5" onSubmit={save}>
          <h2 className="text-lg font-semibold">{editKey ? "Internen Befehl ändern" : "Internen Befehl hinzufügen"}</h2>
          <input className="field mt-3" placeholder="/befehl" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="field mt-2" placeholder="Was macht er?" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <input className="field mt-2" placeholder="Kategorie, z. B. Claims" value={category} onChange={(e) => setCategory(e.target.value)} />
          <button className="btn-gold mt-4" type="submit">{editKey ? "Änderungen speichern" : "Speichern"}</button>
        </form>
      ) : null}
      <ul className="space-y-2">
        {rows.map(([key, item]) => (
          <li key={key} className="cmd-in card card-still flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold text-gold">{item.name}</p>
              <p className="text-sm text-muted">{item.desc}</p>
              <p className="text-xs text-faint">{item.category || "Allgemein"} · {item.by} · {formatWhen(item.ts)}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-ghost" onClick={() => void navigator.clipboard.writeText(`${item.name} ${item.desc}`)}>Kopieren</button>
              {can(user.role, "commandsEdit") ? (
                <>
                  <button type="button" className="btn-ghost" onClick={() => { setEditKey(key); setName(item.name || ""); setDesc(item.desc || ""); setCategory(item.category || ""); }}>Bearbeiten</button>
                  <button type="button" className="btn-ghost" onClick={() => void wipe("commands", key, note)}>Löschen</button>
                </>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Community({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const reviews = useLive<CommunityItem>("community_reviews");
  const images = useLive<CommunityItem>("community_images");
  const [filter, setFilter] = useState("open");
  return (
    <div className="space-y-8">
      <div className="flex gap-2">
        {["open", "approved", "rejected", "all"].map((item) => (
          <button key={item} type="button" className={item === filter ? "btn-gold" : "btn-ghost"} onClick={() => setFilter(item)}>
            {item === "open" ? "Offen" : item === "approved" ? "Frei" : item === "rejected" ? "Abgelehnt" : "Alle"}
          </button>
        ))}
      </div>
      <Queue title="Rezensionen" path="community_reviews" items={entries(reviews)} filter={filter} user={user} note={note} />
      <Queue title="Screenshots" path="community_images" items={entries(images)} filter={filter} user={user} note={note} shots />
    </div>
  );
}

function matches(status: string | undefined, filter: string) {
  if (filter === "all") return true;
  if (filter === "open") return status !== "approved" && status !== "rejected";
  return status === filter;
}

function Queue({
  title,
  path,
  items,
  filter,
  user,
  note,
  shots,
}: {
  title: string;
  path: string;
  items: [string, CommunityItem][];
  filter: string;
  user: StaffSession;
  note: (text: string) => void;
  shots?: boolean;
}) {
  const rows = items.filter(([, item]) => matches(item.status, filter));
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 space-y-3">
        {rows.map(([key, item]) => (
          <article key={key} className="card card-still p-4">
            <p className="font-semibold">{item.name} {item.rating ? `· ${item.rating}/5` : ""}</p>
            <p className="mt-1 text-sm text-muted">{shots ? item.caption : item.text}</p>
            {item.imageUrl ? <img src={item.imageUrl} alt="" className="mt-3 max-h-40 rounded-md object-cover" /> : null}
            <p className="mt-2 text-xs text-faint">{item.status || "offen"} · {formatWhen(item.ts)}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" className="btn-gold" onClick={() => void fbUpdate(`${path}/${key}`, { status: "approved", moderatedBy: user.username, moderatedAt: Date.now() }).then(() => note("Freigegeben"))}>Frei</button>
              <button type="button" className="btn-ghost" onClick={() => void fbUpdate(`${path}/${key}`, { status: "rejected", moderatedBy: user.username, moderatedAt: Date.now() }).then(() => note("Abgelehnt"))}>Ablehnen</button>
            </div>
          </article>
        ))}
        {!rows.length ? <p className="text-sm text-muted">Nichts in dieser Ansicht</p> : null}
      </div>
    </section>
  );
}

function Settings({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const [oldPw, setOld] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    if (a.length < 4) return note("Min. 4 Zeichen");
    if (a !== b) return note("Stimmt nicht überein");
    if (user.role === "owner" && user.username === "owner") return note("Owner-Passwort bleibt das feste Zugangspasswort");
    const row = await fbGet<{ password?: string }>(`staffUsers/${user.username}`);
    if (row?.password !== oldPw) return note("Altes Passwort falsch");
    await fbUpdate(`staffUsers/${user.username}`, { password: a, mustChangePw: false });
    note("Passwort geändert");
  }

  return (
    <form className="card card-still max-w-md p-5" onSubmit={save}>
      <h2 className="text-lg font-semibold">Passwort ändern</h2>
      <input className="field mt-3" type="password" placeholder="Altes Passwort" value={oldPw} onChange={(e) => setOld(e.target.value)} />
      <input className="field mt-2" type="password" placeholder="Neu" value={a} onChange={(e) => setA(e.target.value)} />
      <input className="field mt-2" type="password" placeholder="Wiederholen" value={b} onChange={(e) => setB(e.target.value)} />
      <button className="btn-gold mt-4" type="submit">Speichern</button>
    </form>
  );
}

function Website({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const [total, setTotal] = useState("");
  const [online, setOnline] = useState("");
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fbGet<{ total_players_ever?: number; current_players?: number }>("site_stats").then((row) => {
      if (!row) return;
      setTotal(String(row.total_players_ever ?? ""));
      setOnline(String(row.current_players ?? ""));
    }).catch(() => {});
  }, []);

  async function saveTotal(next: number) {
    await fbUpdate("site_stats", { total_players_ever: next, updated_at: Date.now(), updated_by: user.username });
    await fbSet("total_players_ever", next);
    await fbPush("site_stats_history", { t: Date.now(), n: Number(online || 0), total_players_ever: next, online_count: Number(online || 0), by: user.username });
    setTotal(String(next));
    note("Spielerzahl gespeichert");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form className="card card-still p-5" onSubmit={(e) => { e.preventDefault(); void saveTotal(Number(total)); }}>
        <h2 className="text-lg font-semibold">Spieler insgesamt</h2>
        <input className="field mt-3" value={total} onChange={(e) => setTotal(e.target.value)} />
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-gold" type="submit">Speichern</button>
          <button className="btn-ghost" type="button" onClick={() => void saveTotal(Number(total || 0) + 1)}>+1</button>
          <button className="btn-ghost" type="button" onClick={() => void saveTotal(Number(total || 0) + 5)}>+5</button>
        </div>
      </form>
      <form
        className="card card-still p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(online);
          void fbUpdate("site_stats", { current_players: n, updated_at: Date.now(), updated_by: user.username })
            .then(() => fbPush("site_stats_history", { t: Date.now(), n, total_players_ever: Number(total || 0), online_count: n, by: user.username }))
            .then(() => note("Graph-Punkt gespeichert"));
        }}
      >
        <h2 className="text-lg font-semibold">Live-Stand</h2>
        <input className="field mt-3" value={online} onChange={(e) => setOnline(e.target.value)} />
        <button className="btn-gold mt-3" type="submit">Online-Stand + Graph speichern</button>
      </form>
      <form
        className="card card-still p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const body = {
            id: "active",
            status_type: "custom",
            type: "custom",
            title,
            message,
            is_active: true,
            color: "custom",
            created_by: user.username,
            updated_by: user.username,
            created_at: Date.now(),
            updated_at: Date.now(),
            expires_at: null,
          };
          void fbSet("site_status/active", body).then(() => fbPush("site_status/log", body)).then(() => note("Status gesetzt"));
        }}
      >
        <h2 className="text-lg font-semibold">Status-Meldung</h2>
        <input className="field mt-3" placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="field mt-2 min-h-20" placeholder="Text" value={message} onChange={(e) => setMessage(e.target.value)} />
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-gold" type="submit">Setzen</button>
          <button
            className="btn-ghost"
            type="button"
            onClick={() => {
              const body = { id: "active", status_type: "online", type: "online", title: "Online", message: "Alles läuft stabil.", is_active: false, color: "green", created_by: user.username, updated_by: user.username, created_at: Date.now(), updated_at: Date.now(), expires_at: null };
              void fbSet("site_status/active", body).then(() => note("Banner aus"));
            }}
          >
            Banner aus
          </button>
        </div>
      </form>
      <form
        className="card card-still p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const stamp = { updated_by: user.username, updated_at: Date.now() };
          const payload: Record<string, { value: string; updated_by: string; updated_at: number }> = {};
          if (ip) payload.server_ip = { value: ip, ...stamp };
          if (port) payload.bedrock_port = { value: port, ...stamp };
          if (version) payload.recommended_version = { value: version, ...stamp };
          void fbUpdate("site_settings", payload).then(() => note("Einstellungen gespeichert"));
        }}
      >
        <h2 className="text-lg font-semibold">Website</h2>
        <input className="field mt-3" placeholder="IP" value={ip} onChange={(e) => setIp(e.target.value)} />
        <input className="field mt-2" placeholder="Bedrock-Port" value={port} onChange={(e) => setPort(e.target.value)} />
        <input className="field mt-2" placeholder="Version" value={version} onChange={(e) => setVersion(e.target.value)} />
        <button className="btn-gold mt-3" type="submit">Speichern</button>
      </form>
    </div>
  );
}

function Archive({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const bans = useLive<ModItem>("bans");
  const kicks = useLive<ModItem>("kicks");
  const warns = useLive<ModItem>("warns");
  const help = useLive<ModItem>("helpRequests");
  const rows = [
    ...entries(bans).map(([key, item]) => ({ path: "bans", key, item })),
    ...entries(kicks).map(([key, item]) => ({ path: "kicks", key, item })),
    ...entries(warns).map(([key, item]) => ({ path: "warns", key, item })),
    ...entries(help).map(([key, item]) => ({ path: "helpRequests", key, item })),
  ].filter((row) => row.item.archived);

  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.path + row.key} className="card card-still p-4 text-sm">
          <p className="font-semibold">{row.item.name || row.item.by} · {row.path}</p>
          <p className="text-muted">{row.item.reason || row.item.msg || row.item.text}</p>
          <p className="text-xs text-faint">Archiv: {row.item.archiveReason} · {row.item.archivedBy}</p>
          {user.role === "owner" ? (
            <button type="button" className="btn-ghost mt-2" onClick={() => void wipe(row.path, row.key, note)}>Endgültig löschen</button>
          ) : null}
        </li>
      ))}
      {!rows.length ? <li className="text-muted">Archiv ist leer</li> : null}
    </ul>
  );
}

function Accounts({ note, actor }: { note: (text: string) => void; actor: StaffSession }) {
  const users = useLive<{ password?: string; role?: string; mustChangePw?: boolean }>("staffUsers");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("helper");

  return (
    <div className="space-y-4">
      <form
        className="card card-still p-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (actor.role !== "owner") return note("Nur der Owner vergibt Rollen");
          const name = username.trim().toLowerCase();
          if (!name || !password) return note("Name + Passwort nötig");
          if (name === "owner") return note("Reserviert");
          void fbGet(`staffUsers/${name}`).then(async (existing) => {
            if (existing) return note("Existiert schon");
            await fbSet(`staffUsers/${name}`, { password, role, mustChangePw: true, createdAt: Date.now(), createdBy: actor.username });
            setUsername("");
            setPassword("");
            note("Account angelegt");
          });
        }}
      >
        <h2 className="text-lg font-semibold">Account anlegen</h2>
        <input className="field mt-3" placeholder="Name" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="field mt-2" placeholder="Startpasswort" value={password} onChange={(e) => setPassword(e.target.value)} />
        <select className="field mt-2" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="helper">Helper</option>
          <option value="supporter">Supporter</option>
          <option value="builder">Builder</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn-gold mt-3" type="submit">Anlegen</button>
      </form>
      <ul className="space-y-2">
        {entries(users).map(([name, item]) => (
          <li key={name} className="card card-still flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <p><span className="font-semibold">{name}</span> · {item.role} {item.mustChangePw ? "· muss Passwort ändern" : ""}</p>
            {actor.role === "owner" ? (
              <button type="button" className="btn-ghost" onClick={() => window.confirm("Account entfernen? Gespeicherte Bans bleiben.") && void fbRemove(`staffUsers/${name}`).then(() => note("Account entfernt"))}>Entfernen</button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
