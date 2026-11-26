import assert from "node:assert/strict";
import test from "node:test";
import {
  canAccessStaffLog,
  filterBuilderAbsences,
  filterBuilderStaffLog,
  isActiveStaffIdentity,
} from "../security-api/staff-policy.cjs";

const activeMapping = { username: "helper", role: "helper", disabled: false };
const activeProfile = {
  uid: "helper-uid",
  role: "helper",
  disabled: false,
  activityConsent: {
    version: "staff-activity-v3",
    acceptedAt: 1_800_000_000_000,
    minecraftName: "TestPlayer",
  },
};

test("staff authorization requires an active matching UID mapping and account profile", () => {
  assert.equal(isActiveStaffIdentity(activeMapping, activeProfile, "helper-uid"), true);
  assert.equal(
    isActiveStaffIdentity(
      activeMapping,
      {
        ...activeProfile,
        activityConsent: { ...activeProfile.activityConsent, version: "staff-activity-v2" },
      },
      "helper-uid",
    ),
    false,
  );
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
    isActiveStaffIdentity(
      activeMapping,
      { ...activeProfile, activityConsent: undefined },
      "helper-uid",
    ),
    false,
  );
  assert.equal(
    isActiveStaffIdentity(
      activeMapping,
      {
        ...activeProfile,
        activityConsent: { ...activeProfile.activityConsent, minecraftName: "not valid" },
      },
      "helper-uid",
    ),
    false,
  );
  assert.equal(
    isActiveStaffIdentity({ ...activeMapping, username: "../owner" }, activeProfile, "helper-uid"),
    false,
  );
  assert.equal(isActiveStaffIdentity(activeMapping, null, "helper-uid"), false);
});

test("staff log access allows active staff to append but only owners and buildmanagers to read", () => {
  for (const role of ["owner", "admin", "helper", "supporter", "buildmanager", "builder", "streamer"]) {
    assert.equal(canAccessStaffLog("POST", role), true, `${role} can append`);
  }
  assert.equal(canAccessStaffLog("GET", "owner"), true);
  assert.equal(canAccessStaffLog("GET", "buildmanager"), true);
  for (const role of ["admin", "helper", "supporter", "builder", "streamer", "unknown"]) {
    assert.equal(canAccessStaffLog("GET", role), false, `${role} cannot read`);
    assert.equal(canAccessStaffLog("POST", role), role !== "unknown", `${role} append policy`);
  }
  assert.equal(canAccessStaffLog("DELETE", "owner"), false);
});

test("buildmanager log and absence views filter records to builder identities", () => {
  const rows = {
    builderAction: { by: "builder", action: "Login" },
    managerCreatedBuilder: { by: "manager", target: "builder", action: "Account angelegt" },
    ownerAction: { by: "owner", action: "Rolle geändert", target: "admin" },
    malformed: null,
  };
  assert.deepEqual(filterBuilderStaffLog(rows, new Set(["builder"])), {
    builderAction: rows.builderAction,
    managerCreatedBuilder: rows.managerCreatedBuilder,
  });
  assert.deepEqual(
    filterBuilderAbsences({
      builder: { by: "builder" },
      manager: { by: "manager" },
    }, ["builder"]),
    { builder: { by: "builder" } },
  );
});
