import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test, { after, before } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { equalTo, get, orderByChild, query, ref, remove, set, update } from "firebase/database";

const projectId = "demo-alpensmp-security";
let environment;
const activityConsent = {
  version: "staff-activity-v2",
  acceptedAt: 1_800_000_000_000,
  minecraftName: "TestPlayer",
};

before(async () => {
  environment = await initializeTestEnvironment({
    projectId,
    database: {
      host: "127.0.0.1",
      port: 9001,
      rules: await readFile(new URL("../firebase/database.rules.json", import.meta.url), "utf8"),
    },
  });
  await environment.clearDatabase();
  await environment.withSecurityRulesDisabled(async (context) => {
    await set(ref(context.database(), "/"), {
      staffByUid: {
        "owner-uid": { username: "owner", role: "owner", disabled: false, email: "owner@example.test" },
        "admin-uid": { username: "admin", role: "admin", disabled: false, email: "admin@example.test" },
        "helper-uid": { username: "helper", role: "helper", disabled: false, email: "helper@example.test" },
        "builder-uid": { username: "builder", role: "builder", disabled: false, email: "builder@example.test" },
        "buildmanager-uid": { username: "buildmanager", role: "buildmanager", disabled: false, email: "buildmanager@example.test" },
        "builder-two-uid": { username: "buildertwo", role: "builder", disabled: false, email: "builder-two@example.test" },
        "paused-owner-uid": { username: "pausedowner", role: "owner", disabled: true, email: "paused@example.test" },
        "paused-helper-uid": { username: "pausedhelper", role: "helper", disabled: true, email: "paused-helper@example.test" },
        "streamer-uid": { username: "streamer", role: "streamer", disabled: false, email: "streamer@example.test" },
        "pending-uid": { username: "pending", role: "helper", disabled: false, email: "pending@example.test" },
        "first-owner-uid": { username: "firstowner", role: "owner", disabled: false, email: "first-owner@example.test" },
        "expired-owner-uid": { username: "expiredowner", role: "owner", disabled: false, email: "expired-owner@example.test" },
      },
      staffUsers: {
        owner: { uid: "owner-uid", role: "owner", disabled: false, email: "owner@example.test", activityConsent },
        admin: { uid: "admin-uid", role: "admin", disabled: false, email: "admin@example.test", activityConsent },
        helper: { uid: "helper-uid", role: "helper", disabled: false, email: "helper@example.test", activityConsent },
        builder: { uid: "builder-uid", role: "builder", disabled: false, email: "builder@example.test", activityConsent },
        buildmanager: { uid: "buildmanager-uid", role: "buildmanager", disabled: false, email: "buildmanager@example.test", activityConsent },
        buildertwo: { uid: "builder-two-uid", role: "builder", disabled: false, email: "builder-two@example.test", activityConsent },
        pausedowner: { uid: "paused-owner-uid", role: "owner", disabled: true, email: "paused@example.test" },
        pausedhelper: { uid: "paused-helper-uid", role: "helper", disabled: true, email: "paused-helper@example.test" },
        streamer: { uid: "streamer-uid", role: "streamer", disabled: false, email: "streamer@example.test", activityConsent },
        pending: { uid: "pending-uid", role: "helper", disabled: false, email: "pending@example.test" },
        firstowner: { uid: "first-owner-uid", role: "owner", disabled: false, email: "first-owner@example.test" },
        expiredowner: { uid: "expired-owner-uid", role: "owner", disabled: false, ownerUntil: 1, email: "expired-owner@example.test" },
      },
      minecraftKnownPlayers: { TestPlayer: true },
      staffDirectory: {
        owner: { role: "owner", disabled: false, lateDays: 3 },
        admin: { role: "admin", disabled: false, lateDays: 3 },
        helper: { role: "helper", disabled: false, lateDays: 3 },
        builder: { role: "builder", disabled: false, lateDays: 3 },
        buildertwo: { role: "builder", disabled: false, lateDays: 3 },
        buildmanager: { role: "buildmanager", disabled: false, lateDays: 3 },
      },
      staffOpen: {
        owner: { open: true, role: "owner" },
        helper: { open: true, role: "owner" },
      },
      staffGate: {
        owner: { open: true },
        helper: { open: true },
        builder: { open: true },
        buildertwo: { open: true },
      },
      staffLog: {},
      presence: {
        admin: { lastSeen: 200 },
        builder: { lastSeen: 100 },
        buildertwo: { lastSeen: 110 },
      },
    });
  });
});

