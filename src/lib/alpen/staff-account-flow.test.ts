import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { normalizeStaffEmail, temporaryStaffPassword } from "./staff-account-flow.ts";
import { createTicketCode, normalizeTicketCode, ticketAccessIsValid, TICKET_ACCESS_TTL_MS } from "./ticket-access.ts";

describe("staff account email recovery", () => {
  it("keeps the team email lookup private in Firebase rules", async () => {
    const rulesUrl = new URL("../../../firebase/database.rules.json", import.meta.url);
    const rules = JSON.parse(await readFile(rulesUrl, "utf8")) as {
      rules: { staffGate: { $name: { ".read": string | boolean } } };
    };
    assert.match(String(rules.rules.staffGate.$name[".read"]), /auth\s*!=\s*null/);
    assert.notEqual(rules.rules.staffGate.$name[".read"], true);
  });

  describe("public ticket access", () => {
    it("creates unguessable-format ticket codes with 128 bits of randomness", () => {
      const first = createTicketCode();
      const second = createTicketCode();
      assert.match(first, /^ALP-[A-F0-9]{32}$/);
      assert.notEqual(first, second);
      assert.equal(normalizeTicketCode(` ${first.toLowerCase()} `), first);
      assert.equal(normalizeTicketCode("ALP-4K2P"), null);
    });

    it("allows ticket status access only until the stored expiry time", () => {
      const now = 1_800_000_000_000;
      const expiresAt = now + TICKET_ACCESS_TTL_MS;
      assert.equal(ticketAccessIsValid(expiresAt, now), true);
      assert.equal(ticketAccessIsValid(expiresAt, expiresAt), false);
      assert.equal(ticketAccessIsValid(undefined, now), false);
      assert.equal(ticketAccessIsValid("later", now), false);
    });

    it("requires ticket reads to be authenticated or time-limited in Firebase rules", async () => {
      const rulesUrl = new URL("../../../firebase/database.rules.json", import.meta.url);
      const rules = JSON.parse(await readFile(rulesUrl, "utf8")) as {
        rules: { tickets: { $code: { ".read": string; ".write": string } } };
      };
      assert.match(rules.rules.tickets.$code[".read"], /expiresAt/);
      assert.match(rules.rules.tickets.$code[".read"], /\.val\(\)\s*>\s*now/);
      assert.match(rules.rules.tickets.$code[".write"], /ALP-\[0-9A-F\]\{32\}/);
      assert.match(rules.rules.tickets.$code[".write"], /expiresAt/);
      assert.match(rules.rules.tickets.$code[".write"], /2592000000/);
    });
  });

  it("normalizes valid email addresses", () => {
    assert.equal(normalizeStaffEmail("  Staff.Person@Example.COM "), "staff.person@example.com");
  });

  it("rejects malformed or missing email addresses", () => {
    assert.throws(() => normalizeStaffEmail(""), /gültige E-Mail/);
    assert.throws(() => normalizeStaffEmail("not-an-email"), /gültige E-Mail/);
  });

  it("generates an unpredictable one-time password without exposing it in the account flow", () => {
    const first = temporaryStaffPassword();
    const second = temporaryStaffPassword();
    assert.match(first, /^Alpen![a-f0-9]{64}$/);
    assert.notEqual(first, second);
  });
});
