import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hasCurrentStaffActivityConsent,
  isValidMinecraftUsername,
  STAFF_ACTIVITY_CONSENT_VERSION,
} from "./staff-consent.ts";
import {
  canPublishCommunityItem,
  canShowCommunityItem,
  communitySubmissionGaps,
} from "./community-consent.ts";
import { shouldArchivePermanentBan, type PermanentBanState } from "./moderation.ts";
import { can } from "./roles.ts";
import { moveStaffLayoutTab, normalizeStaffLayout, reorderStaffLayoutTab } from "./staff-layout.ts";
import { captureStaffLoginSideEffect } from "./staff-login-audit.ts";

describe("moderation role access", () => {
  it("allows owner, admin, and helper to moderate while supporters can only read", () => {
    for (const role of ["owner", "admin", "helper"]) {
      assert.equal(can(role, "moderation"), true);
      assert.equal(can(role, "moderationRead"), true);
    }
    assert.equal(can("supporter", "moderation"), false);
    assert.equal(can("supporter", "moderationRead"), true);
  });

  it("allows only owners and admins to edit the shared player command catalog", () => {
    for (const role of ["owner", "admin"]) {
      assert.equal(can(role, "commandsRead"), true);
      assert.equal(can(role, "commandsEdit"), true);
    }
    for (const role of ["helper", "supporter"]) {
      assert.equal(can(role, "commandsRead"), true);
      assert.equal(can(role, "commandsEdit"), false);
    }
    assert.equal(can("builder", "commandsRead"), false);
    assert.equal(can("builder", "commandsEdit"), false);
  });
});

describe("staff activity consent", () => {
  const consent = {
    version: STAFF_ACTIVITY_CONSENT_VERSION,
    acceptedAt: 1_800_000_000_000,
    minecraftName: "Test_Player",
  };

  it("accepts only a current consent record with a valid Minecraft name", () => {
    assert.equal(isValidMinecraftUsername("Test_Player"), true);
    assert.equal(isValidMinecraftUsername("ab"), false);
    assert.equal(isValidMinecraftUsername("name with spaces"), false);
    assert.equal(hasCurrentStaffActivityConsent(consent), true);
    assert.equal(hasCurrentStaffActivityConsent({ ...consent, version: "old-version" }), false);
    assert.equal(hasCurrentStaffActivityConsent({ ...consent, acceptedAt: NaN }), false);
    assert.equal(hasCurrentStaffActivityConsent({ ...consent, minecraftName: "invalid name" }), false);
    assert.equal(hasCurrentStaffActivityConsent(null), false);
  });
});

describe("staff login audit availability", () => {
  it("allows authentication to continue when a non-critical login side effect is unavailable", async () => {
    assert.equal(
      await captureStaffLoginSideEffect(async () => undefined, "Audit nicht erreichbar"),
      undefined,
    );
    assert.equal(
      await captureStaffLoginSideEffect(async () => {
        throw new Error("Relay offline");
      }, "Audit nicht erreichbar"),
      "Audit nicht erreichbar",
    );
    assert.equal(
      await captureStaffLoginSideEffect(() => new Promise(() => {}), "Audit nicht erreichbar", 1),
      "Audit nicht erreichbar",
    );
  });
});

describe("staff center personal layout", () => {
  const tabIds = ["moderation", "roster", "absence", "help"];
  const defaults = ["moderation", "roster", "absence"];

  it("uses safe defaults and keeps every allowed area accessible", () => {
    assert.deepEqual(normalizeStaffLayout(null, tabIds, defaults), {
      quickTabs: defaults,
      moreTabs: ["help"],
    });
  });

  it("drops unknown and duplicate tabs from saved preferences", () => {
    assert.deepEqual(
      normalizeStaffLayout(
        {
          quickTabs: ["help", "help", "unknown"],
          moreTabs: ["moderation", "help"],
        },
        tabIds,
        defaults,
      ),
      {
        quickTabs: ["help"],
        moreTabs: ["moderation", "roster", "absence"],
      },
    );
  });

  it("moves and reorders tabs without losing any area", () => {
    const layout = normalizeStaffLayout(null, tabIds, defaults);
    const moved = moveStaffLayoutTab(layout, "help", "quickTabs");
    const reordered = reorderStaffLayoutTab(moved, "quickTabs", "help", -1);
    assert.deepEqual(reordered.quickTabs, ["moderation", "roster", "help", "absence"]);
    assert.deepEqual(reordered.moreTabs, []);
  });
});

