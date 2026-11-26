import assert from "node:assert/strict";
import { test } from "node:test";
import { staffLayoutForView } from "./staff-layout.ts";

test("role preview uses a complete role navigation instead of the owner's saved layout", () => {
  const layout = staffLayoutForView(
    { quickTabs: ["users"], moreTabs: [] },
    true,
    ["stream"],
    ["moderation", "roster", "absence"],
  );

  assert.deepEqual(layout, { quickTabs: [], moreTabs: ["stream"] });
});

test("normal view keeps the saved personal navigation", () => {
  const layout = staffLayoutForView(
    { quickTabs: ["users"], moreTabs: ["absence"] },
    false,
    ["users", "absence", "help"],
    ["moderation"],
  );

  assert.deepEqual(layout, { quickTabs: ["users"], moreTabs: ["absence", "help"] });
});
