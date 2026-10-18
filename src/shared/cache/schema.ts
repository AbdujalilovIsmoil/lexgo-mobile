// Local database layout (expo-sqlite). Bump VERSION and add a branch to migrate() for a change.
export const DB_NAME = "lexgo_cache.db";
export const DB_VERSION = 2;

// kv: scoped JSON documents with a TTL (query snapshots, drafts, file metadata).
// outbox: ordered offline writes (idempotent drafts / messages only, see outbox.ts).
export const SCHEMA_V1 = `
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS kv (
  scope TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL,
  expires_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
  PRIMARY KEY (scope, key)
);
CREATE INDEX IF NOT EXISTS kv_exp ON kv (expires_at);
`;

export const SCHEMA_V2 = `
CREATE TABLE IF NOT EXISTS outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT, scope TEXT NOT NULL, kind TEXT NOT NULL,
  dedupe TEXT NOT NULL DEFAULT '', payload TEXT NOT NULL,
  created_at INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS outbox_scope ON outbox (scope, id);
`;