after(async () => {
  await environment?.cleanup();
});

function db(uid) {
  return environment.authenticatedContext(uid).database();
}

test("staff directories reveal only the sanitized directory to active non-owner staff", async () => {
  const helper = db("helper-uid");
  const directory = await assertSucceeds(get(ref(helper, "staffDirectory")));
  assert.equal(directory.child("helper/email").exists(), false);
  await assertSucceeds(get(ref(helper, "staffUsers/helper")));
  await assertSucceeds(update(ref(helper, "staffUsers/helper"), { lastLogin: 123 }));
  await assertFails(update(ref(helper, "staffUsers/helper"), { disabled: true }));
  await assertFails(update(ref(helper, "staffUsers/helper"), { role: "owner" }));
  await assertFails(update(ref(helper, "staffByUid/helper-uid"), { lastLogin: 123 }));
  await assertFails(get(ref(helper, "staffUsers")));
  await assertFails(get(ref(helper, "staffUsers/owner")));
  await assertFails(get(ref(helper, "staffByUid")));
  await assertFails(get(ref(helper, "staffByUid/owner-uid")));
  await assertFails(get(ref(helper, "staffGate/owner")));
  await assertFails(get(ref(helper, "staffOpen/owner")));

  const owner = db("owner-uid");
  await assertSucceeds(get(ref(owner, "staffUsers")));
  await assertSucceeds(get(ref(owner, "staffByUid")));
  await assertSucceeds(get(ref(owner, "staffGate/owner")));
  await assertFails(get(ref(owner, "staffOpen/owner")));
  await assertFails(get(ref(environment.unauthenticatedContext().database(), "staffDirectory")));
});

test("paused accounts cannot read staff data or regain access through alternate paths", async () => {
  for (const [uid, username] of [
    ["paused-owner-uid", "pausedowner"],
    ["paused-helper-uid", "pausedhelper"],
  ]) {
    const paused = db(uid);
    await assertFails(get(ref(paused, "staffUsers")));
    await assertFails(get(ref(paused, `staffUsers/${username}`)));
    await assertFails(get(ref(paused, "staffByUid")));
    await assertFails(get(ref(paused, `${"staffByUid"}/${uid}`)));
    await assertFails(get(ref(paused, "staffDirectory")));
    await assertFails(get(ref(paused, "tickets")));
  }

  const pausedOwner = db("paused-owner-uid");
  await assertFails(
    update(ref(pausedOwner, "staffUsers/pausedowner"), { disabled: false, role: "owner" }),
  );
  await assertFails(
    update(ref(pausedOwner, "staffByUid/paused-owner-uid"), { disabled: false, role: "owner" }),
  );
  await assertFails(set(ref(pausedOwner, "staffGate/pausedowner"), { open: true }));
  await assertFails(set(ref(pausedOwner, "staffOpen/pausedowner"), { open: true, role: "owner" }));

  const helper = db("helper-uid");
  await assertFails(
    update(ref(helper, "staffByUid/helper-uid"), { role: "owner", username: "owner" }),
  );
  await assertFails(
    update(ref(helper, "staffUsers/helper"), { role: "owner", disabled: false }),
  );
  await assertFails(set(ref(helper, "staffOpen/helper"), { open: true, role: "owner" }));
});

