import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { PageHero, Shell } from "@/components/site/shell";
import { SiteMascot } from "@/components/site/assistant";
import { AbsenceBoard, BanGuideEditor, GuideEditor, PlayerCommandEditor, RulesEditor, TasksBoard } from "@/components/site/staff-extra";
import { LiveNotices, NewsEditor, SeasonDesk, StatusDesk, StreamDesk } from "@/components/site/staff-broadcast";
import { Accounts } from "@/components/site/staff-accounts";
import { Archive } from "@/components/site/staff-archive";
import { StaffChat } from "@/components/site/staff-chat";
import { ChannelsDesk } from "@/components/site/staff-channels";
import { Commands } from "@/components/site/staff-commands";
import { Community } from "@/components/site/staff-community";
import { HelpDesk } from "@/components/site/staff-help";
import { Moderation } from "@/components/site/staff-moderation";
import { Roster } from "@/components/site/staff-roster";
import { CheckInBanner, PlayerSearch } from "@/components/site/staff-search";
import { Settings } from "@/components/site/staff-settings";
import { shallowCount, useLive } from "@/components/site/staff-live";
import { Website } from "@/components/site/staff-website";
import { can, roleLabel, ROLES, asRole, type Role } from "@/lib/alpen/roles";
import {
  fbGet,
  fbPush,
  fbRemove,
  fbSet,
  fbUpdate,
  isPermanentBan,
  loginStaff,
  readSession,
  savePassword,
  writeSession,
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

type Tab =
  | "roster"
  | "moderation"
  | "help"
  | "community"
  | "tasks"
  | "absence"
  | "chat"
  | "commands"
  | "rules"
  | "ban"
  | "guide"
  | "settings"
  | "website"
  | "archive"
  | "users"
  | "news"
  | "status"
  | "stream"
  | "season"
  | "channels"
  | "console";
type TabGroup = "Team" | "Moderation & Support" | "Inhalte & Kommunikation" | "Verwaltung";
type TabArea =
  | "roster"
  | "moderation"
  | "help"
  | "community"
  | "tasks"
  | "absence"
  | "chat"
  | "commandsRead"
  | "rulesRead"
  | "banGuide"
  | "guide"
  | "settings"
  | "website"
  | "archive"
  | "roles"
  | "news"
  | "status"
  | "stream"
  | "season"
  | "channels"
  | "console";

const TAB_GROUPS: TabGroup[] = ["Team", "Moderation & Support", "Inhalte & Kommunikation", "Verwaltung"];

const TABS: { id: Tab; label: string; group: TabGroup; area: TabArea }[] = [
  { id: "roster", label: "Team", group: "Team", area: "roster" },
  { id: "tasks", label: "Aufgaben", group: "Team", area: "tasks" },
  { id: "absence", label: "Abwesenheit", group: "Team", area: "absence" },
  { id: "moderation", label: "Moderation", group: "Moderation & Support", area: "moderation" },
  { id: "help", label: "Hilfe", group: "Moderation & Support", area: "help" },
  { id: "community", label: "Community", group: "Moderation & Support", area: "community" },
  { id: "ban", label: "Ban-Leitfaden", group: "Moderation & Support", area: "banGuide" },
  { id: "archive", label: "Archiv", group: "Moderation & Support", area: "archive" },
  { id: "commands", label: "Commands", group: "Inhalte & Kommunikation", area: "commandsRead" },
  { id: "rules", label: "Regeln", group: "Inhalte & Kommunikation", area: "rulesRead" },
  { id: "guide", label: "Guide", group: "Inhalte & Kommunikation", area: "guide" },
  { id: "news", label: "News", group: "Inhalte & Kommunikation", area: "news" },
  { id: "status", label: "Status", group: "Inhalte & Kommunikation", area: "status" },
  { id: "stream", label: "Mein Stream", group: "Inhalte & Kommunikation", area: "stream" },
  { id: "season", label: "Season & Events", group: "Inhalte & Kommunikation", area: "season" },
  { id: "channels", label: "Kanäle", group: "Inhalte & Kommunikation", area: "channels" },
  { id: "settings", label: "Einstellungen", group: "Verwaltung", area: "settings" },
  { id: "website", label: "Website", group: "Verwaltung", area: "website" },
  { id: "users", label: "Accounts", group: "Verwaltung", area: "roles" },
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
    window.setTimeout(() => setToast(""), 6000);
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
        wide
        kicker="Nur fürs Team"
        title="Staff-Center"
        lede="Dein interner Arbeitsbereich für Team, Support, Inhalte und Server-Verwaltung."
      />
      <SiteMascot home="team" bias="sit" align="end" line="Öffentliche Fragen beantworte ich auf den anderen Seiten." />
      <div className="shell-staff py-10">
        {!ready ? <p className="text-muted">Lade Zugang…</p> : null}
        {ready && !user ? <Login onIn={setUser} /> : null}
        {user?.mustChangePw ? (
          <ForcePassword user={user} onDone={setUser} note={note} />
        ) : user ? (
          <Desk user={user} onLogout={logout} note={note} />
        ) : null}
        {toast ? <p className="panel-in fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-md bg-brand px-4 py-2 text-sm text-fg shadow-lg">{toast}</p> : null}
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
      <button className="btn-brand mt-5 w-full" type="submit" disabled={busy}>
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
      <button className="btn-brand mt-4" type="submit">Speichern</button>
    </form>
  );
}

