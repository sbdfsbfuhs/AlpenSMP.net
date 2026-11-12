import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldArchivePermanentBan, type PermanentBanState } from "./moderation.ts";
import { can } from "./roles.ts";

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
