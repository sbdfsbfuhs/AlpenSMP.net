import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CopyBurstButton } from "@/components/site/copy-burst";
import { PageHero, Shell } from "@/components/site/shell";
import { SiteMascot } from "@/components/site/assistant";
import { AbsenceBoard, BanGuideEditor, GuideEditor, PlayerCommandEditor, RulesEditor, TasksBoard } from "@/components/site/staff-extra";
import { can, roleLabel, ROLES, asRole, type Role } from "@/lib/alpen/roles";
import {
  createStaffAccount,
  entries,
  fbGet,
  fbPush,
  fbRemove,
  fbSet,
  fbUpdate,
  formatRemaining,
  formatWhen,
  freshStamp,
  isPermanentBan,
  loginStaff,
  logStaff,
  parseDuration,
  permLeft,
  readSession,
  removeStaffAccount,
  resetStaffPassword,
  savePassword,
  setStaffPaused,
  setStaffRole,
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

type Tab = "roster" | "moderation" | "help" | "community" | "tasks" | "absence" | "chat" | "commands" | "rules" | "ban" | "guide" | "settings" | "website" | "archive" | "users";
type Filter = "active" | "expired" | "archived" | "all";

const TABS: { id: Tab; label: string; area: "roster" | "moderation" | "help" | "community" | "tasks" | "absence" | "chat" | "commandsRead" | "rulesRead" | "banGuide" | "guide" | "settings" | "website" | "archive" | "roles" }[] = [
  { id: "roster", label: "Team", area: "roster" },
  { id: "moderation", label: "Moderation", area: "moderation" },
  { id: "help", label: "Hilfe", area: "help" },
  { id: "community", label: "Community", area: "community" },
  { id: "tasks", label: "Aufgaben", area: "tasks" },
  { id: "absence", label: "Abwesenheit", area: "absence" },
  { id: "chat", label: "Chat", area: "chat" },
  { id: "commands", label: "Commands", area: "commandsRead" },
  { id: "rules", label: "Regeln", area: "rulesRead" },
  { id: "ban", label: "Ban-Leitfaden", area: "banGuide" },
  { id: "guide", label: "Guide", area: "guide" },
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
    const saved = readSession();
    if (!saved) {
      setReady(true);
      return;
    }
    void fbGet<{ role?: string; mustChangePw?: boolean; disabled?: boolean }>(`staffUsers/${saved.username}`)
      .then((row) => {
        if (!row || row.disabled || !saved.email) {
          writeSession(null);
          setUser(null);
        } else {
          const next = { ...saved, role: row.role || saved.role, mustChangePw: Boolean(row.mustChangePw) };
          writeSession(next);
          setUser(next);
        }
        setReady(true);
      })
      .catch(() => {
        writeSession(null);
        setUser(null);
        setReady(true);
      });
  }, []);

  function note(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2400);
  }

  function logout() {
    const name = user?.username;
    void (name ? fbRemove(`presence/${name}`) : Promise.resolve())
      .catch(() => undefined)
      .finally(() => {
        writeSession(null);
        setUser(null);
      });
  }

  return (
    <Shell>
      <PageHero
        kicker="Nur fürs Team"
        title="Staff-Center"
        lede="Moderation, Hilfe, Commands und Freigaben. Dieselben Daten wie bisher – in der neuen Oberfläche."
      />
      <SiteMascot home="team" bias="sit" align="end" line="Öffentliche Fragen beantworte ich auf den anderen Seiten." />
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
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const session = await loginStaff(name, password);
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
      <p className="mt-2 text-sm text-muted">Team-Name und Passwort. Wer schon erfasst ist und noch kein Passwort hat, wählt es hier. Danach kommt man damit rein.</p>
      <label className="mt-5 block text-sm">
        Name
        <input className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} autoComplete="username" />
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
    if (!a) return note("Passwort fehlt");
    if (a !== b) return note("Stimmt nicht überein");
    try {
      await savePassword(user.username, a);
    } catch (err) {
      return note(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    }
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
  const shown = (real === "owner" ? view : user.role) as string;
  const reviews = useLive<{ status?: string }>("community_reviews");
  const images = useLive<{ status?: string }>("community_images");
  const help = useLive<{ status?: string; archived?: boolean }>("helpRequests");
  const tabs = TABS.filter((item) => {
    if (item.id === "moderation") return can(shown, "moderation") || can(shown, "moderationRead") || can(shown, "notes");
    if (item.id === "commands") return can(shown, "commandsRead") || can(shown, "staffCommands");
    if (item.id === "rules") return can(shown, "rulesRead") || can(shown, "rulesEdit");
    return can(shown, item.area);
  });
  const banRows = useLive<ModItem>("bans");
  const warnRows = useLive<ModItem>("warns");
  useEffect(() => {
    if (!can(real, "moderation")) return;
    const now = Date.now();
    for (const [key, item] of Object.entries(banRows)) {
      if (item.archived || item.pending || !isPermanentBan(item)) continue;
      const start = item.confirmedAt || item.ts || 0;
      if (!start || now - start < 86_400_000) continue;
      void fbUpdate(`bans/${key}`, {
        archived: true,
        archivedBy: "system",
        archivedAt: now,
        archiveReason: "Permanent, automatisch nach 24 Stunden",
        updatedAt: now,
      });
    }
    for (const [key, item] of Object.entries(warnRows)) {
      if (item.archived || !item.endsAt || item.endsAt > now) continue;
      void fbUpdate(`warns/${key}`, {
        archived: true,
        archivedBy: "system",
        archivedAt: now,
        archiveReason: "Warnung abgelaufen",
        updatedAt: now,
      });
    }
  }, [banRows, warnRows, real]);
  const [tab, setTab] = useState<Tab>("roster");
  const safeTab = tabs.some((item) => item.id === tab) ? tab : tabs[0]?.id;
  const badges: Partial<Record<Tab, number>> = {
    community: Object.values(reviews).filter((item) => item.status !== "approved" && item.status !== "rejected").length
      + Object.values(images).filter((item) => item.status !== "approved" && item.status !== "rejected").length,
    help: Object.values(help).filter((item) => !item.archived && item.status !== "erledigt").length,
  };

  useEffect(() => {
    const beat = (writing = false) => {
      void fbUpdate(`presence/${user.username}`, {
        username: user.username,
        role: user.role,
        online: true,
        lastSeen: Date.now(),
        ...(writing ? { writingAt: Date.now() } : {}),
      }).catch(() => undefined);
    };
    beat();
    const timer = window.setInterval(() => beat(), 20000);
    let wait = 0;
    const onType = () => {
      window.clearTimeout(wait);
      wait = window.setTimeout(() => beat(true), 400);
    };
    document.addEventListener("input", onType);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(wait);
      document.removeEventListener("input", onType);
    };
  }, [user.username, user.role]);

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
      {real === "owner" ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">Ansicht als</span>
          {ROLES.map((role) => (
            <button key={role} type="button" className={shown === role ? "btn-gold px-3" : "btn-ghost px-3"} onClick={() => setView(role)}>
              {roleLabel(role)}
            </button>
          ))}
          <span className="text-xs text-faint">Nur für dich. Ändert nicht die echte Rolle.</span>
        </div>
      ) : null}
      <PlayerSearch />
      {real === "owner" ? <CheckInBanner /> : null}
      <div className="mt-5 flex gap-2 overflow-x-auto px-1 pb-2">
        {tabs.map((item) => {
          const count = badges[item.id] || 0;
          return (
            <button
              key={item.id}
              type="button"
              className={item.id === safeTab ? "btn-gold shrink-0" : "btn-ghost shrink-0"}
              onClick={() => setTab(item.id)}
            >
              {item.label}
              {count > 0 ? <span className="ml-2 inline-flex min-w-5 justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">{count}</span> : null}
            </button>
          );
        })}
      </div>
      <div className="panel-in mt-6 px-1" key={safeTab}>
        {safeTab === "moderation" ? <Moderation user={user} note={note} ban={can(shown, "moderation") && can(real, "moderation")} writeNotes={can(shown, "notes") && can(real, "notes")} /> : null}
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
        {safeTab === "roster" ? <Roster owner={real === "owner"} /> : null}
        {safeTab === "chat" ? <StaffChat user={user} builder={can(shown, "builderChat") && can(real, "builderChat")} /> : null}
        {safeTab === "settings" ? <Settings user={user} note={note} /> : null}
        {safeTab === "website" ? <Website user={user} note={note} /> : null}
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

