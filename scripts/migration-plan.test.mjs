import assert from "node:assert/strict";
import { test } from "node:test";
import {
  authMigrationsEnabled,
  isAuthMigration,
  isMigrationFile,
  migrationName,
  pendingMigrations,
} from "./migration-plan.mjs";

test("_migrations keys on basename across Windows and POSIX paths", () => {
  assert.equal(migrationName("/migrations/0002_todos.sql"), "0002_todos.sql");
  assert.equal(migrationName("migrations/auth/0001_auth.sql"), "0001_auth.sql");
  assert.equal(migrationName("migrations\\auth\\0001_auth.sql"), "0001_auth.sql");
  assert.equal(migrationName("0001_auth.sql"), "0001_auth.sql");
});

test("auth migrations follow the same opt-in flag as auth", () => {
  assert.equal(authMigrationsEnabled({}), true);
  assert.equal(authMigrationsEnabled({ VITE_AUTH_ENABLED: "true" }), true);
  assert.equal(authMigrationsEnabled({ VITE_AUTH_ENABLED: "false" }), false);
});

test("nested auth SQL files are recognized as auth migrations", () => {
  assert.equal(isAuthMigration("/migrations/auth/0001_auth.sql"), true);
  assert.equal(isAuthMigration("migrations\\auth\\0001_auth.sql"), true);
  assert.equal(isAuthMigration("/migrations/0002_app.sql"), false);
  assert.equal(isMigrationFile("0001_auth.sql"), true);
  assert.equal(isMigrationFile("auth"), false);
});

test("pending migrations are returned in name order", () => {
  assert.deepEqual(
    pendingMigrations(
      ["/migrations/0003_c.sql", "/migrations/0001_a.sql", "/migrations/0002_b.sql"],
      ["0001_a.sql"],
    ),
    [
      { name: "0002_b.sql", path: "/migrations/0002_b.sql" },
      { name: "0003_c.sql", path: "/migrations/0003_c.sql" },
    ],
  );
});

test("nested auth migrations are planned and previously applied files are skipped", () => {
  assert.deepEqual(
    pendingMigrations(["/migrations/auth/0001_auth.sql"], []),
    [{ name: "0001_auth.sql", path: "/migrations/auth/0001_auth.sql" }],
  );
  assert.deepEqual(
    pendingMigrations(["/migrations/auth/0001_auth.sql"], ["0001_auth.sql"]),
    [],
  );
});

test("duplicate basenames are applied only once, preferring the top-level copy", () => {
  assert.deepEqual(
    pendingMigrations(
      ["/migrations/auth/0001_auth.sql", "/migrations/0001_auth.sql"],
      [],
    ),
    [{ name: "0001_auth.sql", path: "/migrations/0001_auth.sql" }],
  );
});
