import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  pruneStaffActivity,
  recordStaffActivityHeartbeat,
  removeTrackedStaffEntry,
} = require("../security-api/staff-activity.cjs");

const minute = 60_000;
const at = (date, time = "12:00:00.000Z") => Date.parse(`${date}T${time}`);

test("staff activity counts only bounded gaps and keeps members separate", () => {
  const first = at("2026-03-01");
  let state = recordStaffActivityHeartbeat(null, "owner", first);
  state = recordStaffActivityHeartbeat(state, "owner", first + 30_000);
  state = recordStaffActivityHeartbeat(state, "helper", first + 30_000);
  state = recordStaffActivityHeartbeat(state, "owner", first + 2 * minute);

  assert.equal(state.members.owner.website.daily["2026-03-01"], 30);
  assert.equal(state.members.helper.website.daily["2026-03-01"], undefined);
  assert.equal(state.members.helper.website.lastHeartbeatAt, first + 30_000);
});

test("staff activity splits a heartbeat across UTC days", () => {
  const first = at("2026-03-01", "23:59:50.000Z");
  let state = recordStaffActivityHeartbeat(null, "helper", first);
  state = recordStaffActivityHeartbeat(state, "helper", first + 30_000);

  assert.equal(state.members.helper.website.daily["2026-03-01"], 10);
  assert.equal(state.members.helper.website.daily["2026-03-02"], 20);
});

test("staff activity compacts old daily buckets and expires data beyond one year", () => {
  const now = at("2026-03-01");
  const staleDate = "2024-01-01";
  const recentOldDate = "2026-01-01";
  const state = {
    version: 1,
    members: {
      owner: {
        website: {
          daily: { [staleDate]: 90, [recentOldDate]: 120 },
          weekly: {},
          lastHeartbeatAt: now - 60_000,
        },
      },
    },
  };
  const next = pruneStaffActivity(state, now);
  const buckets = next.members.owner.website;

  assert.equal(buckets.daily[recentOldDate], undefined);
  assert.equal(buckets.weekly["2025-12-29"], 120);
  assert.equal(buckets.weekly["2024-01-01"], undefined);
  assert.equal(buckets.lastHeartbeatAt, now - 60_000);
});

test("staff activity rejects invalid identities and malformed stored data", () => {
  assert.throws(() => recordStaffActivityHeartbeat(null, "../owner", 1_800_000_000_000));
  assert.throws(() => recordStaffActivityHeartbeat({ version: 2, members: {} }, "owner", 1_800_000_000_000));
});

test("activity withdrawal removes only the authenticated staff member from the Minecraft allowlist", () => {
  const result = removeTrackedStaffEntry("v1\nowner\tSwissRed\nhelper\tTestPlayer\n", "owner");
  assert.equal(result.removed, true);
  assert.equal(result.text, "v1\nhelper\tTestPlayer\n");
  assert.throws(() => removeTrackedStaffEntry("v1\nmalformed\n", "owner"));
});
