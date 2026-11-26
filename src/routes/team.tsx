import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { PageHero, Shell } from "@/components/site/shell";
import { SiteMascot } from "@/components/site/assistant";
import { StaffChat } from "@/components/site/staff-chat";
import { PlayerSearch } from "@/components/site/staff-search";
import { useLive } from "@/components/site/staff-live";
import { can, roleLabel, ROLES, asRole, type Role } from "@/lib/alpen/roles";
import { moveStaffLayoutTab, normalizeStaffLayout, reorderStaffLayoutTab, staffLayoutForView, type StaffLayout } from "@/lib/alpen/staff-layout";
import {
  clearFirebaseAccessToken,
  FirebaseMfaChallengeRequired,
  requestOwnEmailVerification,
  sendPasswordResetEmail,
} from "@/lib/alpen/fb-auth";
import {
  remainingPasswordResetCooldownSeconds,
  STAFF_PASSWORD_RESET_COOLDOWN_KEY,
  STAFF_PASSWORD_RESET_COOLDOWN_MS,
} from "@/lib/alpen/staff-email-cooldown";
import { securityJson } from "@/lib/alpen/security";
import { requiresPersonalStaffEmail } from "@/lib/alpen/staff-account-flow";

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
  hasCurrentStaffActivityConsent,
  isStaffProfileColor,
  isValidMinecraftUsername,
  shouldArchivePermanentBan,
  loginStaff,
  completeFirstStaffPasswordSetup,
  StaffPersonalEmailRequired,
  StaffActivityConsentRequired,
  executeMinecraftUnban,
  fetchMinecraftPlayersSnapshot,
  minecraftBanKey,
  readSession,
  savePassword,
  verifyMinecraftNamePlayed,
  writeSession,
  type MinecraftBan,
  type MinecraftPlayersSnapshot,
  type ModItem,
  type StaffProfile,
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
  { id: "roster", label: "Team", group: "Team", area: "roster" },
  { id: "absence", label: "Abwesenheit", group: "Team", area: "absence" },
  { id: "tasks", label: "Aufgaben", group: "Team", area: "tasks" },
  { id: "moderation", label: "Moderation", group: "Moderation & Support", area: "moderation" },
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
  { id: "settings", label: "Mein Konto", group: "Verwaltung", area: "settings" },
  { id: "website", label: "Website", group: "Verwaltung", area: "website" },
  { id: "users", label: "Accounts", group: "Verwaltung", area: "roles" },
];
const TAB_GROUP_ORDER: TabGroup[] = [
  "Team",
  "Moderation & Support",
  "Inhalte & Kommunikation",
  "Verwaltung",
];

const DEFAULT_LAYOUT = normalizeStaffLayout(
  null,
  TABS.map((item) => item.id),
  ["moderation", "roster", "absence"],
);

