import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldArchivePermanentBan, type PermanentBanState } from "./moderation.ts";
import { can } from "./roles.ts";
import { moveStaffLayoutTab, normalizeStaffLayout, reorderStaffLayoutTab } from "./staff-layout.ts";

describe("moderation role access", () => {
  it("allows owner, admin, and helper to moderate while supporters can only read", () => {
    for (const role of ["owner", "admin", "helper"]) {
      assert.equal(can(role, "moderation"), true);
      assert.equal(can(role, "moderationRead"), true);
    }
    assert.equal(can("supporter", "moderation"), false);
    assert.equal(can("supporter", "moderationRead"), true);
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
    assert.deepEqual(normalizeStaffLayout({
      quickTabs: ["help", "help", "unknown"],
      moreTabs: ["moderation", "help"],
    }, tabIds, defaults), {
      quickTabs: ["help"],
      moreTabs: ["moderation", "roster", "absence"],
    });
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
