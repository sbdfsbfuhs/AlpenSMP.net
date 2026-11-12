import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { PageHero, Shell } from "@/components/site/shell";
import { SiteMascot } from "@/components/site/assistant";
import { StaffChat } from "@/components/site/staff-chat";
import { PlayerSearch } from "@/components/site/staff-search";
import { useLive } from "@/components/site/staff-live";
import { can, roleLabel, ROLES, asRole, type Role } from "@/lib/alpen/roles";
import { moveStaffLayoutTab, normalizeStaffLayout, reorderStaffLayoutTab, type StaffLayout } from "@/lib/alpen/staff-layout";
import { sendPasswordResetEmail } from "@/lib/alpen/fb-auth";

const AbsenceBoard = lazy(() => import("@/components/site/staff-extra").then((m) => ({ default: m.AbsenceBoard })));
const BanGuideEditor = lazy(() => import("@/components/site/staff-extra").then((m) => ({ default: m.BanGuideEditor })));
const GuideEditor = lazy(() => import("@/components/site/staff-extra").then((m) => ({ default: m.GuideEditor })));
const PlayerCommandEditor = lazy(() => import("@/components/site/staff-player-commands").then((m) => ({ default: m.PlayerCommandEditor })));
const RulesEditor = lazy(() => import("@/components/site/staff-extra").then((m) => ({ default: m.RulesEditor })));
const TasksBoard = lazy(() => import("@/components/site/staff-extra").then((m) => ({ default: m.TasksBoard })));
const LiveNotices = lazy(() => import("@/components/site/staff-broadcast").then((m) => ({ default: m.LiveNotices })));
const NewsEditor = lazy(() => import("@/components/site/staff-broadcast").then((m) => ({ default: m.NewsEditor })));
const SeasonDesk = lazy(() => import("@/components/site/staff-broadcast").then((m) => ({ default: m.SeasonDesk })));
const StatusDesk = lazy(() => import("@/components/site/staff-broadcast").then((m) => ({ default: m.StatusDesk })));
const StreamDesk = lazy(() => import("@/components/site/staff-broadcast").then((m) => ({ default: m.StreamDesk })));
const Accounts = lazy(() => import("@/components/site/staff-accounts").then((m) => ({ default: m.Accounts })));
const Archive = lazy(() => import("@/components/site/staff-archive").then((m) => ({ default: m.Archive })));
const ChannelsDesk = lazy(() => import("@/components/site/staff-channels").then((m) => ({ default: m.ChannelsDesk })));
const Commands = lazy(() => import("@/components/site/staff-commands").then((m) => ({ default: m.Commands })));
const Community = lazy(() => import("@/components/site/staff-community").then((m) => ({ default: m.Community })));
const HelpDesk = lazy(() => import("@/components/site/staff-help").then((m) => ({ default: m.HelpDesk })));
const Moderation = lazy(() => import("@/components/site/staff-moderation").then((m) => ({ default: m.Moderation })));
const Roster = lazy(() => import("@/components/site/staff-roster").then((m) => ({ default: m.Roster })));
const Settings = lazy(() => import("@/components/site/staff-settings").then((m) => ({ default: m.Settings })));
const Website = lazy(() => import("@/components/site/staff-website").then((m) => ({ default: m.Website })));
import { latestStaffBackup, rememberStaffBackup, downloadStaffBackup, type StaffBackup } from "@/lib/alpen/backup";
import {
  fbGet,
  fbPush,
  fbRemove,
  fbSet,
  fbUpdate,
  formatWhen,
  shouldArchivePermanentBan,
  loginStaff,
  executeMinecraftUnban,
  fetchMinecraftPlayersSnapshot,
  minecraftBanKey,
  readSession,
  savePassword,
  writeSession,
  type MinecraftBan,
  type MinecraftPlayersSnapshot,
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

const TABS: { id: Tab; label: string; group: TabGroup; area: TabArea }[] = [
  { id: "moderation", label: "Moderation", group: "Moderation & Support", area: "moderation" },
  { id: "roster", label: "Team", group: "Team", area: "roster" },
  { id: "absence", label: "Abwesenheit", group: "Team", area: "absence" },
  { id: "tasks", label: "Aufgaben", group: "Team", area: "tasks" },
  { id: "help", label: "Support-Anfragen", group: "Moderation & Support", area: "help" },
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

const DEFAULT_LAYOUT = normalizeStaffLayout(
  null,
  TABS.map((item) => item.id),
  ["moderation", "roster", "absence"],
);

function StaffPage() {
  const [user, setUser] = useState<StaffSession | null>(null);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");
  const [liveErrors, setLiveErrors] = useState<Array<{ code: string; message: string }>>([]);
  const [bootstrapError, setBootstrapError] = useState("");
  const toastTimer = useRef<number | null>(null);

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
      .catch((error: unknown) => {
        console.error("[Staff Center] AUTH-STAFF-001: Staff-Zugang konnte nicht verifiziert werden.", error);
        setBootstrapError(`Fehlercode AUTH-STAFF-001: Der Teamzugang konnte nicht verifiziert werden. Bitte Verbindung prüfen und erneut laden.`);
        setUser(null);
        setReady(true);
      });
  }, []);

  useEffect(() => {
    const onLiveError = (event: Event) => {
      const { code, message } = (event as CustomEvent<{ code: string; message: string }>).detail;
      setLiveErrors((current) => current.some((item) => item.code === code) ? current : [...current, { code, message }]);
    };
    const onLiveResolved = (event: Event) => {
      const { code } = (event as CustomEvent<{ code: string }>).detail;
      setLiveErrors((current) => current.filter((item) => item.code !== code));
    };
    window.addEventListener("staff-live:error", onLiveError);
    window.addEventListener("staff-live:resolved", onLiveResolved);
    return () => {
      window.removeEventListener("staff-live:error", onLiveError);
      window.removeEventListener("staff-live:resolved", onLiveResolved);
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    };
  }, []);

  function note(text: string) {
    setToast(text);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToast("");
      toastTimer.current = null;
    }, 6000);
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
        lede="Moderation zuerst. Team und Abwesenheiten sind direkt erreichbar; alle weiteren Werkzeuge bleiben unter „Weitere Bereiche“."
      />
      <SiteMascot home="team" bias="sit" align="end" line="Öffentliche Fragen beantworte ich auf den anderen Seiten." />
      <div className="shell-staff py-10">
        {liveErrors.length ? (
          <div className="mb-5 space-y-2" role="alert" aria-live="assertive">
            {liveErrors.map(({ code, message }) => (
              <p key={code} className="rounded-xl border border-red-500/60 bg-red-950/60 px-4 py-3 text-sm text-red-100">
                Live-Daten konnten nicht geladen werden. Fehlercode <strong>{code}</strong>: {message}
              </p>
            ))}
          </div>
        ) : null}
        {bootstrapError ? (
          <p role="alert" className="mb-5 rounded-xl border border-red-500/60 bg-red-950/60 px-4 py-3 text-sm text-red-100">
            {bootstrapError}
          </p>
        ) : null}
        {!ready ? <p className="text-muted">Lade Zugang…</p> : null}
        {ready && !user ? <Login onIn={(next) => {
          setBootstrapError("");
          setUser(next);
        }} /> : null}
        {user?.mustChangePw ? (
          <ForcePassword user={user} onDone={setUser} note={note} />
        ) : user ? (
          <Desk user={user} onLogout={logout} note={note} />
        ) : null}
        {toast ? <p role="status" className="panel-in fixed bottom-6 left-1/2 z-[80] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-md bg-brand px-4 py-2 text-sm text-fg shadow-lg">{toast}</p> : null}
      </div>
    </Shell>
  );
}

