# AlpenSMP Website

Neue Website. Die bisherige statische Seite bleibt vollständig auf dem Branch `alte-website`.

GitHub Pages kann diese App nicht ausführen. Dafür braucht es einen Node-Host. Die Domain `alpensmp.net` zeigt deshalb weiter auf `alte-website`, bis der neue Host steht.

Team-Accounts verwenden persönliche E-Mail-Adressen für Login und Passwort-Wiederherstellung. Vor dem Rollout müssen in Firebase E-Mail/Passwort-Anmeldung aktiviert und die Regeln aus `firebase/database.rules.json` veröffentlicht werden. Die E-Mail-Zuordnung ist nicht öffentlich lesbar; bestehende Konten müssen vor der Umstellung einzeln mit einer persönlichen E-Mail-Adresse eingerichtet werden.

Öffentliche Ticketcodes sind zufällige 128-Bit-Zugangstoken und laufen nach 30 Tagen ab. Beim Ausrollen müssen auch die Regeln aus `firebase/database.rules.json` veröffentlicht werden; bisherige kurze Codes ohne `expiresAt` sind danach nicht mehr öffentlich lesbar.