test("staff data stays blocked until the account records valid activity consent", async () => {
  const pending = db("pending-uid");
  const owner = db("owner-uid");
  const helper = db("helper-uid");
  const firstOwner = db("first-owner-uid");
  const expiredOwner = db("expired-owner-uid");
  const pausedOwner = db("paused-owner-uid");
  const unauthenticated = environment.unauthenticatedContext().database();
  await assertSucceeds(get(ref(pending, "staffUsers/pending")));
  await assertFails(get(ref(pending, "staffDirectory")));
  await assertFails(get(ref(pending, "presence")));
  await assertFails(get(ref(pending, "staffLog")));

  await assertFails(
    set(ref(pending, "staffUsers/pending/activityConsent"), {
      version: "wrong-version",
      acceptedAt: 1_800_000_000_000,
      minecraftName: "TestPlayer",
    }),
  );
  await assertFails(
    set(ref(pending, "staffUsers/pending/activityConsent"), {
      ...activityConsent,
      minecraftName: "NeverJoined",
    }),
  );
  await assertFails(
    set(ref(pending, "staffUsers/pending/activityConsent/minecraftName"), "NeverJoined"),
  );
  await assertFails(get(ref(helper, "minecraftKnownPlayers")));
  await assertFails(get(ref(helper, "minecraftKnownPlayers/TestPlayer")));
  await assertFails(get(ref(helper, "minecraftKnownPlayers/NeverJoined")));
  await assertFails(set(ref(helper, "minecraftKnownPlayers/InjectedName"), true));
  await assertFails(get(ref(unauthenticated, "minecraftKnownPlayers")));
  await assertFails(set(ref(unauthenticated, "minecraftKnownPlayers/InjectedName"), true));
  await assertSucceeds(get(ref(owner, "minecraftKnownPlayers")));
  await assertSucceeds(set(ref(owner, "minecraftKnownPlayers/JustJoined"), true));
  await assertSucceeds(set(ref(firstOwner, "minecraftKnownPlayers/FirstLoginPlayer"), true));
  await assertFails(set(ref(expiredOwner, "minecraftKnownPlayers/ExpiredOwnerName"), true));
  await assertFails(get(ref(pausedOwner, "minecraftKnownPlayers")));
  await assertFails(set(ref(pausedOwner, "minecraftKnownPlayers/PausedOwnerName"), true));
  await assertSucceeds(
    set(ref(pending, "staffUsers/pending/activityConsent"), activityConsent),
  );
  await assertSucceeds(get(ref(pending, "staffDirectory")));
  await assertSucceeds(remove(ref(pending, "staffUsers/pending/activityConsent")));
  await assertFails(get(ref(pending, "staffDirectory")));
  await assertFails(remove(ref(pending, "staffUsers/owner/activityConsent")));
});

test("only an active owner can maintain staff accounts and the sanitized directory", async () => {
  const owner = db("owner-uid");
  await assertSucceeds(update(ref(owner, "staffUsers/helper"), { role: "admin" }));
  await assertSucceeds(update(ref(owner, "staffByUid/helper-uid"), { role: "admin" }));
  await assertSucceeds(
    set(ref(owner, "staffDirectory/helper"), { role: "admin", disabled: false, lateDays: 4 }),
  );
  await assertFails(
    set(ref(owner, "staffDirectory/leak"), {
      role: "helper",
      disabled: false,
      lateDays: 3,
      email: "private@example.test",
    }),
  );

  const admin = db("admin-uid");
  await assertFails(update(ref(admin, "staffUsers/helper"), { role: "admin" }));
  await assertFails(
    set(ref(admin, "staffDirectory/helper"), { role: "admin", disabled: false, lateDays: 4 }),
  );
});