function clearStaffSetupReturnMarker() {
  const url = new URL(window.location.href);
  if (url.searchParams.get("staffSetup") !== "verified") return;
  url.searchParams.delete("staffSetup");
  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

function StaffPage() {
  const [user, setUser] = useState<StaffSession | null>(null);
  const [ready, setReady] = useState(false);
  const [firstPasswordSetupRequested, setFirstPasswordSetupRequested] = useState(false);
  const [setupLoginEmail, setSetupLoginEmail] = useState("");
  const [toast, setToast] = useState("");
  const [liveErrors, setLiveErrors] = useState<Array<{ code: string; message: string }>>([]);
  const [bootstrapError, setBootstrapError] = useState("");
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("staffSetup") !== "verified") return;
    setFirstPasswordSetupRequested(true);
  }, []);

  useEffect(() => {
    const saved = readSession();
    if (!saved) {
      setReady(true);
      return;
    }
    if (requiresPersonalStaffEmail(saved.email, saved.emailVerified === true)) {
      writeSession(null);
      setReady(true);
      return;
    }
    void fbGet<{
      role?: string;
      mustChangePw?: boolean;
      disabled?: boolean;
      activityConsent?: unknown;
      uid?: string;
    }>(`staffUsers/${saved.username}`)
      .then((row) => {
        if (
          !row ||
          row.disabled ||
          !saved.email ||
          (row.uid && row.uid !== saved.uid) ||
          !hasCurrentStaffActivityConsent(row.activityConsent)
        ) {
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

  const note = useCallback((text: string) => {
    setToast(text);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToast("");
      toastTimer.current = null;
    }, 6000);
  }, []);

  const updateProfile = useCallback((profile: StaffProfile) => {
    const saved = readSession();
    if (!saved) return;
    const next = { ...saved, ...profile };
    writeSession(next);
    setUser(next);
  }, []);

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
        lede="Lege häufig genutzte Bereiche in deinen Schnellzugriff. Alle weiteren Werkzeuge findest du sortiert unter „Weitere Bereiche“."
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
        {ready && !user ? (
          firstPasswordSetupRequested ? (
            <FirstPasswordSetup
              onComplete={(email) => {
                clearStaffSetupReturnMarker();
                setSetupLoginEmail(email);
                setFirstPasswordSetupRequested(false);
              }}
              onLogin={(email) => {
                clearStaffSetupReturnMarker();
                setSetupLoginEmail(email);
                setFirstPasswordSetupRequested(false);
              }}
            />
          ) : (
            <Login
              key={setupLoginEmail || "team-login"}
              initialName={setupLoginEmail}
              note={note}
              onIn={(next) => {
                setBootstrapError("");
                setUser(next);
              }}
            />
          )
        ) : null}
        {user?.mustChangePw ? (
          <ForcePassword user={user} onDone={setUser} note={note} />
        ) : user ? (
          <Desk user={user} onLogout={logout} note={note} onProfileChange={updateProfile} />
        ) : null}
        {toast ? <p role="status" className="panel-in fixed bottom-6 left-1/2 z-[80] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-md bg-brand px-4 py-2 text-sm text-fg shadow-lg">{toast}</p> : null}
      </div>
    </Shell>
  );
}

function FirstPasswordSetup({
  onComplete,
  onLogin,
}: {
  onComplete: (email: string) => void;
  onLogin: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password !== passwordConfirmation) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    setBusy(true);
    try {
      const verifiedEmail = await completeFirstStaffPasswordSetup(email, setupCode, password);
      onComplete(verifiedEmail);
    } catch (setupError) {
      setError(setupError instanceof Error ? setupError.message : "Das Passwort konnte nicht eingerichtet werden.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <form className="card card-still panel-in p-6" onSubmit={submit}>
        <p className="kicker">E-Mail bestätigt</p>
        <h2 className="display mt-2 text-2xl">Eigenes Passwort festlegen</h2>
        <p className="mt-3 text-sm text-muted">
          Wenn du dein Konto zum ersten Mal einrichtest, gib deine persönliche E-Mail und den
          Einrichtungscode erneut ein. Danach kannst du dich mit deinem neuen Passwort anmelden
          und die Einwilligung sowie deinen Minecraft-Namen bestätigen.
        </p>
        <label className="mt-5 block text-sm">
          Bestätigte persönliche E-Mail-Adresse
          <input
            className="field mt-1"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className="mt-3 block text-sm">
          Einrichtungscode
          <input
            className="field mt-1"
            type="password"
            value={setupCode}
            onChange={(event) => setSetupCode(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <label className="mt-3 block text-sm">
          Neues Passwort (mindestens 8 Zeichen)
          <input
            className="field mt-1"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <label className="mt-3 block text-sm">
          Neues Passwort wiederholen
          <input
            className="field mt-1"
            type="password"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        {error ? <p className="mt-3 text-sm text-ember" role="alert">{error}</p> : null}
        <button className="btn-brand mt-5 w-full" type="submit" disabled={busy}>
          {busy ? "Passwort wird eingerichtet…" : "Passwort festlegen"}
        </button>
        <button
          className="btn-ghost mt-3 w-full"
          type="button"
          onClick={() => onLogin(email.trim().toLowerCase())}
          disabled={busy}
        >
          Konto bereits eingerichtet? Zur Anmeldung
        </button>
      </form>
    </div>
  );
}

function Login({
  initialName,
  onIn,
  note,
}: {
  initialName?: string;
  onIn: (user: StaffSession) => void;
  note: (text: string) => void;
}) {
  const [name, setName] = useState(initialName || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryBusy, setRecoveryBusy] = useState(false);
  const [recoveryCooldownUntil, setRecoveryCooldownUntil] = useState(0);
  const [recoveryClock, setRecoveryClock] = useState(0);
  const [consentRequired, setConsentRequired] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [minecraftName, setMinecraftName] = useState("");
  const [verifiedMinecraftName, setVerifiedMinecraftName] = useState("");
  const [minecraftNameCheckMessage, setMinecraftNameCheckMessage] = useState("");
  const [checkingMinecraftName, setCheckingMinecraftName] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [emailSetup, setEmailSetup] = useState<StaffPersonalEmailRequired | null>(null);
  const [emailSetupAddress, setEmailSetupAddress] = useState("");
  const [emailSetupPassword, setEmailSetupPassword] = useState("");
  const [emailSetupMfaCode, setEmailSetupMfaCode] = useState("");
  const [emailSetupBusy, setEmailSetupBusy] = useState(false);
  const [emailSetupSentTo, setEmailSetupSentTo] = useState("");
  const [emailSetupAlreadyVerified, setEmailSetupAlreadyVerified] = useState(false);
  const [emailSetupMessage, setEmailSetupMessage] = useState("");
  const [emailSetupError, setEmailSetupError] = useState("");

  useEffect(() => {
    try {
      const savedUntil = Number(window.localStorage.getItem(STAFF_PASSWORD_RESET_COOLDOWN_KEY));
      if (remainingPasswordResetCooldownSeconds(savedUntil, Date.now()) > 0) {
        setRecoveryCooldownUntil(savedUntil);
        setRecoveryClock(Date.now());
      }
    } catch (storageError) {
      console.warn("[Staff Center] Passwort-Reset-Countdown konnte nicht gespeichert werden.", storageError);
    }
  }, []);

  useEffect(() => {
    if (!recoveryCooldownUntil) return;
    const timer = window.setInterval(() => {
      const now = Date.now();
      setRecoveryClock(now);
      if (remainingPasswordResetCooldownSeconds(recoveryCooldownUntil, now) === 0) {
        setRecoveryCooldownUntil(0);
        try {
          window.localStorage.removeItem(STAFF_PASSWORD_RESET_COOLDOWN_KEY);
        } catch (storageError) {
          console.warn("[Staff Center] Abgelaufener Passwort-Reset-Countdown konnte nicht entfernt werden.", storageError);
        }
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [recoveryCooldownUntil]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (consentRequired && !consentAccepted) {
      setError("Ohne Zustimmung ist kein Zugang zum Staff-Center möglich.");
      return;
    }
    if (consentRequired && !isValidMinecraftUsername(minecraftName.trim())) {
      setError("Bitte gib einen gültigen Minecraft-Namen ein (3–16 Zeichen, Buchstaben, Zahlen oder _).");
      return;
    }
    if (consentRequired && verifiedMinecraftName !== minecraftName.trim()) {
      setError("Bitte prüfe zuerst, ob dieser Minecraft-Name in den Serverdaten nachgewiesen ist.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const session = await loginStaff(
        name,
        password,
        consentRequired ? { accepted: true, minecraftName: minecraftName.trim() } : undefined,
        mfaCode,
      );
      writeSession(session);
      void fbSet(`presence/${session.username}`, { username: session.username, role: session.role, online: true, lastSeen: Date.now() }).catch(() => undefined);
      onIn(session);
      if (session.loginWarning) note(session.loginWarning);
    } catch (err) {
      if (err instanceof StaffActivityConsentRequired) {
        setConsentRequired(true);
        setError("");
      } else if (err instanceof StaffPersonalEmailRequired) {
        setEmailSetup(err);
        setEmailSetupAddress(err.needsPersonalAddress ? "" : err.currentEmail);
        setEmailSetupPassword("");
        setEmailSetupMfaCode("");
        setEmailSetupSentTo("");
        setEmailSetupMessage("");
        setEmailSetupError("");
        setPassword("");
        setMfaCode("");
        setError("");
      } else if (err instanceof FirebaseMfaChallengeRequired) {
        setMfaRequired(true);
        setError("");
      } else {
        setError(err instanceof Error ? err.message : "Zugang ungültig");
      }
    } finally {
      setBusy(false);
    }
  }

  async function sendPersonalEmailVerification(event: FormEvent) {
    event.preventDefault();
    if (!emailSetup) return;
    setEmailSetupBusy(true);
    setEmailSetupError("");
    try {
      const result = await requestOwnEmailVerification(
        emailSetup.currentEmail,
        emailSetupAddress,
        emailSetupPassword,
        emailSetup.uid,
        emailSetupMfaCode,
      );
      setEmailSetupSentTo(result.email);
      setEmailSetupAlreadyVerified(result.alreadyVerified);
      setEmailSetupMessage(
        result.alreadyVerified
          ? "Diese Adresse ist bereits bestätigt. Du kannst dich jetzt damit anmelden."
          : `Bestätigungslink an ${result.email} gesendet. Öffne den Link: Bei der Ersteinrichtung kannst du danach direkt dein eigenes Passwort festlegen; anschließend meldest du dich neu an.`,
      );
      setEmailSetupPassword("");
      setEmailSetupMfaCode("");
    } catch (verificationError) {
      setEmailSetupError(
        verificationError instanceof Error
          ? verificationError.message
          : "Der Bestätigungslink konnte nicht gesendet werden.",
      );
    } finally {
      clearFirebaseAccessToken();
      setEmailSetupBusy(false);
    }
  }

  function returnToEmailLogin() {
    setName(emailSetupSentTo || emailSetupAddress);
    setPassword("");
    setEmailSetup(null);
    setEmailSetupSentTo("");
    setEmailSetupAlreadyVerified(false);
    setEmailSetupMessage("");
    setEmailSetupError("");
    setMfaRequired(false);
    setMfaCode("");
  }

  async function checkMinecraftName() {
    const candidate = minecraftName.trim();
    setMinecraftNameCheckMessage("");
    setVerifiedMinecraftName("");
    if (!isValidMinecraftUsername(candidate)) {
      setMinecraftNameCheckMessage("Bitte gib einen gültigen Minecraft-Namen ein.");
      return;
    }
    setCheckingMinecraftName(true);
    try {
      const verified = await verifyMinecraftNamePlayed(candidate);
      if (!verified) {
        setMinecraftNameCheckMessage("Dieser Name wurde in den nachweisbaren Serverdaten nicht gefunden.");
        return;
      }
      setMinecraftName(verified.canonicalName);
      if (!verified.indexed) {
        setMinecraftNameCheckMessage(
          `Servernachweis für ${verified.canonicalName} gefunden. Bitte den Owner die Aktivitätsstatistik aktualisieren lassen.`,
        );
        return;
      }
      setVerifiedMinecraftName(verified.canonicalName);
      setMinecraftNameCheckMessage(`Servernachweis bereit: ${verified.canonicalName}`);
    } catch (verificationError) {
      setMinecraftNameCheckMessage(
        verificationError instanceof Error
          ? verificationError.message
          : "Der Minecraft-Name konnte nicht geprüft werden.",
      );
    } finally {
      setCheckingMinecraftName(false);
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
      const expiresAt = Date.now() + STAFF_PASSWORD_RESET_COOLDOWN_MS;
      setRecoveryCooldownUntil(expiresAt);
      setRecoveryClock(Date.now());
      try {
        window.localStorage.setItem(STAFF_PASSWORD_RESET_COOLDOWN_KEY, String(expiresAt));
      } catch (storageError) {
        console.warn("[Staff Center] Passwort-Reset-Countdown konnte nicht gespeichert werden.", storageError);
      }
    } catch (err) {
      setRecoveryError(err instanceof Error ? err.message : "Der Passwort-Link konnte nicht angefordert werden.");
    } finally {
      setRecoveryBusy(false);
    }
  }

  const recoveryCooldownSeconds = remainingPasswordResetCooldownSeconds(
    recoveryCooldownUntil,
    recoveryClock || Date.now(),
  );

  if (emailSetup) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <form className="card card-still panel-in p-6" onSubmit={sendPersonalEmailVerification}>
          <p className="kicker">Zugang schützen</p>
          <h2 className="display mt-2 text-2xl">Persönliche E-Mail bestätigen</h2>
          <p className="mt-3 text-sm text-muted">
            {emailSetup.needsPersonalAddress
              ? "Dein Konto verwendet noch eine interne Team-Adresse. Hinterlege eine persönliche Adresse. Das Staff-Center bleibt bis zur Bestätigung gesperrt."
              : "Deine persönliche Adresse ist noch nicht bestätigt. Bestätige sie oder trage eine andere persönliche Adresse ein. Das Staff-Center bleibt bis dahin gesperrt."}
          </p>
          {emailSetupSentTo ? (
            <div className="mt-5 space-y-3 rounded-xl border border-brand/40 bg-brand/5 p-4">
              <p className="font-semibold" role="status">{emailSetupMessage}</p>
              {emailSetupAlreadyVerified ? null : (
                <ol className="list-inside list-decimal space-y-1 text-sm text-muted">
                  <li>Öffne den Link in deinem Posteingang.</li>
                  <li>Lege auf der zurückkehrenden Seite dein eigenes Passwort fest.</li>
                  <li>Melde dich mit deiner bestätigten E-Mail und dem neuen Passwort an.</li>
                </ol>
              )}
              {emailSetupError ? <p className="text-sm text-ember" role="alert">{emailSetupError}</p> : null}
              <button className="btn-brand w-full" type="button" onClick={returnToEmailLogin}>
                Zur Anmeldung
              </button>
              {!emailSetupAlreadyVerified ? (
                <button
                  className="btn-ghost w-full"
                  type="button"
                  onClick={() => {
                    setEmailSetupSentTo("");
                    setEmailSetupAlreadyVerified(false);
                  }}
                >
                  Keinen Link erhalten? Erneut senden
                </button>
              ) : null}
            </div>
          ) : (
            <>
              <label className="mt-5 block text-sm">
                Persönliche E-Mail-Adresse
                <input
                  className="field mt-1"
                  type="email"
                  value={emailSetupAddress}
                  onChange={(event) => setEmailSetupAddress(event.target.value)}
                  autoComplete="email"
                  required
                  autoFocus
                />
              </label>
              <label className="mt-3 block text-sm">
                Aktuelles Konto-Passwort
                <input
                  className="field mt-1"
                  type="password"
                  value={emailSetupPassword}
                  onChange={(event) => setEmailSetupPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>
              {emailSetup.mfaEnabled ? (
                <label className="mt-3 block text-sm">
                  Authenticator-Code
                  <input
                    className="field mt-1"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    value={emailSetupMfaCode}
                    onChange={(event) => setEmailSetupMfaCode(event.target.value)}
                    required
                  />
                </label>
              ) : null}
              {emailSetupError ? <p className="mt-3 text-sm text-ember" role="alert">{emailSetupError}</p> : null}
              <button className="btn-brand mt-5 w-full" type="submit" disabled={emailSetupBusy}>
                {emailSetupBusy ? "Link wird gesendet…" : "Bestätigungslink senden"}
              </button>
            </>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <form className="card card-still panel-in p-6" onSubmit={submit}>
        <h2 className="text-xl font-semibold">Anmelden</h2>
        <p className="mt-2 text-sm text-muted">Melde dich mit der persönlichen E-Mail-Adresse deines Accounts und deinem Passwort an. Bei älteren Konten funktioniert übergangsweise auch der Teamname. Deine E-Mail-Adresse wird nicht öffentlich für die Teamnamen-Suche bereitgestellt. Der Minecraft-Server muss für die Anmeldung nicht online sein.</p>
        <label className="mt-5 block text-sm">
          Persönliche E-Mail-Adresse oder Teamname für die Ersteinrichtung
          <input className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} autoComplete="username" required />
        </label>
        <label className="mt-3 block text-sm">
          Eigenes Passwort oder Einrichtungscode
          <input className="field mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        <p className="mt-2 text-sm text-muted">
          Neue Konten starten mit Teamname und Einrichtungscode. Nach der E-Mail-Bestätigung legst
          du auf der zurückkehrenden Seite dein eigenes Passwort fest. Danach meldest du dich neu
          an und bestätigst die erforderliche Zustimmung sowie deinen Minecraft-Namen.
        </p>
        {mfaRequired ? (
          <label className="mt-3 block text-sm">
            Authenticator-Code
            <input className="field mt-1" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" value={mfaCode} onChange={(event) => setMfaCode(event.target.value)} required />
            <span className="mt-1 block text-xs text-muted">Gib den aktuellen sechsstelligen Code aus deiner Authenticator-App ein.</span>
          </label>
        ) : null}
        {consentRequired ? (
          <div className="mt-5 space-y-3 rounded-xl border border-brand/40 bg-brand/5 p-4">
            <h3 className="font-semibold">Einwilligung erforderlich</h3>
            <p className="text-sm text-muted">
              Für den Zugang werden dein letzter Staff-Center-Aktivitätszeitpunkt und dein Minecraft-Name
              für die interne Teamverwaltung gespeichert. Der Minecraft-Name wird deinem Staff-Konto
              zugeordnet. Website-Nutzungszeit wird nur bei sichtbarem Tab und kürzlicher Bedienung
              gezählt. Minecraft-Zeit misst die Serververbindung einschliesslich AFK-Zeit, keine
              einzelnen Spielaktionen. Beide Werte werden getrennt erfasst und können als
              Gesamtsumme angezeigt werden; Tagesdetails werden 30 Tage und anschliessend
              Wochenwerte bis zu einem Jahr aufbewahrt. Ohne
              Zustimmung kannst du nicht fortfahren; wende dich bei Fragen bitte an den Owner.
            </p>
            <label className="block text-sm">
              Minecraft-Name
              <input
                className="field mt-1"
                value={minecraftName}
                onChange={(event) => {
                  setMinecraftName(event.target.value);
                  setVerifiedMinecraftName("");
                  setMinecraftNameCheckMessage("");
                }}
                autoComplete="off"
                maxLength={16}
                required
              />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="btn-ghost"
                type="button"
                onClick={() => void checkMinecraftName()}
                disabled={checkingMinecraftName || !isValidMinecraftUsername(minecraftName.trim())}
              >
                {checkingMinecraftName ? "Prüfe Serverdaten…" : "Minecraft-Name prüfen"}
              </button>
              {minecraftNameCheckMessage ? (
                <span
                  className={`text-xs ${verifiedMinecraftName ? "text-emerald-300" : "text-amber-200"}`}
                  role="status"
                >
                  {minecraftNameCheckMessage}
                </span>
              ) : null}
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input
                className="mt-1"
                type="checkbox"
                checked={consentAccepted}
                onChange={(event) => setConsentAccepted(event.target.checked)}
              />
              <span>
                Ich willige ein, dass meine aktive Nutzung des Staff-Centers sowie meine Spielzeit
                als Server-Verbindungszeit auf dem Minecraft-Server erfasst, meinem Konto zugeordnet
                und für die Teamverwaltung ausgewertet werden. Ich kann die Einwilligung für die
                Zukunft über die Kontakt-E-Mail widerrufen.
              </span>
            </label>
          </div>
        ) : null}
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
        <button
          className="btn-ghost mt-4 w-full"
          type="submit"
          disabled={recoveryBusy || recoveryCooldownSeconds > 0}
        >
          {recoveryBusy
            ? "Sende…"
            : recoveryCooldownSeconds > 0
              ? `Erneut anfordern in ${recoveryCooldownSeconds}s`
              : "Passwort-Link anfordern"}
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
    if (a.length < 8) return setError("Das eigene Passwort muss mindestens 8 Zeichen haben.");
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
      <p className="mt-2 text-sm text-muted">Der Einrichtungscode gilt nur bis zu diesem Schritt. Setze jetzt dein eigenes Passwort mit mindestens 8 Zeichen. Erst danach öffnet sich das Staff-Center.</p>
      <input className="field mt-4" type="password" value={a} onChange={(e) => setA(e.target.value)} placeholder="Eigenes Passwort (mindestens 8 Zeichen)" autoComplete="new-password" minLength={8} required />
      <input className="field mt-3" type="password" value={b} onChange={(e) => setB(e.target.value)} placeholder="Eigenes Passwort wiederholen" autoComplete="new-password" minLength={8} required />
      {error ? <p className="mt-3 text-sm text-ember">{error}</p> : null}
      <button className="btn-brand mt-4" type="submit">Speichern</button>
    </form>
  );
}

function Desk({
  user,
  onLogout,
  note,
  onProfileChange,
}: {
  user: StaffSession;
  onLogout: () => void;
  note: (text: string) => void;
  onProfileChange: (profile: StaffProfile) => void;
}) {
  const real = user.role;
  const [view, setView] = useState<Role>(asRole(user.role));
  const shown = (real === "owner" ? view : user.role) as string;
  const previewing = shown !== real;
  const displayedUser = previewing ? { ...user, role: shown } : user;
  useEffect(() => {
    if (user.role === "streamer") return;
    let active = true;
    void fbGet<StaffProfile>(`staffDirectory/${user.username}`)
      .then((profile) => {
        if (!active) return;
        onProfileChange({
          displayName: typeof profile?.displayName === "string" ? profile.displayName : undefined,
          profileColor: isStaffProfileColor(profile?.profileColor) ? profile.profileColor : undefined,
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error("[Staff Center] PROFILE-STAFF-001: Profil konnte nicht geladen werden.", error);
        note("Das Team-Profil konnte gerade nicht geladen werden. Die Anmeldung bleibt aktiv.");
      });
    return () => {
      active = false;
    };
  }, [user.username, user.role, onProfileChange, note]);
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
  const viewLayout = staffLayoutForView(
    staffLayout,
    previewing,
    tabs.map((item) => item.id),
    DEFAULT_LAYOUT.quickTabs,
  );
  const orderedTabs = [...viewLayout.quickTabs, ...viewLayout.moreTabs]
    .map((id) => tabs.find((item) => item.id === id))
    .filter((item): item is (typeof tabs)[number] => Boolean(item));
  const quickTabs = viewLayout.quickTabs
    .map((id) => tabs.find((item) => item.id === id))
    .filter((item): item is (typeof tabs)[number] => Boolean(item));
  const otherTabs = viewLayout.moreTabs
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
  const otherGroups = TAB_GROUP_ORDER.filter((group) =>
    otherTabs.some((item) => item.group === group),
  );
  const helpRows = useLive<ModItem>("helpRequests");
  const absenceRows = useLive<ModItem>("absences");
  const canReadCommunity = can(shown, "community") && can(real, "community");
  const communityReviews = useLive<ModItem>("community_reviews", canReadCommunity);
  const communityImages = useLive<ModItem>("community_images", canReadCommunity);
  const seen = readSeen(user.username);
  const fresh = (rows: Record<string, ModItem>, since: number) =>
    Object.values(rows).filter((item) => item && !item.archived && (item.ts || item.updatedAt || 0) > since).length;
  const freshCommunity = (rows: Record<string, ModItem>, since: number) =>
    Object.values(rows).filter(
      (item) =>
        item &&
        !item.archived &&
        (!item.status || item.status === "pending") &&
        (item.ts || item.updatedAt || 0) > since,
    ).length;
  const badges: Partial<Record<Tab, number>> = {
    moderation: safeTab === "moderation" ? 0 : fresh(banRows, seen.moderation || 0),
    absence: safeTab === "absence" ? 0 : fresh(absenceRows, seen.absence || 0),
    help: safeTab === "help" ? 0 : fresh(helpRows, seen.help || 0),
    community:
      safeTab === "community"
        ? 0
        : freshCommunity(communityReviews, seen.community || 0) +
          freshCommunity(communityImages, seen.community || 0),
  };
  useEffect(() => {
    if (
      safeTab !== "moderation" &&
      safeTab !== "absence" &&
      safeTab !== "help" &&
      safeTab !== "community"
    )
      return;
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

  useEffect(() => {
    let lastInteractionAt = 0;
    let requestPending = false;
    let failureReported = false;
    const markActive = () => {
      lastInteractionAt = Date.now();
    };
    const heartbeat = async () => {
      if (
        requestPending ||
        document.visibilityState !== "visible" ||
        !lastInteractionAt ||
        Date.now() - lastInteractionAt > 60_000
      ) return;
      requestPending = true;
      try {
        await securityJson<void>("/api/staff-activity/heartbeat", { method: "POST" });
        failureReported = false;
      } catch (error) {
        if (!failureReported) {
          console.error("[Staff Center] Aktivitätsmessung konnte nicht gespeichert werden.", error);
          note("Aktivitätsmessung ist vorübergehend nicht verfügbar.");
          failureReported = true;
        }
      } finally {
        requestPending = false;
      }
    };
    const events = ["pointerdown", "keydown", "input", "touchstart"] as const;
    for (const event of events) document.addEventListener(event, markActive, { passive: true });
    const timer = window.setInterval(() => void heartbeat(), 30_000);
    return () => {
      window.clearInterval(timer);
      for (const event of events) document.removeEventListener(event, markActive);
    };
  }, [note, user.username]);

  const showChat = can(shown, "chat") && can(real, "chat");
  const dockChat = showChat;
  const seeTeamChat = showChat && shown !== "builder" && shown !== "buildmanager";
  const seeBuilderChat = showChat && (shown === "builder" || shown === "buildmanager" || shown === "owner" || shown === "admin" || shown === "helper" || shown === "supporter");

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
            className="grid size-12 shrink-0 place-items-center rounded-full border text-lg font-semibold text-white"
            style={{
              backgroundColor: user.profileColor || "#e1062c",
              borderColor: user.profileColor || "#e1062c",
            }}
          >
            {(user.displayName || user.username).slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-faint">Angemeldet als</p>
            <p className="truncate text-lg font-semibold text-fg">{user.displayName || user.username}</p>
            {user.displayName ? <p className="truncate text-xs text-faint">@{user.username}</p> : null}
            <p className="text-sm text-muted">{roleLabel(shown)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {can(shown, "help") ? (
            <button type="button" className="btn-ghost" onClick={() => void askHelp(user, note)}>
              Teamhilfe anfordern
            </button>
          ) : null}
          <button type="button" className="btn-ghost" onClick={onLogout}>
            Abmelden
          </button>
        </div>
      </section>
      {real === "owner" ? (
        <details className="staff-utility-search mt-4">
          <summary>Owner-Werkzeuge</summary>
          <div className="space-y-3 p-3">
            <div className="flex flex-col gap-3 rounded-md border border-line/70 bg-surface/60 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-fg">Rollen-Vorschau</p>
                <p className="text-xs text-muted">Nur für dich – deine echte Rolle bleibt unverändert. {previewing ? `Interaktive Vorschau als ${roleLabel(shown)}; Aktionen ändern echte Live-Daten.` : ""}</p>
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
            {shown === "owner" ? <div inert={previewing}><StaffBackup /></div> : null}
          </div>
        </details>
      ) : null}
      {previewing ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/50 bg-amber-950/30 px-4 py-3" role="status">
          <div>
            <p className="font-semibold text-amber-100">Interaktive Vorschau: {roleLabel(shown)}</p>
            <p className="text-sm text-amber-100/80">Die sichtbaren Aktionen richten sich nach dieser Rolle, speichern aber echte Änderungen. Deine Anmeldung bleibt Owner.</p>
          </div>
          <button type="button" className="btn-ghost" onClick={() => setView(asRole(real))}>
            Vorschau beenden
          </button>
        </div>
      ) : null}
        {shown === "owner" || shown === "admin" ? (
          <Suspense fallback={null}>
            <LiveNotices note={note} />
          </Suspense>
        ) : null}
      <div className={`staff-layout mt-5 min-w-0${dockChat ? " has-chat" : ""}`}>
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
              <summary>Weitere Bereiche</summary>
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
        <section className="staff-content min-w-0">
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
            {safeTab === "roster" ? <Roster owner={shown === "owner"} note={note} /> : null}
            {safeTab === "settings" ? (
              <Settings user={displayedUser} note={note} onProfileChange={onProfileChange} />
            ) : null}
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
          <div id="staff-chat-sidebar" className="staff-chat-dock sticky top-20 hidden h-[calc(100vh-6rem)] min-w-0 xl:block">
            <StaffChat user={displayedUser} team={seeTeamChat} builder={seeBuilderChat} dock />
          </div>
        ) : null}
      </div>
      {showChat ? (
        <>
          <button
            type="button"
            className="btn-brand fixed bottom-24 right-3 z-40 xl:hidden"
            aria-expanded={chatOpen}
            onClick={() => setChatOpen(true)}
          >
            Chat öffnen
          </button>
          {chatOpen ? (
            <div id="staff-chat-overlay" className="fixed inset-0 z-50 bg-black/70 p-3 backdrop-blur-sm xl:hidden">
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Team-Chat"
                className="mx-auto flex h-full max-h-[calc(100dvh-1.5rem)] w-full max-w-xl flex-col"
              >
                <button type="button" className="btn-ghost mb-2 self-end" onClick={() => setChatOpen(false)}>
                  Chat schließen
                </button>
                <div className="min-h-0 flex-1">
                  <StaffChat user={displayedUser} team={seeTeamChat} builder={seeBuilderChat} dock />
                </div>
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

function readSeen(
  username: string,
): Partial<Record<"moderation" | "absence" | "help" | "community", number>> {
  try {
    return JSON.parse(window.localStorage.getItem(seenKey(username)) || "{}") as Partial<
      Record<"moderation" | "absence" | "help" | "community", number>
    >;
  } catch {
    return {};
  }
}

function StaffBackup() {
  const [snap, setSnap] = useState<StaffBackup | null>(null);
  const [state, setState] = useState("Sicherung wird erstellt…");
  useEffect(() => {
    let stop = false;
    void rememberStaffBackup()
      .then((next) => {
        if (stop) return;
        setSnap(next);
        const time = new Date(next.at).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
        setState(next.failedPaths?.length
          ? `Teilweise gesichert ${time} · ${next.failedPaths.length} Bereiche nicht lesbar`
          : `Gesichert ${time}`);
      })
      .catch((error: unknown) => {
        console.error("[Staff Center] BACKUP-002: Sicherung konnte nicht erstellt werden.", error);
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
        <p className="mt-1 text-sm text-muted">Website-Daten werden hier im Browser gespeichert. Für eine Datei auf deinem Gerät lade die JSON-Kopie herunter. Minecraft-Dateien sind nicht enthalten.</p>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-xs text-faint" role="status" aria-live="polite">{state}</p>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            const run = snap ? Promise.resolve(snap) : latestStaffBackup();
            void run.then((row) => {
              if (row) downloadStaffBackup(row);
              else setState("Keine Sicherung gefunden");
            }).catch((error: unknown) => {
              console.error("[Staff Center] BACKUP-003: Datei konnte nicht gespeichert werden.", error);
              setState("Download fehlgeschlagen");
            });
          }}
        >
          JSON herunterladen
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
