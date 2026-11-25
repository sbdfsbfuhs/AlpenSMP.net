import { useEffect, useState, type FormEvent } from "react";
import {
  loginStaff,
  savePassword,
  saveStaffProfile,
  STAFF_PROFILE_COLORS,
  type StaffProfile,
  type StaffProfileColor,
  type StaffSession,
  writeSession,
} from "@/lib/alpen/staff";
import {
  beginStaffTotpEnrollment,
  disableStaffTotp,
  finishStaffTotpEnrollment,
  requestOwnEmailVerification,
} from "@/lib/alpen/fb-auth";
import { securityJson } from "@/lib/alpen/security";

export function Settings({
  user,
  note,
  onProfileChange,
}: {
  user: StaffSession;
  note: (text: string) => void;
  onProfileChange: (profile: StaffProfile) => void;
}) {
  const [oldPw, setOld] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [oldMfaCode, setOldMfaCode] = useState("");
  const [mfaPassword, setMfaPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaEnabled, setMfaEnabled] = useState(Boolean(user.mfaEnabled));
  const [totp, setTotp] = useState<{ secret: string; uri: string } | null>(null);
  const [mfaBusy, setMfaBusy] = useState(false);
  const [mfaError, setMfaError] = useState("");
  const [accountEmail, setAccountEmail] = useState(
    user.email.toLowerCase().endsWith("@staff.alpensmp.net") ? "" : user.email,
  );
  const [emailPassword, setEmailPassword] = useState("");
  const [emailMfaCode, setEmailMfaCode] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [withdrawingConsent, setWithdrawingConsent] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState("");
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [profileColor, setProfileColor] = useState<StaffProfileColor>(
    user.profileColor || STAFF_PROFILE_COLORS[0].value,
  );

  useEffect(() => {
    setDisplayName(user.displayName || "");
    setProfileColor(user.profileColor || STAFF_PROFILE_COLORS[0].value);
    setMfaEnabled(Boolean(user.mfaEnabled));
    setAccountEmail(
      user.email.toLowerCase().endsWith("@staff.alpensmp.net") ? "" : user.email,
    );
  }, [user.displayName, user.profileColor, user.mfaEnabled, user.email]);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    try {
      const profile = await saveStaffProfile(user.username, displayName, profileColor);
      onProfileChange(profile);
      note("Profil gespeichert");
    } catch (err) {
      note(err instanceof Error ? err.message : "Profil konnte nicht gespeichert werden");
    }
  }

  async function savePasswordChange(event: FormEvent) {
    event.preventDefault();
    if (!a) return note("Passwort fehlt");
    if (a !== b) return note("Stimmt nicht überein");
    let sessionWarning = "";
    try {
      const session = await loginStaff(user.email, oldPw, undefined, oldMfaCode);
      await savePassword(user.username, a);
      writeSession({ ...user, ...session, mustChangePw: false });
      sessionWarning = session.loginWarning || "";
      setOldMfaCode("");
    } catch (err) {
      return note(err instanceof Error ? err.message : "Altes Passwort falsch");
    }
    note(
      sessionWarning
        ? `Passwort geändert. ${sessionWarning}`
        : "Passwort geändert",
    );
  }

  async function startTotp(event: FormEvent) {
    event.preventDefault();
    setMfaBusy(true);
    setMfaError("");
    try {
      const setup = await beginStaffTotpEnrollment(user.email, mfaPassword);
      setTotp(setup);
      setMfaPassword("");
    } catch (error) {
      setMfaError(error instanceof Error ? error.message : "2FA-Einrichtung fehlgeschlagen.");
    } finally {
      setMfaBusy(false);
    }
  }

  async function verifyAccountEmail(event: FormEvent) {
    event.preventDefault();
    setEmailBusy(true);
    setEmailMessage("");
    setEmailError("");
    try {
      const result = await requestOwnEmailVerification(
        user.email,
        accountEmail,
        emailPassword,
        user.uid,
        emailMfaCode,
      );
      setEmailPassword("");
      setEmailMfaCode("");
      setEmailMessage(
        result.alreadyVerified
          ? "Diese E-Mail-Adresse ist bereits verifiziert. Du kannst jetzt 2FA einrichten."
          : `Verifizierungslink an ${result.email} gesendet. Bitte bestätige die Adresse und melde dich danach mit der neuen E-Mail-Adresse erneut an.`,
      );
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : "E-Mail konnte nicht verifiziert werden.");
    } finally {
      setEmailBusy(false);
    }
  }

  async function confirmTotp(event: FormEvent) {
    event.preventDefault();
    setMfaBusy(true);
    setMfaError("");
    try {
      const login = await finishStaffTotpEnrollment(mfaCode);
      setMfaEnabled(login.mfaEnabled);
      writeSession({ ...user, mfaEnabled: login.mfaEnabled });
      setTotp(null);
      setMfaCode("");
      note("Zwei-Faktor-Authentifizierung aktiviert.");
    } catch (error) {
      setMfaError(error instanceof Error ? error.message : "Authenticator-Code konnte nicht bestätigt werden.");
    } finally {
      setMfaBusy(false);
    }
  }

  async function removeTotp(event: FormEvent) {
    event.preventDefault();
    setMfaBusy(true);
    setMfaError("");
    try {
      const login = await disableStaffTotp(user.email, mfaPassword, mfaCode);
      setMfaEnabled(login.mfaEnabled);
      writeSession({ ...user, mfaEnabled: login.mfaEnabled });
      setMfaPassword("");
      setMfaCode("");
      note("Zwei-Faktor-Authentifizierung deaktiviert.");
    } catch (error) {
      setMfaError(error instanceof Error ? error.message : "2FA konnte nicht deaktiviert werden.");
    } finally {
      setMfaBusy(false);
    }
  }

  async function withdrawActivityConsent() {
    if (!window.confirm(
      "Aktivitäts-Einwilligung widerrufen? Website- und Minecraft-Historie werden gelöscht. Du wirst abgemeldet und brauchst für einen späteren Zugang eine neue Einwilligung.",
    )) return;
    setWithdrawingConsent(true);
    setWithdrawalError("");
    try {
      await securityJson<void>("/api/staff-activity/withdraw", { method: "POST" });
      writeSession(null);
      window.location.reload();
    } catch (error) {
      setWithdrawalError(error instanceof Error ? error.message : "Widerruf konnte nicht bestätigt werden.");
    } finally {
      setWithdrawingConsent(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form className="card card-still p-5" onSubmit={saveProfile}>
        <h2 className="text-lg font-semibold">Dein Profil</h2>
        <p className="mt-1 text-sm text-muted">
          Login-Name und Berechtigungen bleiben unverändert. Der Anzeigename und die Farbe sind im Team sichtbar.
        </p>
        <label className="mt-4 block text-sm">
          Anzeigename
          <input
            className="field mt-1"
            value={displayName}
            maxLength={32}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder={user.username}
          />
        </label>
        <label className="mt-3 block text-sm">
          Akzentfarbe
          <select
            className="field mt-1"
            value={profileColor}
            onChange={(event) => {
              const next = STAFF_PROFILE_COLORS.find((color) => color.value === event.target.value);
              if (next) setProfileColor(next.value);
            }}
          >
            {STAFF_PROFILE_COLORS.map((color) => (
              <option key={color.value} value={color.value}>
                {color.label}
              </option>
            ))}
          </select>
        </label>
        <button className="btn-brand mt-4" type="submit">Profil speichern</button>
      </form>
      <form className="card card-still max-w-md p-5" onSubmit={savePasswordChange}>
        <h2 className="text-lg font-semibold">Passwort ändern</h2>
        <input className="field mt-3" type="password" placeholder="Altes Passwort" value={oldPw} onChange={(e) => setOld(e.target.value)} />
        {user.mfaEnabled ? (
          <input className="field mt-2" inputMode="numeric" autoComplete="one-time-code" placeholder="Authenticator-Code" value={oldMfaCode} onChange={(e) => setOldMfaCode(e.target.value)} />
        ) : null}
        <input className="field mt-2" type="password" placeholder="Neu" value={a} onChange={(e) => setA(e.target.value)} />
        <input className="field mt-2" type="password" placeholder="Wiederholen" value={b} onChange={(e) => setB(e.target.value)} />
        <button className="btn-brand mt-4" type="submit">Passwort speichern</button>
      </form>
      <section className="card card-still max-w-md p-5">
        <h2 className="text-lg font-semibold">Persönliche Konto-E-Mail</h2>
        <p className="mt-1 text-sm text-muted">
          Hinterlege eine persönliche Adresse für Anmeldung und Wiederherstellung. Erst nach dem Bestätigungslink wird sie als Login-Adresse übernommen.
        </p>
        <form className="mt-4 space-y-3" onSubmit={verifyAccountEmail}>
          <label className="block text-sm">
            Deine E-Mail-Adresse
            <input
              className="field mt-1"
              type="email"
              value={accountEmail}
              onChange={(event) => setAccountEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="block text-sm">
            Aktuelles Konto-Passwort
            <input
              className="field mt-1"
              type="password"
              value={emailPassword}
              onChange={(event) => setEmailPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {user.mfaEnabled ? (
            <label className="block text-sm">
              Aktueller Authenticator-Code
              <input
                className="field mt-1"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                value={emailMfaCode}
                onChange={(event) => setEmailMfaCode(event.target.value)}
                required
              />
            </label>
          ) : null}
          <button className="btn-brand" type="submit" disabled={emailBusy}>
            {emailBusy ? "Verifizierungslink wird gesendet…" : "E-Mail verifizieren"}
          </button>
        </form>
        {emailMessage ? <p className="mt-3 text-sm text-emerald-200" role="status">{emailMessage}</p> : null}
        {emailError ? <p className="mt-3 text-sm text-red-300" role="alert">{emailError}</p> : null}
      </section>
      <section className="card card-still max-w-md p-5">
        <h2 className="text-lg font-semibold">Zwei-Faktor-Authentifizierung</h2>
        <p className="mt-1 text-sm text-muted">
          Status: <strong>{mfaEnabled ? "aktiv" : "nicht aktiviert"}</strong>. Beim Anmelden wird zusätzlich ein aktueller Code aus einer Authenticator-App benötigt.
        </p>
        {mfaEnabled ? (
          <form className="mt-4 space-y-2" onSubmit={removeTotp}>
            <label className="block text-sm">
              Konto-Passwort
              <input className="field mt-1" type="password" autoComplete="current-password" value={mfaPassword} onChange={(event) => setMfaPassword(event.target.value)} required />
            </label>
            <label className="block text-sm">
              Aktueller Authenticator-Code
              <input className="field mt-1" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" value={mfaCode} onChange={(event) => setMfaCode(event.target.value)} required />
            </label>
            <button className="btn-brand" type="submit" disabled={mfaBusy}>{mfaBusy ? "Bitte warten…" : "2FA deaktivieren"}</button>
          </form>
        ) : totp ? (
          <form className="mt-4 space-y-3" onSubmit={confirmTotp}>
            <p className="text-sm text-muted">Füge diesen Schlüssel manuell in deiner Authenticator-App hinzu. Teile ihn mit niemandem.</p>
            <code className="block break-all rounded-lg bg-black/20 p-3 text-sm">{totp.secret}</code>
            <a className="text-sm text-brand underline" href={totp.uri}>Authenticator-App öffnen</a>
            <label className="block text-sm">
              Sechsstelliger Code aus der App
              <input className="field mt-1" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" value={mfaCode} onChange={(event) => setMfaCode(event.target.value)} required />
            </label>
            <button className="btn-brand" type="submit" disabled={mfaBusy}>{mfaBusy ? "Bitte warten…" : "2FA aktivieren"}</button>
          </form>
        ) : (
          <form className="mt-4 space-y-2" onSubmit={startTotp}>
            <label className="block text-sm">
              Konto-Passwort zur Bestätigung
              <input className="field mt-1" type="password" autoComplete="current-password" value={mfaPassword} onChange={(event) => setMfaPassword(event.target.value)} required />
            </label>
            <button className="btn-brand" type="submit" disabled={mfaBusy}>{mfaBusy ? "Bitte warten…" : "2FA einrichten"}</button>
            <p className="text-xs text-muted">Eine verifizierte E-Mail-Adresse ist erforderlich. Richte vor der Aktivierung ein Verfahren zum Wiederherstellen des Zugangs ein.</p>
          </form>
        )}
        {mfaError ? <p className="mt-3 text-sm text-red-300" role="alert">{mfaError}</p> : null}
      </section>
      <section className="card card-still max-w-md p-5">
        <h2 className="text-lg font-semibold">Aktivitäts-Einwilligung</h2>
        <p className="mt-1 text-sm text-muted">
          Du kannst die Einwilligung jederzeit widerrufen. Dabei werden die gespeicherten Website-
          und Minecraft-Wochenwerte gelöscht; der Zugang zum Staff-Center endet.
        </p>
        <button
          type="button"
          className="btn-ghost mt-4"
          onClick={() => void withdrawActivityConsent()}
          disabled={withdrawingConsent}
        >
          {withdrawingConsent ? "Widerruf wird verarbeitet…" : "Einwilligung widerrufen"}
        </button>
        {withdrawalError ? <p className="mt-3 text-sm text-red-300" role="alert">{withdrawalError}</p> : null}
      </section>
    </div>
  );
}

