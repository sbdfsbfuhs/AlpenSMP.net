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

## Firebase-Login nach dem Löschen wiederverwenden

Das Entfernen eines Teamkontos aus dem Panel löscht nicht den Firebase-Authentication-Account. Es wird kein zusätzlicher Service-Account benötigt. Wenn Firebase beim erneuten Anlegen meldet, dass die interne E-Mail schon registriert ist:

1. Öffne [Firebase Authentication → Users](https://console.firebase.google.com/project/alpensmp-ad844/authentication/users).
2. Suche nach der internen Adresse `teamname@staff.alpensmp.net` (Teamname kleingeschrieben, Leerzeichen entfernt).
3. Prüfe sorgfältig, dass es das alte, bereits aus dem Staff-Center entfernte Teamkonto ist, und lösche nur diesen Auth-Eintrag.
4. Lege den Team-Account danach im Staff-Center erneut an.

Bei vollständig eingerichteten Konten kann Firebase statt der internen Adresse die persönliche E-Mail gespeichert haben. Lösche in diesem Fall keinen Eintrag, wenn du ihn nicht eindeutig dem entfernten Teamkonto zuordnen kannst.

## 3. Vercel konfigurieren und deployen

Im Vercel-Projekt unter **Settings → Environment Variables** für Production eintragen:

- `RESEND_API_KEY` – der API-Key aus Resend.
- `FIREBASE_EMAIL_SERVICE_ACCOUNT_JSON` – der vollständige JSON-Inhalt des oben erstellten Service-Accounts.
- `ALPEN_EMAIL_FROM` – `AlpenSMP <no-reply@alpensmp.net>` (oder eine andere Adresse auf der verifizierten Domain).

Die Werte als serverseitige Variablen eintragen, nicht mit `VITE_`-Präfix. Danach die Änderungen speichern und die Production-Deployment neu starten bzw. neu deployen. Erst danach kann eine echte Zustellung getestet werden.

Der Service-Account-Schlüssel und Resend-API-Key sind Secrets: niemals in Git, öffentliche Umgebungsvariablen oder Browser-Code eintragen und nicht hier in den Chat senden.

## Passwort-Reset

Nach einer Anfrage zeigt der Button einen Countdown von 60 Sekunden und blockiert weitere Klicks. Der Server begrenzt zusätzliche Anfragen ebenfalls. Nach erfolgreichem Passwort-Reset führt Firebase zurück zur Team-Anmeldung unter `/team`.

## Neue Teamkonten einrichten

Im Staff-Center legt der Owner neue Konten mit Teamname und Rolle an. Buildmanager können ausschließlich Builder-Konten erstellen. Es gibt keine öffentliche Registrierung und der Teamname allein ist kein Zugang.

Nach dem Anlegen wird ein zufälliger Einrichtungscode einmalig im Staff-Center angezeigt; er wird weder gespeichert noch per E-Mail verschickt. Gib ihn nur direkt an die vorgesehene Person weiter. Diese meldet sich unter `/team` mit Teamname und Code an, trägt ihre persönliche E-Mail-Adresse ein und bestätigt den zugesandten Link. Nach der Bestätigung führt der Link zurück zu einer Einrichtungsseite. Dort gibt sie die bestätigte E-Mail-Adresse und den Einrichtungscode erneut ein und legt ein eigenes Passwort mit mindestens acht Zeichen fest. Anschließend meldet sie sich mit der persönlichen E-Mail und dem neuen Passwort an, erteilt die erforderliche Aktivitätseinwilligung und lässt den Minecraft-Namen gegen die Serverhistorie prüfen. Erst dann wird das Staff-Center freigeschaltet.

Wird der Einrichtungscode verloren, kann ein berechtigter Owner oder Buildmanager im Konto unter „E-Mail und Zugang“ die persönliche E-Mail-Adresse hinterlegen und einen Passwort-Link senden.
