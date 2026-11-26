import assert from "node:assert/strict";
import test from "node:test";
import { remainingPasswordResetCooldownSeconds } from "./staff-email-cooldown.ts";

test("password reset cooldown rounds remaining time up and expires at zero", () => {
  assert.equal(remainingPasswordResetCooldownSeconds(61_000, 1_000), 60);
  assert.equal(remainingPasswordResetCooldownSeconds(60_999, 1_000), 60);
  assert.equal(remainingPasswordResetCooldownSeconds(60_000, 1_000), 59);
  assert.equal(remainingPasswordResetCooldownSeconds(999, 1_000), 0);
});

test("password reset cooldown ignores invalid timestamps", () => {
  assert.equal(remainingPasswordResetCooldownSeconds(Number.NaN, 1_000), 0);
  assert.equal(remainingPasswordResetCooldownSeconds(61_000, Number.NaN), 0);
});
