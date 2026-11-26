import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import {
  internalStaffEmail,
  isInternalStaffEmail,
  canCompleteFirstStaffPasswordSetup,
  normalizeRecoveryEmail,
  normalizeStaffEmail,
  requiresPersonalStaffEmail,
  temporaryStaffPassword,
} from "./staff-account-flow.ts";
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

  it("keeps self-service account updates active, own-record, and role-stable", async () => {
    const rulesUrl = new URL("../../../firebase/database.rules.json", import.meta.url);
    const rules = JSON.parse(await readFile(rulesUrl, "utf8")) as {
      rules: { staffUsers: { $name: { ".write": string } } };
    };
    const ownAccountWrite = rules.rules.staffUsers.$name[".write"];
    assert.match(ownAccountWrite, /staffUsers'\)\.child\(\$name\)\.child\('uid'\)\.val\(\)\s*==\s*auth\.uid/);
    assert.match(ownAccountWrite, /newData\.child\('role'\)\.val\(\)\s*==\s*data\.child\('role'\)\.val\(\)/);
    assert.match(ownAccountWrite, /newData\.child\('uid'\)\.val\(\)\s*==\s*data\.child\('uid'\)\.val\(\)/);
    assert.match(ownAccountWrite, /newData\.child\('disabled'\)\.val\(\)\s*==\s*data\.child\('disabled'\)\.val\(\)/);
    assert.doesNotMatch(ownAccountWrite, /staffOpen/);
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

    it("keeps ticket and support records staff-only in Firebase rules", async () => {
      const rulesUrl = new URL("../../../firebase/database.rules.json", import.meta.url);
      const rules = JSON.parse(await readFile(rulesUrl, "utf8")) as {
        rules: {
          helpRequests: { $id: { ".write": string } };
          tickets: { $code: { ".read": string; ".write": string } };
        };
      };
      for (const expression of [
        rules.rules.helpRequests.$id[".write"],
        rules.rules.tickets.$code[".read"],
        rules.rules.tickets.$code[".write"],
      ]) {
        assert.match(expression, /auth\s*!=\s*null/);
        assert.match(expression, /disabled.*!=\s*true/);
      }
      assert.doesNotMatch(rules.rules.helpRequests.$id[".write"], /!data\.exists\(\)/);
      assert.doesNotMatch(rules.rules.tickets.$code[".read"], /expiresAt/);
      assert.doesNotMatch(rules.rules.tickets.$code[".write"], /!data\.exists\(\)/);
    });

    it("does not grant owner access through a hard-coded email address", async () => {
      const rulesUrl = new URL("../../../firebase/database.rules.json", import.meta.url);
      const rulesText = await readFile(rulesUrl, "utf8");
      assert.doesNotMatch(rulesText, /auth\.token\.email\s*==\s*["'][^"']+@[^"']+["']/);
    });

    it("requires staff authentication for Firebase statistics history writes", async () => {
      const rulesUrl = new URL("../../../firebase/database.rules.json", import.meta.url);
      const rules = JSON.parse(await readFile(rulesUrl, "utf8")) as {
        rules: { site_stats_history: { $id: { ".write": string } } };
      };
      const writeRule = rules.rules.site_stats_history.$id[".write"];
      assert.match(writeRule, /auth\s*!=\s*null/);
      assert.match(writeRule, /staffByUid/);
      assert.doesNotMatch(writeRule, /!data\.exists\(\)/);
      assert.doesNotMatch(writeRule, /!newData\.exists\(\)/);
    });
  });

  it("normalizes valid email addresses", () => {
    assert.equal(normalizeStaffEmail("  Staff.Person@Example.COM "), "staff.person@example.com");
  });

  it("rejects malformed or missing email addresses", () => {
    assert.throws(() => normalizeStaffEmail(""), /gültige E-Mail/);
    assert.throws(() => normalizeStaffEmail("not-an-email"), /gültige E-Mail/);
  });

  it("requires a personal address for account recovery", () => {
    assert.equal(normalizeRecoveryEmail("  Owner@example.com "), "owner@example.com");
    assert.throws(() => normalizeRecoveryEmail("owner@staff.alpensmp.net"), /persönliche E-Mail/);
  });

  it("uses the team name as the private first-login email until a personal email is verified", () => {
    assert.equal(internalStaffEmail(" Builder Name "), "buildername@staff.alpensmp.net");
    assert.throws(() => internalStaffEmail("x"), /2–24 Zeichen/);
  });

  it("requires a verified personal address before staff access", () => {
    assert.equal(isInternalStaffEmail("member@staff.alpensmp.net"), true);
    assert.equal(isInternalStaffEmail("member@example.com"), false);
    assert.equal(requiresPersonalStaffEmail("member@example.com", true), false);
    assert.equal(requiresPersonalStaffEmail("member@example.com", false), true);
    assert.equal(requiresPersonalStaffEmail("member@staff.alpensmp.net", true), true);
  });

  it("allows first-password setup only for the verified, active account that still requires it", () => {
    const account = {
      email: "member@example.com",
      emailVerified: true,
      uid: "uid-1",
      accountUid: "uid-1",
      mustChangePw: true,
    };
    assert.equal(canCompleteFirstStaffPasswordSetup(account), true);
    assert.equal(canCompleteFirstStaffPasswordSetup({ ...account, emailVerified: false }), false);
    assert.equal(canCompleteFirstStaffPasswordSetup({ ...account, email: "member@staff.alpensmp.net" }), false);
    assert.equal(canCompleteFirstStaffPasswordSetup({ ...account, accountUid: "uid-2" }), false);
    assert.equal(canCompleteFirstStaffPasswordSetup({ ...account, mustChangePw: false }), false);
    assert.equal(canCompleteFirstStaffPasswordSetup({ ...account, disabled: true }), false);
  });

  it("generates an unpredictable one-time password without exposing it in the account flow", () => {
    const first = temporaryStaffPassword();
    const second = temporaryStaffPassword();
    assert.match(first, /^Alpen![a-f0-9]{64}$/);
    assert.notEqual(first, second);
  });
});
