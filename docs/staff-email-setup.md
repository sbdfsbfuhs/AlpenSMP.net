# Staff-E-Mail-Versand einrichten

Der Staff-Login verschickt Bestätigungs- und Passwort-Reset-E-Mails über Resend. Firebase Identity Platform erzeugt die einmaligen Aktionslinks; private Schlüssel und der Resend-API-Key bleiben ausschließlich auf dem Server.

## 1. Absenderdomain in Resend verifizieren

1. Erstelle ein Konto unter [resend.com/signup](https://resend.com/signup).
2. Füge im Resend-Dashboard `alpensmp.net` als Domain hinzu.
3. Übernimm die von Resend angezeigten DNS-Einträge unverändert beim Anbieter, der die DNS-Zone für `alpensmp.net` verwaltet.
4. Warte, bis Resend die Domain als verifiziert anzeigt.
5. Erstelle einen Resend-API-Key mit Berechtigung zum E-Mail-Versand. Kopiere ihn nur in das Secret-Feld von Vercel – nicht in den Quellcode oder diesen Chat.

## 2. Firebase-Service-Account vorbereiten

1. Öffne in der Google Cloud Console das Projekt `alpensmp-ad844`.
2. Erstelle einen Service-Account nur für den Staff-E-Mail-Versand.
3. Gib ihm nur die benötigte Berechtigung `firebaseauth.users.sendEmail`. Am sichersten ist eine benutzerdefinierte Rolle, die ausschließlich diese Berechtigung enthält. Die offizielle [Identity-Platform-Berechtigungstabelle](https://cloud.google.com/identity-platform/docs/access-control) führt sie für das Erzeugen von Aktionslinks auf.
4. Erstelle einen JSON-Schlüssel für diesen Service-Account und speichere ihn sicher. Der vollständige JSON-Inhalt wird später als Vercel-Secret eingetragen.

Erstelle keinen Schlüssel für einen bereits überprivilegierten persönlichen Account. Falls die Organisation das Erstellen von Service-Account-Schlüsseln blockiert, nicht versuchen, die Richtlinie zu umgehen; dann muss eine geeignete serverseitige Workload-Identity-Lösung eingerichtet werden.

## 3. Vercel konfigurieren und deployen

Im Vercel-Projekt unter **Settings → Environment Variables** für Production eintragen:

- `RESEND_API_KEY` – der API-Key aus Resend.
- `FIREBASE_EMAIL_SERVICE_ACCOUNT_JSON` – der vollständige JSON-Inhalt des oben erstellten Service-Accounts.
- `ALPEN_EMAIL_FROM` – `AlpenSMP <no-reply@alpensmp.net>` (oder eine andere Adresse auf der verifizierten Domain).

Die Werte als serverseitige Variablen eintragen, nicht mit `VITE_`-Präfix. Danach die Änderungen speichern und die Production-Deployment neu starten bzw. neu deployen. Erst danach kann eine echte Zustellung getestet werden.

Der Service-Account-Schlüssel und Resend-API-Key sind Secrets: niemals in Git, öffentliche Umgebungsvariablen oder Browser-Code eintragen und nicht hier in den Chat senden.

## Passwort-Reset

Nach einer Anfrage zeigt der Button einen Countdown von 60 Sekunden und blockiert weitere Klicks. Der Server begrenzt zusätzliche Anfragen ebenfalls. Nach erfolgreichem Passwort-Reset führt Firebase zurück zur Team-Anmeldung unter `/team`.
