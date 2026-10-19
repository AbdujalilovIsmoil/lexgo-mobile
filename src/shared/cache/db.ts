import * as SQLite from "expo-sqlite";
import { DB_NAME, DB_VERSION, SCHEMA_V1, SCHEMA_V2, SCHEMA_V3 } from "./schema";

type Db = SQLite.SQLiteDatabase;
let opening: Promise<Db | null> | null = null;

async function migrate(d: Db): Promise<void> {
  const row = await d.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const from = row?.user_version ?? 0;
  if (from < 1) await d.execAsync(SCHEMA_V1);
  if (from < 2) await d.execAsync(SCHEMA_V2);
  if (from < 3) await d.execAsync(SCHEMA_V3);
  if (from !== DB_VERSION) await d.execAsync(`PRAGMA user_version = ${DB_VERSION}`);
}

// The one shared connection. null = SQLite unavailable: every cache call then degrades to a no-op.
export function db(): Promise<Db | null> {
  opening ??= SQLite.openDatabaseAsync(DB_NAME)
    .then(async (d) => {
      await migrate(d);
      return d;
    })
    .catch(() => null);
  return opening;
}

// Best-effort wrapper: a cache failure must never break a screen.
export async function safely<T>(fallback: T, run: (d: Db) => Promise<T>): Promise<T> {
  try {
    const d = await db();
    return d ? await run(d) : fallback;
  } catch {
    return fallback;
  }
}

export const dbFile = (): string => {
  const dir: string = SQLite.defaultDatabaseDirectory;
  return `${dir.startsWith("file:") ? "" : "file://"}${dir}/${DB_NAME}`;
};
