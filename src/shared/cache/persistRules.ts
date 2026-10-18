import { DAY } from "./kv";

// Which react-query snapshots may be kept on the device (TZ 38). Everything not listed stays in
// memory only. Packages opt in at module scope: persistQueries(["secure-chat", "rooms"], { ttlMs }).
export type PersistRule = { prefix: readonly unknown[]; ttlMs: number; firstPageOnly: boolean };
const rules: PersistRule[] = [];

export function persistQueries(prefix: readonly unknown[], opts: { ttlMs?: number; firstPageOnly?: boolean } = {}): void {
  const i = rules.findIndex((r) => JSON.stringify(r.prefix) === JSON.stringify(prefix));
  const rule = { prefix, ttlMs: opts.ttlMs ?? 3 * DAY, firstPageOnly: opts.firstPageOnly ?? true };
  if (i >= 0) rules[i] = rule;
  else rules.push(rule);
}

export function ruleFor(key: readonly unknown[]): PersistRule | null {
  return rules.find((r) => r.prefix.every((p, i) => key[i] === p)) ?? null;
}

// Defaults: notification list + preferences, plan summary, entitlements, service catalogue
// (categories + lists), chat list with its last message.
persistQueries(["notifications"], { ttlMs: 3 * DAY });
persistQueries(["notification-prefs"], { ttlMs: 7 * DAY });
persistQueries(["plans"], { ttlMs: 7 * DAY });
persistQueries(["entitlements"], { ttlMs: DAY });
persistQueries(["service-categories"], { ttlMs: 7 * DAY });
persistQueries(["services"], { ttlMs: 7 * DAY });
persistQueries(["secure-chat", "rooms"], { ttlMs: 3 * DAY });
