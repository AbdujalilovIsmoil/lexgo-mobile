import { Platform } from "react-native";
import { Paths } from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { migrate } from "./migrate";
import { DB_NAME } from "./schema";

type Db = SQLite.SQLiteDatabase;
let opening: Promise<Db | null> | null = null;

// iOS: the cache lives in Library/Caches, which iCloud and computer backups leave out — it holds the account's work lists. The system may
// clear that folder only when the phone runs out of space; the cache is then simply rebuilt from the server. (Android keeps the default
// folder: app data is not backed up there.)
const DIR = Platform.OS === "ios" ? `${decodeURI(Paths.cache.uri.replace(/^file:\/\//, "")).replace(/\/$/, "")}/SQLite` : undefined;

// The one shared connection. null = SQLite unavailable: every cache call then degrades to a no-op.
export function db(): Promise<Db | null> {
  opening ??= SQLite.openDatabaseAsync(DB_NAME, undefined, DIR)
    .then(async (d) => {
      await migrate(d);
      if (DIR) void SQLite.deleteDatabaseAsync(DB_NAME).catch(() => undefined); // the copy in Documents (backed up) from earlier versions
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
  const dir: string = DIR ?? SQLite.defaultDatabaseDirectory;
  return `${dir.startsWith("file:") ? "" : "file://"}${dir}/${DB_NAME}`;
};