function Login({ onIn }: { onIn: (user: StaffSession) => void }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryBusy, setRecoveryBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const session = await loginStaff(name, password);
      writeSession(session);
      void fbSet(`presence/${session.username}`, { username: session.username, role: session.role, online: true, lastSeen: Date.now() }).catch(() => undefined);
      onIn(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Zugang ungültig");
    } finally {
      setBusy(false);
    }
  }

  async function recover(event: FormEvent) {
    event.preventDefault();
    setRecoveryBusy(true);
    setRecoveryMessage("");
    setRecoveryError("");
    try {
      await sendPasswordResetEmail(recoveryEmail);
      setRecoveryMessage("Falls ein Konto zu dieser Adresse gehört, wurde ein Passwort-Link gesendet.");
    } catch (err) {
      setRecoveryError(err instanceof Error ? err.message : "Der Passwort-Link konnte nicht angefordert werden.");
    } finally {
      setRecoveryBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <form className="card card-still panel-in p-6" onSubmit={submit}>
        <h2 className="text-xl font-semibold">Anmelden</h2>
        <p className="mt-2 text-sm text-muted">Melde dich mit der persönlichen E-Mail-Adresse deines Accounts und deinem Passwort an. Bei älteren Konten funktioniert übergangsweise auch der Teamname. Deine E-Mail-Adresse wird nicht öffentlich für die Teamnamen-Suche bereitgestellt.</p>
        <label className="mt-5 block text-sm">
          Persönliche E-Mail-Adresse oder älterer Teamname
          <input className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} autoComplete="username" required />
        </label>
        <label className="mt-3 block text-sm">
          Passwort
          <input className="field mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        {error ? <p className="mt-3 text-sm text-ember">{error}</p> : null}
        <button className="btn-brand mt-5 w-full" type="submit" disabled={busy}>
          {busy ? "Prüfe…" : "Rein"}
        </button>
      </form>
      <form className="card card-still p-6" onSubmit={recover}>
        <h2 className="text-lg font-semibold">Passwort vergessen?</h2>
        <p className="mt-2 text-sm text-muted">Wir senden einen Link an die persönliche E-Mail-Adresse deines Accounts.</p>
        <label className="mt-4 block text-sm">
          E-Mail-Adresse
          <input className="field mt-1" type="email" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} autoComplete="email" required />
        </label>
        {recoveryMessage ? <p className="mt-3 text-sm text-muted" role="status">{recoveryMessage}</p> : null}
        {recoveryError ? <p className="mt-3 text-sm text-ember" role="alert">{recoveryError}</p> : null}
        <button className="btn-ghost mt-4 w-full" type="submit" disabled={recoveryBusy}>
          {recoveryBusy ? "Sende…" : "Passwort-Link anfordern"}
        </button>
      </form>
    </div>
  );
}

function ForcePassword({ user, onDone, note }: { user: StaffSession; onDone: (user: StaffSession) => void; note: (text: string) => void }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [error, setError] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!a) return setError("Passwort fehlt");
    if (a !== b) return setError("Stimmt nicht überein");
    if (a.length < 6) return setError("Mindestens 6 Zeichen");
    try {
      await savePassword(user.username, a);
    } catch (err) {
      return setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    }
    const next = { ...user, mustChangePw: false };
    writeSession(next);
    onDone(next);
    note("Passwort gespeichert");
  }

  return (
    <form className="card card-still mx-auto max-w-md p-6" onSubmit={save}>
      <h2 className="text-xl font-semibold">Anmeldung hat geklappt</h2>
      <p className="mt-2 text-sm text-muted">Das Startpasswort gilt nur für diesen Schritt. Danach ein eigenes Passwort setzen, mindestens 6 Zeichen. Erst dann geht das Team-Panel auf.</p>
      <input className="field mt-4" type="password" value={a} onChange={(e) => setA(e.target.value)} placeholder="Neues Passwort" />
      <input className="field mt-3" type="password" value={b} onChange={(e) => setB(e.target.value)} placeholder="Wiederholen" />
      {error ? <p className="mt-3 text-sm text-ember">{error}</p> : null}
      <button className="btn-brand mt-4" type="submit">Speichern</button>
    </form>
  );
}

