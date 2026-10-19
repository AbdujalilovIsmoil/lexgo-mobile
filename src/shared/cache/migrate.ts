import { DB_VERSION, SCHEMA_V1, SCHEMA_V2, SCHEMA_V3 } from "./schema";

// The few calls the migration needs (expo-sqlite's SQLiteDatabase has them): kept as an interface so the upgrade
// path of existing installs is unit-tested without the native module.
export type MigratableDb = {
  execAsync: (sql: string) => Promise<void>;
  getFirstAsync: <T>(sql: string) => Promise<T | null>;
  getAllAsync: <T>(sql: string) => Promise<T[]>;
};

async function hasColumn(d: MigratableDb, table: string, column: string): Promise<boolean> {
  const cols = await d.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  return cols.some((c) => c.name === column);
}

/**
 * Brings the cache database to DB_VERSION. Every step is idempotent (CREATE … IF NOT EXISTS, a column is added only
 * when it is missing) and user_version is written last, so a run the OS killed half-way is simply finished at the
 * next start instead of failing on "duplicate column" and disabling the cache for good. A database written by a
 * newer build (user_version above ours) is left alone.
 */
export async function migrate(d: MigratableDb): Promise<number> {
  const row = await d.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const from = row?.user_version ?? 0;
  if (from >= DB_VERSION) return from;
  if (from < 1) await d.execAsync(SCHEMA_V1);
  if (from < 2) await d.execAsync(SCHEMA_V2);
  if (!(await hasColumn(d, "outbox", "next_at"))) await d.execAsync(SCHEMA_V3);
  await d.execAsync(`PRAGMA user_version = ${DB_VERSION}`);
  return DB_VERSION;
}
