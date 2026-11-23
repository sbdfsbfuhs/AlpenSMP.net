import assert from "node:assert/strict";
import test from "node:test";
import { canAccessStaffLog, isActiveStaffIdentity } from "../security-api/staff-policy.cjs";

const activeMapping = { username: "helper", role: "helper", disabled: false };
const activeProfile = { uid: "helper-uid", role: "helper", disabled: false };

test("staff authorization requires an active matching UID mapping and account profile", () => {
  assert.equal(isActiveStaffIdentity(activeMapping, activeProfile, "helper-uid"), true);
  assert.equal(
    isActiveStaffIdentity({ ...activeMapping, disabled: true }, activeProfile, "helper-uid"),
    false,
  );
  assert.equal(
    isActiveStaffIdentity(activeMapping, { ...activeProfile, disabled: true }, "helper-uid"),
    false,
  );
  assert.equal(
    isActiveStaffIdentity(activeMapping, { ...activeProfile, role: "owner" }, "helper-uid"),
    false,
  );
  assert.equal(
    isActiveStaffIdentity(activeMapping, { ...activeProfile, uid: "other-uid" }, "helper-uid"),
    false,
  );
  assert.equal(
    isActiveStaffIdentity({ ...activeMapping, username: "../owner" }, activeProfile, "helper-uid"),
    false,
  );
  assert.equal(isActiveStaffIdentity(activeMapping, null, "helper-uid"), false);
});

test("staff log access allows active staff to append but only owners to read", () => {
  for (const role of ["owner", "admin", "helper", "supporter", "builder", "streamer"]) {
    assert.equal(canAccessStaffLog("POST", role), true, `${role} can append`);
  }
  assert.equal(canAccessStaffLog("GET", "owner"), true);
  for (const role of ["admin", "helper", "supporter", "builder", "streamer", "unknown"]) {
    assert.equal(canAccessStaffLog("GET", role), false, `${role} cannot read`);
    assert.equal(canAccessStaffLog("POST", role), role !== "unknown", `${role} append policy`);
  }
  assert.equal(canAccessStaffLog("DELETE", "owner"), false);
});