function Desk({ user, onLogout, note }: { user: StaffSession; onLogout: () => void; note: (text: string) => void }) {
  const real = user.role;
  const [view, setView] = useState<Role>(asRole(user.role));
  const shown = (real === "owner" ? view : user.role) as string;
  const previewing = shown !== real;
  const displayedUser = previewing ? { ...user, role: shown } : user;
  const [staffLayout, setStaffLayout] = useState<StaffLayout>(DEFAULT_LAYOUT);
  const [layoutLoading, setLayoutLoading] = useState(true);
  const [layoutSaving, setLayoutSaving] = useState(false);
  const [layoutError, setLayoutError] = useState("");
  const layoutWriteQueue = useRef<Promise<void>>(Promise.resolve());
  const layoutWriteRevision = useRef(0);
  const tabs = TABS.filter((item) => {
    if (item.id === "moderation") return can(shown, "moderation") || can(shown, "moderationRead") || can(shown, "notes");
    if (item.id === "commands") return can(shown, "commandsRead") || can(shown, "staffCommands");
    if (item.id === "rules") return can(shown, "rulesRead") || can(shown, "rulesEdit");
    return can(shown, item.area);
  });
  const orderedTabs = [...staffLayout.quickTabs, ...staffLayout.moreTabs]
    .map((id) => tabs.find((item) => item.id === id))
    .filter((item): item is (typeof tabs)[number] => Boolean(item));
  const quickTabs = staffLayout.quickTabs
    .map((id) => tabs.find((item) => item.id === id))
    .filter((item): item is (typeof tabs)[number] => Boolean(item));
  const otherTabs = staffLayout.moreTabs
    .map((id) => tabs.find((item) => item.id === id))
    .filter((item): item is (typeof tabs)[number] => Boolean(item));
  const canReadMinecraft = can(shown, "moderationRead") && can(real, "moderationRead");
  const canSyncMinecraft = can(shown, "moderation") && can(real, "moderation");
  const [minecraftPlayers, setMinecraftPlayers] = useState<string[]>([]);
  const [minecraftBans, setMinecraftBans] = useState<MinecraftBan[]>([]);
  const banRows = useLive<ModItem>("bans");
  const warnRows = useLive<ModItem>("warns");
  const autoArchiveFailures = useRef(new Map<string, number>());
  useEffect(() => {
    if (!can(real, "moderation")) return;
    const now = Date.now();
    const archiveAutomatically = (path: string, key: string, body: Partial<ModItem>) => {
      const record = `${path}/${key}`;
      if ((autoArchiveFailures.current.get(record) || 0) > now - 60_000) return;
      autoArchiveFailures.current.set(record, now);
      void fbUpdate(record, body).catch((err) => {
        autoArchiveFailures.current.set(record, Date.now());
        note(err instanceof Error ? `Automatische Archivierung fehlgeschlagen: ${err.message}` : "Automatische Archivierung fehlgeschlagen.");
      });
    };
    for (const [key, item] of Object.entries(banRows)) {
      if (!shouldArchivePermanentBan(item, now)) continue;
      archiveAutomatically("bans", key, {
        archived: true,
        archivedBy: "system",
        archivedAt: now,
        archiveReason: "Permanent, automatisch nach 24 Stunden",
        updatedAt: now,
      });
    }
    for (const [key, item] of Object.entries(warnRows)) {
      if (item.archived || !item.endsAt || item.endsAt > now) continue;
      archiveAutomatically("warns", key, {
        archived: true,
        archivedBy: "system",
        archivedAt: now,
        archiveReason: "Warnung abgelaufen",
        updatedAt: now,
      });
    }
  }, [banRows, warnRows, real, note]);
  const [tab, setTab] = useState<Tab>(() => {
    if (typeof window === "undefined") return "moderation";
    const saved = window.sessionStorage.getItem("alpen-team-tab");
    return (saved as Tab) || "moderation";
  });
  const [chatOpen, setChatOpen] = useState(false);
  const safeTab = tabs.some((item) => item.id === tab) ? tab : orderedTabs[0]?.id;
  const activeTab = tabs.find((item) => item.id === safeTab);
  useEffect(() => {
    let active = true;
    setLayoutLoading(true);
    setLayoutError("");
    layoutWriteQueue.current = Promise.resolve();
    void fbGet<unknown>(`staffUsers/${user.username}/teamCenterLayout`)
      .then((saved) => {
        if (active) {
          setStaffLayout(normalizeStaffLayout(saved, TABS.map((item) => item.id), DEFAULT_LAYOUT.quickTabs));
        }
      })
      .catch((error: unknown) => {
        console.error("[Staff Center] LAYOUT-001: Persönliche Navigation konnte nicht geladen werden.", error);
        if (active) setLayoutError("Fehlercode LAYOUT-001: Deine gespeicherte Navigation konnte nicht geladen werden. Die Standardansicht wird verwendet.");
      })
      .finally(() => {
        if (active) setLayoutLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user.username]);

  function saveStaffLayout(next: StaffLayout) {
    setStaffLayout(next);
    setLayoutError("");
    setLayoutSaving(true);
    const revision = ++layoutWriteRevision.current;
    const path = `staffUsers/${user.username}/teamCenterLayout`;
    layoutWriteQueue.current = layoutWriteQueue.current
      .catch(() => undefined)
      .then(() => fbSet(path, next))
      .then(() => {
        if (layoutWriteRevision.current === revision) setLayoutSaving(false);
      })
      .catch((error: unknown) => {
        console.error("[Staff Center] LAYOUT-002: Persönliche Navigation konnte nicht gespeichert werden.", error);
        if (layoutWriteRevision.current === revision) {
          setLayoutSaving(false);
          setLayoutError("Fehlercode LAYOUT-002: Deine Anpassung konnte nicht gespeichert werden. Prüfe Verbindung und Berechtigung.");
        }
      });
  }
  useEffect(() => {
    if (safeTab) window.sessionStorage.setItem("alpen-team-tab", safeTab);
  }, [safeTab]);
  useEffect(() => {
    const y = Number(window.sessionStorage.getItem("alpen-team-scroll") || 0);
    if (!y) return;
    const id = window.requestAnimationFrame(() => window.scrollTo(0, y));
    return () => window.cancelAnimationFrame(id);
  }, []);
  useEffect(() => {
    const onScroll = () => window.sessionStorage.setItem("alpen-team-scroll", String(window.scrollY));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const otherGroups = [...new Set(otherTabs.map((item) => item.group))];
  const helpRows = useLive<ModItem>("helpRequests");
  const absenceRows = useLive<ModItem>("absences");
  const seen = readSeen(user.username);
  const fresh = (rows: Record<string, ModItem>, since: number) =>
    Object.values(rows).filter((item) => item && !item.archived && (item.ts || item.updatedAt || 0) > since).length;
  const badges: Partial<Record<Tab, number>> = {
    moderation: safeTab === "moderation" ? 0 : fresh(banRows, seen.moderation || 0),
    absence: safeTab === "absence" ? 0 : fresh(absenceRows, seen.absence || 0),
    help: safeTab === "help" ? 0 : fresh(helpRows, seen.help || 0),
  };
  useEffect(() => {
    if (safeTab !== "moderation" && safeTab !== "absence" && safeTab !== "help") return;
    const next = readSeen(user.username);
    next[safeTab] = Date.now();
    window.localStorage.setItem(seenKey(user.username), JSON.stringify(next));
  }, [safeTab, user.username]);

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
  const dockChat = showChat && safeTab !== "moderation";
  const seeTeamChat = showChat && shown !== "builder";
  const seeBuilderChat = showChat && (shown === "builder" || shown === "owner" || shown === "admin" || shown === "helper" || shown === "supporter");

  function layoutItems(list: keyof StaffLayout) {
    const ids = staffLayout[list].filter((id) => tabs.some((item) => item.id === id));
    const destination = list === "quickTabs" ? "moreTabs" : "quickTabs";
    return ids.map((id, index) => {
      const item = tabs.find((candidate) => candidate.id === id);
      if (!item) return null;
      return (
        <li key={id} className="staff-layout-item">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-fg">{item.label}</p>
            <p className="text-xs text-faint">{item.group}</p>
          </div>
          <div className="staff-layout-actions">
            <button type="button" className="staff-layout-action" disabled={layoutLoading || index === 0} aria-label={`${item.label} nach oben`} onClick={() => saveStaffLayout(reorderStaffLayoutTab(staffLayout, list, id, -1))}>↑</button>
            <button type="button" className="staff-layout-action" disabled={layoutLoading || index === ids.length - 1} aria-label={`${item.label} nach unten`} onClick={() => saveStaffLayout(reorderStaffLayoutTab(staffLayout, list, id, 1))}>↓</button>
            <button type="button" className="staff-layout-move" disabled={layoutLoading} onClick={() => saveStaffLayout(moveStaffLayoutTab(staffLayout, id, destination))}>
              {destination === "quickTabs" ? "Anheften" : "Aus Schnellzugriff"}
            </button>
          </div>
        </li>
      );
    });
  }

  return (
    <div>
      <section className="staff-profile card card-still grid gap-4 p-4 sm:p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
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
            <p className="text-sm text-muted">{roleLabel(shown)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {can(shown, "help") ? (
            <button type="button" className="btn-ghost" disabled={previewing} onClick={() => void askHelp(user, note)}>
              Teamhilfe anfordern
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
            <p className="text-xs text-muted">Nur für dich – deine echte Rolle bleibt unverändert. {previewing ? `Vorschau als ${roleLabel(shown)}, schreibgeschützt.` : ""}</p>
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
        {shown === "owner" ? <div inert={previewing}><StaffBackup /></div> : null}
        {shown === "owner" || shown === "admin" ? (
          <Suspense fallback={null}>
            <div inert={previewing}><LiveNotices note={note} /></div>
          </Suspense>
        ) : null}
      <div className="staff-layout mt-5 min-w-0">
        <nav className="staff-nav" aria-label="Team-Bereiche">
          <div className="staff-primary-nav">
            {quickTabs.map((item) => {
              const count = badges[item.id] || 0;
              const selected = item.id === safeTab;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={selected ? "page" : undefined}
                  className={`staff-nav-button${selected ? " is-active" : ""}`}
                  onClick={() => setTab(item.id)}
                >
                  <span>{item.label}</span>
                  {count > 0 ? <span className="staff-nav-badge">{count}</span> : null}
                </button>
              );
            })}
          </div>
          {otherTabs.length ? (
            <details className="staff-more">
              <summary>Weitere Bereiche <span className="staff-more-count">{otherTabs.length}</span></summary>
              <div className="staff-more-panel">
                {otherGroups.map((group) => (
                  <section key={group} className="staff-more-group">
                    <h2>{group}</h2>
                    <div className="staff-more-items">
                      {otherTabs.filter((item) => item.group === group).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          aria-current={item.id === safeTab ? "page" : undefined}
                          className={`staff-more-button${item.id === safeTab ? " is-active" : ""}`}
                          onClick={(event) => {
                            setTab(item.id);
                            event.currentTarget.closest("details")?.removeAttribute("open");
                          }}
                        >
                          {item.label}
                          {(badges[item.id] || 0) > 0 ? <span className="staff-nav-badge">{badges[item.id]}</span> : null}
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </details>
          ) : null}
          <details className="staff-customize" inert={layoutLoading || previewing}>
            <summary>
              Ansicht anpassen
            </summary>
            <div className="staff-customize-panel">
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold">Deine Navigation</h2>
                  <p className="mt-1 text-xs text-muted">Nur für {user.username}. Änderungen werden mit deinem Teamkonto synchronisiert.</p>
                </div>
                <p className="text-xs text-faint" role="status" aria-live="polite">
                  {previewing ? "In der Rollen-Vorschau nicht änderbar" : layoutLoading ? "Lade Ansicht…" : layoutSaving ? "Speichere…" : "Gespeichert"}
                </p>
              </header>
              <div className="staff-layout-columns">
                <section>
                  <h3>Schnellzugriff</h3>
                  <p className="staff-layout-hint">Reihenfolge der Hauptnavigation</p>
                  <ol className="staff-layout-list">{layoutItems("quickTabs")}</ol>
                  {!staffLayout.quickTabs.length ? <p className="staff-layout-empty">Noch keine Bereiche angeheftet.</p> : null}
                </section>
                <section>
                  <h3>Weitere Bereiche</h3>
                  <p className="staff-layout-hint">Bleiben immer über „Weitere Bereiche“ erreichbar</p>
                  <ol className="staff-layout-list">{layoutItems("moreTabs")}</ol>
                  {!staffLayout.moreTabs.some((id) => tabs.some((item) => item.id === id)) ? <p className="staff-layout-empty">Alle verfügbaren Bereiche sind im Schnellzugriff.</p> : null}
                </section>
              </div>
            </div>
          </details>
          {can(shown, "console") ? (
            previewing ? (
              <span className="staff-console-link" aria-disabled="true">Control Center · Vorschau</span>
            ) : (
              <a className="staff-console-link" href="https://panel.alpensmp.net/" target="_blank" rel="noopener noreferrer">
                Control Center
              </a>
            )
          ) : null}
        </nav>
        {layoutError ? <p className="mt-2 rounded-lg border border-red-500/60 bg-red-950/50 px-3 py-2 text-sm text-red-100" role="alert">{layoutError}</p> : null}
        <section inert={previewing} className="staff-content min-w-0">
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
          {canReadMinecraft ? (
          <MinecraftBanList
            canSync={canSyncMinecraft}
            actor={user.username}
            visible={safeTab === "moderation"}
            onPlayersChange={setMinecraftPlayers}
            onBansChange={setMinecraftBans}
          />
          ) : null}
          <Suspense fallback={<p className="text-sm text-muted">Lade Bereich…</p>}>
          <div className="panel-in min-w-0 px-1" key={safeTab}>
            {safeTab === "moderation" ? (
              <>
                <Moderation
                  user={displayedUser}
                  note={note}
                  ban={can(shown, "moderation") && can(real, "moderation")}
                  writeNotes={can(shown, "notes") && can(real, "notes")}
                  players={minecraftPlayers}
                  minecraftBans={minecraftBans}
                />
                {shown !== "streamer" ? (
                  <details className="staff-utility-search mt-4">
                    <summary>Spieler-Akte durchsuchen</summary>
                    <PlayerSearch />
                  </details>
                ) : null}
              </>
            ) : null}
            {safeTab === "help" ? (
              <HelpDesk
              user={displayedUser}
                note={note}
                act={can(shown, "helpAct") && can(real, "helpAct")}
                moderate={can(shown, "moderation") && can(real, "moderation")}
              />
            ) : null}
            {safeTab === "commands" ? (
              <div className="space-y-6">
                {can(shown, "commandsRead") ? <PlayerCommandEditor real={real} view={shown} username={user.username} note={note} /> : null}
                {can(shown, "staffCommands") ? <Commands user={displayedUser} view={shown} note={note} /> : null}
              </div>
            ) : null}
            {safeTab === "community" ? <Community user={displayedUser} note={note} /> : null}
            {safeTab === "rules" ? (
              <div className="space-y-4">
                <RulesEditor real={shown} view={shown} note={note} />
                {can(shown, "rulesEdit") && shown === "owner" ? (
                  <RulesEditor real={shown} view={shown} note={note} staff />
                ) : null}
              </div>
            ) : null}
            {safeTab === "ban" ? <BanGuideEditor real={shown} view={shown} note={note} /> : null}
            {safeTab === "tasks" ? (
              <TasksBoard real={shown} view={shown} note={note} username={user.username} />
            ) : null}
            {safeTab === "absence" ? (
              <AbsenceBoard real={shown} view={shown} note={note} username={user.username} />
            ) : null}
            {safeTab === "guide" ? <GuideEditor real={shown} view={shown} note={note} /> : null}
            {safeTab === "roster" ? <Roster owner={shown === "owner"} /> : null}
            {safeTab === "settings" ? <Settings user={displayedUser} note={note} /> : null}
            {safeTab === "news" ? <NewsEditor user={displayedUser} note={note} /> : null}
            {safeTab === "status" ? <StatusDesk user={displayedUser} note={note} /> : null}
            {safeTab === "stream" ? <StreamDesk user={displayedUser} note={note} /> : null}
            {safeTab === "season" ? <SeasonDesk note={note} /> : null}
            {safeTab === "channels" ? <ChannelsDesk note={note} /> : null}
            {safeTab === "website" ? <Website user={displayedUser} note={note} /> : null}
            {safeTab === "archive" ? <Archive user={displayedUser} note={note} /> : null}
            {safeTab === "users" ? <Accounts note={note} actor={displayedUser} /> : null}
          </div>
          </Suspense>
        </section>
        {dockChat ? (
          <div inert={previewing} className="sticky top-20 hidden h-[calc(100vh-6rem)] min-w-0 xl:block">
            <StaffChat user={displayedUser} team={seeTeamChat} builder={seeBuilderChat} dock />
          </div>
        ) : null}
      </div>
      {showChat ? (
        <>
          <button
            type="button"
            inert={previewing}
            className={`btn-brand fixed bottom-24 right-3 z-40 ${safeTab === "moderation" ? "" : "xl:hidden"}`}
            aria-expanded={chatOpen}
            onClick={() => setChatOpen(true)}
          >
            Chat
          </button>
          {chatOpen ? (
            <div className="fixed inset-3 z-50 flex flex-col xl:inset-y-6 xl:left-auto xl:right-6 xl:w-[26rem]">
              <button type="button" className="btn-ghost mb-2 self-end" onClick={() => setChatOpen(false)}>Schliessen</button>
              <div inert={previewing} className="min-h-0 flex-1">
                <StaffChat user={displayedUser} team={seeTeamChat} builder={seeBuilderChat} dock />
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function hasBanReason(value: string | null | undefined) {
  const reason = value?.trim() || "";
  return Boolean(reason && reason !== "–" && reason !== "-");
}

function minecraftBanDuration(ban: MinecraftBan) {
  const until = ban.until.trim();
  if (!until || /^(?:forever|never|permanent)$/i.test(until)) return { duration: "Permanent", endsAt: null };
  const endsAt = Date.parse(until);
  return Number.isFinite(endsAt)
    ? { duration: `bis ${formatWhen(endsAt)}`, endsAt }
    : { duration: `Ablauf: ${until}`, endsAt: null };
}

async function syncMinecraftBans(bans: MinecraftBan[]) {
  const rows = await fbGet<Record<string, ModItem>>("bans") || {};
  const records = new Map(
    Object.entries(rows)
      .filter(([, item]) => item.minecraftBanKey)
      .map(([id, item]) => [item.minecraftBanKey as string, [id, item] as const]),
  );
  const activeKeys = new Set(bans.map(minecraftBanKey));
  let imported = 0;
  let updated = 0;
  let archived = 0;

  for (const ban of bans) {
    const key = minecraftBanKey(ban);
    const pendingRecord = Object.entries(rows).find(([, item]) =>
      item.pendingMinecraftSync && item.name?.toLocaleLowerCase() === ban.name.toLocaleLowerCase(),
    );
    const existing = records.get(key) || (pendingRecord ? [pendingRecord[0], pendingRecord[1]] as const : undefined);
    const reason = hasBanReason(ban.reason) ? ban.reason.trim() : "";
    const { duration, endsAt } = minecraftBanDuration(ban);

    if (existing) {
      const [id, item] = existing;
      const patch: Partial<ModItem> = {};
      if (item.pendingMinecraftSync) {
        patch.minecraftBanKey = key;
        patch.pendingMinecraftSync = false;
        if (ban.source) patch.minecraftSource = ban.source;
        if (ban.uuid) patch.minecraftUuid = ban.uuid;
        if (ban.created) patch.minecraftCreated = ban.created;
        if (ban.until) patch.minecraftExpires = ban.until;
      }
      if (item.duration !== duration) patch.duration = duration;
      if (item.endsAt !== endsAt) patch.endsAt = endsAt;
      if (ban.uuid && item.minecraftUuid !== ban.uuid) patch.minecraftUuid = ban.uuid;
      if (ban.created && item.minecraftCreated !== ban.created) patch.minecraftCreated = ban.created;
      if (ban.source && item.minecraftSource !== ban.source) patch.minecraftSource = ban.source;
      if (ban.until && item.minecraftExpires !== ban.until) patch.minecraftExpires = ban.until;
      if (reason && (!hasBanReason(item.reason) || item.reasonSource === "minecraft") && item.reason !== reason) {
        patch.reason = reason;
        patch.reasonSource = "minecraft";
        patch.reasonAddedAt = item.reasonAddedAt || (ban.created && Number.isFinite(Date.parse(ban.created)) ? Date.parse(ban.created) : Date.now());
      } else if (reason && !item.reasonAddedAt) {
        patch.reasonAddedAt = ban.created && Number.isFinite(Date.parse(ban.created)) ? Date.parse(ban.created) : Date.now();
      }
      const reasonAddedAt = item.reasonAddedAt || (ban.created && Number.isFinite(Date.parse(ban.created)) ? Date.parse(ban.created) : Date.now());
      if (!item.archived && hasBanReason(reason) && Date.now() - reasonAddedAt >= 5 * 86_400_000) {
        patch.archived = true;
        patch.archiveReason = "Automatisch archiviert: Bann-Grund seit mindestens 5 Tagen eingetragen";
        patch.archivedBy = "System";
        patch.archivedAt = Date.now();
      }
      if (Object.keys(patch).length) {
        await fbUpdate(`bans/${id}`, patch);
        updated += 1;
      }
      records.set(key, [id, { ...item, ...patch }]);
      continue;
    }

    const body: ModItem = {
      name: ban.name,
      reason: reason || "–",
      duration,
      endsAt,
      minecraftBanKey: key,
      ...(ban.uuid ? { minecraftUuid: ban.uuid } : {}),
      ...(ban.created ? { minecraftCreated: ban.created } : {}),
      ...(ban.source ? { minecraftSource: ban.source } : {}),
      ...(ban.until ? { minecraftExpires: ban.until } : {}),
      ...(reason ? { reasonSource: "minecraft" } : {}),
      ...(reason ? { reasonAddedAt: ban.created && Number.isFinite(Date.parse(ban.created)) ? Date.parse(ban.created) : Date.now() } : {}),
      by: ban.source || "Minecraft",
      ts: ban.created && Number.isFinite(Date.parse(ban.created)) ? Date.parse(ban.created) : Date.now(),
    };
    const safeKey = [...key].map((character) => character.codePointAt(0)?.toString(16) || "0").join("_");
    const id = `minecraft_${safeKey}`;
    if (reason && body.reasonAddedAt && Date.now() - body.reasonAddedAt >= 5 * 86_400_000) {
      body.archived = true;
      body.archivedBy = "System";
      body.archivedAt = Date.now();
      body.archiveReason = "Automatisch archiviert: Bann-Grund seit mindestens 5 Tagen eingetragen";
    }
    await fbSet(`bans/${id}`, body);
    records.set(key, [id, body]);
    imported += 1;
  }

  for (const [id, item] of Object.entries(rows)) {
    if (!item.minecraftBanKey || item.archived || activeKeys.has(item.minecraftBanKey)) continue;
    await fbUpdate(`bans/${id}`, {
      archived: true,
      archivedBy: "Minecraft",
      archivedAt: Date.now(),
      archiveReason: "Nicht mehr in der Minecraft-Bannliste",
    });
    archived += 1;
  }

  return { imported, updated, archived };
}

function MinecraftBanList({
  canSync,
  actor,
  visible,
  onPlayersChange,
  onBansChange,
}: {
  canSync: boolean;
  actor: string;
  visible: boolean;
  onPlayersChange: (players: string[]) => void;
  onBansChange: (bans: MinecraftBan[]) => void;
}) {
  const [snapshot, setSnapshot] = useState<MinecraftPlayersSnapshot | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [unbanError, setUnbanError] = useState("");
  const [unbanMessage, setUnbanMessage] = useState("");
  const [unbanningName, setUnbanningName] = useState<string | null>(null);
  const [syncError, setSyncError] = useState("");
  const [syncMessage, setSyncMessage] = useState("");
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshRef = useRef<() => void>(() => undefined);
  const inFlight = useRef(false);
  const refreshAgain = useRef(false);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      if (inFlight.current) {
        refreshAgain.current = true;
        return;
      }
      inFlight.current = true;
      setLoading(true);
      try {
        const next = await fetchMinecraftPlayersSnapshot();
        if (!active) return;
        setSnapshot(next);
        onPlayersChange(next.players);
        onBansChange(next.bans);
        setError("");
        setUpdatedAt(Date.now());
        if (canSync) {
          try {
            const result = await syncMinecraftBans(next.bans);
            if (!active) return;
            setSyncError("");
            setSyncMessage(`Website-Bannliste synchronisiert: ${result.imported} neu, ${result.updated} aktualisiert, ${result.archived} aufgehoben.`);
          } catch (syncFailure) {
            if (!active) return;
            setSyncError(syncFailure instanceof Error ? syncFailure.message : "Minecraft-Banns konnten nicht in die Website-Bannliste übernommen werden.");
          }
        }
      } catch (failure) {
        if (active) setError(failure instanceof Error ? failure.message : "Minecraft-Bannliste nicht erreichbar.");
      } finally {
        inFlight.current = false;
        if (active) setLoading(false);
        if (active && refreshAgain.current) {
          refreshAgain.current = false;
          void refresh();
        }
      }
    };
    refreshRef.current = () => void refresh();
    const initial = window.setTimeout(() => void refresh(), 0);
    const interval = window.setInterval(() => void refresh(), 30_000);
    return () => {
      active = false;
      window.clearTimeout(initial);
      window.clearInterval(interval);
      refreshRef.current = () => undefined;
    };
  }, [canSync, onPlayersChange, onBansChange]);

  if (!visible) return null;

  const missingReasonCount = snapshot?.bans.filter((ban) => !hasBanReason(ban.reason)).length || 0;
  const filteredBans = snapshot?.bans.filter((ban) => {
    const needle = query.trim().toLocaleLowerCase();
    return !needle || `${ban.name} ${ban.reason} ${ban.source}`.toLocaleLowerCase().includes(needle);
  }) || [];

  async function unbanPlayer(ban: MinecraftBan) {
    if (!canSync || unbanningName) return;
    if (!window.confirm(`Soll ${ban.name} wirklich in Minecraft entbannt werden?`)) return;
    setUnbanningName(ban.name);
    setUnbanError("");
    setUnbanMessage("");
    try {
      await executeMinecraftUnban({ name: ban.name });
      try {
        const rows = await fbGet<Record<string, ModItem>>("bans") || {};
        const existing = Object.entries(rows).find(([, item]) => item.minecraftBanKey === minecraftBanKey(ban));
        if (existing) {
          const unbannedAt = Date.now();
          await fbUpdate(`bans/${existing[0]}`, {
            archived: true,
            archivedBy: actor,
            archivedAt: unbannedAt,
            archiveReason: "In Minecraft entbannt",
            unbannedBy: actor,
            unbannedAt,
            updatedAt: unbannedAt,
          });
        }
      } catch (error) {
        throw new Error(`Minecraft-Entbann ausgeführt, aber der Website-Eintrag konnte nicht aktualisiert werden: ${error instanceof Error ? error.message : "Speichern fehlgeschlagen"}`);
      }
      setUnbanMessage(`${ban.name} wurde in Minecraft entbannt und von ${actor} protokolliert.`);
    } catch (failure) {
      setUnbanError(failure instanceof Error ? failure.message : "Minecraft-Entbannen fehlgeschlagen.");
    } finally {
      refreshRef.current();
      setUnbanningName(null);
    }
  }

  return (
    <section className="card card-still mb-4 p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Minecraft-Banns <span className="font-normal text-muted">· {snapshot ? `${snapshot.bans.length} aktiv${missingReasonCount ? ` · ${missingReasonCount} ohne Grund` : ""}` : loading ? "wird geladen" : "nicht verfügbar"}</span></h3>
          <p className="mt-1 text-xs text-muted">Live-Synchronisierung alle 30 Sekunden. „In Minecraft entbannen“ entfernt den Bann nach deiner Bestätigung direkt auf dem Server.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-ghost px-3" aria-expanded={expanded} aria-controls="live-minecraft-ban-list" onClick={() => setExpanded((value) => !value)}>
            {expanded ? "Liste ausblenden" : "Liste anzeigen"}
          </button>
          <button type="button" className="btn-ghost px-3" disabled={loading} onClick={() => refreshRef.current()}>
            {loading ? "Aktualisiere…" : "Aktualisieren"}
          </button>
        </div>
      </div>
      {error ? <p className="mt-3 text-ember" role="alert">{error}{snapshot ? " Die angezeigten Karten stammen vom letzten erfolgreichen Abruf." : ""}</p> : null}
      {unbanError ? <p className="mt-3 text-ember" role="alert">{unbanError}</p> : null}
      {unbanMessage ? <p className="mt-3 text-muted" role="status">{unbanMessage}</p> : null}
      {syncError ? <p className="mt-3 text-ember" role="alert">Website-Synchronisierung fehlgeschlagen: {syncError}</p> : null}
      {canSync && syncMessage && !syncError ? <p className="mt-2 text-xs text-muted" role="status">{syncMessage}</p> : null}
      {updatedAt ? <p className="mt-1 text-xs text-faint">Stand: {formatWhen(updatedAt)}</p> : null}
      {expanded ? (
        <div id="live-minecraft-ban-list" className="mt-3">
          {snapshot?.bans.length ? <input className="field" placeholder="Minecraft-Banns durchsuchen" value={query} onChange={(event) => setQuery(event.target.value)} /> : null}
          {!snapshot && loading && !error ? <p className="mt-3 text-muted">Minecraft-Bannliste wird geladen…</p> : null}
          {snapshot && !snapshot.bans.length ? <p className="mt-3 text-muted">Keine aktiven Minecraft-Banns.</p> : null}
          {snapshot?.bans.length && !filteredBans.length ? <p className="mt-3 text-muted">Keine Banns passen zur Suche.</p> : null}
          {filteredBans.length ? (
            <ul className="mt-3 max-h-80 space-y-2 overflow-auto">
              {filteredBans.map((ban) => {
            const reason = hasBanReason(ban.reason) ? ban.reason.trim() : "";
            const createdAt = ban.created && Number.isFinite(Date.parse(ban.created))
              ? formatWhen(Date.parse(ban.created))
              : ban.created;
            return (
              <li key={minecraftBanKey(ban)} className="rounded-md border border-line bg-bg/50 px-3 py-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold">{ban.name}</p>
                  <span className="rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-xs font-medium text-ice">{minecraftBanDuration(ban).duration}</span>
                </div>
                <p className={`mt-1 ${reason ? "text-fg" : "text-amber-300"}`}>{reason || "Kein Bann-Grund hinterlegt."}</p>
                <p className="mt-1 text-xs text-muted">
                  {createdAt ? `Gebannt: ${createdAt}` : "Zeitpunkt nicht verfügbar"}
                  {ban.source ? ` · Von: ${ban.source}` : ""}
                </p>
                {canSync ? (
                  <button
                    type="button"
                    className="btn-ghost mt-2 px-3 py-1 text-xs"
                    disabled={unbanningName !== null}
                    onClick={() => void unbanPlayer(ban)}
                  >
                    {unbanningName === ban.name ? "Entbanne…" : "In Minecraft entbannen"}
                  </button>
                ) : null}
              </li>
            );
          })}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function seenKey(username: string) {
  return `alpen-seen:${username}`;
}

function readSeen(username: string): Partial<Record<"moderation" | "absence" | "help", number>> {
  try {
    return JSON.parse(window.localStorage.getItem(seenKey(username)) || "{}") as Partial<Record<"moderation" | "absence" | "help", number>>;
  } catch {
    return {};
  }
}

function StaffBackup() {
  const [snap, setSnap] = useState<StaffBackup | null>(null);
  const [state, setState] = useState("Sicherung läuft…");
  useEffect(() => {
    let stop = false;
    void rememberStaffBackup()
      .then((next) => {
        if (stop) return;
        setSnap(next);
        setState(`Gesichert ${new Date(next.at).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })}`);
      })
      .catch(() => {
        if (!stop) setState("Sicherung fehlgeschlagen");
      });
    return () => {
      stop = true;
    };
  }, []);
  return (
    <section className="card card-still mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <h2 className="font-semibold">Sicherung</h2>
        <p className="mt-1 text-sm text-muted">Beim Öffnen wird eine Kopie in diesem Browser behalten. Lade sie zusätzlich als Datei herunter, damit sie nicht nur hier liegt.</p>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-xs text-faint">{state}</p>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            const run = snap ? Promise.resolve(snap) : latestStaffBackup();
            void run.then((row) => {
              if (row) downloadStaffBackup(row);
            });
          }}
        >
          Datei speichern
        </button>
      </div>
    </section>
  );
}

async function askHelp(user: StaffSession, note: (text: string) => void) {
  const msg = window.prompt("Was brauchst du?");
  if (!msg) return;
  await fbPush("helpRequests", { by: user.username, msg, ts: Date.now(), replies: {}, status: "open" });
  note("Hilfe gesendet");
}