function Neu({ ts, updatedAt }: { ts?: number; updatedAt?: number }) {
  if (!freshStamp(ts, updatedAt)) return null;
  return <span className="ml-2 rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-black">Neu</span>;
}

function Moderation({ user, note, ban, writeNotes }: { user: StaffSession; note: (text: string) => void; ban: boolean; writeNotes: boolean }) {
  const bans = useLive<ModItem>("bans");
  const warns = useLive<ModItem>("warns");
  const notes = useLive<ModItem>("notes");
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {ban ? <ModForm title="Ban" path="bans" user={user} note={note} withDuration presets={["5min", "1h", "1d", "7d", "30d", "Permanent"]} reasons={[["Griefing", "1d"], ["Beleidigung", "7d"], ["Cheating", "30d"]]} /> : null}
      <List title="Bans" path="bans" items={entries(bans)} user={user} note={note} timed write={ban} />
      {ban ? <ModForm title="Warnung" path="warns" user={user} note={note} withDuration presets={["1d", "7d", "30d"]} /> : null}
      <List title="Warnungen" path="warns" items={entries(warns)} user={user} note={note} timed write={ban} />
      {writeNotes ? <NoteForm user={user} note={note} /> : null}
      <List title="Notizen" path="notes" items={entries(notes)} user={user} note={note} notes write={writeNotes} />
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
  const [duration, setDuration] = useState(withDuration ? (path === "warns" ? "7d" : "Permanent") : "");
  const [proof, setProof] = useState("");
  const known = useLive<ModItem>(path);
  const guide = useLive<{ offense?: string; duration?: string }>("banGuide");
  const needle = name.trim().toLowerCase();
  const past = withDuration && needle.length >= 2
    ? entries(known).filter(([, item]) => (item.name || "").toLowerCase().includes(needle))
    : [];
  const reasonNeedle = reason.trim().toLowerCase();
  const tips = withDuration && reasonNeedle.length >= 3
    ? entries(guide).filter(([, item]) => {
      const offense = (item.offense || "").toLowerCase();
      return offense && (offense.includes(reasonNeedle) || reasonNeedle.includes(offense));
    })
    : [];

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
      body.duration = duration.trim() || (path === "warns" ? "7d" : "Permanent");
      body.endsAt = parseDuration(body.duration);
      if (path === "bans" && isPermanentBan({ duration: body.duration, endsAt: body.endsAt })) {
        body.pending = true;
      }
    }
    if (path === "bans" && proof.trim()) body.proof = proof.trim().slice(0, 500);
    await fbPush(path, body);
    void logStaff(user.username, title, `${name.trim()} · ${reason.trim() || "–"}`);
    setName("");
    setReason("");
    setProof("");
    note(body.pending ? "Ban wartet auf eine zweite Person" : `${title} gespeichert`);
  }

  return (
    <form className="card card-still p-5" onSubmit={save}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <input className="field mt-3" placeholder="Spieler" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="field mt-2" placeholder="Grund" value={reason} onChange={(e) => setReason(e.target.value)} />
      {withDuration ? <input className="field mt-2" placeholder="Dauer" value={duration} onChange={(e) => setDuration(e.target.value)} /> : null}
      {path === "bans" ? <input className="field mt-2" placeholder="Beweis-Link, optional" value={proof} onChange={(e) => setProof(e.target.value)} /> : null}
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
      {tips.length ? (
        <div className="mt-3 space-y-1 text-sm">
          <p className="text-muted">Passende Dauer aus dem Leitfaden</p>
          {tips.map(([key, item]) => (
            <button key={key} type="button" className="btn-ghost mr-2 mt-1 px-3" onClick={() => item.duration && setDuration(item.duration)}>
              {item.offense} · {item.duration}
            </button>
          ))}
        </div>
      ) : null}
      {past.length ? (
        <ul className="mt-3 space-y-1 text-sm">
          {past.slice(0, 5).map(([key, item]) => (
            <li key={key} className={isPermanentBan(item) ? "text-red-300" : "text-muted"}>
              Schon erfasst: {item.reason} · {item.duration || "ohne Dauer"} · {formatWhen(item.ts)}{item.archived ? " · archiviert" : ""}
            </li>
          ))}
        </ul>
      ) : null}
      <button className="btn-gold mt-4" type="submit">Eintragen</button>
    </form>
  );
}