test("buildmanager access is limited to queried Builder accounts and Builder management", async () => {
  const manager = db("buildmanager-uid");
  const builderQuery = query(ref(manager, "staffUsers"), orderByChild("role"), equalTo("builder"));
  const builderUsers = await assertSucceeds(get(builderQuery));
  assert.deepEqual(Object.keys(builderUsers.val()).sort(), ["builder", "buildertwo"]);
  assert.equal(builderUsers.child("builder/email").val(), "builder@example.test");
  const builderMappings = await assertSucceeds(get(
    query(ref(manager, "staffByUid"), orderByChild("role"), equalTo("builder")),
  ));
  assert.deepEqual(Object.keys(builderMappings.val()).sort(), ["builder-two-uid", "builder-uid"]);
  await assertFails(get(ref(manager, "staffLog")));
  await assertFails(get(ref(manager, "staffUsers")));
  await assertFails(get(ref(manager, "staffUsers/admin")));
  await assertFails(get(ref(manager, "staffUsers/owner")));
  await assertSucceeds(get(ref(manager, "staffUsers/builder")));
  await assertSucceeds(get(ref(manager, "staffByUid/builder-uid")));
  await assertFails(get(ref(manager, "staffByUid/admin-uid")));
  await assertFails(get(ref(manager, "staffByUid")));
  await assertFails(get(ref(manager, "staffGate/builder")));
  await assertSucceeds(remove(ref(manager, "staffGate/builder")));
  await assertFails(set(ref(manager, "staffGate/builder"), { open: true }));
  await assertFails(remove(ref(manager, "staffGate/admin")));

  const builderDirectoryQuery = query(
    ref(manager, "staffDirectory"),
    orderByChild("role"),
    equalTo("builder"),
  );
  const directory = await assertSucceeds(get(builderDirectoryQuery));
  assert.deepEqual(Object.keys(directory.val()).sort(), ["builder", "buildertwo"]);
  await assertFails(get(ref(manager, "staffDirectory")));
  await assertSucceeds(get(ref(manager, "staffDirectory/builder")));
  await assertFails(get(ref(manager, "staffDirectory/admin")));

  await assertSucceeds(update(ref(manager, "staffUsers/builder"), { email: "updated@example.test" }));
  await assertFails(update(ref(manager, "staffUsers/builder"), { role: "admin" }));
  await assertFails(update(ref(manager, "staffUsers/builder"), {
    activityConsent: { ...activityConsent, acceptedAt: 1_800_000_000_001 },
  }));
  await assertFails(update(ref(manager, "staffUsers/admin"), { disabled: true }));
  await assertSucceeds(update(ref(manager, "staffByUid/builder-uid"), { email: "updated@example.test" }));
  await assertFails(update(ref(manager, "staffByUid/builder-uid"), { role: "admin" }));
  await assertSucceeds(update(ref(manager, "staffDirectory/builder"), { disabled: true }));
  await assertFails(update(ref(manager, "staffDirectory/admin"), { disabled: true }));

  await assertSucceeds(set(ref(manager, "staffByUid/newbuilder-uid"), {
    username: "newbuilder",
    email: "newbuilder@example.test",
    role: "builder",
    disabled: false,
  }));
  await assertSucceeds(set(ref(manager, "staffUsers/newbuilder"), {
    uid: "newbuilder-uid",
    email: "newbuilder@example.test",
    role: "builder",
    disabled: false,
  }));
  await assertSucceeds(set(ref(manager, "staffDirectory/newbuilder"), {
    role: "builder",
    disabled: false,
    lateDays: 3,
  }));
  await assertFails(set(ref(manager, "staffUsers/escalated"), {
    uid: "escalated-uid",
    email: "escalated@example.test",
    role: "admin",
    disabled: false,
  }));
  await assertSucceeds(update(ref(manager, "staffDirectory/buildertwo"), { disabled: true }));
  await assertSucceeds(remove(ref(manager, "staffGate/buildertwo")));
  await assertSucceeds(update(ref(manager, "staffByUid/builder-two-uid"), { disabled: true, removed: true }));
  await assertSucceeds(remove(ref(manager, "staffUsers/buildertwo")));
  await environment.withSecurityRulesDisabled(async (context) => {
    await remove(ref(context.database(), "staffByUid/newbuilder-uid"));
    await remove(ref(context.database(), "staffUsers/newbuilder"));
    await remove(ref(context.database(), "staffDirectory/newbuilder"));
    await update(ref(context.database(), "staffUsers/builder"), { email: "builder@example.test" });
    await update(ref(context.database(), "staffByUid/builder-uid"), { email: "builder@example.test" });
    await update(ref(context.database(), "staffDirectory/builder"), { disabled: false });
    await set(ref(context.database(), "staffUsers/buildertwo"), {
      uid: "builder-two-uid",
      email: "builder-two@example.test",
      role: "builder",
      disabled: false,
      activityConsent,
    });
    await set(ref(context.database(), "staffByUid/builder-two-uid"), {
      username: "buildertwo",
      role: "builder",
      disabled: false,
      email: "builder-two@example.test",
    });
    await set(ref(context.database(), "staffDirectory/buildertwo"), {
      role: "builder",
      disabled: false,
      lateDays: 3,
    });
    await set(ref(context.database(), "staffGate/buildertwo"), { open: true });
    await update(ref(context.database(), "staffUsers/buildmanager"), { role: "builder" });
  });
  await assertFails(get(builderQuery));
  await environment.withSecurityRulesDisabled(async (context) => {
    await update(ref(context.database(), "staffUsers/buildmanager"), { role: "buildmanager" });
  });
});

