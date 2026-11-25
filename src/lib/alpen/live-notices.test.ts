import assert from "node:assert/strict";
import test from "node:test";
import { groupLiveNotices } from "./live-notices.ts";

test("groups repeated live notices by sender and keeps the newest", () => {
  const groups = groupLiveNotices({
    first: { by: "gamer", name: ".gamer.gl", title: "Survival", ts: 100 },
    newer: { by: "GAMER", name: ".gamer.gl", title: "Survival", ts: 200 },
    other: { by: "another", name: "Another", title: "Build", ts: 150 },
  });

  assert.deepEqual(groups, [
    { key: "gamer", ids: ["newer", "first"], item: { by: "GAMER", name: ".gamer.gl", title: "Survival", ts: 200 } },
    { key: "another", ids: ["other"], item: { by: "another", name: "Another", title: "Build", ts: 150 } },
  ]);
});

test("keeps notices without a sender separate", () => {
  const groups = groupLiveNotices({
    first: { title: "One", ts: 200 },
    second: { title: "Two", ts: 100 },
  });

  assert.deepEqual(groups.map((group) => group.key), ["notice:first", "notice:second"]);
});
