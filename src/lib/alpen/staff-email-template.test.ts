import assert from "node:assert/strict";
import test from "node:test";
import { renderStaffEmail } from "./staff-email-template.ts";

test("staff email templates include a matching subject, call to action, and text fallback", () => {
  const verification = renderStaffEmail({
    kind: "email-verification",
    actionUrl: "https://alpensmp-ad844.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=abc",
  });
  const reset = renderStaffEmail({
    kind: "password-reset",
    actionUrl:
      "https://alpensmp-ad844.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=abc",
  });

  assert.match(verification.subject, /E-Mail/);
  assert.match(verification.html, /E-Mail bestätigen/);
  assert.match(verification.text, /eigenes Passwort festlegen/);
  assert.match(verification.text, /meldest dich anschließend neu an/);
  assert.match(verification.text, /https:\/\/alpensmp-ad844\.firebaseapp\.com/);
  assert.match(reset.subject, /Passwort/);
  assert.match(reset.html, /Neues Passwort festlegen/);
  assert.match(reset.text, /Neues Passwort festlegen/);
});

test("staff email templates escape action links before adding them to HTML", () => {
  const email = renderStaffEmail({
    kind: "password-reset",
    actionUrl: 'https://example.test/?a="><script>alert(1)</script>&b=2',
  });

  assert.match(email.html, /&quot;&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt;&amp;b=2/);
  assert.doesNotMatch(email.html, /<script>/);
});