test("owner bootstrap is limited to a pre-provisioned active owner identity", async () => {
  const originalOwner = {
    uid: "owner-uid",
    role: "owner",
    disabled: false,
    email: "owner@example.test",
    activityConsent,
  };
  await environment.withSecurityRulesDisabled(async (context) => {
    await set(ref(context.database(), "staffUsers/owner"), {
      ...originalOwner,
      uid: "bootstrap-owner-uid",
      mustChangePw: false,
    });
    await set(ref(context.database(), "staffByUid/bootstrap-owner-uid"), null);
  });

  const bootstrapOwner = environment
    .authenticatedContext("bootstrap-owner-uid", { email: "owner@example.test" })
    .database();
  await assertSucceeds(get(ref(bootstrapOwner, "staffUsers/owner")));
  await assertSucceeds(get(ref(bootstrapOwner, "staffByUid/bootstrap-owner-uid")));
  await assertSucceeds(
    set(ref(bootstrapOwner, "staffByUid/bootstrap-owner-uid"), {
      username: "owner",
      email: "owner@example.test",
      role: "owner",
      disabled: false,
    }),
  );
  await assertFails(
    set(ref(db("unprovisioned-uid"), "staffByUid/unprovisioned-uid"), {
      username: "owner",
      email: "owner@example.test",
      role: "owner",
      disabled: false,
    }),
  );

  await environment.withSecurityRulesDisabled(async (context) => {
    await set(ref(context.database(), "staffUsers/owner"), {
      ...originalOwner,
      uid: "paused-bootstrap-uid",
      disabled: true,
    });
    await set(ref(context.database(), "staffByUid/paused-bootstrap-uid"), null);
  });
  const pausedBootstrap = environment
    .authenticatedContext("paused-bootstrap-uid", { email: "owner@example.test" })
    .database();
  await assertFails(get(ref(pausedBootstrap, "staffUsers/owner")));
  await assertFails(
    set(ref(pausedBootstrap, "staffByUid/paused-bootstrap-uid"), {
      username: "owner",
      email: "owner@example.test",
      role: "owner",
      disabled: false,
    }),
  );

  await environment.withSecurityRulesDisabled(async (context) => {
    await set(ref(context.database(), "staffUsers/owner"), {
      ...originalOwner,
      mustChangePw: false,
    });
    await set(ref(context.database(), "staffByUid/bootstrap-owner-uid"), null);
  });
});

test("presence is writable only by the staff member whose username owns the record", async () => {
  const helper = db("helper-uid");
  await assertSucceeds(set(ref(helper, "presence/helper"), { lastSeen: 100, writingAt: 101 }));
  await assertFails(set(ref(helper, "presence/owner"), { lastSeen: 100 }));
  await assertFails(set(ref(helper, "presence/pausedowner"), { lastSeen: 100 }));

  const owner = db("owner-uid");
  await assertSucceeds(set(ref(owner, "presence/owner"), { lastSeen: 200 }));
  await assertFails(set(ref(owner, "presence/helper"), { lastSeen: 200 }));
  const manager = db("buildmanager-uid");
  await assertFails(get(ref(manager, "presence")));
  assert.equal((await assertSucceeds(get(ref(manager, "presence/builder")))).child("lastSeen").val(), 100);
  await assertFails(get(ref(manager, "presence/admin")));
});