describe("permanent-ban archiving", () => {
  const now = Date.parse("2026-11-10T12:00:00.000Z");
  const oldMinecraftBan: PermanentBanState & { minecraftBanKey: string } = {
    duration: "Permanent",
    ts: now - 86_400_000,
    minecraftBanKey: "uuid:player",
  };

  it("archives old permanent Minecraft bans after 24 hours", () => {
    assert.equal(shouldArchivePermanentBan(oldMinecraftBan, now), true);
  });

  it("keeps recent, pending, and already archived bans out of the archive", () => {
    assert.equal(shouldArchivePermanentBan({ duration: "Permanent", ts: now - 1 }, now), false);
    assert.equal(shouldArchivePermanentBan({ ...oldMinecraftBan, pending: true }, now), false);
    assert.equal(shouldArchivePermanentBan({ ...oldMinecraftBan, archived: true }, now), false);
  });
});

describe("community publication consent", () => {
  it("allows internal submissions without public consent", () => {
    assert.deepEqual(
      communitySubmissionGaps({
        name: "Spieler",
        text: "Guter Server",
        kind: "both",
        hasFile: true,
        submissionAcknowledged: false,
        publicationConsent: false,
        imageRightsConfirmed: false,
      }),
      ["Bestätigung zur Prüfung"],
    );
    assert.deepEqual(
      communitySubmissionGaps({
        name: "Spieler",
        text: "Guter Server",
        kind: "both",
        hasFile: true,
        submissionAcknowledged: true,
        publicationConsent: false,
        imageRightsConfirmed: false,
      }),
      [],
    );
    assert.deepEqual(
      communitySubmissionGaps({
        name: "Spieler",
        text: "Guter Server",
        kind: "review",
        hasFile: false,
        submissionAcknowledged: true,
        publicationConsent: false,
        imageRightsConfirmed: false,
      }),
      [],
    );
    assert.deepEqual(
      communitySubmissionGaps({
        name: "Spieler",
        text: "Guter Server",
        kind: "both",
        hasFile: true,
        submissionAcknowledged: true,
        publicationConsent: true,
        imageRightsConfirmed: false,
      }),
      ["Bestätigung der Bildrechte"],
    );
  });

  it("requires separate publication consent and image-rights confirmation", () => {
    assert.equal(canPublishCommunityItem({ publicationConsent: true }, "review"), true);
    assert.equal(canPublishCommunityItem({ publicationConsent: true }, "image"), false);
    assert.equal(
      canPublishCommunityItem(
        {
          publicationConsent: true,
          imageRightsConfirmed: true,
        },
        "image",
      ),
      true,
    );
  });

  it("keeps denied and legacy submissions private until explicit consent is recorded", () => {
    assert.equal(
      canShowCommunityItem(
        {
          status: "approved",
          publicationConsent: false,
        },
        "review",
      ),
      false,
    );
    assert.equal(canShowCommunityItem({ status: "approved" }, "review"), false);
    assert.equal(
      canShowCommunityItem(
        { status: "approved", publicationConsent: true },
        "review",
      ),
      true,
    );
    assert.equal(
      canShowCommunityItem(
        { status: "approved", publicationConsent: true },
        "image",
      ),
      false,
    );
    assert.equal(
      canShowCommunityItem(
        { status: "approved", publicationConsent: true, imageRightsConfirmed: true },
        "image",
      ),
      true,
    );
    assert.equal(canPublishCommunityItem({ status: "pending" }, "review"), false);
  });
});
