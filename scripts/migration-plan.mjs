// @ts-check
/**
 * Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
 * (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
 *
 * Applied files are keyed by basename, so a migration is applied once even if
 * it is discovered through more than one configured path.
 */

/**
 * The `_migrations` key for a migration path (or bare filename).
 * @param {string} path
 * @returns {string}
 */
export function migrationName(path) {
  return path.replace(/\\/g, "/").split("/").pop() ?? path;
}

/**
 * @param {string} path
 * @returns {boolean}
 */
export function isMigrationFile(path) {
  return path.endsWith(".sql");
}

/**
 * Auth schema is opt-in. The same flag controls the app's auth routes.
 * @param {Record<string, string | undefined>} [env]
 * @returns {boolean}
 */
export function authMigrationsEnabled(env = process.env) {
  return env.VITE_AUTH_ENABLED !== "false";
}

/**
 * @param {string} path
 * @returns {boolean}
 */
export function isAuthMigration(path) {
  return path.replace(/\\/g, "/").split("/").includes("auth");
}

/**
 * Migrations in `paths` that are not yet in `applied`, in apply order.
 * Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
 * @param {Iterable<string>} paths
 * @param {Iterable<string>} applied
 * @returns {Array<{ name: string, path: string }>}
 */
export function pendingMigrations(paths, applied) {
  const done = new Set(applied);
  const pending = [...paths]
    .filter(isMigrationFile)
    .map((path) => ({ name: migrationName(path), path }))
    .sort((a, b) => a.name.localeCompare(b.name) || a.path.localeCompare(b.path));
  const selected = new Map();
  for (const migration of pending) {
    if (!done.has(migration.name) && !selected.has(migration.name)) {
      selected.set(migration.name, migration);
    }
  }
  return [...selected.values()];
}
