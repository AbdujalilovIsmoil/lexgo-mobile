import * as SQLite from "expo-sqlite";
import { migrate } from "./migrate";
import { DB_NAME } from "./schema";

type Db = SQLite.SQLiteDatabase;
let opening: Promise<Db | null> | null = null;

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