function Desk({ user, onLogout, note }: { user: StaffSession; onLogout: () => void; note: (text: string) => void }) {
  const real = user.role;
  const [view, setView] = useState<Role>(asRole(user.role));
  const shown = (real === "owner" ? view : user.role) as string;
  const [counts, setCounts] = useState({ reviews: 0, images: 0, help: 0 });
  useEffect(() => {
    let stop = false;
    void Promise.all([
      shallowCount("community_reviews"),
      shallowCount("community_images"),
      shallowCount("helpRequests"),
    ]).then(([reviews, images, help]) => {
      if (!stop) setCounts({ reviews, images, help });
    });
    return () => {
      stop = true;
    };
  }, []);
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
  const [chatOpen, setChatOpen] = useState(false);
  const safeTab = tabs.some((item) => item.id === tab) ? tab : tabs[0]?.id;
  const activeTab = tabs.find((item) => item.id === safeTab);
  const tabGroups = TAB_GROUPS.map((group) => ({
    group,
    items: tabs.filter((item) => item.group === group),
  })).filter((group) => group.items.length > 0);
  const helpRows = useLive<ModItem>("helpRequests");
  const helpOpen = Object.values(helpRows).filter((item) => item && !item.archived && item.status !== "erledigt").length;
  const badges: Partial<Record<Tab, number>> = { help: helpOpen };

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

  const showChat = can(shown, "chat") && can(real, "chat");
  const seeTeamChat = showChat && shown !== "builder";
  const seeBuilderChat = showChat && (shown === "builder" || shown === "owner" || shown === "admin" || shown === "helper" || shown === "supporter");

  return (
    <div>
      <section className="card card-still grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-12 shrink-0 place-items-center rounded-full border border-brand/40 bg-brand/10 text-lg font-semibold text-ice"
          >
            {user.username.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-faint">Angemeldet als</p>
            <p className="truncate text-lg font-semibold text-fg">{user.username}</p>
            <p className="text-sm text-muted">{roleLabel(real)}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: "Rezensionen", count: counts.reviews },
            { label: "Bilder", count: counts.images },
            { label: "Tickets", count: counts.help },
          ].map((item) => (
            <div
              key={item.label}
              className="min-w-0 rounded-md border border-line/80 bg-bg/50 px-3 py-2 text-center"
            >
              <p className="text-lg font-semibold tabular-nums text-fg">{item.count}</p>
              <p className="truncate text-xs text-muted">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 lg:col-span-2 lg:justify-end">
          {can(shown, "help") ? (
            <button type="button" className="btn-ghost" onClick={() => void askHelp(user, note)}>
              Hilfe rufen
            </button>
          ) : null}
          <button type="button" className="btn-ghost" onClick={onLogout}>
            Abmelden
          </button>
        </div>
      </section>
      {real === "owner" ? (
        <div className="mt-4 flex flex-col gap-3 rounded-md border border-line/70 bg-surface/60 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-fg">Rollen-Vorschau</p>
            <p className="text-xs text-muted">Nur für dich – deine echte Rolle bleibt unverändert.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                aria-pressed={shown === role}
                className={
                  shown === role
                    ? "btn-brand min-h-9 px-3 py-1 text-xs"
                    : "btn-ghost min-h-9 px-3 py-1 text-xs"
                }
                onClick={() => setView(role)}
              >
                {roleLabel(role)}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {real === "owner" || real === "admin" ? <LiveNotices note={note} /> : null}
      {shown === "streamer" ? null : <PlayerSearch />}
      {real === "owner" ? <CheckInBanner /> : null}
      <div className={`mt-6 grid min-w-0 items-start gap-5 ${showChat ? "lg:grid-cols-[16rem_minmax(0,1fr)_22rem]" : "lg:grid-cols-[16rem_minmax(0,1fr)]"}`}>
        <nav
          className="card card-still min-w-0 p-2 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
          aria-label="Team-Bereiche"
        >
          {can(shown, "console") && can(real, "console") ? (
            <a className="btn-brand mb-2 flex min-h-10 items-center justify-center" href="https://panel.alpensmp.net/" target="_blank" rel="noopener noreferrer">
              Konsole
            </a>
          ) : null}
          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-3 lg:overflow-visible lg:pb-0">
            {tabGroups.map(({ group, items }) => (
              <section key={group} className="shrink-0 lg:shrink">
                <h2 className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
                  {group}
                </h2>
                <div className="flex gap-1 lg:flex-col">
                  {items.map((item) => {
                    const count = badges[item.id] || 0;
                    const selected = item.id === safeTab;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-current={selected ? "page" : undefined}
                        className={`flex min-h-10 items-center justify-between gap-3 whitespace-nowrap rounded-md px-3 py-2 text-left text-sm transition-colors lg:w-full lg:whitespace-normal ${
                          selected
                            ? "border border-brand/40 bg-brand/10 font-semibold text-fg lg:border-y-0 lg:border-r-0 lg:border-l-2 lg:pl-[calc(0.75rem-2px)]"
                            : "border border-transparent text-muted hover:bg-surface-2 hover:text-fg"
                        }`}
                        onClick={() => setTab(item.id)}
                      >
                        <span>{item.label}</span>
                        {count > 0 ? (
                          <span className="inline-flex min-w-5 justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">
                            {count}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </nav>
        <section className="min-w-0">
          {activeTab ? (
            <header className="mb-4 flex items-end justify-between gap-3 px-1">
              <div>
                <p className="kicker">{activeTab.group}</p>
                <h2 className="display mt-1 text-2xl text-fg">{activeTab.label}</h2>
              </div>
              <p className="shrink-0 text-xs text-faint">
                {tabs.findIndex((item) => item.id === safeTab) + 1} / {tabs.length} Bereiche
              </p>
            </header>
          ) : null}
          <div className="panel-in min-w-0 px-1" key={safeTab}>
            {safeTab === "moderation" ? (
              <Moderation
                user={user}
                note={note}
                ban={can(shown, "moderation") && can(real, "moderation")}
                writeNotes={can(shown, "notes") && can(real, "notes")}
              />
            ) : null}
            {safeTab === "help" ? (
              <HelpDesk
                user={user}
                note={note}
                act={can(shown, "helpAct") && can(real, "helpAct")}
                moderate={can(shown, "moderation") && can(real, "moderation")}
              />
            ) : null}
            {safeTab === "commands" ? (
              <div className="space-y-6">
                {can(shown, "commandsRead") ? <PlayerCommandEditor real={real} view={shown} note={note} /> : null}
                {can(shown, "staffCommands") ? <Commands user={user} view={shown} note={note} /> : null}
              </div>
            ) : null}
            {safeTab === "community" ? <Community user={user} note={note} /> : null}
            {safeTab === "rules" ? (
              <div className="space-y-4">
                <RulesEditor real={real} view={shown} note={note} />
                {can(real, "rulesEdit") && shown === "owner" ? (
                  <RulesEditor real={real} view={shown} note={note} staff />
                ) : null}
              </div>
            ) : null}
            {safeTab === "ban" ? <BanGuideEditor real={real} view={shown} note={note} /> : null}
            {safeTab === "tasks" ? (
              <TasksBoard real={real} view={shown} note={note} username={user.username} />
            ) : null}
            {safeTab === "absence" ? (
              <AbsenceBoard real={real} view={shown} note={note} username={user.username} />
            ) : null}
            {safeTab === "guide" ? <GuideEditor real={real} view={shown} note={note} /> : null}
            {safeTab === "roster" ? <Roster owner={real === "owner"} /> : null}
            {safeTab === "settings" ? <Settings user={user} note={note} /> : null}
            {safeTab === "news" ? <NewsEditor user={user} note={note} /> : null}
            {safeTab === "status" ? <StatusDesk user={user} note={note} /> : null}
            {safeTab === "stream" ? <StreamDesk user={user} note={note} /> : null}
            {safeTab === "season" ? <SeasonDesk note={note} /> : null}
            {safeTab === "channels" ? <ChannelsDesk note={note} /> : null}
            {safeTab === "website" ? <Website user={user} note={note} /> : null}
            {safeTab === "archive" ? <Archive user={user} note={note} /> : null}
            {safeTab === "users" ? <Accounts note={note} actor={user} /> : null}
          </div>
        </section>
        {showChat ? (
          <div className="sticky top-24 hidden h-[min(72vh,680px)] min-w-0 lg:block">
            <StaffChat user={user} team={seeTeamChat} builder={seeBuilderChat} dock />
          </div>
        ) : null}
      </div>
      {showChat ? (
        <>
          <button type="button" className="btn-brand fixed bottom-24 right-3 z-40 lg:hidden" onClick={() => setChatOpen(true)}>
            Chat
          </button>
          {chatOpen ? (
            <div className="fixed inset-3 z-50 flex flex-col lg:hidden">
              <button type="button" className="btn-ghost mb-2 self-end" onClick={() => setChatOpen(false)}>Schliessen</button>
              <div className="min-h-0 flex-1">
                <StaffChat user={user} team={seeTeamChat} builder={seeBuilderChat} dock />
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

async function askHelp(user: StaffSession, note: (text: string) => void) {
  const msg = window.prompt("Was brauchst du?");
  if (!msg) return;
  await fbPush("helpRequests", { by: user.username, msg, ts: Date.now(), replies: {}, status: "open" });
  note("Hilfe gesendet");
}