test("staff can change only their own public profile fields", async () => {
  const helper = db("helper-uid");
  await assertSucceeds(
    update(ref(helper, "staffDirectory/helper"), {
      displayName: "Team Helfer",
      profileColor: "#3b82f6",
    }),
  );
  await assertFails(
    update(ref(helper, "staffDirectory/helper"), {
      role: "owner",
    }),
  );
  await assertFails(
    update(ref(helper, "staffDirectory/owner"), {
      displayName: "Fremdes Profil",
    }),
  );
  await assertFails(
    update(ref(helper, "staffDirectory/helper"), {
      profileColor: "javascript:alert(1)",
    }),
  );
  await assertFails(
    update(ref(db("paused-helper-uid"), "staffDirectory/pausedhelper"), {
      displayName: "Pausiert",
    }),
  );
});

test("staff chat authors must match the authenticated staff identity", async () => {
  const helper = db("helper-uid");
  await assertSucceeds(
    set(ref(helper, "chats/team/helper-message"), { by: "helper", text: "Hallo" }),
  );
  await assertFails(
    set(ref(helper, "chats/team/forged-message"), { by: "owner", text: "Gefälscht" }),
  );
  await assertFails(
    set(ref(helper, "chats/builder/helper-message"), { by: "helper", text: "Hallo" }),
  );

  const builder = db("builder-uid");
  await assertFails(get(ref(builder, "chats/team")));
  await assertFails(get(ref(builder, "staffUsers")));
  await assertFails(get(ref(builder, "staffDirectory")));
  await assertSucceeds(
    set(ref(builder, "chats/builder/builder-message"), { by: "builder", text: "Hallo" }),
  );
  await assertFails(
    set(ref(builder, "chats/team/builder-message"), { by: "builder", text: "Nicht erlaubt" }),
  );
  await assertFails(
    set(ref(builder, "chats/builder/forged-message"), { by: "owner", text: "Gefälscht" }),
  );

  const manager = db("buildmanager-uid");
  await assertFails(
    set(ref(manager, "chats/team/manager-message"), { by: "buildmanager", text: "Nicht erlaubt" }),
  );
  await assertSucceeds(
    set(ref(manager, "chats/builder/manager-message"), { by: "buildmanager", text: "Hallo" }),
  );
  await assertFails(
    set(ref(db("paused-helper-uid"), "chats/team/paused-message"), {
      by: "pausedhelper",
      text: "Gesperrt",
    }),
  );
});

test("staff logs require server-consistent actor fields and cannot be overwritten", async () => {
  const owner = db("owner-uid");
  await assertSucceeds(get(ref(owner, "staffLog")));
  for (const entry of [
    {
      by: "owner",
      action: "Role changed",
      detail: "helper -> admin",
      ts: 1000,
    },
    {
      by: "helper",
      action: "Role changed",
      detail: "spoofed actor",
      ts: 1000,
    },
    {
      by: "owner",
      action: "Role changed",
      detail: "forged extra field",
      ts: 1000,
      metadata: "not allowed",
    },
  ]) {
    await assertFails(set(ref(owner, `staffLog/${Math.random().toString(36).slice(2)}`), entry));
  }
  await assertFails(set(ref(db("helper-uid"), "staffLog/log-3"), {
    by: "helper",
    action: "Role changed",
    detail: "",
    ts: 1000,
  }));
  await assertFails(set(ref(db("paused-owner-uid"), "staffLog/log-4"), {
    by: "pausedowner",
    action: "Role changed",
    detail: "",
    ts: 1000,
  }));
});

test("direct Firebase community access remains denied", async () => {
  for (const database of [environment.unauthenticatedContext().database(), db("owner-uid")]) {
    await assertFails(get(ref(database, "community_reviews")));
    await assertFails(set(ref(database, "community_reviews/review-1"), { status: "approved" }));
  }
});
