import assert from "node:assert/strict";
import test from "node:test";
import { can } from "./roles.ts";

test("builder access is limited to absence calendar, account settings, and builder chat", () => {
  for (const area of ["absence", "settings", "chat", "builderChat"] as const) {
    assert.equal(can("builder", area), true);
  }
  for (const area of ["tasks", "roster", "roles", "guide", "search"] as const) {
    assert.equal(can("builder", area), false);
  }
});

test("buildmanager can manage Builder accounts without gaining wider staff areas", () => {
  for (const area of ["absence", "settings", "roles", "chat", "builderChat"] as const) {
    assert.equal(can("buildmanager", area), true);
  }
  for (const area of ["moderation", "tasks", "roster", "guide", "search", "website"] as const) {
    assert.equal(can("buildmanager", area), false);
  }
});