function NoteForm({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  return (
    <form
      className="card card-still p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) return note("Leer");
        void fbPush("notes", { name: name.trim(), text: text.trim(), by: user.username, ts: Date.now() }).then(() => {
          void logStaff(user.username, "Notiz", text.trim().slice(0, 80));
          setName("");
          setText("");
          note("Notiz gespeichert");
        });
      }}
    >
      <h2 className="text-lg font-semibold">Team-Notiz</h2>
      <input className="field mt-3" placeholder="Spieler" value={name} onChange={(e) => setName(e.target.value)} />
      <textarea className="field mt-2 min-h-24" placeholder="Notiz" value={text} onChange={(e) => setText(e.target.value)} />
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
  write,
}: {
  title: string;
  path: string;
  items: [string, ModItem][];
  user: StaffSession;
  note: (text: string) => void;
  timed?: boolean;
  notes?: boolean;
  write?: boolean;
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
      <ul className="mt-3 max-h-80 space-y-2 overflow-auto p-1">
        {rows.map(([key, item]) => {
          const perm = path === "bans" && isPermanentBan(item) && !item.archived;
          const waiting = Boolean(perm && item.pending);
          const proof = item.proof && /^https?:\/\//i.test(item.proof) ? item.proof : "";
          return (
          <li key={key} className={`cmd-in rounded-md border bg-bg px-3 py-2 text-sm${perm && !waiting ? " border-red-500 bg-red-950/40" : waiting ? " border-amber-500" : freshStamp(item.ts, item.updatedAt) ? " mark-new border-line" : " border-line"}`}>
            <p className={`font-semibold${perm && !waiting ? " text-red-200" : ""}`}>{notes ? item.name || item.text : item.name}<Neu ts={item.ts} updatedAt={item.updatedAt} /></p>
            {!notes ? <p className="text-muted">{item.reason}</p> : <p className="text-muted">{item.text}</p>}
            <p className="text-xs text-faint">
              {timed && !waiting ? formatRemaining(item.endsAt) : ""} {item.duration ? `· ${item.duration}` : ""} · {item.by} · {formatWhen(item.ts)}
            </p>
            {proof ? <a className="mt-1 inline-block text-xs text-gold" href={proof} target="_blank" rel="noreferrer">Beweis</a> : null}
            {waiting ? <p className="text-xs font-semibold text-amber-300">Wartet auf eine zweite Person. Noch nicht gültig.</p> : null}
            {perm && !waiting ? <p className="text-xs font-semibold text-red-300">{permLeft(item.confirmedAt || item.ts)}</p> : null}
            <div className="mt-2 flex flex-wrap gap-2">
              {waiting && write && item.by !== user.username ? (
                <button type="button" className="btn-gold px-3" onClick={() => void fbUpdate(`${path}/${key}`, { pending: false, confirmedBy: user.username, confirmedAt: Date.now(), updatedAt: Date.now() }).then(() => note("Ban gilt jetzt"))}>
                  Bestätigen
                </button>
              ) : null}
              {write && !item.archived && !waiting ? (
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
          );
        })}
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
        <article key={key} className={`card card-still cmd-in p-5${freshStamp(item.ts, item.updatedAt) ? " mark-new" : ""}`}>
          <p className="font-semibold">{item.by}<Neu ts={item.ts} updatedAt={item.updatedAt} /></p>
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
            <button type="button" className="btn-ghost mt-3" onClick={() => void fbUpdate(`helpRequests/${key}`, { status: "erledigt", doneBy: user.username, updatedAt: Date.now() }).then(() => note("Als erledigt markiert"))}>
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
              <CopyBurstButton value={`${item.name} ${item.desc}`} className="btn-ghost" ariaLabel="Befehl kopieren">
                Kopieren
              </CopyBurstButton>
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
          <article key={key} className={`card card-still p-4${freshStamp(item.ts, item.updatedAt) ? " mark-new" : ""}`}>
            <p className="font-semibold">{item.name} {item.rating ? `· ${item.rating}/5` : ""}<Neu ts={item.ts} updatedAt={item.updatedAt} /></p>
            <p className="mt-1 text-sm text-muted">{shots ? item.caption : item.text}</p>
            {item.imageUrl ? <img src={item.imageUrl} alt="" className="mt-3 max-h-40 rounded-md object-cover" /> : null}
            <p className="mt-2 text-xs text-faint">{item.status || "offen"} · {formatWhen(item.ts)}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" className="btn-gold" onClick={() => void fbUpdate(`${path}/${key}`, { status: "approved", moderatedBy: user.username, moderatedAt: Date.now(), updatedAt: Date.now() }).then(() => note("Freigegeben"))}>Frei</button>
              <button type="button" className="btn-ghost" onClick={() => void fbUpdate(`${path}/${key}`, { status: "rejected", moderatedBy: user.username, moderatedAt: Date.now(), updatedAt: Date.now() }).then(() => note("Abgelehnt"))}>Ablehnen</button>
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
    if (!a) return note("Passwort fehlt");
    if (a !== b) return note("Stimmt nicht überein");
    try {
      const session = await loginStaff(user.email, oldPw);
      await savePassword(user.username, a);
      writeSession({ ...session, mustChangePw: false });
    } catch (err) {
      return note(err instanceof Error ? err.message : "Altes Passwort falsch");
    }
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
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [color, setColor] = useState("#f5c400");
  const [buttonLabel, setButtonLabel] = useState("");
  const [buttonHref, setButtonHref] = useState("");
  const [lockTitle, setLockTitle] = useState("Kurz offline");
  const [lockMessage, setLockMessage] = useState("Die Website ist kurz abgeschaltet.");

  useEffect(() => {
    fbGet<{ total_players_ever?: number }>("site_stats").then((row) => {
      if (!row) return;
      setTotal(String(row.total_players_ever ?? ""));
    }).catch(() => {});
    fbGet<{ title?: string; message?: string; color?: string; button_label?: string; button_href?: string; lockdown?: boolean }>("site_status/active").then((row) => {
      if (!row) return;
      if (row.lockdown) {
        setLockTitle(row.title || "Kurz offline");
        setLockMessage(row.message || "");
      } else {
        setTitle(row.title || "");
        setMessage(row.message || "");
      }
      if (row.color?.startsWith("#")) setColor(row.color);
      setButtonLabel(row.button_label || "");
      setButtonHref(row.button_href || "");
    }).catch(() => {});
  }, []);

  async function saveTotal(next: number) {
    await fbUpdate("site_stats", { total_players_ever: next, updated_at: Date.now(), updated_by: user.username });
    await fbSet("total_players_ever", next);
    await fbPush("site_stats_history", { t: Date.now(), n: 0, total_players_ever: next, online_count: 0, by: user.username });
    setTotal(String(next));
    note("Spielerzahl gespeichert");
  }

  return (
    <div className="space-y-4">
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
          const body = {
            id: "active",
            status_type: "custom",
            type: "custom",
            title,
            message,
            is_active: true,
            lockdown: false,
            color,
            button_label: buttonLabel,
            button_href: buttonHref,
            created_by: user.username,
            updated_by: user.username,
            created_at: Date.now(),
            updated_at: Date.now(),
            expires_at: null,
          };
          void fbSet("site_status/active", body).then(() => fbPush("site_status/log", body)).then(() => note("Banner gesetzt"));
        }}
      >
        <h2 className="text-lg font-semibold">Banner</h2>
        <p className="mt-1 text-sm text-muted">Gelbes Absperrband oben. Die Website bleibt an.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn-ghost" onClick={() => { setTitle("Bedrock aus"); setMessage("Bedrock ist wegen eines Minecraft-Updates kurz offline."); setColor("#f5c400"); }}>Bedrock aus</button>
          <button type="button" className="btn-ghost" onClick={() => { setTitle("Server-Neustart"); setMessage("Der Server startet gerade neu. Gleich wieder da."); setColor("#f5c400"); }}>Neustart</button>
        </div>
        <input className="field mt-3" placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="field mt-2 min-h-20" placeholder="Text" value={message} onChange={(e) => setMessage(e.target.value)} />
        <label className="mt-3 flex items-center gap-3 text-sm">
          Farbe
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
        <input className="field mt-2" placeholder="Knopf-Text, optional" value={buttonLabel} onChange={(e) => setButtonLabel(e.target.value)} />
        <input className="field mt-2" placeholder="Knopf-Link, z. B. Discord" value={buttonHref} onChange={(e) => setButtonHref(e.target.value)} />
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-gold" type="submit">Banner setzen</button>
          <button
            className="btn-ghost"
            type="button"
            onClick={() => {
              const body = { id: "active", status_type: "online", type: "online", title: "Online", message: "Alles läuft stabil.", is_active: false, lockdown: false, color, button_label: "", button_href: "", created_by: user.username, updated_by: user.username, created_at: Date.now(), updated_at: Date.now(), expires_at: null };
              void fbSet("site_status/active", body).then(() => note("Banner aus"));
            }}
          >
            Banner aus
          </button>
        </div>
      </form>
      {can(user.role, "lockdown") ? (
        <form
          className="card card-still p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const body = {
              id: "active",
              status_type: "lockdown",
              type: "lockdown",
              title: lockTitle || "Kurz offline",
              message: lockMessage || "Die Website ist kurz abgeschaltet.",
              is_active: true,
              lockdown: true,
              color,
              button_label: "",
              button_href: "",
              created_by: user.username,
              updated_by: user.username,
              created_at: Date.now(),
              updated_at: Date.now(),
              expires_at: null,
            };
            void fbSet("site_status/active", body).then(() => note("Website aus. Team-Login bleibt."));
          }}
        >
          <h2 className="text-lg font-semibold">Website aus</h2>
          <p className="mt-1 text-sm text-muted">Lockdown schaltet die öffentliche Seite aus. Dieser Titel und Text ist genau das, was Besucher dann sehen. Die Team-Anmeldung bleibt.</p>
          <input className="field mt-3" placeholder="Titel" value={lockTitle} onChange={(e) => setLockTitle(e.target.value)} />
          <textarea className="field mt-2 min-h-20" placeholder="Text für Besucher" value={lockMessage} onChange={(e) => setLockMessage(e.target.value)} />
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn-gold" type="submit">Website aus</button>
            <button
              className="btn-ghost"
              type="button"
              onClick={() => {
                const body = { id: "active", status_type: "online", type: "online", title: "Online", message: "Alles läuft stabil.", is_active: false, lockdown: false, color, button_label: "", button_href: "", created_by: user.username, updated_by: user.username, created_at: Date.now(), updated_at: Date.now(), expires_at: null };
                void fbSet("site_status/active", body).then(() => note("Website wieder an"));
              }}
            >
              Website wieder an
            </button>
          </div>
        </form>
      ) : null}
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
        <h2 className="text-lg font-semibold">Serverangaben</h2>
        <input className="field mt-3" placeholder="Java: alpensmp.net" value={ip} onChange={(e) => setIp(e.target.value)} />
        <input className="field mt-2" placeholder="Bedrock-Port: 19132" value={port} onChange={(e) => setPort(e.target.value)} />
        <input className="field mt-2" placeholder="Version" value={version} onChange={(e) => setVersion(e.target.value)} />
        <button className="btn-gold mt-3" type="submit">Speichern</button>
      </form>
    </div>
  );
}
function Archive({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const bans = useLive<ModItem>("bans");
  const warns = useLive<ModItem>("warns");
  const help = useLive<ModItem>("helpRequests");
  const rows = [
    ...entries(bans).map(([key, item]) => ({ path: "bans", key, item })),
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

function PlayerSearch() {
  const bans = useLive<ModItem>("bans");
  const warns = useLive<ModItem>("warns");
  const notes = useLive<ModItem>("notes");
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const grouped = new Map<string, { kind: string; detail: string; ts?: number; perm: boolean; proof?: string; extra?: string }[]>();
  if (needle.length >= 2) {
    const add = (name: string, row: { kind: string; detail: string; ts?: number; perm: boolean; proof?: string; extra?: string }) => {
      const key = name.trim() || "Ohne Namen";
      const blob = `${key} ${row.detail} ${row.extra || ""}`.toLowerCase();
      if (!blob.includes(needle)) return;
      const list = grouped.get(key) ?? [];
      list.push(row);
      grouped.set(key, list);
    };
    for (const [, item] of entries(bans)) {
      add(item.name || "", { kind: "Ban", detail: `${item.reason || ""} · ${item.duration || formatRemaining(item.endsAt)}${item.pending ? " · wartet" : ""}${item.archived ? " · archiviert" : ""}`, ts: item.ts, perm: isPermanentBan(item), proof: item.proof });
    }
    for (const [, item] of entries(warns)) {
      add(item.name || "", { kind: "Warnung", detail: `${item.reason || ""} · ${item.duration || ""}${item.archived ? " · archiviert" : ""}`, ts: item.ts, perm: false });
    }
    for (const [, item] of entries(notes)) {
      add(item.name || "", { kind: "Notiz", detail: item.text || "", ts: item.ts, perm: false, extra: item.text });
    }
  }

  return (
    <section className="card card-still mt-4 p-4">
      <label className="text-sm font-semibold" htmlFor="player-search">Spieler-Akte</label>
      <input id="player-search" className="field mt-2" placeholder="Spielername" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mt-3 space-y-3">
        {[...grouped.entries()].slice(0, 8).map(([name, rows]) => (
          <article key={name} className="rounded-md border border-line p-3">
            <h2 className="font-semibold">{name}</h2>
            <ul className="mt-2 space-y-2">
              {rows.map((row, index) => (
                <li key={`${row.kind}-${index}`} className={row.perm ? "text-sm text-red-200" : "text-sm text-muted"}>
                  <span className="font-semibold text-fg">{row.kind}.</span> {row.detail} · {formatWhen(row.ts)}
                  {row.proof && /^https?:\/\//i.test(row.proof) ? <a className="ml-2 text-gold" href={row.proof} target="_blank" rel="noreferrer">Beweis</a> : null}
                </li>
              ))}
            </ul>
          </article>
        ))}
        {needle.length >= 2 && grouped.size === 0 ? <p className="text-sm text-muted">Nichts zu diesem Namen</p> : null}
      </div>
    </section>
  );
}

function CheckInBanner() {
  const users = useLive<{ disabled?: boolean }>("staffUsers");
  const presence = useLive<{ lastSeen?: number }>("presence");
  const absences = useLive<{ by?: string; from?: string; until?: string }>("absences");
  const today = new Date().toISOString().slice(0, 10);
  const away = new Set(entries(absences).filter(([, item]) => item.from && item.until && item.from <= today && today <= item.until).map(([, item]) => item.by || ""));
  const late = entries(users).filter(([name, item]) => {
    if (item.disabled || away.has(name)) return false;
    const seen = presence[name]?.lastSeen || 0;
    return !seen || Date.now() - seen > 3 * 86_400_000;
  });
  if (!late.length) return null;
  return (
    <p className="mt-4 rounded-md border border-red-500 bg-red-950/40 px-3 py-2 text-sm text-red-200">
      Seit mehr als 3 Tagen nicht im Team und nicht abwesend: {late.map(([name]) => name).join(", ")}
    </p>
  );
}

function StaffChat({ user, builder }: { user: StaffSession; builder: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChatRoom path="chats/team" title="Team" user={user} />
      {builder || user.role === "owner" ? <ChatRoom path="chats/builder" title="Builder" user={user} /> : null}
    </div>
  );
}

function ChatRoom({ path, title, user }: { path: string; title: string; user: StaffSession }) {
  const rows = useLive<{ by?: string; text?: string; ts?: number }>(path);
  const pin = useLive<{ text?: string; by?: string; ts?: number }>("chats/pin");
  const [text, setText] = useState("");
  const [draft, setDraft] = useState("");
  const list = entries(rows).sort((a, b) => (a[1].ts || 0) - (b[1].ts || 0)).slice(-80);
  const pinned = path === "chats/team" ? pin.current : undefined;
  return (
    <section className="card card-still p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {path === "chats/team" && pinned?.text ? (
        <p className="mt-3 rounded-md border border-gold bg-gold/10 px-3 py-2 text-sm">
          {pinned.text}
          {user.role === "owner" ? (
            <button type="button" className="btn-ghost ml-2 px-3" onClick={() => void fbRemove("chats/pin/current")}>Weg</button>
          ) : null}
        </p>
      ) : null}
      {path === "chats/team" && user.role === "owner" ? (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim()) return;
            void fbSet("chats/pin/current", { text: draft.trim().slice(0, 160), by: user.username, ts: Date.now() }).then(() => setDraft(""));
          }}
        >
          <input className="field" placeholder="Oben anpinnen, zum Beispiel Restart" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button className="btn-ghost" type="submit">Anpinnen</button>
        </form>
      ) : null}
      <ul className="mt-3 max-h-80 space-y-2 overflow-auto p-1">
        {list.map(([key, item]) => (
          <li key={key} className="rounded-md border border-line px-3 py-2 text-sm">
            <p><span className="font-semibold">{item.by}</span> <span className="text-xs text-faint">{formatWhen(item.ts)}</span></p>
            <p className="mt-1 whitespace-pre-wrap">{item.text}</p>
            {user.role === "owner" ? (
              <button type="button" className="btn-ghost mt-2 px-3" onClick={() => void fbRemove(`${path}/${key}`)}>Löschen</button>
            ) : null}
          </li>
        ))}
        {!list.length ? <li className="text-sm text-muted">Noch keine Nachrichten</li> : null}
      </ul>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const msg = text.trim();
          if (!msg) return;
          void fbPush(path, { by: user.username, text: msg.slice(0, 800), ts: Date.now() }).then(() => setText(""));
        }}
      >
        <input className="field" placeholder="Nachricht" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn-gold" type="submit">Senden</button>
      </form>
    </section>
  );
}

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

function Roster({ owner }: { owner: boolean }) {
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

function Accounts({ note, actor }: { note: (text: string) => void; actor: StaffSession }) {
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
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
        </select>
        {formError ? <p className="mt-3 text-sm text-ember">{formError}</p> : null}
        <button className="btn-gold mt-3" type="submit">Anlegen</button>
      </form>
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
              className="btn-gold"
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
