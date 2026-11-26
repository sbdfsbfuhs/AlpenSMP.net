export type StaffEmailKind = "password-reset" | "email-verification";

type StaffEmailTemplateInput = {
  kind: StaffEmailKind;
  actionUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderStaffEmail({ kind, actionUrl }: StaffEmailTemplateInput) {
  const isPasswordReset = kind === "password-reset";
  const title = isPasswordReset ? "Passwort zurücksetzen" : "E-Mail-Adresse bestätigen";
  const subject = isPasswordReset
    ? "Setze dein AlpenSMP-Passwort sicher zurück"
    : "Bestätige deine persönliche AlpenSMP-E-Mail";
  const buttonLabel = isPasswordReset ? "Neues Passwort festlegen" : "E-Mail bestätigen";
  const escapedActionUrl = escapeHtml(actionUrl);
  const intro = isPasswordReset
    ? "Für dein AlpenSMP-Teamkonto wurde ein neues Passwort angefordert."
    : "Bestätige deine persönliche E-Mail-Adresse, damit du dein AlpenSMP-Teamkonto verwenden kannst. Bei der Ersteinrichtung kannst du danach direkt dein eigenes Passwort festlegen.";
  const expiry = isPasswordReset
    ? "Der Link ist nur kurze Zeit gültig. Wenn du das Zurücksetzen nicht angefordert hast, kannst du diese E-Mail ignorieren."
    : "Der Link ist nur kurze Zeit gültig. Nach der Bestätigung wirst du zum Staff-Center zurückgeleitet. Bei der Ersteinrichtung legst du dort dein eigenes Passwort fest und meldest dich anschließend neu an.";

  return {
    subject,
    text: [
      `Hallo!`,
      ``,
      intro,
      ``,
      `${buttonLabel}: ${actionUrl}`,
      ``,
      expiry,
      ``,
      `Viele Grüße`,
      `Dein AlpenSMP-Team`,
      `https://alpensmp.net`,
    ].join("\n"),
    html: `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>${title}</title>
  </head>
  <body style="margin:0;background:#f3f0e9;color:#242321;font-family:Arial,Helvetica,sans-serif">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">${intro}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f0e9;padding:36px 12px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fffefa;border:1px solid #e8e2d7;border-radius:20px;overflow:hidden">
            <tr>
              <td style="padding:28px 34px;background:#25231f;color:#fffefa">
                <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#e7bd77;font-weight:700">AlpenSMP · Team</div>
                <div style="margin-top:10px;font-size:26px;line-height:1.2;font-weight:700">${title}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:34px">
                <p style="margin:0 0 14px;font-size:16px;line-height:1.65">Hallo!</p>
                <p style="margin:0 0 25px;color:#555149;font-size:15px;line-height:1.7">${intro}</p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 25px">
                  <tr>
                    <td style="border-radius:10px;background:#a54435">
                      <a href="${escapedActionUrl}" style="display:inline-block;padding:14px 21px;color:#fff;text-decoration:none;font-size:15px;font-weight:700">${buttonLabel}</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 10px;color:#625e56;font-size:13px;line-height:1.65">${expiry}</p>
                <p style="margin:21px 0 7px;color:#817b70;font-size:12px">Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:</p>
                <p style="margin:0;overflow-wrap:anywhere;font-size:12px;line-height:1.6"><a href="${escapedActionUrl}" style="color:#8e382c">${escapedActionUrl}</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 34px;border-top:1px solid #eee9df;color:#827d73;font-size:12px;line-height:1.6">
                Viele Grüße<br><strong style="color:#4b473f">Dein AlpenSMP-Team</strong><br>
                <a href="https://alpensmp.net" style="color:#8e382c;text-decoration:none">alpensmp.net</a>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;color:#918b80;font-size:11px">Automatische Nachricht für dein AlpenSMP-Teamkonto</p>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}
